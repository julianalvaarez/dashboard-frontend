import axios from "axios";
import {useState } from "react";
import { getMonthlyBalance } from "../helpers/getMonthlyBalance";
import { ContextApp } from "./ContextApp";

export const ContextAppProvider = ({ children }) => {
    const [players, setPlayers] = useState([])

    async function getPlayers() {
      const {data} = await axios.get('https://dashboard-backend-kmpv.onrender.com/players');
      
      
      const actualMonth = new Date().getMonth() + 1; 
      const actualYear = new Date().getFullYear();
      
      const playersWithBalance = data.map(player => {
        const monthlyBalance = getMonthlyBalance(player.transactions, actualMonth, actualYear);
        return {
          ...player,
          monthlyBalance,
        };
      });
      
      setPlayers(playersWithBalance);
    }

  return (
    <ContextApp.Provider value={{getPlayers, players, setPlayers}}>
      {children}
    </ContextApp.Provider>
  );
}