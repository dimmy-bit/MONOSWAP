import { useState } from 'react'
import { SUPPORTED_TOKENS, SupportedTokenSymbol } from '@/config/tokens'

export interface TokenState {
  symbol: SupportedTokenSymbol
  amount: string
  balance: string
  address: string
}

export function useTokens() {
  const [tokenA, setTokenA] = useState<TokenState>({
    symbol: 'MON',
    amount: '',
    balance: '0',
    address: '0x0000000000000000000000000000000000000000'
  })

  const [tokenB, setTokenB] = useState<TokenState>({
    symbol: 'USDC',
    amount: '',
    balance: '0',
    address: SUPPORTED_TOKENS.USDC.address
  })

  return {
    tokenA,
    tokenB,
    setTokenA,
    setTokenB
  }
} 