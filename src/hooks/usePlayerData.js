// src/hooks/usePlayerData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboard-backend-kmpv.onrender.com';

export const usePlayerData = (player) => {
    const [transactions, setTransactions] = useState(player?.transactions || []);
    const [fixedTransactions, setFixedTransactions] = useState([]);
    const [isLoadingFixed, setIsLoadingFixed] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtiene las transacciones fijas del jugador
     */
    const fetchFixedTransactions = useCallback(async () => {
        if (!player?.id) {
            console.warn("No player ID provided");
            return;
        }

        try {
            setIsLoadingFixed(true);
            setError(null);

            const { data } = await axios.get(
                `${API_BASE_URL}/fixed-transactions/player/${player.id}`
            );

            setFixedTransactions(data || []);
        } catch (err) {
            console.error("Error fetching fixed transactions:", err);
            setError(
                err.response?.data?.message ||
                "Error al cargar las transacciones fijas. Por favor, intenta de nuevo."
            );
            setFixedTransactions([]);
        } finally {
            setIsLoadingFixed(false);
        }
    }, [player?.id]);

    /**
     * Carga inicial de transacciones fijas
     */
    useEffect(() => {
        fetchFixedTransactions();
    }, [fetchFixedTransactions]);

    /**
     * Sincroniza transacciones con el prop player
     */
    useEffect(() => {
        if (player?.transactions) {
            setTransactions(player.transactions);
        }
    }, [player?.transactions]);

    /**
     * Actualiza las transacciones normales
     */
    const updateTransactions = useCallback((newTransactions) => {
        setTransactions(newTransactions);
    }, []);

    /**
     * Actualiza las transacciones fijas
     */
    const updateFixedTransactions = useCallback((newFixedTransactions) => {
        setFixedTransactions(newFixedTransactions);
    }, []);

    return {
        transactions,
        fixedTransactions,
        isLoadingFixed,
        error,
        refetchFixed: fetchFixedTransactions,
        updateTransactions,
        updateFixedTransactions,
    };
};