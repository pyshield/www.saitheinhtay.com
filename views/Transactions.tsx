import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { Trash2, Filter, Calendar, Search, PlusCircle } from 'lucide-react';

interface TransactionsProps {
    transactions: Transaction[];
    onAdd: (tx: Omit<Transaction, 'id'>) => void;
    onDelete: (id: number) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onAdd, onDelete }) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as TransactionType,
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: Catch invalid amounts
        const numAmount = parseFloat(formData.amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a description.");
            return;
        }

        onAdd({
            description: formData.description,
            amount: numAmount,
            type: formData.type,
            category: formData.category,
            date: formData.date,
            notes: formData.notes
        });
        setFormData({ ...formData, description: '', amount: '', notes: '' });
    };

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    const inputClasses = "w-full bg-white dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelClasses = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your income and expenses</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <Card title="Add New Transaction" className="sticky top-24">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClasses}>Description</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Grocery Shopping"
                                    className={inputClasses}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Amount ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        className={inputClasses}
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Type</label>
                                    <select
                                        className={inputClasses}
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Category</label>
                                    <select
                                        className={inputClasses}
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="salary">Salary</option>
                                        <option value="food">Food</option>
                                        <option value="transport">Transport</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="health">Health</option>
                                        <option value="education">Education</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Date</label>
                                    <input
                                        required
                                        type="date"
                                        className={inputClasses}
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <Button type="submit" className="w-full mt-2 flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Add Transaction
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2">
                    <Card 
                        title="Recent History" 
                        actions={
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select 
                                        className="appearance-none bg-gray-100 dark:bg-dark-muted border border-transparent dark:border-dark-border rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                                        value={filterType}
                                        onChange={e => setFilterType(e.target.value)}
                                    >
                                        <option value="all">All Transactions</option>
                                        <option value="income">Income Only</option>
                                        <option value="expense">Expenses Only</option>
                                    </select>
                                    <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                        }
                    >
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
                                    <p className="text-gray-500 text-sm mt-1">Try changing your filters or add a new transaction.</p>
                                </div>
                            ) : (
                                filteredTransactions.slice().reverse().map(tx => (
                                    <div key={tx.id} className="group flex justify-between items-center p-4 bg-white dark:bg-dark-muted/20 rounded-xl border border-gray-100 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors ${tx.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500/20'}`}>
                                                {tx.type === 'income' ? <span className="text-lg font-bold">+</span> : <span className="text-lg font-bold">−</span>}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{tx.description}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-md font-medium">{tx.category}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(tx.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold text-lg tracking-tight ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {formatCurrency(tx.amount)}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                onClick={() => onDelete(tx.id)}
                                                title="Delete Transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};