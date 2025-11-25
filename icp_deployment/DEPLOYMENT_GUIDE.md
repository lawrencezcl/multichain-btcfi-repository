# MultiChain BTCFi - ICP Canister Deployment Guide

## Overview

This guide provides complete instructions for deploying the MultiChain Bitcoin DeFi Lending Protocol canisters to the Internet Computer Protocol (ICP) and integrating them with the live frontend.

## Important: Deployment Environment Constraint

**The sandbox environment does not have dfx CLI or ICP deployment tools installed.** Therefore, canister deployment must be performed from your local machine with proper ICP development tooling.

## Prerequisites

### Required Software

1. **DFINITY Canister SDK (dfx)**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```
   Verify installation:
   ```bash
   dfx --version
   ```

2. **Node.js** (LTS version)
   - Required for frontend integration
   - Download from: https://nodejs.org/

3. **Cycles Wallet** (for mainnet deployment)
   - Needed to fund canisters on IC mainnet
   - Documentation: https://internetcomputer.org/docs/current/developer-docs/getting-started/cycles/cycles-wallet

### Required Files

All necessary files are in `/workspace/icp_deployment/`:
- `dfx.json` - Canister configuration
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT_GUIDE.md` - This file
- `frontend-integration/` - Frontend integration files

## Deployment Architecture

### Canisters Overview

The protocol consists of 4 interconnected canisters:

1. **lending_engine** - Core lending/borrowing logic
   - Manages deposits, borrows, repayments, liquidations
   - Calculates interest rates and health factors
   - Coordinates with other canisters

2. **cross_chain_handler** - Cross-chain operations coordinator
   - Manages atomic swaps via HTLC
   - Handles cross-chain asset transfers
   - Monitors transaction status across chains

3. **bitcoin_handler** - Bitcoin-specific operations
   - Threshold ECDSA/Schnorr signatures
   - PSBT construction and signing
   - DLC management for Bitcoin collateral
   - Ordinals and Runes support

4. **risk_manager** - Risk assessment and liquidation
   - Real-time risk monitoring
   - Automated liquidation engine
   - Circuit breakers for emergency stops
   - Oracle price feed integration

### Deployment Dependencies

```
bitcoin_handler (independent)
       ↓
cross_chain_handler (depends on bitcoin_handler)
       ↓
risk_manager (depends on cross_chain_handler)
       ↓
lending_engine (depends on all above)
```

## Step-by-Step Deployment Process

### Phase 1: Environment Setup

1. **Download Deployment Package**
   
   Transfer the entire `/workspace/icp_deployment/` directory to your local machine.

2. **Copy Canister Source Code**
   
   Copy `/workspace/icp_development/canisters/` to your local machine in the same relative location.

3. **Verify File Structure**
   ```
   your-project/
   ├── icp_deployment/
   │   ├── dfx.json
   │   ├── deploy.sh
   │   ├── DEPLOYMENT_GUIDE.md
   │   └── frontend-integration/
   └── icp_development/
       └── canisters/
           ├── lending_engine/
           ├── cross_chain_handler/
           ├── bitcoin_handler/
           └── risk_manager/
   ```

### Phase 2: Local Testing (Recommended)

Before deploying to mainnet, test locally:

1. **Navigate to Deployment Directory**
   ```bash
   cd icp_deployment
   ```

2. **Start Local Replica**
   ```bash
   dfx start --clean --background
   ```

3. **Deploy Locally**
   ```bash
   bash deploy.sh local
   ```

4. **Verify Deployment**
   ```bash
   dfx canister call lending_engine initialize
   ```

5. **Test Canister Interactions**
   ```bash
   # Test getting market data
   dfx canister call lending_engine getMarketData
   
   # Test getting system status
   dfx canister call cross_chain_handler getSystemStatus
   ```

### Phase 3: Mainnet Deployment

1. **Ensure Sufficient Cycles**
   
   Check your cycles balance:
   ```bash
   dfx wallet balance --network ic
   ```
   
   Recommended minimum: 10 TC (10 trillion cycles)

2. **Deploy to Mainnet**
   ```bash
   bash deploy.sh ic
   ```
   
   This will:
   - Build all canisters
   - Create canister IDs on IC mainnet
   - Deploy in dependency order
   - Initialize canisters
   - Save canister IDs to `canister_ids_mainnet.json`

3. **Fund Canisters with Cycles**
   
   Each canister needs cycles to operate:
   ```bash
   # Fund each canister (adjust amount as needed)
   dfx canister deposit-cycles 2000000000000 lending_engine --network ic
   dfx canister deposit-cycles 2000000000000 cross_chain_handler --network ic
   dfx canister deposit-cycles 2000000000000 bitcoin_handler --network ic
   dfx canister deposit-cycles 2000000000000 risk_manager --network ic
   ```

4. **Verify Mainnet Deployment**
   ```bash
   # Check canister status
   dfx canister status lending_engine --network ic
   dfx canister status cross_chain_handler --network ic
   dfx canister status bitcoin_handler --network ic
   dfx canister status risk_manager --network ic
   ```

### Phase 4: Frontend Integration

After successful canister deployment, integrate with the frontend.

1. **Locate Canister IDs**
   
   Canister IDs are saved in `canister_ids_mainnet.json`:
   ```json
   {
     "lending_engine": "xxxxx-xxxxx-xxxxx-xxxxx-cai",
     "cross_chain_handler": "xxxxx-xxxxx-xxxxx-xxxxx-cai",
     "bitcoin_handler": "xxxxx-xxxxx-xxxxx-xxxxx-cai",
     "risk_manager": "xxxxx-xxxxx-xxxxx-xxxxx-cai"
   }
   ```

