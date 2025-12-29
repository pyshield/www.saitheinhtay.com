import { Transaction, CryptoTransaction } from './types';

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(4)} ${symbol}`;
};

export const calculateCryptoHoldings = (transactions: CryptoTransaction[]) => {
    const holdings: Record<string, { quantity: number; costBasis: number }> = {};
    
    transactions.forEach(tx => {
        const asset = tx.asset.toUpperCase();
        if (!holdings[asset]) holdings[asset] = { quantity: 0, costBasis: 0 };
        
        const totalCost = (tx.quantity * tx.price) + tx.fee;
        
        if (tx.type === 'buy' || tx.type === 'transfer') {
            holdings[asset].quantity += tx.quantity;
            holdings[asset].costBasis += totalCost;
        } else if (tx.type === 'sell') {
            holdings[asset].quantity -= tx.quantity;
            // Simplified cost basis reduction (FIFO or Average Cost would require more complex logic)
            // Reducing cost basis proportionally
            const avgCost = holdings[asset].costBasis / (holdings[asset].quantity + tx.quantity);
            holdings[asset].costBasis -= (avgCost * tx.quantity);
        }
    });

    return holdings;
};

// LocalStorage helpers
export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.warn(`Error parsing ${key} from storage:`, error);
        // Clear corrupted data to prevent persistent crashes
        localStorage.removeItem(key);
        return defaultValue;
    }
};

export const saveToStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};