// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BatchTransfer
 * @dev 支持原生代币和ERC20代币的批量转账合约，包含多链手续费机制
 */
contract BatchTransfer is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 手续费配置结构体
    struct FeeConfig {
        uint256 baseFee;        // 基础手续费
        uint256 perAddressFee;  // 每个地址的手续费
        uint256 minFee;         // 最低手续费
        uint256 maxFee;         // 最高手续费
    }

    // 转账信息结构体
    struct Transfer {
        address to;
        uint256 amount;
    }

    // 各链的手续费配置
    mapping(uint256 => FeeConfig) public chainFees;
    
    // 手续费收集地址
    address public feeCollector;
    
    // 支持的代币白名单 (可选)
    mapping(address => bool) public supportedTokens;
    bool public whitelistEnabled = false;

    // 事件
    event BatchNativeTransfer(address indexed sender, uint256 totalAmount, uint256 recipientCount, uint256 fee);
    event BatchTokenTransfer(address indexed sender, address indexed token, uint256 totalAmount, uint256 recipientCount, uint256 fee);
    event FeeConfigUpdated(uint256 indexed chainId, FeeConfig config);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event WhitelistUpdated(address indexed token, bool supported);

    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
        
        // 初始化当前链的手续费配置
        _initializeChainFees();
    }

    /**
     * @dev 初始化不同链的手续费配置
     */
    function _initializeChainFees() private {
        uint256 chainId = block.chainid;
        
        if (chainId == 1) { // Ethereum Mainnet
            chainFees[chainId] = FeeConfig({
                baseFee: 0.0003 ether,
                perAddressFee: 0.000006 ether,
                minFee: 0.0005 ether,
                maxFee: 0.009 ether
            });
        } else if (chainId == 56) { // BSC Mainnet
            chainFees[chainId] = FeeConfig({
                baseFee: 0.002 ether,
                perAddressFee: 0.00004 ether,
                minFee: 0.0032 ether,
                maxFee: 0.06 ether
            });
        } else if (chainId == 137) { // Polygon Mainnet
            chainFees[chainId] = FeeConfig({
                baseFee: 0.5 ether,
                perAddressFee: 0.01 ether,
                minFee: 0.8 ether,
                maxFee: 15 ether
            });
        } else if (chainId == 42161) { // Arbitrum One
            chainFees[chainId] = FeeConfig({
                baseFee: 0.0003 ether,
                perAddressFee: 0.000006 ether,
                minFee: 0.0005 ether,
                maxFee: 0.009 ether
            });
        } else {
            // 默认配置 (测试网等)
            chainFees[chainId] = FeeConfig({
                baseFee: 0.001 ether,
                perAddressFee: 0.00001 ether,
                minFee: 0.002 ether,
                maxFee: 0.02 ether
            });
        }
    }

    /**
     * @dev 计算批量转账手续费
     * @param addressCount 转账地址数量
     * @return 所需支付的手续费
     */
    function calculateFee(uint256 addressCount) public view returns (uint256) {
        require(addressCount > 0, "Address count must be greater than 0");
        
        FeeConfig memory config = chainFees[block.chainid];
        require(config.baseFee > 0, "Fee config not set for this chain");
        
        uint256 totalFee = config.baseFee + (addressCount * config.perAddressFee);
        
        if (totalFee < config.minFee) return config.minFee;
        if (totalFee > config.maxFee) return config.maxFee;
        
        return totalFee;
    }

    /**
     * @dev 批量转账原生代币
     * @param transfers 转账信息数组
     */
    function batchTransferNative(Transfer[] calldata transfers) 
        external 
        payable 
        nonReentrant 
    {
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 500, "Too many transfers"); // 防止gas超限
        
        uint256 fee = calculateFee(transfers.length);
        uint256 totalAmount = 0;
        
        // 计算总转账金额
        for (uint256 i = 0; i < transfers.length; i++) {
            require(transfers[i].to != address(0), "Invalid recipient address");
            require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
            totalAmount += transfers[i].amount;
        }
        
        // 检查支付金额是否足够
        require(msg.value >= totalAmount + fee, "Insufficient payment");
        
        // 执行批量转账
        for (uint256 i = 0; i < transfers.length; i++) {
            (bool success, ) = transfers[i].to.call{value: transfers[i].amount}("");
            require(success, string(abi.encodePacked("Transfer failed for address: ", _addressToString(transfers[i].to))));
        }
        
        // 转移手续费给收集地址
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // 退还多余的ETH
        uint256 remaining = msg.value - totalAmount - fee;
        if (remaining > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: remaining}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchNativeTransfer(msg.sender, totalAmount, transfers.length, fee);
    }

    /**
     * @dev 批量转账ERC20代币
     * @param token 代币合约地址
     * @param transfers 转账信息数组
     */
    function batchTransferToken(address token, Transfer[] calldata transfers) 
        external 
        payable 
        nonReentrant 
    {
        require(token != address(0), "Invalid token address");
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 500, "Too many transfers");
        
        // 检查代币白名单 (如果启用)
        if (whitelistEnabled) {
            require(supportedTokens[token], "Token not supported");
        }
        
        uint256 fee = calculateFee(transfers.length);
        require(msg.value >= fee, "Insufficient fee payment");
        
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        // 计算总转账金额
        for (uint256 i = 0; i < transfers.length; i++) {
            require(transfers[i].to != address(0), "Invalid recipient address");
            require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
            totalAmount += transfers[i].amount;
        }
        
        // 检查用户授权和余额
        require(tokenContract.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient token allowance");
        require(tokenContract.balanceOf(msg.sender) >= totalAmount, "Insufficient token balance");
        
        // 执行批量转账
        for (uint256 i = 0; i < transfers.length; i++) {
            tokenContract.safeTransferFrom(msg.sender, transfers[i].to, transfers[i].amount);
        }
        
        // 转移手续费给收集地址
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // 退还多余的ETH
        uint256 remaining = msg.value - fee;
        if (remaining > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: remaining}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchTokenTransfer(msg.sender, token, totalAmount, transfers.length, fee);
    }

    /**
     * @dev 设置手续费配置 (仅所有者)
     * @param chainId 链ID
     * @param config 手续费配置
     */
    function setFeeConfig(uint256 chainId, FeeConfig calldata config) external onlyOwner {
        require(config.baseFee > 0, "Base fee must be greater than 0");
        require(config.minFee >= config.baseFee, "Min fee must be >= base fee");
        require(config.maxFee >= config.minFee, "Max fee must be >= min fee");
        
        chainFees[chainId] = config;
        emit FeeConfigUpdated(chainId, config);
    }

    /**
     * @dev 设置手续费收集地址 (仅所有者)
     * @param _feeCollector 新的手续费收集地址
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }

    /**
     * @dev 设置代币白名单状态 (仅所有者)
     * @param enabled 是否启用白名单
     */
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
    }

    /**
     * @dev 更新代币白名单 (仅所有者)
     * @param token 代币地址
     * @param supported 是否支持
     */
    function updateTokenWhitelist(address token, bool supported) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = supported;
        emit WhitelistUpdated(token, supported);
    }

    /**
     * @dev 批量更新代币白名单 (仅所有者)
     * @param tokens 代币地址数组
     * @param supported 是否支持数组
     */
    function batchUpdateTokenWhitelist(address[] calldata tokens, bool[] calldata supported) external onlyOwner {
        require(tokens.length == supported.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token address");
            supportedTokens[tokens[i]] = supported[i];
            emit WhitelistUpdated(tokens[i], supported[i]);
        }
    }

    /**
     * @dev 紧急提取合约中的ETH (仅所有者)
     */
    function emergencyWithdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev 紧急提取合约中的代币 (仅所有者)
     * @param token 代币地址
     */
    function emergencyWithdrawToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        tokenContract.safeTransfer(owner(), balance);
    }

    /**
     * @dev 获取当前链的手续费配置
     * @return 当前链的手续费配置
     */
    function getCurrentChainFeeConfig() external view returns (FeeConfig memory) {
        return chainFees[block.chainid];
    }

    /**
     * @dev 地址转字符串辅助函数
     * @param addr 地址
     * @return 地址字符串
     */
    function _addressToString(address addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @dev 接收ETH函数
     */
    receive() external payable {}
}