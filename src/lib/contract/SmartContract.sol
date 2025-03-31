// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PlatformToken
 * @dev ERC20 token for the platform with governance capabilities
 */
contract PlatformToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Fractional DAO Token", "FUNDFA") Ownable(initialOwner) {
        // Initial supply of 1,000,000,000 tokens
        _mint(initialOwner, 1_000_000_000 * 10**decimals());
    }
    
    /**
     * @dev Allows users to buy platform tokens with ETH
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        // 1 ETH = 1000 tokens (adjust as needed)
        uint256 tokenAmount = msg.value * 1000 / 1 ether;
        
        _mint(msg.sender, tokenAmount);
    }
    
    /**
     * @dev Cast a weighted vote on a proposal
     * @param proposalId Identifier of the proposal
     * @param support Whether to support the proposal or not
     * @param weight Amount of tokens to use for voting
     */
    function castWeightedVote(uint256 proposalId, bool support, uint256 weight) external {
        require(weight > 0, "Weight must be greater than 0");
        require(weight <= balanceOf(msg.sender), "Insufficient token balance");
        
        // Logic for weighted voting would be implemented here
        // This is a placeholder for the actual implementation
        
        emit WeightedVoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Transfer tokens with an event for tracking
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        bool success = super.transfer(to, amount);
        if (success) {
            emit TokenTransferred(msg.sender, to, amount);
        }
        return success;
    }
    
    /**
     * @dev Event emitted when a weighted vote is cast
     */
    event WeightedVoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    /**
     * @dev Event emitted when tokens are transferred
     */
    event TokenTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );
}

/**
 * @title FractionalDAO
 * @dev Main contract for the fractional ownership DAO platform
 */
