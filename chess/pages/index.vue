<template>
<div>
  <div class="controls">
    <input type="text" id="moveinput" v-on:keyup.enter="makemove" />
    <button v-on:click="makesanmove" class="make">Make SAN move</button>
    <button v-on:click="makeucimove" class="make">Make UCI move</button>
    <button v-on:click="reset" class="reset">Reset</button>
  </div>
  <chessboard :fen="currentFen" @onMove="moveplayed" class="board" />
</div>
</template>

<script>
import  {chessboard} from "vue-chessboard"
import 'vue-chessboard/dist/vue-chessboard.css'
import {Pos} from "../rollup/chess.js"

function makemove(self, kind){      
  const moveinpute = document.getElementById('moveinput')
  const move = moveinpute.value
  moveinpute.value = ""
  try{    
  const pos = self.pos
  console.log("making move", move, "for", pos.toString())
  kind === "SAN" ? pos.playSan(move) : pos.playUci(move)
  self.currentFen = pos.reportFen()
  console.log("done", pos.toString())
  self.pos = pos
  } catch(err){
    window.alert(`Invalid ${kind} move ${move} !`)
  }
}

function reset(self){
  const pos = self.pos
  pos.setVariant(pos.rules)
  self.pos = pos
  self.currentFen = pos.reportFen()
}

function moveplayed(self, info)
{
  console.log(info)
  const fen = info.fen
  const pos = self.pos
  pos.setFen(fen)
  self.currentFen = fen
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
      pos: pos
    }
  }, 
  methods:{
    makesanmove(){      
      makemove(this, "SAN")
    },
    makeucimove(){      
      makemove(this, "UCI")
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
.make{
  background-color: aquamarine;
}
.reset{
  background-color: #faa;
}
</style>