

type StatsOverviewProps = {
    todaySpend: number;
    totalEverSpend: number;
    baseCurrency: string;
};

export function StatsOverview({ todaySpend, totalEverSpend, baseCurrency }: StatsOverviewProps) {
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
