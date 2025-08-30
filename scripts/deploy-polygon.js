const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署Polygon批量转账合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC");

  // 设置手续费收集地址
  const feeCollectorAddress = process.env.FEE_COLLECTOR || deployer.address;
  console.log("手续费收集地址:", feeCollectorAddress);

  // 部署Polygon专用合约
  const BatchTransferPolygon = await ethers.getContractFactory("BatchTransferPolygon");
  const batchTransferPolygon = await BatchTransferPolygon.deploy(feeCollectorAddress);

  console.log("等待合约部署确认...");
  await batchTransferPolygon.waitForDeployment();

  const contractAddress = await batchTransferPolygon.getAddress();
  console.log("BatchTransferPolygon合约部署成功!");
  console.log("合约地址:", contractAddress);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("部署网络: Polygon, ChainID:", network.chainId);

  // 获取手续费配置
  try {
    const feeConfig = await batchTransferPolygon.getFeeConfig();
    console.log("Polygon网络手续费配置:");
    console.log("- 基础费用:", ethers.formatEther(feeConfig[0]), "MATIC");
    console.log("- 每地址费用:", ethers.formatEther(feeConfig[1]), "MATIC");
    console.log("- 最低费用:", ethers.formatEther(feeConfig[2]), "MATIC");
    console.log("- 最高费用:", ethers.formatEther(feeConfig[3]), "MATIC");

    // 计算示例费用
    const fee50 = await batchTransferPolygon.calculateFee(50);
    const fee100 = await batchTransferPolygon.calculateFee(100);
    const fee300 = await batchTransferPolygon.calculateFee(300);
    const fee500 = await batchTransferPolygon.calculateFee(500);
    console.log("费用示例:");
    console.log("- 50个地址:", ethers.formatEther(fee50), "MATIC");
    console.log("- 100个地址:", ethers.formatEther(fee100), "MATIC");
    console.log("- 300个地址:", ethers.formatEther(fee300), "MATIC");
    console.log("- 500个地址:", ethers.formatEther(fee500), "MATIC");
  } catch (error) {
    console.log("获取手续费配置失败:", error.message);
  }

  // 获取预设的代币地址
  try {
    const commonTokens = await batchTransferPolygon.getCommonTokens();
    console.log("\n预设的Polygon常用代币地址:");
    console.log("- USDT:", commonTokens[0]);
    console.log("- USDC:", commonTokens[1]);
    console.log("- DAI:", commonTokens[2]);
    console.log("- WMATIC:", commonTokens[3]);
    console.log("- WETH:", commonTokens[4]);
  } catch (error) {
    console.log("获取代币地址失败:", error.message);
  }

  // 保存部署信息
  const deploymentInfo = {
    network: "polygon",
    chainId: network.chainId.toString(),
    contractName: "BatchTransferPolygon",
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollectorAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasLimits: {
      maticTransfer: 800,
      tokenTransfer: 600
    }
  };

  console.log("\n=== Polygon部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== 使用说明 ===");
  console.log("1. 计算手续费: calculateFee(addressCount)");
  console.log("2. 批量转账MATIC: batchTransferMATIC(transfers)");
  console.log("3. 批量转账代币: batchTransferToken(tokenAddress, transfers)");
  
  console.log("\n=== 验证合约命令 ===");
  console.log(`npx hardhat verify --network polygon ${contractAddress} "${feeCollectorAddress}"`);

  console.log("\n=== Polygon优势 ===");
  console.log("- Gas费用极低，最适合大规模批量转账");
  console.log("- 单次最多支持800个MATIC转账，600个代币转账");
  console.log("- 支持完整的以太坊生态代币");
  console.log("- 交易确认快速（~2秒）");
  console.log("- 环保低碳的PoS共识机制");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Polygon合约部署失败:", error);
    process.exit(1);
  });