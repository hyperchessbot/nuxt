<template>
<div style="width: 480px; height: 480px; border: solid 2px #777;">
  <chessboard orientation="black" />
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