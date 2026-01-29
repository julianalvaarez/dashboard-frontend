import {useMemo, useState} from "react"
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "./tabla/Pagination"
import { ContentTable } from "./tabla/ContentTable"
import { FiltersTable } from "./tabla/FiltersTable"
import axios from "axios"

export const TransactionsTable = ({transactions, setTransactions}) => {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1) // 1–12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
    // Almacenar las transcacciones en un estado local
  const [modalEditTransaction, setModalEditTransaction] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState(0)
  const [editType, setEditType] = useState('')
  const [editIdTransaction, setEditIdTransaction] = useState(false)


  const filteredTransactions = useMemo(() => {
  return transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getMonth() + 1 === Number(selectedMonth) &&
      d.getFullYear() === Number(selectedYear)
    )
  })
}, [transactions, selectedMonth, selectedYear])


  const deleteTransaction = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      try {
        const { data } = await axios.delete(`https://dashboard-backend-kmpv.onrender.com/transactions/${id}`);

        console.log(data.message);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error eliminando transacción:", error);
      }
    }
  };

  const openModalEditTransaction = (transaction) => {
    setEditType(transaction.type)
    setEditDescription(transaction.description)
    setEditAmount(transaction.amount)
    setEditIdTransaction(transaction.id)
    setModalEditTransaction(true)
  }

  const editTransaction = async () => {
    const res = await axios.put(`https://dashboard-backend-kmpv.onrender.com/transactions/${editIdTransaction}`, {
      type: editType,
      description: editDescription,
      amount: parseFloat(editAmount),
    })
    if (res.status === 200) {
      alert("Transaccion editada exitosamente.")
      setTransactions((prev) => prev.map((t) => t.id === editIdTransaction ? {...t, type: editType, description: editDescription, amount: parseFloat(editAmount)} : t))
      setModalEditTransaction(false)
    } else {
      alert("Hubo un error al editar la transaccion. Inténtalo de nuevo.")
    }
  }

  // Adaptar datos para la tabla
  const data = useMemo(
    () =>
      filteredTransactions.map((t) => ({
        id: t.id,
        type: t.type === "expense" ? "Gasto" : "Ingreso",
        description: t.description,
        amount: t.amount,
        date: new Date(t.date).toLocaleDateString("es-AR"),
        amountUSD:
          t.type === "expense"
            ? (t.amount / t.usd_rate).toFixed(2)
            : (t.amount / t.usd_rate).toFixed(2),
        usd_rate: t.usd_rate,
      })),
    [filteredTransactions]
  )

  const sumAmounts = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      return transaction.type === "expense"
        ? acc - transaction.amount
        : acc + transaction.amount
    }, 0)
  }, [filteredTransactions])


  // Función para comparar fechas y poder ordenar de mas nuevo a más viejo y viceversa
  const compareFechas = (a, b) => {
    const [dA, mA, yA] = a.split('/');
    const [dB, mB, yB] = b.split('/');
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  };

  // Definir columnas
  const columns = useMemo(() => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={ table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate") }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Seleccionar fila" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "type",
        header: "Tipo",
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}> 
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          return compareFechas(rowA.getValue(columnId), rowB.getValue(columnId));
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Descripción
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Monto</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          const formatted = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
          }).format(amount)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: "amountUSD",
        header: () => <div className="text-right">Monto USD</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amountUSD"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
            {
        accessorKey: "usd_rate",
        header: () => <div className="text-right">Valor USD</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("usd_rate"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => openModalEditTransaction(transaction)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              
                <DropdownMenuItem
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-red-600 focus:text-white focus:bg-red-600 cursor-pointer"
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [setTransactions]
  )

  // 🔹 Estados de la tabla
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({ data, columns, enableRowSelection: true,  onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection, },
    initialState: {
      pagination: {
        pageSize: 10, // 👈 10 filas por página
      },
    },
  })


  return (
    <>
    <div className="flex gap-4 my-4">
      {/* Select Mes */}
      <Select value={String(selectedMonth)} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Mes</SelectLabel>
            {[
              "Enero","Febrero","Marzo","Abril","Mayo","Junio",
              "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ].map((m, i) => (
              <SelectItem key={i+1} value={String(i+1)}>
                {m}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Select Año */}
      <Select value={String(selectedYear)} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Año</SelectLabel>
            {[2023,2024,2025,2026,2027].map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

      {/* 🔹 Filtro por descripción + botón eliminar seleccionados */}
        <FiltersTable table={table} setTransactions={setTransactions} />

      {/* 🔹 Tabla */}
        <ContentTable table={table} columns={columns} sumAmounts={sumAmounts} transactions={filteredTransactions} />

        <Sheet open={modalEditTransaction} onOpenChange={setModalEditTransaction}>
            <SheetContent >
                <SheetHeader>
                    <SheetTitle>Editar transaccion</SheetTitle>
                    <SheetDescription>
                        Todos los campos son obligatorios, asegurate de completarlos.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                      <Select onValueChange={setEditType} value={editType}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Tipo de transacción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tipo</SelectLabel>
                            <SelectItem value="expense">Gasto</SelectItem>
                            <SelectItem value="earning">Ganancia</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Descripcion</Label>
                        <Input id="sheet-demo-name"  onChange={(e) => setEditDescription(e.target.value)} value={editDescription}  />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Monto</Label>
                        <Input id="sheet-demo-name"  onChange={(e) => setEditAmount(e.target.value)} value={editAmount}  />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit" onClick={editTransaction}>Guardar transaccion</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>

      {/* 🔹 Paginación + info de filas seleccionadas */}
        <Pagination table={table} />
    </>
  )
}
