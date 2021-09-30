<template>
  <div>
    <div class="recipecont">
      <div class="home">
        <NuxtLink to="/">Back to Recipes</NuxtLink>
      </div>
      <div class="ingredients">
        <span class="title">Hozzávalók</span>
        <hr />
        {{ blob.item.ingredients }}
      </div>
      <div class="recipe">
        <div class="recipetext">
          {{ blob.content }}
        </div>
        <hr />
        <div class="previewmsg">Jó étvágyat !</div>
        <div class="preview">
          <img
            width="80%"
            :src="`https://github.com/hyperchessbot/nuxt/blob/main/recipes/${blob.item.image}?raw=true`"
          />
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "~/mixins/utils.js";

export default {
  head() {
    return {
      title: "Nuxt Recipes - " + this.blob.item.name,
    };
  },
  async asyncData({ params }) {
    let response = await fetch(`${utils.config.RECIPES_GIT_BASE}/index`);
    const index = await response.text();

    const items = utils.methods.index2blob(index);
    const item = items.find((item) => item.id === params.id);

    response = await fetch(`${utils.config.RECIPES_GIT_BASE}/${params.id}`);
    const content = await response.text();

    const blob = {
      content: content,
      item: item,
    };

    return {
      blob,
    };
  },
};
</script>


<style scoped>
.home {
  width: 100%x;
  text-align: center;
  margin-bottom: 5px;
  font-size: 20px;
  padding: 5px;
  padding-left: 30px;
  padding-right: 30px;
  background: #eee;
  font-style: italic;
  border: solid 2px #ddd;
  border-radius: 10px;
  box-shadow: 3px 3px #aaa;
}
.home a {
  text-decoration: none;
  color: #007;
}
.recipecont {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #dec;
  color: #007;
  padding: 10px;
  border: solid 2px #ddd;
  border-radius: 15px;
  margin-left: 15px;
  margin-right: 15px;
  opacity: 0.9;
}
.ingredients {
  border: solid 2px #ddd;
  border-radius: 15px;
  padding: 20px;
  padding-left: 30px;
  padding-right: 30px;
  font-style: italic;
  font-size: 25px;
  margin: 20px;
  background-color: #fff;
  color: #000;
  font-weight: bold;
  text-align: center;
  width: 70%;
  box-shadow: 8px 8px #777;
}
.ingredients .title {
  color: #a00;
}
.recipe {
  background-color: #dff;
  border: solid 2px #ddd;
  border-radius: 15px;
  font-size: 30px;
  padding: 20px;
  font-family: Verdana;
  width: 80%;
  box-shadow: 8px 8px #8bb;
  text-align: center;
}
.recipetext {
  text-align: left;
}
.preview {
  margin-top: 20px;
  width: 100%;
  text-align: center;
}
.previewmsg {
  font-style: italic;
  font-size: 25px;
  color: #090;
}
</style>
