import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { PlayerNav } from "@/components/PlayerNav";
import { TransactionsTable } from "@/components/TransactionsTable"

export const PlayerPage = ({ player }) => {

  return (
    <div className="w-full px-10 py-7">
      <Link to={'/'}>
        <IoIosArrowBack size={24} className="cursor-pointer" />
      </Link>
      {/* 🔹 Header con menú */}
      <PlayerNav player={player} />

      {/* 🔹 Tabla de transacciones */}
      <TransactionsTable player={player} />
    </div>
  )
}
