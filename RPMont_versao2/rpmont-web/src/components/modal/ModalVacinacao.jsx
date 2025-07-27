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

const ModalVacinacao = ({ open, onClose, equino, dadosEditar = null }) => {
  const [nomeVacina, setNomeVacina] = useState('');
  const [observacao, setObservacao] = useState('');
  const [vacinasAnteriores, setVacinasAnteriores] = useState([]);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  useEffect(() => {
    const carregarVacinas = async () => {
      try {
        const { data } = await axios.get('/vacinacoes');
        const nomes = [...new Set(data.map(v => v.nomeVacina))];
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
      } else {
        setNomeVacina('');
        setObservacao('');
      }
    }
  }, [open, dadosEditar]);

  const handleSalvar = async () => {
    if (!nomeVacina.trim()) {
      setModalErroAberto(true);
      return;
    }

    const vacinacao = {
      id_Eq: equino.id,
      nomeVacina: nomeVacina.trim(),
      observacao: observacao.trim(),
      data: new Date().toISOString(),
    };

    try {
      if (dadosEditar) {
        await axios.put(`/vacinacoes/${dadosEditar.id}`, { ...dadosEditar, ...vacinacao });
      } else {
        await axios.post('/vacinacoes', vacinacao);
      }

      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        onClose();
      }, 3000);
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
