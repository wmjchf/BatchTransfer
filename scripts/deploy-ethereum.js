const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署以太坊批量转账合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 设置手续费收集地址
  const feeCollectorAddress = process.env.FEE_COLLECTOR || deployer.address;
  console.log("手续费收集地址:", feeCollectorAddress);

  // 部署以太坊专用合约
  const BatchTransferETH = await ethers.getContractFactory("BatchTransferETH");
  const batchTransferETH = await BatchTransferETH.deploy(feeCollectorAddress);

  console.log("等待合约部署确认...");
  await batchTransferETH.waitForDeployment();

  const contractAddress = await batchTransferETH.getAddress();
  console.log("BatchTransferETH合约部署成功!");
  console.log("合约地址:", contractAddress);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("部署网络:", network.name, "ChainID:", network.chainId);

  // 获取手续费配置
  try {
    const feeConfig = await batchTransferETH.getFeeConfig();
    console.log("以太坊网络手续费配置:");
    console.log("- 基础费用:", ethers.formatEther(feeConfig[0]), "ETH");
    console.log("- 每地址费用:", ethers.formatEther(feeConfig[1]), "ETH");
    console.log("- 最低费用:", ethers.formatEther(feeConfig[2]), "ETH");
    console.log("- 最高费用:", ethers.formatEther(feeConfig[3]), "ETH");

    // 计算示例费用
    const fee50 = await batchTransferETH.calculateFee(50);
    const fee100 = await batchTransferETH.calculateFee(100);
    console.log("费用示例:");
    console.log("- 50个地址:", ethers.formatEther(fee50), "ETH");
    console.log("- 100个地址:", ethers.formatEther(fee100), "ETH");
  } catch (error) {
    console.log("获取手续费配置失败:", error.message);
  }

  // 获取预设的代币地址
  try {
    console.log("\n预设的常用代币地址:");
    console.log("- USDT:", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    console.log("- USDC:", "0xA0b86a33E6441E13C7E98E10c174F8e5B5D3A1B5");
    console.log("- DAI:", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
    console.log("- WETH:", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  } catch (error) {
    console.log("获取代币地址失败:", error.message);
  }

  // 保存部署信息
  const deploymentInfo = {
    network: "ethereum",
    chainId: network.chainId.toString(),
    contractName: "BatchTransferETH",
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollectorAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasLimits: {
      ethTransfer: 300,
      tokenTransfer: 200
    }
  };

  console.log("\n=== 以太坊部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== 使用说明 ===");
  console.log("1. 计算手续费: calculateFee(addressCount)");
  console.log("2. 批量转账ETH: batchTransferETH(transfers) - 返回执行结果");
  console.log("3. 批量转账ERC20: batchTransferToken(tokenAddress, transfers) - 返回执行结果");
  console.log("4. 容错机制: 自动跳过失败地址，继续执行成功转账");
  console.log("5. 智能退款: 失败转账的资金自动退还");
  
  console.log("\n=== 验证合约命令 ===");
  console.log(`npx hardhat verify --network ethereum ${contractAddress} "${feeCollectorAddress}"`);

  console.log("\n=== 重要提醒 ===");
  console.log("- 以太坊网络gas费较高，建议在gas费低谷时段使用");
  console.log("- 单次最多支持300个ETH转账，200个代币转账");
  console.log("- 使用前请在测试网验证功能");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("以太坊合约部署失败:", error);
    process.exit(1);
  });