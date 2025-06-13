import { useEffect, useState } from 'react';
import BotaoAcaoPrincipal from '../../components/botoes/BotaoAcaoPrincipal.jsx';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import ModalVermifugacao from '../../components/modal/ModalVermifugacao.jsx';

const VeterinariaEquinoList = ({ titulo = '' }) => {
  const [equinos, setEquinos] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [equinosFiltrados, setEquinosFiltrados] = useState([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [modalVermifugacaoAberto, setModalVermifugacaoAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);

  const filtroQuery = searchParams.get('filtro');

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
        }

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

  const abrirModalVermifugacao = (equino) => {
    console.log('Abrindo modal para:', equino);
    setEquinoSelecionado(equino);
    setModalVermifugacaoAberto(true);
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Lista de Equinos"
        equinos={equinos}
        filtroNome={filtroNome}
        setFiltroNome={setFiltroNome}
        onFiltrar={handleFiltrar}
        mostrarAdicionar={true}
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
                    <BotaoAcaoRows to={`/veterinaria-toalete-equino/${equino.id}`} title="Toalete" className="botao-toalete" icone="bi-scissors" />
                  )}
                  {botoes.includes('ferrageamento') && (
                    <BotaoAcaoRows to={`/veterinaria-ferrageamento-equino/${equino.id}`} title="Ferrageamento" className="botao-ferrageamento" icone="bi-hammer" />
                  )}
                  {botoes.includes('vermifugacao') && (
                    <BotaoAcaoRows tipo="button" onClick={() => abrirModalVermifugacao(equino)} title="Vermifugação" className="botao-vermifugacao" icone="bi-bug" />
                  )}
                  {botoes.includes('editar') && (
                    <BotaoAcaoRows to={`/edit-equino/${equino.id}`} title="Editar" className="botao-editar" icone="bi-pencil" />
                  )}
                  {botoes.includes('excluir') && (
                    <BotaoAcaoRows onClick={() => alert('Excluir Equino')} title="Excluir" className="botao-excluir" icone="bi-trash" />
                  )}
                  {botoes.includes('baixar') && (
                    <BotaoAcaoRows onClick={() => alert('Baixar Equino')} title="Baixar" className="botao-baixar" icone="bi-arrow-down-circle" />
                  )}
                  {botoes.includes('escalas') && (
                    <BotaoAcaoRows to={`/escala-equinos/${equino.id}`} title="Escalas" className="botao-escalas" icone="bi bi-calendar-week" />
                  )}
                  {botoes.includes('atendimento') && (
                    <BotaoAcaoRows to={`/atendimento-equino/${equino.id}`} title="Atendimento" className="botao-atendimento" icone="bi-clipboard2-pulse" />
                  )}
                  {botoes.includes('retorno') && (
                    <BotaoAcaoRows onClick={() => alert('Retornar às atividades')} title="Retornar às atividades" className="botao-retorno" icone="bi-arrow-up-circle" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalVermifugacao
        open={modalVermifugacaoAberto}
        onClose={() => setModalVermifugacaoAberto(false)}
        equino={equinoSelecionado}
      />
    </div>
  );
};

export default VeterinariaEquinoList;
