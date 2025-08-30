# NTYE - Next Ten Years of Ethereum

<div align="center">

![NTYE Logo](public/image/hero-bg.webp)

**NTYE - Next Ten Years of Ethereum** is a Web3 project based on Ethereum, dedicated to building a decentralized community with 1 million holders. This is an unprecedented and monumental experiment, where millions of users join hands to build a community and witness the true decentralized power of Ethereum smart contracts.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.14.3-orange?style=for-the-badge)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2.1-purple?style=for-the-badge)](https://www.rainbowkit.com/)

[English](./README_EN.md) | [中文](./README.md)

</div>

## 🚀 Features

- **🌐 Multi-language Support** - Supports both Chinese and English interfaces
- **🔗 Web3 Integration** - Complete Ethereum wallet connection and smart contract interaction
- **🎨 Modern UI** - Responsive design based on Tailwind CSS and HeroUI
- **⚡ High Performance** - Next.js 14 App Router architecture
- **🔒 Secure & Reliable** - Complete smart contract interaction and permission management
- **📱 Mobile Responsive** - Perfect support for mobile and desktop
- **🎯 User Experience** - Smooth animations and interactive experience

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React full-stack framework with App Router
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript

### Web3 Technology
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - Wallet connection component library
- **Viem** - Ethereum client
- **SIWE** - Sign-In with Ethereum

### UI/UX
- **Tailwind CSS** - Utility-first CSS framework
- **HeroUI** - Modern React component library
- **Framer Motion** - Animation library
- **NextUI Theme** - Theme system

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Internationalization
- **next-intl** - Next.js internationalization solution

### Development Tools
- **Sass** - CSS preprocessor
- **PostCSS** - CSS post-processor
- **ESLint** - Code quality checking

## 📦 Installation & Setup

### Requirements

- Node.js >= 18.19.0
- pnpm (recommended) or npm

### Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Environment Configuration

Create a `.env.local` file and configure the following environment variables:

```env
# Web3 Configuration
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_BASE_URL=your_api_base_url

# Google Analytics
NEXT_PUBLIC_GA4_DEBUG=false

# Other Configuration
NODE_ENV=development
```

### Development Mode

```bash
# Start development server
pnpm dev

# Or using npm
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Test environment build
pnpm build:test

# Production environment build
pnpm build:prod

# Start production server
pnpm start:test
pnpm start:prod
```

## 🏗️ Project Structure

```
ntyeReact/
├── public/                 # Static assets
│   ├── fonts/             # Font files
│   └── image/             # Image resources
├── src/
│   ├── app/               # Next.js App Router
│   │   └── [locale]/      # Internationalization routes
│   │       ├── components/ # Page components
│   │       │   ├── Banner/     # Banner component
│   │       │   ├── Experiment/ # Experiment component
│   │       │   ├── Introduction/ # Introduction component
│   │       │   ├── Mint/       # Mint component
│   │       │   ├── Rule/       # Rule component
│   │       │   └── Token/      # Token component
│   │       ├── Header/    # Header component
│   │       └── layout.tsx # Layout file
│   ├── components/        # Common components
│   │   ├── ConnectWallet/ # Wallet connection
│   │   ├── InviteCode/    # Invite code
│   │   ├── IPRegion/      # IP region
│   │   └── WalletConnect/ # Wallet connection
│   ├── abi/              # Smart contract ABI
│   ├── constant/         # Constant definitions
│   ├── i18n/             # Internationalization config
│   ├── rainbowkit/       # Web3 configuration
│   ├── service/          # API services
│   ├── store/            # State management
│   ├── styles/           # Style files
│   └── utils/            # Utility functions
├── messages/             # Internationalization messages
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🌍 Internationalization Support

The project supports both Chinese and English languages:

- Default language: English
- Supported languages: Chinese, English
- Route format: `/en/` and `/zh/`

### Adding New Languages

1. Add new language code in `src/i18n/routing.ts`
2. Create corresponding language files in `messages/` directory
3. Update middleware configuration

## 🔗 Web3 Integration

### Supported Networks

- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Sepolia (Testnet)

### Wallet Support

- MetaMask
- WalletConnect
- Coinbase Wallet
- Other EVM-compatible wallets

### Smart Contract Interaction

The project includes complete ERC20 token interaction functionality:

- Token balance query
- Token approval
- Token transfer
- Minting functionality

## 🎨 Custom Theme

The project uses Tailwind CSS and HeroUI, supporting theme customization:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      animation: {
        // Custom animations
      }
    }
  }
}
```

## 📱 Responsive Design

The project adopts a mobile-first responsive design:

- Mobile optimization
- Tablet adaptation
- Desktop experience
- Touch-friendly interaction

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Fork this repository
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The project supports deployment to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Self-hosted servers

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Standards

- Write code using TypeScript
- Follow ESLint rules
- Write clear commit messages
- Add necessary tests

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React full-stack framework
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [HeroUI](https://heroui.com/) - React component library

## 📞 Contact Us

- Project Homepage: [GitHub Repository](https://github.com/your-username/ntyeReact)
- Issue Feedback: [Issues](https://github.com/your-username/ntyeReact/issues)
- Discussion: [Discussions](https://github.com/your-username/ntyeReact/discussions)

---

<div align="center">

**⭐ If this project helps you, please give us a star!**

Made with ❤️ by the NTYE Community

</div> 