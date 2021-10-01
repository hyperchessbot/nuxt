<template>
<div>
  <div class="controls">
    <input type="text" id="moveinput" v-on:keyup.enter="makemove" />
    <button v-on:click="makesanmove" class="makesan">Make SAN move</button>
    <button v-on:click="makeucimove" class="makeuci">Make UCI move</button>
    <button v-on:click="reset" class="reset">Reset</button>
  </div>
  <div class="mainpanel">
    <chessboard :fen="currentFen" @onMove="moveplayed" class="board" />
    <div class="bookdiv">
      <table cellpadding = "5" cellspacing="5">
      <tr v-for="item in bookmoves" :key="item.san">
        <td class="bookmovesan" v-on:click="makesanmove($event, item.san)">{{ item.san }}</td><td>{{ item.white }}</td><td>{{ item.draws }}</td><td>{{ item.black }}</td>
      </tr>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import  {chessboard} from "vue-chessboard"
import 'vue-chessboard/dist/vue-chessboard.css'
import {Pos} from "../rollup/chess.js"

function posChanged(self){
  requestLichessBook(self.pos.reportFen()).then(
    result =>{
      console.log("book", result)
      self.bookmoves = result.moves
    }
  )
}

function makemove(self, kind, str){      
  const moveinpute = document.getElementById('moveinput')
  const move = str || moveinpute.value
  moveinpute.value = ""
  try{    
  const pos = self.pos
  console.log("making move", move, "for", pos.toString())
  kind === "SAN" ? pos.playSan(move) : pos.playUci(move)
  self.currentFen = pos.reportFen()
  console.log("done", pos.toString())
  self.pos = pos
  posChanged(self)
  } catch(err){
    window.alert(`Invalid ${kind} move ${move} !`)
  }
}

function reset(self){
  const pos = self.pos
  pos.setVariant(pos.rules)
  self.pos = pos
  self.currentFen = pos.reportFen()
  posChanged(self)
}

function moveplayed(self, info)
{
  console.log(info)
  const fen = info.fen
  const pos = self.pos
  pos.setFen(fen)
  self.currentFen = fen
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
      pos: pos,
      bookmoves: []
    }
  }, 
  ready(){
    posChanged(this)
  },
  methods:{
    makesanmove(ev, san){      
      makemove(this, "SAN", san)
    },
    makeucimove(ev, uci){      
      makemove(this, "UCI", uci)
    },
    reset(){
      reset(this)
    },
    moveplayed(info){
      moveplayed(this, info)
    }
  }
}
</script>

<style>
.board {
  margin-left: 10px;
}
.controls {
  padding: 5px;
  background-color: #eee;
  margin-bottom: 10px;
  display: inline-block;
}
.makesan{
  background-color: aquamarine;
}
.makeuci{
  background-color: lightblue;
}
.reset{
  background-color: #faa;
}
.mainpanel{
  display: flex;
  align-items: center;
}
.bookdiv{
  margin-left: 10px;
  background-color: #eee;
  padding: 5px;
}
.bookmovesan{
  text-decoration: underline;
  color: #007;
  font-size: 20px;
  cursor: pointer;
}
</style>