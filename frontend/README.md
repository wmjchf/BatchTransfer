# Batch Transfer - 批量转账工具

<div align="center">

![Batch Transfer Logo](public/image/hero-bg.webp)

**Batch Transfer** 是一个基于以太坊的Web3批量转账工具，支持ETH和ERC20代币的批量转账功能。该工具提供了简单易用的界面，让用户可以通过CSV文件或手动输入的方式进行大批量的代币转账操作，大大提高转账效率并节省Gas费用。

[![Next.js](https://img.shields.io/badge/Next.js-14.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.16.3-orange?style=for-the-badge)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2.1-purple?style=for-the-badge)](https://www.rainbowkit.com/)

[English](./README_EN.md) | [中文](./README.md)

</div>

## 🚀 项目特性

- **💸 批量转账** - 支持ETH和ERC20代币的批量转账功能
- **📊 CSV导入** - 支持CSV文件批量导入收款地址和金额
- **✏️ 手动输入** - 支持手动添加和编辑转账地址
- **🔗 Web3集成** - 完整的以太坊钱包连接和智能合约交互
- **⛽ Gas优化** - 批量操作显著节省Gas费用
- **🔒 安全可靠** - 智能合约保障转账安全，支持失败自动退款
- **📱 响应式设计** - 完美支持移动端和桌面端
- **🎯 用户友好** - 直观的界面设计和操作流程

## 🛠️ 技术栈

### 前端框架
- **Next.js 14** - React全栈框架，使用App Router
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript

### Web3技术
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - 钱包连接组件库
- **Viem** - 以太坊客户端
- **SIWE** - Sign-In with Ethereum

### UI/UX
- **Tailwind CSS** - 实用优先的CSS框架
- **HeroUI** - 现代化React组件库
- **Framer Motion** - 动画库
- **Antd** - 企业级UI组件库

### 状态管理
- **Zustand** - 轻量级状态管理
- **React Query** - 服务端状态管理

### 国际化
- **next-intl** - Next.js国际化解决方案

### 开发工具
- **Sass** - CSS预处理器
- **PostCSS** - CSS后处理器
- **TypeScript** - 类型安全的JavaScript

## 📦 安装和运行

### 环境要求

- Node.js >= 18.19.0
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# Web3配置
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_BASE_URL=your_api_base_url

# 智能合约地址 (请根据实际部署的合约地址进行配置)
NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT=0x...

# 其他配置
NODE_ENV=development
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

```bash
# 测试环境构建
pnpm build:test

# 生产环境构建
pnpm build:prod

# 启动生产服务器
pnpm start:test
pnpm start:prod
```

## 🏗️ 项目结构

```
batchTransfer/
├── public/                 # 静态资源
│   ├── fonts/             # 字体文件
│   ├── image/             # 图片资源
│   └── template/          # 模板文件
│       └── batch_transfer_template.xlsx  # CSV模板
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── components/    # 页面组件
│   │   │   ├── AddressList/    # 地址列表组件
│   │   │   │   ├── CSV.tsx          # CSV导入
│   │   │   │   ├── Manual.tsx       # 手动输入
│   │   │   │   ├── PreviewData.tsx  # 数据预览
│   │   │   │   └── Upload.tsx       # 文件上传
│   │   │   └── TokenSetup/     # 代币设置组件
│   │   ├── Header/        # 头部组件
│   │   ├── Footer/        # 页脚组件
│   │   └── layout.tsx     # 布局文件
│   ├── components/        # 通用组件
│   │   ├── ConnectWallet/ # 钱包连接
│   │   ├── IPRegion/      # IP地区检测
│   │   └── WalletConnect/ # 钱包连接
│   ├── abi/              # 智能合约ABI
│   │   ├── batchTransfter.ts  # 批量转账合约
│   │   ├── erc20.ts          # ERC20合约
│   │   └── ntye.ts           # NTYE合约
│   ├── constant/         # 常量定义
│   ├── rainbowkit/       # Web3配置
│   ├── service/          # API服务
│   ├── store/            # 状态管理
│   ├── styles/           # 样式文件
│   └── utils/            # 工具函数
├── next.config.js        # Next.js配置
├── tailwind.config.js    # Tailwind配置
└── tsconfig.json         # TypeScript配置
```

## 💸 使用指南

### 1. 连接钱包
首先点击"连接钱包"按钮，连接您的以太坊钱包（MetaMask、WalletConnect等）。

### 2. 选择代币
在代币设置区域选择要转账的代币类型：
- **ETH** - 以太坊原生代币
- **ERC20代币** - 输入代币合约地址

### 3. 添加收款地址
您可以通过两种方式添加收款地址：

#### CSV文件导入
1. 下载CSV模板文件
2. 按照格式填写地址和金额
3. 上传CSV文件

#### 手动添加
1. 点击"手动添加"
2. 输入收款地址和转账金额
3. 点击"添加"按钮

### 4. 确认转账
1. 检查转账列表和总金额
2. 确认钱包余额充足
3. 点击"开始转账"
4. 在钱包中确认交易

## 🔗 Web3集成

### 支持的网络

- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Sepolia (测试网)

### 钱包支持

- MetaMask
- WalletConnect
- Coinbase Wallet
- 其他EVM兼容钱包

### 智能合约功能

项目包含完整的批量转账功能：

- **批量ETH转账** - 一次交易向多个地址转账ETH
- **批量ERC20转账** - 一次交易向多个地址转账ERC20代币
- **自动授权检查** - 自动检查和处理ERC20代币授权
- **失败退款** - 转账失败自动退还未使用的资金
- **Gas优化** - 通过批量操作大幅节省Gas费用

## ⚠️ 注意事项

### 安全提醒
- **仔细检查地址** - 转账前请务必确认收款地址正确
- **金额确认** - 请确认转账金额无误，转账无法撤销
- **余额充足** - 确保钱包有足够余额支付转账金额和Gas费
- **网络选择** - 确认选择正确的区块链网络

### 使用限制
- **最大地址数** - 单次批量转账最多支持500个地址
- **Gas限制** - 大批量转账可能需要较高的Gas费用
- **代币授权** - ERC20代币转账前需要先进行授权操作

### CSV格式要求
```
地址,金额
0x742d35Cc6634C0532925a3b8D4b9B82d4E4B7Bd,1.5
0x742d35Cc6634C0532925a3b8D4b9B82d4E4B7Bd,2.0
```

## 🚀 部署

### Vercel部署 (推荐)

1. Fork本仓库
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目支持部署到任何支持Next.js的平台：

- Netlify
- AWS Amplify
- Railway
- 自建服务器

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范

- 使用TypeScript编写代码
- 遵循ESLint规则
- 编写清晰的提交信息
- 添加必要的测试

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - 钱包连接组件
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [HeroUI](https://heroui.com/) - React组件库

## 📞 联系我们

- 项目主页：[GitHub Repository](https://github.com/your-username/batchTransfer)
- 问题反馈：[Issues](https://github.com/your-username/batchTransfer/issues)
- 功能建议：[Discussions](https://github.com/your-username/batchTransfer/discussions)

## 📈 路线图

- [x] 基础批量转账功能
- [x] CSV文件导入
- [x] 手动地址添加
- [x] 多钱包支持
- [ ] 更多区块链网络支持
- [ ] 转账历史记录
- [ ] 高级Gas优化
- [ ] 移动端APP

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by the Batch Transfer Team

</div>