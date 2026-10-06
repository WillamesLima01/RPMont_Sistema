import React, { useEffect, useState } from 'react';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import jsPDF from 'jspdf';

import resenhaDescritiva from '../../assets/resenhaDescritiva.png';
import { lerMarcacoes, SimboloResenha, LARGURA_RESENHA, ALTURA_RESENHA, corSinal, fimVisivel, pontaSeta, resumoSinal, tamanhoArea, pontosArea } from './ResenhaGrafica';

import './Veterinaria.css';

const VeterinariaRelatorioResenha = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinoId, setEquinoId] = useState('');

  const [equino, setEquino] = useState(null);
  const [resenha, setResenha] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarEquinos();
  }, []);

  const carregarEquinos = async () => {
    try {
      const response = await axios.get('/equino');

      const lista = Array.isArray(response.data)
        ? response.data
        : [];

      const ordenados = [...lista].sort((a, b) =>
        String(a.nome || '').localeCompare(
          String(b.nome || ''),
          'pt-BR'
        )
      );

      setEquinos(ordenados);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);

      setMensagem(
        'Não foi possível carregar os equinos.'
      );
    }
  };

  const filtrar = async () => {
    if (!equinoId) {
      setMensagem('Selecione um equino.');
      return;
    }

    try {
      setCarregando(true);

      setMensagem('');
      setEquino(null);
      setResenha(null);

      const equinoResponse = await axios.get(
        `/equino/${equinoId}`
      );

      const dadosEquino =
        equinoResponse.data;

      setEquino(dadosEquino);

      try {
        const resenhaResponse =
          await axios.get(
            `/resenha_descritiva/${equinoId}`
          );

        const dadosResenha =
          resenhaResponse.data;

        setResenha(dadosResenha);
      } catch (error) {
        if (error.response?.status === 404) {
          setResenha(null);

          setMensagem(
            'Este equino ainda não possui resenha descritiva cadastrada.'
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        'Erro ao buscar a resenha descritiva:',
        error
      );

      setMensagem(
        'Não foi possível carregar a resenha descritiva.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const limpar = () => {
    setEquinoId('');
    setEquino(null);
    setResenha(null);
    setMensagem('');
  };

  const imprimir = () => {
    if (!equino || !resenha) {
      setMensagem(
        'Selecione um equino que possua resenha descritiva.'
      );

      return;
    }

    window.print();
  };

  const carregarImagemComoDataURL = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null);
        return;
      }

      if (src.startsWith('data:image')) {
        resolve(src);
        return;
      }

      const img = new Image();

      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas =
          document.createElement('canvas');

        canvas.width =
          img.naturalWidth;

        canvas.height =
          img.naturalHeight;

        const contexto =
          canvas.getContext('2d');

        contexto.drawImage(
          img,
          0,
          0
        );

        resolve(
          canvas.toDataURL(
            'image/jpeg',
            0.92
          )
        );
      };

      img.onerror = reject;

      img.src = src;
    });
  };

  const gerarPDF = async () => {
    if (!equino || !resenha) {
      setMensagem(
        'Selecione um equino que possua resenha descritiva.'
      );

      return;
    }

    try {
      /*
       * A4 RETRATO
       */
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const larguraPagina =
        doc.internal.pageSize.getWidth();

      const alturaPagina =
        doc.internal.pageSize.getHeight();

      const margem = 12;

      /*
       * CABEÇALHO
       */
      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(16);

      doc.text(
        'RESENHA DESCRITIVA DO EQUINO',
        larguraPagina / 2,
        15,
        {
          align: 'center'
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(10);

      doc.text(
        'Regimento de Polícia Montada',
        larguraPagina / 2,
        21,
        {
          align: 'center'
        }
      );

      /*
       * LINHA DO CABEÇALHO
       */
      doc.setDrawColor(180);

      doc.line(
        margem,
        25,
        larguraPagina - margem,
        25
      );

      /*
       * DADOS DO EQUINO
       *
       * Duas colunas para aproveitar
       * melhor o formato retrato.
       */
      const coluna1 = margem;
      const coluna2 = 108;

      let y = 34;

      const escreverCampo = (
        label,
        valor,
        x,
        yCampo,
        deslocamento
      ) => {
        doc.setFont(
          'helvetica',
          'bold'
        );

        doc.setFontSize(9);

        doc.text(
          label,
          x,
          yCampo
        );

        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.text(
          String(valor || '-'),
          x + deslocamento,
          yCampo
        );
      };

      escreverCampo(
        'Nome:',
        equino.nome,
        coluna1,
        y,
        14
      );

      escreverCampo(
        'Raça:',
        equino.raca,
        coluna2,
        y,
        13
      );

      y += 8;

      escreverCampo(
        'Registro:',
        equino.registro,
        coluna1,
        y,
        19
      );

      escreverCampo(
        'Pelagem:',
        equino.pelagem,
        coluna2,
        y,
        19
      );

      y += 8;

      escreverCampo(
        'Sexo:',
        equino.sexo,
        coluna1,
        y,
        13
      );

      escreverCampo(
        'Unidade:',
        equino.local,
        coluna2,
        y,
        18
      );

      y += 8;

      escreverCampo(
        'Altura:',
        equino.altura
          ? `${equino.altura} m`
          : '-',
        coluna1,
        y,
        15
      );

      escreverCampo(
        'Peso:',
        equino.peso
          ? `${equino.peso} kg`
          : '-',
        coluna2,
        y,
        13
      );

      const marcacoes = lerMarcacoes(resenha.marcacoes);
      const larguraImagem = larguraPagina - margem * 2;
      const alturaImagem = larguraImagem * ALTURA_RESENHA / LARGURA_RESENHA;
      const yImagem = 70;
      const imagem = await carregarImagemComoDataURL(resenhaDescritiva);
      doc.addImage(imagem, 'JPEG', margem, yImagem, larguraImagem, alturaImagem);
      const escala = larguraImagem / LARGURA_RESENHA;
      doc.setLineWidth(0.7);
      marcacoes.forEach((item, indice) => {
        const x = margem + item.x * escala;
        const yPonto = yImagem + item.y * escala;
        const raio = 25 * escala;
        const vermelho = corSinal(item.tipo) === '#c62828';
        doc.setDrawColor(vermelho ? 198 : 36, vermelho ? 40 : 43, vermelho ? 40 : 53);
        doc.setTextColor(vermelho ? 198 : 36, vermelho ? 40 : 43, vermelho ? 40 : 53);
        if (item.tipo === 'circulo') doc.circle(x, yPonto, raio);
        if (item.tipo === 'quadrado') doc.rect(x - raio, yPonto - raio, raio * 2, raio * 2);
        if (['x', 'rodopio'].includes(item.tipo) || item.tipo === 'espiga' && item.comRodopio !== false) {
          doc.line(x - raio, yPonto - raio, x + raio, yPonto + raio);
          doc.line(x + raio, yPonto - raio, x - raio, yPonto + raio);
        }
        if (item.tipo === 'espiga') {
          const fim = fimVisivel(item);
          doc.line(x, yPonto, margem + fim.x * escala, yImagem + fim.y * escala);
        }
        if (item.tipo === 'golpe_lanca') {
          doc.line(x, yPonto - 28 * escala, x + 27 * escala, yPonto + 22 * escala);
          doc.line(x + 27 * escala, yPonto + 22 * escala, x - 27 * escala, yPonto + 22 * escala);
          doc.line(x - 27 * escala, yPonto + 22 * escala, x, yPonto - 28 * escala);
        }
        if (item.tipo === 'cicatriz') {
          const fim = fimVisivel(item);
          const [a, b] = pontaSeta(item);
          const pdfX = (p) => margem + p.x * escala;
          const pdfY = (p) => yImagem + p.y * escala;
          doc.line(x, yPonto, pdfX(fim), pdfY(fim));
          doc.line(pdfX(a), pdfY(a), pdfX(fim), pdfY(fim));
          doc.line(pdfX(b), pdfY(b), pdfX(fim), pdfY(fim));
        }
        if (['mancha_branca', 'despigmentacao'].includes(item.tipo) && (!item.pontos || item.pontos.length < 3)) {
          doc.setFillColor(247, 207, 207);
          doc.ellipse(x, yPonto, 32 * escala * tamanhoArea(item), 22 * escala * tamanhoArea(item), item.tipo === 'despigmentacao' ? 'FD' : 'S');
        }
        if (item.tipo === 'calcado' && (!item.pontos || item.pontos.length < 2)) {
          doc.setLineWidth(1.1);
          const fim = fimVisivel(item);
          doc.line(x, yPonto, margem + fim.x * escala, yImagem + fim.y * escala);
          doc.setLineWidth(0.7);
        }
        if (['mancha_branca', 'despigmentacao'].includes(item.tipo) && item.pontos?.length >= 3 || item.tipo === 'calcado' && item.pontos?.length > 1) {
          const pontos = item.tipo === 'calcado' ? item.pontos : pontosArea(item);
          for (let i = 1; i < pontos.length; i++) {
            const anterior = pontos[i - 1]; const atual = pontos[i];
            doc.line(margem + anterior.x * escala, yImagem + anterior.y * escala,
              margem + atual.x * escala, yImagem + atual.y * escala);
          }
          if (item.tipo === 'despigmentacao') {
            doc.setFillColor(247, 207, 207);
            const passos = pontos.slice(1).map((p, i) => [(p.x - pontos[i].x) * escala, (p.y - pontos[i].y) * escala]);
            doc.lines(passos, margem + pontos[0].x * escala, yImagem + pontos[0].y * escala, [1, 1], 'FD', true);
          }
          if (item.tipo !== 'calcado') {
            const ultimo = pontos.at(-1); const primeiro = pontos[0];
            doc.line(margem + ultimo.x * escala, yImagem + ultimo.y * escala,
              margem + primeiro.x * escala, yImagem + primeiro.y * escala);
          }
        }
        doc.setFontSize(9);
        doc.text(String(indice + 1), Math.min(x + raio + 1, larguraPagina - margem - 3), Math.max(yPonto - raio, yImagem + 3));
      });
      doc.setTextColor(0, 0, 0);
      let yDescricao = yImagem + alturaImagem + 12;
      doc.setDrawColor(200);

      doc.line(
        margem,
        yDescricao - 5,
        larguraPagina - margem,
        yDescricao - 5
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(11);

      doc.text(
        'Resenha Descritiva',
        margem,
        yDescricao
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(9);

      const texto =
        resenha.descricao ||
        'Sem descrição cadastrada.';

      const linhas =
        doc.splitTextToSize(
          texto,
          larguraPagina -
            margem * 2
        );

      const escreverLinhas = (textoLinhas, inicio) => {
        let posicao = inicio;
        textoLinhas.forEach((linha) => {
          if (posicao > alturaPagina - 20) { doc.addPage(); posicao = 18; }
          doc.text(linha, margem, posicao);
          posicao += 5;
        });
        return posicao;
      };
      yDescricao = escreverLinhas(linhas, yDescricao + 7);
      if (marcacoes.length) {
        yDescricao += 5;
        if (yDescricao > alturaPagina - 20) { doc.addPage(); yDescricao = 18; }
        doc.setFont('helvetica', 'bold');
        doc.text('Sinais identificadores', margem, yDescricao);
        doc.setFont('helvetica', 'normal');
        yDescricao += 7;
        marcacoes.forEach((item, indice) => {
          const rotulo = resumoSinal(item);
          yDescricao = escreverLinhas(doc.splitTextToSize(`${indice + 1}. ${rotulo}: ${item.descricao || ''}`, larguraImagem), yDescricao);
          yDescricao += 2;
        });
      }

      /*
       * RODAPÉ
       */
      const dataGeracao =
        new Date().toLocaleString(
          'pt-BR'
        );

      doc.setFontSize(7);

      doc.setTextColor(100);

      doc.text(
        `Gerado em: ${dataGeracao}`,
        margem,
        alturaPagina - 8
      );

      /*
       * SALVAR
       */
      const nomeArquivo =
        `resenha_${String(
          equino.nome || 'equino'
        )
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            ''
          )
          .replace(/\s+/g, '_')
          .toLowerCase()}.pdf`;

      doc.save(nomeArquivo);
    } catch (error) {
      console.error(
        'Erro ao gerar PDF da resenha:',
        error
      );

      setMensagem(
        'Não foi possível gerar o PDF.'
      );
    }
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className="resenha-relatorio-page">
        <div className="resenha-relatorio-toolbar no-print">

          <div>
            <h2 className="titulo-lista mb-1">
              Resenha Descritiva
            </h2>

            <span className="text-muted">
              Consulte e imprima a resenha de um equino
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">

            <select
              className="form-select"
              style={{
                minWidth: '250px'
              }}
              value={equinoId}
              onChange={(e) =>
                setEquinoId(
                  e.target.value
                )
              }
            >
              <option value="">
                Selecione o equino
              </option>

              {equinos.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nome}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              className="btn btn-primary"
              onClick={filtrar}
              disabled={carregando}
            >
              {carregando
                ? 'Carregando...'
                : 'Filtrar'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={limpar}
            >
              Limpar
            </button>

            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={imprimir}
              disabled={
                !equino ||
                !resenha
              }
            >
              <i className="bi bi-printer me-1"></i>

              Imprimir
            </button>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={gerarPDF}
              disabled={
                !equino ||
                !resenha
              }
            >
              PDF
            </button>

          </div>
        </div>

        {mensagem && (
          <div
            className="alert alert-warning no-print mt-3"
            role="alert"
          >
            {mensagem}
          </div>
        )}

        {!equino &&
          !carregando && (
            <div className="resenha-relatorio-vazio no-print">

              <i className="fas fa-horse"></i>

              <h5>
                Selecione um equino para visualizar a resenha
              </h5>
            </div>
          )}

        {equino &&
          resenha && (
            <div
              id="area-resenha-impressao"
              className="resenha-relatorio-documento"
            >

              <div className="resenha-relatorio-cabecalho">

                <h2>
                  RESENHA DESCRITIVA DO EQUINO
                </h2>

                <p>
                  Regimento de Polícia Montada
                </p>

              </div>

              <div className="resenha-relatorio-dados">

                <div>
                  <strong>Nome</strong>
                  <span>
                    {equino.nome || '-'}
                  </span>
                </div>

                <div>
                  <strong>Raça</strong>
                  <span>
                    {equino.raca || '-'}
                  </span>
                </div>

                <div>
                  <strong>Registro</strong>
                  <span>
                    {equino.registro || '-'}
                  </span>
                </div>

                <div>
                  <strong>Pelagem</strong>
                  <span>
                    {equino.pelagem || '-'}
                  </span>
                </div>

                <div>
                  <strong>Sexo</strong>
                  <span>
                    {equino.sexo || '-'}
                  </span>
                </div>

                <div>
                  <strong>Altura</strong>
                  <span>
                    {equino.altura
                      ? `${equino.altura} m`
                      : '-'}
                  </span>
                </div>

                <div>
                  <strong>Peso</strong>
                  <span>
                    {equino.peso
                      ? `${equino.peso} kg`
                      : '-'}
                  </span>
                </div>

                <div>
                  <strong>Unidade</strong>
                  <span>
                    {equino.local || '-'}
                  </span>
                </div>

              </div>

              <div className="my-4">
                <svg viewBox={`0 0 ${LARGURA_RESENHA} ${ALTURA_RESENHA}`}
                  style={{ width: '100%', height: 'auto' }} role="img" aria-label="Resenha gráfica do equino">
                  <image href={resenhaDescritiva} width={LARGURA_RESENHA} height={ALTURA_RESENHA} />
                  {lerMarcacoes(resenha.marcacoes).map((item, indice) => <g key={item.id || indice}>
                    <SimboloResenha item={item} />
                    <text x={item.x + 30} y={item.y - 20} fill={corSinal(item.tipo)} stroke="white"
                      strokeWidth="5" paintOrder="stroke" fontWeight="bold" fontSize="32">{indice + 1}</text>
                  </g>)}
                </svg>
              </div>
              {lerMarcacoes(resenha.marcacoes).length > 0 && <div className="resenha-relatorio-texto">
                <h5>Sinais identificadores</h5>
                <ol>{lerMarcacoes(resenha.marcacoes).map((item, indice) => <li key={item.id || indice}>
                  {resumoSinal(item)}: {item.descricao}
                </li>)}</ol>
              </div>}

              <div className="resenha-relatorio-texto">

                <h5>
                  Resenha Descritiva
                </h5>

                <p>
                  {resenha.descricao ||
                    'Sem descrição cadastrada.'}
                </p>

              </div>

            </div>
          )}
      </div>
    </div>
  );
};

export default VeterinariaRelatorioResenha;
