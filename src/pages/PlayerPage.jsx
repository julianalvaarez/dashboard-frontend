import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { PlayerNav } from "@/components/PlayerNav";
import { TransactionsTable } from "@/components/TransactionsTable"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exportPlayerExcel } from "@/lib/exportExcel";
import axios from "axios";
import { FixedTransactionsTable } from "@/components/FixedTransactionsTable";

export const PlayerPage = ({ player }) => {
  const [transactions, setTransactions] = useState(player.transactions)
  const [fixedTransactions, setFixedTransactions] = useState([])
  
  const getFixedTransactionsByPlayer = async () => {
    const {data, error} = await axios.get(`https://dashboard-backend-kmpv.onrender.com/fixed-transactions/player/${player.id}`);
    if (error) {
      console.log(error);
      alert("Hubo un error al obtener las transacciones fijas. Inténtalo de nuevo.");
    } else {
      setFixedTransactions(data);
    } 
  }

  useEffect(() => {
    getFixedTransactionsByPlayer();
  }, [])
  

  return (
    <div className="w-full px-10 py-7">
      <Link to={'/'}>
        <IoIosArrowBack size={24} className="cursor-pointer" />
      </Link>
      {/* 🔹 Header con menú */}
      <PlayerNav player={player} setTransactions={setTransactions} transactions={transactions} />

      {/* 🔹 Tabla de transacciones */}
      <TransactionsTable transactions={transactions} setTransactions={setTransactions} />
      <Button
        variant="outline"
        onClick={() => exportPlayerExcel(player.name, transactions)}
      >
        Descargar Excel
      </Button>

      {/* 🔹 Tabla de transacciones fijas */}
      {fixedTransactions.length > 0 && <FixedTransactionsTable fixedTransactions={fixedTransactions} setFixedTransactions={setFixedTransactions} playerId={player.id} setTransactions={setTransactions} />}
    </div>
  )
}
