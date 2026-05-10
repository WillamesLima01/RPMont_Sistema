import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';
import {
  FaCheckCircle,
  FaStethoscope,
  FaHistory,
  FaPlus,
  FaTrash,
  FaPills
} from 'react-icons/fa';

Modal.setAppElement('#root');

const formatarData = (data) => {
  if (!data) return '-';

  try {
    const dt = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dt.getTime())) return data;

    return dt.toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

const normalizar = (texto) =>
  (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const criarLinhaMedicacao = () => ({
  idLocal: Date.now() + Math.random(),
  origem: 'ESTOQUE',
  medicamentoId: '',
  nomeMedicamentoExterno: '',
  doseAplicada: '',
  unidade: '',
  observacao: ''
});

const VeterinariaAtendimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [consulta, setConsulta] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Neste fluxo, o ID da URL é o ID do equino.
  // A tela abre para cadastrar um novo atendimento.
  const [modoEdicao, setModoEdicao] = useState(false);
  const [equinoId, setEquinoId] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState('');

  const [peso, setPeso] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [unidade, setUnidade] = useState('mg');

  const [enfTexto, setEnfTexto] = useState('');
  const [sugestoesEnf, setSugestoesEnf] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const caixaEnfRef = useRef(null);
  const blurTimer = useRef(null);

  const [medicamentos, setMedicamentos] = useState([]);
  const [entradasMedicamento, setEntradasMedicamento] = useState([]);
  const [saidasMedicamento, setSaidasMedicamento] = useState([]);
  const [medicacoesAtendimento, setMedicacoesAtendimento] = useState([]);
  const [medicacoesUtilizadas, setMedicacoesUtilizadas] = useState([criarLinhaMedicacao()]);

  const [historico, setHistorico] = useState({
    atendimentos: [],
    vacinacoes: [],
    vermifugacoes: [],
    toaletes: [],
    ferrageamentos: [],
    medicacoes: []
  });

  useEffect(() => {
    const carregarTela = async () => {
      try {
        setCarregando(true);
        setErroTela('');

        const equinoIdEncontrado = id;

        setModoEdicao(false);
        setEquinoId(equinoIdEncontrado);

        const [
          equinoResponse,
          atendimentosResponse,
          medicamentoResponse,
          entradaMedicamentoResponse,
          saidaMedicamentoResponse,
          medicacaoAtendimentoResponse,
          vacinacaoResponse,
          vermifugacaoResponse,
          toaleteResponse,
          ferrageamentoEquinoResponse,
          ferrageamentoRepregoEquinoResponse,
          ferrageamentoCurativoEquinoResponse
        ] = await Promise.allSettled([
          axios.get(`/equino/${equinoIdEncontrado}`),

          axios.get('/atendimentos/filtrar', {
            params: {
              equinoId: equinoIdEncontrado
            }
          }),

          axios.get('/medicamentos'),
          axios.get('/entradas_medicamento'),
          axios.get('/saidas_medicamento'),
          axios.get('/medicacoes_atendimento'),
          axios.get('/vacinacao'),
          axios.get('/vermifugacao'),
          axios.get('/toalete'),
          axios.get('/ferrageamento_equino'),
          axios.get('/ferrageamento_reprego_equino'),
          axios.get('/ferrageamento_curativo_equino')
        ]);

        if (equinoResponse.status !== 'fulfilled') {
          throw new Error('Erro ao buscar os dados do equino.');
        }

        const equinoData = equinoResponse.value.data;
        setEquino(equinoData);

        const atendimentos = atendimentosResponse.status === 'fulfilled'
          ? (Array.isArray(atendimentosResponse.value.data) ? atendimentosResponse.value.data : [])
          : [];

        const medicamentosData = medicamentoResponse.status === 'fulfilled'
          ? (Array.isArray(medicamentoResponse.value.data) ? medicamentoResponse.value.data : [])
          : [];

        const entradasData = entradaMedicamentoResponse.status === 'fulfilled'
          ? (Array.isArray(entradaMedicamentoResponse.value.data) ? entradaMedicamentoResponse.value.data : [])
          : [];

        const saidasData = saidaMedicamentoResponse.status === 'fulfilled'
          ? (Array.isArray(saidaMedicamentoResponse.value.data) ? saidaMedicamentoResponse.value.data : [])
          : [];

        const medicacoesData = medicacaoAtendimentoResponse.status === 'fulfilled'
          ? (Array.isArray(medicacaoAtendimentoResponse.value.data) ? medicacaoAtendimentoResponse.value.data : [])
          : [];

        const vacinacoes = vacinacaoResponse.status === 'fulfilled'
          ? (Array.isArray(vacinacaoResponse.value.data) ? vacinacaoResponse.value.data : [])
          : [];

        const vermifugacoes = vermifugacaoResponse.status === 'fulfilled'
          ? (Array.isArray(vermifugacaoResponse.value.data) ? vermifugacaoResponse.value.data : [])
          : [];

        const toaletes = toaleteResponse.status === 'fulfilled'
          ? (Array.isArray(toaleteResponse.value.data) ? toaleteResponse.value.data : [])
          : [];

        const ferrageamentos = [
          ...(ferrageamentoEquinoResponse.status === 'fulfilled' && Array.isArray(ferrageamentoEquinoResponse.value.data)
            ? ferrageamentoEquinoResponse.value.data.map((item) => ({ ...item, tipoFerrageamento: 'Ferrar' }))
            : []),

          ...(ferrageamentoRepregoEquinoResponse.status === 'fulfilled' && Array.isArray(ferrageamentoRepregoEquinoResponse.value.data)
            ? ferrageamentoRepregoEquinoResponse.value.data.map((item) => ({ ...item, tipoFerrageamento: 'Reprego' }))
            : []),

          ...(ferrageamentoCurativoEquinoResponse.status === 'fulfilled' && Array.isArray(ferrageamentoCurativoEquinoResponse.value.data)
            ? ferrageamentoCurativoEquinoResponse.value.data.map((item) => ({ ...item, tipoFerrageamento: 'Curativo' }))
            : [])
        ];

        setMedicamentos(medicamentosData.filter((m) => m.ativo !== false));
        setEntradasMedicamento(entradasData);
        setSaidasMedicamento(saidasData);
        setMedicacoesAtendimento(medicacoesData);

        const equinoIdStr = String(equinoIdEncontrado);

        const atendimentosDoEquino = atendimentos
          .filter((a) => String(a.equinoId) === equinoIdStr || String(a.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || b.dataAtendimento || 0) - new Date(a.data || a.dataAtendimento || 0));

        const vacinacoesDoEquino = vacinacoes
          .filter((item) => String(item.equinoId) === equinoIdStr || String(item.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || b.dataVacinacao || 0) - new Date(a.data || a.dataVacinacao || 0));

        const vermifugacoesDoEquino = vermifugacoes
          .filter((item) => String(item.equinoId) === equinoIdStr || String(item.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || b.dataVermifugacao || 0) - new Date(a.data || a.dataVermifugacao || 0));

        const toaletesDoEquino = toaletes
          .filter((item) => String(item.equinoId) === equinoIdStr || String(item.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || b.dataToalete || 0) - new Date(a.data || a.dataToalete || 0));

        const ferrageamentosDoEquino = ferrageamentos
          .filter((item) => String(item.equinoId) === equinoIdStr || String(item.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || b.dataFerrageamento || 0) - new Date(a.data || a.dataFerrageamento || 0));

        const medicacoesDoEquino = medicacoesData
          .filter((item) => String(item.equinoId) === equinoIdStr || String(item.equino?.id) === equinoIdStr)
          .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

        setHistorico({
          atendimentos: atendimentosDoEquino,
          vacinacoes: vacinacoesDoEquino,
          vermifugacoes: vermifugacoesDoEquino,
          toaletes: toaletesDoEquino,
          ferrageamentos: ferrageamentosDoEquino,
          medicacoes: medicacoesDoEquino
        });

        const nomesUnicos = Array.from(
          new Set(
            atendimentos
              .map((x) => (x.enfermidade || '').trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setSugestoesEnf(nomesUnicos);
      } catch (error) {
        console.error(error);
        setErroTela('Erro ao carregar os dados do atendimento.');
      } finally {
        setCarregando(false);
      }
    };

    carregarTela();
  }, [id]);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (caixaEnfRef.current && !caixaEnfRef.current.contains(e.target)) {
        setMostrarSugestoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);

    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const calcularEstoqueAtual = (medicamentoId) => {
    const totalEntradas = entradasMedicamento
      .filter((entrada) => String(entrada.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    const totalSaidas = saidasMedicamento
      .filter((saida) => String(saida.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    return totalEntradas - totalSaidas;
  };

  const opcoesMedicamentos = useMemo(() => {
    return medicamentos.map((med) => ({
      ...med,
      estoqueAtual: calcularEstoqueAtual(med.id)
    }));
  }, [medicamentos, entradasMedicamento, saidasMedicamento]);

  const sugestoesFiltradas = enfTexto
    ? sugestoesEnf.filter((n) => normalizar(n).includes(normalizar(enfTexto)))
    : sugestoesEnf;

  const calcularDoseTotal = () => {
    const p = parseFloat(peso);
    const d = parseFloat(dosagem);

    if (!p || !d) return '--';

    return `${(p * d).toFixed(2)} ${unidade}`;
  };

  const adicionarMedicacaoLinha = () => {
    setMedicacoesUtilizadas((prev) => [...prev, criarLinhaMedicacao()]);
  };

  const removerMedicacaoLinha = (idLocal) => {
    setMedicacoesUtilizadas((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.idLocal !== idLocal)
    );
  };

  const alterarMedicacaoLinha = (idLocal, campo, valor) => {
    setMedicacoesUtilizadas((prev) =>
      prev.map((item) => {
        if (item.idLocal !== idLocal) return item;

        const atualizado = {
          ...item,
          [campo]: valor
        };

        if (campo === 'origem') {
          if (valor === 'EXTERNO') {
            atualizado.medicamentoId = '';
            atualizado.nomeMedicamentoExterno = '';
            atualizado.unidade = '';
          } else {
            atualizado.nomeMedicamentoExterno = '';
          }
        }

        if (campo === 'medicamentoId') {
          const med = opcoesMedicamentos.find((m) => String(m.id) === String(valor));
          atualizado.unidade = med?.unidadeBase || '';
        }

        return atualizado;
      })
    );
  };

  const validarFormulario = () => {
    const erros = [];

    if (!equinoId) erros.push('Equino não identificado.');
    if (!enfTexto.trim()) erros.push('A enfermidade é obrigatória.');
    if (!consulta.trim()) erros.push('O texto do atendimento é obrigatório.');

    const medicacoesPreenchidas = medicacoesUtilizadas.filter(
      (m) =>
        m.medicamentoId ||
        m.nomeMedicamentoExterno ||
        m.doseAplicada ||
        m.observacao
    );

    medicacoesPreenchidas.forEach((item, index) => {
      const dose = Number(item.doseAplicada || 0);
      const linha = index + 1;

      if (!item.origem) {
        erros.push(`Selecione a origem da medicação na linha ${linha}.`);
        return;
      }

      if (item.origem === 'ESTOQUE') {
        const med = opcoesMedicamentos.find((m) => String(m.id) === String(item.medicamentoId));

        if (!item.medicamentoId) {
          erros.push(`Selecione o medicamento do estoque na linha ${linha}.`);
          return;
        }

        if (Number.isNaN(dose) || dose <= 0) {
          erros.push(`Informe uma dose válida na linha ${linha}.`);
          return;
        }

        if (med && dose > Number(med.estoqueAtual || 0)) {
          erros.push(
            `A dose informada para ${med.nome} é maior que o estoque disponível (${med.estoqueAtual} ${med.unidadeBase || ''}).`
          );
        }
      }

      if (item.origem === 'EXTERNO') {
        const nomeExterno = String(item.nomeMedicamentoExterno || '').trim();
        const unidadeInformada = String(item.unidade || '').trim();

        if (!nomeExterno) {
          erros.push(`Informe o nome do medicamento externo na linha ${linha}.`);
          return;
        }

        if (Number.isNaN(dose) || dose <= 0) {
          erros.push(`Informe uma dose válida na linha ${linha}.`);
          return;
        }

        if (!unidadeInformada) {
          erros.push(`Informe a unidade do medicamento externo na linha ${linha}.`);
        }
      }
    });

    return erros;
  };

  const salvarConsulta = async (e) => {
    e.preventDefault();

    const erros = validarFormulario();

    if (erros.length > 0) {
      alert(erros.join('\n'));
      return;
    }

    const payloadAtendimento = {
      equinoId: Number(equinoId),
      textoConsulta: consulta,
      enfermidade: enfTexto.trim(),
      data: new Date().toISOString().split('T')[0]
    };

    try {
      let atendimentoSalvo;

      if (modoEdicao) {
        await axios.put(`/atendimentos/${id}`, payloadAtendimento);

        atendimentoSalvo = {
          id,
          ...payloadAtendimento
        };

        const medicacoesRelacionadas = medicacoesAtendimento.filter(
          (m) => String(m.atendimentoId) === String(id)
        );

        await Promise.all(
          medicacoesRelacionadas.map((m) => axios.delete(`/medicacoes_atendimento/${m.id}`))
        );

        const saidasRelacionadas = saidasMedicamento.filter(
          (s) => String(s.atendimentoId) === String(id)
        );

        await Promise.all(
          saidasRelacionadas.map((s) => axios.delete(`/saidas_medicamento/${s.id}`))
        );
      } else {
        const response = await axios.post('/atendimentos', payloadAtendimento);
        atendimentoSalvo = response.data;
      }

      const medicacoesParaSalvar = medicacoesUtilizadas.filter((m) => {
        if (m.origem === 'ESTOQUE') {
          return m.medicamentoId && Number(m.doseAplicada) > 0;
        }

        if (m.origem === 'EXTERNO') {
          return m.nomeMedicamentoExterno.trim() && Number(m.doseAplicada) > 0;
        }

        return false;
      });

      if (medicacoesParaSalvar.length > 0) {
        await Promise.all(
          medicacoesParaSalvar.map(async (item) => {
            if (item.origem === 'ESTOQUE') {
              const med = opcoesMedicamentos.find(
                (m) => String(m.id) === String(item.medicamentoId)
              );

              const payloadMedicacao = {
                atendimentoId: atendimentoSalvo.id,
                equinoId: Number(equinoId),
                origem: 'ESTOQUE',
                medicamentoId: med?.id || null,
                nomeMedicamento: med?.nome || '',
                doseAplicada: Number(item.doseAplicada),
                unidade: med?.unidadeBase || item.unidade || '',
                observacao: item.observacao?.trim() || '',
                data: new Date().toISOString().split('T')[0]
              };

              const payloadSaida = {
                medicamentoId: med?.id,
                medicamentoNome: med?.nome || '',
                fabricante: med?.fabricante || '',
                tipoSaida: 'ATENDIMENTO',
                quantidadeInformada: Number(item.doseAplicada),
                unidadeInformada: med?.unidadeBase || item.unidade || '',
                quantidadeBase: Number(item.doseAplicada),
                unidadeBase: med?.unidadeBase || item.unidade || '',
                dataSaida: new Date().toISOString().split('T')[0],
                observacao: item.observacao?.trim() || `Uso em atendimento do equino ${equino?.nome || ''}`,
                equinoId: Number(equinoId),
                nomeEquino: equino?.nome || '',
                atendimentoId: atendimentoSalvo.id
              };

              await axios.post('/medicacoes_atendimento', payloadMedicacao);
              await axios.post('/saidas_medicamento', payloadSaida);
            }

            if (item.origem === 'EXTERNO') {
              const payloadMedicacaoExterna = {
                atendimentoId: atendimentoSalvo.id,
                equinoId: Number(equinoId),
                origem: 'EXTERNO',
                medicamentoId: null,
                nomeMedicamento: String(item.nomeMedicamentoExterno || '').trim(),
                doseAplicada: Number(item.doseAplicada),
                unidade: String(item.unidade || '').trim(),
                observacao: item.observacao?.trim() || 'Medicamento externo ao estoque',
                data: new Date().toISOString().split('T')[0]
              };

              await axios.post('/medicacoes_atendimento', payloadMedicacaoExterna);
            }
          })
        );
      }

      setModalAberto(true);

      setTimeout(() => {
        setModalAberto(false);

        navigate('/atendimento-List', {
          state: {
            irParaUltimaPagina: true,
            atendimentoSalvoId: atendimentoSalvo.id
          }
        });
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      alert('Erro ao salvar atendimento e/ou medicações.');
    }
  };

  const cancelar = () => navigate('/atendimento-List');

  if (carregando) {
    return (
      <>
        <Navbar />

        <div className="container mt-5">
          <div className="alert alert-info mt-5">Carregando atendimento...</div>
        </div>
      </>
    );
  }

  if (erroTela || !equino) {
    return (
      <>
        <Navbar />

        <div className="container mt-5">
          <div className="alert alert-danger mt-5">
            {erroTela || 'Não foi possível carregar os dados do equino.'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container-fluid mt-5 px-3 px-lg-4">
        <div className="row justify-content-center">
          <div className="col-12 mt-5">
            <div className="row g-4 align-items-start">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <FaStethoscope />

                      <h2 className="titulo-principal mb-0">
                        {modoEdicao ? 'Editar Consulta' : 'Atendimento Veterinário'}
                      </h2>
                    </div>

                    <div className="row row-cols-1 row-cols-md-3 g-3 mb-1">
                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Nome:</strong>
                          <p>{equino.nome}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Raça:</strong>
                          <p>{equino.raca}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Pelagem:</strong>
                          <p>{equino.pelagem}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Registro:</strong>
                          <p>{equino.registro}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Nascimento:</strong>
                          <p>{equino.dataNascimento}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Sexo:</strong>
                          <p>{equino.sexo}</p>
                        </div>
                      </div>

                      <div className="col">
                        <div className="info-box bg1">
                          <strong>Status:</strong>
                          <p>{equino.situacao}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={salvarConsulta}>
                  <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Calculadora de Dosagem</h5>

                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label">Peso do Equino (kg)</label>

                          <input
                            type="number"
                            className="form-control"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            placeholder="Ex: 450"
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Dosagem (por kg)</label>

                          <input
                            type="number"
                            className="form-control"
                            value={dosagem}
                            onChange={(e) => setDosagem(e.target.value)}
                            placeholder="Ex: 0.5"
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Unidade</label>

                          <select
                            className="form-select"
                            value={unidade}
                            onChange={(e) => setUnidade(e.target.value)}
                          >
                            <option value="mg">mg</option>
                            <option value="g">g</option>
                            <option value="mL">mL</option>
                            <option value="L">L</option>
                          </select>
                        </div>

                        <div className="col-md-4 d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Dose total:</strong> {calcularDoseTotal()}
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setPeso('');
                              setDosagem('');
                              setUnidade('mg');
                            }}
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Dados Clínicos</h5>

                      <div className="mb-3 position-relative" ref={caixaEnfRef} style={{ zIndex: 10 }}>
                        <label className="form-label fw-bold">Enfermidade</label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite ou selecione a enfermidade"
                          value={enfTexto}
                          onChange={(e) => {
                            setEnfTexto(e.target.value);
                            setMostrarSugestoes(true);
                          }}
                          onFocus={() => setMostrarSugestoes(true)}
                          onBlur={() => {
                            blurTimer.current = setTimeout(() => setMostrarSugestoes(false), 150);
                          }}
                          required
                        />

                        {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
                          <ul
                            className="list-group shadow-sm"
                            style={{
                              position: 'absolute',
                              width: '100%',
                              maxHeight: 220,
                              overflowY: 'auto',
                              marginTop: 4
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {sugestoesFiltradas.map((n) => (
                              <li
                                key={n}
                                className="list-group-item list-group-item-action"
                                role="button"
                                onClick={() => {
                                  setEnfTexto(n);
                                  setMostrarSugestoes(false);
                                }}
                              >
                                {n}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="form-text">
                          Digite para filtrar ou informe uma nova enfermidade.
                        </div>
                      </div>

                      <div className="form-floating mb-3">
                        <textarea
                          className="form-control"
                          placeholder="Consulta Veterinária"
                          id="floatingTextarea"
                          style={{ height: '140px' }}
                          value={consulta}
                          onChange={(e) => setConsulta(e.target.value)}
                          required
                        />

                        <label htmlFor="floatingTextarea" className="form-label fw-bold">
                          Evolução / Conduta / Observações do Atendimento
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <FaPills />

                          <h5 className="fw-bold mb-0">Medicações do Atendimento</h5>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={adicionarMedicacaoLinha}
                        >
                          <FaPlus className="me-1" />
                          Adicionar medicação
                        </button>
                      </div>

                      <div className="row g-3">
                        {medicacoesUtilizadas.map((item, index) => {
                          const medSelecionado = opcoesMedicamentos.find(
                            (m) => String(m.id) === String(item.medicamentoId)
                          );

                          return (
                            <div className="col-12" key={item.idLocal}>
                              <div className="border rounded-4 p-3 bg-light">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <strong>Medicação {index + 1}</strong>

                                  {medicacoesUtilizadas.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removerMedicacaoLinha(item.idLocal)}
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </div>

                                <div className="row g-3">
                                  <div className="col-md-3">
                                    <label className="form-label">Origem</label>

                                    <select
                                      className="form-select"
                                      value={item.origem}
                                      onChange={(e) =>
                                        alterarMedicacaoLinha(item.idLocal, 'origem', e.target.value)
                                      }
                                    >
                                      <option value="ESTOQUE">Estoque</option>
                                      <option value="EXTERNO">Externo</option>
                                    </select>
                                  </div>

                                  {item.origem === 'ESTOQUE' ? (
                                    <div className="col-md-5">
                                      <label className="form-label">Medicamento do Estoque</label>

                                      <select
                                        className="form-select"
                                        value={item.medicamentoId}
                                        onChange={(e) =>
                                          alterarMedicacaoLinha(item.idLocal, 'medicamentoId', e.target.value)
                                        }
                                      >
                                        <option value="">Selecione</option>

                                        {opcoesMedicamentos.map((med) => (
                                          <option key={med.id} value={med.id}>
                                            {med.nome} - Estoque: {med.estoqueAtual} {med.unidadeBase || ''}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="col-md-5">
                                      <label className="form-label">Medicamento Externo</label>

                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.nomeMedicamentoExterno}
                                        onChange={(e) =>
                                          alterarMedicacaoLinha(item.idLocal, 'nomeMedicamentoExterno', e.target.value)
                                        }
                                        placeholder="Ex.: Flunixin Meglumine"
                                      />
                                    </div>
                                  )}

                                  <div className="col-md-2">
                                    <label className="form-label">Qtde Ministrada</label>

                                    <input
                                      type="number"
                                      step="0.01"
                                      className="form-control"
                                      value={item.doseAplicada}
                                      onChange={(e) =>
                                        alterarMedicacaoLinha(item.idLocal, 'doseAplicada', e.target.value)
                                      }
                                      placeholder="Ex: 20"
                                    />
                                  </div>

                                  <div className="col-md-2">
                                    <label className="form-label">Unidade</label>

                                    {item.origem === 'ESTOQUE' ? (
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.unidade}
                                        readOnly
                                        placeholder="Auto"
                                      />
                                    ) : (
                                      <select
                                        className="form-select"
                                        value={item.unidade}
                                        onChange={(e) =>
                                          alterarMedicacaoLinha(item.idLocal, 'unidade', e.target.value)
                                        }
                                      >
                                        <option value="">Selecione</option>
                                        <option value="ML">mL</option>
                                        <option value="L">L</option>
                                        <option value="MG">mg</option>
                                        <option value="G">g</option>
                                        <option value="KG">kg</option>
                                        <option value="UN">UN</option>
                                      </select>
                                    )}
                                  </div>

                                  <div className="col-md-12">
                                    <label className="form-label">Observação</label>

                                    <input
                                      type="text"
                                      className="form-control"
                                      value={item.observacao}
                                      onChange={(e) =>
                                        alterarMedicacaoLinha(item.idLocal, 'observacao', e.target.value)
                                      }
                                      placeholder="Ex.: aplicação IV, uso particular do veterinário, etc."
                                    />
                                  </div>

                                  {item.origem === 'ESTOQUE' && medSelecionado && (
                                    <div className="col-12">
                                      <div className="alert alert-secondary mb-0 py-2">
                                        <strong>Apresentação:</strong> {medSelecionado.tipoApresentacao || '-'} |{' '}
                                        <strong>Conteúdo:</strong> {medSelecionado.quantidadePorApresentacao || '-'} {medSelecionado.unidadeConteudo || ''} |{' '}
                                        <strong>Estoque atual:</strong> {medSelecionado.estoqueAtual} {medSelecionado.unidadeBase || ''}
                                      </div>
                                    </div>
                                  )}

                                  {item.origem === 'EXTERNO' && (
                                    <div className="col-12">
                                      <div className="alert alert-warning mb-0 py-2">
                                        Esta medicação será registrada no histórico do equino, mas não dará baixa no estoque da veterinária.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
                    <button type="button" className="btn btn-outline-danger me-2" onClick={cancelar}>
                      Cancelar
                    </button>

                    <button type="submit" className="btn btn-success">
                      Salvar Dados
                    </button>
                  </div>
                </form>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '100px' }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <FaHistory />

                      <h5 className="fw-bold mb-0">Histórico do Equino</h5>
                    </div>

                    <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
                      <div className="mb-4">
                        <h6 className="fw-bold text-primary">Atendimentos</h6>

                        {historico.atendimentos.length > 0 ? (
                          historico.atendimentos.map((item) => (
                            <div key={`at-${item.id}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data || item.dataAtendimento)}</small>
                              <div><strong>Enfermidade:</strong> {item.enfermidade || '-'}</div>
                              <div><strong>Consulta:</strong> {item.textoConsulta || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhum atendimento encontrado.</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold text-primary">Medicações já utilizadas</h6>

                        {historico.medicacoes.length > 0 ? (
                          historico.medicacoes.map((item) => (
                            <div key={`med-${item.id}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data)}</small>
                              <div><strong>Origem:</strong> {item.origem === 'EXTERNO' ? 'Externo' : 'Estoque'}</div>
                              <div><strong>Medicamento:</strong> {item.nomeMedicamento || '-'}</div>
                              <div><strong>Dose:</strong> {item.doseAplicada || '-'} {item.unidade || ''}</div>
                              <div><strong>Obs.:</strong> {item.observacao || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhuma medicação registrada.</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold text-primary">Vacinações</h6>

                        {historico.vacinacoes.length > 0 ? (
                          historico.vacinacoes.map((item) => (
                            <div key={`vac-${item.id}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data || item.dataVacinacao)}</small>
                              <div><strong>Vacina:</strong> {item.nomeVacina || item.vacina || '-'}</div>
                              <div><strong>Observação:</strong> {item.observacao || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhuma vacinação encontrada.</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold text-primary">Vermifugações</h6>

                        {historico.vermifugacoes.length > 0 ? (
                          historico.vermifugacoes.map((item) => (
                            <div key={`ver-${item.id}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data || item.dataVermifugacao)}</small>
                              <div><strong>Vermífugo:</strong> {item.nomeVermifugo || item.vermifugo || '-'}</div>
                              <div><strong>Observação:</strong> {item.observacao || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhuma vermifugação encontrada.</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold text-primary">Toaletes</h6>

                        {historico.toaletes.length > 0 ? (
                          historico.toaletes.map((item) => (
                            <div key={`toa-${item.id}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data || item.dataToalete)}</small>
                              <div><strong>Procedimento:</strong> Toalete</div>
                              <div><strong>Observação:</strong> {item.observacao || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhum toalete encontrado.</p>
                        )}
                      </div>

                      <div className="mb-2">
                        <h6 className="fw-bold text-primary">Ferrageamentos</h6>

                        {historico.ferrageamentos.length > 0 ? (
                          historico.ferrageamentos.map((item) => (
                            <div key={`fer-${item.id}-${item.tipoFerrageamento}`} className="border rounded-3 p-3 mb-2 bg-light">
                              <small className="text-muted">{formatarData(item.data || item.dataFerrageamento)}</small>
                              <div><strong>Tipo:</strong> {item.tipoFerrageamento || '-'}</div>
                              <div><strong>Observação:</strong> {item.observacao || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">Nenhum ferrageamento encontrado.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal isOpen={modalAberto} className="modal" overlayClassName="overlay">
          <div className="modalContent text-center">
            <FaCheckCircle className="icone-sucesso" />

            <h4 className="mensagem-azul">
              {modoEdicao ? 'Dados editados com sucesso!' : 'Consulta salva com sucesso!'}
            </h4>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VeterinariaAtendimento;