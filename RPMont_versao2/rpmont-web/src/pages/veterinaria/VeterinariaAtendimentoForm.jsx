import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';

Modal.setAppElement('#root');

const VeterinariaAtendimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equino, setEquino] = useState(null);
  const [consulta, setConsulta] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEquino, setIdEquino] = useState(null);

  // Estados para calculadora de dosagem
  const [peso, setPeso] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [unidade, setUnidade] = useState('mg');

  useEffect(() => {
    axios.get(`/atendimentos/${id}`)
      .then(res => {
        const atendimento = res.data;
        setConsulta(atendimento.textoConsulta);
        setIdEquino(atendimento.idEquino);
        setModoEdicao(true);
        return axios.get(`/equinos/${atendimento.idEquino}`);
      })
      .then(res => setEquino(res.data))
      .catch(() => {
        axios.get(`/equinos/${id}`)
          .then(res => {
            setEquino(res.data);
            setIdEquino(id);
          })
          .catch(err => console.error("Erro ao buscar equino:", err));
      });
  }, [id]);

  const salvarConsulta = (e) => {
    e.preventDefault();
    const data = {
      idEquino,
      textoConsulta: consulta,
      data: new Date().toISOString().split('T')[0]
    };

    const requisicao = modoEdicao
      ? axios.put(`/atendimentos/${id}`, data)
      : axios.post('/atendimentos', data);

    requisicao
      .then(() => {
        setModalAberto(true);
        setTimeout(() => {
          setModalAberto(false);
          navigate(modoEdicao ? "/atendimentoList" : "/veterinariaList");
        }, 2000);
      })
      .catch(err => console.error("Erro ao salvar atendimento:", err));
  };

  const cancelar = () => {
    navigate(modoEdicao ? "/atendimentoList" : "/veterinariaList");
  };

  const calcularDosagem = () => {
    const p = parseFloat(peso);
    const d = parseFloat(dosagem);
    if (!p || !d) return '--';
    return `${(p * d).toFixed(2)} ${unidade}`;
  };

  if (!equino) return <p>Carregando...</p>;

  return (
    <>
      <Navbar />
      <div className="page-atendimento">
        <div className="card-atendimento">
          <div className="titulo-wrapper">
            <h2 className="titulo-principal-Atendimento">
              {modoEdicao ? 'Editar Consulta' : 'Atendimento Veterinário'}
            </h2>
          </div>
          <div className="row row-cols-1 row-cols-md-3 g-3 mb-1">
            <div className="col"><div className="info-box bg1"><strong>Nome:</strong><p>{equino.name}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Raça:</strong><p>{equino.raca}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Pelagem:</strong><p>{equino.pelagem}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Registro:</strong><p>{equino.numeroRegistro}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Nascimento:</strong><p>{equino.dataNascimento}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Sexo:</strong><p>{equino.sexo}</p></div></div>
            <div className="col"><div className="info-box bg1"><strong>Situação:</strong><p>{equino.status}</p></div></div>
          </div>

          {/* Calculadora de Dosagem */}
          <div className="calculadora-dosagem mb-4 p-3 rounded shadow-sm w-100" style={{ backgroundColor: '#f0f8ff' }}>
            <h5 className="fw-bold mb-3">Calculadora de Dosagem</h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Peso do Equino (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 450"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Dosagem (por kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={dosagem}
                  onChange={(e) => setDosagem(e.target.value)}
                  placeholder="Ex: 0.5"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Unidade</label>
                <select
                  className="form-select"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                </select>
              </div>
              <div className="col-md-4 d-flex justify-content-between align-items-center">
                <div>
                  <strong>Dose total:</strong>{' '}
                  {peso && dosagem ? `${(peso * dosagem).toFixed(2)} ${unidade}` : '--'}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setPeso('');
                    setDosagem('');
                    setUnidade('mg');
                  }}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={salvarConsulta}>
            <div className="form-floating mb-3">
              <textarea
                className="form-control"
                placeholder="Consulta Veterinária"
                id="floatingTextarea"
                style={{ height: '120px' }}
                value={consulta}
                onChange={e => setConsulta(e.target.value)}
                required
              ></textarea>
              <label htmlFor="floatingTextarea" className="form-label fw-bold">
                Digite aqui o texto
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-danger me-2" onClick={cancelar}>Cancelar</button>
              <button type="submit" className="btn btn-success">Salvar Dados</button>
            </div>
          </form>
        </div>

        <Modal isOpen={modalAberto} className="modal" overlayClassName="overlay">
          <div className="modalContent text-center">
            <FaCheckCircle className="icone-sucesso" />
            <h4 className="mensagem-azul">
              {modoEdicao ? 'Dados editados com sucesso!' : 'Consulta salva com sucesso!'}
            </h4>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VeterinariaAtendimento;
