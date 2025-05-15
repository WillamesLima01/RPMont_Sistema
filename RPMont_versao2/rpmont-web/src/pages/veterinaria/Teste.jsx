import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';
import './teste.css';

Modal.setAppElement('#root');

const Teste = () => {
  const [modalAberto, setModalAberto] = useState(false);
  const [tooltipAberto, setTooltipAberto] = useState(false);

  const abrirModal = () => {
    setModalAberto(true);
    setTimeout(() => {
      setModalAberto(false);
    }, 3000);
  };

  const toggleTooltip = () => {
    setTooltipAberto(!tooltipAberto);
  };

  return (
    <div style={{ padding: '100px', textAlign: 'center', position: 'relative' }}>
      <div className="titulo-container">
        <h2 className="titulo-principal">
          Adicionar Equinos
          <div className="tooltip-wrapper">
            <FaQuestionCircle className="tooltip-icon" onClick={toggleTooltip} />
            {tooltipAberto && (
              <div className="tooltip-mensagem">
                Aqui você pode cadastrar novos equinos no sistema de forma prática e rápida.
              </div>
            )}
          </div>
        </h2>
      </div>

      <button onClick={abrirModal} className="botao-abrir">
        Abrir Modal
      </button>

      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent">
          <FaCheckCircle className="icone-sucesso" />
          <h2 className="mensagem">Equino salvo com sucesso!</h2>
        </div>
      </Modal>
    </div>
  );
};

export default Teste;
