import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';
import Modal from 'react-modal';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCamera,
  FaTrashAlt,
  FaHorse,
  FaImages,
  FaClipboardList,
  FaSearchPlus,
  FaPrint,
} from 'react-icons/fa';
import '../../../index.css';
import './Veterinaria.css';

import imgChanfro from '../../assets/imgChanfro.png';
import imgLadoDireito from '../../assets/imgLadoDireito.png';
import imgLadoEsquerdo from '../../assets/imgLadoEsquerdo.png';

Modal.setAppElement('#root');

const estadoInicialEquino = {
  nome: '',
  raca: '',
  pelagem: '',
  registro: '',
  dataNascimento: '',
  situacao: 'APTO',
  altura: '',
  peso: '',
  sexo: '',
  local: '',
  fotoLadoEsquerdo: '',
  fotoLadoDireito: '',
  fotoChanfro: '',
};

const estadoInicialNomesImagens = {
  fotoChanfro: '',
  fotoLadoDireito: '',
  fotoLadoEsquerdo: '',
};

const VeterinariaForm = () => {
  const [equino, setEquino] = useState(estadoInicialEquino);

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagensErro, setMensagensErro] = useState([]);
  const [tooltipAberto, setTooltipAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [imagemAmpliada, setImagemAmpliada] = useState({
    titulo: '',
    src: '',
  });

  const [nomesImagens, setNomesImagens] = useState(estadoInicialNomesImagens);

  const navigate = useNavigate();
  const { id } = useParams();

  const chaveStorageFotos = `equino-fotos-rascunho-${id || 'novo'}`;

  const formatarDataParaInput = (dataOriginal) => {
    if (!dataOriginal) return '';

    if (dataOriginal.includes('-')) {
      const partes = dataOriginal.split('-');

      if (partes[0].length === 4) {
        return dataOriginal;
      }

      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return dataOriginal;
  };

  const lerFotosSalvasLocalmente = () => {
    const fotosSalvas = localStorage.getItem(chaveStorageFotos);

    if (!fotosSalvas) {
      return null;
    }

    try {
      return JSON.parse(fotosSalvas);
    } catch (error) {
      console.error('Erro ao recuperar fotos salvas localmente:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    axios
      .get(`/equino/${id}`)
      .then((response) => {
        const dados = response.data;
        const fotosSalvas = lerFotosSalvasLocalmente();

        setEquino({
          nome: dados.nome ?? '',
          raca: dados.raca ?? '',
          pelagem: dados.pelagem ?? '',
          registro: dados.registro ?? '',
          dataNascimento: formatarDataParaInput(dados.dataNascimento),
          situacao: dados.situacao ?? 'APTO',
          altura: dados.altura ?? '',
          peso: dados.peso ?? '',
          sexo: dados.sexo ?? '',
          local: dados.local ?? '',
          fotoLadoEsquerdo:
            fotosSalvas?.fotoLadoEsquerdo || dados.fotoLadoEsquerdo || '',
          fotoLadoDireito:
            fotosSalvas?.fotoLadoDireito || dados.fotoLadoDireito || '',
          fotoChanfro:
            fotosSalvas?.fotoChanfro || dados.fotoChanfro || '',
        });

        if (fotosSalvas?.nomesImagens) {
          setNomesImagens((prev) => ({
            ...prev,
            ...fotosSalvas.nomesImagens,
          }));
        }
      })
      .catch((error) => console.error('Erro ao buscar equino:', error));
  }, [id, chaveStorageFotos]);

  useEffect(() => {
    const fotosSalvas = lerFotosSalvasLocalmente();

    if (!fotosSalvas) {
      return;
    }

    setEquino((prev) => ({
      ...prev,
      fotoChanfro: fotosSalvas.fotoChanfro || prev.fotoChanfro,
      fotoLadoDireito: fotosSalvas.fotoLadoDireito || prev.fotoLadoDireito,
      fotoLadoEsquerdo: fotosSalvas.fotoLadoEsquerdo || prev.fotoLadoEsquerdo,
    }));

    if (fotosSalvas.nomesImagens) {
      setNomesImagens((prev) => ({
        ...prev,
        ...fotosSalvas.nomesImagens,
      }));
    }
  }, [chaveStorageFotos]);

  const salvarFotosNoStorage = (novasFotos, novosNomes = nomesImagens) => {
    const fotosAtuais = {
      fotoChanfro: equino.fotoChanfro,
      fotoLadoDireito: equino.fotoLadoDireito,
      fotoLadoEsquerdo: equino.fotoLadoEsquerdo,
      ...novasFotos,
      nomesImagens: novosNomes,
    };

    localStorage.setItem(chaveStorageFotos, JSON.stringify(fotosAtuais));
  };

  const normalizarTextoObrigatorio = (valor) => {
    if (typeof valor !== 'string') return valor;
    return valor.trim();
  };

  const montarPayload = () => {
    return {
      nome: normalizarTextoObrigatorio(equino.nome),
      raca: normalizarTextoObrigatorio(equino.raca),
      pelagem: equino.pelagem,
      registro: normalizarTextoObrigatorio(equino.registro),
      dataNascimento: equino.dataNascimento,
      situacao: id ? equino.situacao : 'APTO',
      altura: equino.altura === '' ? null : Number(equino.altura),
      peso: equino.peso === '' ? null : Number(equino.peso),
      sexo: equino.sexo,
      local: equino.local,
      fotoLadoEsquerdo: equino.fotoLadoEsquerdo || null,
      fotoLadoDireito: equino.fotoLadoDireito || null,
      fotoChanfro: equino.fotoChanfro || null,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMensagensErro([]);
    setSalvando(true);
  
    const payload = montarPayload();
  
    console.log('JSON ENVIADO PARA API:');
    console.log(payload);
    console.log(JSON.stringify(payload, null, 2));
  
    const request = id
      ? axios.put(`/equino/${id}`, payload)
      : axios.post('/equino', payload);
  
    request
      .then(() => {
        localStorage.removeItem(chaveStorageFotos);
  
        if (document.activeElement) {
          document.activeElement.blur();
        }
  
        if (id) {
          setModalSucesso(true);
  
          setTimeout(() => {
            setModalSucesso(false);
            navigate('/equino-list?filtro=todos');
          }, 2500);
        } else {
          setModalConfirmacao(true);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const data = error.response.data;
  
          if (Array.isArray(data)) {
            setMensagensErro(data);
          } else if (typeof data === 'object') {
            setMensagensErro(Object.values(data));
          } else {
            setMensagensErro(['Ocorreu um erro ao salvar o equino.']);
          }
  
          setModalErroAberto(true);
        } else {
          console.error('Ocorreu um erro: ', error);
          setMensagensErro(['Ocorreu um erro inesperado.']);
          setModalErroAberto(true);
        }
      })
      .finally(() => {
        setSalvando(false);
      });
  };

  const resetForm = () => {
    setEquino(estadoInicialEquino);
    setNomesImagens(estadoInicialNomesImagens);
    localStorage.removeItem(chaveStorageFotos);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEquino((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = (campo) => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setMensagensErro(['Selecione apenas arquivos de imagem.']);
        setModalErroAberto(true);
        return;
      }

      const limiteMb = 4;
      const tamanhoMb = file.size / (1024 * 1024);

      if (tamanhoMb > limiteMb) {
        setMensagensErro([`A imagem deve ter no máximo ${limiteMb} MB.`]);
        setModalErroAberto(true);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const imagemBase64 = event.target.result;

        const novosNomes = {
          ...nomesImagens,
          [campo]: file.name,
        };

        const novasFotos = {
          fotoChanfro: equino.fotoChanfro,
          fotoLadoDireito: equino.fotoLadoDireito,
          fotoLadoEsquerdo: equino.fotoLadoEsquerdo,
          [campo]: imagemBase64,
        };

        setEquino((prev) => ({
          ...prev,
          [campo]: imagemBase64,
        }));

        setNomesImagens(novosNomes);

        salvarFotosNoStorage(novasFotos, novosNomes);
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  const removerImagem = (campo) => {
    const novasFotos = {
      fotoChanfro: equino.fotoChanfro,
      fotoLadoDireito: equino.fotoLadoDireito,
      fotoLadoEsquerdo: equino.fotoLadoEsquerdo,
      [campo]: '',
    };

    const novosNomes = {
      ...nomesImagens,
      [campo]: '',
    };

    setEquino((prev) => ({
      ...prev,
      [campo]: '',
    }));

    setNomesImagens(novosNomes);

    localStorage.setItem(
      chaveStorageFotos,
      JSON.stringify({
        ...novasFotos,
        nomesImagens: novosNomes,
      })
    );
  };

  const abrirImagemAmpliada = (titulo, src) => {
    if (!src) return;

    setImagemAmpliada({
      titulo,
      src,
    });

    setModalImagemAberto(true);
  };

  const fecharImagemAmpliada = () => {
    setModalImagemAberto(false);
    setImagemAmpliada({
      titulo: '',
      src: '',
    });
  };

  const imprimirImagemAmpliada = () => {
    if (!imagemAmpliada.src) return;

    const janelaImpressao = window.open('', '_blank');

    if (!janelaImpressao) {
      setMensagensErro([
        'Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou pop-ups.',
      ]);
      setModalErroAberto(true);
      return;
    }

    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>${imagemAmpliada.titulo || 'Imagem do Equino'}</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #111827;
            }

            .pagina-impressao {
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }

            .titulo {
              width: 100%;
              text-align: center;
              font-size: 20px;
              font-weight: 700;
              color: #0d6efd;
              margin-bottom: 14px;
              padding-bottom: 10px;
              border-bottom: 1px solid #d1d5db;
            }

            .imagem-wrapper {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            img {
              max-width: 100%;
              max-height: 245mm;
              object-fit: contain;
            }

            @media print {
              .titulo {
                color: #000000;
              }
            }
          </style>
        </head>

        <body>
          <div class="pagina-impressao">
            <div class="titulo">${imagemAmpliada.titulo || 'Imagem do Equino'}</div>

            <div class="imagem-wrapper">
              <img src="${imagemAmpliada.src}" alt="${imagemAmpliada.titulo || 'Imagem do Equino'}" />
            </div>
          </div>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    janelaImpressao.document.close();
  };

  const toggleTooltip = () => {
    setTooltipAberto((prev) => !prev);
  };

  const fecharModalErro = () => {
    setModalErroAberto(false);
  };

  const adicionarOutroProduto = () => {
    setModalConfirmacao(false);
    resetForm();
  };

  const finalizarCadastro = () => {
    setModalConfirmacao(false);
    setModalSucesso(true);
  
    localStorage.removeItem(chaveStorageFotos);
    setEquino(estadoInicialEquino);
    setNomesImagens(estadoInicialNomesImagens);
  
    setTimeout(() => {
      setModalSucesso(false);
      navigate('/equino-list?filtro=todos');
    }, 2500);
  };

  const renderCardImagem = ({ titulo, campo, imagemPadrao }) => {
    const imagemSelecionada = equino[campo];
    const imagemExibida = imagemSelecionada || imagemPadrao;
    const nomeImagem = nomesImagens[campo] || titulo;

    return (
      <div className="equino-foto-card-horizontal">
        <div className="equino-foto-card-topo">
          <div>
            <h6>{titulo}</h6>
          </div>

          {imagemSelecionada && (
            <div className="equino-foto-acoes">
              <button
                type="button"
                className="btn-ampliar-foto-equino"
                onClick={() => abrirImagemAmpliada(nomeImagem, imagemSelecionada)}
                title="Ampliar imagem"
              >
                <FaSearchPlus />
              </button>

              <button
                type="button"
                className="btn-remover-foto-equino"
                onClick={() => removerImagem(campo)}
                title="Remover imagem"
              >
                <FaTrashAlt />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="equino-foto-preview-horizontal"
          onClick={() => handleImageClick(campo)}
          title="Clique para adicionar ou alterar a imagem"
        >
          <img src={imagemExibida} alt={titulo} />

          <div className="equino-foto-overlay">
            <FaCamera />
            <span>{imagemSelecionada ? 'Alterar foto' : 'Adicionar foto'}</span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="container-fluid pagina-cadastro-equino">
        <div className="cadastro-equino-wrapper">
          <div className="cadastro-equino-hero">
            <div className="cadastro-equino-hero-icon">
              <FaHorse />
            </div>

            <div>
              <h2 className="cadastro-equino-titulo">
                {id ? 'Editar Equino' : 'Adicionar Equino'}

                <span className="tooltip-wrapper">
                  <FaQuestionCircle
                    className="tooltip-icon ms-2"
                    onClick={toggleTooltip}
                  />

                  {tooltipAberto && (
                    <div className="tooltip-mensagem">
                      {id
                        ? 'Aqui você pode editar as informações e imagens de um equino já cadastrado.'
                        : 'Aqui você pode adicionar um novo equino ao sistema com dados cadastrais e fotos de identificação.'}
                    </div>
                  )}
                </span>
              </h2>

              <p className="cadastro-equino-subtitulo">
                Cadastre as fotos de identificação e os dados principais do equino.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="cadastro-equino-card cadastro-equino-card-fotos-horizontal">
              <div className="cadastro-equino-card-header premium-header">
                <div className="premium-header-icon">
                  <FaImages />
                </div>

                <div>
                  <h4>Fotos de Identificação</h4>
                </div>
              </div>

              <div className="equino-fotos-grid-horizontal">
                {renderCardImagem({
                  titulo: 'Chanfro',
                  campo: 'fotoChanfro',
                  imagemPadrao: imgChanfro,
                })}

                {renderCardImagem({
                  titulo: 'Lado Direito',
                  campo: 'fotoLadoDireito',
                  imagemPadrao: imgLadoDireito,
                })}

                {renderCardImagem({
                  titulo: 'Lado Esquerdo',
                  campo: 'fotoLadoEsquerdo',
                  imagemPadrao: imgLadoEsquerdo,
                })}
              </div>

              <div className="cadastro-equino-dica">
                <strong>Dica:</strong> prefira fotos nítidas, com boa iluminação e o animal centralizado.
              </div>
            </section>

            <section className="cadastro-equino-card cadastro-equino-card-form cadastro-equino-card-form-wide">
              <div className="cadastro-equino-card-header premium-header">
                <div className="premium-header-icon">
                  <FaClipboardList />
                </div>

                <div>
                  <h4>Dados Cadastrais</h4>
                  <p>Informações principais para identificação, histórico e controle do equino.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="nome" className="form-label">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    className="form-control"
                    value={equino.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="sexo" className="form-label">Sexo</label>
                  <select
                    id="sexo"
                    name="sexo"
                    className="form-select"
                    value={equino.sexo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="MACHO">Macho</option>
                    <option value="FEMEA">Fêmea</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="pelagem" className="form-label">Pelagem</label>
                  <select
                    id="pelagem"
                    name="pelagem"
                    className="form-select"
                    value={equino.pelagem}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="CASTANHO">Castanho</option>
                    <option value="ALAZAO">Alazão</option>
                    <option value="TORDILHO">Tordilho</option>
                    <option value="PRETO">Preto</option>
                    <option value="BAIO">Baio</option>
                    <option value="ROSILHO">Rosilho</option>
                    <option value="ZAINO">Zaino</option>
                    <option value="LOBUNO">Lobuno</option>
                    <option value="PAMPA">Pampa</option>
                    <option value="PALOMINO">Palomino</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="registro" className="form-label">Registro</label>
                  <input
                    type="text"
                    id="registro"
                    name="registro"
                    className="form-control"
                    value={equino.registro}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="dataNascimento" className="form-label">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    id="dataNascimento"
                    name="dataNascimento"
                    className="form-control"
                    value={equino.dataNascimento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="raca" className="form-label">Raça</label>
                  <input
                    type="text"
                    id="raca"
                    name="raca"
                    className="form-control"
                    value={equino.raca}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="altura" className="form-label">Altura</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      id="altura"
                      name="altura"
                      className="form-control"
                      value={equino.altura || ''}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-group-text">m</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label htmlFor="peso" className="form-label">Peso</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      id="peso"
                      name="peso"
                      className="form-control"
                      value={equino.peso || ''}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-group-text">kg</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label htmlFor="local" className="form-label">Unidade</label>
                  <select
                    id="local"
                    name="local"
                    className="form-select"
                    value={equino.local}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="RPMont">RPMont</option>
                    <option value="3ºEPMont">3º EPMont</option>
                  </select>
                </div>

                {id && (
                  <div className="col-md-4">
                    <label htmlFor="situacao" className="form-label">Situação</label>
                    <select
                      id="situacao"
                      name="situacao"
                      className="form-select"
                      value={equino.situacao}
                      onChange={handleChange}
                      required
                    >
                      <option value="APTO">Apto</option>
                      <option value="APTO_COM_RESTRICAO">Apto com restrição</option>
                      <option value="BAIXADO">Baixado</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="cadastro-equino-acoes">
                <Link to="/equino-list?filtro=todos" className="btn btn-outline-danger">
                  Cancelar
                </Link>

                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : id ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </section>
          </form>

          <Modal
            isOpen={modalConfirmacao}
            onRequestClose={() => setModalConfirmacao(false)}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modalContent text-center">
              <FaExclamationTriangle className="icone-interrogacao" />
              <h2 className="mensagem-azul">Deseja adicionar outro equino?</h2>

              <div className="modalButtons mt-3">
                <button onClick={adicionarOutroProduto} className="btn btn-confirmar me-2">
                  Sim
                </button>

                <button onClick={finalizarCadastro} className="btn btn-cancelar">
                  Não
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={modalSucesso}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modalContent text-center">
              <FaCheckCircle className="icone-sucesso" />

              <h2 className="mensagem-azul">
                {id ? 'Dados editados com sucesso!' : 'Equino adicionado com sucesso!'}
              </h2>
            </div>
          </Modal>

          <Modal
            isOpen={modalErroAberto}
            onRequestClose={fecharModalErro}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modalContent text-center">
              <FaExclamationTriangle className="icone-erro" />

              <h2>Ocorreu um erro:</h2>

              {mensagensErro.map((mensagem, index) => (
                <h5 key={index} className="text-danger">
                  {mensagem}
                </h5>
              ))}

              <button onClick={fecharModalErro} className="btn btn-outline-secondary mt-3">
                Fechar
              </button>
            </div>
          </Modal>

          <Modal
            isOpen={modalImagemAberto}
            onRequestClose={fecharImagemAmpliada}
            className="modal-imagem-equino"
            overlayClassName="overlay-imagem-equino"
          >
            <div className="modal-imagem-equino-conteudo">
              <div className="modal-imagem-equino-header">
                <button
                  type="button"
                  className="btn-imprimir-imagem-equino"
                  onClick={imprimirImagemAmpliada}
                  title="Imprimir imagem"
                >
                  <FaPrint />
                </button>

                <h4>{imagemAmpliada.titulo}</h4>

                <button
                  type="button"
                  className="btn-fechar-imagem-equino"
                  onClick={fecharImagemAmpliada}
                  title="Fechar"
                >
                  ×
                </button>
              </div>

              <div className="modal-imagem-equino-body">
                {imagemAmpliada.src && (
                  <img
                    src={imagemAmpliada.src}
                    alt={imagemAmpliada.titulo}
                  />
                )}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default VeterinariaForm;