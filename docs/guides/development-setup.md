# Development Environment Setup

This guide will help you set up a complete development environment for the Multichain BTCFi project.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 50GB free space
- **Network**: Stable internet connection

### Required Software

#### 1. Node.js and npm
```bash
# Install Node.js 18+ (LTS recommended)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should be 18.0.0+
npm --version   # Should be 8.0.0+
```

#### 2. Git
```bash
# Install Git
# Windows: Download from https://git-scm.com/download/win
# macOS: brew install git
# Linux: sudo apt install git

# Verify installation
git --version
```

#### 3. Docker and Docker Compose
```bash
# Install Docker Desktop
# Windows/macOS: https://www.docker.com/products/docker-desktop
# Linux: Follow Docker installation guide

# Verify installation
docker --version
docker-compose --version
```

#### 4. MetaMask (for testing)
```bash
# Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/metamask
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/
```

#### 5. Code Editor (Optional)
- **Visual Studio Code** (Recommended)
  - Install: https://code.visualstudio.com/
  - Required Extensions:
    - TypeScript
    - ESLint
    - Prettier
    - Solidity
    - Jest

## Project Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/your-username/multichain-btcfi-repository.git
cd multichain-btcfi-repository
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Install frontend dependencies
cd src/web
npm install

# Install backend dependencies
cd ../../src/api
npm install

# Install smart contract dependencies
cd ../../contracts
npm install

# Return to root directory
cd ../../
```

### 3. Environment Configuration

#### 3.1 Create Environment Files
```bash
# Copy environment templates
cp config/development/.env.example config/development/.env
cp config/development/.env.example src/web/.env.local
cp config/development/.env.example src/api/.env
cp config/development/.env.example contracts/.env
```

#### 3.2 Configure Environment Variables

**config/development/.env**
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/multichain_btcfi"
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# API Configuration
API_PORT=8000
API_HOST=localhost
API_BASE_URL="http://localhost:8000"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="debug"
LOG_FILE_PATH="logs/app.log"
```

**src/web/.env.local**
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_WS_URL="ws://localhost:8000"

# Web3 Configuration
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CHAIN_NAME="Ethereum Mainnet"
NEXT_PUBLIC_CHAIN_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
NEXT_PUBLIC_CHAIN_BLOCK_EXPLORER_URL="https://etherscan.io"

# Contract Addresses (Development)
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_DEFI_CONTRACT_ADDRESS="0x..."

# Feature Flags
NEXT_PUBLIC_ENABLE_TESTNET=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Social Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_DISCORD_CLIENT_ID="your-discord-client-id"
```

**src/api/.env**
```env
# Blockchain Configuration
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
POLYGON_RPC_URL="https://polygon-rpc.com"
BSC_RPC_URL="https://bsc-dataseed.binance.org/"
ARBITRUM_RPC_URL="https://arb1.arbitrum.io/rpc"

# Testnet Configuration
POLYGON_MUMBAI_RPC_URL="https://rpc-mumbai.maticvigil.com"
GOERLI_RPC_URL="https://goerli.infura.io/v3/YOUR_INFURA_KEY"

# Contract Addresses
ETHEREUM_BRIDGE_ADDRESS="0x..."
POLYGON_BRIDGE_ADDRESS="0x..."
BSC_BRIDGE_ADDRESS="0x..."
ARBITRUM_BRIDGE_ADDRESS="0x..."

# External Services
CHAINLINK_ORACLE_ADDRESS="0x..."
CHAINLINK_FEE_PERCENTAGE=1

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
NEW_RELIC_LICENSE_KEY="your-new-relic-key"
```

**contracts/.env**
```env
# Network Configuration
NETWORK="development"
PRIVATE_KEY="your-development-private-key"

# Infura/Alchemy Configuration
INFURA_PROJECT_ID="your-infura-project-id"
ALCHEMY_API_KEY="your-alchemy-api-key"

# Gas Configuration
GAS_PRICE=20000000000
GAS_LIMIT=300000
MAX_FEE_PER_GAS=50000000000
MAX_PRIORITY_FEE_PER_GAS=2000000000

# Contract Verification
ETHERSCAN_API_KEY="your-etherscan-api-key"
POLYGONSCAN_API_KEY="your-polygonscan-api-key"
BSCSCAN_API_KEY="your-bscscan-api-key"
ARBISCAN_API_KEY="your-arbiscan-api-key"

# Deployment Configuration
DEPLOYMENT_SALT="multichain-btcfi-2024"
PROXY_ADMIN="0x..."

# Testing
COVERAGE=true
SKIP_PRE_COMPILATION=true
```

### 4. Start Development Services

#### 4.1 Start Database Services
```bash
# Start PostgreSQL and Redis with Docker
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

#### 4.2 Initialize Database
```bash
# Run database migrations
cd src/api
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

#### 4.3 Deploy Smart Contracts
```bash
# Deploy to local Hardhat network
cd contracts
npm run deploy:local

# Or deploy to testnet
npm run deploy:testnet
```

#### 4.4 Start Development Servers
```bash
# Start all services concurrently
npm run dev

# Or start services individually
npm run dev:contracts  # Smart contracts
npm run dev:api        # Backend API
npm run dev:web        # Frontend
```

## Verification

### 1. Check Services
```bash
# Verify all services are running
curl http://localhost:8000/health
curl http://localhost:3000
```

### 2. Run Tests
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 3. Build Project
```bash
# Build all components
npm run build

# Build individually
npm run build:contracts
npm run build:api
npm run build:web
```

## Development Workflow

### 1. Start Development Day
```bash
# Pull latest changes
git pull origin main

# Install new dependencies if any
npm install

# Start development environment
npm run dev
```

### 2. Code Quality
```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### 3. Testing
```bash
# Run tests during development
npm run test:watch

# Run tests before commit
npm run test
```

### 4. Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat: add new bridge feature"

# Push changes
git push origin feature/bridge-improvement
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database
npm run db:reset
```

#### Smart Contract Deployment Issues
```bash
# Check network connectivity
npx hardhat node --status

# Verify private key and gas configuration
# Check environment variables
```

#### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### API Connection Issues
```bash
# Check API logs
docker-compose -f docker-compose.dev.yml logs api

# Verify environment variables
npm run env:check

# Test database connection
npm run db:test
```

### Getting Help

1. **Check Documentation**: See `/docs` folder for detailed guides
2. **Review Logs**: Check application logs for specific error messages
3. **GitHub Issues**: Search existing issues or create new ones
4. **Discord**: Join our development community
5. **Team Contact**: Reach out to the development team

## Next Steps

After successful setup:

1. **Review Code Structure**: Explore the codebase organization
2. **Run First Test**: Execute a simple bridge transaction
3. **Set Up IDE**: Configure your code editor for optimal development
4. **Join Development**: Pick up a good first issue from GitHub
5. **Read Documentation**: Study the system architecture and API documentation

## Development Tips

### Performance Optimization
- Use TypeScript for better type safety
- Implement proper error handling
- Optimize database queries
- Use caching where appropriate

### Security Best Practices
- Never commit private keys or secrets
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

### Code Organization
- Follow established naming conventions
- Keep functions small and focused
- Write meaningful comments
- Maintain consistent coding style

Welcome to the Multichain BTCFi development team! 🚀