<template>
<div>
  <div class="controls">
    <input type="text" id="moveinput" v-on:keyup.enter="makemove" />
    <button v-on:click="makesanmove" class="makesan">Make SAN move</button>
    <button v-on:click="makeucimove" class="makeuci">Make UCI move</button>
    <button v-on:click="reset" class="reset">Reset</button>
  </div>
  <div class="mainpanel">
    <div class="chessdiv">
      <chessboard :orientation="orientation" :fen="currentFen" @onMove="moveplayed" class="board" />
    </div>
    <div class="bookdiv">
      <table cellpadding = "3" cellspacing="3">
      <tr v-for="item in bookmoves" :key="item.san">
        <td class="bookmovesan" v-on:click="makesanmove($event, item.san)">{{ item.san }}</td><td class="white">{{ item.white }}</td><td class="draw">{{ item.draws }}</td><td class="black">{{ item.black }}</td>
      </tr>
      </table>
    </div>
  </div>
  <div class="controls">        
    <button v-on:click="step($event, -100)" class="stepbutton">|&lt;</button>
    <button v-on:click="step($event, -1)" class="stepbutton">&lt;</button>
    <button v-on:click="step($event, 1)" class="stepbutton">&gt;</button>
    <button v-on:click="step($event, 100)" class="stepbutton">&gt;|</button>
    <button v-on:click="flip" class="makesan">Flip</button>
  </div>
</div>
</template>

<script>
import  {chessboard} from "vue-chessboard"
import 'vue-chessboard/dist/vue-chessboard.css'
import {Pos} from "../rollup/chess.js"

function posChanged(self){
  console.log("pos changed, history", self.history, "ptr", self.historyptr)
  self.ingoremoveplayed = true
  requestLichessBook(self.pos.reportFen()).then(
    result =>{
      console.log("book", result)
      self.bookmoves = result.moves
    }
  )
}

function makemove(self, kind, str){      
  console.log("makemove", kind, str)
  const moveinpute = document.getElementById('moveinput')
  const move = str || moveinpute.value
  moveinpute.value = ""
  try{    
    const pos = self.pos
    console.log("making move", move, "for", pos.toString())  
    const m = kind === "SAN" ? pos.sanToMove(move) : pos.uciToMove(move)
    const moveInfo = {san: pos.moveToSan(m), uci: pos.moveToUci(m)}
    pos.play(m)
    const fen = pos.reportFen()    
    console.log("done", pos.toString())
    self.pos = pos
    self.history = self.history.slice(0, self.historyptr + 1)
    if(self.history[self.historyptr] != fen){
      self.history.push(fen)
      self.historyptr++
    }
    self.currentFen = fen
    posChanged(self)
  } catch(err){
    window.alert(`Invalid ${kind} move ${move} !`)
  }
}

function reset(self){
  const pos = self.pos
  pos.setVariant(pos.rules)
  self.pos = pos
  const fen = pos.reportFen()
  self.currentFen = fen
  self.history = [fen]
  self.historyptr = 0
  posChanged(self)
}

function moveplayed(self, info)
{
  console.log("moveplayed", info)  
  if(self.ingoremoveplayed){
    console.log("ignoring moveplayed")
    self.ingoremoveplayed = false
    return
  }
  const fen = info.fen
  self.history = self.history.slice(0, self.historyptr + 1)
  if(self.history[self.historyptr] != fen){
    self.history.push(fen)
    self.historyptr++
  }  
  self.currentFen = fen
  self.pos.setFen(fen)
  posChanged(self)
}

function simpleFetch(url, params, callback){
    params.headers = params.headers || {}
    if(params.asForm) params.headers["Content-Type"] = "application/x-www-form-urlencoded"
    if(params.asJson) params.headers.Accept = "application/json"    
    if(params.asVndLichessV3Json){
        params.headers.Accept = "application/vnd.lichess.v3+json"
        params.asJson = true
    }
    if(params.asNdjson) params.headers.Accept = "application/x-ndjson"
    if(params.accessToken) params.headers.Authorization = "Bearer " + params.accessToken    
    if(params.server) api("request:fetch", {
        url: url,
        params: params
    }, result => callback(result))
    else fetch(url, params).then(
        response => response.text().then(
            text => {                                 
                if(params.asJson || params.asNdjson){
                    try{
                        let obj
                        if(params.asNdjson){                            
                            obj = text.split("\n").filter(line => line.length).map(line => JSON.parse(line))
                        }else{
                            obj = JSON.parse(text)
                        }                                                
                        try{
                            callback({ok: true, content: obj})
                        }catch(err){
                            console.log(err, obj)
                        }
                    }catch(err){
                        console.log("fetch parse json error", err)
                        callback({ok: false, status: "Error: Could not parse json."})
                    }
                }else{
                    callback({ok: true, content: text})
                }                
            },
            err => {
                console.log("fetch get response text error", err)                
                callback({ok: false, status: "Error: Failed to get response text."})
            }
        ),
        err => {
            console.log("fetch error", err)
            callback({ok: false, status: "Error: Failed to fetch."})
        }
    )
}

