import { ethers } from 'ethers'

interface TokenData {
  balance: string
  allowance: string
  lastUpdated: number
}

interface CacheData {
  [address: string]: {
    [token: string]: TokenData
  }
}

class TokenCache {
  private static instance: TokenCache
  private cache: CacheData = {}
  private readonly CACHE_DURATION = 30 * 1000 // 30 seconds
  private listeners: Set<(address: string, token: string, data: TokenData) => void> = new Set()
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.cleanupInterval = setInterval(() => this.cleanCache(), 5 * 60 * 1000)
  }

  static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache()
    }
    return TokenCache.instance
  }

  async getBalance(
    address: string,
    token: string,
    provider: ethers.providers.Provider,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cached = this.getCached(address, token)
    if (!forceRefresh && cached && this.isValid(cached.lastUpdated)) {
      return cached.balance
    }

    try {
      let balance: ethers.BigNumber
      if (token === '0x0000000000000000000000000000000000000000') {
        // Native token
        balance = await provider.getBalance(address)
      } else {
        // ERC20 token
        const contract = new ethers.Contract(
          token,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )
        balance = await contract.balanceOf(address)
      }

      this.updateCache(address, token, {
        balance: balance.toString(),
        allowance: cached?.allowance || '0',
        lastUpdated: Date.now()
      })

      return balance.toString()
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  async getAllowance(
    owner: string,
    token: string,
    spender: string,
    provider: ethers.providers.Provider,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cached = this.getCached(owner, token)
    if (!forceRefresh && cached && this.isValid(cached.lastUpdated)) {
      return cached.allowance
    }

    try {
      const contract = new ethers.Contract(
        token,
        ['function allowance(address,address) view returns (uint256)'],
        provider
      )
      const allowance = await contract.allowance(owner, spender)

      this.updateCache(owner, token, {
        balance: cached?.balance || '0',
        allowance: allowance.toString(),
        lastUpdated: Date.now()
      })

      return allowance.toString()
    } catch (error) {
      console.error('Error fetching allowance:', error)
      throw error
    }
  }

  private getCached(address: string, token: string): TokenData | undefined {
    return this.cache[address]?.[token]
  }

  private isValid(lastUpdated: number): boolean {
    return Date.now() - lastUpdated < this.CACHE_DURATION
  }

  private updateCache(address: string, token: string, data: TokenData) {
    if (!this.cache[address]) {
      this.cache[address] = {}
    }
    this.cache[address][token] = data
    this.notifyListeners(address, token, data)
  }

  private cleanCache() {
    const now = Date.now()
    for (const address in this.cache) {
      for (const token in this.cache[address]) {
        if (!this.isValid(this.cache[address][token].lastUpdated)) {
          delete this.cache[address][token]
        }
      }
      if (Object.keys(this.cache[address]).length === 0) {
        delete this.cache[address]
      }
    }
  }

  subscribe(listener: (address: string, token: string, data: TokenData) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(address: string, token: string, data: TokenData) {
    this.listeners.forEach(listener => listener(address, token, data))
  }

  clearCache() {
    this.cache = {}
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

export default TokenCache 