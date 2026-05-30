import { createContext, useContext, ReactNode } from 'react';
import { Transaction, CryptoTransaction, Wallet, Investment, Budget, Goal } from '../types';

export interface AppContextType {
  // Theme
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: number) => void;

  // Wallets
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  removeWallet: (id: number) => void;

  // Crypto Transactions
  cryptoTxs: CryptoTransaction[];
  addCryptoTx: (tx: Omit<CryptoTransaction, 'id'>) => void;
  deleteCryptoTx: (id: number) => void;

  // Investments
  investments: Investment[];
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: number) => void;
  updateInvestmentPrice: (id: number, newPrice: number) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: number) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: number) => void;
  updateGoal: (id: number, amount: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
