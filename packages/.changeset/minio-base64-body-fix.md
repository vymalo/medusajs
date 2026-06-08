---
'@vymalo/medusa-minio': patch
---

fix: decode the file body as base64 (with binary fallback) before uploading, so
stored objects are real binary instead of base64 text — images now render. Also
bump dependencies (minio, mime-types, fs-extra, @medusajs/framework) to latest.
