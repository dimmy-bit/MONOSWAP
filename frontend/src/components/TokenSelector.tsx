'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { SUPPORTED_TOKENS, SupportedTokenSymbol } from '@/config/tokens'

interface TokenSelectorProps {
  selectedToken: SupportedTokenSymbol
  onSelect: (token: SupportedTokenSymbol) => void
  excludeToken?: SupportedTokenSymbol
  disabled?: boolean
  className?: string
}

export function TokenSelector({
  selectedToken,
  onSelect,
  excludeToken,
  disabled = false,
  className = ''
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelect = (token: SupportedTokenSymbol) => {
    if (disabled) return
    onSelect(token)
    setIsOpen(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const TokenImage = ({ symbol }: { symbol: SupportedTokenSymbol }) => {
    const token = SUPPORTED_TOKENS[symbol]
    if (!token?.logo || imageError) {
      return (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: token?.color || '#1A0B3B' }}
        >
          <span className="text-sm text-white font-semibold">{symbol.slice(0, 2)}</span>
        </div>
      )
    }
    
    return (
      <Image
        src={token.logo}
        alt={symbol}
        width={32}
        height={32}
        className="rounded-full"
        onError={handleImageError}
      />
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-lg border
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
          transition-all duration-200
        `}
        disabled={disabled}
      >
        <TokenImage symbol={selectedToken} />
        <span className="font-medium text-gray-900 dark:text-white">{selectedToken}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {Object.entries(SUPPORTED_TOKENS)
              .filter(([symbol]) => symbol !== excludeToken)
              .map(([symbol, token]) => (
                <button
                  key={symbol}
                  onClick={() => handleSelect(symbol as SupportedTokenSymbol)}
                  className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-lg
                    ${symbol === selectedToken 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    transition-colors duration-200
                  `}
                >
                  <TokenImage symbol={symbol as SupportedTokenSymbol} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{token.name}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
} 