const LICHESS_BOOK_URL              = "https://explorer.lichess.ovh/lichess"

const LICHESS_BOOK_MAX_MOVES        = 12
const LICHESS_BOOK_AVG_RATINGS      = [ 1600, 1800, 2000, 2200, 2500 ]
const LICHESS_BOOK_TIME_CONTROLS    = [ "bullet", "blitz", "rapid", "classical" ]

const DEFAULT_VARIANT               = "standard"

function requestLichessBook(fenOpt, variantOpt, maxMovesOpt, ratingListOpt, speedListOpt){
    let fen = fenOpt || STANDARD_START_FEN
    let variant = variantOpt || DEFAULT_VARIANT
    let maxMoves = maxMovesOpt || LICHESS_BOOK_MAX_MOVES
    let ratingList = ratingListOpt || LICHESS_BOOK_AVG_RATINGS
    let speedList = speedListOpt || LICHESS_BOOK_TIME_CONTROLS

    let ratings = ratingList.map(opt => `ratings%5B%5D=${opt}`).join("&")

    let speeds = speedList.map(opt => `speeds%5B%5D=${opt}`).join("&")

    let url = LICHESS_BOOK_URL +`?fen=${fen}&moves=${maxMoves}&variant=${variant}`

    if(ratings) url += "&" + ratings

    if(speeds) url += "&" + speeds

    return new Promise(resolve => {
        simpleFetch(url, {
            asJson: true
        }, result => {
            if(result.ok){                
                result.content.fen = fen
                resolve(result.content)
            }
        })
    })    
}

export default {
  components: {
    chessboard: chessboard
  },
  data(){
    const pos = Pos()
    console.log("data created pos", pos.toString())
    return {
      currentFen: "",
      orientation: "white",
      pos: pos,
      bookmoves: [],
      history: [],
      historyptr: -1,
      ingoremoveplayed: false
    }
  }, 
  ready(){
    posChanged(this)
  },
  methods:{
    step(ev, dir){
      console.log("step dir", dir, "hist len", this.history.length, "old ptr", this.historyptr)
      this.historyptr += dir
      if(this.historyptr < 0) this.historyptr = 0
      if(this.historyptr >= this.history.length) this.historyptr = this.history.length - 1
      console.log("new ptr", this.historyptr)
      const fen = this.history[this.historyptr]
      this.pos.setFen(fen)
      this.currentFen = fen
      posChanged(this)
    },
    makesanmove(ev, san){      
      console.log("makesanmove", san)
      makemove(this, "SAN", san)
    },
    makeucimove(ev, uci){      
      console.log("makeucimove", uci)
      makemove(this, "UCI", uci)
    },
    reset(){
      reset(this)
    },
    moveplayed(info){
      moveplayed(this, info)
    },
    flip(){
      this.orientation = this.orientation === "white" ? "black" : "white"
      this.ingoremoveplayed = true
    }
  }
}
</script>

<style>
.board {
  margin-left: 20px;
  margin-top: 15px;
}
.controls {
  padding: 5px;
  background-color: #eee;  
  display: inline-block;
  margin-left: 40px;
}
.makesan{
  background-color: aquamarine;
  margin-left: 10px;
}
.makeuci{
  background-color: lightblue;
  margin-left: 10px;
}
.reset{
  background-color: #faa;
  margin-left: 10px;
}
.mainpanel{
  display: flex;
  align-items: center;
}
.bookdiv{
  margin-left: 20px;
  background-color: #eee;
  padding: 5px;
  height: 320px;
  width: 320px;
  overflow-y: scroll;
}
.bookmovesan{
  text-decoration: underline;
  color: #007;
  font-size: 20px;
  cursor: pointer;
  width: 60px;
}
.white{
  color: #070;
  font-family: monospace;
  font-weight: bold;
  width: 70px;
}
.draw{
  color: #770;
  font-family: monospace;
  font-weight: bold;
  width: 70px;
}
.black{
  color: #700;
  font-family: monospace;
  font-weight: bold;
  width: 70px;
}
#moveinput {
  padding: 3px;
  padding-left: 6px;
  font-size: 20px;
  font-weight: bold;
  color: #070;
  width: 200px;
}
.chessdiv {  
  position: relative;
}
.stepbutton {
  width: 40px;
}
</style>