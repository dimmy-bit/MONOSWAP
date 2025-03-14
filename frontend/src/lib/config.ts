import { ADDRESSES } from './contracts/addresses'

export const MONAD_CONFIG = {
  chainId: 10143,
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://explorer.monad.xyz/'],
}

type TokenConfig = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logo: string;
  color: string;
}

export const SUPPORTED_TOKENS: { [key: string]: TokenConfig } = {
  MON: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native token
    logo: '/tokens/mon.svg',
    color: '#1A0B3B',
  },
  WMON: {
    name: 'Wrapped MON',
    symbol: 'WMON',
    decimals: 18,
    address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    logo: '/tokens/wmon.svg',
    color: '#1A0B3B',
  },
  USDC: {
    name: 'USD Coin',
    decimals: 6,
    symbol: 'USDC',
    address: '0x0b34a08730f7dcf1130629Ca2ed5Bc9c8f5Aa435',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    color: '#2775CA',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: '0x69d8FdC9E0bFe943a9987402DF71feF7f7E468F5',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    color: '#26A17B',
  },
}

// Updated Liquidity Pools with correct naming
export const LIQUIDITY_POOLS = [
  {
    id: 1,
    name: 'MON-USDC',
    token0: 'MON',
    token1: 'USDC',
    fee: 0.3,
  },
  {
    id: 2,
    name: 'MON-USDT',
    token0: 'MON',
    token1: 'USDT',
    fee: 0.3,
  },
  {
    id: 3,
    name: 'USDC-USDT',
    token0: 'USDC',
    token1: 'USDT',
    fee: 0.3,
  },
] as const

// Contract Addresses
export const UNISWAP_ADDRESSES = {
  FACTORY: '0x733e88f248b742db6c14c0b1713af5ad7fdd59d0',
  ROUTER: '0xfb8e1c3b833f9e67a71c859a132cf783b645e436',
  WMON: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
  INIT_CODE_HASH: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
}

// Staking Addresses
export const STAKING_ADDRESSES = {
  STAKING_FACTORY: process.env.NEXT_PUBLIC_STAKING_FACTORY_ADDRESS,
  REWARD_TOKEN: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS,
}

// Default settings
export const DEFAULT_SLIPPAGE = 0.5 // 0.5%
export const DEFAULT_DEADLINE = 20 * 60 // 20 minutes
export const GAS_LIMIT_ADJUSTMENT = 1.2 // 20% adjustment for gas limit