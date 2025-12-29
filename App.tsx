import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Crypto } from './views/Crypto';
import { Reports } from './views/Reports';
import { PortfolioView } from './views/portfolio';
import { Home } from './views/Home';
import { Blog } from './views/Blog';
import { Projects } from './views/Projects';
import { FinancialStatement } from './views/FinancialStatement';
import { Investments } from './views/Investments';
import { Planning } from './views/Planning';
import { Contact } from './views/Contact';
import { Transaction, CryptoTransaction, Wallet, Investment, Budget, Goal } from './types';
import { loadFromStorage, saveToStorage } from './utils';

const App: React.FC = () => {
    // Persistent State
    const [darkMode, setDarkMode] = useState(() => loadFromStorage<boolean>('theme', true));
    const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage<Transaction[]>('transactions', []));
    const [wallets, setWallets] = useState<Wallet[]>(() => loadFromStorage<Wallet[]>('wallets', []));
    const [cryptoTxs, setCryptoTxs] = useState<CryptoTransaction[]>(() => loadFromStorage<CryptoTransaction[]>('cryptoTransactions', []));
    const [investments, setInvestments] = useState<Investment[]>(() => loadFromStorage<Investment[]>('investments', []));
    const [budgets, setBudgets] = useState<Budget[]>(() => loadFromStorage<Budget[]>('budgets', []));
    const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage<Goal[]>('goals', []));
    
    // UI State - Initialize from URL param or default to 'home'
    const [activeTab, setActiveTab] = useState(() => {
        try {
            // Check if running in a safe environment for URL manipulation
            if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
                return 'home';
            }
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') || 'home';
        } catch (e) {
            return 'home';
        }
    });

    // Effects for persistence
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        saveToStorage('theme', darkMode);
    }, [darkMode]);

    useEffect(() => saveToStorage('transactions', transactions), [transactions]);
    useEffect(() => saveToStorage('wallets', wallets), [wallets]);
    useEffect(() => saveToStorage('cryptoTransactions', cryptoTxs), [cryptoTxs]);
    useEffect(() => saveToStorage('investments', investments), [investments]);
    useEffect(() => saveToStorage('budgets', budgets), [budgets]);
    useEffect(() => saveToStorage('goals', goals), [goals]);

    // Effect: Sync activeTab to URL
    useEffect(() => {
        // Skip history manipulation in blob/preview environments to prevent SecurityError
        if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
            return;
        }

        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') !== activeTab) {
                const newUrl = `${window.location.pathname}?tab=${activeTab}`;
                window.history.pushState({ tab: activeTab }, '', newUrl);
            }
        } catch (e) {
            console.warn('Navigation state update failed:', e);
        }
    }, [activeTab]);

    // Effect: Handle Browser Back/Forward buttons
    useEffect(() => {
        if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
            return;
        }

        const handlePopState = () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get('tab') || 'home';
                setActiveTab(tab);
            } catch (e) {
                // Ignore errors
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Handlers
    const addTransaction = (tx: Omit<Transaction, 'id'>) => {
        const newTx = { ...tx, id: Date.now() };
        setTransactions([...transactions, newTx]);
    };

    const deleteTransaction = (id: number) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const addWallet = (wallet: Omit<Wallet, 'id'>) => {
        if (wallets.length >= 3) {
            alert("Max 3 wallets limit for demo.");
            return;
        }
        setWallets([...wallets, { ...wallet, id: Date.now() }]);
    };

    const removeWallet = (id: number) => {
        setWallets(wallets.filter(w => w.id !== id));
    };

    const addCryptoTx = (tx: Omit<CryptoTransaction, 'id'>) => {
        setCryptoTxs([...cryptoTxs, { ...tx, id: Date.now() }]);
    };

    const deleteCryptoTx = (id: number) => {
        setCryptoTxs(cryptoTxs.filter(t => t.id !== id));
    };

    const addInvestment = (inv: Omit<Investment, 'id'>) => {
        setInvestments([...investments, { ...inv, id: Date.now() }]);
    };

    const deleteInvestment = (id: number) => {
        setInvestments(investments.filter(i => i.id !== id));
    };

    const updateInvestmentPrice = (id: number, newPrice: number) => {
        setInvestments(investments.map(i => i.id === id ? { ...i, currentPrice: newPrice } : i));
    };

    const addBudget = (budget: Omit<Budget, 'id'>) => {
        // Prevent duplicate categories
        if (budgets.some(b => b.category === budget.category)) {
            alert(`Budget for ${budget.category} already exists.`);
            return;
        }
        setBudgets([...budgets, { ...budget, id: Date.now() }]);
    };

    const deleteBudget = (id: number) => {
        setBudgets(budgets.filter(b => b.id !== id));
    };

    const addGoal = (goal: Omit<Goal, 'id'>) => {
        setGoals([...goals, { ...goal, id: Date.now() }]);
    };

    const deleteGoal = (id: number) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const updateGoal = (id: number, amount: number) => {
        setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home onNavigate={setActiveTab} />;
            case 'blog':
                return <Blog />;
            case 'projects':
                return <Projects />;
            case 'contact':
                return <Contact />;
            case 'dashboard':
                return <Dashboard transactions={transactions} budgets={budgets} />;
            case 'portfolio':
                return <PortfolioView transactions={transactions} cryptoTransactions={cryptoTxs} investments={investments} />;
            case 'transactions':
                return (
                    <Transactions 
                        transactions={transactions} 
                        onAdd={addTransaction} 
                        onDelete={deleteTransaction} 
                    />
                );
            case 'investments':
                return (
                    <Investments
                        investments={investments}
                        onAdd={addInvestment}
                        onDelete={deleteInvestment}
                        onUpdatePrice={updateInvestmentPrice}
                    />
                );
            case 'crypto':
                return (
                    <Crypto 
                        wallets={wallets}
                        transactions={cryptoTxs}
                        onAddWallet={addWallet}
                        onRemoveWallet={removeWallet}
                        onAddTransaction={addCryptoTx}
                        onDeleteTransaction={deleteCryptoTx}
                    />
                );
            case 'reports':
                return <Reports transactions={transactions} />;
            case 'statements':
                return <FinancialStatement transactions={transactions} cryptoTransactions={cryptoTxs} />;
            case 'planning':
                return (
                    <Planning 
                        budgets={budgets}
                        goals={goals}
                        transactions={transactions}
                        onAddBudget={addBudget}
                        onDeleteBudget={deleteBudget}
                        onAddGoal={addGoal}
                        onDeleteGoal={deleteGoal}
                        onUpdateGoal={updateGoal}
                    />
                );
            default:
                return <Home onNavigate={setActiveTab} />;
        }
    };

    return (
        <Layout 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
        >
            {renderContent()}
        </Layout>
    );
};

export default App;