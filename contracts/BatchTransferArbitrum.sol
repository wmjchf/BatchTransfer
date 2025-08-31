// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BatchTransferArbitrum
 * @dev Arbitrum网络专用批量转账合约
 * 支持ETH和Arbitrum ERC20代币的批量转账
 */
contract BatchTransferArbitrum is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 手续费配置 - 针对Arbitrum网络优化
    uint256 public baseFee = 0.0003 ether;        // 基础手续费 ~$0.5
    uint256 public perAddressFee = 0.000006 ether; // 每个地址费用 ~$0.01
    uint256 public minFee = 0.0005 ether;         // 最低手续费 ~$0.8
    uint256 public maxFee = 0.009 ether;          // 最高手续费 ~$15

    // 转账信息结构体
    struct Transfer {
        address to;
        uint256 amount;
    }

    // 转账结果结构体
    struct TransferResult {
        address to;
        uint256 amount;
        bool success;
        string failureReason;
    }

    // 手续费收集地址
    address public feeCollector;
    


    // 常用代币地址 (Arbitrum One)
    address public constant USDT = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;  // Tether USD
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;  // USD Coin
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;  // Wrapped Ether
    address public constant ARB = 0x912CE59144191C1204E64559FE8253a0e49E6548;   // Arbitrum Token
    address public constant DAI = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;   // Dai Stablecoin

    // 事件
    event BatchETHTransfer(address indexed sender, uint256 successCount, uint256 failureCount, uint256 refundAmount);
    event BatchTokenTransfer(address indexed sender, address indexed token, uint256 successCount, uint256 failureCount);
    event FeeConfigUpdated(uint256 baseFee, uint256 perAddressFee, uint256 minFee, uint256 maxFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    event UnexpectedETHWithdrawn(uint256 amount);
    event UnexpectedTokenWithdrawn(address indexed token, uint256 amount);

    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }

    /**
     * @dev 计算批量转账手续费
     * @param addressCount 转账地址数量
     * @return 所需支付的手续费
     */
    function calculateFee(uint256 addressCount) public view returns (uint256) {
        require(addressCount > 0, "Address count must be greater than 0");
        
        uint256 totalFee = baseFee + (addressCount * perAddressFee);
        
        if (totalFee < minFee) return minFee;
        if (totalFee > maxFee) return maxFee;
        
        return totalFee;
    }

    /**
     * @dev 批量转账ETH (在Arbitrum上)
     * @param transfers 转账信息数组
     */
    function batchTransferETH(Transfer[] calldata transfers) 
        external 
        payable 
        nonReentrant 
    {
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 400, "Too many transfers"); // Arbitrum gas费较低，可支持更多
        
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
            require(success, string(abi.encodePacked("ETH transfer failed for address: ", _addressToString(transfers[i].to))));
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
        
        emit BatchETHTransfer(msg.sender, totalAmount, transfers.length, fee);
    }

    /**
     * @dev 批量转账Arbitrum ERC20代币
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
        require(transfers.length <= 300, "Too many transfers for tokens");
        

        
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
        
        // 转移手续费
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
     */
    function setFeeConfig(
        uint256 _baseFee,
        uint256 _perAddressFee,
        uint256 _minFee,
        uint256 _maxFee
    ) external onlyOwner {
        require(_baseFee > 0, "Base fee must be greater than 0");
        require(_minFee >= _baseFee, "Min fee must be >= base fee");
        require(_maxFee >= _minFee, "Max fee must be >= min fee");
        
        baseFee = _baseFee;
        perAddressFee = _perAddressFee;
        minFee = _minFee;
        maxFee = _maxFee;
        
        emit FeeConfigUpdated(_baseFee, _perAddressFee, _minFee, _maxFee);
    }

    /**
     * @dev 设置手续费收集地址 (仅所有者)
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }



    /**
     * @dev 获取当前手续费配置
     */
    function getFeeConfig() external view returns (uint256, uint256, uint256, uint256) {
        return (baseFee, perAddressFee, minFee, maxFee);
    }

    /**
     * @dev 获取Arbitrum常用代币地址
     */
    function getCommonTokens() external pure returns (address[5] memory) {
        return [USDT, USDC, WETH, ARB, DAI];
    }

    /**
     * @dev 提取意外接收的ETH (正常业务流程不会产生余额)
     */
    function withdrawUnexpectedETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No unexpected ETH to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit UnexpectedETHWithdrawn(balance);
    }

    /**
     * @dev 提取意外接收的代币 (正常业务流程不会产生代币余额)
     */
    function withdrawUnexpectedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No unexpected tokens to withdraw");
        
        tokenContract.safeTransfer(owner(), balance);
        
        emit UnexpectedTokenWithdrawn(token, balance);
    }

    /**
     * @dev 地址转字符串辅助函数
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
     * @dev 解析revert原因
     */
    function _getRevertReason(bytes memory returnData) private pure returns (string memory) {
        if (returnData.length < 68) return "Transaction reverted silently";
        
        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
    }

    /**
     * @dev 接收ETH函数
     */
    receive() external payable {}
}