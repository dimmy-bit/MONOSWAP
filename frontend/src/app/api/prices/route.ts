import { NextResponse } from 'next/server'
import { SupportedTokenSymbol, SUPPORTED_TOKENS } from '@/config/tokens'

// In a real implementation, this would fetch from a price oracle or aggregator
const MOCK_PRICES = {
  MONAD: {
    usd: 100,
    last_updated: new Date().toISOString()
  },
  WETH: {
    usd: 3000,
    last_updated: new Date().toISOString()
  },
  USDC: {
    usd: 1,
    last_updated: new Date().toISOString()
  },
  USDT: {
    usd: 1,
    last_updated: new Date().toISOString()
  }
}

export async function GET() {
  try {
    // In production, you would:
    // 1. Fetch real-time prices from an oracle (e.g., Chainlink)
    // 2. Cache the results
    // 3. Implement rate limiting
    // 4. Add error handling for each token

    // For now, return mock data
    return NextResponse.json({ 
      prices: MOCK_PRICES,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
} 