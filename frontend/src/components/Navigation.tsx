'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useWeb3 } from '@/lib/web3/Web3Provider'

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { address, connect, disconnect } = useWeb3()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Swap', href: '/swap' },
    { name: 'Liquidity', href: '/liquidity' },
    { name: 'Stake', href: '/stake' },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!mounted) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Monoswap
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={address ? disconnect : connect}
              className="btn-primary"
            >
              {address ? formatAddress(address) : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 