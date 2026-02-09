import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';
import { X } from 'lucide-react';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('PASSWORDS_DO_NOT_MATCH');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            setMessage('PASSWORD_UPDATED_SUCCESSFULLY');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    [SYSTEM_SETTINGS]
                </h2>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        [CURRENT_USER]
                    </label>
                    <div className="glass-input" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                        {user?.email}
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-white)', margin: 0 }}>
                        [UPDATE_SECURITY_KEY]
                    </h3>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            [NEW_PASSWORD]
                        </label>
                        <input
                            className="glass-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            [CONFIRM_PASSWORD]
                        </label>
                        <input
                            className="glass-input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
                            // ERROR: {error.toUpperCase()}
                        </div>
                    )}

                    {message && (
                        <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', textAlign: 'center' }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="glass-button"
                        disabled={loading}
                        style={{ padding: '0.75rem' }}
                    >
                        {loading ? 'UPDATING...' : '[UPDATE_PASSWORD]'}
                    </button>
                </form>
            </div>
        </div>
    );
}
