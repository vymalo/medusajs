# MedusaJS Mail templates

This package provides a set of mail templates for MedusaJS.
It is based on 
- email-templates
- preview-email

## Installation

```bash
npm install @vymalo/medusa-mail
```

or if using yarn

```bash
yarn add @vymalo/medusa-mail
```

## Usage
To use this plugin, you should add it into the `modules` section of your MedusaJS configuration.

```typescript
  modules: [
    ...
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: `@vymalo/medusa-mail`,
            id: "ssegning",
            options: {
              channels: ["email"],
              message: {
                from: "no-reply@vymalo.com",
              },
              send: process.env.NODE === "production",
              preview: false,
              transport: "smtp://localhost:1025",
            },
          },
        ],
      },
    },
    ...
```

The options are from the nodemailer package, so you can use any of the options from there.
