// ModalGenerico.jsx
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
  
  const tipoClasse = styles['modal' + capitalize(tipo)] || '';
  const tamanhoClasse = styles[tamanho] || '';

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
