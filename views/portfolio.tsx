import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Transaction, CryptoTransaction, Investment } from '../types';
import { formatCurrency, calculateCryptoHoldings } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Bitcoin, DollarSign, Briefcase, LineChart } from 'lucide-react';

interface PortfolioProps {
    transactions: Transaction[];
    cryptoTransactions: CryptoTransaction[];
    investments: Investment[];
}

export const PortfolioView: React.FC<PortfolioProps> = ({ transactions, cryptoTransactions, investments }) => {
    // 1. Calculate Fiat (Cash) Balance
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const cashBalance = income - expense;

    // 2. Calculate Crypto Balance (Estimated)
    // Note: In a real app, prices would come from a shared context or API.
    const holdings = useMemo(() => calculateCryptoHoldings(cryptoTransactions), [cryptoTransactions]);
    
    const basePrices: Record<string, number> = {
        BTC: 65000, ETH: 3500, SOL: 145, ADA: 0.45, DOT: 7.50
    };

    const cryptoBalance = Object.keys(holdings).reduce((total, asset) => {
        const qty = holdings[asset].quantity;
        const price = basePrices[asset] || 0; 
        return total + (qty * price);
    }, 0);

    // 3. Calculate Investments Balance
    const investmentsBalance = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);

    const totalNetWorth = cashBalance + cryptoBalance + investmentsBalance;

    // 4. Chart Data - Detailed Breakdown
    // Colors: Emerald (Cash), Amber (Investments), Indigo/Violet/etc (Cryptos)
    const CHART_COLORS = [
        '#10b981', // Cash - Green
        '#f59e0b', // Investments - Amber
        '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4' // Cryptos
    ];

    const chartData = [];
    let colorIdx = 0;
    
    // Add Cash
    if (cashBalance > 0) {
        chartData.push({ name: 'Cash', value: cashBalance, color: CHART_COLORS[colorIdx++], type: 'fiat' });
    }

    // Add Traditional Investments (Aggregated for now, or split if preferred, let's Aggregate to keep chart clean if many)
    // Actually, let's list top investments individually if small number, or aggregate.
    // Let's list individual stocks for detail like requested before.
    investments.forEach(inv => {
        const val = inv.quantity * inv.currentPrice;
        if (val > 0) {
            chartData.push({
                name: inv.symbol,
                value: val,
                color: CHART_COLORS[colorIdx++ % CHART_COLORS.length], // Cycle colors
                type: 'investment'
            });
        }
    });

    // Add Cryptos
    Object.keys(holdings).forEach(asset => {
        const qty = holdings[asset].quantity;
        const price = basePrices[asset] || 0;
        const value = qty * price;
        
        if (value > 0.01) { 
            chartData.push({
                name: asset,
                value: value,
                color: CHART_COLORS[colorIdx++ % CHART_COLORS.length],
                type: 'crypto'
            });
        }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Total Portfolio</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Aggregated view of your net worth across all asset classes</p>
            </div>

            {/* Net Worth Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-dark-card dark:to-[#1a1a1a] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50 dark:border-dark-border">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Briefcase className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Net Worth</h3>
                    <div className="text-5xl font-bold tracking-tight mb-6">
                        {formatCurrency(totalNetWorth)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-medium">Fiat</p>
                                <p className="text-lg font-bold">{formatCurrency(cashBalance)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                <LineChart className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-medium">Investments</p>
                                <p className="text-lg font-bold">{formatCurrency(investmentsBalance)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Bitcoin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-medium">Crypto</p>
                                <p className="text-lg font-bold">{formatCurrency(cryptoBalance)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Chart */}
                <div className="lg:col-span-2">
                    <Card title="Asset Allocation">
                        <div className="h-80 w-full flex items-center justify-center">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36}
                                            formatter={(value) => <span className="text-gray-600 dark:text-gray-300 font-medium ml-2">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <p>No assets found.</p>
                                    <p className="text-sm mt-1">Add transactions or investments to see allocation.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Top Assets List */}
                <div className="lg:col-span-1">
                    <Card title="Your Assets">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {chartData.length === 0 && (
                                <div className="text-center py-4 text-gray-500">No assets</div>
                            )}

                            {chartData.sort((a,b) => b.value - a.value).map((asset) => (
                                <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-muted/30 border border-gray-100 dark:border-dark-border">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                                        >
                                            {asset.type === 'fiat' ? <DollarSign className="w-5 h-5" /> : 
                                             asset.type === 'crypto' ? <Bitcoin className="w-5 h-5" /> :
                                             <LineChart className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{asset.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(asset.value)}</p>
                                        <p style={{ color: asset.color }} className="text-xs font-medium">{(totalNetWorth > 0 ? (asset.value / totalNetWorth * 100) : 0).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};