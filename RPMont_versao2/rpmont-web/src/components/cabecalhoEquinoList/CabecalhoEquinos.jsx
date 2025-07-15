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
    <div className="container-fluid mb-3">
      <div className="row g-3 align-items-center">
        <div className="col-lg-auto col-md-12 d-flex align-items-center gap-3 flex-wrap">
          <h2 className="titulo-lista mb-0">
            {titulo}
            {resultado.length > 0 && (
              <span className="total-atendimentos ms-2">
                Total de equinos: {resultado.length}
              </span>
            )}
          </h2>

          {mostrarAdicionar && (
            <Link to="/veterinaria-Form" className="btn btn-outline-primary">
              Adicionar Equino
            </Link>
          )}
        </div>

        <div className="col d-flex flex-wrap justify-content-lg-end align-items-center gap-2">
          {mostrarDatas && (
            <>
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: '170px' }}
                value={filtroInicio}
                onChange={e => setFiltroInicio(e.target.value)}
              />
              <span>Até</span>
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: '170px' }}
                value={filtroFim}
                onChange={e => setFiltroFim(e.target.value)}
              />
            </>
          )}

          <select
            className="form-control"
            style={{ maxWidth: '200px' }}
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
          >
            <option value="">Todos os equinos</option>
            {equinos.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={onFiltrar}>Filtrar</button>

          {mostrarBotoesPDF && (
            <>
              <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
              <button className="btn btn-outline-danger" onClick={gerarPDF}>PDF</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CabecalhoEquinoLista;