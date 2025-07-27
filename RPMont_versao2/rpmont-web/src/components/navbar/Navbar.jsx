import React, { useState } from 'react';
import './navbar.css';
import { Link, useLocation } from 'react-router-dom';
import iconNav from '../../assets/icon40.png';

const Navbar = () => {
  const location = useLocation();
  const [submenuFerrageamentoAberto, setSubmenuFerrageamentoAberto] = useState(false);

  const isActive = (paths) => {
    if (Array.isArray(paths)) {
      return paths.some((path) => location.pathname.startsWith(path)) ? 'active' : '';
    }
    return location.pathname.startsWith(paths) ? 'active' : '';
  };

  const toggleSubmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmenuFerrageamentoAberto((prev) => !prev);
  };

  const fecharMenu = () => {
    setSubmenuFerrageamentoAberto(false);
  };

  return (
    <nav className="navbar fixed-top navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/veterinaria">
          <img className="navbar-logo" src={iconNav} alt="Logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/inicio" className={`nav-link text-white mt-1 me-4 ${isActive('/inicio')}`}>
                Início
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/atendimento-List"
                className={`nav-link text-white mt-1 me-4 ${isActive('/atendimento-List')}`}
              >
                Atendimentos
              </Link>
            </li>

            <li className="nav-item dropdown">
              <button
                className={`nav-link dropdown-toggle mt-1 me-4 btn btn-link text-white ${isActive([
                  '/veterinaria-List',
                  '/veterinaria-Equinos-Baixados',
                ])}`}
                id="navbarDropdownEquinos"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Equinos
              </button>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownEquinos">
                <li><Link to="/veterinaria-List" className="dropdown-item">Equinos Aptos</Link></li>
                <li><Link to="/veterinaria-Equinos-Baixados" className="dropdown-item">Equinos Baixados</Link></li>
                <li><Link to="/veterinaria-List?filtro=todos" className="dropdown-item">Listar Todos os Equinos</Link></li>
              </ul>
            </li>

            <li className="nav-item">
              <Link
                to="/escala-equinos-List"
                className={`nav-link text-white mt-1 me-4 ${isActive('/escala-equinos-List')}`}
              >
                Consultar Escala Equinos
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/carga-horaria-equino"
                className={`nav-link text-white mt-1 me-4 ${isActive('/carga-horaria-equino')}`}
              >
                Carga Horária Equinos
              </Link>
            </li>

            <li className="nav-item dropdown">
              <button
                className={`nav-link dropdown-toggle mt-1 me-4 btn btn-link text-white ${
                  isActive('/relatorio-servico') ||
                  isActive('/relatorio-equinos') ||
                  isActive('/consultar-relatorios')
                    ? 'active'
                    : ''
                }`}
                id="navbarDropdownRelatorios"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Relatórios
              </button>
              <ul className="dropdown-menu">
                <li><Link to="/relatorio-servico" className="dropdown-item">Relatório de Serviço</Link></li>
                <li><Link to="/relatorio-equinos" className="dropdown-item">Imprimir Relatório Equinos</Link></li>
                <li><Link to="/consultar-relatorios" className="dropdown-item">Consultar Relatórios de Serviços</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <button
                className={`nav-link dropdown-toggle mt-1 me-4 btn btn-link text-white ${isActive([
                  '/manejo-sanitario-list',
                  '/ferrageamento-equino',
                  '/toalete-equino',
                  '/vermifugacao-equino',
                  '/vacinacao-equino'
                ])}`}
                id="navbarDropdownManejo"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Manejo Sanitário Equino
              </button>
              <ul className="dropdown-menu p-2" aria-labelledby="navbarDropdownManejo" style={{ minWidth: '260px' }}>
                <li className="dropdown-header text-muted fw-bold">Procedimentos a Realizar</li>
                <li><Link to="/manejo-sanitario-list" className="dropdown-item">Ferrageamento, Toalete, Vermifugação e Vacinação</Link></li>
                <li><hr className="dropdown-divider" /></li>

                <li className="dropdown-header text-muted fw-bold">Procedimentos Realizados</li>
                <li><Link to="/veterinaria-toalete-list" className="dropdown-item">Toalete</Link></li>
                <li><Link to="/vermifugacao-equino" className="dropdown-item">Vermifugação</Link></li>
                <li><Link to="/vacinacao-equino" className="dropdown-item">Vacinação</Link></li>

                {/* FERRAGEAMENTO COM SUBMENU CONTROLADO */}
                <li className="dropdown-submenu">
                  <button
                    onClick={toggleSubmenu}
                    className="dropdown-item d-flex justify-content-between align-items-center"
                  >
                    Ferrageamento
                    <i className={`fa fa-chevron-${submenuFerrageamentoAberto ? 'down' : 'right'} ms-2`}></i>
                  </button>
                  {submenuFerrageamentoAberto && (
                    <ul className="list-unstyled ps-3">
                      <li><Link to="/ferrageamento-equino" className="dropdown-item" onClick={fecharMenu}>Ferrar</Link></li>
                      <li><Link to="/reprego-equino" className="dropdown-item" onClick={fecharMenu}>Reprego</Link></li>
                      <li><Link to="/curativo-equino" className="dropdown-item" onClick={fecharMenu}>Curativo</Link></li>
                    </ul>
                  )}
                </li>
              </ul>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <div className="btn-group">
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  Willames Lima
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="#">Meu Perfil</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/">Desconectar</Link></li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
