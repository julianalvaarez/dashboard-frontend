import { useContext } from 'react';
import axios from 'axios';
import { ContextApp } from "@/context/ContextApp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Link } from 'react-router-dom';
import { Menu, Plus, Trash } from "lucide-react"
import { useForm } from '@/hooks/useForm';
import { VideoInputList } from './VideoInputList';



export const NavBar = () => {
  const { getPlayers } = useContext(ContextApp)

  // Estados para el formulario
  const initialForm = { name: '', birth_date: null, position: '', transfermarkt: '', video: [''], notes: '' };
  const { name, birth_date, position, transfermarkt, video, notes, onInputChange, onSelectChange, addVideoInput, removeVideoInput, onVideoChange } = useForm(initialForm);

  // Mostrar mes actual
  const currentDate = new Date();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // Función para agregar jugador
  const addPlayer = async () => {
    const data = { name, birth_date: birth_date.toISOString().split('T')[0], position, transfermarkt, video, notes }
    const res = await axios.post("https://dashboard-backend-kmpv.onrender.com/players", data)
    if (res.status === 200) {
      alert("Jugador agregado exitosamente.")
      getPlayers()
    } else {
      alert("Hubo un error al agregar el jugador. Inténtalo de nuevo.")
    }
  }

  return (
    <header className="w-full border-b bg-gradient-to-r from-slate-50 to-slate-100 shadow-md mb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 lg:gap-4">
          <span className="text-2xl font-extrabold text-primary tracking-tight">
            Balances
          </span>
          <span className="hidden sm:inline text-muted-foreground text-sm lg:text-base mt-1">
            {month} {year}
          </span>
        </div>

        {/* Links de navegación (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/monthlysummary"
            className="text-sm lg:text-base font-medium hover:underline hover:text-primary transition-colors"
          >
            Resumen Mensual
          </Link>
        </nav>

        {/* Botón agregar jugador (desktop) */}
        <div className="hidden md:block">
          <Sheet>
            <SheetTrigger asChild>
              <button className="font-semibold cursor-pointer hover:underline">Agregar jugador</button>
            </SheetTrigger>
            <SheetContent className="overflow-y-scroll">
              <SheetHeader>
                <SheetTitle>Agregar jugador</SheetTitle>
                <SheetDescription>
                  Todos los campos son obligatorios, asegurate de completarlos.
                </SheetDescription>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="player-name">Nombre Completo</Label>
                  <Input id="player-name" onChange={onInputChange} value={name} name="name" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="player-position">Posicion</Label>
                  <Input id="player-position" onChange={onInputChange} value={position} name="position" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="player-transfermarkt">Transfermarkt</Label>
                  <Input id="player-transfermarkt" onChange={onInputChange} value={transfermarkt} name="transfermarkt" />
                </div>
                <VideoInputList
                  video={video}
                  onVideoChange={onVideoChange}
                  addVideoInput={addVideoInput}
                  removeVideoInput={removeVideoInput}
                />

                <div className="grid gap-3">
                  <Label htmlFor="player-notes">Notas Adicionales</Label>
                  <Input id="player-notes" type="textarea" onChange={onInputChange} value={notes} name="notes" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="player-birthday">Fecha de Nacimiento</Label>
                  <Calendar mode="single" selected={birth_date} onSelect={(date) => onSelectChange("birth_date", date)} className="rounded-md border shadow-sm" captionLayout="dropdown" />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" onClick={addPlayer}>
                  Guardar jugador
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col items-center space-y-6">
                <Link
                  to="/monthlysummary"
                  className="block text-base font-medium hover:text-primary"
                >
                  Resumen Mensual
                </Link>

                {/* Agregar jugador en mobile */}
                <div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="block text-base font-medium hover:text-primary">Agregar jugador</button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Agregar jugador</SheetTitle>
                        <SheetDescription>
                          Todos los campos son obligatorios, asegurate de completarlos.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
                        <div className="grid gap-3">
                          <Label htmlFor="player-name-mobile">Nombre Completo</Label>
                          <Input
                            id="player-name-mobile"
                            onChange={onInputChange}
                            value={name}
                            name="name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="player-position-mobile">Posicion</Label>
                          <Input
                            id="player-position-mobile"
                            onChange={onInputChange}
                            value={position}
                            name="position"
                          />
                        </div>
                        <div>
                          <Label htmlFor="player-transfermarkt-mobile">Transfermarkt</Label>
                          <Input
                            id="player-transfermarkt-mobile"
                            onChange={onInputChange}
                            value={transfermarkt}
                            name="transfermarkt"
                          />
                        </div>
                        <VideoInputList
                          video={video}
                          onVideoChange={onVideoChange}
                          addVideoInput={addVideoInput}
                          removeVideoInput={removeVideoInput}
                        />
                        <div>
                          <Label htmlFor="player-notes-mobile">Notas Adicionales</Label>
                          <Input
                            id="player-notes-mobile"
                            type="textarea"
                            onChange={onInputChange}
                            value={notes}
                            name="notes"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="player-birthday-mobile">Fecha de Nacimiento</Label>
                          <Calendar
                            mode="single"
                            selected={birth_date}
                            onSelect={(date) => onSelectChange('birth_date', date)}
                            name="birth_date"
                            className="rounded-md border shadow-sm"
                            captionLayout="dropdown"
                          />
                        </div>
                      </div>
                      <SheetFooter>
                        <Button type="submit" onClick={addPlayer}>
                          Guardar jugador
                        </Button>
                        <SheetClose asChild>
                          <Button variant="outline">Cerrar</Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
