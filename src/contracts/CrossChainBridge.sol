// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title CrossChainBridge
 * @dev Smart contract for bridging Bitcoin assets across multiple chains
 * @author Multichain BTCFi Team
 */
contract CrossChainBridge is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Events
    event BridgeInitiated(
        address indexed user,
        uint256 indexed transactionId,
        address token,
        uint256 amount,
        uint256 targetChain,
        string targetAddress
    );

    event BridgeCompleted(
        address indexed user,
        uint256 indexed transactionId,
        address token,
        uint256 amount,
        uint256 sourceChain
    );

    event BridgeCancelled(
        address indexed user,
        uint256 indexed transactionId,
        string reason
    );

    // Structures
    struct BridgeTransaction {
        address user;
        address token;
        uint256 amount;
        uint256 sourceChain;
        uint256 targetChain;
        string targetAddress;
        uint256 timestamp;
        TransactionStatus status;
        bool isBitcoin;
    }

    enum TransactionStatus {
        Pending,
        InProgress,
        Completed,
        Cancelled
    }

    // Mappings
    mapping(uint256 => BridgeTransaction) public transactions;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public authorizedValidators;

    // State variables
    uint256 private _nextTransactionId = 1;
    uint256 public constant MIN_BRIDGE_AMOUNT = 0.001 ether;
    uint256 public constant MAX_BRIDGE_AMOUNT = 1000 ether;
    uint256 public constant BRIDGE_FEE_PERCENT = 1; // 1%

    // Modifiers
    modifier onlyValidator() {
        require(authorizedValidators[msg.sender], "Not authorized validator");
        _;
    }

    modifier validTransaction(uint256 _transactionId) {
        require(_transactionId < _nextTransactionId, "Invalid transaction ID");
        _;
    }

    // Constructor
    constructor() {
        // Initialize with Ethereum mainnet as chain ID
        supportedChains[1] = true; // Ethereum
        supportedChains[137] = true; // Polygon
        supportedChains[56] = true; // BSC
        supportedChains[42161] = true; // Arbitrum
        supportedChains[80001] = true; // Polygon Mumbai (testnet)
        
        // Initialize with supported tokens (example addresses)
        supportedTokens[0xA0b86a33E6441C4CB2C62C7E85a3bF1d3D7a5e4] = true; // Example USDC
        supportedTokens[0xdAC17F958D2ee523a2206206994597C13D831ec7] = true; // USDT
    }

    /**
     * @dev Initiate a cross-chain bridge transaction
     * @param _token Address of the token to bridge
     * @param _amount Amount of tokens to bridge
     * @param _targetChain ID of the target chain
     * @param _targetAddress Address on the target chain
     */
    function initiateBridge(
        address _token,
        uint256 _amount,
        uint256 _targetChain,
        string calldata _targetAddress
    ) external whenNotPaused nonReentrant {
        require(_amount >= MIN_BRIDGE_AMOUNT, "Amount too small");
        require(_amount <= MAX_BRIDGE_AMOUNT, "Amount too large");
        require(supportedTokens[_token], "Token not supported");
        require(supportedChains[_targetChain], "Target chain not supported");
        require(bytes(_targetAddress).length > 0, "Invalid target address");

        // Calculate bridge fee
        uint256 fee = _amount.mul(BRIDGE_FEE_PERCENT).div(100);
        uint256 netAmount = _amount.sub(fee);

        // Check if user has sufficient balance
        require(IERC20(_token).balanceOf(msg.sender) >= _amount, "Insufficient balance");

        // Transfer tokens from user
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Create transaction record
        uint256 transactionId = _nextTransactionId++;
        
        bool isBitcoin = _token == address(0); // Address 0x0 represents native ETH/BTC
        
        transactions[transactionId] = BridgeTransaction({
            user: msg.sender,
            token: _token,
            amount: netAmount,
            sourceChain: block.chainid,
            targetChain: _targetChain,
            targetAddress: _targetAddress,
            timestamp: block.timestamp,
            status: TransactionStatus.Pending,
            isBitcoin: isBitcoin
        });

        // Emit event
        emit BridgeInitiated(
            msg.sender,
            transactionId,
            _token,
            netAmount,
            _targetChain,
            _targetAddress
        );

        // For Bitcoin bridging, additional validation would be needed
        if (isBitcoin) {
            require(_validateBitcoinAddress(_targetAddress), "Invalid Bitcoin address");
        }
    }

    /**
     * @dev Complete a bridge transaction (called by validators)
     * @param _transactionId ID of the transaction to complete
     * @param _proofs Cryptographic proofs of the source transaction
     */
    function completeBridge(
        uint256 _transactionId,
        bytes[] calldata _proofs
    ) external onlyValidator validTransaction(_transactionId) {
        BridgeTransaction storage transaction = transactions[_transactionId];
        require(transaction.status == TransactionStatus.Pending, "Transaction not in pending state");
        require(transaction.timestamp > block.timestamp.sub(1 hours), "Transaction too old");

        // Update transaction status
        transaction.status = TransactionStatus.Completed;

        // Mint wrapped tokens or initiate release on target chain
        if (transaction.isBitcoin) {
            _completeBitcoinBridge(transactionId, transaction);
        } else {
            _completeERC20Bridge(transactionId, transaction);
        }

        emit BridgeCompleted(
            transaction.user,
            transactionId,
            transaction.token,
            transaction.amount,
            transaction.sourceChain
        );
    }

    /**
     * @dev Cancel a bridge transaction (emergency function)
     * @param _transactionId ID of the transaction to cancel
     * @param _reason Reason for cancellation
     */
    function cancelBridge(
        uint256 _transactionId,
        string calldata _reason
    ) external onlyOwner validTransaction(_transactionId) {
        BridgeTransaction storage transaction = transactions[_transactionId];
        require(transaction.status == TransactionStatus.Pending, "Transaction not in pending state");

        // Return tokens to user
        IERC20(transaction.token).safeTransfer(
            transaction.user,
            transaction.amount
        );

        // Update transaction status
        transaction.status = TransactionStatus.Cancelled;

        emit BridgeCancelled(
            transaction.user,
            _transactionId,
            _reason
        );
    }

    /**
     * @dev Add a new supported token
     * @param _token Address of the token to add
     */
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    /**
     * @dev Remove a supported token
     * @param _token Address of the token to remove
     */
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }

    /**
     * @dev Add a new supported chain
     * @param _chainId ID of the chain to add
     */
    function addSupportedChain(uint256 _chainId) external onlyOwner {
        supportedChains[_chainId] = true;
    }

    /**
     * @dev Remove a supported chain
     * @param _chainId ID of the chain to remove
     */
    function removeSupportedChain(uint256 _chainId) external onlyOwner {
        supportedChains[_chainId] = false;
    }

    /**
     * @dev Add a validator
     * @param _validator Address to add as validator
     */
    function addValidator(address _validator) external onlyOwner {
        authorizedValidators[_validator] = true;
    }

    /**
     * @dev Remove a validator
     * @param _validator Address to remove as validator
     */
    function removeValidator(address _validator) external onlyOwner {
        authorizedValidators[_validator] = false;
    }

    /**
     * @dev Update bridge fee percentage
     * @param _newFeePercent New fee percentage (1-5%)
     */
    function updateBridgeFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent >= 1 && _newFeePercent <= 5, "Invalid fee percentage");
        // Note: Would need additional logic to handle pending transactions
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Emergency unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get transaction details
     * @param _transactionId ID of the transaction
     * @return BridgeTransaction struct
     */
    function getTransaction(uint256 _transactionId) external view returns (BridgeTransaction memory) {
        return transactions[_transactionId];
    }

    /**
     * @dev Get total number of transactions
     * @return Total transaction count
     */
    function getTransactionCount() external view returns (uint256) {
        return _nextTransactionId - 1;
    }

    /**
     * @dev Internal function to complete Bitcoin bridge
     */
    function _completeBitcoinBridge(uint256 _transactionId, BridgeTransaction memory _transaction) internal {
        // Implementation would depend on Bitcoin integration approach
        // This could involve:
        // 1. Creating a SPV proof of the Bitcoin transaction
        // 2. Calling a Bitcoin script to release BTC
        // 3. Using a sidechain or Lightning Network
        // For now, this is a placeholder
    }

    /**
     * @dev Internal function to complete ERC20 bridge
     */
    function _completeERC20Bridge(uint256 _transactionId, BridgeTransaction memory _transaction) internal {
        // For ERC20 tokens, we would typically:
        // 1. Burn the tokens on the source chain
        // 2. Mint the equivalent wrapped tokens on the target chain
        // 3. Or use a lock-mint pattern with validators
        // Implementation depends on the specific bridging mechanism
    }

    /**
     * @dev Validate Bitcoin address format
     * @param _address Address to validate
     * @return bool True if valid Bitcoin address
     */
    function _validateBitcoinAddress(string calldata _address) internal pure returns (bool) {
        // Basic Bitcoin address validation
        // In production, this would use proper address format validation
        return bytes(_address).length >= 26 && bytes(_address).length <= 35;
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow receiving ETH for native token bridging
    }
}