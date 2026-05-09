import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { FaQuestionCircle } from 'react-icons/fa';
import axios from '../../api';
import './ModalVermifugacao.css';
import ModalGenerico from './ModalGenerico.jsx';

const isoFromDateOnly = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return null;
  return new Date(`${yyyy_mm_dd}T00:00:00.000Z`).toISOString();
};

const dateOnlyFromIso = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    String(d.getUTCFullYear()) +
    '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getUTCDate()).padStart(2, '0')
  );
};

const ModalVacinacao = ({ open, onClose, equino, dadosEditar = null }) => {
  const [dataProximoProcedimento, setDataProximoProcedimento] = useState('');
  const [erroProximaData, setErroProximaData] = useState('');

  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [usarMedicacaoExterna, setUsarMedicacaoExterna] = useState(false);
  const [medicamentosEstoque, setMedicamentosEstoque] = useState([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [doseAplicada, setDoseAplicada] = useState('');
  const [unidadeMedicacao, setUnidadeMedicacao] = useState('');
  const [observacaoMedicacao, setObservacaoMedicacao] = useState('');

  const [nomeMedicacaoExterna, setNomeMedicacaoExterna] = useState('');
  const [doseMedicacaoExterna, setDoseMedicacaoExterna] = useState('');
  const [unidadeMedicacaoExterna, setUnidadeMedicacaoExterna] = useState('mL');
  const [observacaoMedicacaoExterna, setObservacaoMedicacaoExterna] = useState('');

  const [entradasMedicamento, setEntradasMedicamento] = useState([]);
  const [saidasMedicamento, setSaidasMedicamento] = useState([]);
  const [saidaExistente, setSaidaExistente] = useState(null);

  const unidadesMedicacao = ['mL', 'L', 'mg', 'g', 'kg', 'UN'];

  const getNomeMedicamento = (med) =>
    med?.nomeMedicamento || med?.nome || med?.descricao || 'Sem nome';

  const getFabricanteMedicamento = (med) => med?.fabricante || '';

  const getUnidadeMedicamento = (med) =>
    med?.unidadeBase || med?.unidadeConteudo || med?.unidade || '';

  const getQuantidadeDisponivel = (med, ignorarSaidaId = null) => {
    if (!med) return 0;

    const medicamentoId = String(med.id);

    const totalEntradas = (entradasMedicamento || [])
      .filter((e) => String(e.medicamentoId) === medicamentoId)
      .reduce((acc, e) => acc + Number(e.quantidadeBase || 0), 0);

    const totalSaidas = (saidasMedicamento || [])
      .filter((s) => {
        if (String(s.medicamentoId) !== medicamentoId) return false;
        if (ignorarSaidaId && String(s.id) === String(ignorarSaidaId)) return false;
        return true;
      })
      .reduce((acc, s) => acc + Number(s.quantidadeBase || 0), 0);

    return totalEntradas - totalSaidas;
  };

  const abrirErro = (texto) => {
    setMensagemErro(texto);
    setModalErroAberto(true);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [medicamentosRes, entradasRes, saidasRes] = await Promise.all([
          axios.get('/medicamentos'),
          axios.get('/entradas_medicamento'),
          axios.get('/saidas_medicamento'),
        ]);

        const medicamentosData = (medicamentosRes.data || []).filter((m) => m.ativo !== false);
        const entradasData = entradasRes.data || [];
        const saidasData = saidasRes.data || [];

        setMedicamentosEstoque(medicamentosData);
        setEntradasMedicamento(entradasData);
        setSaidasMedicamento(saidasData);

        if (dadosEditar) {
          setDataProximoProcedimento(dateOnlyFromIso(dadosEditar.dataProximoProcedimento));

          const saidaVinculada =
            saidasData.find(
              (s) =>
                s.tipoSaida === 'VACINACAO' &&
                String(s.vacinacaoId) === String(dadosEditar.id)
            ) || null;

          setSaidaExistente(saidaVinculada);

          if (saidaVinculada) {
            const ehExterno = Boolean(saidaVinculada.medicacaoExterna);
            setUsarMedicacaoExterna(ehExterno);

            if (ehExterno) {
              setNomeMedicacaoExterna(
                saidaVinculada.medicamentoNome || dadosEditar.nomeVacina || ''
              );
              setDoseMedicacaoExterna(
                saidaVinculada.quantidadeInformada !== undefined &&
                  saidaVinculada.quantidadeInformada !== null
                  ? String(saidaVinculada.quantidadeInformada)
                  : ''
              );
              setUnidadeMedicacaoExterna(saidaVinculada.unidadeInformada || 'mL');
              setObservacaoMedicacaoExterna(
                saidaVinculada.observacao || dadosEditar.observacao || ''
              );

              setMedicamentoSelecionado(null);
              setDoseAplicada('');
              setUnidadeMedicacao('');
              setObservacaoMedicacao('');
            } else {
              const medEncontrado =
                medicamentosData.find(
                  (m) => String(m.id) === String(saidaVinculada.medicamentoId)
                ) || null;

              setMedicamentoSelecionado(medEncontrado);
              setDoseAplicada(
                saidaVinculada.quantidadeInformada !== undefined &&
                  saidaVinculada.quantidadeInformada !== null
                  ? String(saidaVinculada.quantidadeInformada)
                  : ''
              );
              setUnidadeMedicacao(
                saidaVinculada.unidadeInformada ||
                  getUnidadeMedicamento(medEncontrado) ||
                  ''
              );
              setObservacaoMedicacao(
                saidaVinculada.observacao || dadosEditar.observacao || ''
              );

              setNomeMedicacaoExterna('');
              setDoseMedicacaoExterna('');
              setUnidadeMedicacaoExterna('mL');
              setObservacaoMedicacaoExterna('');
            }
          } else {
            setUsarMedicacaoExterna(false);
            setMedicamentoSelecionado(null);
            setDoseAplicada('');
            setUnidadeMedicacao('');
            setObservacaoMedicacao(dadosEditar.observacao || '');

            setNomeMedicacaoExterna(dadosEditar.nomeVacina || '');
            setDoseMedicacaoExterna('');
            setUnidadeMedicacaoExterna('mL');
            setObservacaoMedicacaoExterna(dadosEditar.observacao || '');
          }
        } else {
          setDataProximoProcedimento('');
          setErroProximaData('');

          setUsarMedicacaoExterna(false);
          setMedicamentoSelecionado(null);
          setDoseAplicada('');
          setUnidadeMedicacao('');
          setObservacaoMedicacao('');

          setNomeMedicacaoExterna('');
          setDoseMedicacaoExterna('');
          setUnidadeMedicacaoExterna('mL');
          setObservacaoMedicacaoExterna('');

          setSaidaExistente(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da vacinação:', error);
        abrirErro('Erro ao carregar dados do modal de vacinação.');
      }
    };

    if (open) {
      carregarDados();
    }
  }, [open, dadosEditar]);

  useEffect(() => {
    if (medicamentoSelecionado && !saidaExistente && !usarMedicacaoExterna) {
      const unidade = getUnidadeMedicamento(medicamentoSelecionado);
      if (unidade) setUnidadeMedicacao(unidade);
    }
  }, [medicamentoSelecionado, saidaExistente, usarMedicacaoExterna]);

  const validarProximaData = () => {
    if (!dataProximoProcedimento) {
      setErroProximaData('');
      return true;
    }

    const hoje = new Date();
    const d = new Date(`${dataProximoProcedimento}T00:00:00`);
    const hojeSemHora = new Date(
      Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())
    );
    const dataSemHora = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );

    if (dataSemHora < hojeSemHora) {
      setErroProximaData('A data do próximo procedimento não pode estar no passado.');
      return false;
    }

    setErroProximaData('');
    return true;
  };

  const validarMedicacao = () => {
    if (usarMedicacaoExterna) {
      if (!nomeMedicacaoExterna.trim()) {
        abrirErro('Informe o nome da vacina externa.');
        return false;
      }

      if (!doseMedicacaoExterna || Number(doseMedicacaoExterna) <= 0) {
        abrirErro('Informe uma dose válida da vacina externa.');
        return false;
      }

      if (!unidadeMedicacaoExterna.trim()) {
        abrirErro('Informe a unidade da vacina externa.');
        return false;
      }

      return true;
    }

    if (!medicamentoSelecionado) {
      abrirErro('Selecione uma vacina do estoque.');
      return false;
    }

    if (!doseAplicada || Number(doseAplicada) <= 0) {
      abrirErro('Informe uma dose aplicada válida.');
      return false;
    }

    if (!unidadeMedicacao.trim()) {
      abrirErro('Informe a unidade da medicação.');
      return false;
    }

    const qtdDisponivel = getQuantidadeDisponivel(
      medicamentoSelecionado,
      saidaExistente?.id || null
    );
    const qtdSaida = Number(doseAplicada);

    if (qtdSaida > qtdDisponivel) {
      abrirErro(
        `Quantidade insuficiente no estoque. Disponível: ${qtdDisponivel} ${
          getUnidadeMedicamento(medicamentoSelecionado) || ''
        }`.trim()
      );
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarProximaData()) return;
    if (!validarMedicacao()) return;
  
    if (!equino?.id) {
      abrirErro('Equino não identificado.');
      return;
    }
  
    const nomeVacinaFinal = usarMedicacaoExterna
      ? nomeMedicacaoExterna.trim()
      : getNomeMedicamento(medicamentoSelecionado);
  
    const observacaoFinal = usarMedicacaoExterna
      ? observacaoMedicacaoExterna.trim()
      : observacaoMedicacao.trim();
  
    const qtdeMedicamento = usarMedicacaoExterna
      ? Number(doseMedicacaoExterna)
      : Number(doseAplicada);
  
    const unidadeMedicamento = usarMedicacaoExterna
      ? unidadeMedicacaoExterna.trim().toUpperCase()
      : unidadeMedicacao.trim().toUpperCase();
  
    const payloadVacinacao = {
      equinoId: Number(equino.id),
      nomeVacina: nomeVacinaFinal,
      qtdeMedicamento,
      unidadeMedicamento,
      observacao: observacaoFinal,
      data: dadosEditar?.data || new Date().toISOString(),
      ...(dataProximoProcedimento
        ? { dataProximoProcedimento: isoFromDateOnly(dataProximoProcedimento) }
        : {}),
    };
  
    try {
      
      if (dadosEditar?.id) {
        await axios.put(`/vacinacao/${dadosEditar.id}`, {
          ...dadosEditar,
          ...payloadVacinacao,
        });
  
        if (usarMedicacaoExterna) {
          setModalSucessoAberto(true);
  
          setTimeout(() => {
            setModalSucessoAberto(false);
            onClose();
          }, 2000);
  
          return;
        }
  
        if (!saidaExistente?.id) {
          abrirErro(
            'Não foi possível localizar a saída de medicamento vinculada a esta vacinação.'
          );
          return;
        }
  
        const medAtual = medicamentosEstoque.find(
          (m) => String(m.id) === String(medicamentoSelecionado.id)
        );
  
        if (!medAtual) {
          abrirErro('Vacina do estoque não encontrada.');
          return;
        }
  
        const payloadSaidaAtualizada = {
          medicamentoId: Number(medAtual.id),
          atendimentoId: null,
          vermifugacaoId: null,
          vacinacaoId: Number(dadosEditar.id),
          equinoId: Number(equino.id),
          tipoSaida: 'VACINACAO',
          quantidadeInformada: Number(doseAplicada),
          unidadeInformada: unidadeMedicacao.trim().toUpperCase(),
          dataSaida: new Date().toISOString().slice(0, 10),
          observacao:
            observacaoMedicacao.trim() ||
            `Uso em vacinação do equino ${equino?.nome || ''}`.trim(),
        };
  
        console.log(
          'Payload atualizado para saidas_medicamento:',
          payloadSaidaAtualizada
        );
  
        await axios.put(
          `/saidas_medicamento/${saidaExistente.id}`,
          payloadSaidaAtualizada
        );
  
        setModalSucessoAberto(true);
  
        setTimeout(() => {
          setModalSucessoAberto(false);
          onClose();
        }, 2000);
  
        return;
      }  
      
      const response = await axios.post('/vacinacao', payloadVacinacao);
      const vacinacaoSalva = response.data;
  
      if (usarMedicacaoExterna) {
        setModalSucessoAberto(true);
  
        setTimeout(() => {
          setModalSucessoAberto(false);
          onClose();
        }, 2000);
  
        return;
      }
  
      const medAtual = medicamentosEstoque.find(
        (m) => String(m.id) === String(medicamentoSelecionado.id)
      );
  
      if (!medAtual) {
        abrirErro('Vacina do estoque não encontrada.');
        return;
      }
  
      const payloadSaida = {
        medicamentoId: Number(medAtual.id),
        atendimentoId: null,
        vermifugacaoId: null,
        vacinacaoId: Number(vacinacaoSalva.id),
        equinoId: Number(equino.id),
        tipoSaida: 'VACINACAO',
        quantidadeInformada: Number(doseAplicada),
        unidadeInformada: unidadeMedicacao.trim().toUpperCase(),
        dataSaida: new Date().toISOString().slice(0, 10),
        observacao:
          observacaoMedicacao.trim() ||
          `Uso em vacinação do equino ${equino?.nome || ''}`.trim(),
      };
  
      console.log('Payload enviado para saidas_medicamento:', payloadSaida);
  
      await axios.post('/saidas_medicamento', payloadSaida);
  
      setModalSucessoAberto(true);
  
      setTimeout(() => {
        setModalSucessoAberto(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar vacinação:', error);
      console.log('Erro backend:', error.response?.data);
      abrirErro('Erro ao salvar vacinação e movimentação de estoque.');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className="modal-vermifugacao">
          <Typography variant="h6" component="h2" className="text-primary">
            {dadosEditar ? 'Editar Vacinação' : 'Nova Vacinação'}
          </Typography>

          <div className="mb-3">
            <Typography variant="subtitle1">
              <strong>Nome:</strong> {equino?.nome}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Registro:</strong> {equino?.registro}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Raça:</strong> {equino?.raca}
            </Typography>
          </div>

          <TextField
            label="Próxima dose (opcional)"
            type="date"
            fullWidth
            className="mt-3"
            InputLabelProps={{ shrink: true }}
            value={dataProximoProcedimento}
            onChange={(e) => setDataProximoProcedimento(e.target.value)}
            onBlur={validarProximaData}
            error={!!erroProximaData}
            helperText={
              erroProximaData ||
              'Defina quando deverá ocorrer a próxima vacinação.'
            }
          />

          <div className="mt-3 p-3 border rounded">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <Typography variant="subtitle1">
                <strong>Vacina utilizada</strong>
              </Typography>

              <div className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={usarMedicacaoExterna}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUsarMedicacaoExterna(checked);

                        if (checked) {
                          setMedicamentoSelecionado(null);
                          setDoseAplicada('');
                          setUnidadeMedicacao('');
                          setObservacaoMedicacao('');
                          setNomeMedicacaoExterna('');
                          setDoseMedicacaoExterna('');
                          setUnidadeMedicacaoExterna('mL');
                          setObservacaoMedicacaoExterna('');
                        } else {
                          setNomeMedicacaoExterna('');
                          setDoseMedicacaoExterna('');
                          setUnidadeMedicacaoExterna('mL');
                          setObservacaoMedicacaoExterna('');
                          setMedicamentoSelecionado(null);
                          setDoseAplicada('');
                          setUnidadeMedicacao('');
                          setObservacaoMedicacao('');
                        }
                      }}
                    />
                  }
                  label="Usar vacina externa"
                />

                <Tooltip title="Esta opção é para uso de vacina particular que não esteja cadastrada no banco de dados.">
                  <IconButton size="small">
                    <FaQuestionCircle />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {!usarMedicacaoExterna ? (
              <>
                <Autocomplete
                  className="mt-2"
                  options={medicamentosEstoque}
                  value={medicamentoSelecionado}
                  onChange={(e, newValue) => {
                    setMedicamentoSelecionado(newValue);

                    if (newValue && !saidaExistente) {
                      const unidade = getUnidadeMedicamento(newValue);
                      if (unidade) setUnidadeMedicacao(unidade);
                    }
                  }}
                  getOptionLabel={(option) =>
                    `${getNomeMedicamento(option)}${
                      option
                        ? ` (Disp.: ${getQuantidadeDisponivel(
                            option,
                            saidaExistente?.id || null
                          )} ${getUnidadeMedicamento(option) || ''})`
                        : ''
                    }`
                  }
                  isOptionEqualToValue={(option, value) =>
                    String(option.id) === String(value.id)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Vacina do estoque" fullWidth />
                  )}
                />

                <div className="row mt-2">
                  <div className="col-md-4">
                    <TextField
                      label="Dose aplicada"
                      type="number"
                      fullWidth
                      value={doseAplicada}
                      onChange={(e) => setDoseAplicada(e.target.value)}
                      inputProps={{ min: 0, step: 'any' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <TextField
                      label="Unidade"
                      fullWidth
                      value={unidadeMedicacao}
                      onChange={(e) => setUnidadeMedicacao(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4 d-flex align-items-center">
                    {medicamentoSelecionado && (
                      <Typography variant="body2" color="text.secondary">
                        Disponível:{' '}
                        {getQuantidadeDisponivel(
                          medicamentoSelecionado,
                          saidaExistente?.id || null
                        )}{' '}
                        {getUnidadeMedicamento(medicamentoSelecionado) || ''}
                      </Typography>
                    )}
                  </div>
                </div>

                <TextField
                  label="Observação"
                  multiline
                  rows={2}
                  fullWidth
                  className="mt-3"
                  value={observacaoMedicacao}
                  onChange={(e) => setObservacaoMedicacao(e.target.value)}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Nome da vacina externa"
                  fullWidth
                  className="mt-2"
                  value={nomeMedicacaoExterna}
                  onChange={(e) => setNomeMedicacaoExterna(e.target.value)}
                />

                <div className="row mt-2">
                  <div className="col-md-6">
                    <TextField
                      label="Dose aplicada"
                      type="number"
                      fullWidth
                      value={doseMedicacaoExterna}
                      onChange={(e) => setDoseMedicacaoExterna(e.target.value)}
                      inputProps={{ min: 0, step: 'any' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <TextField
                      select
                      label="Unidade"
                      fullWidth
                      value={unidadeMedicacaoExterna}
                      onChange={(e) => setUnidadeMedicacaoExterna(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    >
                      {unidadesMedicacao.map((unidade) => (
                        <MenuItem key={unidade} value={unidade}>
                          {unidade}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                </div>

                <TextField
                  label="Observação"
                  multiline
                  rows={2}
                  fullWidth
                  className="mt-3"
                  value={observacaoMedicacaoExterna}
                  onChange={(e) => setObservacaoMedicacaoExterna(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={handleSalvar}>
              {dadosEditar ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </div>
        </Box>
      </Modal>

      <ModalGenerico
        open={modalSucessoAberto}
        onClose={() => setModalSucessoAberto(false)}
        tipo="mensagem"
        titulo="Sucesso"
        subtitulo={
          dadosEditar
            ? 'Vacinação atualizada com sucesso.'
            : 'Vacinação registrada com sucesso.'
        }
        cor="success"
        tamanho="pequeno"
      />

      <ModalGenerico
        open={modalErroAberto}
        onClose={() => setModalErroAberto(false)}
        tipo="mensagem"
        titulo="Atenção"
        subtitulo={mensagemErro || 'Verifique os dados informados.'}
        cor="error"
        tamanho="pequeno"
        tempoDeDuracao={3000}
      />
    </>
  );
};

export default ModalVacinacao;