import React from 'react';
import { Link } from 'react-router-dom';
import './BotaoAcaoRows.css';

const BotaoAcaoRows = ({
  to,
  state,
  onClick,
  tipo = 'link',
  className,
  texto,
  icone,
  title,
  style,           // ⬅️ novo: aceitar style
}) => {
  const conteudo = (
    <>
      {icone && <i className={`${icone} ms-1`}></i>}
      {texto && <span className="ms-1">{texto}</span>}
    </>
  );

  return tipo === 'button' ? (
    <button onClick={onClick} className={className} title={title} style={style}>
      {conteudo}
    </button>
  ) : (
    <Link to={to} state={state} className={className} title={title} style={style}>
      {conteudo}
    </Link>
  );
};

export default BotaoAcaoRows;
