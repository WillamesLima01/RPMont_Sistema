import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import axios from '../../api';
import CabecalhoEquinoLista from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import ModalVermifugacao from '../../components/modal/ModalVermifugacao.jsx';
import ModalVacinacao from '../../components/modal/ModalVacinacao.jsx';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import { FaExclamationTriangle, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
import './Veterinaria.css';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// >>> PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const INTERVALOS = {
  vacinacaoDias: 365,
  vermifugacaoDias: 90,
  toaleteDias: 30,
  ferrageamentoDias: 45,
};

const SITUACOES = {
  APTO: 'APTO',
  APTO_COM_RESTRICAO: 'APTO_COM_RESTRICAO',
  BAIXADO: 'BAIXADO',
};

// Normalização (remove acentos) + lowercase
const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const formatarSituacao = (situacao) => {
  switch (situacao) {
    case SITUACOES.APTO:
      return 'Apto';
    case SITUACOES.APTO_COM_RESTRICAO:
      return 'Apto com restrição';
    case SITUACOES.BAIXADO:
      return 'Baixado';
    default:
      return situacao || '';
  }
};

/* ===== Helpers ===== */
const diasAte = (iso) => {
  if (!iso) return Number.POSITIVE_INFINITY;

  const somenteData = String(iso).slice(0, 10);
  const [ano, mes, dia] = somenteData.split('-').map(Number);

  if (!ano || !mes || !dia) return Number.POSITIVE_INFINITY;

  const MS_DIA = 24 * 60 * 60 * 1000;
  const alvoLocal = new Date(ano, mes - 1, dia);
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
  const hojeLocal = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  ).getTime();

  for (const item of lista || []) {
    const idBruto = getId(item);
    if (idBruto === null || idBruto === undefined || idBruto === '') continue;

    const id = String(idBruto);

    let iso = item.dataProximoProcedimento || item.proximaData;

    if (!iso && item.data && intervaloDias) {
      const baseStr = String(item.data).slice(0, 10);
      const [anoBase, mesBase, diaBase] = baseStr.split('-').map(Number);

      if (anoBase && mesBase && diaBase) {
        const base = new Date(anoBase, mesBase - 1, diaBase);
        const calc = new Date(base.getTime() + intervaloDias * 24 * 60 * 60 * 1000);
        const yyyy = calc.getFullYear();
        const mm = String(calc.getMonth() + 1).padStart(2, '0');
        const dd = String(calc.getDate()).padStart(2, '0');
        iso = `${yyyy}-${mm}-${dd}`;
      }
    }

    if (!iso) continue;

    const somenteData = String(iso).slice(0, 10);
    const [ano, mes, dia] = somenteData.split('-').map(Number);
    if (!ano || !mes || !dia) continue;

    const alvoLocal = new Date(ano, mes - 1, dia).getTime();
    if (alvoLocal < hojeLocal) continue;

    const atualISO = m.get(id);

    if (!atualISO) {
      m.set(id, somenteData);
    } else {
      const atualData = String(atualISO).slice(0, 10);
      const [anoAtual, mesAtual, diaAtual] = atualData.split('-').map(Number);
      const atualLocal = new Date(anoAtual, mesAtual - 1, diaAtual).getTime();

      if (alvoLocal < atualLocal) {
        m.set(id, somenteData);
      }
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
    case 'vacinacao':
      return '/vacinacao-equino';
    case 'vermifugacao':
      return '/vermifugacao-equino';
    case 'toalete':
      return `/veterinaria-toalete-equino/${equinoId}`;
    case 'ferrageamento':
      return `/veterinaria-ferrageamento-equino/${equinoId}`;
    default:
      return '#';
  }
};

