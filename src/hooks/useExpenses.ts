import { useState, useEffect } from 'react';
import type { Expense, ExpenseSummary } from '../types';
import { useCurrency } from './useCurrency';

const STORAGE_KEY = 'financier_expenses_v1';

export function useExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const { convert, baseCurrency } = useCurrency();

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const updateExpense = (id: string, updated: Expense) => {
        setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    };

    // Calculate Summary with Conversion
    const summary: ExpenseSummary = expenses.reduce((acc, curr) => {
        const currency = curr.currency || baseCurrency; // Fallback for old data without currency

        // Convert amounts to BASE currency
        const myShareConverted = convert(curr.myShare, currency);
        const totalConverted = convert(curr.totalAmount, currency);

        // 1. Total "Real" Spend (consumption)
        acc.totalSpent += myShareConverted;

        // 2. Debts/Credits logic
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

    summary.netBalance = summary.totalOwedToMe - summary.totalIOwe;

    // Time Period Statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Last month (previous calendar month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Last quarter (previous 3 months)
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
        timePeriods: {
            rolling7Days,
            lastMonth,
            lastQuarter
        }
    };
}
