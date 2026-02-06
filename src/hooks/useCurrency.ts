import { useState, useEffect } from 'react';
import type { RatesResponse } from '../types';
import { SUPPORTED_CURRENCIES } from '../types';

const STORAGE_KEY_RATES = 'financier_rates_cache_v1';
const STORAGE_KEY_PREF = 'financier_user_pref_v1';

export function useCurrency() {
    const [baseCurrency, setBaseCurrency] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY_PREF) || 'USD';
    });

    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    // Removed unused lastUpdated state

    // Persistence for Base Currency
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_PREF, baseCurrency);
    }, [baseCurrency]);

    // Fetch Logic
    useEffect(() => {
        const fetchRates = async () => {
            // 1. Check Cache
            const cached = localStorage.getItem(STORAGE_KEY_RATES);
            if (cached) {
                const parsed = JSON.parse(cached);
                const age = Date.now() - new Date(parsed.date).getTime();
                // Return cache if less than 24 hours old AND base matches
                if (age < 24 * 60 * 60 * 1000 && parsed.base === baseCurrency) {
                    setRates(parsed.rates);
                    return;
                }
            }

            // 2. Fetch API
            setIsLoading(true);
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
                if (!res.ok) throw new Error('Failed to fetch rates');

                const data: RatesResponse = await res.json();

                // Cache it
                const cacheData = {
                    base: baseCurrency,
                    date: new Date().toISOString(),
                    rates: data.rates
                };
                localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(cacheData));

                setRates(data.rates);
            } catch (err) {
                console.error("Currency fetch failed", err);
                // Fallback: Ensure 1:1 basics if fetch fails
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, [baseCurrency]);

    const convert = (amount: number, fromCurrency: string): number => {
        if (fromCurrency === baseCurrency) return amount;
        if (!rates[fromCurrency]) return amount; // Fallback if rate missing

        // Frankfurter "latest?from=USD" gives rates relative to USD.
        // e.g. rates['EUR'] = 0.9 (1 USD = 0.9 EUR)
        // To convert EUR to USD: Amount / Rate ? 
        // Wait, Frankfurter `from=base` gives: 1 Base = x Target.
        // So 1 USD = 0.9 EUR.
        // We have 10 EUR.  X USD * 0.9 = 10 EUR.  X = 10 / 0.9.

        return amount / rates[fromCurrency];
    };

    /**
     * Helper - Persist "Last Input Currency" for the form
     * This is separate from reporting base currency.
     */
    const [lastInputCurrency, setLastInputCurrency] = useState(() => {
        return localStorage.getItem('last_input_currency') || baseCurrency;
    });

    const updateLastInputCurrency = (curr: string) => {
        setLastInputCurrency(curr);
        localStorage.setItem('last_input_currency', curr);
    };

    return {
        baseCurrency,
        setBaseCurrency,
        rates,
        isLoading,
        convert,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        lastInputCurrency,
        updateLastInputCurrency
    };
}
