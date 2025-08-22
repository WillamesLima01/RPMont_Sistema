import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import ModalVermifugacao from '../../components/modal/ModalVermifugacao.jsx';
import ModalVacinacao from '../../components/modal/ModalVacinacao.jsx';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import { FaExclamationTriangle, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
import './Veterinaria.css';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const INTERVALOS = {
  vacinacaoDias: 365,
  vermifugacaoDias: 90,
  toaleteDias: 30,
  ferrageamentoDias: 45,
};

// Normalização compatível (remove acentos) + lowercase
const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* ===== Helpers ===== */
const diasAte = (iso) => {
  if (!iso) return Number.POSITIVE_INFINITY;
  const MS_DIA = 24 * 60 * 60 * 1000;
  const alvo = new Date(iso);
  if (isNaN(alvo)) return Number.POSITIVE_INFINITY;
  const alvoLocal = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  const hoje = new Date();
  const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.floor((alvoLocal.getTime() - hojeLocal.getTime()) / MS_DIA);
};

const estaNosProximos15Dias = (proximaISO) => {
  const dias = diasAte(proximaISO);
  return dias >= 0 && dias <= 15;
};

const proximaPorEquino = (lista, getId, intervaloDias) => {
  const m = new Map();
  const hoje = new Date();
  const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();

  for (const item of lista || []) {
    const id = String(getId(item));
    if (!id) continue;

    let iso = item.dataProximoProcedimento || item.proximaData;
    if (!iso && item.data && intervaloDias) {
      const base = new Date(item.data);
      if (!isNaN(base)) {
        const calc = new Date(base.getTime() + intervaloDias * 24 * 60 * 60 * 1000);
        iso = calc.toISOString();
      }
    }
    if (!iso) continue;

    const alvo = new Date(iso);
    if (isNaN(alvo)) continue;
    const alvoLocal = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate()).getTime();
    if (alvoLocal < hojeLocal) continue;

    const atualISO = m.get(id);
    if (!atualISO) {
      m.set(id, iso);
    } else {
      const atual = new Date(atualISO);
      const atualLocal = new Date(atual.getFullYear(), atual.getMonth(), atual.getDate()).getTime();
      if (alvoLocal < atualLocal) m.set(id, iso);
    }
  }
  return m;
};

const labelProced = (tipo) =>
  tipo === 'vacinacao' ? 'Vacinação' :
  tipo === 'vermifugacao' ? 'Vermifugação' :
  tipo === 'toalete' ? 'Toalete' :
  tipo === 'ferrageamento' ? 'Ferrageamento' : 'Procedimento';

const rotaProced = (tipo, equinoId) => {
  switch (tipo) {
    case 'vacinacao':     return '/vacinacao-equino';
    case 'vermifugacao':  return '/vermifugacao-equino';
    case 'toalete':       return `/veterinaria-toalete-equino/${equinoId}`;
    case 'ferrageamento': return `/veterinaria-ferrageamento-equino/${equinoId}`;
    default:              return '#';
  }
};

