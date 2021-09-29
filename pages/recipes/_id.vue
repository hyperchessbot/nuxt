<template>
  <div>
    <div class="recipecont">
      <div class="home">
        <NuxtLink to="/">Home</NuxtLink>
      </div>
      <div class="ingredients">
        <span class="title">Hozzávalók</span>
        <hr />
        {{ blob.item.ingredients }}
      </div>
      <div class="recipe">
        {{ blob.content }}
        <hr />
        <span class="previewmsg">Jó étvágyat !</span>
        <div class="preview">
          <img
            width="80%"
            :src="`https://github.com/hyperchessbot/nuxt/blob/main/recipes/${blob.item.thumbnail}?raw=true`"
          />
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: "Nuxt Recipes - " + this.blob.item.name,
    };
  },
  async asyncData({ params }) {
    let response = await fetch(
      `https://raw.githubusercontent.com/hyperchessbot/nuxt/main/recipes/index`
    );
    const index = await response.text();
    const items = index.split("------").map((item) => {
      const fields = item.split("---").map((item) => item.trim());
      return {
        id: fields[0],
        name: fields[1],
        ingredients: fields[2],
        thumbnail: fields[3],
      };
    });
    const item = items.find((item) => item.id === params.id);

    response = await fetch(
      `https://raw.githubusercontent.com/hyperchessbot/nuxt/main/recipes/${params.id}`
    );
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
}
.recipecont {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #cdd;
  color: #007;
  padding: 10px;
  border: solid 2px #ddd;
  border-radius: 15px;
  margin-left: 15px;
  margin-right: 15px;
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