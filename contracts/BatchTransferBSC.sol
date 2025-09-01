// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BatchTransferBSC
 * @dev BSC网络专用批量转账合约
 * 支持BNB和BEP20代币的批量转账
 */
contract BatchTransferBSC is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 手续费配置 - 针对BSC网络优化
    uint256 public baseFee = 0.002 ether;          // 基础手续费 ~$0.5
    uint256 public perAddressFee = 0.00004 ether;  // 每个地址费用 ~$0.01
    uint256 public minFee = 0.0032 ether;          // 最低手续费 ~$0.8
    uint256 public maxFee = 0.06 ether;            // 最高手续费 ~$15

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
    


    // 常用代币地址 (BSC主网)
    address public constant USDT = 0x55d398326f99059fF775485246999027B3197955;  // BSC-USD
    address public constant USDC = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;  // USD Coin
    address public constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;  // BUSD
    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;  // Wrapped BNB
    address public constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;  // PancakeSwap Token

    // 事件
    event BatchBNBTransfer(address indexed sender, uint256 successCount, uint256 failureCount, uint256 refundAmount);
    event BatchTokenTransfer(address indexed sender, address indexed token, uint256 successCount, uint256 failureCount);
    event FeeConfigUpdated(uint256 baseFee, uint256 perAddressFee, uint256 minFee, uint256 maxFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    event UnexpectedBNBWithdrawn(uint256 amount);
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
     * @dev 批量转账BNB (容错模式 - 跳过失败地址，继续执行)
     * @param transfers 转账信息数组
     * @return results 每个转账的执行结果
     */
    function batchTransferBNB(Transfer[] calldata transfers) 
        external 
        payable 
        nonReentrant 
        returns (TransferResult[] memory results)
    {
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 500, "Too many transfers"); // BSC gas费低，可以支持更多
        
        uint256 fee = calculateFee(transfers.length);
        uint256 totalAmount = 0;
        
        // 预先验证和计算总金额
        for (uint256 i = 0; i < transfers.length; i++) {
            require(transfers[i].to != address(0), "Invalid recipient address");
            require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
            totalAmount += transfers[i].amount;
        }
        
        // 检查支付金额是否足够
        require(msg.value >= totalAmount + fee, "Insufficient payment");
        
        // 初始化结果数组
        results = new TransferResult[](transfers.length);
        uint256 successfulAmount = 0;
        uint256 successCount = 0;
        
        // 执行批量转账，记录每个结果
        for (uint256 i = 0; i < transfers.length; i++) {
            (bool success, bytes memory returnData) = transfers[i].to.call{value: transfers[i].amount}("");
            
            results[i] = TransferResult({
                to: transfers[i].to,
                amount: transfers[i].amount,
                success: success,
                failureReason: success ? "" : _getRevertReason(returnData)
            });
            
            if (success) {
                successfulAmount += transfers[i].amount;
                successCount++;
            }
        }
        
        // 转移手续费给收集地址
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // 计算需要退还的金额 (失败转账的金额 + 多余的BNB)
        uint256 failedAmount = totalAmount - successfulAmount;
        uint256 totalRefund = failedAmount + (msg.value - totalAmount - fee);
        
        // 退还失败转账和多余的BNB
        if (totalRefund > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: totalRefund}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchBNBTransfer(msg.sender, successCount, transfers.length - successCount, totalRefund);
    }

    /**
     * @dev 批量转账BEP20代币 (容错模式 - 跳过失败地址，继续执行)
     * @param token 代币合约地址
     * @param transfers 转账信息数组
     * @return results 每个转账的执行结果
     */
    function batchTransferToken(address token, Transfer[] calldata transfers) 
        external 
        payable 
        nonReentrant 
        returns (TransferResult[] memory results)
    {
        require(token != address(0), "Invalid token address");
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 400, "Too many transfers for tokens");
        

        
        uint256 fee = calculateFee(transfers.length);
        require(msg.value >= fee, "Insufficient fee payment");
        
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        // 预先验证和计算总金额
        for (uint256 i = 0; i < transfers.length; i++) {
            require(transfers[i].to != address(0), "Invalid recipient address");
            require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
            totalAmount += transfers[i].amount;
        }
        
        // 检查用户授权和余额
        require(tokenContract.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient token allowance");
        require(tokenContract.balanceOf(msg.sender) >= totalAmount, "Insufficient token balance");
        
        // 初始化结果数组
        results = new TransferResult[](transfers.length);
        uint256 successfulAmount = 0;
        uint256 successCount = 0;
        
        // 执行批量转账，记录每个结果
        for (uint256 i = 0; i < transfers.length; i++) {
            try this._safeTransferFromHelper(tokenContract, msg.sender, transfers[i].to, transfers[i].amount) {
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: true,
                    failureReason: ""
                });
                successfulAmount += transfers[i].amount;
                successCount++;
            } catch Error(string memory reason) {
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: false,
                    failureReason: reason
                });
            } catch (bytes memory) {
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: false,
                    failureReason: "Token transfer failed"
                });
            }
        }
        
        // 转移手续费
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // 退还多余的BNB
        uint256 remaining = msg.value - fee;
        if (remaining > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: remaining}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchTokenTransfer(msg.sender, token, successCount, transfers.length - successCount);
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
     * @dev 获取BSC常用代币地址
     */
    function getCommonTokens() external pure returns (address[5] memory) {
        return [USDT, USDC, BUSD, WBNB, CAKE];
    }

    /**
     * @dev 提取意外接收的BNB (正常业务流程不会产生余额)
     */
    function withdrawUnexpectedBNB() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No unexpected BNB to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit UnexpectedBNBWithdrawn(balance);
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
     * @dev SafeTransferFrom辅助函数 - 用于try-catch
     * @param token ERC20代币合约
     * @param from 发送方地址
     * @param to 接收方地址
     * @param amount 转账数量
     */
    function _safeTransferFromHelper(IERC20 token, address from, address to, uint256 amount) external {
        require(msg.sender == address(this), "Only self call allowed");
        token.safeTransferFrom(from, to, amount);
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
     * @dev 接收BNB函数
     */
    receive() external payable {}
}