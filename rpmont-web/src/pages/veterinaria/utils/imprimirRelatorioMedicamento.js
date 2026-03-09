const escaparHtml = (valor) => {
    if (valor === null || valor === undefined) return '-';
  
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  export const imprimirRelatorioMedicamento = ({
    tiposRelatorio,
    estoqueFiltrado,
    entradasFiltradas,
    saidasFiltradas,
    entradas,
    resumo,
    calcularEstoqueAtual,
    formatarData,
    nomeMedicamentoPorId
  }) => {
    const titulo = 'Relatório de Medicamentos';
    const dataHora = new Date().toLocaleString('pt-BR');
  
    const estilos = `
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
  
        body {
          font-family: Arial, sans-serif;
          color: #000;
          margin: 0;
          padding: 0;
        }
  
        .cabecalho {
          text-align: center;
          margin-bottom: 16px;
        }
  
        .cabecalho h1 {
          font-size: 20px;
          margin: 0 0 6px 0;
        }
  
        .cabecalho p {
          margin: 0;
          font-size: 12px;
          color: #444;
        }
  
        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 12px;
        }
  
        .secao {
          margin-top: 20px;
        }
  
        .secao h2 {
          font-size: 15px;
          margin: 0 0 8px 0;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
        }
  
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
  
        th, td {
          border: 1px solid #000;
          padding: 6px;
          text-align: left;
          vertical-align: top;
          word-break: break-word;
        }
  
        thead {
          display: table-header-group;
        }
  
        tr {
          page-break-inside: avoid;
        }
  
        .resumo {
          margin-top: 16px;
          margin-bottom: 12px;
          font-size: 12px;
        }
  
        .resumo strong {
          display: inline-block;
          min-width: 160px;
        }
      </style>
    `;
  
    const montarTabelaEstoque = () => {
      if (!tiposRelatorio.estoque) return '';
  
      const linhas = estoqueFiltrado.length
        ? estoqueFiltrado.map((med) => {
            const entradasDoMedicamento = entradas.filter(
              (entrada) => String(entrada.medicamentoId) === String(med.id)
            );
  
            const validadeMaisProxima = entradasDoMedicamento
              .filter((e) => e.validade)
              .map((e) => new Date(`${e.validade}T00:00:00`))
              .sort((a, b) => a - b)[0];
  
            const estoqueAtual = calcularEstoqueAtual(med.id);
  
            return `
              <tr>
                <td>${escaparHtml(med.nome || '-')}</td>
                <td>${escaparHtml(med.fabricante || '-')}</td>
                <td>${escaparHtml(med.categoria || '-')}</td>
                <td>${escaparHtml(med.forma || '-')}</td>
                <td>${escaparHtml(med.unidadeBase || '-')}</td>
                <td>${escaparHtml(`${estoqueAtual} ${med.unidadeBase || ''}`.trim())}</td>
                <td>${escaparHtml(validadeMaisProxima ? validadeMaisProxima.toLocaleDateString('pt-BR') : '-')}</td>
                <td>${escaparHtml(med.ativo ? 'Ativo' : 'Inativo')}</td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="8">Nenhum registro encontrado.</td></tr>`;
  
      return `
        <div class="secao">
          <h2>Relatório de Estoque Atual</h2>
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Fabricante</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th>Unidade Base</th>
                <th>Qtde Estoque</th>
                <th>Validade Mais Próxima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      `;
    };
  
    const montarTabelaEntradas = () => {
      if (!tiposRelatorio.entradas) return '';
  
      const linhas = entradasFiltradas.length
        ? entradasFiltradas.map((entrada) => `
            <tr>
              <td>${escaparHtml(entrada.medicamentoNome || nomeMedicamentoPorId(entrada.medicamentoId))}</td>
              <td>${escaparHtml(entrada.fabricante || '-')}</td>
              <td>${escaparHtml(entrada.lote || '-')}</td>
              <td>${escaparHtml(formatarData(entrada.validade))}</td>
              <td>${escaparHtml(`${entrada.quantidadeInformada || '-'} ${entrada.unidadeInformada || ''}`.trim())}</td>
              <td>${escaparHtml(`${entrada.quantidadeBase || '-'} ${entrada.unidadeBase || ''}`.trim())}</td>
              <td>${escaparHtml(formatarData(entrada.dataEntrada))}</td>
              <td>${escaparHtml(entrada.fornecedor || '-')}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="8">Nenhum registro encontrado.</td></tr>`;
  
      return `
        <div class="secao">
          <h2>Relatório de Entradas</h2>
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Fabricante</th>
                <th>Lote</th>
                <th>Validade</th>
                <th>Quantidade</th>
                <th>Qtde Base</th>
                <th>Data Entrada</th>
                <th>Fornecedor</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      `;
    };
  
    const montarTabelaSaidas = () => {
      if (!tiposRelatorio.saidas) return '';
  
      const linhas = saidasFiltradas.length
        ? saidasFiltradas.map((saida) => `
            <tr>
              <td>${escaparHtml(saida.medicamentoNome || nomeMedicamentoPorId(saida.medicamentoId))}</td>
              <td>${escaparHtml(saida.fabricante || '-')}</td>
              <td>${escaparHtml(saida.tipoSaida || '-')}</td>
              <td>${escaparHtml(`${saida.quantidadeInformada || '-'} ${saida.unidadeInformada || ''}`.trim())}</td>
              <td>${escaparHtml(`${saida.quantidadeBase || '-'} ${saida.unidadeBase || ''}`.trim())}</td>
              <td>${escaparHtml(formatarData(saida.dataSaida))}</td>
              <td>${escaparHtml(saida.observacao || '-')}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="7">Nenhum registro encontrado.</td></tr>`;
  
      return `
        <div class="secao">
          <h2>Relatório de Saídas</h2>
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Fabricante</th>
                <th>Tipo Saída</th>
                <th>Quantidade</th>
                <th>Qtde Base</th>
                <th>Data Saída</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      `;
    };
  
    const html = `
      <html>
        <head>
          <title>${titulo}</title>
          ${estilos}
        </head>
        <body>
          <div class="meta">
            <span>${escaparHtml(dataHora)}</span>
            <span>Regimento Coronel Calixto</span>
          </div>
  
          <div class="cabecalho">
            <h1>${titulo}</h1>
            <p>Relatório gerado com base nos filtros selecionados.</p>
          </div>
  
          <div class="resumo">
            <div><strong>Medicamentos cadastrados:</strong> ${escaparHtml(resumo.totalMedicamentos)}</div>
            <div><strong>Total em estoque:</strong> ${escaparHtml(resumo.totalEstoque)}</div>
            <div><strong>Total de entradas:</strong> ${escaparHtml(resumo.totalEntradas)}</div>
            <div><strong>Total de saídas:</strong> ${escaparHtml(resumo.totalSaidas)}</div>
          </div>
  
          ${montarTabelaEstoque()}
          ${montarTabelaEntradas()}
          ${montarTabelaSaidas()}
        </body>
      </html>
    `;
  
    const janela = window.open('', '_blank', 'width=1000,height=700');
  
    if (!janela) {
      window.alert('Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou pop-up.');
      return;
    }
  
    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  
    janela.focus();
  
    setTimeout(() => {
      janela.print();
      janela.close();
    }, 400);
  };