<script setup>
import { onMounted, ref} from 'vue';
import Game from "./game/Game.js";
import EmitBus from './untils/emitBus';
import load from './load.vue';

const loadingProgress = ref(0);
const dayTime = ref(true);
onMounted(() =>{
  const game = new Game(document.getElementById('world'));

  EmitBus.on("LoadingProgress", (load) =>{
    loadingProgress.value = load
  })
})

const dayTimeChange = () =>{
  dayTime.value = !dayTime.value;
  EmitBus.emit("dayTimeC", dayTime.value)
}
</script>

<template>
  <div id="test"></div>
  <canvas id="world"></canvas>
  <load :loadingProgress="loadingProgress"></load>
  <div class="day">
    <img @click="dayTimeChange" v-if="dayTime" src="@/assets/dayTime.svg" alt=""></img>
    <img @click="dayTimeChange" v-else src="@/assets/dayNight.svg" alt=""></img>
    <a href="https://github.com/l-feng-xian/l-feng-xian.github.io"><img src="@/assets/github.svg" alt=""></img></a>
  </div>
</template>

<style scoped>
</style>
