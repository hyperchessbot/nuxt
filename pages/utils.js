export default {
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
