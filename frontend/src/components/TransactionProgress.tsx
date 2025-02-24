import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface TransactionProgressProps {
  status: string
  error: string | null
  isLoading: boolean
  txHash?: string
}

export function TransactionProgress({ status, error, isLoading, txHash }: TransactionProgressProps) {
  if (!status && !error && !isLoading) return null

  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {isLoading && (
        <div className="flex items-center justify-center mb-4">
          <LoadingSpinner />
        </div>
      )}
      
      {status && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {txHash && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <a
            href={`https://explorer.monad.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 dark:hover:text-blue-400"
          >
            View on Explorer →
          </a>
        </div>
      )}
    </div>
  )
} 