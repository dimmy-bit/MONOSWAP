import express from 'express';
import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';

const router = express.Router();

// Mock token prices (replace with actual price fetching logic)
const MOCK_PRICES = {
  MONAD: {
    usd: 100,
    last_updated: new Date().toISOString()
  },
  USDC: {
    usd: 1,
    last_updated: new Date().toISOString()
  }
};

router.get('/', async (req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/monoswap';
    const client = await MongoClient.connect(mongoUri);
    const db = client.db('monoswap');
    
    // Try to get prices from MongoDB
    const prices = await db.collection('prices').find({}).toArray();
    
    if (prices.length === 0) {
      // If no prices in DB, return mock data
      return res.json({ prices: MOCK_PRICES });
    }
    
    res.json({ prices });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 