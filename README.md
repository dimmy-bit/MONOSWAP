# Monoswap - Monad Testnet DEX

A modern decentralized exchange (DEX) built specifically for the Monad testnet, featuring token swapping and staking capabilities.

## Features

- 🌙 Dark/Light mode support
- 💱 Token swapping with slippage control
- 🏦 Staking pools with APR rewards
- 🔒 Secure wallet connection (MetaMask)
- 📱 Responsive design for all devices
- ⚡ Fast and optimized performance
- 🔄 Real-time price updates
- 💾 MongoDB caching for improved performance

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Styling**: TailwindCSS, Framer Motion
- **Blockchain**: Ethers.js
- **Database**: MongoDB (for caching prices and pool data)
- **Network**: Monad Testnet

## Prerequisites

1. MongoDB installed locally or a MongoDB Atlas account
2. MetaMask wallet installed
3. Node.js 16+ and npm

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/monoswap.git
   cd monoswap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env.local` file:
   ```
   MONGODB_URI=your_mongodb_uri
   NEXT_PUBLIC_MONAD_RPC_URL=https://api.monad.xyz/testnet
   NEXT_PUBLIC_CHAIN_ID=1337
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Connecting to Monad Testnet

1. Open MetaMask
2. The app will automatically prompt you to add the Monad testnet
3. Network details will be configured automatically
4. Make sure you have test MONAD tokens

## Project Structure

```
monoswap/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── swap/        # Swap page
│   │   └── stake/       # Staking page
│   ├── components/       # React components
│   ├── lib/             # Utilities and hooks
│   │   ├── hooks/       # Custom React hooks
│   │   └── web3/        # Web3 integration
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json         # Project dependencies
```

## API Routes

- `/api/prices` - Get real-time token prices
- `/api/pools` - Get staking pool information

## Development

1. The app uses MongoDB for caching token prices and pool data
2. API routes are implemented in `src/app/api/`
3. Web3 integration is handled by the Web3Provider component
4. Custom hooks in `src/lib/hooks` provide data fetching capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monad](https://monad.xyz/) for the testnet infrastructure
- [TailwindCSS](https://tailwindcss.com/) for the styling system
- [Next.js](https://nextjs.org/) for the framework
- [Ethers.js](https://docs.ethers.io/) for blockchain interaction 