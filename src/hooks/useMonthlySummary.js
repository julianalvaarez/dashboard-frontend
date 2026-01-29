// src/hooks/useMonthlySummary.js
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { EXCLUDED_PLAYER_ID } from "@/utils/constants";


export const useMonthlySummary = (month, year, filter) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [earningsRes, expensesRes] = await Promise.all([
                axios.get('https://dashboard-backend-kmpv.onrender.com/transactions', {
                    params: { month, year, type: "earning" },
                }),
                axios.get('https://dashboard-backend-kmpv.onrender.com/transactions', {
                    params: { month, year, type: "expense" },
                }),
            ]);

            const allTransactions = [
                ...(earningsRes.data || []),
                ...(expensesRes.data || []),
            ];

            setTransactions(allTransactions);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err.message || "Error al cargar las transacciones");
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Filtrar transacciones
    const filteredTransactions = useMemo(() => {
        if (!filter.trim()) return transactions;

        return transactions.filter((t) =>
            t.player?.name?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [transactions, filter]);

    // Calcular gastos por jugador
    const expensesByPlayer = useMemo(() => {
        const map = {};

        transactions.forEach((t) => {
            if (t.type === "expense" && t.player?.id !== EXCLUDED_PLAYER_ID) {
                const playerName = t.player?.name || "Sin asignar";
                map[playerName] = (map[playerName] || 0) + t.amount;
            }
        });

        return Object.entries(map)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total); // Ordenar de mayor a menor
    }, [transactions]);

    // Calcular balance total
    const totalBalance = useMemo(() => {
        return filteredTransactions.reduce(
            (acc, t) => (t.type === "earning" ? acc + t.amount : acc - t.amount),
            0
        );
    }, [filteredTransactions]);

    return {
        transactions,
        filteredTransactions,
        expensesByPlayer,
        totalBalance,
        isLoading,
        error,
        refetch: fetchTransactions,
    };
};