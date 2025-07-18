import { Modal, Box, Fade, Typography } from '@mui/material';
import { useEffect } from 'react';
import styles from './ModalGenerico.module.css';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ModalGenerico = ({
  open,
  onClose,
  tipo = 'mensagem',
  tamanho = 'medio',
  icone = null,
  titulo = '',
  subtitulo = '',
  tempoDeDuracao = 3000,
  children = null
}) => {
  
  const tipoClasse = styles['modal' + capitalize(tipo)] || '';
  const tamanhoClasse = styles[tamanho] || '';

  useEffect(() => {
    const duracao = Number(tempoDeDuracao);
    if (open && duracao > 0 && tipo !== 'confirmacao' && tipo !== 'email') {
      const timer = setTimeout(onClose, duracao);
      return () => clearTimeout(timer);
    }
  }, [open, tempoDeDuracao, tipo, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{ backdrop: { timeout: 500 } }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Fade in={open}>
        <Box className={`
          ${styles.modalBase}
          ${tipoClasse}
          ${styles.modalBox}
          ${tamanhoClasse}
        `}>
          
          {/* Ícone */}
          {icone && (
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              {icone}
            </div>
          )}

          {/* Título */}
          {titulo && (
            <Typography className={styles.modalTitle}>
              {titulo}
            </Typography>
          )}

          {/* Subtítulo */}
          {subtitulo && (
            <Typography className={styles.modalSubtitulo}>
              {subtitulo}
            </Typography>
          )}

          {/* Children (botões ou outro conteúdo) */}
          {children}

        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalGenerico;
