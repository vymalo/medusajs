# MedusaJS Keycloak

Login your medusa clients with Keycloak

## Installation

```bash
npm install @vymalo/medusa-keycloak
```

or if using yarn

```bash
yarn add @vymalo/medusa-keycloak
```

## Usage
To use this plugin, you should add it into the `modules` section of your MedusaJS configuration.

```typescript
  modules: [
  ...
  {
    resolve: '@medusajs/medusa/auth',
    options: {
      providers: [
        {
          resolve: `@vymalo/medusa-keycloak`,
          id: 'ssegning',
          options: {
            url: process.env.KEYCLOAK_URL,
            realm: process.env.KEYCLOAK_REALM,
            clientId: process.env.KEYCLOAK_CLIENT_SECRET,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
          },
        },
        {
          resolve: '@medusajs/medusa/auth-emailpass',
          id: 'emailpass',
          options: {},
        },
      ],
    },
  },
  ...
```