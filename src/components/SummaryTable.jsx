// src/components/TransactionsTable.jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "@/utils/formatters";

export const SummaryTable = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jugador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                No hay transacciones para mostrar.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jugador</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="cursor-pointer hover:bg-gray-50 hover:underline">
                <Link to={`/player/${transaction.player?.id}`}>
                  {transaction.player?.name || "Sin asignar"}
                </Link>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === "earning"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.type === "earning" ? "Ingreso" : "Gasto"}
                </span>
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell
                className={`text-right font-bold ${
                  transaction.type === "earning" ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.type === "earning" ? "+" : "-"}
                {formatCurrency(transaction.amount, false)}
              </TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};