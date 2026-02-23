// src/components/modal/ModalGraficoCargaHorariaEquinoAnualUnico.jsx
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import './ModalGraficoCargaHorariaEquinoAnualUnico.css';

Modal.setAppElement('#root');

const ModalGraficoCargaHorariaEquinoAnualUnico = ({
  isOpen,
  onClose,
  anos = [],
  equinos = [],
  defaultAno = '',
  defaultEquinoId = '',
  onConfirm, // (anoSelecionado, equinoId) => void
}) => {
  const [anoSel, setAnoSel] = useState(defaultAno || '');
  const [eqSel, setEqSel] = useState(defaultEquinoId || '');

  useEffect(() => {
    setAnoSel(defaultAno || '');
    setEqSel(defaultEquinoId || '');
  }, [defaultAno, defaultEquinoId, isOpen]);

  const handleOk = () => {
    if (!anoSel || !eqSel) return;
    onConfirm?.(anoSel, eqSel);
    onClose?.();
  };

  // Enter confirma quando ambos selecionados
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && anoSel && eqSel) {
      e.preventDefault();
      handleOk();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="equino-overlay"
      className="equino-modal"
      closeTimeoutMS={200}
    >
      <div className="modalContent" onKeyDown={onKeyDown}>
        <h4 className="mb-1">Ver Carga Horária de um Equino (Anual)</h4>
        <small className="text-muted">Escolha o ano e o equino para gerar o gráfico.</small>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label">Ano</label>
            <select
              className="form-select"
              value={anoSel}
              onChange={(e) => setAnoSel(e.target.value)}
            >
              <option value="">Selecione o ano...</option>
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Equino</label>
            <select
              className="form-select"
              value={eqSel}
              onChange={(e) => setEqSel(e.target.value)}
            >
              <option value="">Selecione o equino...</option>
              {equinos.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="footer">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOk}
            disabled={!anoSel || !eqSel}
            title={!anoSel || !eqSel ? 'Selecione o ano e o equino' : 'Gerar gráfico'}
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalGraficoCargaHorariaEquinoAnualUnico;
