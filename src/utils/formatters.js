// src/utils/formatters.js
export const formatCurrency = (amount, includeSymbol = true) => {
    const formatted = new Intl.NumberFormat("es-AR", {
        style: includeSymbol ? "currency" : "decimal",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return includeSymbol ? formatted : `$${formatted}`;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};
