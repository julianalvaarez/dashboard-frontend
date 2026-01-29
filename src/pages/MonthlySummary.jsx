// src/pages/MonthlySummary.jsx
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { TransactionsTable } from "@/components/TransactionsTable";
import { ExpensesChart } from "@/components/ExpensesChart";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useDebounce } from "@/hooks/useDebounce";
import { MONTHS, YEARS } from "@/utils/constants";
import { formatCurrency } from "@/utils/formatters";
import { useState } from "react";

export const MonthlySummary = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter, 300);

  const { filteredTransactions, expensesByPlayer, totalBalance, isLoading, error, refetch, } = useMonthlySummary(month, year, debouncedFilter);

  if (error) {
    return (
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <IoIosArrowBack size={24} className="cursor-pointer" />
        </Link>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Botón volver */}
      <Link to="/" className="flex items-center gap-2">
        <IoIosArrowBack size={24} className="cursor-pointer hover:text-zinc-600" />
      </Link>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" /> Resumen Mensual
        </h1>

        <div className="flex gap-2">
          {/* Selector de mes */}
          <Select 
            value={String(month)} 
            onValueChange={(val) => setMonth(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((monthName, index) => (
                <SelectItem key={index + 1} value={String(index + 1)}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selector de año */}
          <Select 
            value={String(year)} 
            onValueChange={(val) => setYear(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Balance general */}
      <Card>
        <CardHeader>
          <CardTitle>Balance general</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-32 bg-zinc-200 animate-pulse rounded" />
          ) : (
            <p
              className={`text-xl font-bold ${
                totalBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalBalance)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filtro */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por jugador..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
          disabled={isLoading}
          aria-label="Filtrar transacciones por jugador"
        />
      </div>

      {/* Tabla de transacciones */}
      {isLoading ? (
        <Loading message="Cargando transacciones..." />
      ) : (
        <TransactionsTable transactions={filteredTransactions} />
      )}

      {/* Gráfico de gastos */}
      {!isLoading && expensesByPlayer.length > 0 && (
        <ExpensesChart data={expensesByPlayer} />
      )}
    </div>
  );
};