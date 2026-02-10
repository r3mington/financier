

type StatsOverviewProps = {
    todaySpend: number;
    totalEverSpend: number;
    baseCurrency: string;
};

export function StatsOverview({ todaySpend, totalEverSpend, baseCurrency }: StatsOverviewProps) {
    const BUDGET_GOAL = 200;
    const progress = Math.min((todaySpend / BUDGET_GOAL) * 100, 100);
    const color = progress >= 100 ? 'var(--color-danger)' : progress >= 80 ? '#facc15' : 'var(--color-success)';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Today's Spend */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                    [TODAY'S_SPEND]
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                    {baseCurrency} {todaySpend.toFixed(2)}
                </div>

                <div style={{ marginTop: '0.75rem', width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                    <span>{Math.round(progress)}% OF BUDGET</span>
                    <span>GOAL: {baseCurrency}{BUDGET_GOAL}</span>
                </div>
            </div>

            {/* Total Ever Spend */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                    [TOTAL_LIFETIME]
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                    {baseCurrency} {totalEverSpend.toFixed(2)}
                </div>
            </div>
        </div>
    );
}
