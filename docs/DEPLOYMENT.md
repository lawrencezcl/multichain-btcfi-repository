# Deployment and Usage Instructions

## Quick Start Guide

### Prerequisites
- Node.js 18+
- pnpm package manager
- Git

### Local Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/lawrencezcl/multichain-btcfi-repository.git
   cd multichain-btcfi-repository/multichain-btcfi
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Access Application**
   Open http://localhost:5173 in your browser

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Configuration

Create a `.env.local` file in the `multichain-btcfi` directory:

```env
# Blockchain Network Configuration
VITE_BITCOIN_RPC_URL=https://api.blockcypher.com/v1/btc/main
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_ICP_CANISTER_ID=your_icp_canister_id

# Application Settings
VITE_APP_NAME=MiniMaxi Space
VITE_APP_VERSION=1.0.0
VITE_NETWORK=mainnet

# Security
VITE_ENCRYPTION_KEY=your_encryption_key_here
VITE_API_BASE_URL=https://api.minimaxi.space

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXX-X
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

### Deployment Options

#### Vercel Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Set build command: `cd multichain-btcfi && pnpm build`
   - Set output directory: `multichain-btcfi/dist`

2. **Environment Variables**
   Add all environment variables in Vercel dashboard

3. **Deploy**
   Vercel will automatically deploy on every push to main branch

#### Netlify Deployment

1. **Build Settings**
   - Build command: `cd multichain-btcfi && pnpm build`
   - Publish directory: `multichain-btcfi/dist`

2. **Configuration**
   Create `netlify.toml` in root:
   ```toml
   [build]
     base = "multichain-btcfi"
     command = "pnpm build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY multichain-btcfi/package*.json ./
RUN npm install -g pnpm && pnpm install

COPY multichain-btcfi/ .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t minimaxi-space .
docker run -p 80:80 minimaxi-space
```

### Performance Optimization

1. **Bundle Analysis**
   ```bash
   npx vite-bundle-analyzer dist
   ```

2. **Code Splitting**
   - Components are automatically split by Vite
   - Route-based code splitting implemented
   - Lazy loading for heavy components

3. **Image Optimization**
   - WebP format support
   - Responsive images
   - Lazy loading implementation

4. **Caching Strategy**
   - Static assets cached for 1 year
   - HTML files cached for 1 hour
   - API responses cached appropriately

### Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for development/production
   - Rotate keys regularly

2. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
   ```

3. **HTTPS Enforcement**
   - Always use HTTPS in production
   - Implement HSTS headers
   - Use secure cookies

### Monitoring and Analytics

1. **Error Tracking**
   - Implement Sentry for error monitoring
   - Set up custom error boundaries
   - Track user interactions

2. **Performance Monitoring**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - API performance metrics

3. **Analytics Integration**
   - Google Analytics 4
   - Mixpanel for user behavior
   - Custom event tracking

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Runtime Errors**
   - Check browser console for errors
   - Verify environment variables
   - Test with development build

3. **Performance Issues**
   - Check bundle size
   - Analyze network requests
   - Monitor Core Web Vitals

#### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Production debug
NODE_ENV=development pnpm build
```

### Support

For technical support:
- GitHub Issues: [Create an issue](https://github.com/lawrencezcl/multichain-btcfi-repository/issues)
- Email: lawrencezcl@outlook.com
- Documentation: [Project Wiki](https://github.com/lawrencezcl/multichain-btcfi-repository/wiki)