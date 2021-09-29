<template>
<div class="itemsdiv">
    <div class="itemdiv" v-for="item in items" :key="item.id">
    {{ item.name }}
    <img :src="`https://github.com/hyperchessbot/nuxt/blob/main/app/recipes/${item.thumbnail}?raw=true`" class="foodthumbnail">
  </div>
</div>
</template>

<script>
export default {  
  async asyncData() {
      console.log("fetching")
      const response = await fetch(`https://raw.githubusercontent.com/hyperchessbot/nuxt/main/app/recipes/index`)
      const content = await response.text()
      console.log("fetched", content)
      const items = content.split("------").map(item => {
            const fields = item.split("---")
            return {
              id: fields[0],
              name: fields[1],
              ingredients: fields[2],
              thumbnail: fields[3]
            }
          })
      return { items }
    },
}
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
  width: var(--thumbnail-size);
  height: var(--thumbnail-size);
  background-color: #eee;
  padding: 10px;
  margin: 10px;
}
.foodthumbnail {
  width: var(--thumbnail-size);
  height: var(--thumbnail-size);
}
</style>