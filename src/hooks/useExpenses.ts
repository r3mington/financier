import { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';




export function useExpenses() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

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
                    endDate: item.end_date,
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
            }
            setLoading(false);
        };

        fetchExpenses();

        // One-time cleanup of old local storage data
        localStorage.removeItem('financier_expenses_v1');
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
            end_date: expense.endDate,
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
            end_date: updatedExpense.endDate,
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



    // Time Period Statistics


    return {
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        loading
    };
}
