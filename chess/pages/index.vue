<template>
<div>
  <div class="controls">
    <input type="text" id="moveinput" v-on:keyup.enter="makemove" />
    <button v-on:click="makemove">Make move</button>
    <button v-on:click="reset">Reset</button>
  </div>
  <chessboard :fen="currentFen" />
</div>
</template>

<script>
import  {chessboard} from "vue-chessboard"
import 'vue-chessboard/dist/vue-chessboard.css'
import {Pos} from "../rollup/chess.js"

function makemove(self){      
  const moveinpute = document.getElementById('moveinput')
  const san = moveinpute.value
  moveinpute.value = ""
  try{    
  const pos = self.pos
  console.log("making move", san, "for", pos.toString())
  pos.playSan(san)
  self.currentFen = pos.reportFen()
  console.log("done", pos.toString())
  self.pos = pos
  } catch(err){
    window.alert(`Invalid move ${san} !`)
  }
}

function reset(self){
  const pos = self.pos
  pos.setVariant(pos.rules)
  self.pos = pos
  self.currentFen = pos.reportFen()
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
    makemove(){      
      makemove(this)
    },
    reset(){
      reset(this)
    }
  }
}
</script>

<style>
.controls {
  padding: 5px;
  background-color: #eee;
  margin-bottom: 10px;
}
</style>