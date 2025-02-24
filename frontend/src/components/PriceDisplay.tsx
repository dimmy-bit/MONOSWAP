'use client'

import { usePrices } from '@/lib/hooks/usePrices'
import { LoadingSpinner } from './LoadingSpinner'

interface PriceDisplayProps {
  symbol: string
  className?: string
}

export function PriceDisplay({ symbol, className = '' }: PriceDisplayProps) {
  const { prices, loading, error } = usePrices()

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-gray-400">Loading price...</span>
      </div>
    )
  }

  if (error || !prices?.[symbol]) {
    return (
      <div className={`text-red-500 ${className}`}>
        Price unavailable
      </div>
    )
  }

  return (
    <div className={`font-medium ${className}`}>
      ${prices[symbol].usd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })}
    </div>
  )
} 