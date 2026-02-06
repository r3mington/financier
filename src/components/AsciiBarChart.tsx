import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../hooks/useCurrency';


export function AsciiBarChart() {
    const { expenses } = useExpenses();
    const { convert, baseCurrency } = useCurrency();

    // 1. Aggregate by Category (My Share Only)
    const categoryTotals: Record<string, number> = {};
    let maxTotal = 0;

    expenses.forEach(exp => {
        const currency = exp.currency || baseCurrency;
        const myShareConverted = convert(exp.myShare, currency);

        const cat = exp.category;
        const current = categoryTotals[cat] || 0;
        const newVal = current + myShareConverted;
        categoryTotals[cat] = newVal;

        if (newVal > maxTotal) maxTotal = newVal;
    });

    // 2. Sort by highest spend
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .filter(([, val]) => val > 0);

    if (sortedCategories.length === 0) return null;

    // 3. Render Bar Helper
    const renderBar = (value: number, max: number, width: number = 20) => {
        const percentage = value / max;
        const filledLen = Math.round(percentage * width);
        const emptyLen = width - filledLen;

        // Character sets
        const charFill = '█';
        const charEmpty = '░';

        return charFill.repeat(filledLen) + charEmpty.repeat(emptyLen);
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                [SPEND_ANALYSIS_BY_CATEGORY]
            </div>

            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                {sortedCategories.map(([cat, val]) => (
                    <div key={cat} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '80px', color: 'var(--text-white)' }}>{cat.toUpperCase()}</div>
                        <div style={{ color: 'var(--text-primary)' }}>
                            {renderBar(val, maxTotal)}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                            {baseCurrency} {val.toFixed(0)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
