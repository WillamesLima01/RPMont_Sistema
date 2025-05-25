import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';
import styles from './Login.module.css';
import brasaoBackground from '../../assets/body.png';//RPMontBrasao.PNG';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    try {
      const response = await axios.get('/users');
      const users = response.data;
      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
        setError('');
        setOpenModal(true);
        setTimeout(() => {
          setOpenModal(false);
          navigate("/inicio");
        }, 3000);
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro ao verificar credenciais', error);
      setError('Erro ao verificar credenciais');
    }
  };

  const handleOpenResetModal = () => setOpenResetModal(true);
  const handleCloseResetModal = () => setOpenResetModal(false);

  const handleSendReset = () => {
    if (!resetEmail) return alert("Por favor, insira um e-mail.");
    // Aqui você pode integrar com API real
    alert(`Uma nova senha foi enviada para: ${resetEmail}`);
    setResetEmail('');
    handleCloseResetModal();
  };

  return (
    <div className={styles.loginContainer} style={{ backgroundImage: `url(${brasaoBackground})` }}>
      <Box className={styles.loginBox}>
        <Typography className={styles.loginTitle} variant="h5" component="h1">
          Login
        </Typography>

        <Box className={styles.inputContainer}>
          <Box className={styles.iconWrapper}>
            <PersonIcon />
          </Box>
          <TextField
            id="email"
            label="Email"
            variant="standard"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Box className={styles.inputContainer}>
          <Box className={styles.iconWrapper}>
            <LockIcon />
          </Box>
          <TextField
            id="password"
            label="Senha"
            variant="standard"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        <Button className={styles.blueButton} variant="contained" fullWidth onClick={handleLogin}>
          Entrar
        </Button>

        <div className={styles.forgotPasswordLink}>
          <MuiLink component="button" variant="body2" onClick={handleOpenResetModal}>
            Esqueceu sua senha?
          </MuiLink>
        </div>
      </Box>

      {/* Modal de sucesso */}
      <Modal
        open={openModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}>
            <Typography variant="h6" component="h1" sx={{ color: '#2196f3' }}>
              Login realizado com sucesso!
            </Typography>
            <Typography sx={{ mt: 1, color: 'green' }}>
              Seja bem-vindo!
            </Typography>
          </Box>
        </Fade>
      </Modal>

      {/* Modal Esqueceu a Senha */}
      <Modal
        open={openResetModal}
        onClose={handleCloseResetModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openResetModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}>
            <EmailIcon sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Recuperar Senha
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Informe o e-mail cadastrado para enviarmos uma nova senha.
            </Typography>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              variant="standard"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSendReset}
            >
              Enviar nova senha
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default Login;
