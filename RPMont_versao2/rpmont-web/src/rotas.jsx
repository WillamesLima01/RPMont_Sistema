import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './pages/login/Login.jsx';
import VeterinariaList from './pages/veterinaria/VeterinariaList.jsx';
import VeterinariaForm from './pages/veterinaria/VeterinariaForm.jsx';
import Grafico from './pages/grafico/Grafico.jsx';
import VeterinariaAtendimento from './pages/veterinaria/VeterinariaAtendimentoForm.jsx';
import VeterinariaAtendimentoList from './pages/veterinaria/VeterinariaAtendimentoList.jsx';
import VeterinariaEscalaEquinoForm from './pages/veterinaria/VeterinariaEscalaEquinoForm.jsx';
import VeterinariaEscalaEquinoList from './pages/veterinaria/VeterinariaEscalaEquinoList.jsx';
import GraficoCargaHorariaEquino from './pages/grafico/GraficoCargaHorariaEquino.jsx';
import VeterinariaEquinosBaixadosList from './pages/veterinaria/VeterinariaEquinosBaixadosList.jsx';
import VeterinariaRelatorioServicoForm from './pages/veterinaria/VeterinariaRelatorioServicoForm.jsx';
import VeterinariaRelatorioEquino from './pages/veterinaria/VeterinariaRelatorioEquino.jsx';
import VeterinariaManejoSanitarioList from './pages/veterinaria/VeterinariaManejoSanitarioList.jsx';

const rotas = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/veterinaria-List" element={<VeterinariaList />} />
        <Route path="/veterinaria-Form" element={<VeterinariaForm />} />
        <Route path="/edit-equino/:id" element={<VeterinariaForm />} />
        <Route path="/atendimento-List" element={<VeterinariaAtendimentoList />} />
        <Route path="/atendimento/:id" element={<VeterinariaAtendimento />} />
        <Route path="/edit-atendimento/:id" element={<VeterinariaAtendimento />} />
        <Route path="/escala-equinos/:id" element={<VeterinariaEscalaEquinoForm />} />
        <Route path="/escala-equinos-List" element={<VeterinariaEscalaEquinoList />} />
        <Route path="/carga-horaria-equino" element={<GraficoCargaHorariaEquino />} />
        <Route path="/veterinaria-Equinos-Baixados" element={<VeterinariaEquinosBaixadosList />} />
        <Route path="/relatorio-servico" element={<VeterinariaRelatorioServicoForm />} />
        <Route path="/relatorio-equinos" element={<VeterinariaRelatorioEquino />} />
        <Route path="/manejo-sanitario-list" element={<VeterinariaManejoSanitarioList />} />        
        <Route path="/inicio" element={<Grafico />} />
      </Routes>
    </BrowserRouter>
  );
};

export default rotas;
