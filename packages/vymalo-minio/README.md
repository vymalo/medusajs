# MedusaJS Minio

Upload medusajs files to Minio

## Installation

```bash
npm install @vymalo/medusa-minio
```

or if using yarn

```bash
yarn add @vymalo/medusa-minio
```

## Usage
To use this plugin, you should add it into the `modules` section of your MedusaJS configuration.

```typescript
  modules: [
  ...
  {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        {
          resolve: '@vymalo/medusa-minio',
          id: 'minio',
          options: {
            endpoint: process.env.MINIO_ENDPOINT,
            cdn_url: process.env.MINIO_CDN_URL,
            bucket: process.env.MINIO_BUCKET,
            private_bucket: process.env.MINIO_PRIVATE_BUCKET?.length
              ? process.env.MINIO_PRIVATE_BUCKET
              : process.env.MINIO_BUCKET,
            access_key_id: process.env.MINIO_ACCESS_KEY,
            secret_access_key: process.env.MINIO_SECRET_KEY,
          },
        },
      ],
    },
  },
  ...
```
