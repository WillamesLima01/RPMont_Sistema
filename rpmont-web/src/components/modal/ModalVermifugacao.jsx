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

  // Novo: data do próximo procedimento (obrigatória)
  const [proximaData, setProximaData] = useState('');       // yyyy-MM-dd (para o input date)
  const [erroProximaData, setErroProximaData] = useState(''); // mensagem de erro

  useEffect(() => {
    const carregarVermifugos = async () => {
      try {
        const { data } = await axios.get('/vermifugacoes');
        const nomes = [...new Set(data.map(v => v.vermifugo).filter(Boolean))];
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
        // Preenche a data próxima (se existir) no formato yyyy-MM-dd
        if (dadosEditar.dataProximoProcedimento) {
          try {
            const d = new Date(dadosEditar.dataProximoProcedimento);
            if (!isNaN(d)) {
              setProximaData(d.toISOString().slice(0, 10));
            } else {
              setProximaData('');
            }
          } catch {
            setProximaData('');
          }
        } else {
          setProximaData('');
        }
      } else {
        setVermifugo('');
        setObservacao('');
        setProximaData('');
      }

      setErroProximaData('');
    }
  }, [open, dadosEditar]);

  // Validação simples da data (obrigatória e não no passado)
  const validarProximaData = () => {
    if (!proximaData) {
      setErroProximaData('Informe a data do próximo procedimento.');
      return false;
    }
    const hoje = new Date();
    const d = new Date(`${proximaData}T00:00:00`);
    // zera hora de "hoje" para comparar apenas a data
    const hojeSemHora = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
    const dataSemHora = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    if (dataSemHora < hojeSemHora) {
      setErroProximaData('A data do próximo procedimento não pode estar no passado.');
      return false;
    }

    setErroProximaData('');
    return true;
  };

  const handleSalvar = async () => {
    if (!vermifugo.trim()) {
      setModalErroAberto(true);
      return;
    }

    if (!validarProximaData()) return;

    const vermifugacao = {
      equinoId: equino.id,
      vermifugo: vermifugo.trim(),
      observacao: observacao.trim(),
      data: new Date().toISOString(), // data do registro atual
      // novo campo persistido:
      dataProximoProcedimento: new Date(`${proximaData}T00:00:00`).toISOString(),
    };

    try {
      if (dadosEditar) {
        await axios.put(`/vermifugacoes/${dadosEditar.id}`, { ...dadosEditar, ...vermifugacao });
      } else {
        await axios.post('/vermifugacoes', vermifugacao);
      }

      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        onClose();
      }, 2000);
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

          {/* NOVO: Data do próximo procedimento (obrigatória) */}
          <TextField
            type="date"
            label="Próximo procedimento"
            fullWidth
            required
            className="mt-3"
            value={proximaData}
            onChange={(e) => setProximaData(e.target.value)}
            onBlur={validarProximaData}
            InputLabelProps={{ shrink: true }}
            error={!!erroProximaData}
            helperText={erroProximaData || 'Informe quando o próximo vermífugo deve ser aplicado.'}
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
