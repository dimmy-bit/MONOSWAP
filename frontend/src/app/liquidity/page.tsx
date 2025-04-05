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
import { SUPPORTED_TOKENS, SupportedTokenSymbol } from '@/config/tokens'
import { useAccount } from '@/lib/hooks/useAccount'
import { useTokens, TokenState } from '@/lib/hooks/useTokens'

interface TransactionState {
  status: 'pending' | 'success' | 'error'
  message: string
  txHash?: string
}

export default function Liquidity() {
  const { provider, address, signer } = useWeb3()
  const { addLiquidity, getPair, createPair, getReserves } = useUniswap()
  const { account } = useAccount()
  const { tokenA, tokenB, setTokenA, setTokenB } = useTokens()

  const [slippage, setSlippage] = useState('0.5')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<TransactionState | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Effect to update token balances directly from blockchain
  useEffect(() => {
    if (!account || !provider) return

    const updateBalances = async () => {
      try {
        // Get Token A balance
        const contractA = new ethers.Contract(
          tokenA.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        const balanceA = await contractA.balanceOf(account)

        // Get Token B balance
        const contractB = new ethers.Contract(
          tokenB.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        const balanceB = await contractB.balanceOf(account)

        setTokenA((prev: TokenState): TokenState => {
          return {
            ...prev,
            symbol: prev.symbol, // Preserve the symbol type
            balance: ethers.utils.formatUnits(
              balanceA,
              SUPPORTED_TOKENS[prev.symbol].decimals
            )
          }
        })

        setTokenB((prev: TokenState): TokenState => {
          return {
            ...prev,
            symbol: prev.symbol, // Preserve the symbol type
            balance: ethers.utils.formatUnits(
              balanceB,
              SUPPORTED_TOKENS[prev.symbol].decimals
            )
          }
        })
      } catch (error) {
        console.error('Error updating balances:', error)
      }
    }

    updateBalances()
    const interval = setInterval(updateBalances, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [account, provider, tokenA.address, tokenB.address, setTokenA, setTokenB])

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
            const tokenADecimals = SUPPORTED_TOKENS[tokenA.symbol as SupportedTokenSymbol].decimals
            const tokenBDecimals = SUPPORTED_TOKENS[tokenB.symbol as SupportedTokenSymbol].decimals
            
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
        const decimals:any = SUPPORTED_TOKENS[tokenB.symbol as SupportedTokenSymbol].decimals
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
    const tokenADecimals = SUPPORTED_TOKENS[tokenASymbol as SupportedTokenSymbol].decimals
    const tokenBDecimals = SUPPORTED_TOKENS[tokenBSymbol as SupportedTokenSymbol].decimals

    // Convert amount to a decimal-adjusted value
    const adjustedAmountA = amountA * Math.pow(10, tokenADecimals)

    let ratio: number
    if (tokenASymbol === 'MON') {
      if (tokenBSymbol === 'USDC' || tokenBSymbol === 'USDT') {
        ratio = 5000 // 1 MON = 5000 USDC/USDT
      } else {
        ratio = 1 // Default 1:1 ratio
      }
    } else if (tokenBSymbol === 'MON') {
      if (tokenASymbol === 'USDC' || tokenASymbol === 'USDT') {
        ratio = 1 / 5000 // 5000 USDC/USDT = 1 MON
      } else {
        ratio = 1 // Default 1:1 ratio
      }
    } else if ((tokenASymbol === 'USDC' && tokenBSymbol === 'USDT') ||
               (tokenASymbol === 'USDT' && tokenBSymbol === 'USDC')) {
      ratio = 1 // 1:1 ratio for stablecoins
    } else {
      ratio = 1 // Default 1:1 ratio
    }

    // Adjust the ratio based on token decimals
    const decimalAdjustment = Math.pow(10, tokenBDecimals - tokenADecimals)
    const result = (adjustedAmountA * ratio * decimalAdjustment) / Math.pow(10, tokenADecimals)

    // Round to appropriate number of decimals
    const significantDecimals = Math.min(tokenBDecimals, 6)
    return parseFloat(result.toFixed(significantDecimals))
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

      // Validate amounts
      const tokenAAmount = parseFloat(tokenA.amount)
      const tokenBAmount = parseFloat(tokenB.amount)

      if (isNaN(tokenAAmount) || isNaN(tokenBAmount)) {
        throw new Error('Invalid amount entered')
      }

      if (tokenAAmount <= 0 || tokenBAmount <= 0) {
        throw new Error('Amounts must be greater than 0')
      }

      // Check balances
      if (tokenA.symbol === 'MON') {
        if (!provider) throw new Error('Provider not available')
        const monBalance = await provider.getBalance(address)
        const requiredAmount = ethers.utils.parseEther(tokenA.amount)
        if (monBalance.lt(requiredAmount)) {
          throw new Error(`Insufficient MON balance. You have ${ethers.utils.formatEther(monBalance)} MON but trying to add ${tokenA.amount}`)
        }
      } else {
        if (!provider) throw new Error('Provider not available')
        const tokenAContract = new ethers.Contract(
          tokenA.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        const balanceA = await tokenAContract.balanceOf(address)
        const requiredAmountA = ethers.utils.parseUnits(tokenA.amount, SUPPORTED_TOKENS[tokenA.symbol].decimals)
        if (balanceA.lt(requiredAmountA)) {
          throw new Error(`Insufficient ${tokenA.symbol} balance`)
        }
      }

      if (tokenB.symbol === 'MON') {
        if (!provider) throw new Error('Provider not available')
        const monBalance = await provider.getBalance(address)
        const requiredAmount = ethers.utils.parseEther(tokenB.amount)
        if (monBalance.lt(requiredAmount)) {
          throw new Error(`Insufficient MON balance. You have ${ethers.utils.formatEther(monBalance)} MON but trying to add ${tokenB.amount}`)
        }
      } else {
        if (!provider) throw new Error('Provider not available')
        const tokenBContract = new ethers.Contract(
          tokenB.address,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        const balanceB = await tokenBContract.balanceOf(address)
        const requiredAmountB = ethers.utils.parseUnits(tokenB.amount, SUPPORTED_TOKENS[tokenB.symbol].decimals)
        if (balanceB.lt(requiredAmountB)) {
          throw new Error(`Insufficient ${tokenB.symbol} balance`)
        }
      }

      // Check if pool exists
      const pair = await getPair(tokenA.symbol, tokenB.symbol)
      const isInitialLiquidity = !pair || pair === ethers.constants.AddressZero

      // If pool doesn't exist, create it first
      if (isInitialLiquidity) {
        setTransaction({
          status: 'pending',
          message: 'Creating new liquidity pool...'
        })

        try {
          const createTx = await createPair(tokenA.symbol, tokenB.symbol)
          setTransaction({
            status: 'pending',
            message: 'Waiting for pool creation...',
            txHash: createTx.hash
          })
          await createTx.wait()

          setTransaction({
            status: 'pending',
            message: 'Pool created, adding initial liquidity...'
          })
        } catch (error: any) {
          if (error.message?.includes('pair exists')) {
            // Pool was created in another transaction, continue with adding liquidity
            console.log('Pool already exists, continuing with liquidity addition')
          } else {
            throw error
          }
        }
      }

      // Add liquidity with higher gas limit for safety
      setTransaction({
        status: 'pending',
        message: 'Adding liquidity...'
      })

      const tx = await addLiquidity(
        tokenA.symbol,
        tokenB.symbol,
        tokenA.amount,
        tokenB.amount,
        slippage,
        {
          gasLimit: 1000000 // Increased gas limit further for safety
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
        errorMessage = 'The ratio of tokens is incorrect. Please adjust the amounts to match the current pool ratio.'
      } else if (error.message?.includes('INSUFFICIENT_A_AMOUNT')) {
        errorMessage = 'The ratio of tokens is incorrect. Please adjust the amounts to match the current pool ratio.'
      } else if (error.message?.includes('INSUFFICIENT_LIQUIDITY_MINTED')) {
        errorMessage = 'Amount too small to add liquidity. Please increase the amounts.'
      } else if (error.message?.includes('insufficient balance')) {
        errorMessage = error.message
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient MON for gas fees'
      } else if (error.message?.includes('gas required exceeds')) {
        errorMessage = 'Transaction requires more gas. Please try increasing the gas limit.'
      } else if (error.message?.includes('nonce')) {
        errorMessage = 'Transaction nonce error. Please try refreshing the page.'
      } else if (error.message?.includes('Token approval rejected')) {
        errorMessage = error.message
      } else if (error.message?.includes('Failed to approve token')) {
        errorMessage = 'Failed to approve token. Please try again.'
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please try again with different amounts.'
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
                    onSelect={(symbol) => 
                      setTokenA(prev => ({ 
                        ...prev, 
                        symbol,
                        address: symbol === 'MON' 
                          ? '0x0000000000000000000000000000000000000000'
                          : SUPPORTED_TOKENS[symbol].address
                      }))
                    }
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
                    onSelect={(symbol) => 
                      setTokenB(prev => ({ 
                        ...prev, 
                        symbol,
                        address: symbol === 'MON' 
                          ? '0x0000000000000000000000000000000000000000'
                          : SUPPORTED_TOKENS[symbol].address
                      }))
                    }
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