contract FractionalDAO is Ownable, ReentrancyGuard {
    PlatformToken public platformToken;
    
    // Fee management
    address public constant FEE_WALLET = 0xb13B071A478eE444D2CCD6B97217438Fb7C73578;
    uint256 public constant ETH_FEE = 0.05 ether;
    uint256 public constant TOKEN_FEE = 0.022 ether; // 0.022 FUNDFA tokens
    
    // Fee payment tracking
    mapping(address => bool) public hasPaidVoteGas;
    
    // Counter for asset and proposal IDs
    uint256 private assetIdCounter;
    uint256 private proposalIdCounter;
    
    // Struct definitions
    struct Asset {
        uint256 id;
        string name;
        string symbol;
        string ipfsMetadata; // JSON metadata including image URL
        uint256 totalShares;
        uint256 availableShares;
        uint256 pricePerShare;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 totalValue;
        uint256 fundedAmount;
        uint256 apy;
        uint256 fundingDeadline;
        uint256 investorCount;
        address creator;
        bool isActive;
    }
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        string ipfsMetadata; // JSON metadata including image URL
        uint256 assetId;
        uint256 voteStart;
        uint256 voteEnd;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 executionTime;
        bool executed;
        bool passed;
        string executionData;
        address creator;
    }
    
    // Trading related structures
    struct Order {
        uint256 id;
        address trader;
        uint256 assetId;
        uint256 amount;
        uint256 price;
        bool isBuyOrder;
        uint256 timestamp;
        bool isActive;
    }
    
    struct Trade {
        uint256 id;
        uint256 orderId;
        address buyer;
        address seller;
        uint256 assetId;
        uint256 amount;
        uint256 price;
        uint256 timestamp;
    }
    
    // Storage
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Trade) public trades;
    
    // User storage
    mapping(address => mapping(uint256 => uint256)) private userShares; // user -> assetId -> shares
    mapping(uint256 => mapping(address => bool)) public hasVoted; // proposalId -> user -> has voted
    mapping(uint256 => address[]) private assetInvestors; // assetId -> investors
    
    // Trading counters
    uint256 private orderIdCounter;
    uint256 private tradeIdCounter;
    
    // Rewards tracking
    mapping(uint256 => uint256) public lastRewardTimestamp; // assetId -> last reward timestamp
    mapping(uint256 => uint256) public totalRewardsPaid; // assetId -> total rewards paid
    mapping(uint256 => uint256) public assetTotalValue; // assetId -> current total value
    mapping(uint256 => bool) public assetSold; // assetId -> whether asset has been sold
    
    // Events
    event AssetCreated(
        uint256 indexed assetId, 
        string name, 
        string symbol, 
        uint256 totalShares
    );
    
    event SharesPurchased(
        uint256 indexed assetId, 
        address indexed buyer, 
        uint256 amount
    );
    
    event SharesSold(
        uint256 indexed assetId, 
        address indexed seller, 
        uint256 amount
    );
    
    event ProposalCreated(
        uint256 indexed proposalId, 
        uint256 indexed assetId, 
        string title
    );
    
    event VoteCast(
        uint256 indexed proposalId, 
        address indexed voter, 
        bool support
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId, 
        bool result
    );
    
    event OrderCreated(
        uint256 indexed orderId,
        address indexed trader,
        uint256 indexed assetId,
        uint256 amount,
        uint256 price,
        bool isBuyOrder
    );
    
    event OrderCancelled(
        uint256 indexed orderId
    );
    
    event TradeExecuted(
        uint256 indexed tradeId,
        uint256 indexed orderId,
        address buyer,
        address seller,
        uint256 assetId,
        uint256 amount,
        uint256 price
    );
    
    event FeePaidWithETH(
        address indexed payer,
        uint256 amount
    );
    
    event FeePaidWithToken(
        address indexed payer,
        uint256 amount
    );
    
    constructor(address initialOwner) Ownable(initialOwner) {
        platformToken = new PlatformToken(initialOwner);
        
        // Start counters at 1 to avoid having ID 0
        assetIdCounter = 1;
        proposalIdCounter = 1;
        orderIdCounter = 1;
        tradeIdCounter = 1;
    }
    
    /**
     * @dev Create a new fractionalized asset
     */
    function createAsset(
        string memory name,
        string memory symbol,
        string memory ipfsMetadata,
        uint256 totalShares,
        uint256 pricePerShare,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 totalValue,
        uint256 apy,
        uint256 fundingDeadline
    ) external {
        require(totalShares > 0, "Total shares must be greater than 0");
        require(pricePerShare > 0, "Price per share must be greater than 0");
        require(minInvestment <= maxInvestment, "Min investment must be <= max investment");
        require(fundingDeadline > block.timestamp, "Funding deadline must be in the future");
        
        uint256 assetId = assetIdCounter++;
        
        assets[assetId] = Asset({
            id: assetId,
            name: name,
            symbol: symbol,
            ipfsMetadata: ipfsMetadata,
            totalShares: totalShares,
            availableShares: totalShares,
            pricePerShare: pricePerShare,
            minInvestment: minInvestment,
            maxInvestment: maxInvestment,
            totalValue: totalValue,
            fundedAmount: 0,
            apy: apy,
            fundingDeadline: fundingDeadline,
            investorCount: 0,
            creator: msg.sender,
            isActive: true
        });
        
        emit AssetCreated(assetId, name, symbol, totalShares);
    }
    
    /**
     * @dev Get asset details
     */
    function getAsset(uint256 assetId) external view returns (Asset memory) {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        return assets[assetId];
    }
    
    /**
     * @dev Modified purchase shares function with fee requirement
     */
    function purchaseShares(uint256 assetId, uint256 amount) external payable nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if user has paid fee
        require(hasPaidVoteGas[msg.sender], "Transaction fee not paid");
        
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset is not active");
        require(asset.availableShares >= amount, "Not enough shares available");
        require(block.timestamp <= asset.fundingDeadline, "Funding deadline passed");
        
        uint256 totalCost = amount * asset.pricePerShare;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update asset
        asset.availableShares -= amount;
        asset.fundedAmount += totalCost;
        
        // Update user shares
        if(userShares[msg.sender][assetId] == 0) {
            assetInvestors[assetId].push(msg.sender);
            asset.investorCount++;
        }
        userShares[msg.sender][assetId] += amount;
        
        // Refund excess payment
        if(msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit SharesPurchased(assetId, msg.sender, amount);
    }
    
    /**
     * @dev Sell shares of an asset
     */
    function sellShares(uint256 assetId, uint256 amount) external nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(amount > 0, "Amount must be greater than 0");
        
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset is not active");
        
        require(userShares[msg.sender][assetId] >= amount, "Not enough shares owned");
        
        uint256 saleValue = amount * asset.pricePerShare;
        
        // Update asset
        asset.availableShares += amount;
        asset.fundedAmount -= saleValue;
        
        // Update user shares
        userShares[msg.sender][assetId] -= amount;
        
        // Pay the seller
        payable(msg.sender).transfer(saleValue);
        
        emit SharesSold(assetId, msg.sender, amount);
    }
    
    /**
     * @dev Get user's shares for all assets
     */
    function getUserShares(address user) external view returns (uint256) {
        uint256 totalShares = 0;
        
        for(uint256 i = 1; i < assetIdCounter; i++) {
            totalShares += userShares[user][i];
        }
        
        return totalShares;
    }
    
    /**
     * @dev Get list of investors for an asset
     */
    function getAssetInvestors(uint256 assetId) external view returns (address[] memory) {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        return assetInvestors[assetId];
    }
    
    /**
     * @dev Update asset status (active/inactive)
     */
    function updateAssetStatus(uint256 assetId, bool isActive) external {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(assets[assetId].creator == msg.sender || owner() == msg.sender, "Not authorized");
        
        assets[assetId].isActive = isActive;
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        uint256 assetId,
        string memory title,
        string memory description,
        string memory ipfsMetadata,
        string memory executionData
    ) external {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(userShares[msg.sender][assetId] > 0 || msg.sender == owner(), "Must own shares or be owner");
        
        uint256 proposalId = proposalIdCounter++;
        uint256 voteStart = block.timestamp;
        uint256 voteEnd = block.timestamp + 7 days; // 1 week voting period
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            ipfsMetadata: ipfsMetadata,
            assetId: assetId,
            voteStart: voteStart,
            voteEnd: voteEnd,
            yesVotes: 0,
            noVotes: 0,
            executionTime: 0,
            executed: false,
            passed: false,
            executionData: executionData,
            creator: msg.sender
        });
        
        emit ProposalCreated(proposalId, assetId, title);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(proposalId > 0 && proposalId < proposalIdCounter, "Invalid proposal ID");
        return proposals[proposalId];
    }
    
    /**
     * @dev Cast a vote on a proposal with gas fee paid by fee wallet
     * @dev Vote weight is determined by FUNDFA token balance
     */
    function castVote(uint256 proposalId, bool support) external {
        require(proposalId > 0 && proposalId < proposalIdCounter, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.voteStart, "Voting has not started");
        require(block.timestamp <= proposal.voteEnd, "Voting has ended");
        require(!proposal.executed, "Proposal has been executed");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        // Get voter's FUNDFA token balance
        uint256 tokenBalance = platformToken.balanceOf(msg.sender);
        require(tokenBalance > 0, "Must own FUNDFA tokens to vote");
        
        // Calculate vote weight based on token balance
        uint256 voteWeight = tokenBalance;
        
        hasVoted[proposalId][msg.sender] = true;
        
        if(support) {
            proposal.yesVotes += voteWeight;
        } else {
            proposal.noVotes += voteWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    /**
     * @dev Execute a proposal after voting ends
     */
    function executeProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId < proposalIdCounter, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.voteEnd, "Voting has not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        // Check if proposal passed
        if(proposal.yesVotes > proposal.noVotes) {
            proposal.passed = true;
            proposal.executionTime = block.timestamp;
            
            // Execute proposal logic would be here
            // This is simplified, in a real contract you'd implement specific execution logic
        }
        
        emit ProposalExecuted(proposalId, proposal.passed);
    }
    
    /**
     * @dev Modified create order function with fee requirement
     */
    function createOrder(
        uint256 assetId, 
        uint256 amount, 
        uint256 price, 
        bool isBuyOrder
    ) external payable nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(amount > 0, "Amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        
        // Check if user has paid fee
        require(hasPaidVoteGas[msg.sender], "Transaction fee not paid");
        
        // For sell orders, check if user has enough shares
        if(!isBuyOrder) {
            require(userShares[msg.sender][assetId] >= amount, "Not enough shares to sell");
        } else {
            // For buy orders, check if user has enough ETH
            uint256 totalCost = amount * price;
            require(msg.value >= totalCost, "Insufficient ETH for buy order");
        }
        
        uint256 orderId = orderIdCounter++;
        
        orders[orderId] = Order({
            id: orderId,
            trader: msg.sender,
            assetId: assetId,
            amount: amount,
            price: price,
            isBuyOrder: isBuyOrder,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit OrderCreated(orderId, msg.sender, assetId, amount, price, isBuyOrder);
        
        // Try to match order immediately
        _matchOrder(orderId);
    }
    
    /**
     * @dev Cancel an existing order
     */
    function cancelOrder(uint256 orderId) external {
        require(orderId > 0 && orderId < orderIdCounter, "Invalid order ID");
        
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");
        
        order.isActive = false;
        
        // If buy order, refund ETH
        if(order.isBuyOrder) {
            uint256 refundAmount = order.amount * order.price;
            payable(msg.sender).transfer(refundAmount);
        }
        
        emit OrderCancelled(orderId);
    }
    
    /**
     * @dev Fill a specific order
     */
    function fillOrder(uint256 orderId) external payable nonReentrant {
        require(orderId > 0 && orderId < orderIdCounter, "Invalid order ID");
        
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");
        require(order.trader != msg.sender, "Cannot fill own order");
        
        if(order.isBuyOrder) {
            // This is a buy order, so the caller is selling
            require(userShares[msg.sender][order.assetId] >= order.amount, "Not enough shares to sell");
            
            // Transfer shares from seller to buyer
            userShares[msg.sender][order.assetId] -= order.amount;
            userShares[order.trader][order.assetId] += order.amount;
            
            // Transfer ETH from contract to seller
            uint256 saleAmount = order.amount * order.price;
            payable(msg.sender).transfer(saleAmount);
        } else {
            // This is a sell order, so the caller is buying
            uint256 totalCost = order.amount * order.price;
            require(msg.value >= totalCost, "Insufficient ETH for purchase");
            
            // Transfer shares from seller to buyer
            userShares[order.trader][order.assetId] -= order.amount;
            userShares[msg.sender][order.assetId] += order.amount;
            
            // Transfer ETH from buyer to seller
            payable(order.trader).transfer(totalCost);
            
            // Refund excess payment
            if(msg.value > totalCost) {
                payable(msg.sender).transfer(msg.value - totalCost);
            }
        }
        
        // Mark order as inactive
        order.isActive = false;
        
        // Record the trade
        uint256 tradeId = tradeIdCounter++;
        
        address buyer = order.isBuyOrder ? order.trader : msg.sender;
        address seller = order.isBuyOrder ? msg.sender : order.trader;
        
        trades[tradeId] = Trade({
            id: tradeId,
            orderId: orderId,
            buyer: buyer,
            seller: seller,
            assetId: order.assetId,
            amount: order.amount,
            price: order.price,
            timestamp: block.timestamp
        });
        
        emit TradeExecuted(
            tradeId,
            orderId,
            buyer,
            seller,
            order.assetId,
            order.amount,
            order.price
        );
    }
    
    /**
     * @dev Internal function to try matching an order
     */
    function _matchOrder(uint256 orderId) internal {
        Order storage newOrder = orders[orderId];
        
        // Look for matching orders
        for(uint256 i = 1; i < orderIdCounter; i++) {
            if(i == orderId) continue; // Skip the current order
            
            Order storage existingOrder = orders[i];
            
            if(!existingOrder.isActive) continue;
            if(existingOrder.trader == newOrder.trader) continue;
            if(existingOrder.assetId != newOrder.assetId) continue;
            if(existingOrder.isBuyOrder == newOrder.isBuyOrder) continue;
            
            // For a match:
            // - If new order is buy, existing order price must be <= new order price
            // - If new order is sell, existing order price must be >= new order price
            bool priceMatches = newOrder.isBuyOrder 
                ? existingOrder.price <= newOrder.price
                : existingOrder.price >= newOrder.price;
                
            if(!priceMatches) continue;
            
            // Determine the amount to trade (minimum of both orders)
            uint256 tradeAmount = existingOrder.amount < newOrder.amount 
                ? existingOrder.amount 
                : newOrder.amount;
                
            // Skip if no trade amount
            if(tradeAmount == 0) continue;
            
            // Determine price (use existing order price)
            uint256 tradePrice = existingOrder.price;
            
            // Determine buyer and seller
            address buyer = newOrder.isBuyOrder ? newOrder.trader : existingOrder.trader;
            address seller = newOrder.isBuyOrder ? existingOrder.trader : newOrder.trader;
            
            // Update order amounts
            newOrder.amount -= tradeAmount;
            existingOrder.amount -= tradeAmount;
            
            // Mark orders as inactive if fully filled
            if(newOrder.amount == 0) newOrder.isActive = false;
            if(existingOrder.amount == 0) existingOrder.isActive = false;
            
            // Transfer shares
            userShares[seller][newOrder.assetId] -= tradeAmount;
            userShares[buyer][newOrder.assetId] += tradeAmount;
            
            // Record the trade
            uint256 tradeId = tradeIdCounter++;
            
            trades[tradeId] = Trade({
                id: tradeId,
                orderId: orderId,
                buyer: buyer,
                seller: seller,
                assetId: newOrder.assetId,
                amount: tradeAmount,
                price: tradePrice,
                timestamp: block.timestamp
            });
            
            emit TradeExecuted(
                tradeId,
                orderId,
                buyer,
                seller,
                newOrder.assetId,
                tradeAmount,
                tradePrice
            );
            
            // If new order is fully matched, stop looking
            if(!newOrder.isActive) break;
        }
    }
    
    /**
     * @dev Get the best buy and sell prices for an asset
     */
    function getBestPrices(uint256 assetId) external view returns (uint256 bestBuyPrice, uint256 bestSellPrice) {
        bestBuyPrice = 0;
        bestSellPrice = type(uint256).max;
        
        for(uint256 i = 1; i < orderIdCounter; i++) {
            Order storage order = orders[i];
            
            if(!order.isActive) continue;
            if(order.assetId != assetId) continue;
            
            if(order.isBuyOrder) {
                // Find highest buy price
                if(order.price > bestBuyPrice) {
                    bestBuyPrice = order.price;
                }
            } else {
                // Find lowest sell price
                if(order.price < bestSellPrice) {
                    bestSellPrice = order.price;
                }
            }
        }
        
        // If no sell orders found, reset to 0
        if(bestSellPrice == type(uint256).max) {
            bestSellPrice = 0;
        }
        
        return (bestBuyPrice, bestSellPrice);
    }
    
    /**
     * @dev Withdraw funds from the contract (only owner)
     */
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Pay transaction fee with ETH
     */
    function payFeeWithETH() external payable {
        require(msg.value >= ETH_FEE, "Insufficient ETH fee");
        
        // Transfer fee to fee wallet
        payable(FEE_WALLET).transfer(ETH_FEE);
        
        // Mark user as paid
        hasPaidVoteGas[msg.sender] = true;
        
        // Refund excess if any
        if(msg.value > ETH_FEE) {
            payable(msg.sender).transfer(msg.value - ETH_FEE);
        }
        
        emit FeePaidWithETH(msg.sender, ETH_FEE);
    }
    
    /**
     * @dev Pay transaction fee with FUNDFA tokens
     */
    function payFeeWithToken() external {
        require(platformToken.transferFrom(msg.sender, FEE_WALLET, TOKEN_FEE), "Token transfer failed");
        
        // Mark user as paid
        hasPaidVoteGas[msg.sender] = true;
        
        emit FeePaidWithToken(msg.sender, TOKEN_FEE);
    }

    /**
     * @dev Calculate and distribute rewards based on APY
     */
    function distributeRewards(uint256 assetId) external nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset is not active");
        require(!assetSold[assetId], "Asset has been sold");

        uint256 currentTime = block.timestamp;
        uint256 timeElapsed = currentTime - lastRewardTimestamp[assetId];
        require(timeElapsed >= 1 days, "Rewards can only be distributed daily");

        // Calculate daily reward
        uint256 dailyReward = (asset.totalValue * asset.apy * timeElapsed) / (365 days * 10000);
        
        // Distribute rewards to each share holder
        for(uint256 i = 0; i < assetInvestors[assetId].length; i++) {
            address investor = assetInvestors[assetId][i];
            uint256 shares = userShares[investor][assetId];
            if(shares > 0) {
                uint256 investorReward = (dailyReward * shares) / asset.totalShares;
                payable(investor).transfer(investorReward);
            }
        }

        lastRewardTimestamp[assetId] = currentTime;
        totalRewardsPaid[assetId] += dailyReward;
    }

    /**
     * @dev Distribute dividends to shareholders
     */
    function distributeDividends(uint256 assetId) external payable nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        require(msg.value > 0, "Must send ETH for dividends");
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset is not active");
        require(!assetSold[assetId], "Asset has been sold");

        // Distribute dividends to each share holder
        for(uint256 i = 0; i < assetInvestors[assetId].length; i++) {
            address investor = assetInvestors[assetId][i];
            uint256 shares = userShares[investor][assetId];
            if(shares > 0) {
                uint256 dividendAmount = (msg.value * shares) / asset.totalShares;
                payable(investor).transfer(dividendAmount);
            }
        }
    }

    /**
     * @dev Sell the entire asset and distribute proceeds
     */
    function sellAsset(uint256 assetId) external payable nonReentrant {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset is not active");
        require(!assetSold[assetId], "Asset already sold");
        require(msg.value > 0, "Must send ETH for asset sale");

        // ตรวจสอบว่าผู้ขายมี token หรือไม่
        require(userShares[msg.sender][assetId] > 0, "Must own shares to sell asset");

        uint256 saleValue = msg.value;
        assetSold[assetId] = true;
        asset.isActive = false;

        // กระจายเงินจากการขายให้ผู้ถือหุ้นแต่ละคน
        for(uint256 i = 0; i < assetInvestors[assetId].length; i++) {
            address investor = assetInvestors[assetId][i];
            uint256 shares = userShares[investor][assetId];
            if(shares > 0) {
                uint256 shareValue = (saleValue * shares) / asset.totalShares;
                payable(investor).transfer(shareValue);
                userShares[investor][assetId] = 0; // Reset shares after distribution
            }
        }

        // Reset asset investors array
        delete assetInvestors[assetId];
    }

    /**
     * @dev Update asset total value
     */
    function updateAssetValue(uint256 assetId, uint256 newValue) external {
        require(assetId > 0 && assetId < assetIdCounter, "Invalid asset ID");
        Asset storage asset = assets[assetId];
        require(msg.sender == asset.creator || msg.sender == owner(), "Not authorized");
        require(!assetSold[assetId], "Asset has been sold");

        assetTotalValue[assetId] = newValue;
        asset.totalValue = newValue;
    }

    /**
     * @dev Get total rewards paid for an asset
     */
    function getTotalRewardsPaid(uint256 assetId) external view returns (uint256) {
        return totalRewardsPaid[assetId];
    }

    /**
     * @dev Get last reward distribution timestamp
     */
    function getLastRewardTimestamp(uint256 assetId) external view returns (uint256) {
        return lastRewardTimestamp[assetId];
    }
}