'use client'

import { useWeb3 } from '@/lib/web3/Web3Provider'

export function useAccount() {
  const { address: account } = useWeb3()
  return { account }
}
