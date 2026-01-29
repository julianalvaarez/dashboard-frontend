// src/pages/HomePage.jsx
import { useContext } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { ContextApp } from '../context/ContextApp';
import { NavBar } from '@/components/NavBar';
import { Input } from "@/components/ui/input";
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { usePlayerSearch } from '@/hooks/usePlayerSearch';
import { Loading } from '@/components/Loading';

export const HomePage = () => {
  const { players, isPlayersDataLoading, error, getPlayers } = useContext(ContextApp);
  const { search, setSearch, filteredPlayers } = usePlayerSearch(players);

  // Estado de error
  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <NavBar />
        <ErrorState message={error} onRetry={getPlayers}/>
      </div>
    );
  }

  // Estado de carga
  if (isPlayersDataLoading) {
    return (
      <div className="p-6 min-h-screen">
        <NavBar />
        <Loading message="Cargando jugadores..." />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <NavBar />

      {/* Header */}
      <header className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <Input placeholder="Buscar jugador..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs"aria-label="Buscar jugador"/>
      </header>

      {/* Lista de jugadores */}
      {filteredPlayers.length > 0 ? (
        <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" role="list" >
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <EmptyState 
          message={search ? "No se encontraron jugadores con ese nombre." : "No hay jugadores disponibles."}
        />
      )}
    </div>
  );
};