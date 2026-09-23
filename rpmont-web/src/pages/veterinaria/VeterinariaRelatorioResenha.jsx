import React, { useEffect, useState } from 'react';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import jsPDF from 'jspdf';

import imgChanfro from '../../assets/imgChanfro.png';
import imgLadoDireito from '../../assets/imgLadoDireito.png';
import imgLadoEsquerdo from '../../assets/imgLadoEsquerdo.png';

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

  const obterImgChanfro = () =>
    resenha?.imgChanfro ||
    resenha?.img_chanfro ||
    imgChanfro;

  const obterImgLadoDireito = () =>
    resenha?.imgladoDireito ||
    resenha?.imgLadoDireito ||
    resenha?.img_lado_direito ||
    imgLadoDireito;

  const obterImgLadoEsquerdo = () =>
    resenha?.imgladoEsquerdo ||
    resenha?.imgLadoEsquerdo ||
    resenha?.img_lado_esquerdo ||
    imgLadoEsquerdo;

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

      /*
       * CARREGAMENTO DAS IMAGENS
       */
      const imagens =
        await Promise.all([
          carregarImagemComoDataURL(
            obterImgChanfro()
          ),

          carregarImagemComoDataURL(
            obterImgLadoDireito()
          ),

          carregarImagemComoDataURL(
            obterImgLadoEsquerdo()
          )
        ]);

      /*
       * FOTO DO CHANFRO
       */
      const larguraChanfro = 65;
      const alturaChanfro = 55;

      const xChanfro =
        (larguraPagina -
          larguraChanfro) /
        2;

      const yChanfro = 70;

      if (imagens[0]) {
        doc.addImage(
          imagens[0],
          'JPEG',
          xChanfro,
          yChanfro,
          larguraChanfro,
          alturaChanfro
        );
      }

      doc.setFontSize(9);

      doc.text(
        'Chanfro',
        larguraPagina / 2,
        yChanfro +
          alturaChanfro +
          5,
        {
          align: 'center'
        }
      );

      /*
       * IMAGENS LATERAIS
       */
      const larguraLateral = 82;
      const alturaLateral = 55;

      const espacamento = 8;

      const larguraTotal =
        larguraLateral * 2 +
        espacamento;

      const xInicial =
        (larguraPagina -
          larguraTotal) /
        2;

      const yLateral = 137;

      if (imagens[1]) {
        doc.addImage(
          imagens[1],
          'JPEG',
          xInicial,
          yLateral,
          larguraLateral,
          alturaLateral
        );
      }

      if (imagens[2]) {
        doc.addImage(
          imagens[2],
          'JPEG',
          xInicial +
            larguraLateral +
            espacamento,
          yLateral,
          larguraLateral,
          alturaLateral
        );
      }

      doc.text(
        'Lado Direito',
        xInicial +
          larguraLateral / 2,
        yLateral +
          alturaLateral +
          5,
        {
          align: 'center'
        }
      );

      doc.text(
        'Lado Esquerdo',
        xInicial +
          larguraLateral +
          espacamento +
          larguraLateral / 2,
        yLateral +
          alturaLateral +
          5,
        {
          align: 'center'
        }
      );

      /*
       * RESENHA DESCRITIVA
       */
      const yDescricao =
        yLateral +
        alturaLateral +
        16;

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

      doc.text(
        linhas,
        margem,
        yDescricao + 7
      );

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

              <div className="resenha-relatorio-imagens">

                <div>
                  <img
                    src={obterImgChanfro()}
                    alt="Chanfro"
                  />

                  <span>
                    Chanfro
                  </span>
                </div>

                <div>
                  <img
                    src={obterImgLadoDireito()}
                    alt="Lado Direito"
                  />

                  <span>
                    Lado Direito
                  </span>
                </div>

                <div>
                  <img
                    src={obterImgLadoEsquerdo()}
                    alt="Lado Esquerdo"
                  />

                  <span>
                    Lado Esquerdo
                  </span>
                </div>

              </div>

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