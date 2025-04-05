'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { SupportedTokenSymbol, SUPPORTED_TOKENS } from '@/config/tokens'
import { LoadingSpinner } from './LoadingSpinner'

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

interface TokenBalanceProps {
  symbol: string
  className?: string
  onBalanceChange?: (balance: string) => void
}

export function TokenBalance({ symbol, className = '', onBalanceChange }: TokenBalanceProps) {
  const { provider, address } = useWeb3()
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !address) {
        setBalance(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const token = SUPPORTED_TOKENS[symbol as keyof typeof SUPPORTED_TOKENS]
        if (!token) {
          throw new Error(`Token ${symbol} not found in supported tokens`)
        }

        let tokenBalance: ethers.BigNumber
        let decimals: number

        if (token.address === '0x0000000000000000000000000000000000000000') {
          // Native token (MON)
          tokenBalance = await provider.getBalance(address)
          decimals = 18
        } else {
          // ERC20 token
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
          tokenBalance = await tokenContract.balanceOf(address)
          decimals = await tokenContract.decimals()
        }

        const formattedBalance = ethers.utils.formatUnits(tokenBalance, decimals)
        setBalance(formattedBalance)
        onBalanceChange?.(formattedBalance)
        
        console.log(`${symbol} balance for ${address}:`, formattedBalance)
      } catch (err) {
        console.error(`Error fetching ${symbol} balance:`, err)
        setError(err instanceof Error ? err.message : 'Failed to fetch balance')
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [provider, address, symbol, onBalanceChange])

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-gray-500">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading balance
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="flex items-center space-x-1">
        <span className="text-gray-500">0.00</span>
        <span className="text-gray-500">{symbol}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="font-medium text-gray-900 dark:text-white">
        {parseFloat(balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}
      </span>
      <span className="text-gray-500">{symbol}</span>
    </div>
  )
} 