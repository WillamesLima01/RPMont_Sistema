import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';

Modal.setAppElement('#root');

const VeterinariaList = () => {
  const [equinos, setEquinos] = useState([]);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);

  useEffect(() => {
    axios.get('/equinos')
      .then(response => setEquinos(response.data))
      .catch(error => console.error("Ocorreu um erro: ", error));
  }, []);

  const confirmarExclusao = (equino) => {
    setEquinoSelecionado(equino);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setEquinoSelecionado(null);
  };

  const excluirEquino = () => {
    axios.delete(`/equinos/${equinoSelecionado.id}`)
      .then(() => {
        setEquinos(equinos.filter(eq => eq.id !== equinoSelecionado.id));
        setModalExcluirAberto(false);
      })
      .catch(error => console.error("Erro ao deletar:", error));
  };

  return (
    <div className='container-fluid mt-page'>
      <Navbar />

      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h2 className='d-inline'>Lista de Equinos</h2>
          <Link to="/veterinariaForm" className='btn btn-outline-primary ms-5 mb-2'>Adicionar Equino</Link>
        </div>

        <div className='d-flex justify-content-center'>
          <div className='form-control ms-3 me-3'>
            <select name='equino' id='equino'>
              <option value="">Todos os equinos</option>
              {equinos.map(equino => (
                <option key={equino.id} value={equino.id}>{equino.name}</option>
              ))}
            </select>
          </div>

          <button className='btn btn-primary'>Filtrar</button>
        </div>
      </div>

      <div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Pelagem</th>
              <th>Número Registro</th>
              <th>Data Nascimento</th>
              <th>Sexo</th>
              <th className='col-buttons'></th>
            </tr>
          </thead>
          <tbody>
            {equinos.map(equino => (
              <tr key={equino.id}>
                <td>{equino.name}</td>
                <td>{equino.raca}</td>
                <td>{equino.pelagem}</td>
                <td>{equino.numeroRegistro}</td>
                <td>{equino.dataNascimento}</td>
                <td>{equino.sexo}</td>
                <td className='text-end'>
                  <div className='d-inline me-2'>
                    <Link to={`/edit-equino/${equino.id}`} className="btn btn-sm btn-outline-primary btn-tm" title="Editar">
                      <i className="bi bi-pencil-square btn-tm"></i>
                    </Link>
                  </div>
                  <button onClick={() => confirmarExclusao(equino)} className='btn btn-sm btn-outline-danger me-2' title="Excluir">
                    <i className="bi bi-trash"></i>
                  </button>
                  <div className='d-inline'>
                    <Link to={`/atendimento/${equino.id}`} className="btn btn-sm btn-outline-info btn-tm align-items-center me-2" title="Atendimento">
                      <i className="bi bi-clipboard2-pulse"></i>
                    </Link>
                    <div className='d-inline me-2'>
                      <Link to={`/escala-equinos/${equino.id}`} className="btn btn-sm btn-outline-success btn-tm" title="Escala">
                        <i className="bi bi-calendar4-week"></i>
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            Tem certeza que deseja excluir o equino <strong>{equinoSelecionado?.name}</strong>?
          </h4>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
            <button className="btn btn-danger" onClick={excluirEquino}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaList;
