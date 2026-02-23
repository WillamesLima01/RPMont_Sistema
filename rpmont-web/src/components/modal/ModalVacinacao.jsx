import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import axios from '../../api';
import './ModalVermifugacao.css';
import ModalGenerico from './ModalGenerico.jsx';

const isoFromDateOnly = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return null;
  // grava às 00:00:00Z do dia
  return new Date(`${yyyy_mm_dd}T00:00:00.000Z`).toISOString();
};

const dateOnlyFromIso = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  // formata yyyy-mm-dd pro input type="date"
  return String(d.getUTCFullYear()) + '-' +
         String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
         String(d.getUTCDate()).padStart(2, '0');
};

const ModalVacinacao = ({ open, onClose, equino, dadosEditar = null }) => {
  const [nomeVacina, setNomeVacina] = useState('');
  const [observacao, setObservacao] = useState('');
  const [vacinasAnteriores, setVacinasAnteriores] = useState([]);
  const [dataProximoProcedimento, setDataProximoProcedimento] = useState(''); // yyyy-mm-dd

  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  useEffect(() => {
    const carregarVacinas = async () => {
      try {
        const { data } = await axios.get('/vacinacoes');
        const nomes = [...new Set(data.map(v => v.nomeVacina).filter(Boolean))];
        setVacinasAnteriores(nomes);
      } catch (error) {
        console.error('Erro ao buscar vacinas:', error);
      }
    };

    if (open) {
      carregarVacinas();

      if (dadosEditar) {
        setNomeVacina(dadosEditar.nomeVacina || '');
        setObservacao(dadosEditar.observacao || '');
        setDataProximoProcedimento(dateOnlyFromIso(dadosEditar.dataProximoProcedimento));
      } else {
        setNomeVacina('');
        setObservacao('');
        setDataProximoProcedimento('');
      }
    }
  }, [open, dadosEditar]);

  const handleSalvar = async () => {
    if (!nomeVacina.trim()) {
      setModalErroAberto(true);
      return;
    }

    // (opcional) recusa data passada
    if (dataProximoProcedimento) {
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      const escolhida = new Date(`${dataProximoProcedimento}T00:00:00`);
      if (escolhida < hoje) {
        alert('A data do próximo procedimento não pode ser anterior a hoje.');
        return;
      }
    }

    const payload = {
      id_Eq: equino.id,
      nomeVacina: nomeVacina.trim(),
      observacao: observacao.trim(),
      data: new Date().toISOString(),
      // salva somente se o usuário informou
      ...(dataProximoProcedimento
        ? { dataProximoProcedimento: isoFromDateOnly(dataProximoProcedimento) }
        : {})
    };

    try {
      if (dadosEditar) {
        await axios.put(`/vacinacoes/${dadosEditar.id}`, { ...dadosEditar, ...payload });
      } else {
        await axios.post('/vacinacoes', payload);
      }

      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar vacinação:', error);
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
            <Typography variant="subtitle1"><strong>Nome:</strong> {equino?.name}</Typography>
            <Typography variant="subtitle1"><strong>Registro:</strong> {equino?.numeroRegistro}</Typography>
            <Typography variant="subtitle1"><strong>Raça:</strong> {equino?.raca}</Typography>
          </div>

          <Autocomplete
            freeSolo
            options={vacinasAnteriores}
            value={nomeVacina}
            onInputChange={(e, newValue) => setNomeVacina(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Nome da Vacina" fullWidth required />
            )}
          />

          <TextField
            label="Observações"
            multiline
            rows={3}
            fullWidth
            className="mt-3"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />

          {/* NOVO: Próxima dose (data do próximo procedimento) */}
          <TextField
            label="Próxima dose (opcional)"
            type="date"
            fullWidth
            className="mt-3"
            InputLabelProps={{ shrink: true }}
            value={dataProximoProcedimento}
            onChange={(e) => setDataProximoProcedimento(e.target.value)}
            helperText="Defina quando deverá ocorrer a próxima vacinação (usado para avisos de vencimento)."
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outlined" color="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={handleSalvar}>
              {dadosEditar ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Modal de sucesso */}
      <ModalGenerico
        open={modalSucessoAberto}
        onClose={() => setModalSucessoAberto(false)}
        tipo="mensagem"
        titulo="Sucesso"
        subtitulo={dadosEditar ? 'Vacinação atualizada com sucesso.' : 'Vacinação registrada com sucesso.'}
        cor="success"
        tamanho="pequeno"
      />

      {/* Modal de erro */}
      <ModalGenerico
        open={modalErroAberto}
        onClose={() => setModalErroAberto(false)}
        tipo="mensagem"
        titulo="Atenção"
        subtitulo="Informe o nome da vacina antes de salvar."
        cor="error"
        tamanho="pequeno"
        tempoDeDuracao={3000}
      />
    </>
  );
};

export default ModalVacinacao;
