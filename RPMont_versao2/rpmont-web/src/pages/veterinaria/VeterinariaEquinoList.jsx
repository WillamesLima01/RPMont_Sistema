import { useEffect, useState } from 'react';
import BotaoAcao from '../../components/botoes/BotaoAcaoRows.jsx';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import axios from '../../api';
import CabecalhoEquinoLista from '../../components/cabacalhoEquinoList/CabecalhoEquinos.jsx';

const VeterinariaEquinoList = ({ titulo = '' }) => {
  const [equinos, setEquinos] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [equinosFiltrados, setEquinosFiltrados] = useState([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const filtroQuery = searchParams.get('filtro'); // 'todos', 'Apto', 'Baixado'

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get('/equinos');
      let dados = res.data;

      const filtroFinal =
        filtroQuery ||
        (location.pathname === '/veterinaria-Equinos-Baixados'
          ? 'Baixado'
          : location.pathname === '/veterinaria-List'
          ? 'Apto'
          : 'todos');

      if (filtroFinal === 'Baixado') {
        dados = dados.filter(eq => eq.status === 'Baixado');
      } else if (filtroFinal === 'Apto') {
        dados = dados.filter(eq => eq.status === 'Ativo');
      } // 'todos' = não aplica filtro

      setEquinos(dados);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);
    }
  };

  fetchData();
}, [filtroQuery, location.pathname]);


  useEffect(() => {
    setEquinosFiltrados(equinos);
  }, [equinos]);

  const handleFiltrar = () => {
    if (filtroNome === '') {
      setEquinosFiltrados(equinos);
    } else {
      const filtrados = equinos.filter(eq =>
        eq.name.toLowerCase().includes(filtroNome.toLowerCase())
      );
      setEquinosFiltrados(filtrados);
    }
  };

  useEffect(() => {
    switch (location.pathname) {
      case '/veterinaria-List':
        setBotoes(['editar', 'excluir', 'baixar', 'escalas']);
        break;
      case '/veterinaria-Equinos-Baixados':
        setBotoes(['atendimento', 'retorno']);
        break;
      case '/manejo-sanitario-list':
        setBotoes(['toalete', 'ferrageamento', 'vermifugacao']);
        break;
      default:
        setBotoes([]);
    }
  }, [location.pathname]);

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinoLista
        equinos={equinos}
        filtroNome={filtroNome}
        setFiltroNome={setFiltroNome}
        onFiltrar={handleFiltrar}
      />

      <h2 className="mb-4">{titulo}</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Pelagem</th>
              <th>Número Registro</th>
              <th>Data Nascimento</th>
              <th>Status</th>
              <th>Sexo</th>
              <th>Unidade</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {equinosFiltrados.map((equino) => (
              <tr key={equino.id}>
                <td>{equino.name}</td>
                <td>{equino.raca}</td>
                <td>{equino.pelagem}</td>
                <td>{equino.numeroRegistro}</td>
                <td>{equino.dataNascimento}</td>
                <td>{equino.status}</td>
                <td>{equino.sexo}</td>
                <td>{equino.unidade}</td>
                <td className="text-end">
                  {botoes.includes('toalete') && (
                    <BotaoAcao
                      to={`/veterinaria-toalete-equino/${equino.id}`}
                      title="Toalete"
                      className="botao-toalete"
                      icone="bi-scissors"
                    />
                  )}
                  {botoes.includes('ferrageamento') && (
                    <BotaoAcao
                      to={`/ferrageamento-equino/${equino.id}`}
                      title="Ferrageamento"
                      className="botao-ferrageamento"
                      icone="bi-hammer"
                    />
                  )}
                  {botoes.includes('vermifugacao') && (
                    <BotaoAcao
                      to={`/vermifugacao-equino/${equino.id}`}
                      title="Vermifugação"
                      className="botao-vermifugacao"
                      icone="bi-bug"
                    />
                  )}
                  {botoes.includes('editar') && (
                    <BotaoAcao
                      to={`/editar-equino/${equino.id}`}
                      title="Editar"
                      className="botao-editar"
                      icone="bi-pencil"
                    />
                  )}
                  {botoes.includes('excluir') && (
                    <BotaoAcao
                      onClick={() => alert('Excluir Equino')}
                      title="Excluir"
                      className="botao-excluir"
                      icone="bi-trash"
                    />
                  )}
                  {botoes.includes('baixar') && (
                    <BotaoAcao
                      onClick={() => alert('Baixar Equino')}
                      title="Baixar"
                      className="botao-baixar"
                      icone="bi-arrow-down-circle"
                    />
                  )}
                  {botoes.includes('escalas') && (
                    <BotaoAcao
                      to={`/escalas-equino/${equino.id}`}
                      title="Escalas"
                      className="botao-escalas"
                      icone="bi bi-calendar-week"
                    />
                  )}
                  {botoes.includes('atendimento') && (
                    <BotaoAcao
                      to={`/atendimento-equino/${equino.id}`}
                      title="Atendimento"
                      className="botao-atendimento"
                      icone="bi-clipboard2-pulse"
                    />
                  )}
                  {botoes.includes('retorno') && (
                    <BotaoAcao
                      onClick={() => alert('Retornar às atividades')}
                      title="Retornar às atividades"
                      className="botao-retorno"
                      icone="bi-arrow-up-circle"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VeterinariaEquinoList;
