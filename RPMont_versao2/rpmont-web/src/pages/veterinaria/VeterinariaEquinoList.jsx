import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import ModalVermifugacao from '../../components/modal/ModalVermifugacao.jsx';
import ModalVacinacao from '../../components/modal/ModalVacinacao.jsx';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';

const VeterinariaEquinoList = ({ titulo = '' }) => {
  const [equinos, setEquinos] = useState([]);
  const [equinosFiltrados, setEquinosFiltrados] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [modalVermifugacaoAberto, setModalVermifugacaoAberto] = useState(false);
  const [modalVacinacaoAberto, setModalVacinacaoAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 15;
  const filtroQuery = useSearchParams()[0].get('filtro');
  const location = useLocation();

  const totalPaginas = Math.ceil(equinosFiltrados.length / itensPorPagina);

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

  useEffect(() => {
    switch (location.pathname) {
      case '/veterinaria-List':
        setBotoes(['editar', 'excluir', 'baixar', 'escalas', 'rd']);
        break;
      case '/veterinaria-Equinos-Baixados':
        setBotoes(['atendimento', 'retorno']);
        break;
      case '/manejo-sanitario-list':
        setBotoes(['toalete', 'ferrageamento', 'vermifugacao', 'vacinacao']);
        break;
      default:
        setBotoes([]);
    }
  }, [location.pathname]);

  const handleFiltrar = () => {
    setPaginaAtual(1); // Resetar paginação ao filtrar
    if (filtroNome === '') {
      setEquinosFiltrados(equinos);
    } else {
      const filtrados = equinos.filter(eq =>
        eq.name.toLowerCase().includes(filtroNome.toLowerCase())
      );
      setEquinosFiltrados(filtrados);
    }
  };

  const abrirModalVermifugacao = equino => {
    setEquinoSelecionado(equino);
    setModalVermifugacaoAberto(true);
  };

  const abrirModalVacinacao = equino => {
    setEquinoSelecionado(equino);
    setModalVacinacaoAberto(true);
  };

  const confirmarExclusao = equino => {
    setEquinoSelecionado(equino);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setEquinoSelecionado(null);
  };

  const excluirEquinoSelecionado = () => {
    if (!equinoSelecionado) return;

    axios.delete(`/equinos/${equinoSelecionado.id}`)
      .then(() => {
        const atualizados = equinos.filter(e => e.id !== equinoSelecionado.id);
        setEquinos(atualizados);
        setEquinosFiltrados(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => console.error("Erro ao excluir equino:", error));
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
        mostrarAdicionar={
          location.pathname === '/veterinaria-List' &&
          (!filtroQuery || filtroQuery === 'todos')
        }
        resultado={equinosFiltrados}
      />

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
            {equinosFiltrados
              .slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina)
              .map(equino => (
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
                      <BotaoAcaoRows onClick={() => confirmarExclusao(equino)} tipo="button" title="Excluir Equino" className="botao-excluir" icone="bi-trash" />
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
                    {botoes.includes('rd') && (
                      <BotaoAcaoRows to={`/veterinaria-resenha-equino/${equino.id}`} title="Resenha Descritiva" className="botao-rd" icone="fas fa-horse" />
                    )}
                    {botoes.includes('vacinacao') && (
                      <BotaoAcaoRows tipo="button" onClick={() => abrirModalVacinacao(equino)} title="Vacinação" className="botao-vacinacao" icone="fas fa-syringe" />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Paginação */}
        {equinosFiltrados.length > itensPorPagina && (
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(paginaAtual - 1)}
            >
              Anterior
            </button>

            <span>Página {paginaAtual} de {totalPaginas}</span>

            <button
              className="btn btn-outline-secondary ms-2"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual(paginaAtual + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalVermifugacao
        open={modalVermifugacaoAberto}
        onClose={() => setModalVermifugacaoAberto(false)}
        equino={equinoSelecionado}
      />

      <ModalVacinacao
        open={modalVacinacaoAberto}
        onClose={() => setModalVacinacaoAberto(false)}
        equino={equinoSelecionado}
      />

      <ModalGenerico
        open={modalExcluirAberto}
        onClose={cancelarExclusao}
        tipo="confirmacao"
        tamanho="medio"
        icone={<FaExclamationTriangle size={50} color="#ffc107" />}
        titulo={`Tem certeza que deseja excluir o equino ${equinoSelecionado?.name}?`}
      >
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
          <button className="btn btn-danger" onClick={excluirEquinoSelecionado}>Excluir</button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaEquinoList;
