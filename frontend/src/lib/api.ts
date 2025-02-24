const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Price endpoints
  getPrices: async () => {
    const response = await fetch(`${API_BASE_URL}/prices`);
    if (!response.ok) throw new Error('Failed to fetch prices');
    return response.json();
  },

  // Pool endpoints
  getPools: async () => {
    const response = await fetch(`${API_BASE_URL}/pools`);
    if (!response.ok) throw new Error('Failed to fetch pools');
    return response.json();
  },

  // Swap endpoints
  getSwapQuote: async (params: {
    fromToken: string;
    toToken: string;
    amount: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/swap/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to get swap quote');
    return response.json();
  },

  executeSwap: async (params: {
    fromToken: string;
    toToken: string;
    amount: string;
    slippage: string;
    walletAddress: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/swap/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to execute swap');
    return response.json();
  },
}; 