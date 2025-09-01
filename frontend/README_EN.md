# Batch Transfer - Web3 Batch Transfer Tool

<div align="center">

![Batch Transfer Logo](public/image/hero-bg.webp)

**Batch Transfer** is a Web3 batch transfer tool based on Ethereum that supports batch transfer functionality for ETH and ERC20 tokens. This tool provides an easy-to-use interface that allows users to perform large-scale token transfers through CSV files or manual input, significantly improving transfer efficiency and saving Gas fees.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.16.3-orange?style=for-the-badge)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2.1-purple?style=for-the-badge)](https://www.rainbowkit.com/)

[English](./README_EN.md) | [中文](./README.md)

</div>

## 🚀 Features

- **💸 Batch Transfer** - Support for batch transfer of ETH and ERC20 tokens
- **📊 CSV Import** - Support for bulk import of recipient addresses and amounts via CSV files
- **✏️ Manual Input** - Support for manually adding and editing transfer addresses
- **🔗 Web3 Integration** - Complete Ethereum wallet connection and smart contract interaction
- **⛽ Gas Optimization** - Significant Gas fee savings through batch operations
- **🔒 Secure & Reliable** - Smart contract ensures transfer security with automatic refund for failures
- **📱 Responsive Design** - Perfect support for mobile and desktop
- **🎯 User Friendly** - Intuitive interface design and operation flow

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
- **Antd** - Enterprise-class UI components

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Internationalization
- **next-intl** - Next.js internationalization solution

### Development Tools
- **Sass** - CSS preprocessor
- **PostCSS** - CSS post-processor
- **TypeScript** - Type-safe JavaScript

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

# Smart Contract Address (Configure according to your deployed contract address)
NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT=0x...

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
batchTransfer/
├── public/                 # Static assets
│   ├── fonts/             # Font files
│   ├── image/             # Image resources
│   └── template/          # Template files
│       └── batch_transfer_template.xlsx  # CSV template
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── components/    # Page components
│   │   │   ├── AddressList/    # Address list components
│   │   │   │   ├── CSV.tsx          # CSV import
│   │   │   │   ├── Manual.tsx       # Manual input
│   │   │   │   ├── PreviewData.tsx  # Data preview
│   │   │   │   └── Upload.tsx       # File upload
│   │   │   └── TokenSetup/     # Token setup component
│   │   ├── Header/        # Header component
│   │   ├── Footer/        # Footer component
│   │   └── layout.tsx     # Layout file
│   ├── components/        # Common components
│   │   ├── ConnectWallet/ # Wallet connection
│   │   ├── IPRegion/      # IP region detection
│   │   └── WalletConnect/ # Wallet connection
│   ├── abi/              # Smart contract ABI
│   │   ├── batchTransfter.ts  # Batch transfer contract
│   │   ├── erc20.ts          # ERC20 contract
│   │   └── ntye.ts           # NTYE contract
│   ├── constant/         # Constant definitions
│   ├── rainbowkit/       # Web3 configuration
│   ├── service/          # API services
│   ├── store/            # State management
│   ├── styles/           # Style files
│   └── utils/            # Utility functions
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 💸 User Guide

### 1. Connect Wallet
First, click the "Connect Wallet" button to connect your Ethereum wallet (MetaMask, WalletConnect, etc.).

### 2. Select Token
In the token setup area, select the type of token to transfer:
- **ETH** - Ethereum native token
- **ERC20 Token** - Enter the token contract address

### 3. Add Recipient Addresses
You can add recipient addresses in two ways:

#### CSV File Import
1. Download the CSV template file
2. Fill in addresses and amounts according to the format
3. Upload the CSV file

#### Manual Addition
1. Click "Manual Add"
2. Enter recipient address and transfer amount
3. Click "Add" button

### 4. Confirm Transfer
1. Check the transfer list and total amount
2. Ensure sufficient wallet balance
3. Click "Start Transfer"
4. Confirm the transaction in your wallet

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

### Smart Contract Features

The project includes complete batch transfer functionality:

- **Batch ETH Transfer** - Transfer ETH to multiple addresses in one transaction
- **Batch ERC20 Transfer** - Transfer ERC20 tokens to multiple addresses in one transaction
- **Automatic Authorization Check** - Automatically check and handle ERC20 token authorization
- **Failure Refund** - Automatically refund unused funds for failed transfers
- **Gas Optimization** - Significantly save Gas fees through batch operations

## ⚠️ Important Notes

### Security Reminders
- **Check Addresses Carefully** - Please ensure recipient addresses are correct before transferring
- **Confirm Amounts** - Please confirm transfer amounts are correct, transfers cannot be reversed
- **Sufficient Balance** - Ensure wallet has enough balance to pay transfer amounts and Gas fees
- **Network Selection** - Confirm the correct blockchain network is selected

### Usage Limitations
- **Maximum Addresses** - Single batch transfer supports up to 500 addresses
- **Gas Limits** - Large batch transfers may require higher Gas fees
- **Token Authorization** - ERC20 token transfers require prior authorization

### CSV Format Requirements
```
address,amount
0x742d35Cc6634C0532925a3b8D4b9B82d4E4B7Bd,1.5
0x742d35Cc6634C0532925a3b8D4b9B82d4E4B7Bd,2.0
```

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

- Project Homepage: [GitHub Repository](https://github.com/your-username/batchTransfer)
- Issue Feedback: [Issues](https://github.com/your-username/batchTransfer/issues)
- Feature Suggestions: [Discussions](https://github.com/your-username/batchTransfer/discussions)

## 📈 Roadmap

- [x] Basic batch transfer functionality
- [x] CSV file import
- [x] Manual address addition
- [x] Multi-wallet support
- [ ] More blockchain network support
- [ ] Transfer history records
- [ ] Advanced Gas optimization
- [ ] Mobile APP

---

<div align="center">

**⭐ If this project helps you, please give us a star!**

Made with ❤️ by the Batch Transfer Team

</div> 