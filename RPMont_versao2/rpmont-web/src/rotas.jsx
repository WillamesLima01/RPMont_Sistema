import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './pages/login/Login.jsx';
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
import VeterinariaToaleteForm from './pages/veterinaria/VeterinariaToaleteForm.jsx';
import VeterinariaEquinoList from './pages/veterinaria/VeterinariaEquinoList.jsx';
import VeterinariaFerrageamentoEquinoForm from './pages/veterinaria/VeterinariaFerrageamentoEquinoForm.jsx';
import VeterinariaResenhaEquinoForm from './pages/veterinaria/VeterinariaResenhaEquinoForm.jsx';
import VeterinariaToaleteList from './pages/veterinaria/VeterinariaToaleteList.jsx';
import VeterinariaVermifugacaoList from './pages/veterinaria/VeterinariaVermefugacaoList.jsx';
import VeterinariaVacinacaoList from './pages/veterinaria/VeterinariaVacinacaoList.jsx';
import VeterinariaFerrageamentoFerrarList from './pages/veterinaria/VeterinariaFerrageamentoFerrarList.jsx';
import VeterinariaFerrageamentoRepregoList from './pages/veterinaria/VeterinariaFerrageamentoRepregoList.jsx';
import VeterinariaFerrageamentoCurativoList from './pages/veterinaria/VeterinariaFerrageamentoCurativoList.jsx';
import GraficoCargaHorariaEquinoAnual from './pages/grafico/GraficoCargaHorariaEquinoAnual.jsx';
import GraficoCargaHorariaEquinoAnualUnico from './pages/grafico/GraficoCargaHorariaEquinoAnualUnico.jsx';

const rotas = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />       
        <Route path="/veterinaria-List" element={<VeterinariaEquinoList />} />
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
        <Route path="/manejo-sanitario-list" element={<VeterinariaEquinoList />} />    
        <Route path="/veterinaria-toalete-equino/:id" element={<VeterinariaToaleteForm />} />     
        <Route path="/veterinaria-toalete-List" element={<VeterinariaToaleteList />} />
        <Route path="/ferrageamento-equino" element={<VeterinariaFerrageamentoFerrarList />} />    
        <Route path="/reprego-equino" element={<VeterinariaFerrageamentoRepregoList />} />  
        <Route path="/curativo-equino" element={<VeterinariaFerrageamentoCurativoList />} />            
        <Route path="/vermifugacao-equino" element={<VeterinariaVermifugacaoList />} />  
        <Route path="/vacinacao-equino" element={<VeterinariaVacinacaoList />} />     
        <Route path="/veterinaria-ferrageamento-equino/:id" element={<VeterinariaFerrageamentoEquinoForm />} />             
        <Route path="/veterinaria-ferrageamento-equino/:tipo/:id" element={<VeterinariaFerrageamentoEquinoForm />} />
        <Route path="/veterinaria-resenha-equino/:id" element={<VeterinariaResenhaEquinoForm />} />  
        <Route path="/grafico-carga-horaria-equino-anual" element={<GraficoCargaHorariaEquinoAnual />} /> 
        <Route path="/grafico-carga-horaria-equino-anual-unico" element={<GraficoCargaHorariaEquinoAnualUnico />} />                       
        <Route path="/inicio" element={<Grafico />} />
      </Routes>
    </BrowserRouter>
  );
};

export default rotas;