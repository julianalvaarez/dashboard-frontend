import { lazy, Suspense, useContext } from "react";
import { Route, Routes } from "react-router-dom"
import { ContextApp } from "../context/ContextApp";
import { Toaster } from "sonner";
import { AIAssistant } from "@/components/AiAssistant";
import { Loading } from "@/components/Loading";

const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const MonthlySummary = lazy(() => import("../pages/MonthlySummary.jsx"));
const PlayerPage = lazy(() => import("../pages/PlayerPage.jsx"));

export const RouterApp = () => {
  const { players } = useContext(ContextApp)

  return (
    <>
      <Suspense fallback={<Loading message="Cargando..." />}>
        <Routes>
          <Route path="/*" element={<HomePage />} />
          <Route path="/monthlysummary" element={<MonthlySummary />} />
          {players.map(player => (
            <Route key={player.id} path={`/player/${player.id}/*`} element={<PlayerPage player={player} />} />
          ))}
        </Routes>
      </Suspense>
      <Toaster />
      <AIAssistant />
    </>
  );
}
