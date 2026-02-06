import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { PlayerNav } from "@/components/PlayerNav";
import { TransactionsTable } from "@/components/TransactionsTable"
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { exportPlayerExcel } from "@/lib/exportExcel";
import axios from "axios";
import { FixedTransactionsTable } from "@/components/FixedTransactionsTable";
import { PlayerUtilityChart } from "@/components/PlayerUtilityChart";
import { getChartData } from "@/helpers/getChartData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const PlayerPage = ({ player }) => {
  const [transactions, setTransactions] = useState(player.transactions)
  const [fixedTransactions, setFixedTransactions] = useState([])

  const getFixedTransactionsByPlayer = async () => {
    const { data, error } = await axios.get(`https://dashboard-backend-kmpv.onrender.com/fixed-transactions/player/${player.id}`);
    if (error) {
      console.log(error);
      toast.error("Error al cargar transacciones fijas", { position: "top-center", duration: 3000, style: { background: "#AD1E00", color: "#fff" } })
    } else {
      setFixedTransactions(data);
    }
  }

  useEffect(() => {
    getFixedTransactionsByPlayer();
  }, [])

  const historicalBalance = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc, tx) => {
      const amount = Number(tx.amount);
      return tx.type === 'earning' ? acc + amount : acc - amount;
    }, 0);
  }, [transactions]);

  const historicalBalanceUSD = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc, tx) => {
      const amount = Number(tx.amount / tx.usd_rate);
      return tx.type === 'earning' ? acc + amount : acc - amount;
    }, 0);
  }, [transactions]);

  const chartData = useMemo(() => getChartData(transactions), [transactions]);


  return (
    <div className="w-full px-10 py-7">
      <Link to={'/'}>
        <IoIosArrowBack size={24} className="cursor-pointer" />
      </Link>
      {/* 🔹 Header con menú */}
      <PlayerNav player={player} setTransactions={setTransactions} transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {/* 🔹 Balance Histórico */}
        <Card className="md:col-span-1 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Balance Consolidado</h3>
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight ${historicalBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {historicalBalance >= 0 ? 'BENEFICIO' : 'DÉFICIT'}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Bloque Pesos - El Principal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${historicalBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pesos Argentinos</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black tracking-tighter ${historicalBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(historicalBalance)}
                </span>
                <div className="transition-transform group-hover:scale-110 duration-500">
                  {historicalBalance >= 0 ? (
                    <TrendingUp size={20} className="text-emerald-400/70" />
                  ) : (
                    <TrendingDown size={20} className="text-rose-400/70" />
                  )}
                </div>
              </div>
            </div>

            {/* Divisor Visual */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

            {/* Bloque Dólares - La Referencia Internacional */}
            <div className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Equivalente USD</span>
                </div>
                <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100/50">
                  <DollarSign size={14} className="text-blue-500" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-slate-700 tracking-tight">
                  <span className="text-blue-500/60 font-black mr-1 text-lg italic">U$S</span>
                  {Math.abs(historicalBalanceUSD).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>

              </div>
            </div>
          </div>

          {/* Footer Informativo */}
          <div className="mt-auto px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400 tracking-tight">
            <span>Registro acumulado</span>
            <span className="text-slate-600 font-bold bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
              {transactions.length} Operaciones
            </span>
          </div>
        </Card>

        {/* 🔹 Gráfico de Utilidad */}
        <div className="md:col-span-2">
          <PlayerUtilityChart data={chartData} />
        </div>
      </div>

      {/* 🔹 Tabla de transacciones */}
      <TransactionsTable transactions={transactions} setTransactions={setTransactions} />
      <div className="mt-4 flex flex-col gap-6">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => exportPlayerExcel(player.name, transactions)}
        >
          Descargar Excel
        </Button>

        {/* 🔹 Tabla de transacciones fijas */}
        {fixedTransactions.length > 0 && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Gastos Fijos Programados</h3>
            <FixedTransactionsTable
              fixedTransactions={fixedTransactions}
              setFixedTransactions={setFixedTransactions}
              playerId={player.id}
              setTransactions={setTransactions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
