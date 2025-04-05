export type SupportedTokenSymbol = 'MON' | 'WMON' | 'USDC' | 'USDT'

export interface TokenConfig {
  name: string
  symbol: SupportedTokenSymbol
  decimals: number
  address: string
  logo: string
  color: string
}

export const SUPPORTED_TOKENS: Record<SupportedTokenSymbol, TokenConfig> = {
  MON: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    logo: '/tokens/mon.svg',
    color: '#1A0B3B'
  },
  WMON: {
    name: 'Wrapped MON',
    symbol: 'WMON',
    decimals: 18,
    address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    logo: '/tokens/wmon.svg',
    color: '#1A0B3B'
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x0b34a08730f7dcf1130629Ca2ed5Bc9c8f5Aa435',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    color: '#2775CA'
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: '0x69d8FdC9E0bFe943a9987402DF71feF7f7E468F5',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    color: '#26A17B'
  }
} as const

export interface TokenState {
  symbol: SupportedTokenSymbol
  amount: string
  balance: string
  address: string
} 