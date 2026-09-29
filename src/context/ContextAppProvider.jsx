import axios from "axios";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getMonthlyBalance } from "../helpers/getMonthlyBalance";
import { ContextApp } from "./ContextApp";


export const ContextAppProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [isPlayersDataLoading, setIsPlayersDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const getPlayers = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsPlayersDataLoading(true);
      setError(null);

      const { data } = await axios.get('https://dashboard-backend-kmpv.onrender.com/players', {
        signal: abortControllerRef.current.signal,
      });
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const playersWithBalance = data.map(player => ({
        ...player,
        monthlyBalance: getMonthlyBalance(player.transactions, currentMonth, currentYear),
      }));
      
      setPlayers(playersWithBalance);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error('Error fetching players:', err);
      setError(err.message || 'Failed to fetch players');
      setPlayers([]);
    } finally {
      setIsPlayersDataLoading(false);
    }
  }, []);

  useEffect(() => {
    getPlayers();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getPlayers]);

  const value = useMemo(() => ({
    players,
    setPlayers,
    getPlayers,
    isPlayersDataLoading,
    error,
  }), [players, getPlayers, isPlayersDataLoading, error]);

  return (
    <ContextApp.Provider value={value}>
      {children}
    </ContextApp.Provider>
  );
};