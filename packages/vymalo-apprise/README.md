# MedusaJS Apprise Notification Plugin

A flexible notification plugin for MedusaJS using Apprise, enabling multichannel notifications with ease.

## 🌟 Features

- Support for multiple notification channels (email, SMS, etc.)
- Configurable via MedusaJS modules
- Leverages Apprise's powerful notification routing
- Flexible axios-based client configuration

## 📦 Installation

Install the package using npm:
```bash
npm install @vymalo/medusa-apprise
```

Or using yarn:
```bash
yarn add @vymalo/medusa-apprise
```

## 🚀 Usage

### Configuration

Add the plugin to the `modules` section of your MedusaJS configuration:

```typescript
modules: [
  {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: `@vymalo/medusa-apprise`,
          id: "apprise",
          options: {
            client: {
              baseURL: 'http://localhost:8000/notify', // Apprise API service URL
              headers: {
                "Content-Type": "application/json"
              }
            },
            handlers: {
              email: (notification: ProviderSendNotificationDTO) => [
                {
                  urls: [
                    `mailgun:///noreply@example.com/4b4f2918fd-dk5f-8f91f/${notification.to}`,
                    `ses://test@test.com/<access-key>/<secret-key>/<aws-region>/admin@email.com`,
                  ],
                  body: `[${notification.template}] ${JSON.stringify(notification.data, null, 4)}`
                }
              ],
              // More channel handlers...
            },
          },
        },
      ],
    },
  },
  // Other modules...
]
```

## 🔧 Configuration Options

### Client Configuration
The `client` option uses axios configuration, allowing full customization of the HTTP client.

### Handlers
Define custom handlers for different notification channels:
- `email`: Email notification handler
- `sms`: SMS notification handler
- Add more as needed

### Notification Payload

```typescript
type AppriseNotificationPayload = {
  urls: string[];          // Notification destination URLs
  body: string;            // Notification body
  title?: string;          // Optional notification title
  type?: 'info' | 'warning' | 'failure';  // Notification type
  format?: 'text' | 'markdown' | 'html';  // Notification format
  tag?: string;            // Optional tag for notification
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Check the license](./LICENSE)

## 🔗 Related Projects

- [MedusaJS](https://medusajs.com/)
- [Apprise](https://github.com/caronc/apprise)