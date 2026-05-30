export const STORAGE_KEYS = {
  THEME: 'theme',
  TRANSACTIONS: 'transactions',
  WALLETS: 'wallets',
  CRYPTO_TRANSACTIONS: 'cryptoTransactions',
  INVESTMENTS: 'investments',
  BUDGETS: 'budgets',
  GOALS: 'goals',
} as const;

export const STORAGE_DEFAULTS = {
  [STORAGE_KEYS.THEME]: true,
  [STORAGE_KEYS.TRANSACTIONS]: [],
  [STORAGE_KEYS.WALLETS]: [],
  [STORAGE_KEYS.CRYPTO_TRANSACTIONS]: [],
  [STORAGE_KEYS.INVESTMENTS]: [],
  [STORAGE_KEYS.BUDGETS]: [],
  [STORAGE_KEYS.GOALS]: [],
} as const;
