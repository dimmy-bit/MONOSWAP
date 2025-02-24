import { useState, useEffect } from 'react'

interface TokenPrice {
  usd: number
  last_updated: string
}

interface PricesData {
  [key: string]: TokenPrice
}

export function usePrices() {
  const [prices, setPrices] = useState<PricesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices')
        if (!response.ok) {
          throw new Error('Failed to fetch prices')
        }
        const data = await response.json()
        setPrices(data.prices)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { prices, loading, error }
} 