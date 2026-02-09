import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage('Password reset link sent! Check your email.');
            } else if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '1rem',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'JetBrains Mono'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
                    [FINANCIER_ACCESS]
                </h2>

                <form onSubmit={handleAuth} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            [EMAIL]
                        </label>
                        <input
                            className="glass-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                [PASSWORD]
                            </label>
                            <input
                                className="glass-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

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
                        style={{ padding: '1rem', marginTop: '1rem' }}
                    >
                        {loading
                            ? 'PROCESSING...'
                            : isForgotPassword
                                ? '[SEND_RESET_LINK]'
                                : isSignUp
                                    ? '[INIT_REGISTRATION]'
                                    : '[AUTHENTICATE]'
                        }
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {!isForgotPassword && (
                        <button
                            onClick={() => setIsForgotPassword(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            FORGOT_PASSWORD?
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setIsForgotPassword(false);
                            setError(null);
                            setMessage(null);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        {isForgotPassword
                            ? 'BACK_TO_LOGIN'
                            : isSignUp
                                ? 'ALREADY_HAVE_ACCESS? LOGIN'
                                : 'NO_ACCESS? REGISTER'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
