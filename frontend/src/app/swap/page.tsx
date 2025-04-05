'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ArrowDownIcon } from '@heroicons/react/24/solid'
import { Navigation } from '@/components/Navigation'
import { TokenSelector } from '@/components/TokenSelector'
import { TokenBalance } from '@/components/TokenBalance'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { useUniswap } from '@/lib/hooks/useUniswap'
import { SupportedTokenSymbol, SUPPORTED_TOKENS } from '@/config/tokens'

interface SwapQuote {
  estimatedOutput: string
  priceImpact: string
  minimumReceived: string
  fee: string
}

interface TransactionState {
  status: 'pending' | 'success' | 'error'
  message: string
  txHash?: string
}

interface SwapState {
  tokenIn: SupportedTokenSymbol
  tokenOut: SupportedTokenSymbol
  amountIn: string
  amountOut: string
  loading: boolean
  error: string | null
}

export default function Swap() {
  const { address, signer } = useWeb3()
  const { getAmountOut, swap, createPair } = useUniswap()
  const [state, setState] = useState<SwapState>({
    tokenIn: 'MON',
    tokenOut: 'USDC',
    amountIn: '',
    amountOut: '',
    loading: false,
    error: null
  })
  const [slippage, setSlippage] = useState('0.5')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [transaction, setTransaction] = useState<TransactionState | null>(null)

  useEffect(() => {
    const updateQuote = async () => {
      if (!state.amountIn || parseFloat(state.amountIn) === 0) {
        setQuote(null)
        setState(prev => ({ ...prev, error: null }))
        return
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const output = await getAmountOut(state.amountIn, state.tokenIn, state.tokenOut)

        if (!output) {
          throw new Error('Failed to get quote')
        }

        setQuote({
          estimatedOutput: output,
          priceImpact: '0.1',
          minimumReceived: (parseFloat(output) * (1 - parseFloat(slippage) / 100)).toString(),
          fee: (parseFloat(state.amountIn) * 0.003).toString(),
        })
        setState(prev => ({ ...prev, amountOut: output }))
      } catch (error) {
        console.error('Error updating quote:', error)
        if (error instanceof Error) {
          setState(prev => ({ ...prev, error: error.message }))
        } else {
          setState(prev => ({ ...prev, error: 'Failed to get quote' }))
        }
        setQuote(null)
      } finally {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    updateQuote()
  }, [state.amountIn, state.tokenIn, state.tokenOut, slippage, getAmountOut])

  const handleCreatePool = async () => {
    if (!address || !signer) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setTransaction({
        status: 'pending',
        message: 'Creating liquidity pool...',
      })

      const tx = await createPair(state.tokenIn, state.tokenOut)

      setTransaction({
        status: 'success',
        message: 'Liquidity pool created successfully! You can now add liquidity.',
        txHash: tx.hash,
      })
    } catch (error) {
      console.error('Error creating pool:', error)
      setTransaction({
        status: 'error',
        message: 'Failed to create liquidity pool. Please try again.',
      })
    }
  }

  const handleSwap = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setTransaction({
        status: 'pending',
        message: 'Swapping tokens...',
      })

      const tx = await swap(
        state.tokenIn,
        state.tokenOut,
        state.amountIn,
        parseFloat(slippage)
      )

      setTransaction({
        status: 'success',
        message: 'Swap completed successfully!',
        txHash: tx.hash,
      })

      setState(prev => ({ ...prev, amountIn: '', amountOut: '' }))
    } catch (error) {
      console.error('Error executing swap:', error)
      setTransaction({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to execute swap',
      })
    }
  }

  const switchTokens = () => {
    if (state.loading) return // Prevent switching during loading
    setState(prev => ({
      ...prev,
      tokenIn: prev.tokenOut,
      tokenOut: prev.tokenIn,
      amountIn: prev.amountOut,
      amountOut: prev.amountIn
    }))
  }

  const slippageOptions = ['0.5', '1', '2', '3']

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Swap Tokens</h1>
            </div>

            {/* From Token */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">From</span>
                <TokenBalance symbol={state.tokenIn} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={state.amountIn}
                  onChange={(e) => setState(prev => ({ ...prev, amountIn: e.target.value }))}
                  placeholder="0.0"
                  disabled={state.loading}
                  className="w-full bg-transparent text-2xl outline-none text-gray-900 dark:text-white disabled:opacity-50"
                />
                <TokenSelector
                  selectedToken={state.tokenIn}
                  onSelect={(symbol) => setState(prev => ({ ...prev, tokenIn: symbol }))}
                  excludeToken={state.tokenOut}
                  disabled={state.loading}
                />
              </div>
            </div>

            {/* Switch Tokens Button */}
            <div className="flex justify-center -my-4 relative z-10">
              <button
                onClick={switchTokens}
                disabled={state.loading}
                className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mt-2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">To</span>
                <TokenBalance symbol={state.tokenOut} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-transparent text-2xl text-gray-900 dark:text-white">
                  {state.loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-500">Calculating...</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={state.amountOut}
                      readOnly
                      placeholder="0.0"
                      className="w-full bg-transparent outline-none"
                    />
                  )}
                </div>
                <TokenSelector
                  selectedToken={state.tokenOut}
                  onSelect={(symbol) => setState(prev => ({ ...prev, tokenOut: symbol }))}
                  excludeToken={state.tokenIn}
                  disabled={state.loading}
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
                      disabled={state.loading}
                      className={`px-3 py-1 rounded-lg text-sm ${slippage === option
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {option}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="mt-4 space-y-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price Impact</span>
                  <span className="text-gray-900 dark:text-white">{quote.priceImpact}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Minimum Received</span>
                  <span className="text-gray-900 dark:text-white">{quote.minimumReceived} {state.tokenOut}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Liquidity Provider Fee</span>
                  <span className="text-gray-900 dark:text-white">{quote.fee} {state.tokenIn}</span>
                </div>
              </div>
            )}

            {state.error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500">{state.error}</p>
                {state.error.includes('pool does not exist') && (
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
              onClick={handleSwap}
              disabled={!address || state.loading || !quote || transaction?.status === 'pending' || !!state.error}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {transaction?.status === 'pending' ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </div>
              ) : state.loading ? (
                'Loading...'
              ) : !address ? (
                'Connect Wallet to Swap'
              ) : state.error ? (
                'Cannot Swap'
              ) : (
                'Swap'
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 