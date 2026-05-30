import { useCallback } from 'react';
import { Transaction, CryptoTransaction, Wallet, Investment, Budget, Goal } from '../types';

export function useFinancialData() {
  const addEntity = useCallback(
    <T extends { id: number }>(
      items: T[],
      setItems: (items: T[]) => void,
      newItem: Omit<T, 'id'>
    ) => {
      const item = { ...newItem, id: Date.now() } as T;
      setItems([...items, item]);
      return item;
    },
    []
  );

  const deleteEntity = useCallback(
    <T extends { id: number }>(
      items: T[],
      setItems: (items: T[]) => void,
      id: number
    ) => {
      setItems(items.filter(item => item.id !== id));
    },
    []
  );

  const updateEntity = useCallback(
    <T extends { id: number }>(
      items: T[],
      setItems: (items: T[]) => void,
      id: number,
      updates: Partial<T>
    ) => {
      setItems(
        items.map(item => item.id === id ? { ...item, ...updates } : item)
      );
    },
    []
  );

  const addWallet = useCallback(
    (wallets: Wallet[], setWallets: (w: Wallet[]) => void, wallet: Omit<Wallet, 'id'>, maxLimit = 3) => {
      if (wallets.length >= maxLimit) {
        console.warn(`Max ${maxLimit} wallets limit reached`);
        return false;
      }
      addEntity(wallets, setWallets, wallet);
      return true;
    },
    [addEntity]
  );

  const addBudget = useCallback(
    (budgets: Budget[], setBudgets: (b: Budget[]) => void, budget: Omit<Budget, 'id'>) => {
      if (budgets.some(b => b.category === budget.category)) {
        console.warn(`Budget for ${budget.category} already exists`);
        return false;
      }
      addEntity(budgets, setBudgets, budget);
      return true;
    },
    [addEntity]
  );

  return {
    addEntity,
    deleteEntity,
    updateEntity,
    addWallet,
    addBudget,
  };
}
