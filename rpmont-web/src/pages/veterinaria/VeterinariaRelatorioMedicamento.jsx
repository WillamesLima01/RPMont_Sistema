import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import {
  FaPrint,
  FaFilter,
  FaFileAlt,
  FaSearch,
  FaUndo,
  FaFilePdf
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../../../index.css";
import './Veterinaria.css';

const FILTROS_INICIAIS = {
  medicamentoId: '',
  fabricante: '',
  dataInicial: '',
  dataFinal: '',
  validadeInicial: '',
  validadeFinal: '',
  somenteComEstoque: false,
  somenteVencendo: false,
  diasVencimento: 30
};

const TIPOS_RELATORIO_INICIAIS = {
  estoque: true,
  entradas: false,
  saidas: false
};

const CATEGORIAS = {
  ANTIBIOTICO: 'Antibiótico',
  ANTIINFLAMATORIO: 'Anti-inflamatório',
  ANTI_INFLAMATORIO: 'Anti-inflamatório',
  ANALGESICO: 'Analgésico',
  ANTIPARASITARIO: 'Antiparasitário',
  SEDATIVO: 'Sedativo',
  VITAMINA: 'Vitamina',
  ANESTESICO: 'Anestésico',
  CICATRIZANTE: 'Cicatrizante',
  IMUNIZACAO: 'Imunização',
  SORO: 'Soro',
  OUTROS: 'Outros'
};

const FORMAS = {
  SOLUCAO: 'Solução',
  LIQUIDO: 'Líquido',
  INJETAVEL: 'Injetável',
  COMPRIMIDO: 'Comprimido',
  CAPSULA: 'Cápsula',
  PO: 'Pó',
  PASTA: 'Pasta',
  POMADA: 'Pomada',
  SPRAY: 'Spray',
  CREME: 'Creme',
  GEL: 'Gel',
  OUTROS: 'Outros'
};

const VeterinariaRelatorioMedicamento = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);

  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [tiposRelatorio, setTiposRelatorio] = useState(TIPOS_RELATORIO_INICIAIS);

  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIAIS);
  const [tiposRelatorioAplicados, setTiposRelatorioAplicados] = useState(TIPOS_RELATORIO_INICIAIS);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscaRealizada, setBuscaRealizada] = useState(true);

  const estiloBoxTipos = {
    width: '100%',
    padding: '18px',
    borderRadius: '16px',
    background: '#eef4ff',
    border: '1px solid #cdddfc',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)'
  };

  const estiloTituloTipos = {
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#0d6efd',
    marginBottom: '16px'
  };

  const montarEstiloCardTipo = (ativo) => ({
    width: '100%',
    minHeight: '64px',
    margin: 0,
    padding: '16px 18px',
    borderRadius: '12px',
    border: ativo ? '1px solid #0d6efd' : '1px solid #d8e2f0',
    background: ativo ? '#dbeafe' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  });

  const estiloCheckboxTipo = {
    margin: 0,
    transform: 'scale(1.15)',
    accentColor: '#0d6efd',
    cursor: 'pointer'
  };

  const montarEstiloTextoTipo = (ativo) => ({
    lineHeight: 1,
    color: ativo ? '#0b4fcf' : '#1f2937'
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro('');

      const [medicamentosResponse, entradasResponse, saidasResponse] = await Promise.all([
        axios.get('/medicamentos'),
        axios.get('/entradas_medicamento'),
        axios.get('/saidas_medicamento')
      ]);

      setMedicamentos(Array.isArray(medicamentosResponse.data) ? medicamentosResponse.data : []);
      setEntradas(Array.isArray(entradasResponse.data) ? entradasResponse.data : []);
      setSaidas(Array.isArray(saidasResponse.data) ? saidasResponse.data : []);
    } catch (error) {
      console.error('Erro ao carregar relatório de medicamentos:', error);
      setErro('Erro ao carregar os dados do relatório.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTipoRelatorioChange = (e) => {
    const { name, checked } = e.target;

    setTiposRelatorio((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleBuscarDados = () => {
    setFiltrosAplicados({ ...filtros });
    setTiposRelatorioAplicados({ ...tiposRelatorio });
    setBuscaRealizada(true);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    setTiposRelatorio(TIPOS_RELATORIO_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
    setTiposRelatorioAplicados(TIPOS_RELATORIO_INICIAIS);
    setBuscaRealizada(true);
  };

  const normalizar = (texto) =>
    (texto || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const escaparHtml = (valor) => {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const formatarData = (data) => {
    if (!data) return '-';

    const dataTexto = String(data);
    const apenasData = dataTexto.includes('T') ? dataTexto.split('T')[0] : dataTexto;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(apenasData)) {
      const dt = new Date(dataTexto);
      return Number.isNaN(dt.getTime()) ? dataTexto : dt.toLocaleDateString('pt-BR');
    }

    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarCategoria = (categoria) => CATEGORIAS[categoria] || categoria || '-';

  const formatarForma = (forma) => FORMAS[forma] || forma || '-';

  const formatarQuantidade = (quantidade, unidade) => {
    if (quantidade === null || quantidade === undefined || quantidade === '') return '-';
    return `${quantidade} ${unidade || ''}`.trim();
  };

  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const calcularEstoqueAtual = (medicamentoId) => {
    const totalEntradas = entradas
      .filter((entrada) => String(entrada.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    const totalSaidas = saidas
      .filter((saida) => String(saida.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    return totalEntradas - totalSaidas;
  };

  const obterValidadeMaisProxima = (medicamentoId) => {
    const entradasDoMedicamento = entradas.filter(
      (entrada) => String(entrada.medicamentoId) === String(medicamentoId)
    );

    return entradasDoMedicamento
      .filter((e) => e.validade)
      .map((e) => new Date(`${String(e.validade).split('T')[0]}T00:00:00`))
      .filter((dt) => !Number.isNaN(dt.getTime()))
      .sort((a, b) => a - b)[0];
  };

  const nomeMedicamentoPorId = (id) => {
    const med = medicamentos.find((m) => String(m.id) === String(id));
    return med?.nome || '-';
  };

  const medicamentoSelecionadoNome = () => {
    if (!filtrosAplicados.medicamentoId) return 'Todos';

    const med = medicamentos.find(
      (item) => String(item.id) === String(filtrosAplicados.medicamentoId)
    );

    return med ? `${med.nome || '-'} - ${med.fabricante || '-'}` : filtrosAplicados.medicamentoId;
  };

  const tiposSelecionadosTexto = () => {
    const tipos = [];

    if (tiposRelatorioAplicados.estoque) tipos.push('Estoque Atual');
    if (tiposRelatorioAplicados.entradas) tipos.push('Entradas');
    if (tiposRelatorioAplicados.saidas) tipos.push('Saídas');

    return tipos.length ? tipos.join(', ') : 'Nenhum';
  };

  const entradasFiltradas = useMemo(() => {
    return entradas.filter((entrada) => {
      const atendeMedicamento =
        !filtrosAplicados.medicamentoId ||
        String(entrada.medicamentoId) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(entrada.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeDataInicial =
        !filtrosAplicados.dataInicial || entrada.dataEntrada >= filtrosAplicados.dataInicial;

      const atendeDataFinal =
        !filtrosAplicados.dataFinal || entrada.dataEntrada <= filtrosAplicados.dataFinal;

      const atendeValidadeInicial =
        !filtrosAplicados.validadeInicial ||
        (entrada.validade && entrada.validade >= filtrosAplicados.validadeInicial);

      const atendeValidadeFinal =
        !filtrosAplicados.validadeFinal ||
        (entrada.validade && entrada.validade <= filtrosAplicados.validadeFinal);

      return (
        atendeMedicamento &&
        atendeFabricante &&
        atendeDataInicial &&
        atendeDataFinal &&
        atendeValidadeInicial &&
        atendeValidadeFinal
      );
    });
  }, [entradas, filtrosAplicados]);

  const saidasFiltradas = useMemo(() => {
    return saidas.filter((saida) => {
      const atendeMedicamento =
        !filtrosAplicados.medicamentoId ||
        String(saida.medicamentoId) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(saida.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeDataInicial =
        !filtrosAplicados.dataInicial || saida.dataSaida >= filtrosAplicados.dataInicial;

      const atendeDataFinal =
        !filtrosAplicados.dataFinal || saida.dataSaida <= filtrosAplicados.dataFinal;

      return atendeMedicamento && atendeFabricante && atendeDataInicial && atendeDataFinal;
    });
  }, [saidas, filtrosAplicados]);

  const estoqueFiltrado = useMemo(() => {
    return medicamentos.filter((med) => {
      const estoqueAtual = calcularEstoqueAtual(med.id);

      const atendeMedicamento =
        !filtrosAplicados.medicamentoId ||
        String(med.id) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(med.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeSomenteComEstoque =
        !filtrosAplicados.somenteComEstoque || estoqueAtual > 0;

      const validadeMaisProxima = obterValidadeMaisProxima(med.id);

      const atendeValidadeInicial =
        !filtrosAplicados.validadeInicial ||
        (validadeMaisProxima &&
          validadeMaisProxima >= new Date(`${filtrosAplicados.validadeInicial}T00:00:00`));

      const atendeValidadeFinal =
        !filtrosAplicados.validadeFinal ||
        (validadeMaisProxima &&
          validadeMaisProxima <= new Date(`${filtrosAplicados.validadeFinal}T00:00:00`));

      let atendeSomenteVencendo = true;
      if (filtrosAplicados.somenteVencendo) {
        if (!validadeMaisProxima) {
          atendeSomenteVencendo = false;
        } else {
          const limite = new Date(hojeSemHora);
          limite.setDate(limite.getDate() + Number(filtrosAplicados.diasVencimento || 30));
          atendeSomenteVencendo = validadeMaisProxima <= limite;
        }
      }

      return (
        atendeMedicamento &&
        atendeFabricante &&
        atendeSomenteComEstoque &&
        atendeValidadeInicial &&
        atendeValidadeFinal &&
        atendeSomenteVencendo
      );
    });
  }, [medicamentos, entradas, saidas, filtrosAplicados]);

  const resumo = useMemo(() => {
    const totalMedicamentos = medicamentos.length;

    const totalEstoque = estoqueFiltrado.reduce((acc, med) => {
      return acc + Math.max(0, calcularEstoqueAtual(med.id));
    }, 0);

    const totalEntradas = entradasFiltradas.reduce((acc, item) => {
      return acc + Number(item.quantidadeBase || 0);
    }, 0);

    const totalSaidas = saidasFiltradas.reduce((acc, item) => {
      return acc + Number(item.quantidadeBase || 0);
    }, 0);

    return {
      totalMedicamentos,
      totalEstoque,
      totalEntradas,
      totalSaidas
    };
  }, [medicamentos, estoqueFiltrado, entradasFiltradas, saidasFiltradas]);

  const nenhumTipoSelecionado =
    !tiposRelatorioAplicados.estoque &&
    !tiposRelatorioAplicados.entradas &&
    !tiposRelatorioAplicados.saidas;

  const validarRelatorioAntesGerar = () => {
    if (nenhumTipoSelecionado) {
      alert('Selecione pelo menos um tipo de relatório antes de gerar.');
      return false;
    }

    if (!buscaRealizada) {
      alert('Clique em Buscar Dados antes de gerar o relatório.');
      return false;
    }

    return true;
  };

  const montarCabecalhoRelatorio = () => {
    const linhas = [
      ['Data de emissão', new Date().toLocaleString('pt-BR')],
      ['Tipos selecionados', tiposSelecionadosTexto()],
      ['Medicamento', medicamentoSelecionadoNome()],
      ['Fabricante', filtrosAplicados.fabricante || 'Todos'],
      ['Data inicial', formatarData(filtrosAplicados.dataInicial)],
      ['Data final', formatarData(filtrosAplicados.dataFinal)],
      ['Validade inicial', formatarData(filtrosAplicados.validadeInicial)],
      ['Validade final', formatarData(filtrosAplicados.validadeFinal)]
    ];

    if (tiposRelatorioAplicados.estoque) {
      linhas.push(['Somente com estoque', filtrosAplicados.somenteComEstoque ? 'Sim' : 'Não']);
      linhas.push(['Somente vencendo', filtrosAplicados.somenteVencendo ? `Sim (${filtrosAplicados.diasVencimento} dias)` : 'Não']);
    }

    return linhas;
  };

  const montarResumoSelecionado = () => {
    const itens = [
      ['Medicamentos cadastrados', resumo.totalMedicamentos]
    ];

    if (tiposRelatorioAplicados.estoque) {
      itens.push(['Total em estoque', resumo.totalEstoque]);
      itens.push(['Itens no relatório de estoque', estoqueFiltrado.length]);
    }

    if (tiposRelatorioAplicados.entradas) {
      itens.push(['Total de entradas', resumo.totalEntradas]);
      itens.push(['Registros de entrada', entradasFiltradas.length]);
    }

    if (tiposRelatorioAplicados.saidas) {
      itens.push(['Total de saídas', resumo.totalSaidas]);
      itens.push(['Registros de saída', saidasFiltradas.length]);
    }

    return itens;
  };

  const montarLinhasEstoque = () => {
    return estoqueFiltrado.map((med, index) => {
      const validadeMaisProxima = obterValidadeMaisProxima(med.id);
      const estoqueAtual = calcularEstoqueAtual(med.id);

      return [
        index + 1,
        med.nome || '-',
        med.fabricante || '-',
        formatarCategoria(med.categoria),
        formatarForma(med.forma),
        med.unidadeBase || '-',
        formatarQuantidade(estoqueAtual, med.unidadeBase),
        validadeMaisProxima ? validadeMaisProxima.toLocaleDateString('pt-BR') : '-',
        med.ativo ? 'Ativo' : 'Inativo'
      ];
    });
  };

  const montarLinhasEntradas = () => {
    return entradasFiltradas.map((entrada, index) => [
      index + 1,
      entrada.medicamentoNome || nomeMedicamentoPorId(entrada.medicamentoId),
      entrada.fabricante || '-',
      entrada.lote || '-',
      formatarData(entrada.validade),
      formatarQuantidade(entrada.quantidadeInformada, entrada.unidadeInformada),
      formatarQuantidade(entrada.quantidadeBase, entrada.unidadeBase),
      formatarData(entrada.dataEntrada),
      entrada.fornecedor || '-'
    ]);
  };

  const montarLinhasSaidas = () => {
    return saidasFiltradas.map((saida, index) => [
      index + 1,
      saida.medicamentoNome || nomeMedicamentoPorId(saida.medicamentoId),
      saida.fabricante || '-',
      saida.tipoSaida || '-',
      formatarQuantidade(saida.quantidadeInformada, saida.unidadeInformada),
      formatarQuantidade(saida.quantidadeBase, saida.unidadeBase),
      formatarData(saida.dataSaida),
      saida.observacao || '-'
    ]);
  };

  const imprimirTabelaHtml = (titulo, colunas, linhas) => {
    if (!linhas.length) {
      return `
        <h3>${escaparHtml(titulo)}</h3>
        <p class="sem-registro">Nenhum registro encontrado.</p>
      `;
    }

    return `
      <h3>${escaparHtml(titulo)}</h3>

      <table>
        <thead>
          <tr>
            ${colunas.map((coluna) => `<th>${escaparHtml(coluna)}</th>`).join('')}
          </tr>
        </thead>

        <tbody>
          ${linhas.map((linha) => `
            <tr>
              ${linha.map((valor) => `<td>${escaparHtml(valor)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const handleImprimir = () => {
    if (!validarRelatorioAntesGerar()) return;

    const janela = window.open('', '_blank');

    if (!janela) {
      alert('Não foi possível abrir a janela de impressão.');
      return;
    }

    const cabecalho = montarCabecalhoRelatorio();
    const resumoRelatorio = montarResumoSelecionado();

    const htmlEstoque = tiposRelatorioAplicados.estoque
      ? imprimirTabelaHtml(
          'Relatório de Estoque Atual',
          ['#', 'Medicamento', 'Fabricante', 'Categoria', 'Forma', 'Unidade Base', 'Qtde Estoque', 'Validade Mais Próxima', 'Status'],
          montarLinhasEstoque()
        )
      : '';

    const htmlEntradas = tiposRelatorioAplicados.entradas
      ? imprimirTabelaHtml(
          'Relatório de Entradas',
          ['#', 'Medicamento', 'Fabricante', 'Lote', 'Validade', 'Quantidade', 'Qtde Base', 'Data Entrada', 'Fornecedor'],
          montarLinhasEntradas()
        )
      : '';

    const htmlSaidas = tiposRelatorioAplicados.saidas
      ? imprimirTabelaHtml(
          'Relatório de Saídas',
          ['#', 'Medicamento', 'Fabricante', 'Tipo Saída', 'Quantidade', 'Qtde Base', 'Data Saída', 'Observação'],
          montarLinhasSaidas()
        )
      : '';

    janela.document.write(`
      <html>
        <head>
          <title>Relatório de Medicamentos</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #222;
            }

            .cabecalho {
              border-bottom: 2px solid #0d6efd;
              padding-bottom: 10px;
              margin-bottom: 18px;
            }

            h1 {
              color: #0d6efd;
              margin: 0 0 10px 0;
              font-size: 22px;
            }

            h2 {
              color: #333;
              margin-top: 24px;
              font-size: 18px;
            }

            h3 {
              color: #0d6efd;
              margin-top: 26px;
              font-size: 16px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(220px, 1fr));
              gap: 4px 18px;
              font-size: 12px;
            }

            .resumo-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(160px, 1fr));
              gap: 10px;
              margin: 14px 0 20px 0;
            }

            .resumo-card {
              border: 1px solid #d7e3f3;
              border-radius: 8px;
              padding: 8px;
              background: #f8fbff;
              font-size: 12px;
            }

            .resumo-card strong {
              display: block;
              color: #0d6efd;
              font-size: 15px;
              margin-top: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin-bottom: 16px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 5px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #0d6efd;
              color: white;
            }

            tr:nth-child(even) {
              background: #f5f7fb;
            }

            .sem-registro {
              color: #666;
              font-size: 12px;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 6px;
            }

            @media print {
              body {
                padding: 10px;
              }

              h3 {
                page-break-after: avoid;
              }

              table {
                page-break-inside: auto;
              }

              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        </head>

        <body>
          <div class="cabecalho">
            <h1>Relatório de Medicamentos</h1>

            <div class="info-grid">
              ${cabecalho.map(([label, valor]) => `
                <div><strong>${escaparHtml(label)}:</strong> ${escaparHtml(valor)}</div>
              `).join('')}
            </div>
          </div>

          <h2>Resumo</h2>

          <div class="resumo-grid">
            ${resumoRelatorio.map(([label, valor]) => `
              <div class="resumo-card">
                ${escaparHtml(label)}
                <strong>${escaparHtml(valor)}</strong>
              </div>
            `).join('')}
          </div>

          ${htmlEstoque}
          ${htmlEntradas}
          ${htmlSaidas}

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    janela.document.close();
  };

  const adicionarCabecalhoPDF = (doc) => {
    const margem = 40;
    const cabecalho = montarCabecalhoRelatorio();
    const resumoRelatorio = montarResumoSelecionado();

    doc.setFontSize(16);
    doc.text('Relatório de Medicamentos', margem, 35);

    doc.setFontSize(9);

    let y = 55;
    cabecalho.forEach(([label, valor], index) => {
      const x = index % 2 === 0 ? margem : 410;

      if (index > 0 && index % 2 === 0) {
        y += 14;
      }

      doc.text(`${label}: ${valor}`, x, y);
    });

    y += 24;

    doc.setFontSize(12);
    doc.text('Resumo', margem, y);

    y += 14;
    doc.setFontSize(9);

    resumoRelatorio.forEach(([label, valor], index) => {
      const x = margem + (index % 3) * 250;

      if (index > 0 && index % 3 === 0) {
        y += 14;
      }

      doc.text(`${label}: ${valor}`, x, y);
    });

    return y + 24;
  };

  const adicionarTabelaPDF = (doc, titulo, colunas, linhas, startY) => {
    const margem = 40;
    let y = startY;

    if (y > 500) {
      doc.addPage();
      y = 40;
    }

    doc.setFontSize(12);
    doc.text(titulo, margem, y);

    const body = linhas.length
      ? linhas
      : [[
          'Nenhum registro encontrado.',
          ...Array(Math.max(colunas.length - 1, 0)).fill('')
        ]];

    autoTable(doc, {
      head: [colunas],
      body,
      startY: y + 8,
      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: 255
      },
      margin: {
        left: margem,
        right: margem
      }
    });

    return doc.lastAutoTable.finalY + 24;
  };

  const handleGerarPDF = () => {
    if (!validarRelatorioAntesGerar()) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    let y = adicionarCabecalhoPDF(doc);

    if (tiposRelatorioAplicados.estoque) {
      y = adicionarTabelaPDF(
        doc,
        'Relatório de Estoque Atual',
        ['#', 'Medicamento', 'Fabricante', 'Categoria', 'Forma', 'Unidade Base', 'Qtde Estoque', 'Validade Mais Próxima', 'Status'],
        montarLinhasEstoque(),
        y
      );
    }

    if (tiposRelatorioAplicados.entradas) {
      y = adicionarTabelaPDF(
        doc,
        'Relatório de Entradas',
        ['#', 'Medicamento', 'Fabricante', 'Lote', 'Validade', 'Quantidade', 'Qtde Base', 'Data Entrada', 'Fornecedor'],
        montarLinhasEntradas(),
        y
      );
    }

    if (tiposRelatorioAplicados.saidas) {
      adicionarTabelaPDF(
        doc,
        'Relatório de Saídas',
        ['#', 'Medicamento', 'Fabricante', 'Tipo Saída', 'Quantidade', 'Qtde Base', 'Data Saída', 'Observação'],
        montarLinhasSaidas(),
        y
      );
    }

    const totalPaginas = doc.internal.getNumberOfPages();
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= totalPaginas; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPaginas}`, largura - 40, altura - 15, {
        align: 'right'
      });
    }

    doc.save('relatorio_medicamentos.pdf');
  };

  const renderCardsResumo = () => (
    <div className="row g-3 mt-2">
      <div className="col-md-3">
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <small className="text-muted">Medicamentos cadastrados</small>
            <h4 className="mb-0">{resumo.totalMedicamentos}</h4>
          </div>
        </div>
      </div>

      {tiposRelatorioAplicados.estoque && (
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Total em estoque</small>
              <h4 className="mb-0">{resumo.totalEstoque}</h4>
            </div>
          </div>
        </div>
      )}

      {tiposRelatorioAplicados.entradas && (
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Total de entradas</small>
              <h4 className="mb-0">{resumo.totalEntradas}</h4>
            </div>
          </div>
        </div>
      )}

      {tiposRelatorioAplicados.saidas && (
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Total de saídas</small>
              <h4 className="mb-0">{resumo.totalSaidas}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabelaEstoque = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Estoque Atual</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Medicamento</th>
                <th>Fabricante</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th>Unidade Base</th>
                <th>Qtde Estoque</th>
                <th>Validade Mais Próxima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {estoqueFiltrado.length > 0 ? (
                estoqueFiltrado.map((med) => {
                  const validadeMaisProxima = obterValidadeMaisProxima(med.id);
                  const estoqueAtual = calcularEstoqueAtual(med.id);

                  return (
                    <tr key={med.id}>
                      <td className="ps-3">
                        <div className="fw-semibold">{med.nome || '-'}</div>
                        <small className="text-muted">{med.nomeComercial || '-'}</small>
                      </td>
                      <td>{med.fabricante || '-'}</td>
                      <td>{formatarCategoria(med.categoria)}</td>
                      <td>{formatarForma(med.forma)}</td>
                      <td>{med.unidadeBase || '-'}</td>
                      <td>
                        <span className="fw-semibold">
                          {estoqueAtual} {med.unidadeBase || ''}
                        </span>
                      </td>
                      <td>
                        {validadeMaisProxima
                          ? validadeMaisProxima.toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge ${med.ativo ? 'bg-success' : 'bg-secondary'}`}>
                          {med.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabelaEntradas = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Entradas</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Medicamento</th>
                <th>Fabricante</th>
                <th>Lote</th>
                <th>Validade</th>
                <th>Quantidade</th>
                <th>Qtde Base</th>
                <th>Data Entrada</th>
                <th>Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              {entradasFiltradas.length > 0 ? (
                entradasFiltradas.map((entrada) => (
                  <tr key={entrada.id}>
                    <td className="ps-3">
                      {entrada.medicamentoNome || nomeMedicamentoPorId(entrada.medicamentoId)}
                    </td>
                    <td>{entrada.fabricante || '-'}</td>
                    <td>{entrada.lote || '-'}</td>
                    <td>{formatarData(entrada.validade)}</td>
                    <td>{formatarQuantidade(entrada.quantidadeInformada, entrada.unidadeInformada)}</td>
                    <td>{formatarQuantidade(entrada.quantidadeBase, entrada.unidadeBase)}</td>
                    <td>{formatarData(entrada.dataEntrada)}</td>
                    <td>{entrada.fornecedor || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabelaSaidas = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Saídas</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Medicamento</th>
                <th>Fabricante</th>
                <th>Tipo Saída</th>
                <th>Quantidade</th>
                <th>Qtde Base</th>
                <th>Data Saída</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {saidasFiltradas.length > 0 ? (
                saidasFiltradas.map((saida) => (
                  <tr key={saida.id}>
                    <td className="ps-3">
                      {saida.medicamentoNome || nomeMedicamentoPorId(saida.medicamentoId)}
                    </td>
                    <td>{saida.fabricante || '-'}</td>
                    <td>{saida.tipoSaida || '-'}</td>
                    <td>{formatarQuantidade(saida.quantidadeInformada, saida.unidadeInformada)}</td>
                    <td>{formatarQuantidade(saida.quantidadeBase, saida.unidadeBase)}</td>
                    <td>{formatarData(saida.dataSaida)}</td>
                    <td>{saida.observacao || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="container mt-5 relatorio-medicamento-page">
        <div className="row justify-content-center">
          <div className="col-lg-12 mt-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-5 mb-4">
              <div>
                <h2 className="titulo-principal mb-1 d-flex align-items-center gap-2">
                  <FaFileAlt />
                  Relatório de Medicamentos
                </h2>
                <p className="text-muted mb-0">
                  Gere relatórios completos de estoque, entradas e saídas de medicamentos.
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleGerarPDF}
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleImprimir}
                >
                  <FaPrint className="me-2" />
                  Imprimir
                </button>
              </div>
            </div>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaFilter />
                  <h5 className="mb-0">Filtros do Relatório</h5>
                </div>

                <div className="row g-3">
                  <div className="col-md-12">
                    <div style={estiloBoxTipos}>
                      <div style={estiloTituloTipos}>
                        Tipos de Relatório
                      </div>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <label
                            htmlFor="tipoEstoque"
                            style={montarEstiloCardTipo(tiposRelatorio.estoque)}
                          >
                            <input
                              type="checkbox"
                              id="tipoEstoque"
                              name="estoque"
                              checked={tiposRelatorio.estoque}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.estoque)}>
                              Estoque Atual
                            </span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            htmlFor="tipoEntradas"
                            style={montarEstiloCardTipo(tiposRelatorio.entradas)}
                          >
                            <input
                              type="checkbox"
                              id="tipoEntradas"
                              name="entradas"
                              checked={tiposRelatorio.entradas}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.entradas)}>
                              Entradas
                            </span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            htmlFor="tipoSaidas"
                            style={montarEstiloCardTipo(tiposRelatorio.saidas)}
                          >
                            <input
                              type="checkbox"
                              id="tipoSaidas"
                              name="saidas"
                              checked={tiposRelatorio.saidas}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.saidas)}>
                              Saídas
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Medicamento</label>
                    <select
                      className="form-select"
                      name="medicamentoId"
                      value={filtros.medicamentoId}
                      onChange={handleChange}
                    >
                      <option value="">Todos</option>
                      {medicamentos.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.nome} - {med.fabricante}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Fabricante</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="fabricante"
                        value={filtros.fabricante}
                        onChange={handleChange}
                        placeholder="Digite o fabricante"
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Dias p/ vencer</label>
                    <input
                      type="number"
                      className="form-control"
                      name="diasVencimento"
                      value={filtros.diasVencimento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataInicial"
                      value={filtros.dataInicial}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataFinal"
                      value={filtros.dataFinal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Validade Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      name="validadeInicial"
                      value={filtros.validadeInicial}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Validade Final</label>
                    <input
                      type="date"
                      className="form-control"
                      name="validadeFinal"
                      value={filtros.validadeFinal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="somenteComEstoque"
                        name="somenteComEstoque"
                        checked={filtros.somenteComEstoque}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="somenteComEstoque">
                        Somente com estoque
                      </label>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="somenteVencendo"
                        name="somenteVencendo"
                        checked={filtros.somenteVencendo}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="somenteVencendo">
                        Somente vencendo
                      </label>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-primary w-100 mt-md-4"
                      onClick={handleBuscarDados}
                    >
                      <FaSearch className="me-2" />
                      Buscar Dados
                    </button>
                  </div>

                  <div className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-md-4"
                      onClick={limparFiltros}
                    >
                      <FaUndo className="me-2" />
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {renderCardsResumo()}

            {carregando ? (
              <div className="alert alert-info mt-4">Carregando relatório...</div>
            ) : !buscaRealizada ? (
              <div className="alert alert-secondary mt-4">
                Preencha os filtros desejados e clique em <strong>Buscar Dados</strong>.
              </div>
            ) : nenhumTipoSelecionado ? (
              <div className="alert alert-warning mt-4">
                Selecione pelo menos um tipo de relatório para visualizar os dados.
              </div>
            ) : (
              <>
                {tiposRelatorioAplicados.estoque && renderTabelaEstoque()}
                {tiposRelatorioAplicados.entradas && renderTabelaEntradas()}
                {tiposRelatorioAplicados.saidas && renderTabelaSaidas()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinariaRelatorioMedicamento;
