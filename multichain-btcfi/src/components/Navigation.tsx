import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const Navigation: React.FC = () => {
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleWalletConnect = async () => {
    if (wallet) {
      disconnectWallet();
    } else {
      await connectWallet('bitcoin'); // Default to Bitcoin
    }
  };

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'bitcoin': return 'chain-btc';
      case 'ethereum': return 'chain-eth';
      case 'solana': return 'chain-sol';
      case 'icp': return 'chain-icp';
      default: return 'text-text-secondary';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg-near-black/95 backdrop-blur-defi border-b border-border-subtle">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-bitcoin to-accent-crypto-cyan rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-bg-near-black rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-accent-bitcoin rounded-sm"></div>
              </div>
            </div>
            <span className="text-text-primary font-display text-lg font-semibold">
              MiniMaxi Space
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#portfolio" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Portfolio
            </a>
            <a href="#markets" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Markets
            </a>
            <a href="#positions" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Positions
            </a>
            <a href="#swap" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Swap
            </a>
            <a href="#risk" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
              Risk
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-text-secondary text-small">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-semantic-success rounded-full"></div>
                <span>BTC</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-semantic-success rounded-full"></div>
                <span>ETH</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-semantic-warning rounded-full"></div>
                <span>SOL</span>
              </div>
            </div>

            {/* Wallet Button */}
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-accent-bitcoin border-t-transparent rounded-full animate-spin"></div>
                <span className="text-text-secondary text-small">Connecting...</span>
              </div>
            ) : wallet ? (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${wallet.isBitcoin ? 'bg-accent-bitcoin' : wallet.isEthereum ? 'bg-accent-crypto-cyan' : wallet.isSolana ? 'bg-semantic-info' : 'bg-accent-purple'}`}></div>
                <span className="text-text-primary text-small font-mono">
                  {formatAddress(wallet.address)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                className="btn-bitcoin flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border-subtle py-4">
            <div className="flex flex-col space-y-3">
              <a href="#portfolio" className="text-text-secondary hover:text-text-primary transition-colors font-medium py-2">
                Portfolio
              </a>
              <a href="#markets" className="text-text-secondary hover:text-text-primary transition-colors font-medium py-2">
                Markets
              </a>
              <a href="#positions" className="text-text-secondary hover:text-text-primary transition-colors font-medium py-2">
                Positions
              </a>
              <a href="#swap" className="text-text-secondary hover:text-text-primary transition-colors font-medium py-2">
                Swap
              </a>
              <a href="#risk" className="text-text-secondary hover:text-text-primary transition-colors font-medium py-2">
                Risk
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};