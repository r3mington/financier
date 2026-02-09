import { useMemo } from 'react';
import type { Expense } from '../types';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { useCurrency } from './useCurrency';

export type ChartDataPoint = {
    date: string;       // YYYY-MM-DD
    amount: number;     // Daily total in base currency
    fullDate: Date;     // Date object for sorting/filtering
    label: string;      // Display label (e.g. "Feb 09")
};

export type ReportingStats = {
    todaySpend: number;
    totalEverSpend: number;
    trendData: ChartDataPoint[];
    averageDailySpend: number; // For the selected period
};

export const useReporting = (expenses: Expense[], periodDays: number = 30) => {
    const { convert, baseCurrency } = useCurrency();

    return useMemo(() => {
        const today = new Date();
        const dailyBuckets: Record<string, number> = {};
        let totalEver = 0;

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
                label: format(day, 'MMM dd')
            });
        });

        // 3. Stats
        const todayKey = format(today, 'yyyy-MM-dd');
        return {
            todaySpend: dailyBuckets[todayKey] || 0,
            totalEverSpend: totalEver,
            trendData,
            averageDailySpend: periodTotal / periodDays
        };

    }, [expenses, periodDays, baseCurrency, convert]);
};
