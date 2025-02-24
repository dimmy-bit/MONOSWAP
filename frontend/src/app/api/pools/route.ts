import { NextResponse } from 'next/server'
import { LIQUIDITY_POOLS } from '@/lib/config'

// Mock data for pools
const MOCK_POOLS = [
  {
    id: 1,
    name: 'MONAD-WETH',
    apr: '120',
    totalStaked: '1,234,567',
    totalValueLocked: '$2,469,134',
    rewardToken: 'MONAD',
    stakingToken: 'MONAD-WETH LP',
    dailyRewards: '1000',
    userStaked: '0',
    userRewards: '0',
  },
  {
    id: 2,
    name: 'MONAD-USDC',
    apr: '80',
    totalStaked: '987,654',
    totalValueLocked: '$987,654',
    rewardToken: 'MONAD',
    stakingToken: 'MONAD-USDC LP',
    dailyRewards: '800',
    userStaked: '0',
    userRewards: '0',
  },
  {
    id: 3,
    name: 'WETH-USDC',
    apr: '150',
    totalStaked: '2,345,678',
    totalValueLocked: '$4,691,356',
    rewardToken: 'MONAD',
    stakingToken: 'WETH-USDC LP',
    dailyRewards: '1500',
    userStaked: '0',
    userRewards: '0',
  },
]

export async function GET(request: Request) {
  try {
    // In production, you would:
    // 1. Fetch real pool data from smart contracts
    // 2. Calculate APR based on reward rate and TVL
    // 3. Get user-specific data if address provided
    // 4. Cache results
    
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    let pools = MOCK_POOLS

    if (address) {
      // In production, we would fetch user-specific data here
      pools = pools.map(pool => ({
        ...pool,
        userStaked: '0',
        userRewards: '0',
      }))
    }

    return NextResponse.json({ 
      pools,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching pools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pools' },
      { status: 500 }
    )
  }
} 