import axios from "axios"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { IoIosArrowBack } from "react-icons/io";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, } from "@/components/ui/chart"


export const MonthlySummary = () => {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1) // enero=1
  const [year, setYear] = useState(today.getFullYear())
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("")

  const expensesByPlayer = useMemo(() => {
  const map = {}
  transactions.forEach((t) => {
    if (t.type === "expense") {
      const playerName = t.player?.name || "Sin asignar"
      map[playerName] = (map[playerName] || 0) + t.amount
    }
  })
  return Object.entries(map).map(([name, total]) => ({
    name,
    total,
  }))
}, [transactions])


  // 🔹 Cargar transacciones por mes y año
    useEffect(() => {
    const fetchTransactions = async () => {
        try {
        const [earningsRes, expensesRes] = await Promise.all([
            axios.get("https://dashboard-backend-kmpv.onrender.com/transactions", {
            params: { month, year, type: "earning" },
            }),
            axios.get("https://dashboard-backend-kmpv.onrender.com/transactions", {
            params: { month, year, type: "expense" },
            }),
        ])

        // Combinar resultados
        setTransactions([
            ...(earningsRes.data || []),
            ...(expensesRes.data || []),
        ])
        } catch (err) {
        console.error("Error cargando transacciones:", err)
        }
    }

    fetchTransactions()
    }, [month, year])

  // 🔹 Filtrar por descripción
  const filteredTxs = transactions.filter((t) =>
    t.player.name.toLowerCase().includes(filter.toLowerCase())
  )

  // 🔹 Balance general
  const total = filteredTxs.reduce(
    (acc, t) => (t.type === "earning" ? acc + t.amount : acc - t.amount),
    0
  )

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(total)

  return (
    <div className="p-6 space-y-6">
      <Link to={'/'} className="flex items-center gap-2 ">
        <IoIosArrowBack size={24} className="cursor-pointer" />
      </Link>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" /> Resumen Mensual
        </h1>

        <div className="flex gap-2">
          {/* Selector de mes */}
          <Select value={String(month)} onValueChange={(val) => setMonth(Number(val))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",].map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selector de año */}
          <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Balance general */}
      <Card>
        <CardHeader>
          <CardTitle>Balance general</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-xl font-bold ${
              total >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formattedTotal}
          </p>
        </CardContent>
      </Card>

      {/* Filtro */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por jugador..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabla de transacciones */}
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
            {filteredTxs.length ? (
                filteredTxs.map((t) => (
                <TableRow key={t.id} >
                    <TableCell className="cursor-pointer hover:bg-gray-50 hover:underline"><Link to={`/player/${t.player?.id}`}>{t.player?.name || "Sin asignar"}</Link></TableCell>
                    <TableCell>
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                        t.type === "earning"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                        {t.type === "earning" ? "Ingreso" : "Gasto"}
                    </span>
                    </TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell
                    className={`text-right font-bold ${
                        t.type === "earning" ? "text-green-600" : "text-red-600"
                    }`}
                    >
                    {t.type === "earning" ? "+" : "-"}$
                    {new Intl.NumberFormat("es-AR").format(t.amount)}
                    </TableCell>
                    <TableCell>
                    {new Date(t.date).toLocaleDateString("es-AR")}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No hay resultados.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </div>
      <Card className="mt-6">
  <CardHeader>
    <CardTitle>Gastos por jugador</CardTitle>
  </CardHeader>
  <CardContent>
    <ChartContainer
      config={{
        total: {
          label: "Total Gastado",
          color: "#660000", // usa color rojo del theme
        },
      }}
      className="h-[400px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={expensesByPlayer}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  </CardContent>
</Card>

    </div>
  )
}
