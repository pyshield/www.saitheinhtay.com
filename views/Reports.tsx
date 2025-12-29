import React from 'react';
import { Card } from '../components/ui/Card';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { formatCurrency } from '../utils';
import { PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

interface ReportsProps {
    transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
    // 1. Calculate Expenses by Category
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieData = Object.keys(expensesByCategory).map(cat => ({
        name: cat,
        value: expensesByCategory[cat]
    }));

    // 2. Calculate Monthly Trend
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        monthlyData[month][t.type] += t.amount;
    });

    const barData = Object.keys(monthlyData).map(month => ({
        name: month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense
    }));

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed analysis of your financial activities</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Expenses by Category">
                    <div className="h-80 w-full">
                         {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend 
                                        formatter={(value) => <span className="text-gray-600 dark:text-gray-300 text-sm ml-1 capitalize">{value}</span>} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No expense data available</p>
                            </div>
                         )}
                    </div>
                </Card>

                <Card title="Income vs Expenses">
                    <div className="h-80 w-full">
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{fill: '#a1a1aa'}} 
                                        axisLine={{stroke: '#27272a'}} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        tick={{fill: '#a1a1aa'}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        width={60}
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend 
                                        formatter={(value) => <span className="text-gray-600 dark:text-gray-300 text-sm ml-1 capitalize">{value}</span>}
                                    />
                                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                                <p>No transaction history</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};