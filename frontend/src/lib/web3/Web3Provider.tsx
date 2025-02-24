'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { MONAD_CONFIG } from '../config'

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  address: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchToMonad: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: async () => {},
  switchToMonad: async () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  const switchToMonad = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${MONAD_CONFIG.chainId.toString(16)}`,
            chainName: MONAD_CONFIG.chainName,
            nativeCurrency: MONAD_CONFIG.nativeCurrency,
            rpcUrls: MONAD_CONFIG.rpcUrls,
            blockExplorerUrls: MONAD_CONFIG.blockExplorerUrls,
          },
        ],
      })
    } catch (error) {
      console.error('Error adding Monad network:', error)
    }
  }

  const connect = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        const web3Signer = web3Provider.getSigner()
        const signerAddress = await web3Signer.getAddress()
        const { chainId: currentChainId } = await web3Provider.getNetwork()

        setProvider(web3Provider)
        setSigner(web3Signer)
        setAddress(signerAddress)
        setChainId(currentChainId)

        // If not on Monad testnet, prompt to switch
        if (currentChainId !== MONAD_CONFIG.chainId) {
          await switchToMonad()
        }
      } else {
        throw new Error('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
    }
  }

  const disconnect = async () => {
    setProvider(null)
    setSigner(null)
    setAddress(null)
    setChainId(null)
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          connect()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        connect,
        disconnect,
        switchToMonad,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)

declare global {
  interface Window {
    ethereum?: any
  }
} 