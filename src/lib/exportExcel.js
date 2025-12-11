import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function groupByMonthDesc(transactions) {
    const grouped = {};

    transactions.forEach((t) => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });

    return Object.fromEntries(
        Object.entries(grouped).sort(([a], [b]) => (a < b ? 1 : -1))
    );
}

function createSheet(groupedData, typeFilter) {
    const rows = [];
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    rows.push(["Fecha", "Descripción", "Monto ARS", "Monto USD", "USD Rate"]);

    Object.entries(groupedData).forEach(([key, items]) => {
        const filtered = items.filter((t) =>
            typeFilter === "expense" ? t.type === "expense" : t.type === "earning"
        );

        if (!filtered.length) return;

        const [year, month] = key.split("-");
        rows.push([]);
        rows.push([`${monthNames[Number(month) - 1]} ${year}`]);
        rows.push([]);

        filtered.forEach((t) => {
            rows.push([
                new Date(t.date).toLocaleDateString("es-AR"),
                t.description,
                t.amount,
                t.amount / t.usd_rate,
                t.usd_rate,
            ]);
        });

        const subtotalARS = filtered.reduce(
            (acc, t) => acc + (t.type === "expense" ? -t.amount : t.amount),
            0
        );
        const subtotalUSD = filtered.reduce(
            (acc, t) =>
                acc + (t.type === "expense"
                    ? -(t.amount / t.usd_rate)
                    : t.amount / t.usd_rate),
            0
        );

        rows.push([]);
        rows.push(["Subtotal", "", subtotalARS, subtotalUSD, ""]);
        rows.push([]);
    });

    const sheet = XLSX.utils.aoa_to_sheet(rows);

    // Formato numérico EN TODAS LAS CELDAS DE MONTOS
    const range = XLSX.utils.decode_range(sheet["!ref"]);

    for (let r = 1; r <= range.e.r; r++) {
        // Monto ARS
        const cellARS = sheet[XLSX.utils.encode_cell({ r, c: 2 })];
        if (cellARS && typeof cellARS.v === "number") {
            cellARS.z = '#,##0.00';
        }

        // Monto USD
        const cellUSD = sheet[XLSX.utils.encode_cell({ r, c: 3 })];
        if (cellUSD && typeof cellUSD.v === "number") {
            cellUSD.z = '#,##0.00';
        }
    }

    sheet["!cols"] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
    ];

    return sheet;
}

function createSummarySheet(transactions) {
    const totalGastosARS = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc - t.amount, 0);

    const totalIngresosARS = transactions
        .filter((t) => t.type === "earning")
        .reduce((acc, t) => acc + t.amount, 0);

    const totalGastosUSD = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc - (t.amount / t.usd_rate), 0);

    const totalIngresosUSD = transactions
        .filter((t) => t.type === "earning")
        .reduce((acc, t) => acc + (t.amount / t.usd_rate), 0);

    const balanceARS = totalIngresosARS + totalGastosARS;
    const balanceUSD = totalIngresosUSD + totalGastosUSD;

    const rows = [
        ["Resumen General"],
        [],
        ["", "ARS", "USD"],
        ["Total Ingresos", totalIngresosARS, totalIngresosUSD],
        ["Total Gastos", totalGastosARS, totalGastosUSD],
        ["Balance Final", balanceARS, balanceUSD],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(rows);

    sheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
    ];

    // Formato monetario
    const range = XLSX.utils.decode_range(sheet["!ref"]);
    for (let r = 3; r <= range.e.r; r++) {
        const cellARS = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
        const cellUSD = sheet[XLSX.utils.encode_cell({ r, c: 2 })];

        if (cellARS && typeof cellARS.v === "number") cellARS.z = '#,##0.00';
        if (cellUSD && typeof cellUSD.v === "number") cellUSD.z = '#,##0.00';
    }

    return sheet;
}

export function exportPlayerExcel(playerName, transactions) {
    const grouped = groupByMonthDesc(transactions);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, createSheet(grouped, "expense"), "Gastos");
    XLSX.utils.book_append_sheet(wb, createSheet(grouped, "earning"), "Ingresos");
    XLSX.utils.book_append_sheet(wb, createSummarySheet(transactions), "Resumen");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `${playerName.replace(/ /g, "_")}_movimientos.xlsx`);
}
