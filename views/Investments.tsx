import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Investment } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, PlusCircle, Trash2, LineChart as LineChartIcon, Building, Briefcase, List, PieChart as PieIcon, BarChart3, Calculator, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts';

interface InvestmentsProps {
    investments: Investment[];
    onAdd: (inv: Omit<Investment, 'id'>) => void;
    onDelete: (id: number) => void;
    onUpdatePrice: (id: number, newPrice: number) => void;
}

export const Investments: React.FC<InvestmentsProps> = ({ investments, onAdd, onDelete, onUpdatePrice }) => {
    const [view, setView] = useState<'holdings' | 'analysis'>('holdings');
    const [formData, setFormData] = useState({
        symbol: '',
        name: '',
        quantity: '',
        avgCost: '',
        type: 'stock' as Investment['type'],
        currentPrice: ''
    });

    // Simulation State
    const [simParams, setSimParams] = useState({
        monthlyContribution: 500,
        annualReturn: 8,
        years: 10
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            symbol: formData.symbol.toUpperCase(),
            name: formData.name,
            quantity: parseFloat(formData.quantity),
            avgCost: parseFloat(formData.avgCost),
            type: formData.type,
            currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.avgCost) // Default to cost if current not provided
        });
        setFormData({ symbol: '', name: '', quantity: '', avgCost: '', type: 'stock', currentPrice: '' });
    };

    // Calculations
    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.quantity * inv.avgCost), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    // Analysis Data Preparation
    const allocationData = investments.reduce((acc, inv) => {
        const type = inv.type.toUpperCase();
        const value = inv.quantity * inv.currentPrice;
        acc[type] = (acc[type] || 0) + value;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(allocationData).map(key => ({
        name: key,
        value: allocationData[key]
    }));

    const performanceData = investments.map(inv => ({
        name: inv.symbol,
        pnl: (inv.currentPrice - inv.avgCost) * inv.quantity,
        cost: inv.avgCost * inv.quantity,
        value: inv.currentPrice * inv.quantity
    })).sort((a, b) => b.value - a.value); // Sort by total value descending

    // Projection Calculation
    const calculateProjection = () => {
        const data = [];
        let currentBalance = totalValue;
        let totalInvested = totalCost; // Assuming current value is the starting point, simplistic approach for invested principal
        
        // Start with Year 0
        data.push({
            year: 'Now',
            value: currentBalance,
            invested: totalInvested
        });

        const monthlyRate = simParams.annualReturn / 100 / 12;

        for (let year = 1; year <= simParams.years; year++) {
            // Compound monthly for the year
            for (let month = 0; month < 12; month++) {
                currentBalance = (currentBalance + simParams.monthlyContribution) * (1 + monthlyRate);
                totalInvested += simParams.monthlyContribution;
            }
            data.push({
                year: `Year ${year}`,
                value: Math.round(currentBalance),
                invested: Math.round(totalInvested)
            });
        }
        return data;
    };

    const projectionData = calculateProjection();

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    const inputClasses = "w-full bg-white dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelClasses = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

    // Mock live update
    const simulateMarketMove = () => {
        investments.forEach(inv => {
            const change = 1 + (Math.random() * 0.04 - 0.02); // +/- 2%
            onUpdatePrice(inv.id, inv.currentPrice * change);
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track stocks, ETFs, and other assets</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-dark-muted p-1 rounded-lg">
                        <button 
                            onClick={() => setView('holdings')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${view === 'holdings' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            <List className="w-3.5 h-3.5" /> Holdings
                        </button>
                        <button 
                            onClick={() => setView('analysis')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${view === 'analysis' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            <PieIcon className="w-3.5 h-3.5" /> Analysis
                        </button>
                    </div>
                    <Button onClick={simulateMarketMove} variant="secondary" className="shadow-sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Prices
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-5 h-5" />
                        <span className="text-sm font-medium">Portfolio Value</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalValue)}</h3>
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Gain/Loss</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h3 className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                        </h3>
                        <span className={`text-sm font-semibold ${totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            ({totalPnLPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-dark-muted dark:to-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-gray-400 text-sm font-medium mb-1">Top Performer</div>
                        {investments.length > 0 ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {investments.reduce((prev, current) => {
                                        const prevPnL = (prev.currentPrice - prev.avgCost) / prev.avgCost;
                                        const currPnL = (current.currentPrice - current.avgCost) / current.avgCost;
                                        return prevPnL > currPnL ? prev : current;
                                    }).symbol}
                                </div>
                                <div className="text-emerald-400 text-sm font-mono mt-1">
                                    Leading the portfolio
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-500 italic">No assets yet</div>
                        )}
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                </div>
            </div>

            {view === 'holdings' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <Card title="Add Investment" className="sticky top-24">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Symbol</label>
                                        <input required placeholder="AAPL" className={inputClasses} value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Type</label>
                                        <select className={inputClasses} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                            <option value="stock">Stock</option>
                                            <option value="etf">ETF</option>
                                            <option value="bond">Bond</option>
                                            <option value="real_estate">Real Estate</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>Name</label>
                                    <input required placeholder="Apple Inc." className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Quantity</label>
                                        <input required type="number" step="any" placeholder="0" className={inputClasses} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Avg Cost ($)</label>
                                        <input required type="number" step="any" placeholder="0.00" className={inputClasses} value={formData.avgCost} onChange={e => setFormData({...formData, avgCost: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>Current Price ($)</label>
                                    <input type="number" step="any" placeholder="Optional (defaults to cost)" className={inputClasses} value={formData.currentPrice} onChange={e => setFormData({...formData, currentPrice: e.target.value})} />
                                </div>

                                <Button type="submit" className="w-full mt-2 flex items-center justify-center gap-2">
                                    <PlusCircle className="w-4 h-4" /> Add Asset
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <Card title="Holdings">
                             <div className="space-y-3">
                                {investments.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No investments tracked.</p>
                                        <p className="text-sm">Add your first stock or asset.</p>
                                    </div>
                                ) : (
                                    investments.map(inv => {
                                        const marketValue = inv.quantity * inv.currentPrice;
                                        const costBasis = inv.quantity * inv.avgCost;
                                        const gainLoss = marketValue - costBasis;
                                        const gainLossPercent = (gainLoss / costBasis) * 100;

                                        return (
                                            <div key={inv.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-dark-muted/20 rounded-xl border border-gray-100 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-sm transition-all duration-200">
                                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs border border-gray-200 dark:border-dark-border">
                                                        {inv.symbol.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{inv.symbol}</h4>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-muted text-gray-500 uppercase font-semibold">{inv.type}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{inv.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 sm:hidden">{inv.quantity} shares @ {formatCurrency(inv.avgCost)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                    <div className="text-left sm:text-right">
                                                         <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Price</p>
                                                         <p className="font-mono font-medium text-gray-900 dark:text-white">{formatCurrency(inv.currentPrice)}</p>
                                                    </div>
                                                    
                                                    <div className="text-right min-w-[100px]">
                                                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(marketValue)}</p>
                                                        <p className={`text-xs font-semibold ${gainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLossPercent.toFixed(1)}%)
                                                        </p>
                                                    </div>

                                                    <button 
                                                        onClick={() => onDelete(inv.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* Analysis View */
                <div className="space-y-6">
                    {/* Simulator Section */}
                    <Card title="Future Projection Simulator">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="w-full lg:w-1/3 space-y-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 font-bold">
                                        <Calculator className="w-4 h-4" />
                                        Parameters
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClasses}>Monthly Contribution ($)</label>
                                            <input 
                                                type="number" 
                                                className={inputClasses} 
                                                value={simParams.monthlyContribution}
                                                onChange={e => setSimParams({...simParams, monthlyContribution: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Annual Return (%)</label>
                                            <input 
                                                type="number" 
                                                className={inputClasses} 
                                                value={simParams.annualReturn}
                                                onChange={e => setSimParams({...simParams, annualReturn: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Time Horizon (Years)</label>
                                            <input 
                                                type="range" 
                                                min="1" max="30" 
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                value={simParams.years}
                                                onChange={e => setSimParams({...simParams, years: Number(e.target.value)})}
                                            />
                                            <div className="text-right text-xs font-mono mt-1 text-gray-500">{simParams.years} Years</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Projected Value in {simParams.years} Years</p>
                                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {formatCurrency(projectionData[projectionData.length - 1].value)}
                                    </p>
                                    <p className="text-xs text-emerald-500 font-medium mt-1">
                                        +{formatCurrency(projectionData[projectionData.length - 1].value - projectionData[projectionData.length - 1].invested)} Growth
                                    </p>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-2/3 h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={projectionData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
                                        <XAxis 
                                            dataKey="year" 
                                            tick={{fill: '#a1a1aa', fontSize: 12}} 
                                            axisLine={false} 
                                            tickLine={false}
                                            interval={Math.ceil(simParams.years / 5)}
                                        />
                                        <YAxis 
                                            tick={{fill: '#a1a1aa', fontSize: 12}} 
                                            axisLine={false} 
                                            tickLine={false}
                                            tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#6366f1" strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="invested" name="Total Invested" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Asset Allocation">
                            <div className="h-80 w-full flex items-center justify-center">
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
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
                                                verticalAlign="bottom" 
                                                formatter={(value) => <span className="text-gray-600 dark:text-gray-300 font-medium ml-2">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-gray-500">No assets to analyze</div>
                                )}
                            </div>
                        </Card>

                        <Card title="Performance by Asset">
                            <div className="h-80 w-full">
                                {performanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={performanceData} 
                                            layout="vertical" 
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" opacity={0.3} />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                width={60} 
                                                tick={{fill: '#a1a1aa', fontSize: 11}} 
                                                axisLine={false} 
                                                tickLine={false} 
                                            />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                                contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value: number, name: string) => [formatCurrency(value), name === 'pnl' ? 'Gain/Loss' : 'Market Value']}
                                            />
                                            <Bar dataKey="pnl" name="Gain/Loss" radius={[0, 4, 4, 0]} barSize={20}>
                                                 {performanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                                        <p>Add investments to see performance</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <Card title="Cost Basis vs Market Value">
                        <div className="h-96 w-full">
                             {performanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={performanceData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{fill: '#a1a1aa'}} 
                                            axisLine={false} 
                                            tickLine={false} 
                                        />
                                        <YAxis 
                                            tick={{fill: '#a1a1aa'}} 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tickFormatter={(value) => `$${value/1000}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            contentStyle={{ backgroundColor: '#111111', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="cost" name="Cost Basis" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="value" name="Market Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <p>No data available</p>
                                </div>
                             )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};