const buildIndex = (e) => {
  const nome =
    e?.nome ??
    e?.name ??
    e?.nomeEquino ??
    '';

  const extra = [
    e?.registro,
    e?.raca,
    e?.pelagem,
    e?.local,
    e?.altura,
    e?.peso,
    formatarSituacao(e?.situacao),
    e?.sexo,
  ]
    .filter(Boolean)
    .join(' ');

  return norm(`${nome} ${extra}`);
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

  const [modalEscolhaSituacaoAberto, setModalEscolhaSituacaoAberto] = useState(false);
  const [situacaoEscolhida, setSituacaoEscolhida] = useState('');
  const [modalSucessoSituacaoAberto, setModalSucessoSituacaoAberto] = useState(false);

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
          axios.get('/equino'),
          axios.get('/vacinacoes'),
          axios.get('/vermifugacoes'),
          axios.get('/toaletes'),
          axios.get('/ferrageamentoEquino'),
        ]);

        let listaEquinos = (eq.status === 'fulfilled' ? eq.value.data : []) || [];

        const statusValidos = ['BAIXADO', 'APTO', 'todos'];
        const filtroFinal = statusValidos.includes(filtroQuery)
          ? filtroQuery
          : (
              location.pathname === '/veterinaria-Equinos-Baixados'
                ? 'BAIXADO'
                : location.pathname === '/veterinaria-List'
                ? 'APTO'
                : 'todos'
            );

        if (filtroFinal === 'BAIXADO') {
          listaEquinos = listaEquinos.filter((e) => e.situacao === SITUACOES.BAIXADO);
        } else if (filtroFinal === 'APTO') {
          listaEquinos = listaEquinos.filter(
            (e) =>
              e.situacao === SITUACOES.APTO ||
              e.situacao === SITUACOES.APTO_COM_RESTRICAO
          );
        }

        const vacinacoes = (vac.status === 'fulfilled' ? vac.value.data : []) || [];
        const vermifugacoes = (ver.status === 'fulfilled' ? ver.value.data : []) || [];
        const toaletes = (toa.status === 'fulfilled' ? toa.value.data : []) || [];
        const ferrageamentos = (fer.status === 'fulfilled' ? fer.value.data : []) || [];

        const proxVac = proximaPorEquino(
          vacinacoes,
          (v) => v.id_Eq ?? v.equinoId ?? v.idEquino,
          INTERVALOS.vacinacaoDias
        );

        const proxVer = proximaPorEquino(
          vermifugacoes,
          (v) => v.equinoId ?? v.idEquino ?? v.id_Eq,
          INTERVALOS.vermifugacaoDias
        );

        const proxToa = proximaPorEquino(
          toaletes,
          (t) => t.equinoId ?? t.idEquino ?? t.id_Eq,
          INTERVALOS.toaleteDias
        );

        const proxFer = proximaPorEquino(
          ferrageamentos,
          (f) => f.equinoId ?? f.idEquino ?? f.id_Eq,
          INTERVALOS.ferrageamentoDias
        );

        const comFlags = listaEquinos.map((eqItem) => {
          const id = String(eqItem.id);
          const pVac = proxVac.get(id) || null;
          const pVer = proxVer.get(id) || null;
          const pToa = proxToa.get(id) || null;
          const pFer = proxFer.get(id) || null;

          const fVac = estaNosProximos15Dias(pVac);
          const fVer = estaNosProximos15Dias(pVer);
          const fToa = estaNosProximos15Dias(pToa);
          const fFer = estaNosProximos15Dias(pFer);

          const diasVac = Number.isFinite(diasAte(pVac)) ? diasAte(pVac) : null;
          const diasVer = Number.isFinite(diasAte(pVer)) ? diasAte(pVer) : null;
          const diasToa = Number.isFinite(diasAte(pToa)) ? diasAte(pToa) : null;
          const diasFer = Number.isFinite(diasAte(pFer)) ? diasAte(pFer) : null;

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
            ...eqItem,
            _alertas: {
              vacinacao: fVac,
              vermifugacao: fVer,
              toalete: fToa,
              ferrageamento: fFer,
            },
            _diasRestantes: {
              vacinacao: diasVac,
              vermifugacao: diasVer,
              toalete: diasToa,
              ferrageamento: diasFer,
            },
            _proximoAlerta: melhor,
            _index: buildIndex(eqItem),
            _nameNorm: norm(eqItem?.nome || eqItem?.name || ''),
          };
        });

        setEquinos(comFlags);
        setEquinosFiltrados(comFlags);
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

  const aplicarFiltro = (termoRaw) => {
    const termoTrim = (termoRaw || '').trim();
    const termoNorm = norm(termoTrim);

    if (!termoTrim) {
      setEquinosFiltrados(equinos);
      return;
    }

    const byId = equinos.find((e) => String(e.id) === termoTrim);
    if (byId) {
      setEquinosFiltrados([byId]);
      return;
    }

    const exactNameMatches = equinos.filter((e) => e._nameNorm === termoNorm);
    if (exactNameMatches.length === 1) {
      setEquinosFiltrados(exactNameMatches);
      return;
    }

    const exactReg = equinos.filter((e) => (e.registro || '') === termoTrim);
    if (exactReg.length === 1) {
      setEquinosFiltrados(exactReg);
      return;
    }

    setEquinosFiltrados(
      equinos.filter((e) => (e._index || '').includes(termoNorm))
    );
  };

  const handleFiltrar = () => {
    setPaginaAtual(1);
    aplicarFiltro(filtroNome);
  };

  useEffect(() => {
    setPaginaAtual(1);
    aplicarFiltro(filtroNome);
  }, [equinos, filtroNome]); // eslint-disable-line

  const gerarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;
    const titulo = 'Relação de Equinos';
    const dataStr = dayjs().format('DD/MM/YYYY HH:mm');
    const infoFiltro = (filtroNome || '').trim() ? `Filtro: ${filtroNome}` : '';
    const totalStr = `Total: ${equinosFiltrados.length}`;

    doc.setFontSize(16);
    doc.text(titulo, margem, 30);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataStr}`, margem, 48);
    if (infoFiltro) doc.text(infoFiltro, margem, 64);
    doc.text(totalStr, margem, infoFiltro ? 80 : 64);

    const head = [[
      'Nome',
      'Raça',
      'Pelagem',
      'Registro',
      'Nascimento',
      'Situação',
      'Altura',
      'Peso',
      'Sexo',
      'Local',
    ]];

    const body = equinosFiltrados.map((e) => ([
      e.nome || '',
      e.raca || '',
      e.pelagem || '',
      e.registro || '',
      e.dataNascimento ? dayjs(e.dataNascimento).format('DD/MM/YYYY') : '',
      formatarSituacao(e.situacao),
      e.altura || '',
      e.peso || '',
      e.sexo || '',
      e.local || '',
    ]));

    autoTable(doc, {
      head,
      body,
      startY: infoFiltro ? 100 : 84,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: margem, right: margem },
      didDrawPage: (data) => {
        const pageNumber = doc.internal.getNumberOfPages();
        const str = `Página ${data.pageNumber} de ${pageNumber}`;
        doc.setFontSize(9);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(str, pageWidth - margem, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      },
    });

    doc.save(`relacao-equinos-${dayjs().format('YYYYMMDD-HHmm')}.pdf`);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setEquinosFiltrados(equinos);
    setPaginaAtual(1);
  };

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
      .delete(`/equino/${equinoSelecionado.id}`)
      .then(() => {
        const atualizados = equinos.filter((e) => e.id !== equinoSelecionado.id);
        setEquinos(atualizados);
        setEquinosFiltrados(atualizados);
        setModalExcluirAberto(false);
        setEquinoSelecionado(null);
      })
      .catch((error) => console.error('Erro ao excluir equino:', error));
  };

  const buscarDataInternet = async () => {
    try {
      const resposta = await fetch('https://worldtimeapi.org/api/ip');
      const dados = await resposta.json();
      const dataUTC = dados.utc_datetime;
      return new Date(dataUTC).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const confirmarBaixaEquino = (equino) => {
    if (equino.situacao === SITUACOES.BAIXADO) {
      setMensagemAviso(`Atenção! O equino "${equino.nome}" já está com situação Baixado.`);
      setModalAvisoAberto(true);
      return;
    }

    setEquinoSelecionado(equino);
    setSituacaoEscolhida('');
    setModalEscolhaSituacaoAberto(true);
  };

  const salvarSituacaoEquino = async () => {
    if (!equinoSelecionado) return;

    if (!situacaoEscolhida) {
      setMensagemAviso('Selecione se o equino ficará como BAIXADO ou APTO COM RESTRIÇÃO.');
      setModalAvisoAberto(true);
      return;
    }

    try {
      const dataAlteracao = await buscarDataInternet();

      if (situacaoEscolhida === SITUACOES.BAIXADO) {
        await axios.patch(`/equino/${equinoSelecionado.id}`, {
          situacao: SITUACOES.BAIXADO,
        });

        const novoRegistro = {
          id: uuidv4(),
          equino_id: String(equinoSelecionado.id),
          data_baixa: dataAlteracao,
          data_retorno: null,
        };

        await axios.post('/equinosBaixados', novoRegistro);
      } else if (situacaoEscolhida === SITUACOES.APTO_COM_RESTRICAO) {
        await axios.patch(`/equino/${equinoSelecionado.id}`, {
          situacao: SITUACOES.APTO_COM_RESTRICAO,
        });
      }

      const equinosAtualizados = equinos.map((e) =>
        e.id === equinoSelecionado.id
          ? {
              ...e,
              situacao: situacaoEscolhida,
              _index: buildIndex({ ...e, situacao: situacaoEscolhida }),
            }
          : e
      );

      setEquinos(equinosAtualizados);
      setEquinosFiltrados(equinosAtualizados);

      setModalEscolhaSituacaoAberto(false);
      setModalSucessoSituacaoAberto(true);
    } catch (error) {
      console.error('Erro ao alterar situação do equino:', error);
      setMensagemAviso('Erro ao alterar a situação do equino.');
      setModalAvisoAberto(true);
    }
  };

  const clsBtn = (base, alerta) => `${base} ${alerta ? 'btn-alerta' : ''}`;

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinoLista
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
        mostrarBotoesPDF={true}
        gerarPDF={gerarPDF}
        limparFiltros={limparFiltros}
      />

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Pelagem</th>
              <th>Registro</th>
              <th>Data Nascimento</th>
              <th>Status</th>
              <th>Altura</th>
              <th>Peso</th>
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
                    <td>{equino.nome}</td>
                    <td>{equino.raca}</td>
                    <td>{equino.pelagem}</td>
                    <td>{equino.registro}</td>
                    <td>{equino.dataNascimento}</td>
                    <td>{formatarSituacao(equino.situacao)}</td>
                    <td>{equino.altura}</td>
                    <td>{equino.peso}</td>
                    <td>{equino.sexo}</td>
                    <td>{equino.local}</td>
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
                          title={
                            alertas.toalete && Number.isFinite(equino._diasRestantes?.toalete)
                              ? `Toalete • vence em ${equino._diasRestantes.toalete}d`
                              : 'Toalete'
                          }
                          className={clsBtn('botao-toalete', alertas.toalete)}
                          icone="bi-scissors"
                        />
                      )}

                      {botoes.includes('ferrageamento') && (
                        <BotaoAcaoRows
                          to={`/veterinaria-ferrageamento-equino/${equino.id}`}
                          title={
                            alertas.ferrageamento && Number.isFinite(equino._diasRestantes?.ferrageamento)
                              ? `Ferrageamento • vence em ${equino._diasRestantes.ferrageamento}d`
                              : 'Ferrageamento'
                          }
                          className={clsBtn('botao-ferrageamento', alertas.ferrageamento)}
                          icone="bi-hammer"
                        />
                      )}

                      {botoes.includes('vermifugacao') && (
                        <BotaoAcaoRows
                          tipo="button"
                          onClick={() => abrirModalVermifugacao(equino)}
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
                          onClick={() => abrirModalVacinacao(equino)}
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
        titulo={`Tem certeza que deseja excluir o equino ${equinoSelecionado?.nome}?`}
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
        open={modalEscolhaSituacaoAberto}
        onClose={() => setModalEscolhaSituacaoAberto(false)}
        tipo="confirmacao"
        tamanho="medio"
        icone={<FaQuestionCircle size={50} color="#ff9800" />}
        titulo={`Alterar situação do equino ${equinoSelecionado?.nome}`}
        subtitulo="Selecione se o equino ficará BAIXADO ou APTO COM RESTRIÇÃO."
      >
        <div className="mt-4">
          <div className="mb-3">
            <label className="form-label fw-bold">Nova situação</label>
            <select
              className="form-select"
              value={situacaoEscolhida}
              onChange={(e) => setSituacaoEscolhida(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value={SITUACOES.BAIXADO}>Baixado</option>
              <option value={SITUACOES.APTO_COM_RESTRICAO}>Apto com restrição</option>
            </select>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setModalEscolhaSituacaoAberto(false)}
            >
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={salvarSituacaoEquino}>
              Confirmar
            </button>
          </div>
        </div>
      </ModalGenerico>

      <ModalGenerico
        open={modalSucessoSituacaoAberto}
        onClose={() => setModalSucessoSituacaoAberto(false)}
        tipo="mensagem"
        tamanho="pequeno"
        icone={<FaCheckCircle size={50} color="#4caf50" />}
        titulo={`Situação do equino ${equinoSelecionado?.nome} alterada para ${formatarSituacao(situacaoEscolhida)}!`}
        tempoDeDuracao={3000}
      />

      <ModalGenerico
        open={modalAvisoAberto}
        onClose={() => setModalAvisoAberto(false)}
        tipo="confirmacao"
        tamanho="medio"
        titulo="Atenção!"
        subtitulo={mensagemAviso || 'Verifique as informações do equino.'}
        icone={<i className="bi bi-sign-stop" style={{ fontSize: '100px', color: 'red' }}></i>}
      />
    </div>
  );
};

export default VeterinariaEquinoList;