2. **Install ICP Agent in Frontend**
   
   Navigate to your frontend project:
   ```bash
   cd /path/to/multichain-btcfi
   pnpm add @dfinity/agent @dfinity/candid @dfinity/principal
   ```

3. **Create ICP Integration Layer**
   
   Copy files from `frontend-integration/` to your frontend `src/` directory:
   - `lib/icp-agent.ts` - ICP agent configuration
   - `lib/canister-client.ts` - Canister client wrapper
   - `hooks/useICPCanisters.ts` - React hooks for canister calls

4. **Update Environment Variables**
   
   Create/update `.env.production`:
   ```env
   VITE_IC_HOST=https://ic0.app
   VITE_LENDING_ENGINE_CANISTER_ID=xxxxx-xxxxx-xxxxx-xxxxx-cai
   VITE_CROSS_CHAIN_HANDLER_CANISTER_ID=xxxxx-xxxxx-xxxxx-xxxxx-cai
   VITE_BITCOIN_HANDLER_CANISTER_ID=xxxxx-xxxxx-xxxxx-xxxxx-cai
   VITE_RISK_MANAGER_CANISTER_ID=xxxxx-xxxxx-xxxxx-xxxxx-cai
   ```

5. **Update Frontend Code**
   
   Replace mock data calls with real canister calls. See `frontend-integration/INTEGRATION_GUIDE.md` for detailed examples.

6. **Build and Deploy Frontend**
   ```bash
   pnpm build
   # Deploy to your hosting service
   ```

## Post-Deployment Verification

### Canister Health Checks

1. **Check Cycles Balance**
   ```bash
   dfx canister status lending_engine --network ic | grep "Balance"
   ```

2. **Test Canister Calls**
   ```bash
   # Initialize lending engine
   dfx canister call lending_engine initialize --network ic
   
   # Get market statistics
   dfx canister call lending_engine getMarketData --network ic
   
   # Get system status
   dfx canister call cross_chain_handler getSystemStatus --network ic
   ```

3. **Monitor Canister Logs**
   ```bash
   dfx canister logs lending_engine --network ic
   ```

### Frontend Integration Tests

1. **Test Canister Connection**
   - Open browser console
   - Verify no connection errors
   - Check that data loads from canisters

2. **Test Core Functionality**
   - View market statistics (should load from lending_engine)
   - Check transaction history (should query cross_chain_handler)
   - Verify risk metrics (should load from risk_manager)

## Troubleshooting

### Common Issues

1. **dfx not found**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Insufficient Cycles**
   ```bash
   # Purchase more cycles and top up canisters
   dfx wallet balance --network ic
   dfx canister deposit-cycles <amount> <canister> --network ic
   ```

3. **Build Errors**
   ```bash
   # Clean and rebuild
   dfx build --network ic
   ```

4. **Canister Initialization Fails**
   ```bash
   # Check canister status
   dfx canister status <canister-name> --network ic
   
   # View logs
   dfx canister logs <canister-name> --network ic
   ```

5. **Frontend Cannot Connect to Canisters**
   - Verify canister IDs in environment variables
   - Check network configuration (ic0.app vs localhost)
   - Ensure CORS settings allow frontend domain
   - Verify canisters are running and funded

### Getting Help

- ICP Developer Documentation: https://internetcomputer.org/docs
- ICP Developer Forum: https://forum.dfinity.org/
- Chain Fusion Documentation: https://internetcomputer.org/docs/current/developer-docs/multi-chain/chain-key-tokens/overview

## Maintenance

### Monitoring Cycles

Set up automated monitoring:
```bash
# Check cycles weekly
dfx canister status lending_engine --network ic
```

Recommended: Use a cycles management service for automatic top-ups.

### Upgrading Canisters

To upgrade canister code:
```bash
# Build new version
dfx build --network ic

# Upgrade (preserves state)
dfx canister install <canister-name> --mode upgrade --network ic
```

### Backup and Recovery

Export canister state periodically:
```bash
dfx canister call <canister-name> exportState --network ic > backup.json
```

## Security Considerations

1. **Controller Management**
   - Minimize number of controllers
   - Use hardware wallets for controller identities
   - Implement multi-sig governance for upgrades

2. **Cycles Management**
   - Monitor cycles balance regularly
   - Set up alerts for low balance
   - Use cycles management services

3. **Access Control**
   - Implement proper authentication in canisters
   - Use Internet Identity for user authentication
   - Validate all inputs in canister methods

4. **Audit**
   - Code has been developed following ICP best practices
   - Consider professional security audit before handling significant value

## Support and Next Steps

After successful deployment:

1. Share the `canister_ids_mainnet.json` file
2. Verify all canisters are running and funded
3. Test frontend integration with live canisters
4. Monitor cycles consumption for the first week
5. Set up automated cycles top-up

For questions or assistance with deployment, refer to the ICP developer documentation or community forums.

## Appendix: Manual Deployment Steps

If the automated script doesn't work, deploy manually:

```bash
# 1. Create canisters
dfx canister create lending_engine --network ic
dfx canister create cross_chain_handler --network ic
dfx canister create bitcoin_handler --network ic
dfx canister create risk_manager --network ic

# 2. Build canisters
dfx build --network ic

# 3. Install canisters (in dependency order)
dfx canister install bitcoin_handler --network ic
dfx canister install cross_chain_handler --network ic
dfx canister install risk_manager --network ic
dfx canister install lending_engine --network ic

# 4. Initialize
dfx canister call lending_engine initialize --network ic

# 5. Get canister IDs
dfx canister id lending_engine --network ic
dfx canister id cross_chain_handler --network ic
dfx canister id bitcoin_handler --network ic
dfx canister id risk_manager --network ic
```

---

**Deployment Package Version:** 1.0  
**Last Updated:** 2025-11-11  
**Compatible with:** dfx 0.15.0+