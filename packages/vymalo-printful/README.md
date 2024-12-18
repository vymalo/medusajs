# MedusaJS Printful

Connect your MedusaJS store to Printful

## Installation

```bash
npm install @vymalo/medusa-printful
```

or if using yarn

```bash
yarn add @vymalo/medusa-printful
```

## Usage
To use this plugin, you should add it into the `modules` section of your MedusaJS configuration.

```typescript
modules: [
  ...
  {
    resolve: '@medusajs/medusa/fulfillment',
    options: {
      providers: [
        ...
        {
          resolve: '@vymalo/medusa-printful/printful-fulfillment',
          id: 'printful',
          options: {},
        },
      ],
    },
    dependencies: [PrintfulModules.printful],
  },
  {
    resolve: '@vymalo/medusa-printful/printful',
    options: {
      enableWebhooks: true,
      printfulAccessToken: process.env.PRINTFUL_ACCESS_TOKEN,
      storeId: process.env.PRINTFUL_STORE_ID,
      logo_url: process.env.PRINTFUL_LOGO_URL,
      backendUrl: process.env.PRINTFUL_BACKEND_URL,
      confirmOrder: false,
    },
    dependencies: [
      Modules.PRODUCT,
      Modules.FULFILLMENT,
      Modules.PRICING,
    ],
  },
...
```

## Hack
Because it's not yet clear how to handle plugins in MedusaJS, we have to hack a bit to get this working.
First:

```bash
mkdir -p plugins/printful-hack
ln -s node_modules/@vymalo/medusa-printful/dist plugins/printful-hack/src
# Write a fake package.json file in the plugins/printful-hack directory
echo "{\"name\":\"printful-hack\",\"version\":\"1.0.0\"}" > plugins/printful-hack/package.json
```

In your `medusa-config.js` file, add the following code:
```typescript
plugins: [
  ...
  {
    resolve: `./plugins/printful-hack`, // TODO: Change this to the correct path
    options: {},
  },
```