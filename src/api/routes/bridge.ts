import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { authMiddleware } from '@/middleware/auth';
import { validationErrorHandler } from '@/middleware/validation';
import { blockchainService } from '@/services/blockchainService';
import { crossChainService } from '@/services/crossChainService';

const router = Router();

// Rate limiting for API endpoints
const bridgeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many bridge requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * @route   POST /api/bridge/initiate
 * @desc    Initiate a cross-chain bridge transaction
 * @access  Private (requires authentication)
 */
router.post(
  '/initiate',
  authMiddleware,
  bridgeRateLimit,
  [
    body('token')
      .isEthereumAddress()
      .withMessage('Valid token address is required'),
    body('amount')
      .isNumeric()
      .custom((value) => {
        const num = parseFloat(value);
        if (num <= 0) throw new Error('Amount must be greater than 0');
        if (num > 1000) throw new Error('Amount exceeds maximum limit');
        return true;
      })
      .withMessage('Valid amount is required (0 < amount ≤ 1000)'),
    body('targetChain')
      .isInt({ min: 1, max: 999999 })
      .withMessage('Valid target chain ID is required'),
    body('targetAddress')
      .isLength({ min: 26, max: 42 })
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Valid target address is required'),
  ],
  validationErrorHandler,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, amount, targetChain, targetAddress } = req.body;
      const userId = (req as any).user.id;

      logger.info('Bridge initiated', {
        userId,
        token,
        amount,
        targetChain,
        targetAddress,
      });

      // Validate chain support
      const supportedChains = [1, 137, 56, 42161, 80001];
      if (!supportedChains.includes(parseInt(targetChain))) {
        return res.status(400).json({
          error: 'Target chain not supported',
          supportedChains,
        });
      }

      // Check user balance
      const userBalance = await blockchainService.getTokenBalance(
        userId,
        token
      );

      const requiredAmount = ethers.parseEther(amount.toString());
      
      if (userBalance.lt(requiredAmount)) {
        return res.status(400).json({
          error: 'Insufficient balance',
          required: requiredAmount.toString(),
          available: userBalance.toString(),
        });
      }

      // Create bridge transaction in database
      const bridgeTransaction = await prisma.bridgeTransaction.create({
        data: {
          userId,
          tokenAddress: token,
          amount: requiredAmount.toString(),
          sourceChain: req.body.sourceChain || 1, // Default to Ethereum
          targetChain: parseInt(targetChain),
          targetAddress,
          status: 'pending',
          bridgeFee: (parseFloat(amount) * 0.01).toString(), // 1% fee
          gasEstimate: '10000000000000000', // 0.01 ETH in wei
        },
      });

      // Initiate blockchain transaction
      const blockchainTx = await crossChainService.initiateBridge({
        token,
        amount: requiredAmount,
        targetChain: parseInt(targetChain),
        targetAddress,
        userId,
        transactionId: bridgeTransaction.id,
      });

      // Update transaction with blockchain hash
      await prisma.bridgeTransaction.update({
        where: { id: bridgeTransaction.id },
        data: {
          blockchainHash: blockchainTx.hash,
          status: 'initiated',
        },
      });

      // Schedule completion check
      setTimeout(async () => {
        try {
          await crossChainService.checkTransactionStatus(bridgeTransaction.id);
        } catch (error) {
          logger.error('Transaction status check failed', {
            transactionId: bridgeTransaction.id,
            error: error instanceof Error ? error.message : error,
          });
        }
      }, 30000); // Check after 30 seconds

      res.status(201).json({
        success: true,
        data: {
          transactionId: bridgeTransaction.id,
          blockchainHash: blockchainTx.hash,
          estimatedTime: '10-15 minutes',
          bridgeFee: bridgeTransaction.bridgeFee,
          gasEstimate: bridgeTransaction.gasEstimate,
        },
        message: 'Bridge transaction initiated successfully',
      });

      logger.info('Bridge initiated successfully', {
        transactionId: bridgeTransaction.id,
        blockchainHash: blockchainTx.hash,
        userId,
      });

    } catch (error) {
      logger.error('Bridge initiation failed', {
        error: error instanceof Error ? error.message : error,
        userId: (req as any).user.id,
      });

      res.status(500).json({
        error: 'Failed to initiate bridge transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/bridge/transaction/:id
 * @desc    Get bridge transaction status
 * @access  Private (requires authentication)
 */
router.get(
  '/transaction/:id',
  authMiddleware,
  [
    param('id').isUUID().withMessage('Valid transaction ID is required'),
  ],
  validationErrorHandler,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const transaction = await prisma.bridgeTransaction.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              walletAddress: true,
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({
          error: 'Transaction not found',
        });
      }

      // Get real-time status from blockchain
      let blockchainStatus = null;
      try {
        if (transaction.blockchainHash) {
          blockchainStatus = await blockchainService.getTransactionStatus(
            transaction.blockchainHash
          );
        }
      } catch (error) {
        logger.warn('Failed to get blockchain status', {
          transactionId: id,
          hash: transaction.blockchainHash,
          error: error instanceof Error ? error.message : error,
        });
      }

      res.json({
        success: true,
        data: {
          ...transaction,
          blockchainStatus,
        },
      });

    } catch (error) {
      logger.error('Failed to get transaction status', {
        error: error instanceof Error ? error.message : error,
        transactionId: req.params.id,
      });

      res.status(500).json({
        error: 'Failed to retrieve transaction status',
      });
    }
  }
);

