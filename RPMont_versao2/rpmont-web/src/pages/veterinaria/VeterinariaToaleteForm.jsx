import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Veterinaria.css';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../components/navbar/Navbar.jsx';

Modal.setAppElement('#root');

const VeterinariaToaleteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    equinoId: id,
    tosa: false,
    banho: false,
    limpezaOuvidos: false,
    limpezaGenital: false,
    limpezaCascos: false,
    ripagemCrina: false,
    ripagemCola: false,
    escovacao: false,
    rasqueamento: false,
    observacoes: ''
  });

  useEffect(() => {
    const buscarEquino = async () => {
      try {
        const res = await axios.get('/equinos');
        const encontrado = res.data.find(e => String(e.id) === String(id));
        setEquino(encontrado);
      } catch (error) {
        console.error('Erro ao buscar equino:', error);
      }
    };

    buscarEquino();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/toalete', formData);
      setModalAberto(true);
      setTimeout(() => {
        setModalAberto(false);
        navigate('/manejo-sanitario-list');
      }, 2500);
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <Navbar />
      <h2 className="text-primary mb-4">Toalete Equino</h2>

      {equino && (
            <div className="alert alert-info">
                <h5 className="mb-3 text-primary d-flex align-items-center">
                <i className="bi bi-horse me-2"></i> Dados do Equino
                </h5>
                <div className="d-flex justify-content-between flex-wrap">
                <p className="mb-1 me-4"><strong>Nome:</strong> {equino.name}</p>
                <p className="mb-1 me-4"><strong>Raça:</strong> {equino.raca}</p>
                <p className="mb-1 me-4"><strong>Registro:</strong> {equino.numeroRegistro}</p>
                <p className="mb-1 me-4"><strong>Pelagem:</strong> {equino.pelagem}</p>
                <p className="mb-1 me-4"><strong>Sexo:</strong> {equino.sexo}</p>
                <p className="mb-1 me-4"><strong>Unidade:</strong> {equino.unidade}</p>
                </div>
            </div>
        )}

      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
        <h5 className="mb-4 text-primary">Procedimentos Realizados</h5>

        <div className="row">
          {[
            { label: 'Tosa', name: 'tosa' },
            { label: 'Banho', name: 'banho' },
            { label: 'Limpeza de Ouvidos', name: 'limpezaOuvidos' },
            { label: 'Limpeza Genital', name: 'limpezaGenital' },
            { label: 'Limpeza dos Cascos', name: 'limpezaCascos' },
            { label: 'Ripagem da Crina', name: 'ripagemCrina' },
            { label: 'Ripagem da Cola', name: 'ripagemCola' },
            { label: 'Escovação', name: 'escovacao' },
            { label: 'Rasqueamento', name: 'rasqueamento' },
          ].map((item) => (
            <div className="col-md-4 mb-3" key={item.name}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                  id={item.name}
                />
                <label className="form-check-label" htmlFor={item.name}>
                  {item.label}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label htmlFor="observacoes" className="form-label">Observações</label>
          <textarea
            className="form-control"
            id="observacoes"
            name="observacoes"
            rows="4"
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="btn btn-success">Salvar</button>
        </div>
      </form>

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
                <h4 className="modal-success-title">Dados salvos com sucesso!</h4>
            </div>
      </Modal>
    </div>
  );
};

export default VeterinariaToaleteForm;
