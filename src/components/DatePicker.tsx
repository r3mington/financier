import { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
    value: string; // ISO Date String (yyyy-MM-dd)
    onChange: (date: string) => void;
    label?: string;
    minDate?: string;
    maxDate?: string;
}

export function DatePicker({ value, onChange, label, minDate, maxDate }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse the initial value correctly. If value is invalid, fallback to current date.
    const initialDate = value && !isNaN(Date.parse(value)) ? parseISO(value) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync viewDate when value changes externally, but only if open to avoid jumping while navigating
    useEffect(() => {
        if (value && !isNaN(Date.parse(value))) {
            // Only update view date if it's significantly different? 
            // Better behavior: If user opens picker, show the selected date's month.
            if (!isOpen) {
                setViewDate(parseISO(value));
            }
        }
    }, [value, isOpen]);

    // Close on outside click is handled by a listener on document or a transparent overlay.
    // Listener approach:
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));

    const handleSelectDate = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        onChange(dateStr);
        setIsOpen(false);
        setViewDate(day); // Keep the view on the selected month
    };

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd
    });

    // Padding for start of month
    const startDay = monthStart.getDay(); // 0 (Sun) - 6 (Sat)
    // Create empty slots for grid alignment
    const blanks = Array.from({ length: startDay });

    const isDateDisabled = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (minDate && dateStr < minDate) return true;
        if (maxDate && dateStr > maxDate) return true;
        return false;
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {label && (
                <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="glass-input"
                style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    width: '100%',
                    color: value ? 'var(--text-white)' : 'var(--text-muted)'
                }}
            >
                <span style={{ fontFamily: 'monospace' }}>{value || 'SELECT_DATE'}</span>
                <Calendar size={16} color="var(--text-muted)" />
            </button>

            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    zIndex: 1000,
                    padding: '1rem',
                    width: '300px', // Fixed width for consistency
                    background: 'var(--bg-secondary)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    border: '1px solid var(--border-primary)' // Highlight border
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <button type="button" onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <span style={{ fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: 'var(--text-white)' }}>
                            {format(viewDate, 'MMMM yyyy')}
                        </span>
                        <button type="button" onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '0.5rem', columnGap: '0.25rem' }}>
                        {blanks.map((_, i) => <div key={`blank-${i}`} />)}

                        {daysInMonth.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isSelected = value === dateStr;
                            const isDisabled = isDateDisabled(day);
                            const isCurrentDay = isToday(day);

                            return (
                                <button
                                    key={dateStr}
                                    type="button"
                                    onClick={() => !isDisabled && handleSelectDate(day)}
                                    disabled={isDisabled}
                                    style={{
                                        background: isSelected ? 'var(--color-success)' : 'transparent',
                                        color: isSelected ? 'var(--bg-primary)' : isDisabled ? 'var(--text-muted)' : 'var(--text-white)',
                                        border: isCurrentDay && !isSelected ? '1px solid var(--color-success)' : 'none',
                                        borderRadius: 'var(--radius)',
                                        padding: '0.4rem 0',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem',
                                        fontFamily: 'monospace',
                                        opacity: isDisabled ? 0.3 : 1,
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        transition: 'all 0.15s'
                                    }}
                                    className={!isDisabled && !isSelected ? 'hover:bg-tertiary' : ''}
                                    onMouseEnter={(e) => {
                                        if (!isDisabled && !isSelected) {
                                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                                            e.currentTarget.style.color = 'var(--color-success)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDisabled && !isSelected) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-white)';
                                        }
                                    }}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
