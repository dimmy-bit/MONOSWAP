import express from 'express';
import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';

const router = express.Router();

// Mock staking pools data
const MOCK_POOLS = [
  {
    id: 1,
    name: 'MONO-ETH LP',
    apr: '120',
    totalStaked: '1,234,567',
    totalValueLocked: '$2,469,134',
    rewardToken: 'MONO',
    stakingToken: 'MONO-ETH LP',
  },
  {
    id: 2,
    name: 'MONO',
    apr: '80',
    totalStaked: '987,654',
    totalValueLocked: '$987,654',
    rewardToken: 'MONO',
    stakingToken: 'MONO',
  },
  {
    id: 3,
    name: 'MONO-USDC LP',
    apr: '150',
    totalStaked: '2,345,678',
    totalValueLocked: '$4,691,356',
    rewardToken: 'MONO',
    stakingToken: 'MONO-USDC LP',
  },
];

router.get('/', async (req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/monoswap';
    const client = await MongoClient.connect(mongoUri);
    const db = client.db('monoswap');
    
    // Try to get pools from MongoDB
    const pools = await db.collection('pools').find({}).toArray();
    
    if (pools.length === 0) {
      // If no pools in DB, return mock data
      return res.json({ pools: MOCK_POOLS });
    }
    
    res.json({ pools });
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 