#!/bin/bash
# MultiChain BTCFi ICP Canister Deployment Script
# This script handles the complete deployment process for all canisters

set -e

echo "========================================="
echo "MultiChain BTCFi - ICP Deployment Script"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if network parameter is provided
NETWORK=${1:-local}

if [ "$NETWORK" != "local" ] && [ "$NETWORK" != "ic" ]; then
    echo -e "${RED}Error: Network must be 'local' or 'ic'${NC}"
    echo "Usage: ./deploy.sh [local|ic]"
    exit 1
fi

echo -e "${BLUE}Deployment Target: ${NETWORK}${NC}"
echo ""

# Step 1: Verify dfx installation
echo -e "${YELLOW}[1/7] Verifying dfx installation...${NC}"
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}Error: dfx not found. Please install DFINITY SDK${NC}"
    echo "Visit: https://internetcomputer.org/docs/current/developer-docs/getting-started/install/"
    exit 1
fi

echo -e "${GREEN}✓ dfx found: $(dfx --version)${NC}"
echo ""

# Step 2: Start local replica (if deploying locally)
if [ "$NETWORK" == "local" ]; then
    echo -e "${YELLOW}[2/7] Starting local replica...${NC}"
    dfx start --background --clean
    echo -e "${GREEN}✓ Local replica started${NC}"
else
    echo -e "${YELLOW}[2/7] Skipping local replica (deploying to mainnet)...${NC}"
fi
echo ""

# Step 3: Build all canisters
echo -e "${YELLOW}[3/7] Building canisters...${NC}"
dfx build --network $NETWORK
echo -e "${GREEN}✓ Canisters built successfully${NC}"
echo ""

# Step 4: Create canister IDs
echo -e "${YELLOW}[4/7] Creating canister IDs...${NC}"

CANISTERS=("lending_engine" "cross_chain_handler" "bitcoin_handler" "risk_manager")

for canister in "${CANISTERS[@]}"; do
    echo "  Creating $canister..."
    dfx canister create $canister --network $NETWORK
done

echo -e "${GREEN}✓ Canister IDs created${NC}"
echo ""

# Step 5: Deploy canisters in dependency order
echo -e "${YELLOW}[5/7] Deploying canisters...${NC}"

# Deploy in order: bitcoin_handler -> cross_chain_handler -> risk_manager -> lending_engine
echo "  Deploying bitcoin_handler..."
dfx deploy bitcoin_handler --network $NETWORK

echo "  Deploying cross_chain_handler..."
dfx deploy cross_chain_handler --network $NETWORK

echo "  Deploying risk_manager..."
dfx deploy risk_manager --network $NETWORK

echo "  Deploying lending_engine..."
dfx deploy lending_engine --network $NETWORK

echo -e "${GREEN}✓ All canisters deployed${NC}"
echo ""

# Step 6: Initialize canisters
echo -e "${YELLOW}[6/7] Initializing canisters...${NC}"

echo "  Initializing lending_engine..."
dfx canister call lending_engine initialize --network $NETWORK || echo "  Note: lending_engine may already be initialized"

echo -e "${GREEN}✓ Canisters initialized${NC}"
echo ""

# Step 7: Extract canister IDs for frontend
echo -e "${YELLOW}[7/7] Extracting canister IDs...${NC}"

if [ "$NETWORK" == "ic" ]; then
    OUTPUT_FILE="canister_ids_mainnet.json"
else
    OUTPUT_FILE="canister_ids_local.json"
fi

echo "{" > $OUTPUT_FILE

for i in "${!CANISTERS[@]}"; do
    canister="${CANISTERS[$i]}"
    canister_id=$(dfx canister id $canister --network $NETWORK)
    
    if [ $i -lt $((${#CANISTERS[@]} - 1)) ]; then
        echo "  \"$canister\": \"$canister_id\"," >> $OUTPUT_FILE
    else
        echo "  \"$canister\": \"$canister_id\"" >> $OUTPUT_FILE
    fi
    
    echo "  $canister: $canister_id"
done

echo "}" >> $OUTPUT_FILE

echo -e "${GREEN}✓ Canister IDs saved to $OUTPUT_FILE${NC}"
echo ""

# Display deployment summary
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Deployed Canisters on $NETWORK:"
echo ""

for canister in "${CANISTERS[@]}"; do
    canister_id=$(dfx canister id $canister --network $NETWORK)
    echo "  $canister: $canister_id"
    
    if [ "$NETWORK" == "ic" ]; then
        echo "    URL: https://$canister_id.ic0.app"
    else
        echo "    URL: http://$canister_id.localhost:4943"
    fi
done

echo ""
echo "Next Steps:"
echo "  1. Copy the canister IDs from $OUTPUT_FILE"
echo "  2. Update frontend environment configuration"
echo "  3. Rebuild and redeploy frontend"
echo ""

if [ "$NETWORK" == "ic" ]; then
    echo -e "${YELLOW}Important:${NC} Remember to fund your canisters with cycles!"
    echo "  dfx canister deposit-cycles <amount> <canister-name> --network ic"
fi

echo ""