import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { SlOptions } from "react-icons/sl";
import { useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export const PlayerNav = ({player, transactions, setTransactions}) => {
  const navigate = useNavigate()
  const [editPlayerOpen, setEditPlayerOpen] = useState(false)
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)

  const [type, setType] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)  
  const [currency, setCurrency] = useState('ARS')
  const [inputTransactionDate, setInputTransactionDate] = useState(new Date())

  const [isFixed, setIsFixed] = useState(false)
  const [fixedDay, setFixedDay] = useState(new Date().getDate())

  // Estados para el formulario
  const [inputDate, setInputDate] = useState(new Date())
  const [nameValue, setNameValue] = useState(player.name)

 const addTransaction = async () => {
    const baseData = { player_id: player.id, type, description, amount: parseFloat(amount), currency, }

    if (isFixed) {
      const res = await axios.post("https://dashboard-backend-kmpv.onrender.com/fixed-transactions",  { ...baseData, day_of_month: fixedDay })

      if (res.status === 200 || res.status === 201) {
        alert("Transacción fija agregada correctamente.")
        setAddTransactionOpen(false)
      }

    } else {
      const data = { ...baseData, date: inputTransactionDate.toISOString().split("T")[0], }

      const res = await axios.post( "https://dashboard-backend-kmpv.onrender.com/transactions", data )
      if (res.status === 200 || res.status === 201) {
        alert("Transacción agregada exitosamente.")
        setTransactions([res.data, ...transactions])
        setAddTransactionOpen(false)
      }
    }
  }

  const editPlayer = async () => {
    const data = {
      name: nameValue,
      birth_date: inputDate.toISOString().split('T')[0],
    }
    const res = await axios.put(`https://dashboard-backend-kmpv.onrender.com/players/${player.id}`, data)
    if (res.status === 200 || res.status === 201) {
      alert("Jugador editado exitosamente.")
      navigate("/")
    } else {
      alert("Hubo un error al editar el jugador. Inténtalo de nuevo.")
    }
  }

  const deletePlayer = async () => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar al jugador ${player.name}? Esta acción no se puede deshacer.`)
    if (confirmed) {
      const res = await axios.delete(`https://dashboard-backend-kmpv.onrender.com/players/${player.id}`)
      console.log(res.status);
      if (res.status === 200) {
        alert("Jugador eliminado exitosamente.")
        navigate("/")
      } else {
        alert("Hubo un error al eliminar el jugador. Inténtalo de nuevo.")
      }
    }
  }

  return (
    <>
      <div className="flex justify-between items-center p-6 border-b">
        <h1 className="text-3xl font-light ">{player.name}</h1> 
        <DropdownMenu>
          <DropdownMenuTrigger>
            <SlOptions size={24} className="hover:cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAddTransactionOpen(true)} className="cursor-pointer">Crear transacción</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditPlayerOpen(true)} className="cursor-pointer">Editar jugador</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel onClick={deletePlayer} className="text-red-600 cursor-pointer hover:text-white hover:bg-red-600 active:bg-red-600 active:text-white rounded-md">
              Eliminar jugador  
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>    
      </div>    
        <Sheet open={editPlayerOpen} onOpenChange={setEditPlayerOpen} >
            <SheetContent >
                <SheetHeader>
                    <SheetTitle>Editar jugador</SheetTitle>
                    <SheetDescription>
                        Todos los campos son obligatorios, asegurate de completarlos.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Nombre Completo</Label>
                        <Input id="sheet-demo-name"  onChange={(e) => setNameValue(e.target.value)} value={nameValue}  />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Fecha de Nacimiento</Label>
                        <Calendar mode="single" selected={inputDate} onSelect={setInputDate} className="rounded-md border shadow-sm" captionLayout="dropdown" />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit" onClick={editPlayer}>Guardar jugador</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
        <Sheet open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar transacción</SheetTitle>
              <SheetDescription>Complete todos los campos.</SheetDescription>
            </SheetHeader>

            <div className="grid gap-6 px-4">

              {/* Tipo */}
              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="earning">Ingreso</SelectItem>
                </SelectContent>
              </Select>

              {/* Descripción */}
              <div className="grid gap-3">
                <Label>Descripción</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Monto */}
              <div className="grid gap-3">
                <Label>Monto</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              {/* Moneda */}
              <div className="grid gap-3">
                <Label>Moneda</Label>
                <select className="border rounded-md p-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="ARS">Pesos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* 🔵 SWITCH FIJO */}
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div>
                  <p className="font-medium">¿Transacción fija?</p>
                  <p className="text-sm text-muted-foreground">Se repetirá automáticamente cada mes.</p>
                </div>
                <Switch checked={isFixed} onCheckedChange={setIsFixed} />
              </div>

              {/* 🔵 DÍA DEL MES (solo si es fija) */}
              {isFixed && (
                <div>
                  <Label>Día del mes</Label>
                  <select 
                    className="border p-2 rounded-md"
                    value={fixedDay}
                    onChange={(e) => setFixedDay(Number(e.target.value))}
                  >
                    {Array.from({ length: 28 }).map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fecha (solo si NO es fija) */}
              {!isFixed && (
                <div className="grid gap-3">
                  <Label>Fecha</Label>
                  <Calendar 
                    mode="single"
                    selected={inputTransactionDate}
                    onSelect={setInputTransactionDate}
                    className="rounded-md border shadow-sm"
                  />
                </div>
              )}

            </div>

            {/* FOOTER */}
            <SheetFooter>
              <Button onClick={addTransaction}>Guardar</Button>
              <SheetClose asChild>
                <Button variant="outline">Cerrar</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        </>    
  )
}
