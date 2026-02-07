import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../hooks/useCurrency';

export function TimePeriodStats() {
    const { timePeriods, summary } = useExpenses();
    const { baseCurrency } = useCurrency();

    const stats = [
        { label: 'LAST_7_DAYS', value: timePeriods.rolling7Days, icon: '⟨7D⟩' },
        { label: 'LAST_MONTH', value: timePeriods.lastMonth, icon: '⟨1M⟩' },
        { label: 'LAST_QUARTER', value: timePeriods.lastQuarter, icon: '⟨3M⟩' },
        { label: 'LIFETIME', value: summary.totalSpent, icon: '⟨ALL⟩' }
    ];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                letterSpacing: '0.1em'
            }}>
                [TIME_SERIES_ANALYSIS]
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                fontFamily: 'JetBrains Mono'
            }}
                className="time-stats-grid"
            >
                {stats.map((stat, idx) => (
                    <div
                        key={stat.label}
                        style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-muted)',
                            animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s forwards`,
                            opacity: 0
                        }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'var(--text-white)',
                            marginBottom: '0.25rem'
                        }}>
                            {baseCurrency} {stat.value.toFixed(0)}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em'
                        }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
