'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Navigation } from '@/components/Navigation'
import { TokenSelector } from '@/components/TokenSelector'
import { TokenBalance } from '@/components/TokenBalance'
import { TokenMinter } from '@/components/TokenMinter'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TransactionProgress } from '@/components/TransactionProgress'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { useUniswap } from '@/lib/hooks/useUniswap'
import { SUPPORTED_TOKENS } from '@/lib/config'
import TokenCache from '@/lib/utils/TokenCache'
import TransactionManager from '@/lib/utils/TransactionManager'

interface TransactionState {
  status: 'pending' | 'success' | 'error'
  message: string
  txHash?: string
}

export default function Liquidity() {
  const { provider, address, signer } = useWeb3()
  const { addLiquidity, getPair, createPair, getReserves } = useUniswap()

  const [tokenA, setTokenA] = useState({
    symbol: 'MON',
    amount: '',
    balance: '0',
    address: '0x0000000000000000000000000000000000000000'
  })

  const [tokenB, setTokenB] = useState({
    symbol: 'USDC',
    amount: '',
    balance: '0',
    address: SUPPORTED_TOKENS.USDC.address
  })

  const [slippage, setSlippage] = useState('0.5')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<TransactionState | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Effect to update token balances directly from blockchain
  useEffect(() => {
    if (!address || !provider) return

    const updateBalances = async () => {
      try {
        // Get Token A balance
        let balanceA: ethers.BigNumber
        if (tokenA.address === '0x0000000000000000000000000000000000000000') {
          balanceA = await provider.getBalance(address)
        } else {
          const contractA = new ethers.Contract(
            tokenA.address,
            ['function balanceOf(address) view returns (uint256)'],
            provider
          )
          balanceA = await contractA.balanceOf(address)
        }

        // Get Token B balance
        const contractB = new ethers.Contract(
          tokenB.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        const balanceB = await contractB.balanceOf(address)

        setTokenA(prev => ({
          ...prev,
          balance: ethers.utils.formatUnits(balanceA, SUPPORTED_TOKENS[prev.symbol].decimals)
        }))

        setTokenB(prev => ({
          ...prev,
          balance: ethers.utils.formatUnits(balanceB, SUPPORTED_TOKENS[prev.symbol].decimals)
        }))
      } catch (error) {
        console.error('Error updating balances:', error)
      }
    }

    updateBalances()
    const interval = setInterval(updateBalances, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [address, provider, tokenA.address, tokenB.address])

  // Effect to auto-calculate Token B amount based on Token A
  useEffect(() => {
    const calculateTokenBAmount = async () => {
      if (!tokenA.amount || !tokenA.symbol || !tokenB.symbol) {
        setTokenB(prev => ({ ...prev, amount: '' }))
        return
      }

      try {
        const amountA = parseFloat(tokenA.amount)
        if (isNaN(amountA) || amountA <= 0) {
          setTokenB(prev => ({ ...prev, amount: '' }))
          return
        }

        // Get the pair address and check if it exists
        const pair = await getPair(tokenA.symbol, tokenB.symbol)
        const pairExists = pair && pair !== ethers.constants.AddressZero

        let amountB: number
        if (pairExists) {
          // If pair exists, get the reserves and calculate based on current ratio
          const [reserve0, reserve1] = await getReserves(tokenA.symbol, tokenB.symbol)
          if (reserve0.gt(0) && reserve1.gt(0)) {
            const tokenADecimals = SUPPORTED_TOKENS[tokenA.symbol].decimals
            const tokenBDecimals = SUPPORTED_TOKENS[tokenB.symbol].decimals
            
            // Convert amount to BigNumber with proper decimals
            const amountABN = ethers.utils.parseUnits(amountA.toString(), tokenADecimals)
            
            // Calculate amountB based on x * y = k formula
            const amountBBN = amountABN.mul(reserve1).div(reserve0)
            amountB = parseFloat(ethers.utils.formatUnits(amountBBN, tokenBDecimals))
          } else {
            // Use predefined ratios if reserves are empty
            amountB = calculateInitialRatio(amountA, tokenA.symbol, tokenB.symbol)
          }
        } else {
          // For initial liquidity, use predefined ratios
          amountB = calculateInitialRatio(amountA, tokenA.symbol, tokenB.symbol)
        }

        // Format to appropriate number of decimals
        const decimals = SUPPORTED_TOKENS[tokenB.symbol].decimals
        const formattedAmount = amountB.toFixed(Math.min(decimals, 6))
        
        setTokenB(prev => ({ ...prev, amount: formattedAmount }))
        setError(null)
      } catch (error) {
        console.error('Error calculating token B amount:', error)
        setError('Error calculating amount')
        setTokenB(prev => ({ ...prev, amount: '' }))
      }
    }

    calculateTokenBAmount()
  }, [tokenA.amount, tokenA.symbol, tokenB.symbol, getPair, getReserves])

  // Helper function to calculate initial ratios
  const calculateInitialRatio = (amountA: number, tokenASymbol: string, tokenBSymbol: string): number => {
    if (tokenASymbol === 'MON') {
      if (tokenBSymbol === 'USDC' || tokenBSymbol === 'USDT') {
        return amountA * 5000 // 1 MON = 5000 USDC/USDT
      }
    } else if (tokenBSymbol === 'MON') {
      if (tokenASymbol === 'USDC' || tokenASymbol === 'USDT') {
        return amountA / 5000 // 5000 USDC/USDT = 1 MON
      }
    } else if ((tokenASymbol === 'USDC' && tokenBSymbol === 'USDT') ||
               (tokenASymbol === 'USDT' && tokenBSymbol === 'USDC')) {
      return amountA // 1:1 ratio for stablecoins
    }
    return amountA // Default 1:1 ratio
  }

  const handleCreatePool = async () => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setTransaction({
        status: 'pending',
        message: 'Creating liquidity pool...',
      })

      const tx = await createPair(tokenA.symbol, tokenB.symbol)
      await tx.wait()
      
      setTransaction({
        status: 'success',
        message: 'Liquidity pool created successfully!',
        txHash: tx.hash,
      })

      // After pool creation, try adding liquidity
      await handleAddLiquidity()
    } catch (error) {
      console.error('Error creating pool:', error)
      setTransaction({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create pool',
      })
      setError(error instanceof Error ? error.message : 'Failed to create pool')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!address || !signer) {
      setError('Please connect your wallet first')
      return
    }

    if (!tokenA.amount || !tokenB.amount) {
      setError('Please enter both token amounts')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setTransaction({
        status: 'pending',
        message: 'Checking balances and approvals...'
      })

      // Validate balances
      const tokenABalance = parseFloat(tokenA.balance)
      const tokenBBalance = parseFloat(tokenB.balance)
      const tokenAAmount = parseFloat(tokenA.amount)
      const tokenBAmount = parseFloat(tokenB.amount)

      if (tokenAAmount > tokenABalance) {
        throw new Error(`Insufficient ${tokenA.symbol} balance`)
      }

      if (tokenBAmount > tokenBBalance) {
        throw new Error(`Insufficient ${tokenB.symbol} balance`)
      }

      // Check if pool exists
      const pair = await getPair(tokenA.symbol, tokenB.symbol)
      const isInitialLiquidity = !pair || pair === ethers.constants.AddressZero

      // If pool doesn't exist, create it first
      if (isInitialLiquidity) {
        setTransaction({
          status: 'pending',
          message: 'Creating liquidity pool...'
        })

        const createTx = await createPair(tokenA.symbol, tokenB.symbol)
        await createTx.wait()

        setTransaction({
          status: 'pending',
          message: 'Pool created, adding initial liquidity...'
        })
      } else {
        setTransaction({
          status: 'pending',
          message: 'Adding liquidity to existing pool...'
        })
      }

      // Add liquidity with higher gas limit for safety
      const tx = await addLiquidity(
        tokenA.symbol,
        tokenB.symbol,
        tokenA.amount,
        tokenB.amount,
        slippage,
        {
          gasLimit: 500000
        }
      )

      setTransaction({
        status: 'pending',
        message: 'Waiting for transaction confirmation...',
        txHash: tx.hash
      })

      await tx.wait()

      setTransaction({
        status: 'success',
        message: 'Successfully added liquidity!',
        txHash: tx.hash
      })

      // Reset form
      setTokenA(prev => ({ ...prev, amount: '' }))
      setTokenB(prev => ({ ...prev, amount: '' }))
    } catch (error: any) {
      console.error('Error adding liquidity:', error)
      let errorMessage = 'Failed to add liquidity'

      if (error.message?.includes('INSUFFICIENT_B_AMOUNT')) {
        errorMessage = 'The ratio of tokens is incorrect. Please adjust the amounts.'
      } else if (error.message?.includes('insufficient balance')) {
        errorMessage = error.message
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient MON for gas fees'
      }

      setError(errorMessage)
      setTransaction({
        status: 'error',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const slippageOptions = ['0.5', '1', '2', '3']

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Liquidity</h2>
            
            {/* Add TokenMinter at the top */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Need test tokens?
              </h3>
              <TokenMinter />
            </div>

            {transaction && (
              <div className="mb-6">
                <TransactionStatus
                  status={transaction.status}
                  message={transaction.message}
                  txHash={transaction.txHash}
                  onClose={() => setTransaction(null)}
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Liquidity</h1>
              </div>

              {/* Token A */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Token A</span>
                  <TokenBalance symbol={tokenA.symbol} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tokenA.amount}
                    onChange={(e) => setTokenA(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl outline-none text-gray-900 dark:text-white"
                  />
                  <TokenSelector
                    selectedToken={tokenA.symbol}
                    onSelect={(symbol) => setTokenA(prev => ({ ...prev, symbol }))}
                    excludeToken={tokenB.symbol}
                  />
                </div>
              </div>

              {/* Token B */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Token B</span>
                  <TokenBalance symbol={tokenB.symbol} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tokenB.amount}
                    onChange={(e) => setTokenB(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl outline-none text-gray-900 dark:text-white"
                  />
                  <TokenSelector
                    selectedToken={tokenB.symbol}
                    onSelect={(symbol) => setTokenB(prev => ({ ...prev, symbol }))}
                    excludeToken={tokenA.symbol}
                  />
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Slippage Tolerance</span>
                  <div className="flex gap-2">
                    {slippageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSlippage(option)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          slippage === option
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {option}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500">{error}</p>
                  {error.includes('pool does not exist') && (
                    <button
                      onClick={handleCreatePool}
                      className="mt-2 w-full btn-primary bg-red-500 hover:bg-red-600"
                    >
                      Create Pool
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleAddLiquidity}
                disabled={!address || loading || transaction?.status === 'pending'}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {transaction?.status === 'pending' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </div>
                ) : loading ? (
                  'Loading...'
                ) : !address ? (
                  'Connect Wallet'
                ) : (
                  'Add Liquidity'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 