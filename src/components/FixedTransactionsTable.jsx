import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import axios from "axios"
import { useMemo, useState } from "react"
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "./ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useForm } from "@/hooks/useForm"
import { toast } from "sonner"

export const FixedTransactionsTable = ({fixedTransactions, setFixedTransactions, playerId, setTransactions}) => {
  const [modalEditTransaction, setModalEditTransaction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const initialForm = { type: '', id: '', description: '', currency: '', amount: 0 }
  const { type, description, id, currency, amount, onInputChange, setFormValues, onSelectChange } = useForm(initialForm)

  const openModalEditTransaction = (transaction) => {
    setFormValues({
      type: transaction.type === "Gasto" ? "expense" : "earning",
      id: transaction.id,
      description: transaction.description,
      currency: transaction.currency,
      amount: transaction.amount
    })
    setModalEditTransaction(true)
  }    

  const addFixedTransaction = async (transaction) => {
    const newTransaction = {...transaction, amount: transaction.amount, type: transaction.type === "Gasto" ? "expense" : "earning", player_id: playerId, date: new Date().toISOString().split('T')[0]}
    try {
      const res = await axios.post('https://dashboard-backend-kmpv.onrender.com/transactions', newTransaction)
      if (res.status !== 200) toast.error("Error al agregar la transacción fija", {position: "top-center", duration: 3000, style: {background: "#AD1E00", color: "#fff"}})
      toast.success("Transacción agregada exitosamente", {position: "top-center", duration: 3000, style: {background: "#333", color: "#fff"}})
      setTransactions((prev) => [...prev, {...newTransaction , id: res.data.id}])
    } catch (error) {
      toast.error("Error al agregar la transacción fija", {position: "top-center", duration: 3000, style: {background: "#AD1E00", color: "#fff"}})
      console.log(error);
    }
  }

  const deleteFixedTransaction = async (id) => {
      const {error} = await axios.delete(`https://dashboard-backend-kmpv.onrender.com/fixed-transactions/${id}`)
      if (!error) {
          setFixedTransactions(fixedTransactions.filter(t => t.id !== id))
      }
  }

  const editTransaction = async () => {
    try {
      setIsLoading(true)
      const res = await axios.put(`https://dashboard-backend-kmpv.onrender.com/fixed-transactions/${id}`, { type, description, amount: parseFloat(amount), currency })
      if (res.status === 200) {
        toast.success("Transacción editada exitosamente", {position: "top-center", duration: 3000, style: {background: "#333", color: "#fff"}})
        setFixedTransactions((prev) => prev.map((t) => t.id === id ? {...t, type, description, amount: parseFloat(amount), currency} : t))
      } else {
        toast.error("Error al editar la transacción", {position: "top-center", duration: 3000, style: {background: "#AD1E00", color: "#fff"}})
      }
    } catch (error) {
      toast.error("Error al editar la transacción", {position: "top-center", duration: 3000, style: {background: "#AD1E00", color: "#fff"}})
      console.error("Error editing transaction:", error);
    } finally {
      setIsLoading(false)
      setModalEditTransaction(false)
    }
  }  

  // Adaptar datos para la tabla
  const data = useMemo(
    () =>
      fixedTransactions.map((t) => ({
        id: t.id,
        type: t.type === "expense" ? "Gasto" : "Ingreso",
        description: t.description,
        amount: t.amount,
        currency: t.currency
      })),
    [fixedTransactions]
  )

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
        accessorKey: "currency",
        header: () => <div className="text-right">Moneda</div>,
        cell: ({ row }) => {
          const currency = row.getValue("currency")
          return <div className="text-right font-medium">{currency}</div>
        }
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
                  onClick={() => addFixedTransaction(transaction)}
                  className="cursor-pointer"
                >
                  Agregar a transacciones
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openModalEditTransaction(transaction)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              
                <DropdownMenuItem
                  onClick={() => deleteFixedTransaction(transaction.id)}
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
    [setFixedTransactions]
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
    <h2 className="text-2xl py-3 mt-10" >Transacciones fijas</h2>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`${cell.row.original.type === "Gasto" ? 'text-red-700' : 'text-green-700'}`} >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow> 
              ))  
                                  
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </div>    
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
                      <Select onValueChange={(value) => onSelectChange('type', value)} value={type} name="type">
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
                      <Select onValueChange={(value) => onSelectChange('currency', value)} value={currency} name="currency">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tipo</SelectLabel>
                            <SelectItem value="ARS">ARS</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Descripcion</Label>
                        <Input id="sheet-demo-name"  onChange={onInputChange} value={description} name="description" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Monto</Label>
                        <Input id="sheet-demo-name" type={"number"}  onChange={onInputChange} value={amount} name="amount" />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit" disabled={isLoading} className='cursor-pointer' onClick={() => {editTransaction()}}>{isLoading ? "Guardando..." : "Editar"}</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>     
    </>
  )
}
