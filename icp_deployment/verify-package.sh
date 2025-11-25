#!/bin/bash
# Quick verification script to check deployment package completeness

echo "========================================="
echo "Deployment Package Verification"
echo "========================================="
echo ""

ERRORS=0

# Check dfx.json exists
if [ -f "dfx.json" ]; then
    echo "✓ dfx.json found"
else
    echo "✗ dfx.json missing"
    ERRORS=$((ERRORS + 1))
fi

# Check deploy script exists
if [ -f "deploy.sh" ]; then
    echo "✓ deploy.sh found"
else
    echo "✗ deploy.sh missing"
    ERRORS=$((ERRORS + 1))
fi

# Check documentation exists
if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    echo "✓ DEPLOYMENT_GUIDE.md found"
else
    echo "✗ DEPLOYMENT_GUIDE.md missing"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend integration files
if [ -d "frontend-integration" ]; then
    echo "✓ frontend-integration directory found"
    
    if [ -f "frontend-integration/lib/icp-agent.ts" ]; then
        echo "  ✓ icp-agent.ts found"
    else
        echo "  ✗ icp-agent.ts missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -f "frontend-integration/lib/canister-client.ts" ]; then
        echo "  ✓ canister-client.ts found"
    else
        echo "  ✗ canister-client.ts missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -f "frontend-integration/hooks/useICPCanisters.ts" ]; then
        echo "  ✓ useICPCanisters.ts found"
    else
        echo "  ✗ useICPCanisters.ts missing"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "✗ frontend-integration directory missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✓ All files present - package is complete!"
    echo ""
    echo "Next steps:"
    echo "1. Ensure dfx is installed: dfx --version"
    echo "2. Copy canister source code to parent directory"
    echo "3. Run: bash deploy.sh local (for testing)"
    echo "4. Run: bash deploy.sh ic (for mainnet deployment)"
else
    echo "✗ Package incomplete - $ERRORS file(s) missing"
    echo "Please check the package contents"
fi
echo "========================================="