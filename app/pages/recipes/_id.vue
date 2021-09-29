<template>
<div>
    <a href="/">Home</a>
    <hr>
    {{ content }}
</div>
</template>

<script>
export default {
    async asyncData({params}) {
        console.log("fetching recipe", params)
        const response = await fetch(`https://raw.githubusercontent.com/hyperchessbot/nuxt/main/app/recipes/${params.id}`)
        const content = await response.text()
        console.log("fetched", content)
        return {
            content
        }
    }
}
</script>
