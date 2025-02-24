'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { api } from '@/lib/api'

interface Pool {
  id: number
  name: string
  apr: string
  totalStaked: string
  totalValueLocked: string
  rewardToken: string
  stakingToken: string
}

export default function Stake() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Coming Soon
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Staking functionality will be available soon. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 