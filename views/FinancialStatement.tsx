import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Transaction, CryptoTransaction } from '../types';
import { formatCurrency, calculateCryptoHoldings } from '../utils';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface FinancialStatementProps {
    transactions: Transaction[];
    cryptoTransactions: CryptoTransaction[];
}

export const FinancialStatement: React.FC<FinancialStatementProps> = ({ transactions, cryptoTransactions }) => {
    const [view, setView] = useState<'income' | 'balance'>('income');
    const [timeframe, setTimeframe] = useState('all'); // all, ytd, month

    // Helper to filter transactions by timeframe
    const getFilteredTransactions = () => {
        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (timeframe === 'month') {
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            }
            if (timeframe === 'ytd') {
                return tDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const filteredTransactions = getFilteredTransactions();

    // Income Statement Calculations
    const incomeTx = filteredTransactions.filter(t => t.type === 'income');
    const expenseTx = filteredTransactions.filter(t => t.type === 'expense');

    const totalRevenue = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const revenueByCategory = incomeTx.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const expensesByCategory = expenseTx.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    // Balance Sheet Calculations (Snapshot - always "All Time" technically for assets)
    // 1. Cash (Assets)
    const allIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const cashOnHand = allIncome - allExpense;

    // 2. Crypto (Assets)
    const holdings = useMemo(() => calculateCryptoHoldings(cryptoTransactions), [cryptoTransactions]);
    const basePrices: Record<string, number> = {
        BTC: 65000, ETH: 3500, SOL: 145, ADA: 0.45, DOT: 7.50
    };
    const cryptoAssetsValue = Object.keys(holdings).reduce((total, asset) => {
        const qty = holdings[asset].quantity;
        const price = basePrices[asset] || 0; 
        return total + (qty * price);
    }, 0);

    const totalAssets = cashOnHand + cryptoAssetsValue;
    const totalLiabilities = 0; // Future: Add debt tracking
    const totalEquity = totalAssets - totalLiabilities;

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Statements</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Formal reports of your financial health</p>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-dark-muted p-1 rounded-lg">
                    <button 
                        onClick={() => setView('income')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'income' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Income Statement
                    </button>
                    <button 
                         onClick={() => setView('balance')}
                         className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'balance' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Balance Sheet
                    </button>
                </div>
            </div>

            {view === 'income' && (
                <div className="space-y-6">
                    {/* Timeframe Filter */}
                    <div className="flex justify-end">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select 
                                value={timeframe} 
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">All Time</option>
                                <option value="ytd">Year to Date</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>

                    <Card className="max-w-4xl mx-auto overflow-hidden">
                        <div className="border-b border-gray-200 dark:border-dark-border pb-6 mb-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest">Income Statement</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {timeframe === 'all' ? 'All Time' : timeframe === 'ytd' ? `Jan 1 - ${new Date().toLocaleDateString()}` : new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Revenue */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Revenue
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(revenueByCategory).length === 0 && (
                                        <div className="text-sm text-gray-400 italic py-2">No revenue recorded</div>
                                    )}
                                    {Object.entries(revenueByCategory).map(([cat, amount]) => (
                                        <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border/50 text-sm">
                                            <span className="capitalize text-gray-700 dark:text-gray-300">{cat}</span>
                                            <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(amount as number)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center py-3 mt-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded px-2">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Total Revenue</span>
                                        <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(totalRevenue)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expenses */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4" /> Expenses
                                </h4>
                                <div className="space-y-2">
                                     {Object.entries(expensesByCategory).length === 0 && (
                                        <div className="text-sm text-gray-400 italic py-2">No expenses recorded</div>
                                    )}
                                    {Object.entries(expensesByCategory).map(([cat, amount]) => (
                                        <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border/50 text-sm">
                                            <span className="capitalize text-gray-700 dark:text-gray-300">{cat}</span>
                                            <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(amount as number)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center py-3 mt-2 bg-red-50/50 dark:bg-red-900/10 rounded px-2">
                                        <span className="font-bold text-red-700 dark:text-red-400">Total Expenses</span>
                                        <span className="font-bold font-mono text-red-700 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Net Income */}
                            <div className="pt-6 border-t-2 border-gray-100 dark:border-dark-border">
                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-dark-muted rounded-lg border border-gray-200 dark:border-dark-border">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Net Income</span>
                                    <span className={`text-xl font-bold font-mono ${netIncome >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(netIncome)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {view === 'balance' && (
                <Card className="max-w-4xl mx-auto overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-dark-border pb-6 mb-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest">Balance Sheet</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            As of {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Assets */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b-2 border-indigo-500 pb-2 inline-block">Assets</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Current Assets</h5>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border/50">
                                        <span className="text-gray-700 dark:text-gray-300">Cash & Equivalents</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(cashOnHand)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Digital Assets</h5>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border/50">
                                        <span className="text-gray-700 dark:text-gray-300">Cryptocurrencies</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(cryptoAssetsValue)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center font-bold text-lg">
                                    <span className="text-gray-900 dark:text-white">Total Assets</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalAssets)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Liabilities & Equity */}
                        <div className="space-y-8">
                             {/* Liabilities */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b-2 border-red-500 pb-2 inline-block">Liabilities</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border/50">
                                        <span className="text-gray-700 dark:text-gray-300">Current Liabilities</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(totalLiabilities)}</span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center font-bold">
                                        <span className="text-gray-900 dark:text-white">Total Liabilities</span>
                                        <span className="text-gray-900 dark:text-white font-mono">{formatCurrency(totalLiabilities)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Equity */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b-2 border-indigo-500 pb-2 inline-block">Equity</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border/50">
                                        <span className="text-gray-700 dark:text-gray-300">Owner's Equity</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(totalEquity)}</span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center font-bold text-lg">
                                        <span className="text-gray-900 dark:text-white">Total Equity</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(totalEquity)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-gray-100 dark:border-dark-border flex justify-between items-center font-bold text-sm text-gray-500">
                                <span>Total Liabilities & Equity</span>
                                <span className="font-mono">{formatCurrency(totalLiabilities + totalEquity)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};