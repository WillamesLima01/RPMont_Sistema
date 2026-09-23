import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import imgChanfro from '../../assets/imgChanfro.png';
import imgLadoDireito from '../../assets/imgLadoDireito.png';
import imgLadoEsquerdo from '../../assets/imgLadoEsquerdo.png';
import './Veterinaria.css';

Modal.setAppElement('#root');

const VeterinariaResenhaEquinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [resenha, setResenha] = useState('');
  const [resenhaId, setResenhaId] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    const buscarEquinoEresenha = async () => {
      try {
        setCarregando(true);

        // 1. Busca os dados do equino
        const equinoRes = await axios.get(`/equino/${id}`);

        const dadosEquino = equinoRes.data;

        setEquino({
          ...dadosEquino,
          imagem1: '',
          imagem2: '',
          imagem3: '',
        });

        // 2. Tenta buscar a resenha já existente
        try {
          const resenhaRes = await axios.get(
            `/resenha_descritiva/${id}`
          );

          const dadosResenha = resenhaRes.data;

          setResenhaId(dadosResenha.id);
          setResenha(dadosResenha.descricao || '');

          setEquino((prev) => ({
            ...prev,

            imagem1:
              dadosResenha.imgChanfro ||
              '',

            imagem2:
              dadosResenha.imgladoDireito ||
              dadosResenha.imgLadoDireito ||
              dadosResenha.img_lado_direito ||
              '',

            imagem3:
              dadosResenha.imgladoEsquerdo ||
              dadosResenha.imgLadoEsquerdo ||
              dadosResenha.img_lado_esquerdo ||
              '',
          }));
        } catch (error) {
          // 404 significa apenas que este equino
          // ainda não possui uma resenha cadastrada.
          if (error.response?.status === 404) {
            setResenhaId(null);
            setResenha('');
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

  const handleImageClick = (imgField) => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        setEquino((prev) => ({
          ...prev,
          [imgField]: event.target.result,
        }));
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equino) {
      return;
    }

    try {
      setSalvando(true);

      const payload = {
        id: equino.id,
        descricao: resenha,
        imgChanfro: equino.imagem1 || '',
        imgladoDireito: equino.imagem2 || '',
        imgladoEsquerdo: equino.imagem3 || '',
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
          style={{ minWidth: '300px' }}
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
          style={{ minWidth: '300px' }}
        >
          <h5 className="text-primary fw-bold mb-3">
            Imagens do Equino
          </h5>

          <div className="d-flex justify-content-between flex-wrap mb-4">

            <img
              name="imagem1"
              src={
                equino.imagem1 ||
                imgChanfro
              }
              className="imagem chanfro"
              alt="Chanfro"
              title="Clique para adicionar ou alterar a imagem do chanfro"
              onClick={() =>
                handleImageClick('imagem1')
              }
            />

            <img
              name="imagem2"
              src={
                equino.imagem2 ||
                imgLadoDireito
              }
              className="imagem"
              alt="Lado Direito"
              title="Clique para adicionar ou alterar a imagem do lado direito"
              onClick={() =>
                handleImageClick('imagem2')
              }
            />

            <img
              name="imagem3"
              src={
                equino.imagem3 ||
                imgLadoEsquerdo
              }
              className="imagem"
              alt="Lado Esquerdo"
              title="Clique para adicionar ou alterar a imagem do lado esquerdo"
              onClick={() =>
                handleImageClick('imagem3')
              }
            />
          </div>

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
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={salvando}
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