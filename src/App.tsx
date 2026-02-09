import { useState } from 'react';
import type { Expense } from './types';
import { CURRENCY_NAMES } from './types';
import { useExpenses } from './hooks/useExpenses';
import { useCurrency } from './hooks/useCurrency';
import { ExpenseForm } from './components/ExpenseForm';
import { format } from 'date-fns';
import { Edit2, Trash2, Terminal, Download, LogOut, Settings } from 'lucide-react';
import { exportToCSV } from './utils/exportCSV';
import { AuthProvider, useAuth } from './context/AuthProvider';
import { AuthForm } from './components/AuthForm';
import { SettingsModal } from './components/SettingsModal';
import { useReporting } from './hooks/useReporting';
import { StatsOverview } from './components/StatsOverview';
import { TrendChart } from './components/TrendChart';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const { expenses, addExpense, deleteExpense, updateExpense } = useExpenses();
  const { supportedCurrencies, baseCurrency, setBaseCurrency } = useCurrency();

  const [period, setPeriod] = useState(30);
  const { todaySpend, totalEverSpend, trendData } = useReporting(expenses, period);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'JetBrains Mono'
      }}>
        [INITIALIZING SYSTEM...]
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: 'Inter, sans-serif',
      color: 'var(--text-primary)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-primary)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Terminal size={24} color="var(--text-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              FINANCIER.EXE
            </h1>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Currency selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>BASE:</span>
              <select
                value={baseCurrency}
                onChange={e => setBaseCurrency(e.target.value)}
                className="glass-input"
                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                {supportedCurrencies.map(c => (
                  <option key={c} value={c}>{c} - {CURRENCY_NAMES[c]}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="glass-button"
              style={{ padding: '0.4rem', border: '1px solid var(--border-muted)', marginRight: '0.5rem' }}
              title="Settings"
            >
              <Settings size={14} />
            </button>

            <button
              onClick={signOut}
              className="glass-button"
              style={{ padding: '0.4rem', border: '1px solid var(--border-muted)' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          <span className="terminal-prompt">expense-tracker --mode=realtime --user={user.email}</span>
        </div>
      </header>

      {/* Stats & Charts */}
      <StatsOverview
        todaySpend={todaySpend}
        totalEverSpend={totalEverSpend}
        baseCurrency={baseCurrency}
      />

      <div style={{ marginBottom: '2rem' }}>
        <TrendChart
          data={trendData}
          period={period}
          setPeriod={setPeriod}
          baseCurrency={baseCurrency}
        />
      </div>


      {/* Add button - moved to top for mobile UX */}
      <button
        className="glass-button"
        onClick={() => {
          setEditingExpense(undefined);
          setIsFormOpen(true);
        }}
        style={{
          width: '100%',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '0.85rem'
        }}
      >
        [+] NEW_TRANSACTION
      </button>


      {/* Transaction Log */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '1rem',
          borderBottom: '2px solid var(--border-muted)',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            letterSpacing: '0.05em'
          }}>
            [TRANSACTION_LOG] ({expenses.length} entries)
          </div>
          {expenses.length > 0 && (
            <button
              onClick={() => exportToCSV(expenses, baseCurrency)}
              className="glass-button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={14} />
              [EXPORT_CSV]
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem' }}>// NO TRANSACTIONS FOUND</p>
            <p style={{ fontSize: '0.75rem' }}>// RUN: NEW_TRANSACTION TO BEGIN</p>
          </div>
        ) : (
          <div>
            {expenses.map((expense, idx) => (
              <div
                key={expense.id}
                style={{
                  padding: '1rem',
                  borderBottom: idx < expenses.length - 1 ? '1px solid var(--border-muted)' : 'none',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                  transition: 'background 0.2s'
                }}
                className="expense-row"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      marginBottom: '0.25rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      letterSpacing: '0.02em'
                    }}>
                      {expense.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {format(new Date(expense.date), 'yyyy-MM-dd')}{expense.endDate && expense.endDate !== expense.date && ` -> ${format(new Date(expense.endDate), 'yyyy-MM-dd')}`} | {expense.category} | {expense.paidBy === 'me' ? 'PAID_BY_USER' : 'PAID_BY_OTHER'}
                      {expense.location && (
                        <span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>
                          | {expense.location.city ? `${expense.location.city.toUpperCase()}, ${expense.location.countryCode}` : `GPS: ${expense.location.lat.toFixed(4)}, ${expense.location.lng.toFixed(4)}`}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      TOTAL: {expense.currency} {expense.totalAmount.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'JetBrains Mono'
                      }}>
                        -{expense.myShare.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: expense.paidBy === 'me' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {expense.paidBy === 'me' && expense.totalAmount > expense.myShare
                          ? `+${(expense.totalAmount - expense.myShare).toFixed(2)} RECV`
                          : expense.paidBy === 'other'
                            ? `DEBT`
                            : 'FULL'}
                      </div>
                    </div>

                    {/* Action icons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(expense)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-muted)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '0.4rem',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--text-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-muted)';
                          e.currentTarget.style.background = 'none';
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('DELETE TRANSACTION?')) deleteExpense(expense.id); }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-muted)',
                          color: 'var(--color-danger)',
                          cursor: 'pointer',
                          padding: '0.4rem',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-danger)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-muted)';
                          e.currentTarget.style.background = 'none';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {
        isFormOpen && (
          <ExpenseForm
            initialData={editingExpense}
            onSave={(e) => {
              if (editingExpense) {
                updateExpense(e.id, e);
              } else {
                addExpense(e);
              }
              handleCloseForm();
            }}
            onCancel={handleCloseForm}
            onDelete={editingExpense ? (id) => {
              deleteExpense(id);
              handleCloseForm();
            } : undefined}
          />
        )
      }

      {
        isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        )
      }
    </div >
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
