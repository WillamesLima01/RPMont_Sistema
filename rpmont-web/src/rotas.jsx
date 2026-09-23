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
import VeterinariaRelatorioServicoList from './pages/veterinaria/VeterinariaRelatorioServicoList.jsx';
import UsuariosList from './pages/usuarios/Administrador/UsuariosList.jsx';
import VeterinariaMedicamentoForm from './pages/veterinaria/VeterinariaMedicamentoForm.jsx';
import VeterinariaMedicamentoList from './pages/veterinaria/VeterinariaMedicamentoList.jsx';
import VeterinariaEntradaMedicamentoForm from './pages/veterinaria/VeterinariaEntradaMedicamentoForm.jsx';
import VeterinariaEntradaMedicamentoList from './pages/veterinaria/VeterinariaEntradaMedicamentoList.jsx';
import VeterinariaRelatorioMedicamento from './pages/veterinaria/VeterinariaRelatorioMedicamento.jsx';
import VeterinariaSaidaMedicamentoList from './pages/veterinaria/VeterinariaSaidaMedicamentoList.jsx';
import VeterinariaEquinosAptosComRestricao from './pages/veterinaria/VeterinariaEquinosAptosComRestricao.jsx';
import VeterinariaRelatorioResenha from './pages/veterinaria/VeterinariaRelatorioResenha.jsx';

const rotas = () => {

  return (
    <BrowserRouter>
      <Routes>        
        <Route path="/" element={<Grafico />} />    
        <Route path="/administrador" element={<UsuariosList />} />
        <Route path="/equino-list" element={<VeterinariaEquinoList />} />
        <Route path="/equino-form" element={<VeterinariaForm />} />
        <Route path="/equino-form/:id" element={<VeterinariaForm />} />
        <Route path="/atendimento-list" element={<VeterinariaAtendimentoList />} />
        <Route path="/atendimento-equino/:id" element={<VeterinariaAtendimento />} />
        <Route path="/edit-atendimento/:id" element={<VeterinariaAtendimento />} />
        <Route path="/escala-equinos/:id" element={<VeterinariaEscalaEquinoForm />} />
        <Route path="/escala-equinos-List" element={<VeterinariaEscalaEquinoList />} />
        <Route path="/carga-horaria-equino" element={<GraficoCargaHorariaEquino />} />
        <Route path="/veterinaria-equinos-aptos-com-restricao" element={<VeterinariaEquinosAptosComRestricao />} />
        <Route path="/veterinaria-equinos-baixados" element={<VeterinariaEquinosBaixadosList />} />
        <Route path="/relatorio-servico" element={<VeterinariaRelatorioServicoForm />} />
        <Route path="/consultar-relatorios" element={<VeterinariaRelatorioServicoList/>} />
        <Route path="/relatorio-equinos" element={<VeterinariaRelatorioEquino />} />
        <Route path="/manejo-sanitario-list" element={<VeterinariaEquinoList />} />    
        <Route path="/toalete-form/:id" element={<VeterinariaToaleteForm />} />     
        <Route path="/toalete-List" element={<VeterinariaToaleteList />} />
        <Route path="/ferrageamento-ferrar-list" element={<VeterinariaFerrageamentoFerrarList />} />  
        <Route path="/ferrageamento-reprego-list" element={<VeterinariaFerrageamentoRepregoList />} />  
        <Route path="/ferrageamento-curativo-list" element={<VeterinariaFerrageamentoCurativoList />} />  
        <Route path="/vermifugacao-list" element={<VeterinariaVermifugacaoList />} />  
        <Route path="/vacinacao-list" element={<VeterinariaVacinacaoList />} />  
        <Route path="/ferrageamento-form/:id" element={<VeterinariaFerrageamentoEquinoForm />} />    
        <Route path="/ferrageamento-form/:tipo/:id" element={<VeterinariaFerrageamentoEquinoForm />} /> 
        <Route path="/veterinaria-resenha-equino/:id" element={<VeterinariaResenhaEquinoForm />} />  
        <Route path="/resenha-descritiva-equina" element={<VeterinariaRelatorioResenha />} /> 
        <Route path="/grafico-carga-horaria-equino-anual" element={<GraficoCargaHorariaEquinoAnual />} /> 
        <Route path="/grafico-carga-horaria-equino-anual-unico" element={<GraficoCargaHorariaEquinoAnualUnico />} />                               
        <Route path="/medicamento-form" element={<VeterinariaMedicamentoForm />} />
        <Route path="/medicamento-form/:medicamentoId" element={<VeterinariaMedicamentoForm />} />
        <Route path="/entrada-medicamento-form/:medicamentoId" element={<VeterinariaEntradaMedicamentoForm />} />
        <Route path="/entrada-medicamento-form/editar/:entradaId" element={<VeterinariaEntradaMedicamentoForm />} />
        <Route path="/medicamento-list" element={<VeterinariaMedicamentoList />} />
        <Route path="/entrada-medicamento-list" element={<VeterinariaEntradaMedicamentoList />} />
        <Route path="/saida-medicamento-list" element={<VeterinariaSaidaMedicamentoList />} />        
        <Route path="/medicamento-relatorio" element={<VeterinariaRelatorioMedicamento />} />
        <Route path="/inicio" element={<Grafico />} />          
      </Routes>
    </BrowserRouter>
  );
};

export default rotas;