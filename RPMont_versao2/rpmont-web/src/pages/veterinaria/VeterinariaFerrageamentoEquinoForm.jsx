import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Veterinaria.css';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx'

Modal.setAppElement('#root');

const VeterinariaFerrageamentoEquinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    equinoId: id,
    procedimento: '',
    tipoFerradura: '',
    tipoCravo: '',
    tipoJustura: '',
    tipoFerrageamento: '',
    ferros: 4,
    cravos: 16,
    patas: [],
    tipoCurativo: '',
    ferroNovo: '',
    cravosUsados: 0,
    observacoes: ''
  });

  const patasOptions = ['Anterior Esquerda', 'Anterior Direita', 'Posterior Esquerda', 'Posterior Direita'];
  const tiposFerradura = ['Geral', 'Terapêutica', 'Ortopédica'];
  const tiposCravo = ['Comum', 'Rosca', 'Ortopédico'];
  const tiposJustura = ['Francesa', 'Inglesa', 'Oriental'];
  const tiposFerrageamento = ['A Quente', 'A Frio'];

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
    const { name, type, value, checked } = e.target;
    if (type === 'checkbox' && name === 'patas') {
      const novaLista = checked
        ? [...formData.patas, value]
        : formData.patas.filter(p => p !== value);
      setFormData(prev => ({ ...prev, patas: novaLista }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const dataAtual = new Date().toISOString();

  try {
    if (formData.procedimento === 'Ferrar') {
      await axios.post('/ferrageamentoEquino', {
        equinoId: id,
        tipoFerradura: formData.tipoFerradura,
        tipoCravo: formData.tipoCravo,
        tipoJustura: formData.tipoJustura,
        tipoFerrageamento: formData.tipoFerrageamento,
        ferros: Number(formData.ferros),
        cravos: Number(formData.cravos),
        observacoes: formData.observacoes,
        data: dataAtual
      });
    }

    if (formData.procedimento === 'Reprego') {
      await axios.post('/ferrageamentoRepregoEquino', {
        equinoId: id,
        patas: formData.patas,
        ferroNovo: formData.ferroNovo,
        cravosUsados: Number(formData.cravosUsados),
        observacoes: formData.observacoes,
        data: dataAtual
      });
    }

    if (formData.procedimento === 'Curativo') {
      await axios.post('/ferrageamentoCurativoEquino', {
        equinoId: id,
        tipoCurativo: formData.tipoCurativo,
        observacoes: formData.observacoes,
        data: dataAtual
      });
    }

    setModalAberto(true);
    setTimeout(() => {
      setModalAberto(false);
      navigate('/manejo-sanitario-list');
    }, 3000);

  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
  }
};

 return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">Ferrageamento Equino</h2>

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
        <h5 className="mb-4 text-primary">Procedimentos de Ferrageamento</h5>

        <div className="mb-3">
          <label className="form-label">Procedimento</label>
          <select
            name="procedimento"
            className="form-select"
            value={formData.procedimento}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            <option value="Ferrar">Ferrar</option>
            <option value="Reprego">Reprego</option>
            <option value="Curativo">Curativo</option>
          </select>
        </div>

        {formData.procedimento === 'Ferrar' && (
          <>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Qtd. de Ferros</label>
                <input type="number" className="form-control" name="ferros" value={formData.ferros} onChange={handleChange} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Qtd. de Cravos</label>
                <input type="number" className="form-control" name="cravos" value={formData.cravos} onChange={handleChange} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Ferradura</label>
                <select className="form-select" name="tipoFerradura" value={formData.tipoFerradura} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {tiposFerradura.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Justura</label>
                <select className="form-select" name="tipoJustura" value={formData.tipoJustura} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {tiposJustura.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Cravo</label>
                <select className="form-select" name="tipoCravo" value={formData.tipoCravo} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {tiposCravo.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Ferrageamento</label>
                <select className="form-select" name="tipoFerrageamento" value={formData.tipoFerrageamento} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {tiposFerrageamento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {formData.procedimento === 'Reprego' && (
          <>
            <div className="mb-3">
              <label className="form-label">Patas</label>
              <div className="row">
                {patasOptions.map((pata) => (
                  <div className="col-md-3" key={pata}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="patas"
                        value={pata}
                        checked={formData.patas.includes(pata)}
                        onChange={handleChange}
                        id={pata}
                        required={formData.patas.length === 0}
                      />
                      <label className="form-check-label" htmlFor={pata}>{pata}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Ferro Novo?</label>
                <select className="form-select" name="ferroNovo" value={formData.ferroNovo} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Qtd. de Cravos Usados</label>
                <input type="number" className="form-control" name="cravosUsados" value={formData.cravosUsados} onChange={handleChange} required />
              </div>
            </div>
          </>
        )}

        {formData.procedimento === 'Curativo' && (
          <div className="mb-3">
            <label className="form-label">Tipo de Curativo</label>
            <input type="text" className="form-control" name="tipoCurativo" value={formData.tipoCurativo} onChange={handleChange} required />
          </div>
        )}

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

      <ModalGenerico
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        tipo="mensagem"
        tamanho="medio"
        icone={<FaCheckCircle size={48} color="#4caf50" />}
        titulo="Dados salvos com sucesso!"
        subtitulo="O registro foi adicionado corretamente ao banco de dados."
      />        
    </div>
  );
};

export default VeterinariaFerrageamentoEquinoForm;
