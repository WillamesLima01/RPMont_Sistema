// src/components/veterinaria/CabecalhoEquinoLista.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CabecalhoEquinoLista = ({
  titulo = 'Lista de Equinos',
  equinos = [],
  filtroNome,
  setFiltroNome,
  onFiltrar,
  mostrarAdicionar = false,
  mostrarDatas = false,
  filtroInicio,
  setFiltroInicio,
  filtroFim,
  setFiltroFim,
  mostrarBotoesPDF = false,
  gerarPDF,
  limparFiltros,
  resultado = []
}) => {
  return (
    <div className="row mb-4 align-items-center">
      {/* Coluna do Título e Botão Adicionar */}
      <div className="col-md-6 d-flex align-items-center">
        <h2 className="titulo-lista mb-0">
          {titulo}
          {resultado.length > 0 && (
            <span className="total-atendimentos ms-2">
              Total de equinos: {resultado.length}
            </span>
          )}
        </h2>
        {mostrarAdicionar && (
          <Link to="/veterinaria-Form" className="btn btn-outline-primary ms-4">
            Adicionar Equino
          </Link>
        )}
      </div>
  
      {/* Coluna dos Filtros e Botões */}
      <div className="col-md-6 d-flex flex-nowrap justify-content-end align-items-center overflow-auto gap-2 mt-3 mt-md-0">
        {mostrarDatas && (
          <>
            <input
              type="date"
              className="form-control"
              value={filtroInicio}
              onChange={e => setFiltroInicio(e.target.value)}
              style={{ maxWidth: '160px' }}
            />
            <span className="mx-1">Até</span>
            <input
              type="date"
              className="form-control"
              value={filtroFim}
              onChange={e => setFiltroFim(e.target.value)}
              style={{ maxWidth: '160px' }}
            />
          </>
        )}
  
        <select
          className="form-control"
          value={filtroNome}
          onChange={e => setFiltroNome(e.target.value)}
          style={{ maxWidth: '180px' }}
        >
          <option value="">Todos os equinos</option>
          {equinos.map(eq => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
  
        <button className="btn btn-primary" onClick={onFiltrar}>Filtrar</button>
  
        {mostrarBotoesPDF && (
          <>
            <button
              className="btn btn-secondary"
              onClick={limparFiltros}
              title="Limpar Campos"
            >
              Limpar
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={gerarPDF}
              title="Gerar PDF"
            >
              PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
  
};

export default CabecalhoEquinoLista;
