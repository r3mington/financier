import { useState, useEffect, useMemo } from 'react';
import type { Expense, ExpenseSummary } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';
import { useCurrency } from './useCurrency';

const STORAGE_KEY = 'financier_expenses_v1';

export function useExpenses() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const { convert, baseCurrency } = useCurrency();

    // Fetch from Supabase
    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        const fetchExpenses = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching expenses:', error);
            } else {
                const mappedExpenses: Expense[] = (data || []).map((item: any) => ({
                    id: item.id,
                    date: item.date,
                    description: item.description,
                    category: item.category,
                    totalAmount: item.total_amount,
                    paidBy: item.paid_by,
                    myShare: item.my_share,
                    currency: item.currency,
                    notes: item.notes,
                    location: item.location
                }));
                setExpenses(mappedExpenses);

                // Check for local migration
                const localData = localStorage.getItem(STORAGE_KEY);
                if (localData) {
                    try {
                        const parsed: Expense[] = JSON.parse(localData);
                        if (parsed.length > 0) {
                            console.log('Migrating local data to Supabase...');
                            const rowsToInsert = parsed.map(e => ({
                                user_id: user.id,
                                date: e.date,
                                description: e.description,
                                category: e.category,
                                total_amount: e.totalAmount,
                                paid_by: e.paidBy,
                                my_share: e.myShare,
                                currency: e.currency,
                                notes: e.notes,
                                location: e.location
                            }));

                            const { error: insertError } = await supabase.from('expenses').insert(rowsToInsert);
                            if (!insertError) {
                                console.log('Migration successful. Clearing local storage.');
                                localStorage.removeItem(STORAGE_KEY);
                                // Refresh
                                fetchExpenses();
                                return;
                            } else {
                                console.error('Migration failed:', insertError);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing local data for migration', e);
                    }
                }
            }
            setLoading(false);
        };

        fetchExpenses();
    }, [user]);

    const addExpense = async (expense: Expense) => {
        if (!user) return;

        // Optimistic UI update
        const tempId = expense.id || `temp-${Date.now()}`;
        const expenseWithTempId = { ...expense, id: tempId };
        setExpenses(prev => [expenseWithTempId, ...prev]);

        const row = {
            user_id: user.id,
            date: expense.date,
            description: expense.description,
            category: expense.category,
            total_amount: expense.totalAmount,
            paid_by: expense.paidBy,
            my_share: expense.myShare,
            currency: expense.currency,
            notes: expense.notes,
            location: expense.location
        };

        const { data, error } = await supabase.from('expenses').insert(row).select().single();

        if (error) {
            console.error('Error adding expense:', error);
            setExpenses(prev => prev.filter(e => e.id !== tempId));
        } else if (data) {
            setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id } : e));
        }
    };

    const deleteExpense = async (id: string) => {
        const originalExpenses = expenses;
        setExpenses(prev => prev.filter(e => e.id !== id));

        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
            console.error('Error deleting expense:', error);
            setExpenses(originalExpenses);
        }
    };

    const updateExpense = async (id: string, updatedExpense: Expense) => {
        const originalExpenses = expenses;
        setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));

        const row = {
            date: updatedExpense.date,
            description: updatedExpense.description,
            category: updatedExpense.category,
            total_amount: updatedExpense.totalAmount,
            paid_by: updatedExpense.paidBy,
            my_share: updatedExpense.myShare,
            currency: updatedExpense.currency,
            notes: updatedExpense.notes,
            location: updatedExpense.location
        };

        const { error } = await supabase.from('expenses').update(row).eq('id', id);
        if (error) {
            console.error('Error updating expense:', error);
            setExpenses(originalExpenses);
        }
    };

    const summary: ExpenseSummary = useMemo(() => {
        return expenses.reduce((acc, curr) => {
            const currency = curr.currency || baseCurrency;
            const myShareConverted = convert(curr.myShare, currency);
            const totalConverted = convert(curr.totalAmount, currency);

            acc.totalSpent += myShareConverted;

            if (curr.paidBy === 'me') {
                const owedAmount = totalConverted - myShareConverted;
                if (owedAmount > 0) {
                    acc.totalOwedToMe += owedAmount;
                }
            } else {
                acc.totalIOwe += myShareConverted;
            }

            return acc;
        }, {
            totalSpent: 0,
            totalOwedToMe: 0,
            totalIOwe: 0,
            netBalance: 0
        } as ExpenseSummary);
    }, [expenses, baseCurrency, convert]);

    if (summary) {
        summary.netBalance = summary.totalOwedToMe - summary.totalIOwe;
    }

    // Time Period Statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastQuarterStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const lastQuarterEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const calculatePeriodSpend = (startDate: Date, endDate?: Date) => {
        return expenses.reduce((total, exp) => {
            const expDate = new Date(exp.date);
            const isInRange = endDate
                ? expDate >= startDate && expDate <= endDate
                : expDate >= startDate;

            if (isInRange) {
                const currency = exp.currency || baseCurrency;
                return total + convert(exp.myShare, currency);
            }
            return total;
        }, 0);
    };

    const rolling7Days = calculatePeriodSpend(sevenDaysAgo);
    const lastMonth = calculatePeriodSpend(lastMonthStart, lastMonthEnd);
    const lastQuarter = calculatePeriodSpend(lastQuarterStart, lastQuarterEnd);

    return {
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        summary,
        loading,
        timePeriods: {
            rolling7Days,
            lastMonth,
            lastQuarter
        }
    };
}
