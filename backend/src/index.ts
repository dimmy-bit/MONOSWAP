import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';

// Routes
import pricesRouter from './routes/prices';
import poolsRouter from './routes/pools';
import swapRouter from './routes/swap';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/monoswap';
let mongoClient: MongoClient;

// Ethereum Provider
const provider = new ethers.providers.JsonRpcProvider(process.env.MONAD_RPC_URL);

// Routes
app.use('/api/prices', pricesRouter);
app.use('/api/pools', poolsRouter);
app.use('/api/swap', swapRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    // Connect to MongoDB
    mongoClient = await MongoClient.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 