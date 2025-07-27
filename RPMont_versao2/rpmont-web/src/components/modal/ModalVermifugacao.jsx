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

const ModalVermifugacao = ({ open, onClose, equino, dadosEditar = null }) => {
  const [vermifugo, setVermifugo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [vermifugosAnteriores, setVermifugosAnteriores] = useState([]);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  useEffect(() => {
    const carregarVermifugos = async () => {
      try {
        const { data } = await axios.get('/vermifugacoes');
        const nomes = [...new Set(data.map(v => v.vermifugo))];
        setVermifugosAnteriores(nomes);
      } catch (error) {
        console.error('Erro ao buscar vermífugos:', error);
      }
    };

    if (open) {
      carregarVermifugos();
      if (dadosEditar) {
        setVermifugo(dadosEditar.vermifugo || '');
        setObservacao(dadosEditar.observacao || '');
      } else {
        setVermifugo('');
        setObservacao('');
      }
    }
  }, [open, dadosEditar]);

  const handleSalvar = async () => {
    if (!vermifugo.trim()) {
      setModalErroAberto(true);
      return;
    }

    const vermifugacao = {
      equinoId: equino.id,
      vermifugo: vermifugo.trim(),
      observacao: observacao.trim(),
      data: new Date().toISOString(),
    };

    try {
      if (dadosEditar) {
        // Edição
        await axios.put(`/vermifugacoes/${dadosEditar.id}`, { ...dadosEditar, ...vermifugacao });
      } else {
        // Cadastro
        await axios.post('/vermifugacoes', vermifugacao);
      }

      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar vermifugação:', error);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className="modal-vermifugacao">
          <Typography variant="h6" component="h2" className="text-primary">
            {dadosEditar ? 'Editar Vermifugação' : 'Nova Vermifugação'}
          </Typography>

          <div className="mb-3">
            <Typography variant="subtitle1"><strong>Nome:</strong> {equino?.name}</Typography>
            <Typography variant="subtitle1"><strong>Registro:</strong> {equino?.numeroRegistro}</Typography>
            <Typography variant="subtitle1"><strong>Raça:</strong> {equino?.raca}</Typography>
          </div>

          <Autocomplete
            freeSolo
            options={vermifugosAnteriores}
            value={vermifugo}
            onInputChange={(e, newValue) => setVermifugo(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Vermífugo" fullWidth required />
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

      <ModalGenerico
        open={modalSucessoAberto}
        onClose={() => setModalSucessoAberto(false)}
        tipo="mensagem"
        titulo="Sucesso"
        subtitulo={`Vermifugação ${dadosEditar ? 'atualizada' : 'cadastrada'} com sucesso.`}
        cor="success"
        tamanho="pequeno"
      />

      <ModalGenerico
        open={modalErroAberto}
        onClose={() => setModalErroAberto(false)}
        tipo="mensagem"
        titulo="Atenção"
        subtitulo="Informe o nome do vermífugo antes de salvar."
        cor="error"
        tamanho="pequeno"
      />
    </>
  );
};

export default ModalVermifugacao;
