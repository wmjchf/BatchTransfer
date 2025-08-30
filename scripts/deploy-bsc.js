const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署BSC批量转账合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

  // 设置手续费收集地址
  const feeCollectorAddress = process.env.FEE_COLLECTOR || deployer.address;
  console.log("手续费收集地址:", feeCollectorAddress);

  // 部署BSC专用合约
  const BatchTransferBSC = await ethers.getContractFactory("BatchTransferBSC");
  const batchTransferBSC = await BatchTransferBSC.deploy(feeCollectorAddress);

  console.log("等待合约部署确认...");
  await batchTransferBSC.waitForDeployment();

  const contractAddress = await batchTransferBSC.getAddress();
  console.log("BatchTransferBSC合约部署成功!");
  console.log("合约地址:", contractAddress);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("部署网络: BSC, ChainID:", network.chainId);

  // 获取手续费配置
  try {
    const feeConfig = await batchTransferBSC.getFeeConfig();
    console.log("BSC网络手续费配置:");
    console.log("- 基础费用:", ethers.formatEther(feeConfig[0]), "BNB");
    console.log("- 每地址费用:", ethers.formatEther(feeConfig[1]), "BNB");
    console.log("- 最低费用:", ethers.formatEther(feeConfig[2]), "BNB");
    console.log("- 最高费用:", ethers.formatEther(feeConfig[3]), "BNB");

    // 计算示例费用
    const fee50 = await batchTransferBSC.calculateFee(50);
    const fee100 = await batchTransferBSC.calculateFee(100);
    const fee200 = await batchTransferBSC.calculateFee(200);
    console.log("费用示例:");
    console.log("- 50个地址:", ethers.formatEther(fee50), "BNB");
    console.log("- 100个地址:", ethers.formatEther(fee100), "BNB");
    console.log("- 200个地址:", ethers.formatEther(fee200), "BNB");
  } catch (error) {
    console.log("获取手续费配置失败:", error.message);
  }

  // 获取预设的代币地址
  try {
    const commonTokens = await batchTransferBSC.getCommonTokens();
    console.log("\n预设的BSC常用代币地址:");
    console.log("- USDT:", commonTokens[0]);
    console.log("- USDC:", commonTokens[1]);
    console.log("- BUSD:", commonTokens[2]);
    console.log("- WBNB:", commonTokens[3]);
    console.log("- CAKE:", commonTokens[4]);
  } catch (error) {
    console.log("获取代币地址失败:", error.message);
  }

  // 保存部署信息
  const deploymentInfo = {
    network: "bsc",
    chainId: network.chainId.toString(),
    contractName: "BatchTransferBSC",
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollectorAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasLimits: {
      bnbTransfer: 500,
      tokenTransfer: 400
    }
  };

  console.log("\n=== BSC部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== 使用说明 ===");
  console.log("1. 计算手续费: calculateFee(addressCount)");
  console.log("2. 批量转账BNB: batchTransferBNB(transfers) - 返回执行结果");
  console.log("3. 批量转账BEP20: batchTransferToken(tokenAddress, transfers) - 返回执行结果");
  console.log("4. 容错机制: 自动跳过失败地址，继续执行成功转账");
  
  console.log("\n=== 验证合约命令 ===");
  console.log(`npx hardhat verify --network bsc ${contractAddress} "${feeCollectorAddress}"`);

  console.log("\n=== BSC优势 ===");
  console.log("- Gas费用低，适合大批量转账");
  console.log("- 单次最多支持500个BNB转账，400个代币转账");
  console.log("- 支持BUSD等BSC生态特有代币");
  console.log("- 交易确认速度快（~3秒）");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("BSC合约部署失败:", error);
    process.exit(1);
  });