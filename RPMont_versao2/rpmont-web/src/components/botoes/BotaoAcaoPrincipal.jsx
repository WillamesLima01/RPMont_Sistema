import React from 'react';
import './BotaoAcaoPrincipal.css';

const BotaoAcaoPrincipal = ({ texto, onClick, icone, type = 'button', className = '', title }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`botao-principal ${className}`}
      title={title}
    >
      {icone && <i className={`bi ${icone} me-2`}></i>}
      {texto}
    </button>
  );
};

export default BotaoAcaoPrincipal;
