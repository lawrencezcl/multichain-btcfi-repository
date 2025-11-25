// React Hooks for ICP Canister Integration
import { useState, useEffect, useCallback } from 'react';
import { getCanisterClient, MarketData, UserPosition, Transaction, SystemStatus, RiskMetrics } from '../lib/canister-client';
import { initializeICP } from '../lib/icp-agent';

// Hook for ICP initialization
export const useICPInitialize = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeICP()
      .then(() => setIsInitialized(true))
      .catch((err) => {
        console.error('ICP initialization failed:', err);
        setError(err.message);
      });
  }, []);

  return { isInitialized, error };
};

// Hook for market data
export const useMarketData = () => {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const client = await getCanisterClient();
      const marketData = await client.getMarketData();
      setData(marketData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch market data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return { data, loading, error, refetch: fetchMarketData };
};

// Hook for user positions
export const useUserPositions = (userId: string | null) => {
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!userId) {
      setPositions([]);
      return;
    }

    try {
      setLoading(true);
      const client = await getCanisterClient();
      const userPositions = await client.getUserPositions(userId);
      setPositions(userPositions);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user positions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return { positions, loading, error, refetch: fetchPositions };
};

// Hook for transaction history
export const useTransactionHistory = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      const client = await getCanisterClient();
      const txHistory = await client.getUserTransactions(userId);
      setTransactions(txHistory);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
};

// Hook for system status
export const useSystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const client = await getCanisterClient();
      const systemStatus = await client.getSystemStatus();
      setStatus(systemStatus);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch system status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
};

// Hook for risk metrics
export const useRiskMetrics = (userId: string | null) => {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!userId) {
      setMetrics(null);
      return;
    }

    try {
      setLoading(true);
      const client = await getCanisterClient();
      const riskMetrics = await client.getRiskMetrics(userId);
      setMetrics(riskMetrics);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch risk metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMetrics();
    
    // Poll every 15 seconds for risk metrics
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};