import { useState } from 'react';
import type { Expense } from './types';
import { useExpenses } from './hooks/useExpenses';
import { useCurrency } from './hooks/useCurrency';
import { ExpenseForm } from './components/ExpenseForm';
import { AsciiBarChart } from './components/AsciiBarChart';
import { format } from 'date-fns';
import { Edit2, Trash2, Terminal } from 'lucide-react';

function App() {
  const { expenses, addExpense, deleteExpense, updateExpense, summary } = useExpenses();
  const { baseCurrency, setBaseCurrency, supportedCurrencies } = useCurrency();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Terminal Header */}
      <header style={{ marginBottom: 'var(--spacing-lg)', borderBottom: '2px solid var(--border-muted)', paddingBottom: '1rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal size={24} color="var(--text-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              FINANCIER.EXE
            </h1>
          </div>

          {/* Currency selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>BASE:</span>
            <select
              value={baseCurrency}
              onChange={e => setBaseCurrency(e.target.value)}
              className="glass-input"
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {supportedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          <span className="terminal-prompt">expense-tracker --mode=realtime</span>
        </div>
      </header>

      {/* Summary Section */}
      <section style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {/* Main consumption */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
            [TOTAL_CONSUMPTION]
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
            {baseCurrency} {summary.totalSpent.toFixed(2)}
          </div>
        </div>

        {/* Debts grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--color-success)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>[RECEIVABLE]</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-success)' }}>
              +{summary.totalOwedToMe.toFixed(2)}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--color-danger)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>[PAYABLE]</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-danger)' }}>
              -{summary.totalIOwe.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* ASCII Chart */}
      <AsciiBarChart />

      {/* Add button */}
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
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          letterSpacing: '0.05em'
        }}>
          [TRANSACTION_LOG] ({expenses.length} entries)
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
                  transition: 'background 0.15s',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1rem',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ cursor: 'pointer' }} onClick={() => handleEdit(expense)}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--text-white)',
                    marginBottom: '0.25rem'
                  }}>
                    {expense.description}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {format(new Date(expense.date), 'yyyy-MM-dd')} | {expense.category} | {expense.paidBy === 'me' ? 'PAID_BY_USER' : 'PAID_BY_OTHER'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    TOTAL: {expense.currency || baseCurrency} {expense.totalAmount.toFixed(2)}
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
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
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
      )}
    </div>
  );
}

export default App;
