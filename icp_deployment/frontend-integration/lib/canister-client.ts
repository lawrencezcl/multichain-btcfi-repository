// Canister Client Wrapper
// Provides typed interfaces for canister interactions

import { createActor, CANISTER_IDS } from './icp-agent';

// Import IDL factories (these will be generated after deployment)
// For now, we'll define placeholder types
// TODO: Replace with actual generated IDL after running `dfx generate`

// Temporary IDL factories (replace with generated ones)
const lendingEngineIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    initialize: IDL.Func([], [IDL.Variant({ ok: IDL.Null, err: IDL.Text })], []),
    getMarketData: IDL.Func([], [IDL.Vec(IDL.Record({
      asset_id: IDL.Text,
      supply_apy: IDL.Float64,
      borrow_apy: IDL.Float64,
      total_supply: IDL.Float64,
      total_borrow: IDL.Float64,
      utilization: IDL.Float64,
    }))], ['query']),
    getUserPositions: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      position_id: IDL.Text,
      asset_id: IDL.Text,
      amount: IDL.Float64,
      health_factor: IDL.Float64,
    }))], ['query']),
  });
};

const crossChainHandlerIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    getSystemStatus: IDL.Func([], [IDL.Record({
      active_swaps: IDL.Nat64,
      total_transactions: IDL.Nat64,
      system_health: IDL.Text,
    })], ['query']),
    getUserTransactions: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      tx_id: IDL.Text,
      from_chain: IDL.Text,
      to_chain: IDL.Text,
      amount: IDL.Float64,
      status: IDL.Text,
      timestamp: IDL.Int,
    }))], ['query']),
  });
};

const riskManagerIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    getRiskMetrics: IDL.Func([IDL.Principal], [IDL.Record({
      health_factor: IDL.Float64,
      liquidation_risk: IDL.Text,
      total_collateral_value: IDL.Float64,
      total_debt_value: IDL.Float64,
    })], ['query']),
  });
};

// Type definitions for canister responses
export interface MarketData {
  asset_id: string;
  supply_apy: number;
  borrow_apy: number;
  total_supply: number;
  total_borrow: number;
  utilization: number;
}

export interface UserPosition {
  position_id: string;
  asset_id: string;
  amount: number;
  health_factor: number;
}

export interface Transaction {
  tx_id: string;
  from_chain: string;
  to_chain: string;
  amount: number;
  status: string;
  timestamp: bigint;
}

export interface SystemStatus {
  active_swaps: bigint;
  total_transactions: bigint;
  system_health: string;
}

export interface RiskMetrics {
  health_factor: number;
  liquidation_risk: string;
  total_collateral_value: number;
  total_debt_value: number;
}

// Canister client class
export class CanisterClient {
  private lendingEngineActor: any = null;
  private crossChainHandlerActor: any = null;
  private riskManagerActor: any = null;

  async initialize() {
    // Create actors for each canister
    this.lendingEngineActor = await createActor(
      CANISTER_IDS.lending_engine,
      lendingEngineIdlFactory
    );

    this.crossChainHandlerActor = await createActor(
      CANISTER_IDS.cross_chain_handler,
      crossChainHandlerIdlFactory
    );

    this.riskManagerActor = await createActor(
      CANISTER_IDS.risk_manager,
      riskManagerIdlFactory
    );
  }

  // Lending Engine Methods
  async getMarketData(): Promise<MarketData[]> {
    if (!this.lendingEngineActor) await this.initialize();
    return await this.lendingEngineActor.getMarketData();
  }

  async getUserPositions(userId: string): Promise<UserPosition[]> {
    if (!this.lendingEngineActor) await this.initialize();
    return await this.lendingEngineActor.getUserPositions(userId);
  }

  // Cross Chain Handler Methods
  async getSystemStatus(): Promise<SystemStatus> {
    if (!this.crossChainHandlerActor) await this.initialize();
    return await this.crossChainHandlerActor.getSystemStatus();
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    if (!this.crossChainHandlerActor) await this.initialize();
    return await this.crossChainHandlerActor.getUserTransactions(userId);
  }

  // Risk Manager Methods
  async getRiskMetrics(userId: string): Promise<RiskMetrics> {
    if (!this.riskManagerActor) await this.initialize();
    return await this.riskManagerActor.getRiskMetrics(userId);
  }
}

// Singleton instance
let canisterClient: CanisterClient | null = null;

export const getCanisterClient = async (): Promise<CanisterClient> => {
  if (!canisterClient) {
    canisterClient = new CanisterClient();
    await canisterClient.initialize();
  }
  return canisterClient;
};