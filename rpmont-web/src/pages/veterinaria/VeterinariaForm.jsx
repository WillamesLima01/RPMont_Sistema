import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const VeterinariaForm = () => {
  const [equino, setEquino] = useState({
    nome: '',
    raca: '',
    pelagem: '',
    registro: '',
    dataNascimento: '',
    situacao: '',
    altura: '',
    peso: '',
    sexo: '',        
    local:''
  });

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagensErro, setMensagensErro] = useState([]);
  const [tooltipAberto, setTooltipAberto] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      axios.get(`/equino/${id}`)
        .then(response => {
          const dados = response.data;
          setEquino({
            nome: dados.nome ?? '',
            raca: dados.raca ?? '',
            pelagem: dados.pelagem ?? '',
            registro: dados.registro ?? '',
            dataNascimento: formatarDataParaInput(dados.dataNascimento),
            situacao: dados.situacao ?? '',
            altura: dados.altura ?? '',
            peso: dados.peso ?? '',
            sexo: dados.sexo ?? '',
            local: dados.local ?? ''
          });
        })
        .catch(error => console.error('Erro ao buscar equino:', error));
    } else {
      resetForm();
    }
  }, [id]);

  const formatarDataParaInput = (dataOriginal) => {
    if (!dataOriginal) return '';
    if (dataOriginal.includes('-')) {
      const partes = dataOriginal.split('-');
      if (partes[0].length === 4) return dataOriginal;
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return dataOriginal;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMensagensErro([]);

    console.log("JSON ENVIADO PARA API:");
    console.log(equino);
    console.log(JSON.stringify(equino, null, 2));

    const request = id
      ? axios.put(`/equino/${id}`, equino)
      : axios.post('/equino', equino);

    request.then(() => {
      document.activeElement.blur();
      if (id) {
        // Se está editando, apenas mostra sucesso e navega
        setModalSucesso(true);
        setTimeout(() => {
          setModalSucesso(false);
          navigate("/veterinaria-List?filtro=todos");
        }, 3000);
      } else {
        // Se está adicionando novo, pergunta se quer adicionar outro
        setModalConfirmacao(true);
      }
    }).catch(error => {
      if (error.response && error.response.data) {
        setMensagensErro(Object.values(error.response.data));
        setModalErroAberto(true);
      } else {
        console.error("Ocorreu um erro: ", error);
      }
    });
  };

  const resetForm = () => {
    setEquino({
      nome: '',
      raca: '',
      pelagem: '',
      registro: '',
      dataNascimento: '',
      situacao: '',
      altura: '',
      peso: '',
      sexo: '',
      local: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquino(prev => ({ ...prev, [name]: value }));
  };

  const toggleTooltip = () => {
    setTooltipAberto(!tooltipAberto);
  };

  const fecharModalErro = () => {
    setModalErroAberto(false);
  };

  const adicionarOutroProduto = () => {
    setModalConfirmacao(false);
    resetForm();
  };

  const finalizarCadastro = () => {
    setModalConfirmacao(false);
    setModalSucesso(true);
    setTimeout(() => {
      setModalSucesso(false);
      navigate("/veterinaria-List?filtro=todos");
    }, 3000);
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 mt-5">

            <div className="text-center position-relative mt-5">
              <h2 className="titulo-principal justify-content-center mt-5">
                {id ? 'Editar Equino' : 'Adicionar Equino'}
                <div className="tooltip-wrapper">
                  <FaQuestionCircle className="tooltip-icon ms-2" onClick={toggleTooltip} />
                  {tooltipAberto && (
                    <div className="tooltip-mensagem">
                      {id
                        ? 'Aqui você pode editar as informações de um equino já cadastrado.'
                        : 'Aqui você pode adicionar um novo equino ao sistema.'}
                    </div>
                  )}
                </div>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="row g-3">
              {/* campos */}
              <div className="col-md-6">
                <label htmlFor="nome" className="form-label">Nome</label>
                <input type="text" id="nome" name="nome" className="form-control" value={equino.nome} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="sexo" className="form-label">Sexo</label>
                <select id="sexo" name="sexo" className="form-select" value={equino.sexo} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="MACHO">Macho</option>
                  <option value="FEMEA">Fêmea</option>
                </select>
              </div>              
              <div className="col-md-6">
                <label htmlFor="pelagem" className="form-label">Pelagem</label>

                <select
                  id="pelagem"
                  name="pelagem"
                  className="form-select"
                  value={equino.pelagem}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  <option value="CASTANHO">Castanho</option>
                  <option value="ALAZAO">Alazão</option>
                  <option value="TORDILHO">Tordilho</option>
                  <option value="PRETO">Preto</option>
                  <option value="BAIO">Baio</option>
                  <option value="ROSILHO">Rosilho</option>
                  <option value="ZAINO">Zaino</option>
                  <option value="LOBUNO">Lobuno</option>
                  <option value="PAMPA">Pampa</option>
                  <option value="PALOMINO">Palomino</option>

                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="registro" className="form-label">Registro</label>
                <input type="text" id="registro" name="registro" className="form-control" value={equino.registro} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="dataNascimento" className="form-label">Data de Nascimento</label>
                <input type="date" id="dataNascimento" name="dataNascimento" className="form-control" value={equino.dataNascimento} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="raca" className="form-label">Raça</label>
                <input type="text" id="raca" name="raca" className="form-control" value={equino.raca} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label htmlFor="altura" className="form-label">Altura</label>
                <input type="number" step={"0.01"} id="altura" name="altura" className="form-control" value={equino.altura || ''} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label htmlFor="peso" className="form-label">Peso</label>
                <input type="number" step={"0.01"} id="peso" name="peso" className="form-control" value={equino.peso || ''} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label htmlFor="situacao" className="form-label">Situação</label>
                <select id="situacao" name="situacao" className="form-select" value={equino.situacao} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="BAIXADO">Baixado</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="local" className="form-label">Unidade</label>
                <select id="local" name="local" className="form-select" value={equino.local} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="RPMont">RPMont</option>
                  <option value="3ºEPMont">3º EPMont</option>
                </select>
              </div>

              <div className="col-12 text-end mt-4">
                <Link to="/veterinaria-List?filtro=todos" className="btn btn-outline-danger me-2">Cancelar</Link>
                <button type="submit" className="btn btn-primary">{id ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>

            {/* Modal confirmação */}
            <Modal
              isOpen={modalConfirmacao}
              onRequestClose={() => setModalConfirmacao(false)}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
              <FaExclamationTriangle className="icone-interrogacao" />
                <h2 className="mensagem-azul">Deseja adicionar outro equino?</h2>
                <div className="modalButtons mt-3">
                  <button onClick={adicionarOutroProduto} className="btn btn-confirmar me-2">Sim</button>
                  <button onClick={finalizarCadastro} className="btn btn-cancelar">Não</button>
                </div>
              </div>
            </Modal>

            {/* Modal sucesso */}
            <Modal
              isOpen={modalSucesso}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaCheckCircle className="icone-sucesso" />
                <h2 className="mensagem-azul">
                  {id 
                    ? 'Dados editados com sucesso!'
                    : 'Equino adicionado com sucesso!'
                  }
                </h2>
              </div>
            </Modal>

            {/* Modal erro */}
            <Modal
              isOpen={modalErroAberto}
              onRequestClose={fecharModalErro}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-erro" />
                <h2>Ocorreu um erro:</h2>
                {mensagensErro.map((mensagem, index) => (
                  <h5 key={index} className="text-danger">{mensagem}</h5>
                ))}
                <button onClick={fecharModalErro} className="btn btn-outline-secondary mt-3">Fechar</button>
              </div>
            </Modal>

          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinariaForm;
