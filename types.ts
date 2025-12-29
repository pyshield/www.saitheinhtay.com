
export type TransactionType = 'income' | 'expense';
export type CryptoTxType = 'buy' | 'sell' | 'transfer' | 'stake' | 'unstake';

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    notes?: string;
}

export interface Budget {
    id: number;
    category: string;
    amount: number;
}

export interface Wallet {
    id: number;
    name: string;
    address: string;
    chain: string;
}

export interface CryptoTransaction {
    id: number;
    walletId: number;
    type: CryptoTxType;
    asset: string;
    quantity: number;
    price: number;
    fee: number;
    date: string;
    notes?: string;
}

export interface AssetPrice {
    [symbol: string]: {
        usd: number;
        usd_24h_change: number;
    };
}

export interface Investment {
    id: number;
    symbol: string;
    name: string;
    quantity: number;
    avgCost: number; // Average buy price per share/unit
    type: 'stock' | 'etf' | 'bond' | 'real_estate' | 'other';
    currentPrice: number; // Manually updated or mocked for this demo
}

export interface RecurringTransaction {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    frequency: 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    active: boolean;
}

export interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    deadline: string;
    currentAmount: number;
}
