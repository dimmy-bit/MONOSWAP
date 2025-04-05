'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { SupportedTokenSymbol, SUPPORTED_TOKENS } from '@/config/tokens'
import { LoadingSpinner } from './LoadingSpinner'
import { TransactionStatus } from './TransactionStatus'

const TEST_TOKEN_ABI = [
  'function mint(address to, uint256 amount) external',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
  'function mintingEnabled() view returns (bool)'
]

interface TransactionState {
  status: 'pending' | 'success' | 'error'
  message: string
  txHash?: string
}

export function TokenMinter() {
  const { provider, address } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<TransactionState | null>(null)

  const checkBalance = useCallback(async (tokenAddress: string, tokenSymbol: string) => {
    if (!provider || !address) return '0'

    try {
      const tokenContract = new ethers.Contract(tokenAddress, TEST_TOKEN_ABI, provider)
      const balance = await tokenContract.balanceOf(address)
      const decimals = await tokenContract.decimals()
      return ethers.utils.formatUnits(balance, decimals)
    } catch (err) {
      console.error(`Error checking ${tokenSymbol} balance:`, err)
      return '0'
    }
  }, [provider, address])

  const handleMint = async (token: 'USDC' | 'USDT') => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setError(null)
      setTransaction({
        status: 'pending',
        message: `Minting test ${token}...`,
      })
      let tokenContract
      if (provider) {
        tokenContract = new ethers.Contract(
          SUPPORTED_TOKENS[token].address,
          TEST_TOKEN_ABI,
          provider.getSigner()
        )
      }
      if (tokenContract) {
        // Check if minting is enabled
        const mintingEnabled = await tokenContract.mintingEnabled()
        if (!mintingEnabled) {
          throw new Error('Minting is currently disabled')
        }
        
        // Get current balance
        const balance = await tokenContract.balanceOf(address)
        const mintAmount = ethers.utils.parseUnits('500', SUPPORTED_TOKENS[token].decimals)
        
        // Check if already has sufficient balance
        if (balance.gte(mintAmount)) {
          setError(`You already have sufficient ${token} balance`)
          setTransaction(null)
          return
        }
        
        const tx = await tokenContract.mint(address, mintAmount)
        
        setTransaction({
          status: 'pending',
          message: `Waiting for ${token} mint transaction...`,
          txHash: tx.hash,
        })
        
        await tx.wait()
        
        setTransaction({
          status: 'success',
          message: `Successfully minted test ${token}!`,
          txHash: tx.hash,
        })
      }

      // Clear transaction after 5 seconds
      setTimeout(() => {
        setTransaction(null)
      }, 5000)
    } catch (error: any) {
      console.error(`Error minting ${token}:`, error)
      let errorMessage = `Failed to mint ${token}`

      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient MON for gas fees'
      } else if (error.message?.includes('minting is disabled')) {
        errorMessage = 'Token minting is currently disabled'
      }

      setTransaction({
        status: 'error',
        message: errorMessage
      })
      setError(errorMessage)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {transaction && (
        <TransactionStatus
          status={transaction.status}
          message={transaction.message}
          txHash={transaction.txHash}
          onClose={() => setTransaction(null)}
        />
      )}

      <div className="flex gap-4">
        <button
          onClick={() => handleMint('USDC')}
          disabled={!address || transaction?.status === 'pending'}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          Mint Test USDC
        </button>
        <button
          onClick={() => handleMint('USDT')}
          disabled={!address || transaction?.status === 'pending'}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          Mint Test USDT
        </button>
      </div>
    </div>
  )
} 