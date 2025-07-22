import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';

Modal.setAppElement('#root');

const VeterinariaEscalaEquino = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [equino, setEquino] = useState(null);
  const [localTrabalho, setLocalTrabalho] = useState('');
  const [jornadaInicio, setJornadaInicio] = useState('');
  const [jornadaFim, setJornadaFim] = useState('');
  const [cavaleiro, setCavaleiro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEscala, setIdEscala] = useState(null);

  useEffect(() => {
    axios.get(`/equinos/${id}`)
      .then(res => setEquino(res.data))
      .catch(err => console.error("Erro ao carregar equino:", err));
  }, [id]);

  useEffect(() => {
    const estado = location.state;
    if (estado?.modoEdicao && estado?.idEscala) {
      setModoEdicao(true);
      setIdEscala(estado.idEscala);

      axios.get(`/escala/${estado.idEscala}`).then(resp => {
        const escala = resp.data;
        setLocalTrabalho(escala.localTrabalho);
        const [inicio, fim] = escala.jornadaTrabalho.split(' às ');
        setJornadaInicio(inicio);
        setJornadaFim(fim);
        setCavaleiro(escala.cavaleiro);
      }).catch(err => console.error("Erro ao carregar escala:", err));
    }
  }, [location.state]);

  const calcularCargaHoraria = (inicio, fim) => {
    const paraMinutos = (h) => {
      const [hora, minuto] = h.replace('h', '').split(':').map(Number);
      return hora * 60 + minuto;
    };
    const minInicio = paraMinutos(inicio);
    const minFim = paraMinutos(fim);
    let diferenca = minFim - minInicio;
    if (diferenca < 0) diferenca += 1440;
    return diferenca / 60;
  };

  const salvarEscala = (e) => {
    e.preventDefault();
    const cargaHoraria = calcularCargaHoraria(jornadaInicio, jornadaFim);
    const data = {
      idEquino: id,
      localTrabalho,
      jornadaTrabalho: `${jornadaInicio} às ${jornadaFim}`,
      cavaleiro,
      cargaHoraria,
      data: new Date().toISOString().split('T')[0]
    };

    const requisicao = modoEdicao
      ? axios.put(`/escala/${idEscala}`, data)
      : axios.post('/escala', data);

    requisicao.then(() => {
      setModalAberto(true);
      setTimeout(() => {
        setModalAberto(false);
        navigate("/escala-equinos-List");
      }, 2000);
    }).catch(err => console.error("Erro ao salvar escala:", err));
  };

  const cancelar = () => {
    navigate("/escala-equinos-List");
  };

  const gerarIntervalosTempo = () => {
    const intervalos = [];
    for (let hora = 0; hora < 24; hora++) {
      intervalos.push(`${hora.toString().padStart(2, '0')}:00h`);
      intervalos.push(`${hora.toString().padStart(2, '0')}:30h`);
    }
    intervalos.push("24:00h");
    return intervalos;
  };

  const cargaHorariaPreview =
    jornadaInicio && jornadaFim ? calcularCargaHoraria(jornadaInicio, jornadaFim) : null;

  if (!equino) return <p>Carregando...</p>;

  return (
    <>
      <Navbar />
      <div className="page-escala">
        <div className="card-escala d-flex flex-wrap gap-4 justify-content-between">

          {/* Dados do Equino */}
          <div className="bloco-flutuante">
            <h4 className="mb-3">Dados do Equino</h4>
            <div className="row row-cols-1 row-cols-md-2 g-3">
              <div className="col"><div className="info-box bg1"><strong>Nome:</strong><p>{equino.name}</p></div></div>
              <div className="col"><div className="info-box bg1"><strong>Raça:</strong><p>{equino.raca}</p></div></div>
              <div className="col"><div className="info-box bg1"><strong>Pelagem:</strong><p>{equino.pelagem}</p></div></div>
              <div className="col"><div className="info-box bg1"><strong>Registro:</strong><p>{equino.numeroRegistro}</p></div></div>
              <div className="col"><div className="info-box bg1"><strong>Nascimento:</strong><p>{equino.dataNascimento}</p></div></div>
              <div className="col"><div className="info-box bg1"><strong>Sexo:</strong><p>{equino.sexo}</p></div></div>
            </div>
          </div>

          {/* Formulário da Escala */}
          <div className="bloco-flutuante">
            <h4 className="mb-3">Escala de Serviço</h4>
            <form onSubmit={salvarEscala}>
              <div className="mb-3">
                <label className="form-label fw-bold">Local de Trabalho</label>
                <input
                  type="text"
                  className="form-control"
                  value={localTrabalho}
                  onChange={e => setLocalTrabalho(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label fw-bold">Jornada (Início)</label>
                  <select
                    className="form-select"
                    value={jornadaInicio}
                    onChange={e => setJornadaInicio(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {gerarIntervalosTempo().map((hora, i) => (
                      <option key={i} value={hora}>{hora}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label fw-bold">Jornada (Fim)</label>
                  <select
                    className="form-select"
                    value={jornadaFim}
                    onChange={e => setJornadaFim(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {gerarIntervalosTempo().map((hora, i) => (
                      <option key={i} value={hora}>{hora}</option>
                    ))}
                  </select>
                </div>
              </div>

              {cargaHorariaPreview !== null && (
                <div className="mb-3">
                  <p className="text-muted">
                    <strong>Carga horária:</strong> {cargaHorariaPreview} hora(s)
                  </p>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">Cavaleiro</label>
                <input
                  type="text"
                  className="form-control"
                  value={cavaleiro}
                  onChange={e => setCavaleiro(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-danger" onClick={cancelar}>Cancelar</button>
                <button type="submit" className="btn btn-success">Salvar Escala</button>
              </div>
            </form>
          </div>
        </div>

        <Modal isOpen={modalAberto} className="modal" overlayClassName="overlay">
          <div className="modalContent text-center">
            <FaCheckCircle className="icone-sucesso" />
            <h4 className="mensagem-azul">
              {modoEdicao ? 'Escala editada com sucesso!' : 'Escala cadastrada com sucesso!'}
            </h4>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VeterinariaEscalaEquino;
