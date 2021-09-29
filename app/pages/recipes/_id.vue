<template>
<div>
    <div class="home">
    <a href="/">Home</a>
    </div>
    <div class="recipecont">
        <div class="ingredients">
            Hozzávalók<hr>{{ blob.item.ingredients }}
        </div>
        <div class="recipe">            
            {{ blob.content }}        
        </div>
    </div>    
</div>
</template>

<script>
export default {
    async asyncData({params}) {

        let response = await fetch(`https://raw.githubusercontent.com/hyperchessbot/nuxt/main/app/recipes/index`)
        const index = await response.text()      
        const items = index.split("------").map(item => {
            const fields = item.split("---").map(item => item.trim())
            return {
              id: fields[0],
              name: fields[1],
              ingredients: fields[2],
              thumbnail: fields[3]
            }
          })
        console.log(items)
        const item = items.find(item => item.id == params.id)
        
        response = await fetch(`https://raw.githubusercontent.com/hyperchessbot/nuxt/main/app/recipes/${params.id}`)
        const content = await response.text()

        const blob = {
                content: content,
                item: item
            }     

        console.log(blob)
        
        return {
            blob       
        }
    }
}
</script>


<style scoped>
.home {
    width: 100%x;
    text-align: center;
    margin-bottom: 20px;
    font-size: 20px;
}
.recipecont {
    background-color: #add;
    color: #007;    
    padding: 10px;
    border: solid 2px #ddd;
    border-radius: 15px;
}
.ingredients {
    border: solid 2px #ddd;
    border-radius: 15px;
    padding: 15px;
    font-style: italic;
    font-size: 25px;
    margin: 20px;
    background-color: #fff;
    color: #000;
    font-weight: bold;
    text-align: center;
}
.recipe {
    background-color: #dff;
    border: solid 2px #ddd;
    border-radius: 15px;
    font-size: 30px;
    padding: 20px;
    font-family: Verdana;
}
</style>