'use client'

import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Welcome to Monoswap
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A modern decentralized exchange for swapping and staking tokens
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="/swap" className="btn-primary">
                Start Trading
              </a>
              <a href="/stake" className="btn-secondary">
                Stake Tokens
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fast Swaps</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Instantly swap tokens with minimal slippage and low fees
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Staking</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Earn rewards by staking your tokens in our secure pools
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Liquidity</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Provide liquidity to earn fees from trades
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 