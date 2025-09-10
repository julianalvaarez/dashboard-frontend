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

export const TransactionsTable = ({player}) => {
    // Almacenar las transcacciones en un estado local
  const [transactions, setTransactions] = useState(player.transactions)
  const [modalEditTransaction, setModalEditTransaction] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState(0)
  const [editType, setEditType] = useState('')
  const [editIdTransaction, setEditIdTransaction] = useState(false)

  const deleteTransaction = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      try {
        const { data } = await axios.delete(`https://dashboard-backend-kmpv.onrender.com/transactions/${id}`);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        console.log(data.message);
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
  const data = useMemo(() =>
    transactions.map((t) => ({
      id: t.id,
      type: t.type === "expense" ? "Gasto" : "Ingreso",
      description: t.description,
      amount: t.type === "expense" ? -t.amount : t.amount,
      date: new Date(t.date).toLocaleDateString("es-AR"),
    })),
    [transactions]
  )
  
  const sumAmounts = Object.values(transactions).reduce((acc, transaction) => {
    return transaction.type === "expense" ? acc - transaction.amount : acc + transaction.amount;
  }, 0)

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
  onClick={async () => {
    // Pedir fecha nueva
    const newDate = prompt("Ingrese la fecha para la transacción duplicada (YYYY-MM-DD):")
    if (!newDate) return

    // Armar nueva transacción copiando la original
    const duplicated = {
      description: transaction.description,
      amount: Math.abs(transaction.amount), // Asegurarse que el monto sea positivo
      type: transaction.type === "Gasto" ? "expense" : "earning",
      date: newDate,
      player_id: player.id,
    }
    console.log(transaction, duplicated);
    try {
      // Crear en el backend
      const { data } = await axios.post("https://dashboard-backend-kmpv.onrender.com/transactions", duplicated)
      console.log(data.message);
      // Actualizar frontend
      setTransactions((prev) => [...prev, duplicated])
    } catch (err) {
      console.error("Error duplicando transacción:", err)
    }
  }}
>
  Duplicar transacción
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
      {/* 🔹 Filtro por descripción + botón eliminar seleccionados */}
        <FiltersTable table={table} setTransactions={setTransactions} />

      {/* 🔹 Tabla */}
        <ContentTable table={table} columns={columns} sumAmounts={sumAmounts} />

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
