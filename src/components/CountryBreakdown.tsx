import type { CountryStat } from '../hooks/useReporting';

type Props = {
    data: CountryStat[];
    baseCurrency: string;
};

export function CountryBreakdown({ data, baseCurrency }: Props) {
    return (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                [GEOGRAPHIC_DISTRIBUTION]
            </div>
            {data.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                    // NO_DATA
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {data.map((stat) => (
                        <div key={stat.code}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                                <span style={{ color: 'var(--text-primary)' }}>{stat.code.toUpperCase()}</span>
                                <div>
                                    <span style={{ color: 'var(--text-primary)', marginRight: '0.5rem' }}>
                                        {baseCurrency} {stat.amount.toFixed(2)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        ({stat.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${stat.percentage}%`,
                                        background: 'var(--color-success)',
                                        borderRadius: '0'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
