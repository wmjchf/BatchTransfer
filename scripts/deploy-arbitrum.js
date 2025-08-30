const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署Arbitrum批量转账合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 设置手续费收集地址
  const feeCollectorAddress = process.env.FEE_COLLECTOR || deployer.address;
  console.log("手续费收集地址:", feeCollectorAddress);

  // 部署Arbitrum专用合约
  const BatchTransferArbitrum = await ethers.getContractFactory("BatchTransferArbitrum");
  const batchTransferArbitrum = await BatchTransferArbitrum.deploy(feeCollectorAddress);

  console.log("等待合约部署确认...");
  await batchTransferArbitrum.waitForDeployment();

  const contractAddress = await batchTransferArbitrum.getAddress();
  console.log("BatchTransferArbitrum合约部署成功!");
  console.log("合约地址:", contractAddress);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("部署网络: Arbitrum One, ChainID:", network.chainId);

  // 获取手续费配置
  try {
    const feeConfig = await batchTransferArbitrum.getFeeConfig();
    console.log("Arbitrum网络手续费配置:");
    console.log("- 基础费用:", ethers.formatEther(feeConfig[0]), "ETH");
    console.log("- 每地址费用:", ethers.formatEther(feeConfig[1]), "ETH");
    console.log("- 最低费用:", ethers.formatEther(feeConfig[2]), "ETH");
    console.log("- 最高费用:", ethers.formatEther(feeConfig[3]), "ETH");

    // 计算示例费用
    const fee50 = await batchTransferArbitrum.calculateFee(50);
    const fee100 = await batchTransferArbitrum.calculateFee(100);
    const fee200 = await batchTransferArbitrum.calculateFee(200);
    console.log("费用示例:");
    console.log("- 50个地址:", ethers.formatEther(fee50), "ETH");
    console.log("- 100个地址:", ethers.formatEther(fee100), "ETH");
    console.log("- 200个地址:", ethers.formatEther(fee200), "ETH");
  } catch (error) {
    console.log("获取手续费配置失败:", error.message);
  }

  // 获取预设的代币地址
  try {
    const commonTokens = await batchTransferArbitrum.getCommonTokens();
    console.log("\n预设的Arbitrum常用代币地址:");
    console.log("- USDT:", commonTokens[0]);
    console.log("- USDC:", commonTokens[1]);
    console.log("- WETH:", commonTokens[2]);
    console.log("- ARB:", commonTokens[3]);
    console.log("- DAI:", commonTokens[4]);
  } catch (error) {
    console.log("获取代币地址失败:", error.message);
  }

  // 保存部署信息
  const deploymentInfo = {
    network: "arbitrum",
    chainId: network.chainId.toString(),
    contractName: "BatchTransferArbitrum",
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollectorAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasLimits: {
      ethTransfer: 400,
      tokenTransfer: 300
    }
  };

  console.log("\n=== Arbitrum部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== 使用说明 ===");
  console.log("1. 计算手续费: calculateFee(addressCount)");
  console.log("2. 批量转账ETH: batchTransferETH(transfers)");
  console.log("3. 批量转账代币: batchTransferToken(tokenAddress, transfers)");
  
  console.log("\n=== 验证合约命令 ===");
  console.log(`npx hardhat verify --network arbitrum ${contractAddress} "${feeCollectorAddress}"`);

  console.log("\n=== Arbitrum优势 ===");
  console.log("- L2解决方案，gas费用比以太坊主网低90%+");
  console.log("- 单次最多支持400个ETH转账，300个代币转账");
  console.log("- 完全兼容以太坊，支持所有ERC20代币");
  console.log("- 拥有原生ARB代币生态");
  console.log("- 继承以太坊主网的安全性");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Arbitrum合约部署失败:", error);
    process.exit(1);
  });