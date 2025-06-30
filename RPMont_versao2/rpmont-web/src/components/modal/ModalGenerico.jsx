import { useEffect } from 'react';
import { Modal, Box, Fade, Backdrop, Typography } from '@mui/material';
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
  
 useEffect(() => {
  const duracao = Number(tempoDeDuracao);
  
  if (open && duracao > 0 && tipo !== 'confirmacao' && tipo !== 'email') {
    const timer = setTimeout(onClose, duracao);
    return () => clearTimeout(timer);
  }
}, [open, tempoDeDuracao, tipo, onClose]);

useEffect(() => {
  if (open) {
    // Remover o foco de qualquer elemento que permaneceu com foco fora do modal
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // Focar no primeiro elemento com [data-modal-focus] dentro do modal
    setTimeout(() => {
      const focoInicial = document.querySelector('[data-modal-focus]');
      if (focoInicial) focoInicial.focus();
    }, 50); // pequeno atraso para garantir que o DOM foi renderizado
  }
}, [open]);

  const tipoClasse = styles['modal' + capitalize(tipo)] || '';
  const entradaClasse = tipo === 'entrada' ? styles.modalEntrada : '';
  const tamanhoClasse = styles[tamanho] || '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Fade in={open}>
        <Box className={`${styles.modalBase} ${tipoClasse} ${entradaClasse} ${styles.modalBox} ${tamanhoClasse}`}>
          {icone && <div className={styles.modalIcon}>{icone}</div>}
          {titulo && <Typography className={styles.modalTitle}>{titulo}</Typography>}
          {subtitulo && <Typography className={styles.modalSubtitulo}>{subtitulo}</Typography>}
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalGenerico;
