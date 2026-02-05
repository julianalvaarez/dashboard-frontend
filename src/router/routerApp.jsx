import { useContext } from "react";
import { Route, Routes } from "react-router-dom"
import { ContextApp } from "../context/ContextApp";
import { PlayerPage, MonthlySummary, HomePage } from "../pages";
import { Toaster } from "sonner";

export const RouterApp = () => {
  const {players} = useContext(ContextApp)
  
  return (
    <>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/monthlysummary" element={<MonthlySummary />} />
        {players.map(player => (
          <Route key={player.id} path={`/player/${player.id}/*`} element={<PlayerPage player={player} />} />
        ))}
      </Routes>
      <Toaster />
    </>
  );
}
