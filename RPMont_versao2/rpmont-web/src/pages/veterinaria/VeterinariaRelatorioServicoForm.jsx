import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from '../../api';
import './Veterinaria.css';

// >>> helper simples para normalizar qualquer formato de data em 'yyyy-mm-dd' (sem mexer em fuso)
function normalizeToYMD(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;          // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}T/.test(input)) return input.slice(0, 10); // ISO com T/Z -> yyyy-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {                    // dd/mm/yyyy
      const [dd, mm, yyyy] = input.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const d = new Date(input);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

const VeterinariaRelatorioServicoForm = () => {
  const [militar, setMilitar] = useState(null);
  const [dadosServico, setDadosServico] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [passagemServico, setPassagemServico] = useState('');
  const [dataServico, setDataServico] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mensagemErroModal, setMensagemErroModal] = useState('');

  const navigate = useNavigate();

  // FORMATOS
  const formatarData = (dataPossivelISO) => {
    const ymd = normalizeToYMD(dataPossivelISO);
    if (!ymd) return '-';
    const [ano, mes, dia] = ymd.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataPosterior = (dataISO) => {
    const ymd = normalizeToYMD(dataISO);
    if (!ymd) return '-';
    const data = new Date(`${ymd}T00:00:00`);
    data.setDate(data.getDate() + 1);
    return formatarData(data.toISOString().slice(0, 10));
  };

  useEffect(() => {
    const militarLogado = {
      nomeDeGuerra: 'Cabo Lima',
      matricula: '1234567',
      postGrad: 'Cabo',
    };
    setMilitar(militarLogado);
  }, []);

  // CONFIRMAR MODAL
  const confirmarDataServico = () => {
    if (!dataServico) {
      setMensagemErroModal('Por favor, informe a data do serviço.');
      return;
    }
    setMensagemErroModal('');
    setShowModal(false);
    buscarDados();
  };

  // BUSCAR DADOS
  const buscarDados = async () => {
    try {
      setCarregando(true);

      const ymdAlvo = normalizeToYMD(dataServico);
      if (!ymdAlvo) {
        throw new Error('Data inválida');
      }

      const [
        atendimentosRes,
        escalasRes,
        baixadosRes,
        vermifugacoesRes,
        repregoRes,
        curativoRes,
        ferrageamentoGeralRes,
        equinosRes
      ] = await Promise.all([
        axios.get(`/atendimentos`),
        axios.get(`/escala`),
        axios.get(`/equinosBaixados`),
        axios.get(`/vermifugacoes`),
        axios.get(`/ferrageamentoRepregoEquino`),
        axios.get(`/ferrageamentoCurativoEquino`),
        axios.get(`/ferrageamentoEquino`), // geral
        axios.get(`/equinos`)
      ]);

      const equinos = equinosRes.data || [];
      const getEq = (id) => equinos.find(e => String(e.id) === String(id)) || {};

      // ATENDIMENTOS (data)
      const atendimentos = (atendimentosRes.data || [])
        .filter(a => normalizeToYMD(a.data) === ymdAlvo)
        .map(item => {
          const eq = getEq(item.idEquino);
          return {
            ...item,
            name: eq.name || 'Desconhecido',
            raca: eq.raca || '-',
            numeroRegistro: eq.numeroRegistro || '-',
            sexo: eq.sexo || '-',
            unidade: eq.unidade || '-',
          };
        });

      // ESCALAS (data)
      const escalas = (escalasRes.data || [])
        .filter(s => normalizeToYMD(s.data) === ymdAlvo)
        .map(item => {
          const eq = getEq(item.idEquino);
          return {
            ...item,
            name: eq.name || 'Desconhecido',
            raca: eq.raca || '-',
            numeroRegistro: eq.numeroRegistro || '-',
            sexo: eq.sexo || '-',
            localTrabalho: item.localTrabalho,
            jornadaTrabalho: item.jornadaTrabalho,
            cavaleiro: item.cavaleiro,
          };
        });

      // EQUINOS BAIXADOS (dataBaixa)
      const baixados = (baixadosRes.data || [])
        .filter(b => normalizeToYMD(b.dataBaixa) === ymdAlvo)
        .map(item => {
          const eq = getEq(item.idEquino);
          return {
            ...item,
            nomeEquino: eq.name || 'Desconhecido',
            dataBaixa: item.dataBaixa
          };
        });

      // EQUINOS RETORNADOS (dataRetorno)
      const retornos = (baixadosRes.data || [])
        .filter(b => normalizeToYMD(b.dataRetorno) === ymdAlvo)
        .map(item => {
          const eq = getEq(item.idEquino);
          return {
            ...item,
            nomeEquino: eq.name || 'Desconhecido',
            dataRetorno: item.dataRetorno
          };
        });

      // VERMIFUGAÇÕES (data)
      const vermifugacoes = (vermifugacoesRes.data || [])
        .filter(v => normalizeToYMD(v.data) === ymdAlvo)
        .map(v => {
          const eq = getEq(v.equinoId);
          return {
            ...v,
            nomeEquino: eq.name || 'Desconhecido',
          };
        });

      // FERRAGEAMENTO — REPREGO (data)
      const repregos = (repregoRes.data || [])
        .filter(r => normalizeToYMD(r.data) === ymdAlvo)
        .map(r => {
          const eq = getEq(r.equinoId);
          return {
            ...r,
            nomeEquino: eq.name || 'Desconhecido',
          };
        });
      
      // FERRAGEAMENTO — CURATIVO
      const curativos = (curativoRes.data || [])
      .filter(c => normalizeToYMD(c.data) === ymdAlvo)   // <<<< sempre usa "data"
      .map(c => {
        const eq = getEq(c.equinoId);
        return {
          ...c,
          nomeEquino: eq.name || 'Desconhecido',
        };
      });
            
      // FERRAGEAMENTO — GERAL (filtra EXCLUSIVAMENTE por "data")
      const ferrageamentos = (ferrageamentoGeralRes.data || [])
      .filter(f => normalizeToYMD(f.data) === ymdAlvo)
      .map(f => {
        const eq = getEq(f.equinoId);
        return {
          ...f,
          nomeEquino: eq.name || 'Desconhecido',
        };
      });

      setDadosServico({
        data: ymdAlvo,
        atendimentos,
        escalas,
        baixados,
        retornos,
        vermifugacoes,
        repregos,
        curativos,
        ferrageamentos,
      });

    } catch (error) {
      console.error("Erro ao buscar dados do serviço", error);
    } finally {
      setCarregando(false);
    }
  };

  // SALVAR SIMULADO
  const salvarRelatorio = () => {
    alert("Relatório salvo com sucesso (simulado)!");
  };

  const gerarPDF = () => {
    if (!dadosServico || !militar) {
      alert("Por favor, clique em 'Buscar Dados' antes de gerar o PDF.");
      return;
    }

    const doc = new jsPDF();
    let yPos = 15;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Relatório de Serviço - ${formatarData(dadosServico.data)}`, 14, yPos);
    yPos += 12;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Nome de Guerra:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(militar.nomeDeGuerra, 55, yPos);
    yPos += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Matrícula:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(militar.matricula, 55, yPos);
    yPos += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Posto/Graduação:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(militar.postGrad, 55, yPos);
    yPos += 10;

    // PASSAGEM DE SERVIÇO
    doc.setFont("helvetica", "bold");
    doc.text("Passagem de Serviço:", 14, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    const textoPassagem = passagemServico.trim()
      ? doc.splitTextToSize(passagemServico, 180)
      : ["Sem alteração"];
    doc.text(textoPassagem, 14, yPos);
    yPos += textoPassagem.length * 6 + 4;

    // OBSERVAÇÕES
    doc.setFont("helvetica", "bold");
    doc.text("Observações do Serviço:", 14, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    const textoObs = observacao.trim()
      ? doc.splitTextToSize(observacao, 180)
      : ["Sem alteração"];
    doc.text(textoObs, 14, yPos);
    yPos += textoObs.length * 6 + 4;

    // TABELA DE ATENDIMENTOS
    if (dadosServico.atendimentos?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Equinos Atendidos", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Raça", "Registro", "Sexo", "Unidade", "Consulta"]],
        body: dadosServico.atendimentos.map(item => [
          item.name || "",
          item.raca || "",
          item.numeroRegistro || "",
          item.sexo || "",
          item.unidade || "",
          item.textoConsulta || ""
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE ESCALAS
    if (dadosServico.escalas?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Escalas dos Equinos", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Raça", "Registro", "Sexo", "Local", "Jornada", "Cavaleiro"]],
        body: dadosServico.escalas.map(item => [
          item.name || "",
          item.raca || "",
          item.numeroRegistro || "",
          item.sexo || "",
          item.localTrabalho || "",
          item.jornadaTrabalho || "",
          item.cavaleiro || ""
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE VERMIFUGAÇÕES
    if (dadosServico.vermifugacoes?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Vermifugações", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Vermífugo", "Observação"]],
        body: dadosServico.vermifugacoes.map(item => [
          item.nomeEquino || "",
          item.vermifugo || "",
          item.observacao || ""
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE FERRAGEAMENTO — REPREGO
    if (dadosServico.repregos?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Ferrageamento — Reprego", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Patas", "Ferro novo?", "Cravos", "Observações"]],
        body: dadosServico.repregos.map(item => [
          item.nomeEquino || "",
          Array.isArray(item.patas) ? item.patas.join(', ') : (item.patas || ""),
          item.ferroNovo || "",
          item.cravosUsados != null ? String(item.cravosUsados) : "",
          item.observacoes || ""
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // >>> TABELA DE FERRAGEAMENTO — CURATIVO (AGORA COM COLUNA DE DATA)
    if (dadosServico.curativos?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Ferrageamento — Curativo", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Data", "Nome", "Tipo de Curativo", "Observações"]],
        body: dadosServico.curativos.map(item => [
          item.data ? formatarData(item.data) : "-",
          item.nomeEquino || "",
          item.tipoCurativo || "",
          item.observacoes || ""
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE FERRAGEAMENTO — GERAL (usa data ou dataProximoProcedimento)
    if (dadosServico.ferrageamentos?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Ferrageamento — Geral", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Tipo Ferradura", "Tipo Cravo", "Justura", "Tipo", "Ferros", "Cravos", "Observações", "Próx. Proced."]],
        body: dadosServico.ferrageamentos.map(item => [
          item.nomeEquino || "",
          item.tipoFerradura || "",
          item.tipoCravo || "",
          item.tipoJustura || "",
          item.tipoFerrageamento || "",
          item.ferros != null ? String(item.ferros) : "",
          item.cravos != null ? String(item.cravos) : "",
          item.observacoes || "",
          item.dataProximoProcedimento ? formatarData(item.dataProximoProcedimento) : "-"
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE BAIXADOS
    if (dadosServico.baixados?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Equinos Baixados", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Data de Baixa"]],
        body: dadosServico.baixados.map(item => [
          item.nomeEquino || "",
          item.dataBaixa ? formatarData(item.dataBaixa) : "-"
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // TABELA DE RETORNOS
    if (dadosServico.retornos?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Equinos Retornados", 14, yPos);
      doc.autoTable({
        startY: yPos + 5,
        head: [["Nome", "Data de Retorno"]],
        body: dadosServico.retornos.map(item => [
          item.nomeEquino || "",
          item.dataRetorno ? formatarData(item.dataRetorno) : "-"
        ]),
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Finalizar
    doc.save(`RelatorioServico_${dadosServico.data}.pdf`);
  };

  return (
    <div className="relatorio-container">
      <h2 className="titulo">Relatório de Serviço</h2>

      {militar && (
        <div className="box-info militar-box">
          <p><strong>Nome de Guerra:</strong> {militar.nomeDeGuerra}</p>
          <p><strong>Matrícula:</strong> {militar.matricula}</p>
          <p><strong>Posto/Graduação:</strong> {militar.postGrad}</p>

          <div className="mt-3">
            <label><strong>Passagem de Serviço:</strong></label>
            <textarea
              className="form-control"
              rows="3"
              value={passagemServico}
              onChange={(e) => setPassagemServico(e.target.value)}
              placeholder="Informações sobre a passagem de serviço..."
            />
          </div>

          <div className="mt-3">
            <label><strong>Observações do Serviço:</strong></label>
            <textarea
              className="form-control"
              rows="4"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva aqui as observações relevante do serviço..."
            />
          </div>
        </div>
      )}

      <div className="mb-3 d-flex gap-2 mt-3 no-print">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/inicio')}>Voltar</button>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setMensagemErroModal('');
            setDataServico('');
            setShowModal(true);
          }}
        >
          Buscar Dados
        </button>
        <button className="btn btn-outline-info" onClick={() => window.print()}>Imprimir</button>
        <button className="btn btn-outline-danger" onClick={gerarPDF} disabled={!dadosServico}>Exportar PDF</button>
      </div>

      {carregando && <p>Carregando dados do serviço...</p>}

      {dadosServico && (
        <div className="box-info servico-box">
          <h4>
            Dados do Serviço - dia {formatarData(dadosServico.data)} para o dia {formatarDataPosterior(dadosServico.data)}
          </h4>

          {/* Equinos Atendidos */}
          <h5 className="mt-4">Equinos Atendidos</h5>
          {dadosServico.atendimentos.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Registro</th>
                  <th>Sexo</th>
                  <th>Unidade</th>
                  <th>Consulta</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.atendimentos.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.raca}</td>
                    <td>{item.numeroRegistro}</td>
                    <td>{item.sexo}</td>
                    <td>{item.unidade}</td>
                    <td>{item.textoConsulta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum atendimento registrado.</p>}

          {/* Escalas */}
          <h5 className="mt-4">Escalas dos Equinos</h5>
          {dadosServico.escalas.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Registro</th>
                  <th>Sexo</th>
                  <th>Local</th>
                  <th>Jornada</th>
                  <th>Cavaleiro</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.escalas.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.raca}</td>
                    <td>{item.numeroRegistro}</td>
                    <td>{item.sexo}</td>
                    <td>{item.localTrabalho}</td>
                    <td>{item.jornadaTrabalho}</td>
                    <td>{item.cavaleiro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhuma escala registrada.</p>}

          {/* Vermifugações */}
          <h5 className="mt-4">Vermifugações</h5>
          {dadosServico.vermifugacoes.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Vermífugo</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.vermifugacoes.map((item, i) => (
                  <tr key={i}>
                    <td>{item.nomeEquino}</td>
                    <td>{item.vermifugo}</td>
                    <td>{item.observacao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhuma vermifugação registrada.</p>}

          {/* Ferrageamento — Reprego */}
          <h5 className="mt-4">Ferrageamento — Reprego</h5>
          {dadosServico.repregos.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Patas</th>
                  <th>Ferro novo?</th>
                  <th>Cravos</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.repregos.map((item, i) => (
                  <tr key={i}>
                    <td>{item.nomeEquino}</td>
                    <td>{Array.isArray(item.patas) ? item.patas.join(', ') : item.patas}</td>
                    <td>{item.ferroNovo}</td>
                    <td>{item.cravosUsados}</td>
                    <td>{item.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum reprego registrado.</p>}

          {/* Ferrageamento — Curativo (AGORA COM DATA) */}
          <h5 className="mt-4">Ferrageamento — Curativo</h5>
          {dadosServico.curativos.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Tipo de Curativo</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.curativos.map((item, i) => (
                  <tr key={i}>
                    <td>{item.data ? formatarData(item.data) : '-'}</td>
                    <td>{item.nomeEquino}</td>
                    <td>{item.tipoCurativo}</td>
                    <td>{item.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum curativo registrado.</p>}

          {/* Ferrageamento — Geral */}
          <h5 className="mt-4">Ferrageamento — Geral</h5>
          {dadosServico.ferrageamentos.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo Ferradura</th>
                  <th>Tipo Cravo</th>
                  <th>Justura</th>
                  <th>Tipo</th>
                  <th>Ferros</th>
                  <th>Cravos</th>
                  <th>Observações</th>
                  <th>Próx. Proced.</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.ferrageamentos.map((item, i) => (
                  <tr key={i}>
                    <td>{item.nomeEquino}</td>
                    <td>{item.tipoFerradura}</td>
                    <td>{item.tipoCravo}</td>
                    <td>{item.tipoJustura}</td>
                    <td>{item.tipoFerrageamento}</td>
                    <td>{item.ferros}</td>
                    <td>{item.cravos}</td>
                    <td>{item.observacoes || '-'}</td>
                    <td>{item.dataProximoProcedimento ? formatarData(item.dataProximoProcedimento) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum ferrageamento geral registrado.</p>}

          {/* Baixados */}
          <h5 className="mt-4">Equinos Baixados</h5>
          {dadosServico.baixados.length > 0 ? (
            <ul>
              {dadosServico.baixados.map((item, i) => (
                <li key={i}>{item.nomeEquino} - Baixado em {formatarData(item.dataBaixa)}</li>
              ))}
            </ul>
          ) : <p>Nenhum equino baixado.</p>}

          {/* Retornos */}
          <h5 className="mt-4">Equinos Retornados</h5>
          {dadosServico.retornos.length > 0 ? (
            <ul>
              {dadosServico.retornos.map((item, i) => (
                <li key={i}>{item.nomeEquino} - Retornou em {formatarData(item.dataRetorno)}</li>
              ))}
            </ul>
          ) : <p>Nenhum retorno registrado.</p>}

          <div className="mt-4 text-end no-print">
            <button className="btn btn-outline-success" onClick={salvarRelatorio}>Salvar</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar3 me-2"></i>Informe a Data do Serviço
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="date"
                  className="form-control"
                  value={dataServico}
                  onChange={(e) => setDataServico(e.target.value)}
                />
                {mensagemErroModal && (
                  <p className="text-danger mt-2">{mensagemErroModal}</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={confirmarDataServico}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeterinariaRelatorioServicoForm;
