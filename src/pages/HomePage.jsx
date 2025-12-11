import { useContext, useEffect, useMemo, useState } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { ContextApp } from '../context/ContextApp';
import { NavBar } from '@/components/NavBar';
import { Input } from "@/components/ui/input"


export const HomePage = () => {
  const {getPlayers, players} = useContext(ContextApp);
  const [search, setSearch] = useState("")

  useEffect(() => {
    getPlayers();
  }, [getPlayers])
  


  // 🔹 Ordenar jugadores por nombre alfabéticamente
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    )
  }, [players])

  // 🔹 Filtrar jugadores según búsqueda
  const filteredPlayers = useMemo(() => {
    return sortedPlayers.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [sortedPlayers, search])

  return (
    <div className="p-6 min-h-screen">
      {/* Encabezado */}
      <NavBar  />

      {/* Header */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <Input placeholder="Buscar jugador..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

     {/* Lista de jugadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPlayers.length ? (
          filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))
        ) : (
          <p className="text-muted-foreground text-center col-span-full">
            No se encontraron jugadores.
          </p>
        )}
      </div>
    </div>
  )
}
