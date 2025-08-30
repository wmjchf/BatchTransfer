# 批量转账系统 (BatchTransfer)

一个支持多链EVM网络的批量转账智能合约系统，**采用单链单合约架构**，支持原生代币和ERC20代币的批量转账，包含智能手续费机制。每个网络都有专门优化的合约，确保最佳性能和易于维护。

## 功能特性

### 核心功能
- ✅ 原生代币批量转账 (ETH, BNB, MATIC等)
- ✅ ERC20代币批量转账
- ✅ 多链支持 (以太坊、BSC、Polygon、Arbitrum等)
- ✅ 智能手续费机制 (基于USD等值)
- ✅ CSV文件导入支持
- ✅ 转账预览和修改功能

- ✅ 安全性保护 (重入攻击防护、权限控制)
- 🆕 **容错机制**：跳过失败地址，继续执行成功转账
- 🆕 **详细结果**：返回每个转账的执行状态和失败原因
- 🆕 **智能退款**：自动退还失败转账的资金

### 手续费机制
采用分层模式的手续费计算:
```
总手续费 = 基础费用 + (地址数量 × 每地址费用)
```

各网络手续费配置:
| 网络 | 基础费用 | 每地址费用 | 最低费用 | 最高费用 | USD等值 |
|------|----------|------------|----------|----------|---------|
| Ethereum | 0.0003 ETH | 0.000006 ETH | 0.0005 ETH | 0.009 ETH | ~$0.5-$15 |
| BSC | 0.002 BNB | 0.00004 BNB | 0.0032 BNB | 0.06 BNB | ~$0.5-$15 |
| Polygon | 0.5 MATIC | 0.01 MATIC | 0.8 MATIC | 15 MATIC | ~$0.5-$15 |
| Arbitrum | 0.0003 ETH | 0.000006 ETH | 0.0005 ETH | 0.009 ETH | ~$0.5-$15 |

## 合约架构

### 单链单合约设计
为了更好的维护性和网络优化，每个区块链网络都有专门的合约：

| 网络 | 合约文件 | 专用功能 |
|------|----------|----------|
| 以太坊 | `BatchTransferETH.sol` | ETH转账 + 容错机制 |
| BSC | `BatchTransferBSC.sol` | BNB转账 + 大批量支持 |
| Polygon | `BatchTransferPolygon.sol` | MATIC转账 + 超大批量支持 |
| Arbitrum | `BatchTransferArbitrum.sol` | ETH转账 + L2优化 |

### 架构优势
- 🎯 **针对性优化**：每个合约根据网络特性优化gas限制和费用
- 🛠️ **易于维护**：独立部署，互不影响
- 🔒 **安全隔离**：单链故障不影响其他网络
- 📈 **扩展性强**：新增网络只需新建合约

## 快速开始

### 1. 安装依赖
```bash
cd contracts
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的私钥和API密钥
```

### 3. 编译合约
```bash
npm run compile
```

### 4. 按网络部署合约
```bash
# 部署到以太坊
npx hardhat run scripts/deploy-ethereum.js --network ethereum
npx hardhat run scripts/deploy-ethereum.js --network goerli

# 部署到BSC
npx hardhat run scripts/deploy-bsc.js --network bsc
npx hardhat run scripts/deploy-bsc.js --network bscTestnet

# 部署到Polygon
npx hardhat run scripts/deploy-polygon.js --network polygon
npx hardhat run scripts/deploy-polygon.js --network polygonMumbai

# 部署到Arbitrum
npx hardhat run scripts/deploy-arbitrum.js --network arbitrum
npx hardhat run scripts/deploy-arbitrum.js --network arbitrumGoerli
```

### 5. 验证合约 (可选)
```bash
# 以太坊
npx hardhat verify --network ethereum <contract_address> "<fee_collector_address>"

# BSC
npx hardhat verify --network bsc <contract_address> "<fee_collector_address>"

# Polygon
npx hardhat verify --network polygon <contract_address> "<fee_collector_address>"

# Arbitrum
npx hardhat verify --network arbitrum <contract_address> "<fee_collector_address>"
```

## 使用方法

### 🎯 容错机制

**智能容错**：跳过失败地址，继续执行成功的转账，返回详细结果和失败原因
**自动退款**：失败转账的资金自动退还给用户

### 计算手续费
```javascript
const fee = await batchTransfer.calculateFee(addressCount);
console.log(`转账${addressCount}个地址需要手续费: ${ethers.formatEther(fee)} ETH`);
```

### 批量转账原生代币

```javascript
const transfers = [
    { to: "0x...", amount: ethers.parseEther("1.0") },
    { to: "0x...", amount: ethers.parseEther("0.5") },
    // 更多转账...
];

const fee = await batchTransfer.calculateFee(transfers.length);
const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0n);

const results = await batchTransfer.batchTransferETH(transfers, {
    value: totalAmount + fee
});

// 处理结果
results.forEach((result, index) => {
    if (result.success) {
        console.log(`转账 ${index}: 成功`);
    } else {
        console.log(`转账 ${index}: 失败 - ${result.failureReason}`);
    }
});

// 统计结果
const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);
console.log(`成功: ${successful.length}, 失败: ${failed.length}`);
```

### 批量转账ERC20代币

```javascript
const tokenAddress = "0x...";
const transfers = [
    { to: "0x...", amount: ethers.parseUnits("100", 18) },
    { to: "0x...", amount: ethers.parseUnits("50", 18) },
    // 更多转账...
];

// 1. 授权代币
const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0n);
await token.approve(batchTransferAddress, totalAmount);

// 2. 执行批量转账
const fee = await batchTransfer.calculateFee(transfers.length);
const results = await batchTransfer.batchTransferToken(tokenAddress, transfers, {
    value: fee
});

// 分析结果
const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`成功: ${successful.length}, 失败: ${failed.length}`);
failed.forEach(result => {
    console.log(`地址 ${result.to} 失败: ${result.failureReason}`);
});

// 可以重试失败的转账
const retryTransfers = failed.map(f => ({ to: f.to, amount: f.amount }));
if (retryTransfers.length > 0) {
    console.log(`准备重试 ${retryTransfers.length} 个失败的转账...`);
}
```

## CSV格式

批量转账支持CSV文件导入，格式如下:

```csv
address,amount,token_address
0x1234567890123456789012345678901234567890,100,native
0x0987654321098765432109876543210987654321,50,0xA0b86a33E6441E13C7E98E10c174F8e5B5D3A1B5
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,25.5,native
```

- `address`: 接收地址
- `amount`: 转账数量
- `token_address`: 代币地址，填写 "native" 表示原生代币

## 安全特性

### 权限控制
- 只有合约所有者可以修改手续费配置
- 紧急提取功能仅限所有者使用
- 支持任意ERC20代币，无需白名单限制

### 安全检查
- 重入攻击防护 (ReentrancyGuard)
- 地址有效性检查
- 余额和授权充足性检查
- 转账失败回滚机制

### 限制机制
- 单次最多500个地址转账 (防止gas超限)
- 最低和最高手续费限制
- 自动验证代币地址格式和合约有效性

## 管理功能

### 更新手续费配置
```javascript
await batchTransfer.setFeeConfig(chainId, {
    baseFee: ethers.parseEther("0.001"),
    perAddressFee: ethers.parseEther("0.00001"),
    minFee: ethers.parseEther("0.002"),
    maxFee: ethers.parseEther("0.02")
});
```



### 更新手续费收集地址
```javascript
await batchTransfer.setFeeCollector(newFeeCollectorAddress);
```

## 许可证

MIT License