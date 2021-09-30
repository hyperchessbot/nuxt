import toml from "toml";

export default {
  config: {
    RECIPES_GIT_BASE:
      "https://raw.githubusercontent.com/hyperchessbot/nuxt/main/recipes",
    RECIPES_BLOB_BASE: "https://github.com/hyperchessbot/nuxt/blob/main/recipes"
  },
  methods: {
    index2blob(content) {
      const items = toml.parse(content);

      return items;
    }
  }
};
