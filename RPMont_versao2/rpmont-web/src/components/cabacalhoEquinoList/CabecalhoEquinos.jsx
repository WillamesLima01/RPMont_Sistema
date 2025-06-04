// src/components/veterinaria/CabecalhoEquinoLista.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CabecalhoEquinoLista = ({ equinos, filtroNome, setFiltroNome, onFiltrar }) => {
  return (
    <div className='d-flex justify-content-between align-items-center'>
      <div>
        <h2 className='titulo-lista d-inline'>Lista de Equinos</h2>
        <Link to="/veterinaria-Form" className='btn btn-outline-primary ms-5 mb-2'>
          Adicionar Equino
        </Link>
      </div>

      <div className='d-flex justify-content-center'>
        <div className="form-control ms-3 me-3">
          <select
            className="form-select"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          >
            <option value="">Todos os Equinos</option>
            {equinos.map(eq => (
              <option key={eq.id} value={eq.name}>{eq.name}</option>
            ))}
          </select>
        </div>
        <button className='btn btn-primary' onClick={onFiltrar}>Filtrar</button>
      </div>
    </div>
  );
};

export default CabecalhoEquinoLista;
