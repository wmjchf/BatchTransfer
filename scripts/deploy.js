const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署BatchTransfer合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // 设置手续费收集地址（可以设置为部署者地址或其他地址）
  const feeCollectorAddress = process.env.FEE_COLLECTOR || deployer.address;
  console.log("手续费收集地址:", feeCollectorAddress);

  // 部署合约
  const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
  const batchTransfer = await BatchTransfer.deploy(feeCollectorAddress);

  console.log("等待合约部署确认...");
  await batchTransfer.waitForDeployment();

  const contractAddress = await batchTransfer.getAddress();
  console.log("BatchTransfer合约部署成功!");
  console.log("合约地址:", contractAddress);

  // 获取当前网络信息
  const network = await ethers.provider.getNetwork();
  console.log("部署网络:", network.name, "ChainID:", network.chainId);

  // 获取当前链的手续费配置
  try {
    const feeConfig = await batchTransfer.getCurrentChainFeeConfig();
    console.log("当前链手续费配置:");
    console.log("- 基础费用:", ethers.formatEther(feeConfig.baseFee));
    console.log("- 每地址费用:", ethers.formatEther(feeConfig.perAddressFee));
    console.log("- 最低费用:", ethers.formatEther(feeConfig.minFee));
    console.log("- 最高费用:", ethers.formatEther(feeConfig.maxFee));
  } catch (error) {
    console.log("获取手续费配置失败:", error.message);
  }

  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollectorAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  console.log("\n=== 部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 如果是测试网络，添加一些常用代币到白名单
  const chainId = Number(network.chainId);
  if ([5, 97, 80001, 421613].includes(chainId)) { // Goerli, BSC Testnet, Mumbai, Arbitrum Goerli
    console.log("\n检测到测试网络，添加测试代币到白名单...");
    
    try {
      // 这里可以添加一些测试网络的常用代币地址
      const testTokens = getTestTokensForChain(chainId);
      
      if (testTokens.length > 0) {
        const supported = new Array(testTokens.length).fill(true);
        const tx = await batchTransfer.batchUpdateTokenWhitelist(testTokens, supported);
        await tx.wait();
        console.log("测试代币已添加到白名单");
      }
    } catch (error) {
      console.log("添加测试代币到白名单失败:", error.message);
    }
  }

  console.log("\n=== 使用说明 ===");
  console.log("1. 计算手续费: calculateFee(addressCount)");
  console.log("2. 批量转账原生代币: batchTransferNative(transfers)");
  console.log("3. 批量转账ERC20代币: batchTransferToken(tokenAddress, transfers)");
  console.log("4. 合约验证命令:");
  console.log(`   npx hardhat verify --network ${network.name} ${contractAddress} "${feeCollectorAddress}"`);
}

function getTestTokensForChain(chainId) {
  const testTokens = {
    5: [], // Goerli
    97: [], // BSC Testnet
    80001: [], // Mumbai
    421613: [] // Arbitrum Goerli
  };

  return testTokens[chainId] || [];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });