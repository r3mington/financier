import { useMemo } from 'react';
import type { Expense } from '../types';
import { format, parseISO, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
import { useCurrency } from './useCurrency';

export type ChartDataPoint = {
    date: string;       // YYYY-MM-DD
    amount: number;     // Daily total in base currency
    fullDate: Date;     // Date object for sorting/filtering
    label: string;      // Display label (e.g. "Feb 09")
    expenses?: {        // List of expenses for this day
        id: string;
        description: string;
        amount: number;
    }[];
};

export type CountryStat = {
    code: string;
    amount: number;
    percentage: number;
};

export type ReportingStats = {
    todaySpend: number;
    totalEverSpend: number;
    trendData: ChartDataPoint[];
    averageDailySpend: number; // For the selected period
    countryStats: CountryStat[];
};

export const useReporting = (expenses: Expense[], periodDays: number = 30) => {
    const { convert, baseCurrency } = useCurrency();

    return useMemo(() => {
        const today = new Date();
        const dailyBuckets: Record<string, number> = {};
        const dailyExpenses: Record<string, { id: string; description: string; amount: number }[]> = {};
        const countryBuckets: Record<string, number> = {};
        let totalEver = 0;

        const periodStart = subDays(today, periodDays - 1);
        const periodEnd = today;

        // 1. Bucket Algorithm: Distribute all expenses into daily buckets
        expenses.forEach(expense => {
            // Convert cost to base currency first
            const currency = expense.currency || baseCurrency;
            const myShareConverted = convert(expense.myShare, currency);

            totalEver += myShareConverted;

            const start = parseISO(expense.date);
            const end = expense.endDate ? parseISO(expense.endDate) : start;

            // Use date-fns for robust interval handling
            // eachDayOfInterval throws if start > end, so we safeguard
            if (end < start) {
                // Fallback for bad data: treat as single day
                const dateKey = format(start, 'yyyy-MM-dd');
                dailyBuckets[dateKey] = (dailyBuckets[dateKey] || 0) + myShareConverted;
                return;
            }

            const interval = eachDayOfInterval({ start, end });
            const daysCount = interval.length;
            const dailyCost = myShareConverted / daysCount;

            interval.forEach(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                dailyBuckets[dateKey] = (dailyBuckets[dateKey] || 0) + dailyCost;

                // Track individual expenses
                if (!dailyExpenses[dateKey]) dailyExpenses[dateKey] = [];
                dailyExpenses[dateKey].push({
                    id: expense.id,
                    description: expense.description,
                    amount: dailyCost
                });

                // Track country spend if within selected period
                if (isWithinInterval(day, { start: periodStart, end: periodEnd })) {
                    // Use country code or fallback to '??'
                    // Access location safely since it's optional
                    const countryCode = expense.location?.countryCode || '??';
                    countryBuckets[countryCode] = (countryBuckets[countryCode] || 0) + dailyCost;
                }
            });
        });

        // 2. Prepare Trend Data for the requested period
        const trendData: ChartDataPoint[] = [];
        // Generate last N days (inclusive of today)
        const periodInterval = eachDayOfInterval({
            start: subDays(today, periodDays - 1),
            end: today
        });

        let periodTotal = 0;

        periodInterval.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const amount = dailyBuckets[dateKey] || 0;

            periodTotal += amount;

            trendData.push({
                date: dateKey,
                amount: Number(amount.toFixed(2)), // Round for chart display
                fullDate: day,
                label: format(day, 'MMM dd'),
                expenses: dailyExpenses[dateKey] || []
            });
        });

        // 3. Process Country Stats
        const countryStats: CountryStat[] = Object.entries(countryBuckets)
            .map(([code, amount]) => ({
                code,
                amount,
                percentage: periodTotal > 0 ? (amount / periodTotal) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5

        // 4. Stats
        const todayKey = format(today, 'yyyy-MM-dd');
        return {
            todaySpend: dailyBuckets[todayKey] || 0,
            totalEverSpend: totalEver,
            trendData,
            averageDailySpend: periodTotal / periodDays,
            countryStats
        };

    }, [expenses, periodDays, baseCurrency, convert]);
};
