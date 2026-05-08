import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InicioSesion from "./Pages/InicioSesion.jsx";
import InicioInvitado from "./Pages/InicioInvitado.jsx";
import Inicio from "./Pages/Inicio.jsx";
import DetalleServicio from "./Pages/DetalleServicio.jsx";
import PaginaPrivacidad from "./Pages/Privacidad.jsx";
import PaginaTerminos from "./Pages/Terminos.jsx";
import Perfil from "./Pages/Perfil.jsx";
import PanelAdmin from "./Pages/PanelAdmin.jsx";

export default function App() {
  return (     
    <BrowserRouter>     
      <Routes>     
        <Route path="/"                     element={<Navigate to="/home-guest" />} />
        <Route path="/login"                element={<InicioSesion />} />
        <Route path="/home-guest"           element={<InicioInvitado />} />
        <Route path="/home"                 element={<Inicio />} />
        <Route path="/servicio"             element={<DetalleServicio />} />
        <Route path="/privacidad"           element={<PaginaPrivacidad />} />
        <Route path="/terminos"             element={<PaginaTerminos />} />
        <Route path="/perfil"               element={<Perfil />} />
        <Route path="/perfil/:id"           element={<Perfil />} />
        <Route path="/admin-dashboard"      element={<PanelAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
