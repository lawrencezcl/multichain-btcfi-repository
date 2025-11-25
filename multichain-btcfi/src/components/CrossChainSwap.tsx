import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

export const CrossChainSwap: React.FC = () => {
  const { swapAssets } = useData();
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('ETH');
  const [fromChain, setFromChain] = useState('bitcoin');
  const [toChain, setToChain] = useState('ethereum');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Mock exchange rates
  const exchangeRates = {
    'BTC->ETH': 0.0247,
    'BTC->SOL': 965.24,
    'ETH->BTC': 40.48,
    'ETH->SOL': 0.0238,
    'SOL->BTC': 0.001036,
    'SOL->ETH': 0.0420
  };

  const currentRate = exchangeRates[`${fromAsset}->${toAsset}` as keyof typeof exchangeRates] || 1;
  const toAmount = amount ? (parseFloat(amount) * currentRate).toFixed(6) : '0';
  const estimatedGas = fromChain !== toChain ? 0.05 : 0.01;
  const priceImpact = fromChain !== toChain ? 0.3 : 0.1;

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSwapping(true);
    try {
      const txHash = await swapAssets(fromAsset, toAsset, fromChain, toChain, parseFloat(amount));
      console.log('Swap transaction:', txHash);
      // Reset form on success
      setAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const getChainLogo = (chain: string) => {
    switch (chain) {
      case 'bitcoin':
        return '/imgs/bitcoin_logo_3.png';
      case 'ethereum':
        return '/imgs/ethereum_logo_4.png';
      case 'solana':
        return '/imgs/solana_logo_9.jpg';
      default:
        return '/imgs/icp_logo_9.jpg';
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Swap Interface */}
      <div className="card-elevated">
        <h3 className="text-h2 font-display font-semibold text-text-primary mb-6">
          Atomic Cross-Chain Swap
        </h3>
        
        <div className="space-y-6">
          {/* From Asset */}
          <div>
            <label className="block text-text-secondary text-small font-semibold mb-2">
              From
            </label>
            <div className="input-field">
              <div className="flex items-center space-x-3">
                <img 
                  src={getChainLogo(fromChain)} 
                  alt={fromAsset}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1">
                  <select
                    value={`${fromAsset}-${fromChain}`}
                    onChange={(e) => {
                      const [asset, chain] = e.target.value.split('-');
                      setFromAsset(asset);
                      setFromChain(chain);
                    }}
                    className="bg-transparent text-text-primary font-semibold w-full outline-none"
                  >
                    <option value="BTC-bitcoin">Bitcoin (BTC)</option>
                    <option value="ETH-ethereum">Ethereum (ETH)</option>
                    <option value="SOL-solana">Solana (SOL)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field flex-1 text-text-primary text-h3 font-mono"
              />
              <button
                onClick={() => setAmount('1')}
                className="ml-2 px-3 py-2 text-small text-accent-bitcoin border border-accent-bitcoin/30 rounded-md hover:bg-accent-bitcoin/10 transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                // Swap assets and chains
                const tempAsset = fromAsset;
                const tempChain = fromChain;
                setFromAsset(toAsset);
                setFromChain(toChain);
                setToAsset(tempAsset);
                setToChain(tempChain);
              }}
              className="p-3 rounded-full bg-bg-hover border border-border-moderate hover:border-accent-bitcoin transition-colors"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Asset */}
          <div>
            <label className="block text-text-secondary text-small font-semibold mb-2">
              To
            </label>
            <div className="input-field">
              <div className="flex items-center space-x-3">
                <img 
                  src={getChainLogo(toChain)} 
                  alt={toAsset}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1">
                  <select
                    value={`${toAsset}-${toChain}`}
                    onChange={(e) => {
                      const [asset, chain] = e.target.value.split('-');
                      setToAsset(asset);
                      setToChain(chain);
                    }}
                    className="bg-transparent text-text-primary font-semibold w-full outline-none"
                  >
                    <option value="ETH-ethereum">Ethereum (ETH)</option>
                    <option value="BTC-bitcoin">Bitcoin (BTC)</option>
                    <option value="SOL-solana">Solana (SOL)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={toAmount}
                disabled
                className="input-field w-full text-text-primary text-h3 font-mono bg-bg-input"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0 || isSwapping}
            className="w-full btn-bitcoin text-h3 font-semibold py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwapping ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-text-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Swap...</span>
              </div>
            ) : (
              `Swap ${fromAsset} to ${toAsset}`
            )}
          </button>
        </div>
      </div>

      {/* Swap Details */}
      <div className="card-elevated">
        <h3 className="text-h2 font-display font-semibold text-text-primary mb-6">
          Swap Details
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-small">Exchange Rate</span>
            <div className="text-text-primary font-mono text-small">
              1 {fromAsset} = {currentRate.toFixed(6)} {toAsset}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-small">Price Impact</span>
            <div className="text-text-primary font-mono text-small">
              {priceImpact.toFixed(2)}%
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-small">Estimated Gas Fee</span>
            <div className="text-text-primary font-mono text-small">
              {formatCurrency(estimatedGas)}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-small">Minimum Received</span>
            <div className="text-text-primary font-mono text-small">
              {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toAsset}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-small">Transaction Time</span>
            <div className="text-text-primary font-mono text-small">
              {fromChain !== toChain ? '5-10 min' : '30-60 sec'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};