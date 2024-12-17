# MedusaJS meilisearch

Index your MedusaJS data in Meilisearch

## Installation

```bash
npm install @vymalo/medusa-meilisearch
```

or if using yarn

```bash
yarn add @vymalo/medusa-meilisearch
```

## Usage
To use this plugin, you should add it into the `modules` section of your MedusaJS configuration.

```typescript
  modules: [
    ...
    {
      resolve: '@vymalo/medusa-meilisearch',
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          [SearchUtils.indexTypes.PRODUCTS]: {
            indexSettings: {
                searchableAttributes: ['title', 'description', 'variant_sku'],
                displayedAttributes: ['title', 'description', 'variant_sku', 'thumbnail', 'handle'],
            },
            primaryKey: 'id',
          },
        },
      },
    },
    ...
```

## Hack
Because it's not yet clear how to handle plugins in MedusaJS, we have to hack a bit to get this working.
First:

```bash
mkdir -p plugins/printful-hack
ln -s node_modules/@vymalo/medusa-meilisearch/dist plugins/printful-hack/src
# Write a fake package.json file in the plugins/printful-hack directory
echo "{\"name\":\"meilisearch-hack\",\"version\":\"1.0.0\"}" > plugins/printful-hack/package.json
```

In your `medusa-config.js` file, add the following code:
```typescript
plugins: [
  ...
  {
    resolve: `./plugins/meilisearch-hack`, // TODO: Change this to the correct path
    options: {}, 
  },
```