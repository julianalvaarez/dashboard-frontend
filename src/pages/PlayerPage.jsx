import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { PlayerNav } from "@/components/PlayerNav";
import { TransactionsTable } from "@/components/TransactionsTable"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportPlayerExcel } from "@/lib/exportExcel";
import { FixedTransactions } from "@/components/FixedTransactions";

export const PlayerPage = ({ player }) => {
  const [transactions, setTransactions] = useState(player.transactions)

  return (
    <div className="w-full px-10 py-7">
      <Link to={'/'}>
        <IoIosArrowBack size={24} className="cursor-pointer" />
      </Link>
      {/* 🔹 Header con menú */}
      <PlayerNav player={player} setTransactions={setTransactions} transactions={transactions} />

      {/* 🔹 Tabla de transacciones */}
      <TransactionsTable player={player} transactions={transactions} setTransactions={setTransactions} />
      <Button
        variant="outline"
        onClick={() => exportPlayerExcel(player.name, transactions)}
      >
        Descargar Excel
      </Button>
      <FixedTransactions player={player} />
    </div>
  )
}
