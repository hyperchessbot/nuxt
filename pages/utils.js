export default {
  config: {
    RECIPES_GIT_BASE:
      "https://raw.githubusercontent.com/hyperchessbot/nuxt/main/recipes",
    RECIPES_BLOB_BASE: "https://github.com/hyperchessbot/nuxt/blob/main/recipes"
  },
  methods: {
    index2blob(content) {
      const items = content.split("------").map((item) => {
        const fields = item.split("---").map((item) => item.trim());
        return {
          id: fields[0],
          name: fields[1],
          ingredients: fields[2],
          thumbnail: fields[3]
        };
      });

      return items;
    }
  }
};
