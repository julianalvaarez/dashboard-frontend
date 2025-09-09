import { useContext, useEffect } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { ContextApp } from '../context/ContextApp';
import { NavBar } from '@/components/NavBar';



export const HomePage = () => {
  const {getPlayers, players} = useContext(ContextApp);

  useEffect(() => {
    getPlayers();
  }, [getPlayers])
  


  return (
    <div className="p-6 min-h-screen">
      {/* Encabezado */}
      <NavBar  />

      {/* Grid de jugadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  )
}
