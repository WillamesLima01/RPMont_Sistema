import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import imgChanfro from '../../assets/imgChanfro.jpg';
import imgLadoDireito from '../../assets/imgLadoDireito.jpg';
import imgLadoEsquerdo from '../../assets/imgLadoEsquerdo.jpg';
import './Veterinaria.css';

Modal.setAppElement('#root');

const VeterinariaResenhaEquinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [resenha, setResenha] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    const buscarEquinoEresenha = async () => {
      try {
        const equinoRes = await axios.get(`/equinos/${id}`);
        setEquino(equinoRes.data);

        const resenhaRes = await axios.get(`/resenhas?id_equino=${id}`);
        const dadosResenha = resenhaRes.data[0];
        if (dadosResenha) {
          setResenha(dadosResenha.resenhaDescritiva);
          setEquino(prev => ({
            ...prev,
            imagem1: dadosResenha.img1,
            imagem2: dadosResenha.img2,
            imagem3: dadosResenha.img3,
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar equino/resenha:', err);
      }
    };

    buscarEquinoEresenha();
  }, [id]);

  const handleImageClick = (imgField) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setEquino(prev => ({
          ...prev,
          [imgField]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/resenhas', {
        id_equino: equino.id,
        img1: equino.imagem1 || '',
        img2: equino.imagem2 || '',
        img3: equino.imagem3 || '',
        resenhaDescritiva: resenha,
        dataHora: new Date().toISOString()
      });

      setModalAberto(true);
      setTimeout(() => {
        setModalAberto(false);
        navigate('/veterinaria-List');
      }, 2500);
    } catch (err) {
      console.error('Erro ao salvar resenha:', err);
    }
  };

  if (!equino) return <p>Carregando...</p>;

  return (
    <div className="container mt-5 pt-5">
      <Navbar />
      <h2 className="text-primary fw-bold mb-4">Resenha Descritiva</h2>

      <div className="d-flex flex-wrap gap-4 justify-content-between">
        {/* COLUNA ESQUERDA - DADOS DO EQUINO */}
        <div className="bloco-flutuante flex-fill" style={{ minWidth: '300px' }}>
          <h5 className="text-primary fw-bold mb-3">Dados do Equino</h5>
          <div className="info-box bg1 mb-2"><strong>Nome:</strong> <p>{equino.name}</p></div>
          <div className="info-box bg1 mb-2"><strong>Raça:</strong> <p>{equino.raca}</p></div>
          <div className="info-box bg1 mb-2"><strong>Registro:</strong> <p>{equino.numeroRegistro}</p></div>
          <div className="info-box bg1 mb-2"><strong>Pelagem:</strong> <p>{equino.pelagem}</p></div>
          <div className="info-box bg1 mb-2"><strong>Sexo:</strong> <p>{equino.sexo}</p></div>
          <div className="info-box bg1 mb-2"><strong>Unidade:</strong> <p>{equino.unidade}</p></div>
        </div>

        {/* COLUNA DIREITA - IMAGENS + RESENHA */}
        <div className="bloco-flutuante flex-fill" style={{ minWidth: '300px' }}>
          <h5 className="text-primary fw-bold mb-3">Imagens do Equino</h5>
          <div className="d-flex justify-content-between flex-wrap mb-4">
            <img
              name="imagem1"
              src={equino.imagem1 || imgChanfro}
              className="imagem chanfro"
              alt="Chanfro"
              title="Clique aqui para adicionar a imagem do chanfro"
              onClick={() => handleImageClick('imagem1')}
            />

            <img
              name="imagem2"
              src={equino.imagem2 || imgLadoDireito}
              className="imagem"
              alt="Lado Direito"
              title="Clique aqui para adicionar a imagem do lado direito"
              onClick={() => handleImageClick('imagem2')}
            />

            <img
              name="imagem3"
              src={equino.imagem3 || imgLadoEsquerdo}
              className="imagem"
              alt="Lado Esquerdo"
              title="Clique aqui para adicionar a imagem do lado esquerdo"
              onClick={() => handleImageClick('imagem3')}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="resenha" className="form-label fw-bold">Descreva os aspectos do equino</label>
            <textarea
              className="form-control"
              id="resenha"
              name="resenha"
              rows="6"
              value={resenha}
              onChange={e => setResenha(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn btn-success" onClick={handleSubmit}>Salvar</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        contentLabel="Sucesso"
        style={{
          content: {
            top: '40%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'none',
            padding: 0,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9999
          }
        }}
      >
        <div className="modal-content-custom">
          <FaCheckCircle className="modal-success-icon" />
          <h4 className="modal-success-title">Resenha salva com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaResenhaEquinoForm;
