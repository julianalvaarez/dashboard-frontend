export const getMonthlyBalance = (transactions, selectedMonth, selectedYear) => {
    const filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return (
            txDate.getMonth() + 1 === selectedMonth &&
            txDate.getFullYear() === selectedYear
        );
    });

    const earning = filtered
        .filter(t => t.type === 'earning')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = filtered
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
        earning,
        expense,
        total: earning - expense,
    };
};