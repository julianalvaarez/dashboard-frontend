import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Link } from "react-router-dom";



export function PlayerCard({ player }) {
  const isPositive = player.monthlyBalance.total >= 0;
  
  return (
    <div className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-lg font-semibold">{player.name}</h2>
        <p className="text-gray-500 text-sm">{player.team}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPositive ? (
          <FiTrendingUp className="text-green-600" />
        ) : (
          <FiTrendingDown className="text-red-600" />
        )}
        <span
          className={`font-bold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : "-"}${Math.abs(player.monthlyBalance.total).toLocaleString("de-DE")}
        </span>
      </div>

      <Link
        to={`/player/${player.id}`}
        className="mt-4 text-blue-600 hover:underline text-sm"
      >
        Ver detalles →
      </Link>
    </div>
  );
}