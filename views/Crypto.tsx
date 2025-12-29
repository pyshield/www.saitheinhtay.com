import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CryptoTransaction, Wallet, AssetPrice, CryptoTxType } from '../types';
import { calculateCryptoHoldings, formatCurrency, formatCrypto } from '../utils';
import { RefreshCw, Plus, Trash2, TrendingUp, Bitcoin, Wallet as WalletIcon, ArrowRightLeft, Layers } from 'lucide-react';

interface CryptoProps {
    wallets: Wallet[];
    transactions: CryptoTransaction[];
    onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
    onRemoveWallet: (id: number) => void;
    onAddTransaction: (tx: Omit<CryptoTransaction, 'id'>) => void;
    onDeleteTransaction: (id: number) => void;
}

export const Crypto: React.FC<CryptoProps> = ({ 
    wallets, 
    transactions, 
    onAddWallet, 
    onRemoveWallet,
    onAddTransaction,
    onDeleteTransaction 
}) => {
    const [prices, setPrices] = useState<AssetPrice>({});
    const [loading, setLoading] = useState(false);
    
    // Wallet Form State
    const [walletForm, setWalletForm] = useState({ name: '', address: '', chain: 'ethereum' });

    // Transaction Form State
    const [txForm, setTxForm] = useState({
        walletId: '',
        type: 'buy' as CryptoTxType,
        asset: '',
        quantity: '',
        price: '',
        fee: '',
        date: new Date().toISOString().slice(0, 16),
    });

    const fetchPrices = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const assets = [...new Set(transactions.map(t => t.asset.toUpperCase()))];
        const newPrices: AssetPrice = {};
        
        const basePrices: Record<string, number> = {
            BTC: 65000, ETH: 3500, SOL: 145, ADA: 0.45, DOT: 7.50
        };

        assets.forEach(asset => {
            const assetKey = asset as string;
            const base = basePrices[assetKey] || 100;
            const randomChange = (Math.random() - 0.5) * 0.1;
            newPrices[assetKey] = {
                usd: base * (1 + randomChange),
                usd_24h_change: randomChange * 100
            };
        });

        setPrices(newPrices);
        setLoading(false);
    };

    useEffect(() => {
        if (transactions.length > 0) fetchPrices();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions.length]);

    const handleAddWallet = (e: React.FormEvent) => {
        e.preventDefault();
        onAddWallet(walletForm);
        setWalletForm({ name: '', address: '', chain: 'ethereum' });
    };

    const handleAddTx = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTransaction({
            walletId: parseInt(txForm.walletId),
            type: txForm.type,
            asset: txForm.asset.toUpperCase(),
            quantity: parseFloat(txForm.quantity),
            price: parseFloat(txForm.price),
            fee: parseFloat(txForm.fee) || 0,
            date: txForm.date
        });
        setTxForm({ ...txForm, quantity: '', price: '', fee: '' });
    };

    const holdings = calculateCryptoHoldings(transactions);
    const assetList = Object.keys(holdings);

    const totalValue = assetList.reduce((sum, asset) => {
        const qty = holdings[asset].quantity;
        const price = prices[asset]?.usd || 0;
        return sum + (qty * price);
    }, 0);

    const totalCostBasis = assetList.reduce((sum, asset) => sum + holdings[asset].costBasis, 0);
    const totalUnrealizedPnL = totalValue - totalCostBasis;
    const pnlPercent = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;

    const inputClasses = "w-full bg-white dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelClasses = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                         Crypto Assets
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage wallets, track assets, and monitor performance</p>
                </div>
                <Button onClick={fetchPrices} disabled={loading} variant="secondary" className="shadow-sm">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Sync Prices
                </Button>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bitcoin className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 opacity-90">
                            <Layers className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Portfolio Value</span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(totalValue)}</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                            <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Live Estimate</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                        <WalletIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Invested Capital</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalCostBasis)}</h3>
                    <div className="mt-4 text-xs text-gray-500 font-medium">
                        Total cost basis of current holdings
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Unrealized P&L</span>
                    </div>
                    <h3 className={`text-3xl font-bold tracking-tight ${totalUnrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnL)}
                    </h3>
                    <div className={`mt-4 text-xs font-medium inline-block px-2 py-0.5 rounded ${totalUnrealizedPnL >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {pnlPercent.toFixed(2)}% All Time
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-1">
                    <Card title="Wallets">
                        <div className="space-y-3 mb-6">
                            {wallets.length === 0 && (
                                <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 dark:bg-dark-muted/30 rounded-lg border border-dashed border-gray-200 dark:border-dark-border">
                                    No wallets connected
                                </div>
                            )}
                            {wallets.map(w => (
                                <div key={w.id} className="group relative p-4 bg-gray-50 dark:bg-dark-muted/20 rounded-lg border border-gray-200 dark:border-dark-border hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden pr-8">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{w.name}</div>
                                            <div className="text-xs text-gray-500 truncate font-mono mt-1 opacity-70">{w.address}</div>
                                            <span className="text-[10px] uppercase tracking-wider bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded mt-2 inline-block font-bold shadow-sm">{w.chain}</span>
                                        </div>
                                        <button onClick={() => onRemoveWallet(w.id)} className="text-gray-400 hover:text-red-500 absolute top-4 right-4 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {wallets.length < 3 && (
                            <form onSubmit={handleAddWallet} className="space-y-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Connect New Wallet</h4>
                                <input placeholder="Label (e.g. Ledger)" required className={inputClasses} value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} />
                                <input placeholder="Address" required className={inputClasses} value={walletForm.address} onChange={e => setWalletForm({...walletForm, address: e.target.value})} />
                                <select className={inputClasses} value={walletForm.chain} onChange={e => setWalletForm({...walletForm, chain: e.target.value})}>
                                    <option value="ethereum">Ethereum</option>
                                    <option value="bitcoin">Bitcoin</option>
                                    <option value="solana">Solana</option>
                                </select>
                                <Button type="submit" size="sm" className="w-full mt-2 flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3" /> Add Wallet
                                </Button>
                            </form>
                        )}
                    </Card>

                    <Card title="Record Transaction">
                        {wallets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 dark:bg-dark-muted/20 rounded-lg border border-dashed border-gray-200 dark:border-dark-border">
                                Add a wallet above to start recording transactions
                            </div>
                        ) : (
                            <form onSubmit={handleAddTx} className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Wallet</label>
                                    <select required className={inputClasses} value={txForm.walletId} onChange={e => setTxForm({...txForm, walletId: e.target.value})}>
                                        <option value="">Select Wallet</option>
                                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Action</label>
                                        <select className={inputClasses} value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value as CryptoTxType})}>
                                            <option value="buy">Buy</option>
                                            <option value="sell">Sell</option>
                                            <option value="transfer">Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Asset</label>
                                        <input placeholder="BTC" required className={inputClasses} value={txForm.asset} onChange={e => setTxForm({...txForm, asset: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Quantity</label>
                                        <input type="number" step="any" placeholder="0.00" required className={inputClasses} value={txForm.quantity} onChange={e => setTxForm({...txForm, quantity: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Price / Unit ($)</label>
                                        <input type="number" step="any" placeholder="0.00" required className={inputClasses} value={txForm.price} onChange={e => setTxForm({...txForm, price: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Fee ($)</label>
                                        <input type="number" step="any" placeholder="0.00" className={inputClasses} value={txForm.fee} onChange={e => setTxForm({...txForm, fee: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Date</label>
                                        <input type="datetime-local" required className={inputClasses} value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                                    </div>
                                </div>

                                <Button type="submit" size="sm" className="w-full mt-2">Record Transaction</Button>
                            </form>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-2">
                    <Card title="Current Holdings">
                        {assetList.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center text-gray-500 dark:text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-muted rounded-full flex items-center justify-center mb-4">
                                    <Bitcoin className="w-8 h-8 opacity-40" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Empty Portfolio</h3>
                                <p className="text-sm mt-1">Add transactions to see your assets and performance here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {assetList.map(asset => {
                                    const h = holdings[asset];
                                    if (h.quantity <= 0.000001) return null;
                                    const currentPrice = prices[asset]?.usd || 0;
                                    const change = prices[asset]?.usd_24h_change || 0;
                                    const value = h.quantity * currentPrice;
                                    const pnl = value - h.costBasis;
                                    
                                    return (
                                        <div key={asset} className="p-5 bg-white dark:bg-dark-muted/20 rounded-xl border border-gray-200 dark:border-dark-border hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                                                        {asset.slice(0, 1)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-lg text-gray-900 dark:text-white">{asset}</span>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatCrypto(h.quantity, '')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</div>
                                                    <div className={`text-xs ${change >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center justify-end gap-1 font-medium`}>
                                                        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                                        {Math.abs(change).toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-gray-100 dark:border-dark-border pt-3 mt-1">
                                                <span className="text-xs text-gray-500 font-medium">Unrealized P&L</span>
                                                <span className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    <Card title="History">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-muted/50 border-b border-gray-100 dark:border-dark-border">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Asset</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 text-right font-semibold">Price</th>
                                        <th className="px-4 py-3 text-right font-semibold">Qty</th>
                                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                                        <th className="px-4 py-3 text-center rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">No transactions recorded</td>
                                        </tr>
                                    )}
                                    {transactions.slice().reverse().map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-dark-muted/30 transition-colors group">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{tx.asset}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    tx.type === 'buy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' : 
                                                    tx.type === 'sell' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900' : 
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">{formatCurrency(tx.price)}</td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">{tx.quantity}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white font-mono">{formatCurrency((tx.quantity * tx.price) + tx.fee)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => onDeleteTransaction(tx.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};