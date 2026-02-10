import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type TrendChartProps = {
    data: { date: string, amount: number, label: string }[];
    period: number;
    setPeriod: (days: number) => void;
    baseCurrency: string;
};

const CustomTooltip = ({ active, payload, baseCurrency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(10, 10, 10, 0.95)',
                border: '1px solid var(--border-muted)',
                padding: '0.75rem',
                minWidth: '200px',
                zIndex: 100,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    marginBottom: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                        {data.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'JetBrains Mono' }}>
                        {baseCurrency} {data.amount.toFixed(2)}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {data.expenses && data.expenses.slice(0, 8).map((e: any, idx: number) => (
                        <div key={`${e.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem', maxWidth: '120px' }}>
                                {e.description}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {e.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {data.expenses && data.expenses.length > 8 && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                            + {data.expenses.length - 8} more
                        </div>
                    )}
                    {(!data.expenses || data.expenses.length === 0) && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            // No details
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export function TrendChart({ data, period, setPeriod, baseCurrency }: TrendChartProps) {
    return (
        <div className="glass-panel" style={{ padding: '1rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    [SPEND_TREND]
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setPeriod(days)}
                            className={`glass-button ${period === days ? 'active' : ''}`}
                            style={{
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.7rem',
                                opacity: period === days ? 1 : 0.5,
                                borderColor: period === days ? 'var(--text-primary)' : 'var(--border-muted)',
                                color: period === days ? 'var(--text-primary)' : 'var(--text-muted)'
                            }}
                        >
                            {days === 90 ? '3M' : `${days}D`}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            content={<CustomTooltip baseCurrency={baseCurrency} />}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#00ff41"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
