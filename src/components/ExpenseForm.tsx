import { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { CATEGORIES, CURRENCY_NAMES } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { v4 as uuidv4 } from 'uuid';
import { X, Trash2, MapPin } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface ExpenseFormProps {
    initialData?: Expense;
    onSave: (expense: Expense) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

export function ExpenseForm({ initialData, onSave, onCancel, onDelete }: ExpenseFormProps) {
    const { supportedCurrencies, lastInputCurrency, updateLastInputCurrency } = useCurrency();

    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.totalAmount.toString() || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialData?.endDate || '');
    const [isMultiDay, setIsMultiDay] = useState(!!initialData?.endDate && initialData.endDate !== initialData.date);

    const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);

    // Update endDate when multi-day is toggled off
    useEffect(() => {
        if (!isMultiDay) {
            setEndDate('');
        }
    }, [isMultiDay]);

    const [currency, setCurrency] = useState(initialData?.currency || lastInputCurrency);
    const [paidBy, setPaidBy] = useState<'me' | 'other'>(initialData?.paidBy || 'me');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [location, setLocation] = useState(initialData?.location);
    const [isLocating, setIsLocating] = useState(false);

    const isHalf = initialData && initialData.myShare === (initialData.totalAmount / 2);

    const [shareType, setShareType] = useState<'exact' | 'half'>(
        initialData ? (isHalf ? 'half' : 'exact') : 'exact'
    );

    const [myShareAmount, setMyShareAmount] = useState(
        initialData ? (isHalf ? '' : initialData.myShare.toString()) : ''
    );

    // Auto-fill my share when amount changes (if exact match)
    useEffect(() => {
        if (!initialData && shareType === 'exact') {
            setMyShareAmount(amount);
        }
    }, [amount, shareType, initialData]);

    // Get Location on Mount for new transactions
    useEffect(() => {
        if (!initialData && !location) {
            handleGetLocation();
        }
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                let locationData: Expense['location'] = {
                    lat: latitude,
                    lng: longitude
                };

                try {
                    // Reverse geocoding via OpenStreetMap (Nominatim)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county;
                        const country = data.address.country;
                        const countryCode = data.address.country_code?.toUpperCase();

                        locationData = {
                            ...locationData,
                            city,
                            country,
                            countryCode,
                            address: data.display_name
                        };
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed", error);
                }

                setLocation(locationData);
                setIsLocating(false);
            },
            (err) => {
                console.error("Loc error", err);
                setIsLocating(false);
            }
        );
    };

    useEffect(() => {
        if (!initialData) {
            updateLastInputCurrency(currency);
        }
    }, [currency, updateLastInputCurrency, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const total = parseFloat(amount);
        let calculatedShare = 0;

        if (shareType === 'half') {
            calculatedShare = total / 2;
        } else {
            calculatedShare = parseFloat(myShareAmount);
        }

        if (isNaN(calculatedShare)) calculatedShare = total;

        // Validation: End Date must be after Start Date
        if (isMultiDay && endDate && endDate < date) {
            alert('End date cannot be before start date');
            return;
        }

        const newExpense: Expense = {
            id: initialData?.id || uuidv4(),
            date,
            endDate: isMultiDay ? endDate : undefined,
            description,
            category,
            totalAmount: total,
            paidBy,
            myShare: calculatedShare,
            currency,
            notes,
            location
        };

        onSave(newExpense);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '0',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-secondary)'
            }}>
                {/* Terminal header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '2px solid var(--border-primary)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.05em',
                        fontWeight: 700
                    }}>
                        {initialData ? '[EDIT_MODE]' : '[NEW_TRANSACTION]'}
                    </h2>
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                        {initialData && onDelete && (
                            <button
                                onClick={() => {
                                    if (confirm('DELETE TRANSACTION?')) onDelete(initialData.id);
                                }}
                                style={{
                                    background: 'none',
                                    border: '1px solid var(--color-danger)',
                                    color: 'var(--color-danger)',
                                    cursor: 'pointer',
                                    padding: '0.4rem',
                                    transition: 'all 0.15s'
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onCancel}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border-muted)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                transition: 'all 0.15s'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem' }}>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            [DESCRIPTION]
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="glass-input"
                                placeholder="e.g., DINNER_WITH_TEAM"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                autoFocus={!initialData}
                                required
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="glass-button"
                                style={{
                                    padding: '0 0.75rem',
                                    color: location ? 'var(--color-success)' : 'var(--text-muted)',
                                    borderColor: location ? 'var(--color-success)' : 'var(--border-muted)'
                                }}
                                title={location ? `Lat: ${location.lat}, Lng: ${location.lng}` : "Get Location"}
                            >
                                <MapPin size={18} className={isLocating ? 'animate-pulse' : ''} />
                            </button>
                        </div>
                        {location && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: 'var(--color-success)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={10} />
                                {location.city ? `${location.city.toUpperCase()}, ${location.countryCode}` : `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                            </div>
                        )}
                    </div>

                    {/* Amount + Currency */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                [AMOUNT]
                            </label>
                            <input
                                className="glass-input"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ width: '100px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                [CCY]
                            </label>
                            <select
                                className="glass-input"
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}
                            >
                                {supportedCurrencies.map(c => (
                                    <option key={c} value={c}>{c} - {CURRENCY_NAMES[c]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date + Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                <span>[DATE]</span>
                                <button
                                    type="button"
                                    onClick={() => setIsMultiDay(!isMultiDay)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: isMultiDay ? 'var(--color-accent)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.65rem',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {isMultiDay ? 'MULTI-DAY' : 'SINGLE'}
                                </button>
                            </label>
                            <DatePicker
                                value={date}
                                onChange={setDate}
                            />
                            {isMultiDay && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                                        [ENDS_ON]
                                    </label>
                                    <DatePicker
                                        value={endDate}
                                        onChange={setEndDate}
                                        minDate={date}
                                    />
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                        {endDate ? `${Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)) + 1)} days` : ''}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                [CATEGORY]
                            </label>
                            <select
                                className="glass-input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Who Paid */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            [PAYER]
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className="glass-button"
                                style={{
                                    background: paidBy === 'me' ? 'var(--border-primary)' : 'var(--bg-tertiary)',
                                    color: paidBy === 'me' ? 'var(--bg-primary)' : 'var(--text-primary)',
                                    borderColor: paidBy === 'me' ? 'var(--border-primary)' : 'var(--border-muted)',
                                    padding: '0.75rem'
                                }}
                                onClick={() => setPaidBy('me')}
                            >
                                USER
                            </button>
                            <button
                                type="button"
                                className="glass-button"
                                style={{
                                    background: paidBy === 'other' ? 'var(--border-primary)' : 'var(--bg-tertiary)',
                                    color: paidBy === 'other' ? 'var(--bg-primary)' : 'var(--text-primary)',
                                    borderColor: paidBy === 'other' ? 'var(--border-primary)' : 'var(--border-muted)',
                                    padding: '0.75rem'
                                }}
                                onClick={() => setPaidBy('other')}
                            >
                                OTHER
                            </button>
                        </div>
                    </div>

                    {/* Split Logic */}
                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-muted)'
                    }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                            [YOUR_SHARE]
                        </label>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShareType('exact');
                                    setMyShareAmount(amount);
                                }}
                                style={{
                                    flex: 1,
                                    background: shareType === 'exact' && myShareAmount === amount ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-muted)',
                                    color: shareType === 'exact' && myShareAmount === amount ? 'var(--bg-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    padding: '0.5rem',
                                    fontFamily: 'JetBrains Mono'
                                }}
                            >
                                FULL
                            </button>
                            <button
                                type="button"
                                onClick={() => setShareType('half')}
                                style={{
                                    flex: 1,
                                    background: shareType === 'half' ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-muted)',
                                    color: shareType === 'half' ? 'var(--bg-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    padding: '0.5rem',
                                    fontFamily: 'JetBrains Mono'
                                }}
                            >
                                50/50
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShareType('exact');
                                    setMyShareAmount('');
                                }}
                                style={{
                                    flex: 1,
                                    background: shareType === 'exact' && myShareAmount !== amount ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-muted)',
                                    color: shareType === 'exact' && myShareAmount !== amount ? 'var(--bg-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    padding: '0.5rem',
                                    fontFamily: 'JetBrains Mono'
                                }}
                            >
                                CUSTOM
                            </button>
                        </div>

                        {shareType === 'half' ? (
                            <div style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.5rem',
                                padding: '0.75rem',
                                color: 'var(--text-primary)',
                                fontFamily: 'JetBrains Mono'
                            }}>
                                {currency} {(parseFloat(amount || '0') / 2).toFixed(2)}
                            </div>
                        ) : (
                            <input
                                className="glass-input"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={myShareAmount}
                                onChange={e => setMyShareAmount(e.target.value)}
                            />
                        )}

                        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                // {paidBy === 'me'
                                ? shareType === 'half' || (parseFloat(myShareAmount) < parseFloat(amount))
                                    ? `RECEIVABLE: ${currency} ${(parseFloat(amount || '0') - (shareType === 'half' ? parseFloat(amount || '0') / 2 : parseFloat(myShareAmount || '0'))).toFixed(2)}`
                                    : 'PERSONAL_SPEND'
                                : `PAYABLE: ${currency} ${shareType === 'half' ? (parseFloat(amount || '0') / 2).toFixed(2) : parseFloat(myShareAmount || '0').toFixed(2)}`
                            }
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            [NOTES]
                        </label>
                        <textarea
                            className="glass-input"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            placeholder="// ADD_DETAILS..."
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <button type="submit" className="glass-button" style={{
                        padding: '1rem',
                        marginTop: '0.5rem'
                    }}>
                        {initialData ? '[UPDATE]' : '[COMMIT]'}
                    </button>

                </form >
            </div >
        </div >
    );
}
