import type { Expense } from '../types';

export function exportToCSV(expenses: Expense[], baseCurrency: string) {
    // CSV Headers
    const headers = [
        'Date',
        'Description',
        'Category',
        'Total Amount',
        'Currency',
        'Paid By',
        'My Share',
        `My Share (${baseCurrency})`
    ];

    // Convert expenses to CSV rows
    const rows = expenses.map(exp => [
        exp.date,
        `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
        exp.category,
        exp.totalAmount.toFixed(2),
        exp.currency || baseCurrency,
        exp.paidBy === 'me' ? 'Me' : 'Other',
        exp.myShare.toFixed(2),
        '' // Will be filled with converted amount if needed
    ]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `financier_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
