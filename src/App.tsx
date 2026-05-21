import { useHashRoute } from "@/lib/useHashRoute";
import { Dash } from "./pages/Dash";
import { PlanoAcaoPage } from "./pages/PlanoAcao";

export function App() {
  const [route] = useHashRoute("");
  const isPlano = route.startsWith("plano");

  return (
    <div className="bi-dashboard-theme min-h-screen">
      {isPlano ? <PlanoAcaoPage /> : <Dash />}
    </div>
  );
}
