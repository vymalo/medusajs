# MedusaJS Plugins by Vymalo

This repository is a collection of powerful and flexible plugins designed to extend the capabilities of your MedusaJS commerce platform. Each plugin is crafted to integrate seamlessly with MedusaJS, providing enhanced functionalities for various aspects of your e-commerce application.

## Project Overview

This monorepo hosts a suite of MedusaJS plugins, each addressing specific needs within the e-commerce ecosystem. Whether you're looking to implement advanced authentication methods, robust notification systems, powerful search capabilities, or flexible file storage solutions, this collection offers well-documented and easy-to-integrate options.

## Key Features & Packages

This project is structured as a monorepo using Yarn workspaces. Below is a list of the available packages, each providing unique features:

* **[`@vymalo/medusa-apprise`](packages/vymalo-apprise/README.md)**: Enables multichannel notifications (email, SMS, etc.) through [Apprise](https://github.com/caronc/apprise), offering flexible configuration for various notification services.
* **[`@vymalo/medusa-argon2`](packages/vymalo-argon2/README.md)**: Enhances password security by integrating the [Argon2](https://github.com/P-H-C/phc-winner-argon2) hashing algorithm, the winner of the Password Hashing Competition.
* **[`@vymalo/medusa-keycloak`](packages/vymalo-keycloak/README.md)**: Provides seamless integration with [Keycloak](https://www.keycloak.org/) for robust identity and access management, supporting OAuth 2.0 / OpenID Connect.
* **[`@vymalo/medusa-mail`](packages/vymalo-mail/README.md)**: Offers advanced email templating capabilities using [Nodemailer](https://nodemailer.com/) and [email-templates](https://github.com/forwardemail/email-templates), with support for previews, i18n, and various transports.
* **[`@vymalo/medusa-meilisearch`](packages/vymalo-meilisearch/README.md)**: Integrates [Meilisearch](https://www.meilisearch.com/) for lightning-fast, typo-tolerant search experiences with real-time updates and advanced filtering.
* **[`@vymalo/medusa-minio`](packages/vymalo-minio/README.md)**: Implements file storage using [MinIO](https://min.io/), a self-hosted, S3-compatible object storage solution, supporting public/private buckets and CDN integration.
* **[`@vymalo/ui-preset`](packages/vymalo-ui-preset/README.md)**: A Tailwind CSS preset designed for Vymalo projects, providing a consistent styling foundation.
* **[`@vymalo/medusa-webauthn`](packages/vymalo-webauthn/README.md)**: Enables passwordless authentication using the [WebAuthn](https://www.w3.org/TR/webauthn-2/) standard, supporting hardware and software security keys for enhanced security.

## Getting Started

### Prerequisites

* Node.js (Version specified in individual package `package.json` files, generally >=20)
* Yarn (Version 4.x, as specified in [`packages/package.json`](packages/package.json))
* A MedusaJS project.

### Installation (Development & Contribution)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/vymalo/medusajs.git
    cd medusajs
    ```

2. **Install dependencies:**
    This project uses Yarn workspaces. Install all dependencies from the root directory:

    ```bash
    yarn install
    ```

## Using a Plugin

Each plugin is designed to be integrated into your MedusaJS application. For detailed installation, configuration, and usage instructions for a specific plugin, please refer to its individual `README.md` file located within its package directory (e.g., [`packages/vymalo-apprise/README.md`](packages/vymalo-apprise/README.md)).

**General Steps:**

1. **Install the desired package** into your MedusaJS project:

    ```bash
    yarn add @vymalo/plugin-name # Replace plugin-name with the actual package name
    ```

    Or, if you are developing locally and want to use your cloned version, you can use `yalc` or Yarn's link functionality.

2. **Configure the plugin** in your `medusa-config.js` or relevant configuration files as per the plugin's specific documentation.

**Example:** To use the `@vymalo/medusa-keycloak` plugin, you would typically add it to the `modules` section of your MedusaJS configuration, as detailed in its [README](./packages/vymalo-keycloak/README.md).

## For New Users

If you are new to MedusaJS or these plugins:

1. **Explore MedusaJS**: Familiarize yourself with the [MedusaJS documentation](https://docs.medusajs.com/).
2. **Identify Your Needs**: Determine which plugin(s) from this collection can help you achieve your desired functionality.
3. **Read Plugin Documentation**: Carefully read the `README.md` for each plugin you intend to use. It contains specific installation, configuration, and usage examples.
4. **Integrate and Test**: Add the plugin to your MedusaJS project, configure it, and test its functionality thoroughly.

## For Potential Contributors

We welcome contributions to enhance these plugins!

### Development Setup

1. Ensure you have followed the [Installation (Development & Contribution)](#installation-development--contribution) steps above.
2. Navigate to the specific package you want to work on, e.g., `cd packages/vymalo-keycloak`.
3. Each package has its own scripts defined in its `package.json` (e.g., [`packages/vymalo-keycloak/package.json`](packages/vymalo-keycloak/package.json)). These typically include:
    * `format`: To format the code (e.g., using Biome).
    * `build`: To build the package (e.g., using `tsc`).
    * `dev`: For local development, if applicable.

### Contribution Process

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-number`.
3. **Make your changes**: Implement your feature or fix the bug. Ensure you adhere to the coding style and conventions used in the project.
4. **Format your code**: Run the formatting script from the root or the specific package directory.

    ```bash
    yarn biome check --write . # From the root, or specific path
    ```

5. **Build the package(s)** you've modified to ensure there are no build errors.
6. **Test your changes thoroughly.**
7. **Commit your changes** with a clear and descriptive commit message.
8. **Push your branch** to your forked repository.
9. **Create a Pull Request (PR)** against the `main` branch of the original repository. Provide a detailed description of your changes in the PR.

### Coding Standards

* Follow the existing code style.
* Ensure your code is well-documented, especially for new functionalities or complex logic.
* Write clear and concise commit messages.
* Update relevant documentation (READMEs, comments) if your changes affect usage or configuration.

## License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for more details.

## Support

For issues, questions, or feature requests related to a specific plugin, please open an issue in this GitHub repository, making sure to specify which plugin your issue pertains to.
