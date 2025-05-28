import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import horseshoeIcon from '../../assets/horseshoe.png';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

Modal.setAppElement('#root');

const VeterinariaManejoSanitarioList = () => {
  const [equinos, setEquinos] = useState([]);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);
  const navigate = useNavigate();
  const [modalBaixaAberto, setModalBaixaAberto] = useState(false);
  const [modalConfirmarBaixa, setModalConfirmarBaixa] = useState(false);
  const [equinoParaBaixar, setEquinoParaBaixar] = useState(null);   
  const [filtroNome, setFiltroNome] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filtroStatus = searchParams.get('filtro'); // "ativos", "baixados", "todos"
    
  useEffect(() => {
  axios.get('/equinos')
    .then(response => {
      const todos = response.data;

      let filtrados = todos;

      if (filtroStatus === 'ativos') {
        filtrados = todos.filter(eq => eq.status?.toLowerCase() === 'ativo');
      } else if (filtroStatus === 'baixados') {
        filtrados = todos.filter(eq => eq.status?.toLowerCase() === 'baixado');
      }

      setEquinos(filtrados);
    })
    .catch(error => console.error("Erro ao buscar equinos:", error));
}, [filtroStatus]);

  // Função para baixar equino
  const baixarEquino = async () => {
    try {
      if (!equinoParaBaixar) return;
  
      // Atualiza status do equino
      await axios.patch(`/equinos/${equinoParaBaixar.id}`, { status: "Baixado" });
  
      // Cria novo registro na tabela equinosBaixados
      const novaBaixa = {
        idEquino: equinoParaBaixar.id,
        dataBaixa: new Date().toISOString().slice(0, 10),
        dataRetorno: null
      };
      await axios.post('/equinosBaixados', novaBaixa);
  
      // Fecha modal de confirmação
      setModalConfirmarBaixa(false);
      setEquinoParaBaixar(null);
  
      // Exibe modal de sucesso
      setModalBaixaAberto(true);
      setTimeout(() => {
        setModalBaixaAberto(false);
        navigate('/veterinaria-Equinos-Baixados');
      }, 3000);
    } catch (error) {
      console.error("Erro ao baixar equino:", error);
    }
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
          <h2 className='titulo-lista d-inline'>Lista de Equinos</h2>          
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

          <button className='btn btn-primary'>Filtrar</button>
        </div>
      </div>

      <div>
        <table className="table table-hover mt-2">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Pelagem</th>
              <th>Número Registro</th>
              <th>Data Nascimento</th>
              <th>Sexo</th>
              <th>Unidade</th>
              <th className='col-buttons'></th>
            </tr>
          </thead>
          <tbody>
            {equinos
              .filter(eq => !filtroNome || eq.name === filtroNome)
              .map(equino => (
              <tr key={equino.id}>
                <td>{equino.name}</td>
                <td>{equino.raca}</td>
                <td>{equino.pelagem}</td>
                <td>{equino.numeroRegistro}</td>
                <td>{equino.dataNascimento}</td>
                <td>{equino.sexo}</td>
                <td>{equino.unidade}</td>
                <td className='text-end'>
                    <div className='d-inline me-2'>
                        <Link
                        to={`/toalete-equino/${equino.id}`}
                        className="btn btn-sm btn-outline-primary btn-toalete"
                        title="Toalete"
                        >
                        <i className="bi bi-scissors"></i>
                        </Link>
                    </div>

                    <div className='d-inline me-2'>
                        <Link
                        to={`/ferrageamento-equino/${equino.id}`}
                        className="btn btn-sm btn-outline-info btn-ferrageamento"
                        title="Ferrageamento"
                        >
                        <img src={horseshoeIcon} alt="Ferradura" className="icon-ferradura" />
                        </Link>
                    </div>

                    <div className='d-inline'>
                        <Link
                        to={`/vermifugacao-equino/${equino.id}`}
                        className="btn btn-sm btn-outline-success btn-vermifugacao"
                        title="Vermifugação"
                        >
                        <i className="bi bi-capsule"></i> {/* Ícone de cápsula remédio do Bootstrap Icons */}
                        </Link>
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

      <Modal
        isOpen={modalConfirmarBaixa}
        onRequestClose={() => setModalConfirmarBaixa(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <FaExclamationTriangle className="icone-exclamacao text-warning mb-3" size={50} />
          <h4 className="mensagem-azul">
            Confirme a baixa do equino: <strong>{equinoParaBaixar?.name}</strong>
          </h4>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-outline-secondary" onClick={() => setModalConfirmarBaixa(false)}>Cancelar</button>
            <button className="btn btn-success" onClick={baixarEquino}>Confirmar</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalBaixaAberto}
        onRequestClose={() => setModalBaixaAberto(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <h4 className="text-success">✅ Baixa do equino realizada com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaManejoSanitarioList;
