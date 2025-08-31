// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BatchTransferETH
 * @dev 以太坊网络专用批量转账合约
 * 支持ETH和ERC20代币的批量转账
 */
contract BatchTransferETH is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 手续费配置 - 针对以太坊网络优化
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
    
    // 分享分用配置
    uint256 public referralRate = 10; // 分用比例 10% (可由owner修改)
    mapping(address => address) public userReferrers; // 用户 => 分享者映射

    // 事件
    event BatchETHTransfer(address indexed sender, uint256 successCount, uint256 failureCount, uint256 refundAmount);
    event BatchTokenTransfer(address indexed sender, address indexed token, uint256 successCount, uint256 failureCount);
    event TransferDetail(address indexed sender, uint256 indexed batchIndex, address to, uint256 amount, bool success, string failureReason);
    event FeeConfigUpdated(uint256 baseFee, uint256 perAddressFee, uint256 minFee, uint256 maxFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event ReferralReward(address indexed referrer, address indexed user, uint256 amount);
    event ReferralRateUpdated(uint256 oldRate, uint256 newRate);
    event ReferrerSet(address indexed user, address indexed referrer);

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
     * @dev 批量转账ETH (容错模式 - 跳过失败地址，继续执行)
     * @param transfers 转账信息数组
     * @param referrer 分享者地址 (可选，传入address(0)表示无分享者)
     * @return results 每个转账的执行结果
     */
    function batchTransferETH(Transfer[] calldata transfers, address referrer) 
        external 
        payable 
        nonReentrant 
        returns (TransferResult[] memory results)
    {
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 300, "Too many transfers for ETH");
        
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
            
            string memory failureReason = success ? "" : _getRevertReason(returnData);
            results[i] = TransferResult({
                to: transfers[i].to,
                amount: transfers[i].amount,
                success: success,
                failureReason: failureReason
            });
            
            // 触发详细转账结果事件
            emit TransferDetail(msg.sender, i, transfers[i].to, transfers[i].amount, success, failureReason);
            
            if (success) {
                successfulAmount += transfers[i].amount;
                successCount++;
            }
        }
        
        // 分配手续费（包括分享分用）
        _distributeFee(msg.sender, referrer, fee);
        
        // 计算需要退还的金额 (失败转账的金额 + 多余的ETH)
        uint256 failedAmount = totalAmount - successfulAmount;
        uint256 totalRefund = failedAmount + (msg.value - totalAmount - fee);
        
        // 退还失败转账和多余的ETH
        if (totalRefund > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: totalRefund}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchETHTransfer(msg.sender, successCount, transfers.length - successCount, totalRefund);
    }

    /**
     * @dev 批量转账ERC20代币 (容错模式 - 跳过失败地址，继续执行)
     * @param token 代币合约地址
     * @param transfers 转账信息数组
     * @param referrer 分享者地址 (可选，传入address(0)表示无分享者)
     * @return results 每个转账的执行结果
     */
    function batchTransferToken(address token, Transfer[] calldata transfers, address referrer) 
        external 
        payable 
        nonReentrant 
        returns (TransferResult[] memory results)
    {
        require(token != address(0), "Invalid token address");
        require(transfers.length > 0, "No transfers specified");
        require(transfers.length <= 200, "Too many transfers for tokens");
        

        
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
            try tokenContract.transferFrom(msg.sender, transfers[i].to, transfers[i].amount) {
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: true,
                    failureReason: ""
                });
                
                // 触发详细转账结果事件
                emit TransferDetail(msg.sender, i, transfers[i].to, transfers[i].amount, true, "");
                
                successfulAmount += transfers[i].amount;
                successCount++;
            } catch Error(string memory reason) {
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: false,
                    failureReason: reason
                });
                
                // 触发详细转账结果事件
                emit TransferDetail(msg.sender, i, transfers[i].to, transfers[i].amount, false, reason);
            } catch (bytes memory) {
                string memory failureReason = "Token transfer failed";
                results[i] = TransferResult({
                    to: transfers[i].to,
                    amount: transfers[i].amount,
                    success: false,
                    failureReason: failureReason
                });
                
                // 触发详细转账结果事件
                emit TransferDetail(msg.sender, i, transfers[i].to, transfers[i].amount, false, failureReason);
            }
        }
        
        // 分配手续费（包括分享分用）
        _distributeFee(msg.sender, referrer, fee);
        
        // 退还多余的ETH
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
     * @dev 设置分享分用比例 (仅所有者)
     * @param _referralRate 新的分用比例 (0-100)
     */
    function setReferralRate(uint256 _referralRate) external onlyOwner {
        require(_referralRate <= 100, "Referral rate cannot exceed 100%");
        uint256 oldRate = referralRate;
        referralRate = _referralRate;
        emit ReferralRateUpdated(oldRate, _referralRate);
    }





    /**
     * @dev 获取当前手续费配置
     */
    function getFeeConfig() external view returns (uint256, uint256, uint256, uint256) {
        return (baseFee, perAddressFee, minFee, maxFee);
    }

    /**
     * @dev 获取当前分享分用比例
     */
    function getReferralRate() external view returns (uint256) {
        return referralRate;
    }



    /**
     * @dev 获取用户的分享者
     * @param user 用户地址
     * @return 分享者地址
     */
    function getUserReferrer(address user) external view returns (address) {
        return userReferrers[user];
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
     * @dev 处理手续费分配（包括分享分用）
     * @param user 用户地址
     * @param paramReferrer 参数传入的分享者地址
     * @param totalFee 总手续费
     */
    function _distributeFee(address user, address paramReferrer, uint256 totalFee) private {
        address actualReferrer = userReferrers[user];
        
        // 如果用户还没有设置过分享者，且参数中有有效的分享者，则设置为第一次的分享者
        if (actualReferrer == address(0) && paramReferrer != address(0) && paramReferrer != user) {
            userReferrers[user] = paramReferrer;
            actualReferrer = paramReferrer;
            emit ReferrerSet(user, paramReferrer);
        }
        
        if (actualReferrer != address(0) && actualReferrer != user) {
            // 计算分享分用金额
            uint256 referralReward = (totalFee * referralRate) / 100;
            uint256 remainingFee = totalFee - referralReward;
            
            // 发送分享分用给分享人
            if (referralReward > 0) {
                (bool referralSuccess, ) = actualReferrer.call{value: referralReward}("");
                require(referralSuccess, "Referral reward transfer failed");
                emit ReferralReward(actualReferrer, user, referralReward);
            }
            
            // 发送剩余手续费给收集地址
            if (remainingFee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: remainingFee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            // 没有分享人或分享人是自己，全部手续费给收集地址
            if (totalFee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: totalFee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        }
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