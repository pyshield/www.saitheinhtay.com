import React, { ReactNode } from 'react';
import { AppContext, AppContextType } from './AppContext';
import { useLocalStorage } from '../hooks';
import { STORAGE_KEYS } from '../constants';
import { Transaction, CryptoTransaction, Wallet, Investment, Budget, Goal } from '../types';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(STORAGE_KEYS.THEME, true);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const [wallets, setWallets] = useLocalStorage<Wallet[]>(STORAGE_KEYS.WALLETS, []);
  const [cryptoTxs, setCryptoTxs] = useLocalStorage<CryptoTransaction[]>(STORAGE_KEYS.CRYPTO_TRANSACTIONS, []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>(STORAGE_KEYS.INVESTMENTS, []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>(STORAGE_KEYS.BUDGETS, []);
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEYS.GOALS, []);

  // Theme effect
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const value: AppContextType = {
    // Theme
    darkMode,
    setDarkMode,

    // Transactions
    transactions,
    addTransaction: (tx) => {
      const newTx = { ...tx, id: Date.now() };
      setTransactions([...transactions, newTx]);
    },
    deleteTransaction: (id) => {
      setTransactions(transactions.filter(t => t.id !== id));
    },

    // Wallets
    wallets,
    addWallet: (wallet) => {
      if (wallets.length >= 3) {
        console.warn("Max 3 wallets limit for demo.");
        return;
      }
      setWallets([...wallets, { ...wallet, id: Date.now() }]);
    },
    removeWallet: (id) => {
      setWallets(wallets.filter(w => w.id !== id));
    },

    // Crypto Transactions
    cryptoTxs,
    addCryptoTx: (tx) => {
      setCryptoTxs([...cryptoTxs, { ...tx, id: Date.now() }]);
    },
    deleteCryptoTx: (id) => {
      setCryptoTxs(cryptoTxs.filter(t => t.id !== id));
    },

    // Investments
    investments,
    addInvestment: (inv) => {
      setInvestments([...investments, { ...inv, id: Date.now() }]);
    },
    deleteInvestment: (id) => {
      setInvestments(investments.filter(i => i.id !== id));
    },
    updateInvestmentPrice: (id, newPrice) => {
      setInvestments(investments.map(i => i.id === id ? { ...i, currentPrice: newPrice } : i));
    },

    // Budgets
    budgets,
    addBudget: (budget) => {
      if (budgets.some(b => b.category === budget.category)) {
        console.warn(`Budget for ${budget.category} already exists.`);
        return;
      }
      setBudgets([...budgets, { ...budget, id: Date.now() }]);
    },
    deleteBudget: (id) => {
      setBudgets(budgets.filter(b => b.id !== id));
    },

    // Goals
    goals,
    addGoal: (goal) => {
      setGoals([...goals, { ...goal, id: Date.now() }]);
    },
    deleteGoal: (id) => {
      setGoals(goals.filter(g => g.id !== id));
    },
    updateGoal: (id, amount) => {
      setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g));
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