const VeterinariaEquinoList = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinosFiltrados, setEquinosFiltrados] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [modalVermifugacaoAberto, setModalVermifugacaoAberto] = useState(false);
  const [modalVacinacaoAberto, setModalVacinacaoAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalConfirmarBaixaAberto, setModalConfirmarBaixaAberto] = useState(false);
  const [modalSucessoBaixaAberto, setModalSucessoBaixaAberto] = useState(false);
  const [modalAvisoAberto, setModalAvisoAberto] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState('');

  const itensPorPagina = 15;
  const [searchParams] = useSearchParams();
  const filtroQuery = searchParams.get('filtro');
  const location = useLocation();
  const totalPaginas = Math.ceil(equinosFiltrados.length / itensPorPagina);

  useEffect(() => {
    (async () => {
      try {
        const [eq, vac, ver, toa, fer] = await Promise.allSettled([
          axios.get('/equinos'),
          axios.get('/vacinacoes'),
          axios.get('/vermifugacoes'),
          axios.get('/toaletes'),
          axios.get('/ferrageamentoEquino'),
        ]);

        let listaEquinos = (eq.status === 'fulfilled' ? eq.value.data : []) || [];

        const statusValidos = ['Baixado', 'Apto', 'todos'];
        const filtroFinal = statusValidos.includes(filtroQuery)
          ? filtroQuery
          : (location.pathname === '/veterinaria-Equinos-Baixados'
              ? 'Baixado'
              : location.pathname === '/veterinaria-List'
              ? 'Apto'
              : 'todos');

        if (filtroFinal === 'Baixado') {
          listaEquinos = listaEquinos.filter((e) => e.status === 'Baixado');
        } else if (filtroFinal === 'Apto') {
          listaEquinos = listaEquinos.filter((e) => e.status === 'Ativo');
        }

        const vacinacoes = (vac.status === 'fulfilled' ? vac.value.data : []) || [];
        const vermifugacoes = (ver.status === 'fulfilled' ? ver.value.data : []) || [];
        const toaletes = (toa.status === 'fulfilled' ? toa.value.data : []) || [];
        const ferrageamentos = (fer.status === 'fulfilled' ? fer.value.data : []) || [];

        const proxVac = proximaPorEquino(vacinacoes, (v) => v.id_Eq, INTERVALOS.vacinacaoDias);
        const proxVer = proximaPorEquino(vermifugacoes, (v) => v.equinoId, INTERVALOS.vermifugacaoDias);
        const proxToa = proximaPorEquino(toaletes, (t) => t.equinoId ?? t.idEquino ?? t.id_Eq, INTERVALOS.toaleteDias);
        const proxFer = proximaPorEquino(ferrageamentos, (f) => f.equinoId ?? f.idEquino ?? f.id_Eq, INTERVALOS.ferrageamentoDias);

        const comFlags = listaEquinos.map((eq) => {
          const id = String(eq.id);
          const pVac = proxVac.get(id) || null;
          const pVer = proxVer.get(id) || null;
          const pToa = proxToa.get(id) || null;
          const pFer = proxFer.get(id) || null;

          const fVac = estaNosProximos15Dias(pVac);
          const fVer = estaNosProximos15Dias(pVer);
          const fToa = estaNosProximos15Dias(pToa);
          const fFer = estaNosProximos15Dias(pFer);

          let melhor = null;
          const pick = (tipo, iso) => {
            if (!iso) return;
            const dRest = diasAte(iso);
            if (dRest < 0 || dRest > 15) return;
            if (!melhor || dRest < melhor.dias) {
              melhor = { tipo, proxima: iso, dias: dRest };
            }
          };
          pick('vacinacao', pVac);
          pick('vermifugacao', pVer);
          pick('toalete', pToa);
          pick('ferrageamento', pFer);

          return {
            ...eq,
            _alertas: {
              vacinacao: fVac,
              vermifugacao: fVer,
              toalete: fToa,
              ferrageamento: fFer,
            },
            _proximoAlerta: melhor,
          };
        });

        setEquinos(comFlags);
        setEquinosFiltrados(comFlags); // base inicial (sem termo)
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    })();
  }, [location.pathname, filtroQuery]);

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

  // Filtro por nome (aciona no botão "Filtrar")
  const handleFiltrar = () => {
    setPaginaAtual(1);
    const termo = norm(filtroNome.trim());
    if (!termo) {
      setEquinosFiltrados(equinos);
      return;
    }
    setEquinosFiltrados(
      equinos.filter((eq) => norm(eq.name).includes(termo))
    );
  };

  // Filtro "ao digitar" (live): quando equinos OU filtroNome mudarem
  useEffect(() => {
    const termo = norm(filtroNome.trim());
    if (!termo) {
      setEquinosFiltrados(equinos);
      return;
    }
    setEquinosFiltrados(
      equinos.filter((eq) => norm(eq.name).includes(termo))
    );
    setPaginaAtual(1);
  }, [equinos, filtroNome]);

  const abrirModalVermifugacao = (equino) => {
    setEquinoSelecionado(equino);
    setModalVermifugacaoAberto(true);
  };

  const abrirModalVacinacao = (equino) => {
    setEquinoSelecionado(equino);
    setModalVacinacaoAberto(true);
  };

  const confirmarExclusao = (equino) => {
    setEquinoSelecionado(equino);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setEquinoSelecionado(null);
  };

  const excluirEquinoSelecionado = () => {
    if (!equinoSelecionado) return;
    axios
      .delete(`/equinos/${equinoSelecionado.id}`)
      .then(() => {
        const atualizados = equinos.filter((e) => e.id !== equinoSelecionado.id);
        setEquinos(atualizados);
        setEquinosFiltrados(atualizados);
        setModalExcluirAberto(false);
      })
      .catch((error) => console.error('Erro ao excluir equino:', error));
  };

  const buscarDataInternet = async () => {
    try {
      const resposta = await axios.get('https://worldtimeapi.org/api/ip');
      const dataUTC = resposta.data.utc_datetime;
      return new Date(dataUTC).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const baixarEquino = async () => {
    try {
      const dataBaixaFinal = await buscarDataInternet();
      await axios.patch(`/equinos/${equinoSelecionado.id}`, { status: 'Baixado' });

      const novoRegistro = {
        id: uuidv4(),
        idEquino: String(equinoSelecionado.id),
        dataBaixa: dataBaixaFinal,
        dataRetorno: null,
      };
      await axios.post('/equinosBaixados', novoRegistro);

      const equinosAtualizados = equinos.map((e) =>
        e.id === equinoSelecionado.id ? { ...e, status: 'Baixado' } : e
      );
      setEquinos(equinosAtualizados);
      setEquinosFiltrados(equinosAtualizados);

      setModalConfirmarBaixaAberto(false);
      setModalSucessoBaixaAberto(true);
    } catch (error) {
      console.error('Erro ao baixar o equino:', error);
      alert('Erro ao baixar o equino.');
    }
  };

  const confirmarBaixaEquino = (equino) => {
    if (equino.status === 'Baixado') {
      setMensagemAviso(`Atenção! O equino "${equino.name}" já está com status Baixado.`);
      setModalAvisoAberto(true);
      return;
    }
    setEquinoSelecionado(equino);
    setModalConfirmarBaixaAberto(true);
  };

  const clsBtn = (base, alerta) => `${base} ${alerta ? 'btn-alerta' : ''}`;

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
              .map((equino) => {
                const alertas = equino._alertas || {};
                const proximo = equino._proximoAlerta;
                const mostrarCavalo = !!proximo;

                return (
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
                      {mostrarCavalo && (
                        <BotaoAcaoRows
                          to={rotaProced(proximo.tipo, equino.id)}
                          title={`Pendente em ${proximo.dias}d • ${labelProced(proximo.tipo)}`}
                          className="botao-alerta-cavalo"
                          icone="fas fa-horse"
                        />
                      )}

                      {botoes.includes('toalete') && (
                        <BotaoAcaoRows
                          to={`/veterinaria-toalete-equino/${equino.id}`}
                          title="Toalete"
                          className={clsBtn('botao-toalete', alertas.toalete)}
                          icone="bi-scissors"
                        />
                      )}
                      {botoes.includes('ferrageamento') && (
                        <BotaoAcaoRows
                          to={`/veterinaria-ferrageamento-equino/${equino.id}`}
                          title="Ferrageamento"
                          className={clsBtn('botao-ferrageamento', alertas.ferrageamento)}
                          icone="bi-hammer"
                        />
                      )}
                      {botoes.includes('vermifugacao') && (
                        <BotaoAcaoRows
                          tipo="button"
                          onClick={() => setModalVermifugacaoAberto(true) || setEquinoSelecionado(equino)}
                          title="Vermifugação"
                          className={clsBtn('botao-vermifugacao', alertas.vermifugacao)}
                          icone="bi-bug"
                        />
                      )}
                      {botoes.includes('editar') && (
                        <BotaoAcaoRows
                          to={`/edit-equino/${equino.id}`}
                          title="Editar"
                          className="botao-editar"
                          icone="bi-pencil"
                        />
                      )}
                      {botoes.includes('excluir') && (
                        <BotaoAcaoRows
                          onClick={() => confirmarExclusao(equino)}
                          tipo="button"
                          title="Excluir Equino"
                          className="botao-excluir"
                          icone="bi-trash"
                        />
                      )}
                      {botoes.includes('baixar') && (
                        <BotaoAcaoRows
                          onClick={() => confirmarBaixaEquino(equino)}
                          tipo="button"
                          title="Baixar"
                          className="botao-baixar"
                          icone="bi-arrow-down-circle"
                        />
                      )}
                      {botoes.includes('escalas') && (
                        <BotaoAcaoRows
                          to={`/escala-equinos/${equino.id}`}
                          title="Escalas"
                          className="botao-escalas"
                          icone="bi bi-calendar-week"
                        />
                      )}
                      {botoes.includes('atendimento') && (
                        <BotaoAcaoRows
                          to={`/atendimento-equino/${equino.id}`}
                          title="Atendimento"
                          className="botao-atendimento"
                          icone="bi-clipboard2-pulse"
                        />
                      )}
                      {botoes.includes('retorno') && (
                        <BotaoAcaoRows
                          onClick={() => alert('Retornar às atividades')}
                          title="Retornar às atividades"
                          className="botao-retorno"
                          icone="bi-arrow-up-circle"
                        />
                      )}
                      {botoes.includes('rd') && (
                        <BotaoAcaoRows
                          to={`/veterinaria-resenha-equino/${equino.id}`}
                          title="Resenha Descritiva"
                          className="botao-rd"
                          icone="fas fa-horse"
                        />
                      )}
                      {botoes.includes('vacinacao') && (
                        <BotaoAcaoRows
                          tipo="button"
                          onClick={() => setModalVacinacaoAberto(true) || setEquinoSelecionado(equino)}
                          title="Vacinação"
                          className={clsBtn('botao-vacinacao', alertas.vacinacao)}
                          icone="fas fa-syringe"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {equinosFiltrados.length > itensPorPagina && (
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(paginaAtual - 1)}
            >
              Anterior
            </button>

            <span> Página {paginaAtual} de {totalPaginas} </span>

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
          <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={excluirEquinoSelecionado}>
            Excluir
          </button>
        </div>
      </ModalGenerico>

      <ModalGenerico
        open={modalConfirmarBaixaAberto}
        onClose={() => setModalConfirmarBaixaAberto(false)}
        tipo="confirmacao"
        tamanho="medio"
        icone={<FaQuestionCircle size={50} color="#ff9800" />}
        titulo={`Deseja realmente baixar o equino ${equinoSelecionado?.name}?`}
      >
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-outline-secondary" onClick={() => setModalConfirmarBaixaAberto(false)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={baixarEquino}>
            Confirmar Baixa
          </button>
        </div>
      </ModalGenerico>

      <ModalGenerico
        open={modalSucessoBaixaAberto}
        onClose={() => setModalSucessoBaixaAberto(false)}
        tipo="mensagem"
        tamanho="pequeno"
        icone={<FaCheckCircle size={50} color="#4caf50" />}
        titulo={`Equino ${equinoSelecionado?.name} baixado com sucesso!`}
        tempoDeDuracao={3000}
      />

      <ModalGenerico
        open={modalAvisoAberto}
        onClose={() => setModalAvisoAberto(false)}
        tipo="confirmacao"
        tamanho="medio"
        titulo="Atenção!"
        subtitulo={mensagemAviso || 'Equino encontra-se com status Baixado.'}
        icone={<i className="bi bi-sign-stop" style={{ fontSize: '100px', color: 'red' }}></i>}
      />
    </div>
  );
};

export default VeterinariaEquinoList;
