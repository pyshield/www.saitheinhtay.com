import React from 'react';
import { Card } from '../components/ui/Card';
import { Transaction, Budget } from '../types';
import { formatCurrency } from '../utils';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
    transactions: Transaction[];
    budgets?: Budget[]; // Optional to support legacy usage
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets = [] }) => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
        
    const balance = income - expense;

    // Calculate Budget Health
    const now = new Date();
    const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
    const budgetUsagePercent = totalBudgetLimit > 0 ? (currentMonthExpenses / totalBudgetLimit) * 100 : 0;

    // Prepare chart data (Simple projection)
    const chartData = [
        { name: 'Income', value: income, fill: '#10b981' },
        { name: 'Expense', value: expense, fill: '#ef4444' },
        { name: 'Net', value: balance, fill: '#6366f1' },
    ];

    const recentTransactions = [...transactions].reverse().slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track your wealth and spending habits</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm relative overflow-hidden group transition-all hover:shadow-lg hover:border-indigo-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="w-24 h-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Wallet className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(balance)}</h3>
                        <div className="mt-3 text-xs text-emerald-500 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-3 h-3" /> +2.5% vs last month
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm relative overflow-hidden group transition-all hover:shadow-lg hover:border-emerald-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(income)}</h3>
                        <div className="mt-3 text-xs text-gray-500 font-medium">
                             Inflows this period
                        </div>
                    </div>
                </div>

                {/* Budget Health Card (Upgraded) */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm relative overflow-hidden group transition-all hover:shadow-lg hover:border-amber-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Target className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Budget</span>
                        </div>
                        
                        {totalBudgetLimit > 0 ? (
                            <>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(currentMonthExpenses)}</h3>
                                <div className="mt-2 w-full bg-gray-100 dark:bg-dark-muted rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-1.5 rounded-full ${budgetUsagePercent > 100 ? 'bg-red-500' : 'bg-amber-500'}`} 
                                        style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 font-medium flex justify-between">
                                    <span>{budgetUsagePercent.toFixed(0)}% Used</span>
                                    <span>Limit: {formatCurrency(totalBudgetLimit)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-400 tracking-tight mt-1">No Budget Set</h3>
                                <p className="text-xs text-gray-500 mt-2">Go to Planning to set limits.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Cash Flow Analysis">
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fill: '#a1a1aa', fontSize: 12, fontWeight: 500}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Recent Activity">
                    <div className="space-y-4">
                        {recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-72 text-gray-500 dark:text-gray-400">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-muted flex items-center justify-center mb-3">
                                    <Activity className="w-6 h-6 opacity-50" />
                                </div>
                                <p className="font-medium">No transactions yet</p>
                                <p className="text-sm mt-1">Start by adding your income or expenses</p>
                            </div>
                        ) : (
                            recentTransactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-muted/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-dark-border group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'}`}>
                                            {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                                <span className="capitalize">{tx.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                {new Date(tx.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm tracking-wide ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};