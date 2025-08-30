# NTYE - Next Ten Years of Ethereum

<div align="center">

![NTYE Logo](public/image/hero-bg.webp)

**NTYE - Next Ten Years of Ethereum** 是一个基于以太坊的Web3项目，致力于构建一个拥有100万持有者的去中心化社区。这是一个前所未有的、具有里程碑意义的实验，数百万用户携手共建社区，见证以太坊智能合约真正的去中心化力量。

[![Next.js](https://img.shields.io/badge/Next.js-14.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.14.3-orange?style=for-the-badge)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2.1-purple?style=for-the-badge)](https://www.rainbowkit.com/)

[English](./README.md) | [中文](./README.md)

</div>

## 🚀 项目特性

- **🌐 多语言支持** - 支持中文和英文双语界面
- **🔗 Web3集成** - 完整的以太坊钱包连接和智能合约交互
- **🎨 现代化UI** - 基于Tailwind CSS和HeroUI的响应式设计
- **⚡ 高性能** - 基于Next.js 14的App Router架构
- **🔒 安全可靠** - 完整的智能合约交互和权限管理
- **📱 移动端适配** - 完美支持移动端和桌面端
- **🎯 用户体验** - 流畅的动画效果和交互体验

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
- **NextUI Theme** - 主题系统

### 状态管理
- **Zustand** - 轻量级状态管理
- **React Query** - 服务端状态管理

### 国际化
- **next-intl** - Next.js国际化解决方案

### 开发工具
- **Sass** - CSS预处理器
- **PostCSS** - CSS后处理器
- **ESLint** - 代码质量检查

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

# Google Analytics
NEXT_PUBLIC_GA4_DEBUG=false

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
ntyeReact/
├── public/                 # 静态资源
│   ├── fonts/             # 字体文件
│   └── image/             # 图片资源
├── src/
│   ├── app/               # Next.js App Router
│   │   └── [locale]/      # 国际化路由
│   │       ├── components/ # 页面组件
│   │       │   ├── Banner/     # 横幅组件
│   │       │   ├── Experiment/ # 实验组件
│   │       │   ├── Introduction/ # 介绍组件
│   │       │   ├── Mint/       # 铸造组件
│   │       │   ├── Rule/       # 规则组件
│   │       │   └── Token/      # 代币组件
│   │       ├── Header/    # 头部组件
│   │       └── layout.tsx # 布局文件
│   ├── components/        # 通用组件
│   │   ├── ConnectWallet/ # 钱包连接
│   │   ├── InviteCode/    # 邀请码
│   │   ├── IPRegion/      # IP地区
│   │   └── WalletConnect/ # 钱包连接
│   ├── abi/              # 智能合约ABI
│   ├── constant/         # 常量定义
│   ├── i18n/             # 国际化配置
│   ├── rainbowkit/       # Web3配置
│   ├── service/          # API服务
│   ├── store/            # 状态管理
│   ├── styles/           # 样式文件
│   └── utils/            # 工具函数
├── messages/             # 国际化消息
├── next.config.js        # Next.js配置
├── tailwind.config.js    # Tailwind配置
└── tsconfig.json         # TypeScript配置
```

## 🌍 国际化支持

项目支持中文和英文两种语言：

- 默认语言：英文
- 支持语言：中文、英文
- 路由格式：`/en/` 和 `/zh/`

### 添加新语言

1. 在 `src/i18n/routing.ts` 中添加新语言代码
2. 在 `messages/` 目录下创建对应的语言文件
3. 更新中间件配置

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

### 智能合约交互

项目包含完整的ERC20代币交互功能：

- 代币余额查询
- 代币授权
- 代币转账
- 铸造功能

## 🎨 自定义主题

项目使用Tailwind CSS和HeroUI，支持主题自定义：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 自定义颜色
      },
      animation: {
        // 自定义动画
      }
    }
  }
}
```

## 📱 响应式设计

项目采用移动优先的响应式设计：

- 移动端优化
- 平板端适配
- 桌面端体验
- 触摸友好交互

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

- 项目主页：[GitHub Repository](https://github.com/your-username/ntyeReact)
- 问题反馈：[Issues](https://github.com/your-username/ntyeReact/issues)
- 讨论交流：[Discussions](https://github.com/your-username/ntyeReact/discussions)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by the NTYE Community

</div>