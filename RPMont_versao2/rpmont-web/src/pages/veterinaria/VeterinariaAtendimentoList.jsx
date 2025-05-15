import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import { utils, writeFile } from 'xlsx';

Modal.setAppElement('#root');

const VeterinariaAtendimento = () => {
  const [equinos, setEquinos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);  
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get('/equinos').then(res => setEquinos(res.data));
    axios.get('/atendimentos').then(res => {
      setAtendimentos(res.data);
      setResultado(res.data);
    });
  }, []);

  const filtrar = () => {
    let filtrados = atendimentos;

    if (filtroNome) {
      filtrados = filtrados.filter(a => a.idEquino === filtroNome);
    }
    if (filtroInicio) {
      filtrados = filtrados.filter(a => a.data >= filtroInicio);
    }
    if (filtroFim) {
      filtrados = filtrados.filter(a => a.data <= filtroFim);
    }

    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(atendimentos);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, endIndex);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);
  
  const exportarCSV = () => {
    const dataExportar = resultado.map(atendimento => {
      const equino = equinos.find(eq => eq.id === atendimento.idEquino);
      return {
        Nome: equino?.name || '-',
        Raça: equino?.raca || '-',
        Registro: equino?.numeroRegistro || '-',
        Data: atendimento.data,
        Consulta: atendimento.textoConsulta
      };
    });

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(dataExportar);
    utils.book_append_sheet(wb, ws, "Atendimentos");
    writeFile(wb, "atendimentos.csv");
  };

  const confirmarExclusao = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setModalExcluirAberto(true);
  }; 
  
  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setAtendimentoSelecionado(null);
  }; 

  const excluirAtendimentoSelecionado = () => {
    if (!atendimentoSelecionado) return;
  
    axios.delete(`/atendimentos/${atendimentoSelecionado.id}`)
      .then(() => {
        const atualizados = atendimentos.filter(a => a.id !== atendimentoSelecionado.id);
        setAtendimentos(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => {
        console.error("Erro ao excluir atendimento:", error);
      });
  }; 

  return (
    <div className='container-fluid mt-page'>
      <Navbar />

      <div className='d-flex justify-content-between align-items-center mb-4'>
      <h2 className='titulo-lista'>
        Lista de Atendimentos
        <span className="total-atendimentos">
          Total de atendimentos: {resultado.length}
        </span>
      </h2>
        <div className='d-flex justify-content-end'>
          <input
            type='date'
            className='form-control'
            value={filtroInicio}
            onChange={e => setFiltroInicio(e.target.value)}
          />
          <span className='m-2'>Até</span>
          <input
            type='date'
            className='form-control'
            value={filtroFim}
            onChange={e => setFiltroFim(e.target.value)}
          />

          <select
            className='form-control ms-3 me-3'
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
          >
            <option value=''>Todos os equinos</option>
            {equinos.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          <button className='btn btn-primary me-2' onClick={filtrar}>Filtrar</button>
          <button className='btn btn-secondary me-2' title="Limpar Campos" onClick={limparFiltros}>Limpar</button>
          <button className='btn btn-outline-success' title="Exportar CSV" onClick={exportarCSV}>Exportar</button>
        </div>
      </div>

      <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              <th>Nome do Equino</th>
              <th>Raça</th>
              <th>Número Registro</th>
              <th>Data</th>
              <th>Consulta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itensPaginados.map((atendimento, idx) => {
              const equino = equinos.find(eq => eq.id === atendimento.idEquino);
              return (
                <tr key={idx}>
                  <td>{equino?.name || '-'}</td>
                  <td>{equino?.raca || '-'}</td>
                  <td>{equino?.numeroRegistro || '-'}</td>
                  <td>{atendimento.data}</td>
                  <td>{atendimento.textoConsulta}</td>
                  <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Link to={`/edit-atendimento/${atendimento.id}`} className="btn btn-sm btn-outline-primary" title="Editar Atendimento">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <button onClick={() => confirmarExclusao(atendimento)} className="btn btn-sm btn-outline-danger" title="Excluir Atendimento">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className='d-flex justify-content-center'>
          <nav>
            <ul className='pagination'>
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button className='page-link' onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <Modal
              isOpen={modalExcluirAberto}
              onRequestClose={cancelarExclusao}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-exclamacao text-warning mb-3" size={50} />
                <h4 className="mensagem-azul">
                  Tem certeza que deseja excluir o atendimento de <strong>{equinos.find(eq => eq.id === atendimentoSelecionado?.idEquino)?.name}</strong>?
                </h4>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
                  <button className="btn btn-danger" onClick={excluirAtendimentoSelecionado}>Excluir</button>
                </div>
              </div>
            </Modal>
    </div>
  );
};

export default VeterinariaAtendimento;