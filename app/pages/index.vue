<template>
<div>
    <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
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
              ingredients: fields[2]
            }
          })
      return { items }
    },
}
</script>