// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract NTYE is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    IERC721 public nftContract;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public mintPrice = 720000000000000;
    uint256 public constant MINT_AMOUNT = 850 * 10**18;
    bool public successful = false;
    uint256 public mintByNFTEndTime;
    uint256 public mintEndTime;
    uint256 public refRewardPercent = 10;
    bool public tradingOpened;

    mapping(uint256 => uint256) public tokenIdMinted;
    mapping(address => uint256) public userMintedETH;
    
    constructor(
        address initialOwner, 
        address _developerVault,
        address _communityVault,
        address _vitalik,
        address _nftContract
        )
        // ERC20("Next Ten Years of Ethereum", "NTYE")
        ERC20("test token", "TEST")
        Ownable(initialOwner)
    {
        _mint(address(this), MAX_SUPPLY * 5 / 100);
        _mint(_developerVault, MAX_SUPPLY * 5 / 100);
        _mint(_communityVault, MAX_SUPPLY * 45 / 1000);
        _mint(_vitalik, MAX_SUPPLY * 5 / 1000);

        nftContract = IERC721(_nftContract);
        mintByNFTEndTime = block.timestamp + 30 days;
        mintEndTime = block.timestamp + 90 days;

        // test
        mintByNFTEndTime = block.timestamp + 1 days;
        mintEndTime = block.timestamp + 2 days;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        require(_mintPrice > mintPrice, "New mint price must be higher than current price");
        mintPrice = _mintPrice;
    }

    function setRefRewardPercent(uint256 newPercent) external onlyOwner {
        require(newPercent <= 10, "refRewardPercent cannot exceed 10%");
        refRewardPercent = newPercent;
    }

    function mintByNFT(uint256[] memory tokenIds, uint256 quantity, address refAddress) payable external {
        require(!successful, "Experiment already successful");
        require(block.timestamp <= mintByNFTEndTime, "Minting has ended");
        require(tokenIds.length > 0, "No token IDs provided");
        require(quantity > 0, "Mint quantity must be greater than zero");
        uint256 total = tokenIds.length * quantity * mintPrice;
        require(msg.value >= total, "Insufficient ETH sent");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(nftContract.ownerOf(tokenIds[i]) == msg.sender, "Not the owner of NFT");
            require(tokenIdMinted[tokenIds[i]] + quantity <= 10, "TokenId fully minted");
            tokenIdMinted[tokenIds[i]] += quantity;
        }

        uint256 amount = tokenIds.length * quantity * MINT_AMOUNT;
        _processMint(amount, refAddress);
    }

    function mint(uint256 quantity, address refAddress) payable external {
        require(!successful, "Experiment already successful");
        require(block.timestamp > mintByNFTEndTime, "Mint not started");
        require(block.timestamp <= mintEndTime, "Minting has ended");
        require(quantity > 0, "Mint quantity must be greater than zero");
        uint256 total = quantity * mintPrice;
        require(msg.value >= total, "Insufficient ETH sent");
        
        uint256 amount = quantity * MINT_AMOUNT;
        _processMint(amount, refAddress);
    }

    function _processMint(uint256 amount, address refAddress) internal {
        if(totalSupply() + amount > MAX_SUPPLY) {
            amount = (MAX_SUPPLY > totalSupply())? MAX_SUPPLY - totalSupply() : 0;
        }
        if(refAddress == address(0)) {
            _mint(msg.sender, amount);
        } else {
            uint256 rewardAmount = amount * refRewardPercent / 100;
            _mint(msg.sender, amount - rewardAmount);
            _mint(refAddress, rewardAmount);
        }

        userMintedETH[msg.sender] += msg.value;

        if(totalSupply() >= MAX_SUPPLY) {
            successful = true;
            openTrading();
        }
    }

    function _update(address from, address to, uint256 value) internal override {
        require(
            successful || from == address(0),
            "Transfers disabled until mint is successful"
        );
        super._update(from, to, value);
    }

    function refund() external nonReentrant {
        require(block.timestamp > mintEndTime, "Mint period not ended");
        require(!successful, "Mint was successful, refund not allowed");

        uint256 amount = userMintedETH[msg.sender];
        require(amount > 0, "No ETH to refund");

        userMintedETH[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund transfer failed");
    }

    function setSuccessful() external onlyOwner {
        require(!successful, "Already successful");
        require(block.timestamp > mintEndTime, "Can only set after mintEndTime");
        successful = true;
    }

    function openTrading() public {
        require(successful,"Mint not yet successful");
        require(!tradingOpened, "Already opened");
        tradingOpened = true;

        // IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3);    // test sepolia
        _approve(address(this), address(uniswapV2Router), MAX_SUPPLY);
        address uniswapV2Pair = IUniswapV2Factory(uniswapV2Router.factory()).getPair(address(this), uniswapV2Router.WETH());
        if (uniswapV2Pair == address(0)) {
            uniswapV2Pair = IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH());
        }

        uniswapV2Router.addLiquidityETH{value: address(this).balance}(address(this),balanceOf(address(this)),0,0,address(0),block.timestamp);
    }

    receive() external payable {}

}