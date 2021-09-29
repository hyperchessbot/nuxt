<template>
  <div class="bg">
    <div class="itemsdiv">
      <div class="itemdiv" v-for="item in items" :key="item.id">
        <div class="foodname">
          <NuxtLink :to="`/recipes/${item.id}`">{{ item.name }}</NuxtLink>
        </div>
        <img
          :src="`https://github.com/hyperchessbot/nuxt/blob/main/recipes/${item.thumbnail}?raw=true`"
          class="foodthumbnail"
        />
        <div class="ingredients">{{ item.ingredients }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "~/pages/utils.js";

export default {
  head() {
    return {
      title: "Nuxt Recipes",
    };
  },
  async asyncData() {
    const response = await fetch(`${utils.config.RECIPES_GIT_BASE}/index`);
    const content = await response.text();
    const items = utils.methods.index2blob(content);
    return { items };
  },
};
</script>

<style>
:root {
  --thumbnail-size: 300px;
}
.itemsdiv {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}
.itemdiv {
  opacity: 0.9;
  background-color: #f7f7f7;
  padding: 12px;
  margin: 10px;
  border: solid 2px #ddd;
  border-radius: 15px;
  height: 400px;
}
.foodthumbnail {
  width: var(--thumbnail-size);
  height: var(--thumbnail-size);
}
.foodname {
  width: 100%;
  font-size: 30px;
  margin: 5px;
  margin-bottom: 10px;
  text-align: center;
  color: #007;
  font-weight: bold;
}
.ingredients {
  margin-top: 10px;
  font-style: italic;
  width: var(--thumbnail-size);
  text-align: center;
}
.bg {
  padding: 5px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(https://github.com/hyperchessbot/nuxt/blob/main/static/teflon.png?raw=true);
  background-size: cover;
  border: solid 2px #ddd;
  border-radius: 15px;
}
body {
  background-color: #ddd;
  border: solid 4px #eee;
  border-radius: 15px;
  cursor: pointer;
  padding: 20px;
  margin-top: 50px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(https://github.com/hyperchessbot/nuxt/blob/main/static/kitchen.png?raw=true);
  background-size: cover;
}
</style>