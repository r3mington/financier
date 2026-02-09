import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type TrendChartProps = {
    data: { date: string, amount: number, label: string }[];
    period: number;
    setPeriod: (days: number) => void;
    baseCurrency: string;
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
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                                border: '1px solid #00ff41',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem'
                            }}
                            itemStyle={{ color: '#00ff41' }}
                            formatter={(value: any) => [`${baseCurrency} ${Number(value).toFixed(2)}`, 'Spend']}
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
