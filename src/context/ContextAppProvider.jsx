import axios from "axios";
import { useState, useEffect } from "react";
import { getMonthlyBalance } from "../helpers/getMonthlyBalance";
import { ContextApp } from "./ContextApp";


export const ContextAppProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [isPlayersDataLoading, setIsPlayersDataLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPlayers = async () => {
    try {
      setIsPlayersDataLoading(true);
      setError(null);

      const { data } = await axios.get('https://dashboard-backend-kmpv.onrender.com/players');
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const playersWithBalance = data.map(player => ({
        ...player,
        monthlyBalance: getMonthlyBalance(player.transactions, currentMonth, currentYear),
      }));
      
      setPlayers(playersWithBalance);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err.message || 'Failed to fetch players');
      setPlayers([]);
    } finally {
      setIsPlayersDataLoading(false);
    }
  };

  useEffect(() => {
    getPlayers();
  }, []);


  return (
    <ContextApp.Provider value={{ players, setPlayers, getPlayers, isPlayersDataLoading, error, }}>
      {children}
    </ContextApp.Provider>
  );
};