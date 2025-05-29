# MedusaJS Argon2 Authentication Plugin

🔐 Enhanced password hashing for MedusaJS using the Argon2 algorithm - the most advanced and secure password hashing method.

## 🌟 Features

- Utilizes Argon2, the winner of the Password Hashing Competition
- Highly configurable password hashing
- Provides robust protection against various password cracking techniques
- Seamless integration with MedusaJS authentication

## 🛡️ Why Argon2?

Argon2 offers superior security compared to traditional hashing methods:
- Resistant to GPU and ASIC cracking attempts
- Configurable memory, time, and parallelism costs
- Adaptable to changing computational power
- Recommended by leading security experts

## 📦 Installation

Install the package using npm:
```bash
npm install @vymalo/medusa-argon2
```

Or using yarn:
```bash
yarn add @vymalo/medusa-argon2
```

## 🚀 Usage

Add the plugin to the `modules` section of your MedusaJS configuration:

```typescript
modules: [
  {
    resolve: '@medusajs/medusa/auth',
    options: {
      providers: [
        {
          resolve: '@vymalo/medusa-argon2',
          id: 'emailpass', // Yes, `emailpass`, as the goal is to override the default 
          options: {
            // Optional configuration parameters
            argon2: {
              timeCost: 3,
              memoryCost: 12288, // 12 MB
              parallelism: 1
            }
          },
        },
      ],
    },
  },
  // Other modules...
]
```

## 🔧 Configuration Options

The plugin supports full Argon2 configuration:

```typescript
interface Argon2Options {
  hashLength?: number;      // Length of the hash output (default: secure)
  timeCost?: number;        // Number of iterations (higher = more secure)
  memoryCost?: number;      // Memory usage in KB (higher = more secure)
  parallelism?: number;     // Number of parallel threads
  type?: 0 | 1 | 2;         // Argon2 variant (d, i, or id)
  version?: number;          // Argon2 version
  
  // Advanced options
  salt?: Buffer;             // Custom salt (usually auto-generated)
  associatedData?: Buffer;   // Additional context data
  secret?: Buffer;           // Secret key for additional security
}
```

### Recommended Configuration

- `timeCost`: Minimum 3, increase for more security
- `memoryCost`: At least 12288 KB (12 MB)
- `parallelism`: 1-4 depending on your server
- `type`: Recommended `2` (Argon2id - hybrid mode)

## 🛡️ Security Recommendations

- Always use environment variables for sensitive configurations
- Periodically review and adjust hashing parameters
- Monitor computational resources and update costs as hardware evolves

## 🤝 Contributing

Contributions are welcome! Please submit pull requests or open issues.

## 🔒 Security Reporting

If you discover a security vulnerability, please send an email to [your security contact].

## 📄 License

[Check the license](./LICENSE)

## 🔗 Related Projects

- [MedusaJS](https://medusajs.com/)
- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)