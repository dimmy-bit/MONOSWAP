import { ethers } from 'ethers'

export interface Transaction {
  id: string
  type: 'approval' | 'addLiquidity' | 'removeLiquidity' | 'swap' | 'createPair'
  status: 'pending' | 'processing' | 'success' | 'failed' | 'retrying'
  hash?: string
  error?: string
  retryCount: number
  timestamp: number
  params: any
}

export interface TransactionQueueItem {
  transaction: Transaction
  execute: () => Promise<ethers.ContractTransaction>
}

class TransactionManager {
  private static instance: TransactionManager
  private queue: TransactionQueueItem[] = []
  private processing: boolean = false
  private maxRetries: number = 3
  private listeners: Set<(transactions: Transaction[]) => void> = new Set()
  private transactions: Map<string, Transaction> = new Map()

  private constructor() {
    if (typeof window !== 'undefined') {
      // Initialize from localStorage only in browser environment
      this.loadFromLocalStorage()
    }
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('transactions')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.forEach((tx: Transaction) => {
          this.transactions.set(tx.id, tx)
        })
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error)
    }
  }

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager()
    }
    return TransactionManager.instance
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const item = this.queue[0]

    try {
      // Update transaction status
      this.updateTransaction(item.transaction.id, { status: 'processing' })

      // Execute transaction
      const tx = await item.execute()
      
      // Wait for confirmation
      const receipt = await tx.wait()
      
      // Update transaction status
      this.updateTransaction(item.transaction.id, {
        status: 'success',
        hash: receipt.transactionHash
      })

      // Remove from queue
      this.queue.shift()
    } catch (error: any) {
      console.error('Transaction failed:', error)
      
      const transaction = item.transaction
      if (transaction.retryCount < this.maxRetries) {
        // Retry transaction
        this.updateTransaction(transaction.id, {
          status: 'retrying',
          retryCount: transaction.retryCount + 1,
          error: error.message
        })
        
        // Move to end of queue
        this.queue.shift()
        this.queue.push(item)
      } else {
        // Mark as failed after max retries
        this.updateTransaction(transaction.id, {
          status: 'failed',
          error: error.message
        })
        this.queue.shift()
      }
    } finally {
      this.processing = false
      this.saveToLocalStorage()
      
      // Process next item if queue not empty
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000) // Add delay between transactions
      }
    }
  }

  addTransaction(
    type: Transaction['type'],
    execute: () => Promise<ethers.ContractTransaction>,
    params: any
  ): string {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const transaction: Transaction = {
      id,
      type,
      status: 'pending',
      retryCount: 0,
      timestamp: Date.now(),
      params
    }

    this.transactions.set(id, transaction)
    this.queue.push({ transaction, execute })
    this.notifyListeners()
    this.saveToLocalStorage()

    // Start processing if not already
    this.processQueue()

    return id
  }

  private updateTransaction(id: string, update: Partial<Transaction>) {
    const transaction = this.transactions.get(id)
    if (transaction) {
      Object.assign(transaction, update)
      this.transactions.set(id, transaction)
      this.notifyListeners()
      this.saveToLocalStorage()
    }
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id)
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  subscribe(listener: (transactions: Transaction[]) => void) {
    this.listeners.add(listener)
    listener(this.getAllTransactions())
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    const transactions = this.getAllTransactions()
    this.listeners.forEach(listener => listener(transactions))
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'transactions',
          JSON.stringify(this.getAllTransactions())
        )
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error)
      }
    }
  }

  // Gas price optimization
  async getOptimizedGasPrice(provider: ethers.providers.Provider): Promise<ethers.BigNumber> {
    try {
      const gasPrice = await provider.getGasPrice()
      // Add 10% to ensure transaction goes through
      return gasPrice.mul(110).div(100)
    } catch (error) {
      console.error('Error getting gas price:', error)
      throw error
    }
  }

  // Clear old transactions (older than 24 hours)
  clearOldTransactions() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    for (const [id, tx] of this.transactions.entries()) {
      if (tx.timestamp < oneDayAgo && tx.status !== 'pending' && tx.status !== 'processing') {
        this.transactions.delete(id)
      }
    }
    this.saveToLocalStorage()
    this.notifyListeners()
  }
}

export default TransactionManager 