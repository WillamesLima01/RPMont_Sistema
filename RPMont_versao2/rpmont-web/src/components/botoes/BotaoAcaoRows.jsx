import React from 'react';
import { Link } from 'react-router-dom';
import './BotaoAcaoRows.css'; // Aqui ficam as cores e tamanhos padronizados

const BotaoAcaoRows = ({ to, onClick, tipo = 'link', className, texto, icone, title }) => {
  const conteudo = (
    <>
      {icone && <i className={`bi ${icone}`}></i>}
      {texto && <span className="ms-1">{texto}</span>}
    </>
  );

  return tipo === 'button' ? (
    <button onClick={onClick} className={className} title={title}>
      {conteudo}
    </button>
  ) : (
    <Link to={to} className={className} title={title}>
      {conteudo}
    </Link>
  );
};

export default BotaoAcaoRows;
