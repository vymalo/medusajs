# MedusaJS Mail Templates

📧 Powerful, Flexible Email Templating for MedusaJS

## 🌟 Features

- Advanced email template generation
- Nodemailer integration
- SMTP and transport flexibility
- Preview and development modes
- Internationalization support
- Extensive customization options

## 📦 Installation

Install the package using npm:
```bash
npm install @vymalo/medusa-mail
```

Or using yarn:
```bash
yarn add @vymalo/medusa-mail
```

## 🔧 Configuration Types

```typescript
interface EmailConfig<T = any> {
  // Nodemailer message configuration
  message?: Mail.Options;

  // Email transport options
  transport?: NodeMailerTransportOptions;

  // Template views and rendering
  views?: View;

  // Send behavior control
  send?: boolean;
  preview?: boolean | PreviewEmailOpts;

  // Advanced rendering options
  customRender?: boolean;
  render?: (view: string, locals?: T) => Promise<any>;
  
  // Internationalization
  i18n?: any;

  // Rendering configurations
  textOnly?: boolean;
  htmlToText?: HtmlToTextOptions | false;
  
  // Subject line customization
  subjectPrefix?: string | false;

  // HTML inlining and styling
  juice?: boolean;
  juiceSettings?: JuiceGlobalConfig;
  juiceResources?: juice.Options;

  // Custom template path resolution
  getPath?: (path: string, template: string, locals: any) => string;
}
```

## 🚀 Usage Example

```typescript
modules: [
  {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: `@vymalo/medusa-mail`,
          id: "email-provider",
          options: {
            // Basic configuration
            channels: ["email"],
            message: {
              from: "no-reply@yourcompany.com"
            },
            
            // Environment-specific settings
            send: process.env.NODE_ENV === "production",
            preview: process.env.NODE_ENV !== "production",
            
            // Transport configuration
            transport: "smtp://localhost:1025",
            
            // Advanced customizations
            subjectPrefix: process.env.NODE_ENV !== "production" 
              ? `[${process.env.NODE_ENV.toUpperCase()}]` 
              : false,
            
            // HTML to text conversion
            htmlToText: {
              wordwrap: 130,
              preserveNewlines: true
            }
          },
        },
      ],
    },
  }
]
```

## 🛠️ Key Configuration Options

### Message Configuration
- `message`: Nodemailer message options
    - `from`: Sender email address
    - `to`, `cc`, `bcc`: Recipient configurations
    - `subject`: Email subject

### Transport Options
- `transport`: Connection method
    - SMTP: `smtp://host:port`
    - SendGrid, Mailgun, etc.
- Supports all Nodemailer transport methods

### Rendering Modes
- `send`: Enable/disable actual email sending
- `preview`: Generate email preview
- `textOnly`: Render text-only emails
- `customRender`: Use custom rendering function

### Internationalization
- `i18n`: Enable template translations
- Supports various internationalization libraries

## 🌐 Environment Considerations

- Use different configurations per environment
- Disable sending in development
- Enable email previews
- Secure sensitive transport credentials

## 🔒 Security Best Practices

- Use environment variables for credentials
- Limit preview and sending in production
- Implement proper error handling
- Validate email configurations

## 🤝 Contributing

Contributions welcome!
- Improve template rendering
- Add new transport methods
- Enhance internationalization support

## 📄 License

[Check the license](./LICENSE)

## 🔗 Related Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [email-templates](https://github.com/forwardemail/email-templates)
- [MedusaJS](https://medusajs.com/)