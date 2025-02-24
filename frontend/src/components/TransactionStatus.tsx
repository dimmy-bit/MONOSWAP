'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { LoadingSpinner } from './LoadingSpinner'

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'error'
  message: string
  txHash?: string
  onClose: () => void
}

const statusConfig = {
  pending: {
    icon: LoadingSpinner,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    textColor: 'text-yellow-500'
  },
  success: {
    icon: () => (
      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-500'
  },
  error: {
    icon: () => (
      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-500'
  }
}

export function TransactionStatus({
  status,
  message,
  txHash,
  onClose
}: TransactionStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <Icon />
      
      <div className="flex-1">
        <p className={`font-medium ${config.textColor}`}>
          {message}
        </p>
        
        {txHash && (
          <a
            href={`https://explorer.monad.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-300 underline mt-1 block"
          >
            View on Explorer
          </a>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-700/50 transition-colors"
      >
        <XMarkIcon className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
} 