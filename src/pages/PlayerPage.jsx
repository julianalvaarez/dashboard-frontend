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
      toast.error("Error al cargar transacciones fijas", {position: "top-center", duration: 3000, style: {background: "#AD1E00", color: "#fff"}})
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
        <Card className="md:col-span-1 shadow-sm border-none bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign size={16} /> Balance Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-center gap-2 ${historicalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {historicalBalance < 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
              }).format(historicalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Todos los ingresos menos todos los gastos desde el inicio.
            </p>
          </CardContent>
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
