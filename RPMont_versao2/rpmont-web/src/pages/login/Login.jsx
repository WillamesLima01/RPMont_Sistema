import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';
import styles from './Login.module.css';
import brasaoBackground from '../../assets/body.png';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [openResetModal, setOpenResetModal] = useState(false);
  const [openMensagemModal, setOpenMensagemModal] = useState(false);
  const [mensagemModalTexto, setMensagemModalTexto] = useState('');
  const [mensagemModalTipo, setMensagemModalTipo] = useState('sucesso');
  const [mensagemModalTitulo, setMensagemModalTitulo] = useState('');

  const navigate = useNavigate();

  // Primeiro define a função
const getModalProps = (tipo) => {
  switch (tipo) {
    case 'sucesso':
      return {
        cor: '#2196f3',
        icone: (
          <i
            className="bi bi-check-circle-fill"
            style={{ fontSize: 60, color: 'green' }}
          />
        )
      };
    case 'erro':
      return {
        cor: '#f44336',
        icone: (
          <i
            className="bi bi-x-circle-fill"
            style={{ fontSize: 60, color: '#f44336' }}
          />
        )
      };
    case 'mensagem':
      return {
        cor: '#ff9800',
        icone: (
          <i
            className="bi bi-info-circle-fill"
            style={{ fontSize: 60, color: '#ff9800' }}
          />
        )
      };
    case 'seguranca':
      return {
        cor: '#f44336',
        icone: (
          <i
            className="bi bi-shield-fill-x"
            style={{ fontSize: 60, color: '#f44336' }}
          />
        )
      };
    default:
      return { cor: '#2196f3', icone: null };
  }
};

// Depois usa
const { cor, icone } = getModalProps(mensagemModalTipo);  

  const handleLogin = async () => {
    if (!email || !password) {
      mostrarMensagem('Por favor informe seu login e senha!', 'seguranca',
          'Acesso negado!');
      return;
    }

    try {
      const response = await axios.get('/users');
      const users = response.data;
      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
        mostrarMensagem(
          'Seja bem-vindo!',
          'sucesso',
          'Login realizado com sucesso!'
        );

        setTimeout(() => {
          setOpenMensagemModal(false);
          navigate('/inicio');
        }, 3000);
      } else {
        mostrarMensagem(
          'Email ou senha inválidos. Verifique suas credenciais.',
          'seguranca',
          'Acesso negado!'
        );
      }

    } catch (error) {
      console.error('Erro ao verificar credenciais', error);
      mostrarMensagem('Erro ao verificar credenciais', 'erro');
    }
  };

  const mostrarMensagem = (texto, tipo, tituloPersonalizado = '') => {
    setMensagemModalTexto(texto);
    setMensagemModalTipo(tipo);
    setMensagemModalTitulo(tituloPersonalizado);
    setOpenMensagemModal(true);
  };  

  const handleOpenResetModal = () => setOpenResetModal(true);
  const handleCloseResetModal = () => setOpenResetModal(false);

  const handleSendReset = () => {
    if (!resetEmail.trim()) {
      mostrarMensagem('Por favor, insira um e-mail.', 'erro');
      return;
    }

    mostrarMensagem(`Uma nova senha foi enviada para: ${resetEmail}`, 'sucesso');
    setResetEmail('');
    handleCloseResetModal();
  };  

  return (
    <div
      className={styles.loginContainer}
      style={{ backgroundImage: `url(${brasaoBackground})` }}
    >
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

        <Button
          className={styles.blueButton}
          variant="contained"
          fullWidth
          onClick={handleLogin}
        >
          Entrar
        </Button>

        <div className={styles.forgotPasswordLink}>
          <MuiLink component="button" variant="body2" onClick={handleOpenResetModal}>
            Esqueceu sua senha?
          </MuiLink>
        </div>
      </Box>

      <ModalGenerico
        open={openResetModal}
        onClose={handleCloseResetModal}
        tipo="email"
        titulo="Recuperar Senha"
        subtitulo="Informe o e-mail cadastrado para enviarmos uma nova senha."
        icone={<i className="bi bi-envelope-arrow-up-fill" style={{ fontSize: 60, color: '#2196f3' }}></i>}
        cor="#2196f3"
        tamanho="medio"
      >
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
      </ModalGenerico>

      <ModalGenerico
        open={openMensagemModal}
        onClose={() => setOpenMensagemModal(false)}
        tipo={mensagemModalTipo}
        icone={icone}
        cor={cor}
        titulo={mensagemModalTitulo}
        subtitulo={mensagemModalTexto}
        tempoDeDuracao={mensagemModalTipo === 'sucesso' ? 3000 : 0}
        tamanho="pequeno"
      />
    </div>
  );
};

export default Login;
