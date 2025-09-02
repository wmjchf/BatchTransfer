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
    
    // Gas限制配置（优化后）
    uint256 public constant ETH_TRANSFER_GAS = 22000;   // 每次ETH转账的估算gas（优化后）
    uint256 public constant TOKEN_TRANSFER_GAS = 60000; // 每次代币转账的估算gas（优化后）
    uint256 public constant BASE_GAS = 45000;           // 基础gas消耗（进一步优化）
    uint256 public gasLimitRatio = 3;                   // block.gaslimit的倒数（默认1/3）

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
    
    // 统一的待提取余额映射（包括转账失败和推荐奖励）
    mapping(address => uint256) public pendingWithdrawals; // 用户 => 待提取余额

    // 事件
    event BatchETHTransfer(address indexed sender, uint256 successCount, uint256 failureCount, uint256 refundAmount);
    event BatchTokenTransfer(address indexed sender, address indexed token, uint256 successCount, uint256 failureCount);
    event TransferDetail(address indexed sender, uint256 indexed batchIndex, address to, uint256 amount, bool success, string failureReason);
    event FeeConfigUpdated(uint256 baseFee, uint256 perAddressFee, uint256 minFee, uint256 maxFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event ReferralReward(address indexed referrer, address indexed user, uint256 amount);
    event ReferralRateUpdated(uint256 oldRate, uint256 newRate);
    event ReferrerSet(address indexed user, address indexed referrer);
    event WithdrawalSuccess(address indexed user, uint256 amount);
    event BalanceAdded(address indexed user, uint256 amount, string reason);



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
        
        uint256 totalFee;
        unchecked {
            totalFee = baseFee + (addressCount * perAddressFee);
        }
        
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
        _checkGasLimit(transfers.length, true);
        
        uint256 fee = calculateFee(transfers.length);
        uint256 totalAmount = 0;
        
        // 预先验证和计算总金额
        unchecked {
            for (uint256 i = 0; i < transfers.length; ++i) {
                require(transfers[i].to != address(0), "Invalid recipient address");
                require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
                totalAmount += transfers[i].amount;
            }
        }
        
        // 检查支付金额是否足够
        require(msg.value >= totalAmount + fee, "Insufficient payment");
        
        // 初始化结果数组
        results = new TransferResult[](transfers.length);
        uint256 successfulAmount = 0;
        uint256 successCount = 0;
        
        // 执行批量转账，记录每个结果
        unchecked {
            for (uint256 i = 0; i < transfers.length; ++i) {
                address to = transfers[i].to;
                uint256 amount = transfers[i].amount;
                (bool success, bytes memory returnData) = to.call{value: amount}("");
                
                if (success) {
                    // 转账成功
                    successfulAmount += amount;
                    ++successCount;
                    
                    results[i] = TransferResult(to, amount, true, "");
                    emit TransferDetail(msg.sender, i, to, amount, true, "");
                } else {
                    // 转账失败，存储到待提取余额中
                    pendingWithdrawals[to] += amount;
                    
                    string memory failureReason = _getRevertReason(returnData);
                    results[i] = TransferResult(to, amount, false, failureReason);
                    
                    emit TransferDetail(msg.sender, i, to, amount, false, failureReason);
                    emit BalanceAdded(to, amount, "Failed transfer");
                }
            }
        }
        
        // 分配手续费（包括分享分用）
        _distributeFee(msg.sender, referrer, fee);
        
        // 将多余的ETH也存储到待提取余额中，避免退款时的DoS攻击
        uint256 refundAmount = msg.value - totalAmount - fee;
        if (refundAmount > 0) {
            pendingWithdrawals[msg.sender] += refundAmount;
            emit BalanceAdded(msg.sender, refundAmount, "Refund");
        }
        
        emit BatchETHTransfer(msg.sender, successCount, transfers.length - successCount, refundAmount);
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
        _checkGasLimit(transfers.length, false);
        

        
        uint256 fee = calculateFee(transfers.length);
        require(msg.value >= fee, "Insufficient fee payment");
        
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        // 预先验证和计算总金额
        unchecked {
            for (uint256 i = 0; i < transfers.length; ++i) {
                require(transfers[i].to != address(0), "Invalid recipient address");
                require(transfers[i].amount > 0, "Transfer amount must be greater than 0");
                totalAmount += transfers[i].amount;
            }
        }
        
        // 检查用户授权和余额
        require(tokenContract.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient token allowance");
        require(tokenContract.balanceOf(msg.sender) >= totalAmount, "Insufficient token balance");
        
        // 初始化结果数组
        results = new TransferResult[](transfers.length);
        uint256 successfulAmount = 0;
        uint256 successCount = 0;
        
        // 执行批量转账，记录每个结果
        unchecked {
            for (uint256 i = 0; i < transfers.length; ++i) {
                address to = transfers[i].to;
                uint256 amount = transfers[i].amount;
                
                try this._safeTransferFromHelper(tokenContract, msg.sender, to, amount) {
                    results[i] = TransferResult(to, amount, true, "");
                    emit TransferDetail(msg.sender, i, to, amount, true, "");
                    
                    successfulAmount += amount;
                    ++successCount;
                } catch Error(string memory reason) {
                    results[i] = TransferResult(to, amount, false, reason);
                    emit TransferDetail(msg.sender, i, to, amount, false, reason);
                } catch (bytes memory) {
                    results[i] = TransferResult(to, amount, false, "Token transfer failed");
                    emit TransferDetail(msg.sender, i, to, amount, false, "Token transfer failed");
                }
            }
        }
        
        // 分配手续费（包括分享分用）
        _distributeFee(msg.sender, referrer, fee);
        
        // 将多余的ETH存储到待提取余额中，避免退款时的DoS攻击
        uint256 remaining = msg.value - fee;
        if (remaining > 0) {
            pendingWithdrawals[msg.sender] += remaining;
            emit BalanceAdded(msg.sender, remaining, "Refund");
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
     * @dev 设置gas限制比例 (仅所有者)
     * @param _gasLimitRatio 新的gas限制比例倒数 (2-10，表示1/2到1/10)
     */
    function setGasLimitRatio(uint256 _gasLimitRatio) external onlyOwner {
        require(_gasLimitRatio >= 2 && _gasLimitRatio <= 10, "Gas limit ratio must be between 2 and 10");
        gasLimitRatio = _gasLimitRatio;
    }

    /**
     * @dev 提取待提取余额
     * 包括失败转账和推荐奖励的统一提取功能
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No balance to withdraw");

        // 先重置余额，防止重入攻击
        pendingWithdrawals[msg.sender] = 0;
        
        // 转账给用户
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");
        
        emit WithdrawalSuccess(msg.sender, amount);
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
     * @dev 获取待提取的余额
     * 包括失败转账和推荐奖励的统一查询
     * @param user 用户地址
     * @return 待提取的总余额
     */
    function getPendingWithdrawal(address user) external view returns (uint256) {
        return pendingWithdrawals[user];
    }

    /**
     * @dev 检查gas限制
     * @param transferCount 转账数量
     * @param isETH 是否为ETH转账
     */
    function _checkGasLimit(uint256 transferCount, bool isETH) private view {
        uint256 estimatedGas = BASE_GAS + (transferCount * (isETH ? ETH_TRANSFER_GAS : TOKEN_TRANSFER_GAS));
        uint256 maxAllowedGas = block.gaslimit / gasLimitRatio;
        require(estimatedGas <= maxAllowedGas, "Too many transfers for current gas limit");
    }

    /**
     * @dev 计算最大可执行的转账数量
     * @param isETH 是否为ETH转账
     * @return 最大转账数量
     */
    function getMaxTransferCount(bool isETH) external view returns (uint256) {
        uint256 maxAllowedGas = block.gaslimit / gasLimitRatio;
        if (maxAllowedGas <= BASE_GAS) return 0;
        
        uint256 availableGas = maxAllowedGas - BASE_GAS;
        uint256 gasPerTransfer = isETH ? ETH_TRANSFER_GAS : TOKEN_TRANSFER_GAS;
        
        return availableGas / gasPerTransfer;
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
            
            // 累积分享分用到待提取余额
            if (referralReward > 0) {
                pendingWithdrawals[actualReferrer] += referralReward;
                emit ReferralReward(actualReferrer, user, referralReward);
                emit BalanceAdded(actualReferrer, referralReward, "Referral reward");
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
     * @dev 接收ETH函数
     */
    receive() external payable {}
}