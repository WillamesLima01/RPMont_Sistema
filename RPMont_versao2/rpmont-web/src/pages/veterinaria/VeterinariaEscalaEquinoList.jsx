import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';

Modal.setAppElement('#root');

// ... (importações continuam iguais)

const VeterinariaEscalaEquinoList = () => {
    const [escala, setEscala] = useState([]);
    const [equinos, setEquinos] = useState([]);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroInicio, setFiltroInicio] = useState('');
    const [filtroFim, setFiltroFim] = useState('');
    const [escalaSelecionado, setEscalaSelecionado] = useState(null);
  
    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
  
    useEffect(() => {
      buscarEscala();
      axios.get('/equinos')
        .then(response => setEquinos(response.data))
        .catch(error => console.error("Erro ao buscar equinos:", error));
    }, []);
  
    const buscarEscala = () => {
      axios.get('/escala')
        .then(response => setEscala(response.data))
        .catch(error => console.error("Erro ao buscar escala:", error));
    };
  
    const filtrar = () => {
      axios.get('/escala')
        .then(response => {
          let filtrados = response.data;
  
          if (filtroNome) {
            filtrados = filtrados.filter(e => e.idEquino === filtroNome);
          }
          if (filtroInicio) {
            filtrados = filtrados.filter(e => e.data >= filtroInicio);
          }
          if (filtroFim) {
            filtrados = filtrados.filter(e => e.data <= filtroFim);
          }
  
          setEscala(filtrados);
          setPaginaAtual(1); // volta para a primeira página ao filtrar
        })
        .catch(error => console.error("Erro ao filtrar escala:", error));
    };
  
    const limparFiltros = () => {
      setFiltroNome('');
      setFiltroInicio('');
      setFiltroFim('');
      buscarEscala();
    };
  
    const confirmarExclusao = (item) => {
      setEscalaSelecionado(item);
      setModalExcluirAberto(true);
    };
  
    const cancelarExclusao = () => {
      setModalExcluirAberto(false);
      setEscalaSelecionado(null);
    };
  
    const excluirEscala = () => {
      axios.delete(`/escala/${escalaSelecionado.id}`)
        .then(() => {
          setEscala(escala.filter(e => e.id !== escalaSelecionado.id));
          setModalExcluirAberto(false);
        })
        .catch(error => console.error("Erro ao excluir:", error));
    };
  
    const getNomeEquino = (idEquino) => {
      const equino = equinos.find(eq => eq.id === idEquino);
      return equino ? equino.name : 'Desconhecido';
    };
  
    const exportarCSV = () => {
      const headers = ['Nome do Equino', 'Local de Trabalho', 'Jornada', 'Cavaleiro', 'Data'];
      const linhas = escala.map(item => [
        getNomeEquino(item.idEquino),
        item.localTrabalho,
        item.jornadaTrabalho,
        item.cavaleiro,
        item.data
      ]);
  
      const csvContent = [headers, ...linhas].map(e => e.join(';')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'escala-equinos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    // Paginação - cálculo de itens
    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const escalaPaginada = escala.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(escala.length / itensPorPagina);
  
    const proximaPagina = () => {
      if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
    };
  
    const paginaAnterior = () => {
      if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
    };
  
    return (
      <div className='container-fluid mt-page'>
        <Navbar />
  
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2 className='titulo-lista'>
            Lista de Escalas
            <span className="total-atendimentos">Total de registros: {escala.length}</span>
          </h2>
  
          <div className='d-flex justify-content-end'>
            <input type='date' className='form-control' value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
            <span className='m-2'>Até</span>
            <input type='date' className='form-control' value={filtroFim} onChange={e => setFiltroFim(e.target.value)} />
  
            <select className='form-control ms-3 me-3' value={filtroNome} onChange={e => setFiltroNome(e.target.value)}>
              <option value=''>Todos os equinos</option>
              {equinos.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
  
            <button className='btn btn-primary me-2' onClick={filtrar}>Filtrar</button>
            <button className='btn btn-secondary me-2' onClick={limparFiltros}>Limpar</button>
            <button className='btn btn-outline-success' onClick={exportarCSV}>Exportar</button>
          </div>
        </div>
  
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nome do Equino</th>
              <th>Local de Trabalho</th>
              <th>Jornada</th>
              <th>Cavaleiro</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {escalaPaginada.map(item => (
              <tr key={item.id}>
                <td>{getNomeEquino(item.idEquino)}</td>
                <td>{item.localTrabalho}</td>
                <td>{item.jornadaTrabalho}</td>
                <td>{item.cavaleiro}</td>
                <td>{item.data}</td>
                <td className='text-end'>
                <Link
                  to={`/escala-equinos/${item.idEquino}`}
                  state={{ modoEdicao: true, idEscala: item.id }}
                  className="btn btn-sm btn-outline-primary me-2"
                  title="Editar Escala"
                >
                  <i className="bi bi-pencil-square"></i>
                </Link>

                  <button onClick={() => confirmarExclusao(item)} className='btn btn-sm btn-outline-danger' title="Excluir Escala">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Paginação */}
        <div className='d-flex justify-content-center align-items-center mt-3'>
          <button className='btn btn-outline-secondary me-2' onClick={paginaAnterior} disabled={paginaAtual === 1}>Anterior</button>
          <span>Página {paginaAtual} de {totalPaginas}</span>
          <button className='btn btn-outline-secondary ms-2' onClick={proximaPagina} disabled={paginaAtual === totalPaginas}>Próxima</button>
        </div>
  
        {/* Modal de Confirmação */}
        <Modal
          isOpen={modalExcluirAberto}
          onRequestClose={cancelarExclusao}
          className="modal"
          overlayClassName="overlay"
        >
          <div className="modalContent text-center">
            <FaExclamationTriangle className="icone-exclamacao text-warning mb-3" size={50} />
            <h4 className="mensagem-azul">
              Tem certeza que deseja excluir a escala do equino <strong>{getNomeEquino(escalaSelecionado?.idEquino)}</strong>?
            </h4>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
              <button className="btn btn-danger" onClick={excluirEscala}>Excluir</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };
  
  export default VeterinariaEscalaEquinoList;
  