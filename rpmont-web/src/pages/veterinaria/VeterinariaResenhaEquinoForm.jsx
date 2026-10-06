import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import ResenhaGrafica, { lerMarcacoes } from './ResenhaGrafica';
import './Veterinaria.css';

Modal.setAppElement('#root');

const VeterinariaResenhaEquinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [resenha, setResenha] = useState('');
  const [resenhaId, setResenhaId] = useState(null);
  const [marcacoes, setMarcacoes] = useState([]);
  const [imagensAnteriores, setImagensAnteriores] = useState({});

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sinalPendente, setSinalPendente] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    const buscarEquinoEresenha = async () => {
      try {
        setCarregando(true);

        // 1. Busca os dados do equino
        const equinoRes = await axios.get(`/equino/${id}`);

        const dadosEquino = equinoRes.data;

        setEquino(dadosEquino);

        // 2. Tenta buscar a resenha já existente
        try {
          const resenhaRes = await axios.get(
            `/resenha_descritiva/${id}`
          );

          const dadosResenha = resenhaRes.data;

          setResenhaId(dadosResenha.id);
          setResenha(dadosResenha.descricao || '');

          setMarcacoes(lerMarcacoes(dadosResenha.marcacoes));
          setImagensAnteriores({
            imgChanfro: dadosResenha.imgChanfro || '',
            imgladoDireito: dadosResenha.imgLadoDireito || dadosResenha.imgladoDireito || '',
            imgladoEsquerdo: dadosResenha.imgLadoEsquerdo || dadosResenha.imgladoEsquerdo || '',
          });
        } catch (error) {
          // 404 significa apenas que este equino
          // ainda não possui uma resenha cadastrada.
          if (error.response?.status === 404) {
            setResenhaId(null);
            setResenha('');
            setMarcacoes([]);
            setImagensAnteriores({});
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(
          'Erro ao carregar equino/resenha:',
          error
        );
      } finally {
        setCarregando(false);
      }
    };

    buscarEquinoEresenha();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equino || sinalPendente) {
      return;
    }

    try {
      setSalvando(true);

      const payload = {
        id: equino.id,
        descricao: resenha,
        marcacoes: JSON.stringify(marcacoes),
        ...imagensAnteriores,
      };

      if (resenhaId) {
        // O ID da URL é o ID do equino,
        // conforme o Service do backend.
        await axios.put(
          `/resenha_descritiva/${equino.id}`,
          payload
        );

        setMensagemSucesso(
          'Resenha atualizada com sucesso!'
        );
      } else {
        const response = await axios.post(
          '/resenha_descritiva',
          payload
        );

        if (response.data?.id) {
          setResenhaId(response.data.id);
        }

        setMensagemSucesso(
          'Resenha salva com sucesso!'
        );
      }

      setModalAberto(true);

      setTimeout(() => {
        setModalAberto(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error(
        'Erro ao salvar resenha:',
        error
      );

      if (error.response?.status === 409) {
        alert(
          'Este equino já possui uma resenha cadastrada.'
        );
      } else {
        alert(
          'Não foi possível salvar a resenha descritiva.'
        );
      }
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="container mt-5 pt-5">
        <Navbar />

        <p>Carregando...</p>
      </div>
    );
  }

  if (!equino) {
    return (
      <div className="container mt-5 pt-5">
        <Navbar />

        <div className="alert alert-danger">
          Não foi possível carregar os dados do equino.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <Navbar />

      <h2 className="text-primary fw-bold mb-4">
        Resenha Descritiva
      </h2>

      <div className="d-flex flex-wrap gap-4 justify-content-between">

        {/* COLUNA ESQUERDA - DADOS DO EQUINO */}
        <div
          className="bloco-flutuante flex-fill"
          style={{ flex: '1 1 280px', minWidth: 0 }}
        >
          <h5 className="text-primary fw-bold mb-3">
            Dados do Equino
          </h5>

          <div className="info-box bg1 mb-2">
            <strong>Nome:</strong>
            <p>{equino.nome || '-'}</p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Raça:</strong>
            <p>{equino.raca || '-'}</p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Registro:</strong>
            <p>{equino.registro || '-'}</p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Pelagem:</strong>
            <p>{equino.pelagem || '-'}</p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Sexo:</strong>
            <p>{equino.sexo || '-'}</p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Altura:</strong>
            <p>
              {equino.altura
                ? `${equino.altura} m`
                : '-'}
            </p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Peso:</strong>
            <p>
              {equino.peso
                ? `${equino.peso} kg`
                : '-'}
            </p>
          </div>

          <div className="info-box bg1 mb-2">
            <strong>Unidade:</strong>
            <p>{equino.local || '-'}</p>
          </div>
        </div>

        {/* COLUNA DIREITA - IMAGENS + RESENHA */}
        <div
          className="bloco-flutuante flex-fill"
          style={{ flex: '2 1 600px', minWidth: 0 }}
        >
          <ResenhaGrafica marcacoes={marcacoes} onChange={setMarcacoes} onPendingChange={setSinalPendente} />

          <div className="mb-3">
            <label
              htmlFor="resenha"
              className="form-label fw-bold"
            >
              Descreva os aspectos do equino
            </label>

            <textarea
              className="form-control"
              id="resenha"
              name="resenha"
              rows="6"
              value={resenha}
              onChange={(e) =>
                setResenha(e.target.value)
              }
            />
          </div>

          <div className="d-flex justify-content-end gap-2">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={salvando || sinalPendente}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={salvando || sinalPendente}
            >
              {salvando
                ? 'Salvando...'
                : resenhaId
                  ? 'Atualizar'
                  : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalAberto}
        onRequestClose={() =>
          setModalAberto(false)
        }
        contentLabel="Sucesso"
        style={{
          content: {
            top: '40%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform:
              'translate(-50%, -50%)',
            border: 'none',
            background: 'none',
            padding: 0,
          },

          overlay: {
            backgroundColor:
              'rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
          },
        }}
      >
        <div className="modal-content-custom">

          <FaCheckCircle
            className="modal-success-icon"
          />

          <h4 className="modal-success-title">
            {mensagemSucesso}
          </h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaResenhaEquinoForm;