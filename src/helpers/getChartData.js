export const getChartData = (transactions) => {
    if (!transactions || transactions.length === 0) return [];

    // Group transactions by month and year
    const groupedData = transactions.reduce((acc, tx) => {
        const txDate = new Date(tx.date);
        const month = txDate.getMonth(); // 0-11
        const year = txDate.getFullYear();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (!acc[key]) {
            acc[key] = {
                name: new Intl.DateTimeFormat('es-AR', { month: 'short', year: '2-digit' }).format(txDate),
                utility: 0,
                rawDate: new Date(year, month, 1)
            };
        }

        const amount = Number(tx.amount);
        if (tx.type === 'earning') {
            acc[key].utility += amount;
        } else if (tx.type === 'expense') {
            acc[key].utility -= amount;
        }

        return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => a.rawDate - b.rawDate);
};
