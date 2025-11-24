import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowUpDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { bridgeAssets, resetBridgeState } from '@/store/slices/bridgeSlice';
import { formatEther, parseEther } from '@/utils/format';

interface CrossChainBridgeProps {
  className?: string;
}

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 56, name: 'Binance Smart Chain', symbol: 'BNB' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  { id: 80001, name: 'Polygon Mumbai', symbol: 'MATIC' },
];

const SUPPORTED_TOKENS = [
  { address: '0xA0b86a33E6441C4CB2C62C7E85a3bF1d3D7a5e4', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0xA0b86a33E6441C4CB2C62C7E85a3bF1d3D7a5e4', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x0000000000000000000000000000000000000000', name: 'Ethereum', symbol: 'ETH', decimals: 18 },
];

export const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    isConnected, 
    account, 
    balance, 
    chainId 
  } = useSelector((state: RootState) => state.wallet);
  
  const { 
    isLoading, 
    error, 
    transactionId, 
    transactionStatus 
  } = useSelector((state: RootState) => state.bridge);

  const [formData, setFormData] = useState({
    amount: '',
    fromChain: '',
    toChain: '',
    token: '',
    targetAddress: '',
  });
  
  const [fees, setFees] = useState({
    bridgeFee: '0',
    gasEstimate: '0',
    total: '0',
  });

  // Calculate fees when form data changes
  useEffect(() => {
    if (formData.amount && formData.fromChain && formData.toChain) {
      const amount = parseFloat(formData.amount);
      const bridgeFee = (amount * 0.01).toString(); // 1% bridge fee
      const gasEstimate = '0.001'; // Estimated gas in ETH
      const total = (amount + parseFloat(bridgeFee) + parseFloat(gasEstimate)).toString();
      
      setFees({
        bridgeFee,
        gasEstimate,
        total,
      });
    }
  }, [formData.amount, formData.fromChain, formData.toChain]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset fees when chain changes
    if (field === 'fromChain' || field === 'toChain') {
      setFees({ bridgeFee: '0', gasEstimate: '0', total: '0' });
    }
  }, []);

  const handleBridge = useCallback(async () => {
    if (!isConnected || !account) {
      console.error('Wallet not connected');
      return;
    }

    if (!formData.amount || !formData.toChain || !formData.token || !formData.targetAddress) {
      console.error('Missing required fields');
      return;
    }

    const amountWei = formData.token === '0x0000000000000000000000000000000000000000' 
      ? parseEther(formData.amount) 
      : ethers.parseUnits(formData.amount, 6); // For stablecoins

    try {
      await dispatch(bridgeAssets({
        token: formData.token,
        amount: amountWei.toString(),
        targetChain: parseInt(formData.toChain),
        targetAddress: formData.targetAddress,
        fromChain: parseInt(formData.fromChain),
      })).unwrap();

      // Reset form on success
      setFormData({
        amount: '',
        fromChain: '',
        toChain: '',
        token: '',
        targetAddress: '',
      });
      
    } catch (error) {
      console.error('Bridge failed:', error);
    }
  }, [isConnected, account, formData, dispatch]);

  const canBridge = useCallback(() => {
    return (
      isConnected &&
      formData.amount &&
      formData.fromChain &&
      formData.toChain &&
      formData.token &&
      formData.targetAddress &&
      parseFloat(formData.amount) > 0 &&
      formData.fromChain !== formData.toChain &&
      !isLoading
    );
  }, [isConnected, formData, isLoading]);

  const getCurrentChainName = useCallback(() => {
    const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
    return currentChain?.name || 'Unknown Network';
  }, [chainId]);

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Connect your wallet to start bridging assets across chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the bridge functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription>
          Bridge your assets across multiple blockchain networks
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Wallet Info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Current Chain</p>
            <p className="text-xs text-muted-foreground">{getCurrentChainName()}</p>
          </div>
        </div>

        {/* Bridge Form */}
        <div className="space-y-4">
          {/* From Chain */}
          <div className="space-y-2">
            <Label>From Chain</Label>
            <Select value={formData.fromChain} onValueChange={(value) => handleInputChange('fromChain', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    {chain.name} ({chain.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Chain */}
          <div className="space-y-2">
            <Label>To Chain</Label>
            <Select value={formData.toChain} onValueChange={(value) => handleInputChange('toChain', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS
                  .filter(chain => chain.id.toString() !== formData.fromChain)
                  .map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name} ({chain.symbol})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Token</Label>
            <Select value={formData.token} onValueChange={(value) => handleInputChange('token', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select token to bridge" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TOKENS.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.name} ({token.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              min="0"
              step="0.001"
            />
            <div className="text-xs text-muted-foreground">
              Available: {balance ? formatEther(balance) : '0.0'} tokens
            </div>
          </div>

          {/* Target Address */}
          <div className="space-y-2">
            <Label>Target Address</Label>
            <Input
              type="text"
              placeholder="0x... or Bitcoin address"
              value={formData.targetAddress}
              onChange={(e) => handleInputChange('targetAddress', e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Address on {SUPPORTED_CHAINS.find(c => c.id.toString() === formData.toChain)?.name || 'target chain'}
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        {fees.total !== '0' && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Estimated Fees</h4>
            <div className="flex justify-between text-sm">
              <span>Bridge Fee (1%):</span>
              <span>{fees.bridgeFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Gas Estimate:</span>
              <span>{fees.gasEstimate}</span>
            </div>
            <div className="flex justify-between font-medium text-sm border-t pt-2">
              <span>Total Cost:</span>
              <span>{fees.total}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Status */}
        {transactionId && (
          <Alert>
            {transactionStatus === 'completed' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <AlertDescription>
              {transactionStatus === 'completed' 
                ? `Bridge completed successfully! Transaction ID: ${transactionId}`
                : 'Bridge transaction in progress...'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleBridge}
          disabled={!canBridge()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bridging...
            </>
          ) : (
            'Start Bridge'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CrossChainBridge;