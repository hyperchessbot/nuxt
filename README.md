# Nuxt.js by example - Nuxt Recipe Book hosted on Netlify

This project was inspired by the great video https://www.youtube.com/watch?v=nteDXuqBfn0 .

## What is Nuxt.js ?

Nuxt.js is a framework that lets you create a Vue.js application.

Wait a minute, isn't Vue.js already a framework for creating single page applications and enriching pages of static multi page sites? Why do we need yet an other framework?

Well, Nuxt.js creates a Vue.js application for you, that is out of the box configured and offers useful features, that vanilla Vue.js does not, hard coding of which manually would be very cumbersome for an average coder.

## Why Nuxt.js?

For a bunch of useful features, including, but not limited to ...

## SEO

The Nuxt goodies include SEO ( Search Engine Optimization ) support, which means that for the first load, the page can be built on the server, so that search engines can index, then subsequent renders are done within the browser, and all this is not noticed by the coder, since they have to write the code only once and the rest is taken care of by Nuxt. This is called universal rendering, and it is of course optional, you can always fall back to a completely static version of your site.

## Simplified routing

Routing is simplified on two fronts. First you can organize your pages into a directory structure, starting from the `pages` folder, and directory names then serve as path segments. A directory name prefix with an underscore signals a path argument that will be passed to the page as a variable. Second you have a `NuxtLink` tag, that knows how to correctly render the link in whatever rendering mode.

## Async data

From Vue you already know a component's data element. However this is static. If you want to fetch your data from an async API, then you can use `asyncData`, and the page will be only rendered when your data is ready. So no half baked pages will be rendered from the server, that has to be filled in later. Again important for SEO support and for referential transparency.

## The Recipe Book app

The recipes content is in my native language. My English is not expressive enough for this. Also I'm not a chef of any kind. Described are the most ordinary way of making these foods, that any commoner can do, and also they are very common foods in my country. So nothing special about the content.

#### Online on Netlify

https://nuxtrecipebook.Netlify.app/

#### Source

https://github.com/hyperchessbot/nuxt

#### Edit in Code Sandbox

https://codesandbox.io/s/brave-leakey-wtmgx

Or just view it:

https://wtmgx.sse.codesandbox.io/

## Stunts

Some problems a noob has to orvercome.

### Create the app

Create and cd into the folder of your app, then in the terminal type

```bash
npx create-nuxt-app
```

It is safe to accept the defaults. For rendering use Universal.

### Deploying to Netlify

Here you need to create the static version of your site, since Netlify is static only provider.

This `netlify.toml` does the trick:

```toml
[build]
  publish = "dist"
  command = "yarn generate"
[build.environment]
  NODE_VERSION = "14"
```

You can try it "at home" with simply `yarn generate`, then serve it with `http-server` from `dist` as a static site.

### Development server

```bash
yarn dev
```

### Production server

```bash
yarn build
yarn start
```

### Fetch async from Git

We fecth our async page data from the repo itself, using raw git content links and using built in `fetch` ( no axios for this project ). Observe that `params` will let you know about the variable path, and `id` comes from the page name `_id.vue` ( as we already seen, the underscore signals that this segment has to be substituted witth the segment of the actual path ).

```javascript
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
```

**Warning** : async can only be used in pages that live in the `pages` folder. the components folder should only have pure components without async data.

### Render page title of a parameterized path in async way

In Nuxt the paradigmatic way to render a titile is through `head` function in the exports.

```javascript
head() {
    return {
      title: "Nuxt Recipes - " + this.blob.item.name,
    };
  },
```

This returns a dictionary of the head section. If the async data is returned as `blob`, then you can refernce it as `this.blob` . Everything else will be taken care for you, so the title will be rendered when your async data has arrived.