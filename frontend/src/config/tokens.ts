export type SupportedTokenSymbol = 'MON' | 'WMON' | 'USDC' | 'USDT'

export const SUPPORTED_TOKENS = {
  MON: {
    name: 'MON',
    symbol: 'MON' as SupportedTokenSymbol,
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    logo: '/tokens/mon.svg',
    color: '#1A0B3B'
  },
  WMON: {
    name: 'Wrapped MON',
    symbol: 'WMON' as SupportedTokenSymbol,
    decimals: 18,
    address: '0x...',  // Add your WMON contract address
    logo: '/tokens/wmon.svg',
    color: '#1A0B3B'
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC' as SupportedTokenSymbol,
    decimals: 6,
    address: '0x...',  // Add your USDC contract address
    logo: '/tokens/usdc.svg',
    color: '#2775CA'
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT' as SupportedTokenSymbol,
    decimals: 6,
    address: '0x...',  // Add your USDT contract address
    logo: '/tokens/usdt.svg',
    color: '#26A17B'
  }
} as const

export type Token = {
  symbol: SupportedTokenSymbol
  amount: string
  balance: string
  address: string
} 