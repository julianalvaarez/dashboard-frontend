import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export const FixedTransactions = ({ player }) => {
  const [fixed, setFixed] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [current, setCurrent] = useState(null)

  const loadFixed = async () => {
    const res = await axios.get(
      `https://dashboard-backend-kmpv.onrender.com/fixed-transactions/player/${player.id}`
    )
    setFixed(res.data)
  }

  useEffect(() => { loadFixed() }, [])

  const deleteFixed = async (id) => {
    if (!window.confirm("¿Eliminar movimiento fijo?")) return

    await axios.delete(
      `https://dashboard-backend-kmpv.onrender.com/fixed-transactions/${id}`
    )

    loadFixed()
  }

  const saveEdit = async () => {
    await axios.put(
      `https://dashboard-backend-kmpv.onrender.com/fixed-transactions/${current.id}`,
      current
    )

    setEditOpen(false)
    loadFixed()
  }

  return (
    <>
      {
        fixed.length > 0 && (
            <div className="p-4 border rounded-xl bg-white mt-6">

            <h2 className="text-xl font-semibold mb-4">Gastos fijos</h2>

            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Día</TableHead>
                    <TableHead></TableHead>
                </TableRow>
                </TableHeader>

                <TableBody>
                {fixed.map((f) => (
                    <TableRow key={f.id}>
                    <TableCell>{f.description}</TableCell>
                    <TableCell>${f.amount.toLocaleString("es-AR")}</TableCell>
                    <TableCell>{f.currency}</TableCell>
                    <TableCell>{f.day_of_month}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost">⋮</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setCurrent(f); setEditOpen(true) }}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteFixed(f.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>

            {/* EDIT MODAL */}
            {current && (
                <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Editar movimiento fijo</SheetTitle>
                    </SheetHeader>

                    <div className="grid gap-4 m-4">

                    <Input 
                        value={current.description}
                        onChange={(e) => setCurrent({ ...current, description: e.target.value })}
                    />

                    <Input 
                        type="number"
                        value={current.amount}
                        onChange={(e) => setCurrent({ ...current, amount: Number(e.target.value) })}
                    />

                    <Select 
                        value={current.currency}
                        onValueChange={(v) => setCurrent({ ...current, currency: v })}
                    >
                        <SelectTrigger>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                    </Select>

                    </div>

                    <SheetFooter className="mt-4">
                    <Button onClick={saveEdit}>Guardar</Button>
                    <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
                    </SheetFooter>

                </SheetContent>
                </Sheet>
            )}

            </div>
        )
      }  
    </>
  )
}
