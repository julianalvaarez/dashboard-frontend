import { memo } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Link } from "react-router-dom";



export const PlayerCard = memo(function PlayerCard({ player }) {
  const isPositive = player.monthlyBalance.total >= 0;
  
  return (
    <article className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-lg font-semibold">{player.name}</h2>
        <p className="text-gray-500 text-sm">{player.team}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPositive ? (
          <FiTrendingUp className="text-green-600" aria-hidden="true" />
        ) : (
          <FiTrendingDown className="text-red-600" aria-hidden="true" />
        )}
        <span
          className={`font-bold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
          aria-label={isPositive ? "Balance positivo" : "Balance negativo"}
        >
          {isPositive ? "+" : "-"}${Math.abs(player.monthlyBalance.total).toLocaleString("de-DE")}
        </span>
      </div>

      <Link
        to={`/player/${player.id}`}
        className="mt-4 text-blue-600 hover:underline text-sm"
        aria-label={`Ver detalles de ${player.name}`}
      >
        Ver detalles →
      </Link>
    </article>
  );
});