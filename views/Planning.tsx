import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Budget, Goal, Transaction } from '../types';
import { formatCurrency } from '../utils';
import { Target, PlusCircle, Trash2, AlertCircle, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

interface PlanningProps {
    budgets: Budget[];
    goals: Goal[];
    transactions: Transaction[];
    onAddBudget: (budget: Omit<Budget, 'id'>) => void;
    onDeleteBudget: (id: number) => void;
    onAddGoal: (goal: Omit<Goal, 'id'>) => void;
    onDeleteGoal: (id: number) => void;
    onUpdateGoal: (id: number, amount: number) => void;
}

export const Planning: React.FC<PlanningProps> = ({ 
    budgets, 
    goals, 
    transactions,
    onAddBudget, 
    onDeleteBudget,
    onAddGoal,
    onDeleteGoal,
    onUpdateGoal
}) => {
    // Form States
    const [budgetForm, setBudgetForm] = useState({ category: 'food', amount: '' });
    const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', deadline: '', currentAmount: '0' });

    // Helper: Calculate spent amount for a category in the current month
    const getSpentAmount = (category: string) => {
        const now = new Date();
        return transactions
            .filter(t => 
                t.type === 'expense' && 
                t.category === category &&
                new Date(t.date).getMonth() === now.getMonth() &&
                new Date(t.date).getFullYear() === now.getFullYear()
            )
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const handleBudgetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBudget({
            category: budgetForm.category,
            amount: parseFloat(budgetForm.amount)
        });
        setBudgetForm({ category: 'food', amount: '' });
    };

    const handleGoalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddGoal({
            name: goalForm.name,
            targetAmount: parseFloat(goalForm.targetAmount),
            deadline: goalForm.deadline,
            currentAmount: parseFloat(goalForm.currentAmount)
        });
        setGoalForm({ name: '', targetAmount: '', deadline: '', currentAmount: '0' });
    };

    const inputClasses = "w-full bg-white dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
    const labelClasses = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Planning</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Set monthly budgets and track long-term goals</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BUDGETS SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border pb-2">
                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                        <h3>Monthly Budgets</h3>
                    </div>

                    <Card>
                        <form onSubmit={handleBudgetSubmit} className="flex gap-3 items-end mb-6">
                            <div className="flex-1">
                                <label className={labelClasses}>Category</label>
                                <select 
                                    className={inputClasses}
                                    value={budgetForm.category}
                                    onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}
                                >
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
                            <div className="flex-1">
                                <label className={labelClasses}>Limit ($)</label>
                                <input 
                                    type="number" 
                                    required 
                                    placeholder="500"
                                    className={inputClasses}
                                    value={budgetForm.amount}
                                    onChange={e => setBudgetForm({...budgetForm, amount: e.target.value})}
                                />
                            </div>
                            <Button type="submit" className="mb-[1px]">
                                <PlusCircle className="w-5 h-5" />
                            </Button>
                        </form>

                        <div className="space-y-5">
                            {budgets.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No budgets set for this month.</p>
                            )}
                            {budgets.map(budget => {
                                const spent = getSpentAmount(budget.category);
                                const percentage = Math.min((spent / budget.amount) * 100, 100);
                                let colorClass = 'bg-emerald-500';
                                if (percentage > 80) colorClass = 'bg-amber-500';
                                if (percentage >= 100) colorClass = 'bg-red-500';

                                return (
                                    <div key={budget.id} className="group">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold capitalize text-gray-900 dark:text-white">{budget.category}</span>
                                                {percentage >= 100 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">OVER</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {formatCurrency(spent)} <span className="text-gray-400">/ {formatCurrency(budget.amount)}</span>
                                                </span>
                                                <button onClick={() => onDeleteBudget(budget.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-dark-muted rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* GOALS SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border pb-2">
                        <Target className="w-5 h-5 text-indigo-500" />
                        <h3>Savings Goals</h3>
                    </div>

                    <Card>
                        <form onSubmit={handleGoalSubmit} className="space-y-4 mb-8">
                            <div>
                                <label className={labelClasses}>Goal Name</label>
                                <input 
                                    required
                                    placeholder="e.g. New Laptop"
                                    className={inputClasses}
                                    value={goalForm.name}
                                    onChange={e => setGoalForm({...goalForm, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses}>Target ($)</label>
                                    <input 
                                        type="number"
                                        required
                                        className={inputClasses}
                                        value={goalForm.targetAmount}
                                        onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Saved So Far ($)</label>
                                    <input 
                                        type="number"
                                        required
                                        className={inputClasses}
                                        value={goalForm.currentAmount}
                                        onChange={e => setGoalForm({...goalForm, currentAmount: e.target.value})}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className={labelClasses}>Deadline</label>
                                <input 
                                    type="date"
                                    required
                                    className={inputClasses}
                                    value={goalForm.deadline}
                                    onChange={e => setGoalForm({...goalForm, deadline: e.target.value})}
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Goal</Button>
                        </form>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {goals.map(goal => {
                                const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                                const isComplete = percent >= 100;

                                return (
                                    <div key={goal.id} className="relative p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-muted/20 hover:border-indigo-500 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2">{goal.name}</h4>
                                            {isComplete ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                            {formatCurrency(goal.currentAmount)}
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                                                / {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-dark-card rounded-full h-1.5 mb-3">
                                            <div 
                                                className={`h-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(goal.deadline).toLocaleDateString()}
                                            </span>
                                            <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => onUpdateGoal(goal.id, goal.currentAmount + 100)}
                                                    className="hover:text-indigo-500 font-bold"
                                                >
                                                    + $100
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};