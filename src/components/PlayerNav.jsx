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
import { useForm } from "@/hooks/useForm";
import { VideoInputList } from "./VideoInputList";

export const PlayerNav = ({ player, transactions, setTransactions }) => {
  const navigate = useNavigate()
  const [editPlayerOpen, setEditPlayerOpen] = useState(false)
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)
  const [expenseFixedOpen, setExpenseFixedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const transactionInitialForm = { player_id: player.id, type: '', description: '', amount: 0, date: new Date(), currency: 'ARS' };
  const { type, description, amount, currency, date, onInputChange: onTransactionInputChange, onSelectChange: onTransactionSelectChange } = useForm(transactionInitialForm);
  // Estados para el formulario
  const playerInitialForm = { name: '', birth_date: null, position: '', transfermarkt: '', video: [''], notes: '' };
  const { name, birth_date, position, transfermarkt, video, notes, onInputChange: onPlayerInputChange, setFormValues, onSelectChange: onPlayerSelectChange, addVideoInput, removeVideoInput, onVideoChange } = useForm(playerInitialForm);

  const addTransaction = async () => {
    try {
      setIsLoading(true)
      const data = {
        player_id: player.id,
        type,
        description,
        amount: parseFloat(amount),
        date: date.toISOString().split('T')[0],
        currency
      }
      const res = await axios.post(`https://dashboard-backend-kmpv.onrender.com/transactions`, data)
      if (res.status === 200) {
        alert("Transaccion agregada exitosamente.")
        console.log(data);
        setTransactions([data, ...transactions]);
      } else {
        alert("Hubo un error. Inténtalo de nuevo.")
      }
    } catch (error) {
      alert("Error al agregar transacción. Inténtalo de nuevo.")
      console.error("Error adding transaction:", error);
    } finally {
      setIsLoading(false)
      setAddTransactionOpen(false);
    }
  }

  const addFixedTransaction = async () => {
    try {
      setIsLoading(true)
      const data = {
        player_id: player.id,
        type,
        description,
        amount: parseFloat(amount),
        currency
      }
      //https://dashboard-backend-kmpv.onrender.com
      const res = await axios.post(`https://dashboard-backend-kmpv.onrender.com/fixed-transactions`, data)
      if (res.status === 200) {
        alert("Transaccion fija agregada exitosamente.")

      } else {
        alert("Hubo un error. Inténtalo de nuevo.")
      }
    } catch (error) {
      alert("Error al agregar transacción fija. Inténtalo de nuevo.")
      console.error("Error adding fixed transaction:", error);
    } finally {
      setIsLoading(false)
      setExpenseFixedOpen(false);
    }
  }

  const editPlayer = async () => {
    try {
      setIsLoading(true)
      const data = { name, birth_date: birth_date.toISOString().split('T')[0], position, transfermarkt, video, notes }
      const res = await axios.put(`https://dashboard-backend-kmpv.onrender.com/players/${player.id}`, data)
      if (res.status === 200) {
        alert("Jugador editado exitosamente.")
        navigate("/")
      } else {
        alert("Hubo un error al editar el jugador. Inténtalo de nuevo.")
      }
    } catch (error) {
      alert("Error al editar jugador. Inténtalo de nuevo.")
      console.error("Error editing player:", error);
    } finally {
      setIsLoading(false)
      setEditPlayerOpen(false);
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

  const openEditPlayerForm = () => {
    setFormValues({
      name: player.name,
      birth_date: new Date(player.birth_date),
      position: player.position,
      transfermarkt: player.transfermarkt,
      video: player.video,
      notes: player.notes
    })
    setEditPlayerOpen(true);
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
            <DropdownMenuItem onClick={() => setExpenseFixedOpen(true)} className="cursor-pointer">Crear gasto fijo</DropdownMenuItem>
            <DropdownMenuItem onClick={openEditPlayerForm} className="cursor-pointer">Editar jugador</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel onClick={deletePlayer} className="text-red-600 cursor-pointer hover:text-white hover:bg-red-600 active:bg-red-600 active:text-white rounded-md">
              Eliminar jugador
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Sheet open={editPlayerOpen} onOpenChange={setEditPlayerOpen} >
        <SheetContent className="overflow-y-auto" >
          <SheetHeader>
            <SheetTitle>Editar jugador</SheetTitle>
            <SheetDescription>
              Todos los campos son obligatorios, asegurate de completarlos.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-name">Nombre Completo</Label>
              <Input id="sheet-demo-name" onChange={onPlayerInputChange} value={name} name="name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-position">Posicion</Label>
              <Input id="sheet-demo-position" onChange={onPlayerInputChange} value={position} name="position" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-transfermarkt">Transfermarkt</Label>
              <Input id="sheet-demo-transfermarkt" onChange={onPlayerInputChange} value={transfermarkt} name="transfermarkt" />
            </div>
            <VideoInputList
              video={video}
              onVideoChange={onVideoChange}
              addVideoInput={addVideoInput}
              removeVideoInput={removeVideoInput}
            />
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-birthdate">Fecha de Nacimiento</Label>
              <Calendar mode="single" defaultMonth={new Date(player.birth_date)} selected={birth_date} onSelect={(date) => onPlayerSelectChange("birth_date", date)} name="birth_date" className="rounded-md border shadow-sm" captionLayout="dropdown" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-notes">Notas Adicionales</Label>
              <Input id="sheet-demo-notes" onChange={onPlayerInputChange} value={notes} name="notes" />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isLoading} onClick={editPlayer}>{isLoading ? "Guardando..." : "Guardar jugador"}</Button>
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
            <Select onValueChange={(value) => onTransactionSelectChange('type', value)} name="type" value={type}>
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
              <Input id="sheet-demo-name" onChange={onTransactionInputChange} name="description" value={description} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-name">Monto</Label>
              <Input id="sheet-demo-name" type={"number"} onChange={onTransactionInputChange} name="amount" value={amount} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="currency">Moneda</Label>
              <Select onValueChange={(value) => onTransactionSelectChange('currency', value)} name="currency" value={currency}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Moneda</SelectLabel>
                    <SelectItem value="ARS">Pesos (ARS)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-username">Fecha de Pago</Label>
              <Calendar mode="single" selected={date} onSelect={(date) => onTransactionSelectChange("date", date)} name="date" className="rounded-md border shadow-sm" captionLayout="dropdown" />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isLoading} onClick={() => { addTransaction() }}>{isLoading ? "Guardando..." : "Guardar transacción"}</Button>
            <SheetClose asChild>
              <Button variant="outline">Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet open={expenseFixedOpen} onOpenChange={setExpenseFixedOpen}  >
        <SheetContent className="overflow-y-auto" >
          <SheetHeader>
            <SheetTitle>Agregar transacción fija</SheetTitle>
            <SheetDescription>
              Todos los campos son obligatorios, asegurate de completarlos.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <Select onValueChange={(value) => onTransactionSelectChange('type', value)} name="type" value={type}>
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
              <Input id="sheet-demo-name" onChange={onTransactionInputChange} name="description" value={description} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-name">Monto</Label>
              <Input id="sheet-demo-name" type={"number"} onChange={onTransactionInputChange} name="amount" value={amount} />
            </div>
            <div className="grid gap-3">

              <Label htmlFor="currency">Moneda</Label>
              <Select onValueChange={(value) => onTransactionSelectChange('currency', value)} name="currency" value={currency}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Moneda</SelectLabel>
                    <SelectItem value="ARS">Pesos (ARS)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isLoading} className='cursor-pointer' onClick={() => { addFixedTransaction() }}>{isLoading ? "Guardando..." : "Guardar transacción fija"}</Button>
            <SheetClose asChild>
              <Button variant="outline">Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
