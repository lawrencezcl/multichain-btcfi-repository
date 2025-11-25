// ICP Agent Configuration
// This file sets up the ICP agent for canister communication

import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Environment configuration
const IC_HOST = import.meta.env.VITE_IC_HOST || 'https://ic0.app';
const IS_LOCAL = import.meta.env.VITE_IC_HOST?.includes('localhost');

// Canister IDs from environment
export const CANISTER_IDS = {
  lending_engine: import.meta.env.VITE_LENDING_ENGINE_CANISTER_ID || '',
  cross_chain_handler: import.meta.env.VITE_CROSS_CHAIN_HANDLER_CANISTER_ID || '',
  bitcoin_handler: import.meta.env.VITE_BITCOIN_HANDLER_CANISTER_ID || '',
  risk_manager: import.meta.env.VITE_RISK_MANAGER_CANISTER_ID || '',
};

// Create and configure the HTTP agent
let agent: HttpAgent | null = null;

export const createAgent = async (): Promise<HttpAgent> => {
  if (agent) {
    return agent;
  }

  agent = new HttpAgent({
    host: IC_HOST,
  });

  // Fetch root key for local development (NEVER in production)
  if (IS_LOCAL) {
    await agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Check your local replica is running.');
      console.error(err);
    });
  }

  return agent;
};

// Get the agent instance
export const getAgent = async (): Promise<HttpAgent> => {
  if (!agent) {
    return await createAgent();
  }
  return agent;
};

// Create an actor for a specific canister
export const createActor = async <T>(
  canisterId: string,
  idlFactory: any
): Promise<T> => {
  const currentAgent = await getAgent();
  
  return Actor.createActor<T>(idlFactory, {
    agent: currentAgent,
    canisterId: Principal.fromText(canisterId),
  });
};

// Validate canister IDs are configured
export const validateCanisterIds = (): boolean => {
  const missing = Object.entries(CANISTER_IDS)
    .filter(([_, id]) => !id)
    .map(([name]) => name);

  if (missing.length > 0) {
    console.error('Missing canister IDs:', missing);
    return false;
  }

  return true;
};

// Initialize the ICP connection
export const initializeICP = async (): Promise<void> => {
  if (!validateCanisterIds()) {
    throw new Error('Canister IDs not configured. Please check environment variables.');
  }

  await createAgent();
  console.log('ICP agent initialized successfully');
};