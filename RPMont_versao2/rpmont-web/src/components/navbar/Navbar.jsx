import React from 'react'
import "./navbar.css";
import { Link, useLocation } from 'react-router-dom';
import iconNav from "../../assets/icon40.png";

const Navbar = () => {

    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    }

    return (
        <nav className='navbar fixed-top navbar-expand-lg bg-primary' data-bs-theme="dark">
            <div className='container-fluid'>
                <Link className="navbar-brand" to="/veterinaria">
                    <img className='navbar-logo' src={iconNav} alt="Logo" />
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/inicio" className={`${isActive('/inicio')} nav-link mt-1 me-4`} aria-current="page">Início</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/atendimentoList" className={`${isActive('/atendimentoList')} nav-link mt-1 me-4`} aria-current="page">Atendimentos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/veterinariaList" className={`${isActive('/veterinariaList')} nav-link mt-1 me-4`} aria-current="page">Lista de Equinos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/veterinaria-Equinos-Baixados" className={`${isActive('/veterinaria-Equinos-Baixados')} nav-link mt-1 me-4`} aria-current="page">Equinos Baixados</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/escala-equinosList" className={`${isActive('/escala-equinosList')} nav-link mt-1 me-4`} aria-current="page">Consultar Escala Equinos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/carga-horaria-equino" className={`${isActive('/carga-horaria-equino')} nav-link mt-1 me-4`} aria-current="page">Carga Horária Equinos</Link>
                        </li>     
                        <li className="nav-item dropdown">
                            <button
                                className={`nav-link dropdown-toggle mt-1 me-4 btn btn-link text-white ${isActive('/relatorio-servico') || isActive('/relatorio-equinos') || isActive('/consultar-relatorios') ? 'active' : ''}`}
                                id="navbarDropdownRelatorios"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Relatórios
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link to="/relatorio-servico" className="dropdown-item">
                                        Relatório de Serviço
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/relatorio-equinos" className="dropdown-item">
                                        Imprimir Relatório Equinos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/consultar-relatorios" className="dropdown-item">
                                        Consultar Relatórios de Serviços
                                    </Link>
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
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><Link className="dropdown-item" to="/">Desconectar</Link></li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
