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
export default {
  head() {
    return {
      title: "Nuxt Recipes",
    };
  },
  async asyncData() {
    const response = await fetch(
      `https://raw.githubusercontent.com/hyperchessbot/nuxt/main/recipes/index`
    );
    const content = await response.text();
    const items = content.split("------").map((item) => {
      const fields = item.split("---").map((item) => item.trim());
      return {
        id: fields[0],
        name: fields[1],
        ingredients: fields[2],
        thumbnail: fields[3],
      };
    });
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
}
body {
  background-color: #ddd;
  border: solid 4px #eee;
  border-radius: 15px;
  cursor: pointer;
  padding: 20px;
  margin-top: 20px;
}
</style>