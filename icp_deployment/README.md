# MultiChain BTCFi - ICP Deployment Package

Complete deployment package for the MultiChain Bitcoin DeFi Lending Protocol on Internet Computer Protocol (ICP).

## Quick Start

### Environment Constraint

**The sandbox environment does not have dfx or ICP deployment tools.** You must deploy from your local machine with dfx installed.

### Prerequisites

1. Install dfx: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`
2. Verify: `dfx --version`
3. Ensure you have cycles for mainnet deployment

### Deployment Steps

1. **Download this package** to your local machine
2. **Copy canister source code** from `/workspace/icp_development/canisters/`
3. **Deploy locally first (recommended):**
   ```bash
   cd icp_deployment
   bash deploy.sh local
   ```
4. **Deploy to mainnet:**
   ```bash
   bash deploy.sh ic
   ```
5. **Get canister IDs** from `canister_ids_mainnet.json`
6. **Integrate with frontend** using files in `frontend-integration/`

## Package Contents

```
icp_deployment/
├── README.md                          # This file
├── DEPLOYMENT_GUIDE.md                # Comprehensive deployment guide
├── dfx.json                           # Canister configuration
├── deploy.sh                          # Automated deployment script
└── frontend-integration/
    ├── INTEGRATION_GUIDE.md           # Frontend integration guide
    ├── lib/
    │   ├── icp-agent.ts              # ICP agent configuration
    │   └── canister-client.ts        # Canister client wrapper
    └── hooks/
        └── useICPCanisters.ts        # React hooks for canisters
```

## Canisters Overview

### 1. lending_engine
**Core lending/borrowing logic**
- Deposit and withdrawal management
- Borrow and repayment processing
- Interest rate calculations
- Health factor monitoring

### 2. cross_chain_handler  
**Cross-chain operations coordinator**
- Atomic swaps (HTLC-based)
- Cross-chain transfers
- Transaction status monitoring
- Multi-chain portfolio management

### 3. bitcoin_handler
**Bitcoin-specific operations**
- Threshold ECDSA/Schnorr signatures
- PSBT construction and signing
- DLC management
- Ordinals and Runes support

### 4. risk_manager
**Risk assessment and liquidation**
- Real-time risk monitoring
- Automated liquidation engine
- Circuit breakers
- Oracle integration

## Deployment Architecture

```
bitcoin_handler (independent)
       ↓
cross_chain_handler (depends on bitcoin_handler)
       ↓
risk_manager (depends on cross_chain_handler)
       ↓
lending_engine (depends on all above)
```

The deployment script handles dependencies automatically.

## Post-Deployment

### 1. Fund Canisters with Cycles
```bash
dfx canister deposit-cycles 2000000000000 lending_engine --network ic
dfx canister deposit-cycles 2000000000000 cross_chain_handler --network ic
dfx canister deposit-cycles 2000000000000 bitcoin_handler --network ic
dfx canister deposit-cycles 2000000000000 risk_manager --network ic
```

### 2. Verify Deployment
```bash
dfx canister status lending_engine --network ic
dfx canister call lending_engine initialize --network ic
dfx canister call lending_engine getMarketData --network ic
```

### 3. Integrate Frontend
1. Copy canister IDs from `canister_ids_mainnet.json`
2. Update environment variables in frontend
3. Install ICP packages: `pnpm add @dfinity/agent @dfinity/candid @dfinity/principal`
4. Copy frontend integration files
5. Update components to use real canister data
6. Build and redeploy frontend

See `frontend-integration/INTEGRATION_GUIDE.md` for detailed instructions.

## Documentation

- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment instructions
- **frontend-integration/INTEGRATION_GUIDE.md** - Frontend integration tutorial
- ICP Documentation: https://internetcomputer.org/docs

## Code Statistics

- **Total Motoko Code:** 17,000+ lines
- **Canisters:** 4 interconnected canisters
- **Test Coverage:** 6,932+ lines of test code
- **Chain Support:** Bitcoin, Ethereum, Solana

## Key Features

- **Native Bitcoin Integration** via threshold cryptography
- **Ordinals/Runes Support** as collateral
- **Atomic Cross-Chain Swaps** using HTLC
- **Direct Blockchain Integration** (no bridges)
- **Automated Risk Management** with circuit breakers

## Security Considerations

1. **Threshold Signatures** - Private keys never reconstructed
2. **Cycles Management** - Monitor and maintain adequate cycles
3. **Controller Access** - Minimize controllers, use hardware wallets
4. **Audit Ready** - Code follows ICP best practices

## Support

- ICP Developer Docs: https://internetcomputer.org/docs
- ICP Forum: https://forum.dfinity.org/
- Chain Fusion Guide: https://internetcomputer.org/docs/current/developer-docs/multi-chain/chain-key-tokens/overview

## Next Steps

1. Review `DEPLOYMENT_GUIDE.md`
2. Set up local dfx environment
3. Deploy canisters (local → mainnet)
4. Integrate with frontend
5. Test end-to-end functionality

## License

This deployment package is part of the MultiChain BTCFi project developed for ICP ecosystem.

---

**Version:** 1.0  
**Last Updated:** 2025-11-11  
**Compatible with:** dfx 0.15.0+