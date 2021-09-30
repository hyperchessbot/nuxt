<template>
<div style="width: 500px; height: 500px; border: solid 2px #777;">
  <chessboard orientation="black" style="box-shadow: 10px 10px #777;" />
</div>
</template>

<script>
import  {chessboard} from "vue-chessboard"
import 'vue-chessboard/dist/vue-chessboard.css'

export default {
  components: {
    chessboard: chessboard
  }
}
</script>

<style>
</style>