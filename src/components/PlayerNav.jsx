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

export const PlayerNav = ({player, transactions, setTransactions}) => {
  const navigate = useNavigate()
  const [editPlayerOpen, setEditPlayerOpen] = useState(false)
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)

  const [type, setType] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)  
  const [currency, setCurrency] = useState('ARS')
  const [inputTransactionDate, setInputTransactionDate] = useState(new Date())

  // Estados para el formulario
  const [inputDate, setInputDate] = useState(new Date())
  const [nameValue, setNameValue] = useState(player.name)

  // Función para editar jugador
  const addTransaction = async () => {
    const data = {
      player_id: player.id,
      type: type,
      description: description,
      amount: parseFloat(amount),
      date: inputTransactionDate.toISOString().split('T')[0],
      currency: currency
    }
    console.log(data);
    //https://dashboard-backend-kmpv.onrender.com
    const res = await axios.post(`https://dashboard-backend-kmpv.onrender.com/transactions`, data)
    if (res.status === 200) {
      alert("Transaccion agregada exitosamente.")
      setTransactions([data, ...transactions]);

    } else {
      alert("Hubo un error al editar el jugador. Inténtalo de nuevo.")
    }
  }

  const editPlayer = async () => {
    const data = {
      name: nameValue,
      birth_date: inputDate.toISOString().split('T')[0],
    }
    const res = await axios.put(`https://dashboard-backend-kmpv.onrender.com/players/${player.id}`, data)
    if (res.status === 200) {
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
        <Sheet open={addTransactionOpen} onOpenChange={setAddTransactionOpen}  >
            <SheetContent className="overflow-y-auto" >
                <SheetHeader>
                    <SheetTitle>Agregar transacción</SheetTitle>
                    <SheetDescription>
                        Todos los campos son obligatorios, asegurate de completarlos.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <Select onValueChange={setType} value={type}>
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
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Descripcion</Label>
                        <Input id="sheet-demo-name"  onChange={(e) => setDescription(e.target.value) } value={description}  />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Monto</Label>
                        <Input id="sheet-demo-name" type={"number"}  onChange={(e) => setAmount(e.target.value) } value={amount}  />
                    </div>  
                    <div className="grid gap-3">

                      <Label htmlFor="currency">Moneda</Label>
                      <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded-md p-2" >
                        <option value="ARS">Pesos (ARS)</option>
                        <option value="USD">Dólares (USD)</option>
                      </select>
                    </div>     
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Fecha de Pago</Label>
                        <Calendar mode="single" selected={inputTransactionDate} onSelect={setInputTransactionDate} className="rounded-md border shadow-sm" captionLayout="dropdown" />
                    </div>               
                </div>
                <SheetFooter>
                    <Button type="submit" onClick={() => {setAddTransactionOpen(false); addTransaction()}}>Guardar transaccion</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
        </>    
  )
}
