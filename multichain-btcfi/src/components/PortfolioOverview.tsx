import React from 'react';
import { useData } from '../contexts/DataContext';
import { useWallet } from '../contexts/WalletContext';

export const PortfolioOverview: React.FC = () => {
  const { healthMetrics, protocolStats } = useData();
  const { wallet } = useWallet();

  const getHealthFactorClass = (factor: number) => {
    if (factor >= 2) return 'health-good';
    if (factor >= 1.5) return 'health-warning';
    return 'health-danger';
  };

  const getHealthFactorText = (factor: number) => {
    if (factor >= 2) return 'Excellent';
    if (factor >= 1.5) return 'Good';
    if (factor >= 1.2) return 'Fair';
    return 'Risk';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const metrics = [
    {
      title: 'Total Portfolio Value',
      value: wallet ? formatCurrency(wallet.balanceUSD) : formatCurrency(healthMetrics.totalCollateralUSD),
      change: '+4.2%',
      changeType: 'positive' as const,
      icon: '💎',
      description: 'Across all chains'
    },
    {
      title: 'Health Factor',
      value: healthMetrics.overallHealthFactor.toFixed(2),
      change: getHealthFactorText(healthMetrics.overallHealthFactor),
      changeType: healthMetrics.overallHealthFactor >= 2 ? 'positive' : healthMetrics.overallHealthFactor >= 1.5 ? 'warning' : 'negative' as const,
      icon: '🛡️',
      description: 'Liquidation safety'
    },
    {
      title: 'Net APY',
      value: formatPercentage(healthMetrics.netAPY),
      change: '+0.3%',
      changeType: 'positive' as const,
      icon: '📈',
      description: 'Portfolio return'
    },
    {
      title: 'Total Debt',
      value: formatCurrency(healthMetrics.totalDebtUSD),
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: '💰',
      description: 'Outstanding loans'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="text-2xl">{metric.icon}</div>
            <div className="flex items-center space-x-1">
              {metric.changeType === 'positive' && (
                <svg className="w-4 h-4 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {metric.changeType === 'negative' && (
                <svg className="w-4 h-4 text-semantic-danger" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {metric.changeType === 'warning' && (
                <svg className="w-4 h-4 text-semantic-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-small font-medium ${
                metric.changeType === 'positive' ? 'text-semantic-success' : 
                metric.changeType === 'negative' ? 'text-semantic-danger' : 'text-semantic-warning'
              }`}>
                {metric.change}
              </span>
            </div>
          </div>
          
          <div className="mb-2">
            <h3 className="text-text-secondary text-small uppercase tracking-wider font-semibold mb-1">
              {metric.title}
            </h3>
            <p className="text-text-primary text-h1 font-display font-bold leading-none">
              {metric.value}
            </p>
          </div>
          
          <p className="text-text-tertiary text-small">
            {metric.description}
          </p>
          
          {/* Health factor specific styling */}
          {metric.title === 'Health Factor' && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-semantic-success"></div>
              <span className="text-small text-text-secondary">
                {formatPercentage(healthMetrics.overallHealthFactor * 25)} safe
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};