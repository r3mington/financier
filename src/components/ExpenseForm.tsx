import { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { CATEGORIES } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { v4 as uuidv4 } from 'uuid';
import { X, Trash2 } from 'lucide-react';

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
    const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);

    const [currency, setCurrency] = useState(initialData?.currency || lastInputCurrency);
    const [paidBy, setPaidBy] = useState<'me' | 'other'>(initialData?.paidBy || 'me');

    const isHalf = initialData && initialData.myShare === (initialData.totalAmount / 2);

    const [shareType, setShareType] = useState<'exact' | 'half'>(
        initialData ? (isHalf ? 'half' : 'exact') : 'exact'
    );

    const [myShareAmount, setMyShareAmount] = useState(
        initialData ? (isHalf ? '' : initialData.myShare.toString()) : ''
    );

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

        const newExpense: Expense = {
            id: initialData?.id || uuidv4(),
            date,
            description,
            category,
            totalAmount: total,
            paidBy,
            myShare: calculatedShare,
            currency
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
                        <input
                            className="glass-input"
                            placeholder="e.g., DINNER_WITH_TEAM"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            autoFocus={!initialData}
                            required
                        />
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
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date + Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                [DATE]
                            </label>
                            <input
                                className="glass-input"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
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

                    <button type="submit" className="glass-button" style={{
                        padding: '1rem',
                        marginTop: '0.5rem'
                    }}>
                        {initialData ? '[UPDATE]' : '[COMMIT]'}
                    </button>

                </form>
            </div>
        </div>
    );
}