/**
 * @route   GET /api/bridge/transactions
 * @desc    Get user's bridge transactions
 * @access  Private (requires authentication)
 */
router.get(
  '/transactions',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'initiated', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  ],
  validationErrorHandler,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const [transactions, total] = await Promise.all([
        prisma.bridgeTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.bridgeTransaction.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });

    } catch (error) {
      logger.error('Failed to get user transactions', {
        error: error instanceof Error ? error.message : error,
        userId: (req as any).user.id,
      });

      res.status(500).json({
        error: 'Failed to retrieve transactions',
      });
    }
  }
);

/**
 * @route   GET /api/bridge/supported-chains
 * @desc    Get supported chains for bridging
 * @access  Public
 */
router.get('/supported-chains', async (req: Request, res: Response) => {
  try {
    const supportedChains = [
      {
        id: 1,
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        blockTime: 12,
        confirmedBlocks: 12,
      },
      {
        id: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: process.env.POLYGON_RPC_URL,
        blockTime: 2,
        confirmedBlocks: 50,
      },
      {
        id: 56,
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        rpcUrl: process.env.BSC_RPC_URL,
        blockTime: 3,
        confirmedBlocks: 15,
      },
      {
        id: 42161,
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpcUrl: process.env.ARBITRUM_RPC_URL,
        blockTime: 2,
        confirmedBlocks: 20,
      },
      {
        id: 80001,
        name: 'Polygon Mumbai (Testnet)',
        symbol: 'MATIC',
        rpcUrl: process.env.POLYGON_MUMBAI_RPC_URL,
        blockTime: 2,
        confirmedBlocks: 5,
        isTestnet: true,
      },
    ];

    res.json({
      success: true,
      data: supportedChains,
    });

  } catch (error) {
    logger.error('Failed to get supported chains', {
      error: error instanceof Error ? error.message : error,
    });

    res.status(500).json({
      error: 'Failed to retrieve supported chains',
    });
  }
});

/**
 * @route   GET /api/bridge/supported-tokens
 * @desc    Get supported tokens for bridging
 * @access  Public
 */
router.get('/supported-tokens', async (req: Request, res: Response) => {
  try {
    const supportedTokens = [
      {
        address: '0xA0b86a33E6441C4CB2C62C7E85a3bF1d3D7a5e4',
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        decimals: 8,
        chains: [1, 137, 56, 42161],
        isNative: false,
        iconUrl: '/images/tokens/wbtc.png',
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        chains: [1, 137, 56, 42161],
        isNative: false,
        iconUrl: '/images/tokens/usdt.png',
      },
      {
        address: '0xA0b86a33E6441C4CB2C62C7E85a3bF1d3D7a5e4',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        chains: [1, 137, 56, 42161],
        isNative: false,
        iconUrl: '/images/tokens/usdc.png',
      },
      {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chains: [1, 42161, 80001],
        isNative: true,
        iconUrl: '/images/tokens/eth.png',
      },
      {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Matic Token',
        symbol: 'MATIC',
        decimals: 18,
        chains: [137, 80001],
        isNative: true,
        iconUrl: '/images/tokens/matic.png',
      },
    ];

    res.json({
      success: true,
      data: supportedTokens,
    });

  } catch (error) {
    logger.error('Failed to get supported tokens', {
      error: error instanceof Error ? error.message : error,
    });

    res.status(500).json({
      error: 'Failed to retrieve supported tokens',
    });
  }
});

/**
 * @route   POST /api/bridge/cancel/:id
 * @desc    Cancel a bridge transaction
 * @access  Private (requires authentication)
 */
router.post(
  '/cancel/:id',
  authMiddleware,
  [
    param('id').isUUID().withMessage('Valid transaction ID is required'),
    body('reason').isLength({ min: 10, max: 500 }).withMessage('Cancellation reason is required (10-500 characters)'),
  ],
  validationErrorHandler,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.id;

      const transaction = await prisma.bridgeTransaction.findFirst({
        where: {
          id,
          userId,
          status: { in: ['pending', 'initiated'] },
        },
      });

      if (!transaction) {
        return res.status(404).json({
          error: 'Transaction not found or cannot be cancelled',
        });
      }

      // Cancel the blockchain transaction if possible
      try {
        await crossChainService.cancelBridge(transaction.id, reason);
      } catch (error) {
        logger.warn('Failed to cancel blockchain transaction', {
          transactionId: id,
          error: error instanceof Error ? error.message : error,
        });
      }

      // Update transaction status
      const cancelledTransaction = await prisma.bridgeTransaction.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: cancelledTransaction,
        message: 'Transaction cancelled successfully',
      });

      logger.info('Bridge transaction cancelled', {
        transactionId: id,
        userId,
        reason,
      });

    } catch (error) {
      logger.error('Failed to cancel transaction', {
        error: error instanceof Error ? error.message : error,
        transactionId: req.params.id,
      });

      res.status(500).json({
        error: 'Failed to cancel transaction',
      });
    }
  }
);

export default router;