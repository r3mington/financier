import { useState, useEffect } from 'react';
import type { RatesResponse } from '../types';
import { SUPPORTED_CURRENCIES } from '../types';

const STORAGE_KEY_RATES = 'financier_rates_cache_v2';
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
            // Always fetch based on USD to ensure we get all rates relative to a common anchor
            // Frankfurter might not support "from=IDR" etc.
            const ANCHOR_CURRENCY = 'USD';

            // 1. Check Cache
            const cached = localStorage.getItem(STORAGE_KEY_RATES);
            if (cached) {
                const parsed = JSON.parse(cached);
                const age = Date.now() - new Date(parsed.date).getTime();
                // Return cache if less than 24 hours old AND base is matches anchor
                if (age < 24 * 60 * 60 * 1000 && parsed.base === ANCHOR_CURRENCY) {
                    setRates(parsed.rates);
                    return;
                }
            }

            // 2. Fetch API
            setIsLoading(true);
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?from=${ANCHOR_CURRENCY}`);
                if (!res.ok) throw new Error('Failed to fetch rates');

                const data: RatesResponse = await res.json();

                // Cache it
                const cacheData = {
                    base: ANCHOR_CURRENCY,
                    date: new Date().toISOString(),
                    rates: data.rates
                };
                localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(cacheData));

                setRates(data.rates);
            } catch (err) {
                console.error("Currency fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, []); // Run once on mount (or if we want to refresh periodically)

    // Convert any currency to the current selected baseCurrency
    const convert = (amount: number, fromCurrency: string): number => {
        // Rates are based on USD (1 USD = x Currency).
        // rates['IDR'] = 16000 implies 1 USD = 16000 IDR.
        // rates['USD'] is undefined or 1 (implicit).

        // 1. Convert Input -> USD
        let amountInUSD = amount;
        if (fromCurrency !== 'USD') {
            const rateToUSD = rates[fromCurrency];
            if (!rateToUSD) return amount; // Fallback: If unknown currency, don't convert (or maybe return 0 to indicate error?)
            amountInUSD = amount / rateToUSD;
        }

        // 2. Convert USD -> Target (baseCurrency)
        if (baseCurrency === 'USD') return amountInUSD;

        const rateToTarget = rates[baseCurrency];
        if (!rateToTarget) return amountInUSD; // Fallback: If target unknown, show in USD

        return amountInUSD * rateToTarget;
    };

    /**
     * Helper - Persist "Last Input Currency" for the form
     * This is separate from reporting base currency.
     */
    const [lastInputCurrency, setLastInputCurrency] = useState(() => {
        return localStorage.getItem('last_input_currency') || 'USD';
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
