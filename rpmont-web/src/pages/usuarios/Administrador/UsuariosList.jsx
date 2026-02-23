import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ModalGenerico from "../../../components/modal/ModalGenerico.jsx";

const UsuariosList = () => {
    const navigate = useNavigate();

    // Controle de acesso (Admin)
    const usuarioLogado = useMemo(() => {
      try {
        return JSON.parse(localStorage.getItem("userLogged")) || null;
      } catch {
        return null;
      }
    }, []);
  
    useEffect(() => {
      const isAdmin = usuarioLogado?.AccessLevel?.toLowerCase() === "administrador";
      if (!isAdmin) {
        navigate("/inicio"); // ou "/login"
      }
    }, [usuarioLogado, navigate]);
  
    // Estados
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const [busca, setBusca] = useState("");
    const [filtroAcesso, setFiltroAcesso] = useState("TODOS");
  
    // Paginação
    const [page, setPage] = useState(1);
    const pageSize = 8;
  
    // Modal de confirmação
    const [openConfirm, setOpenConfirm] = useState(false);
    const [userSelecionado, setUserSelecionado] = useState(null);
  
    // Modal de mensagem (sucesso/erro)
    const [openMsg, setOpenMsg] = useState(false);
    const [msgTipo, setMsgTipo] = useState("sucesso");
    const [msgTitulo, setMsgTitulo] = useState("");
    const [msgTexto, setMsgTexto] = useState("");
  
    const mostrarMensagem = (texto, tipo = "mensagem", titulo = "") => {
      setMsgTexto(texto);
      setMsgTipo(tipo);
      setMsgTitulo(titulo);
      setOpenMsg(true);
    };
  
    const carregarUsuarios = async () => {
      setLoading(true);
      try {
        const resp = await axios.get("/users");
        setUsers(resp.data || []);
      } catch (e) {
        console.error(e);
        mostrarMensagem("Erro ao carregar usuários.", "erro", "Falha");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      carregarUsuarios();
    }, []);
  
    // Normaliza campo AccessLevel (porque você mostrou "Usuario" e isso pode variar)
    const getAccessLabel = (u) => (u?.AccessLevel || "Usuario").toString();
  
    const usersFiltrados = useMemo(() => {
      const termo = busca.trim().toLowerCase();
  
      return users
        .filter((u) => {
          const access = getAccessLabel(u).toLowerCase();
  
          if (filtroAcesso !== "TODOS" && access !== filtroAcesso.toLowerCase()) {
            return false;
          }
  
          if (!termo) return true;
  
          const fullName = (u.fullName || "").toLowerCase();
          const name = (u.name || "").toLowerCase();
          const email = (u.email || "").toLowerCase();
          const cpf = (u.cpf || "").toLowerCase();
          const contact = (u.contact || "").toLowerCase();
  
          return (
            fullName.includes(termo) ||
            name.includes(termo) ||
            email.includes(termo) ||
            cpf.includes(termo) ||
            contact.includes(termo)
          );
        })
        .sort((a, b) => {
          // Admin primeiro (opcional), depois por nome
          const aIsAdmin = getAccessLabel(a).toLowerCase() === "administrador";
          const bIsAdmin = getAccessLabel(b).toLowerCase() === "administrador";
          if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1;
          return (a.fullName || "").localeCompare(b.fullName || "");
        });
    }, [users, busca, filtroAcesso]);
  
    const total = usersFiltrados.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
    const paginaAtual = useMemo(() => {
      const start = (page - 1) * pageSize;
      return usersFiltrados.slice(start, start + pageSize);
    }, [usersFiltrados, page]);
  
    useEffect(() => {
      // Se filtros reduzirem a lista e a page ficar inválida, ajusta
      if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);
  
    const badgeAccess = (accessLevel) => {
      const isAdmin = accessLevel?.toLowerCase() === "administrador";
      return (
        <Chip
          label={accessLevel}
          variant="outlined"
          sx={{
            fontWeight: 700,
            borderWidth: 2,
            ...(isAdmin
              ? { borderColor: "#f44336", color: "#f44336" }
              : { borderColor: "#2196f3", color: "#2196f3" }),
          }}
        />
      );
    };
  
    const abrirConfirmacaoExclusao = (u) => {
      setUserSelecionado(u);
      setOpenConfirm(true);
    };
  
    const excluirUsuario = async () => {
      if (!userSelecionado?.id) return;
  
      // (Opcional) Impedir excluir a si mesmo
      if (String(userSelecionado.id) === String(usuarioLogado?.id)) {
        setOpenConfirm(false);
        mostrarMensagem("Você não pode excluir o próprio usuário logado.", "seguranca", "Atenção");
        return;
      }
  
      try {
        await axios.delete(`/users/${userSelecionado.id}`);
        setOpenConfirm(false);
        setUserSelecionado(null);
        mostrarMensagem("Usuário excluído com sucesso.", "sucesso", "Concluído");
        await carregarUsuarios();
      } catch (e) {
        console.error(e);
        setOpenConfirm(false);
        mostrarMensagem("Erro ao excluir usuário.", "erro", "Falha");
      }
    };
  
    const irParaEditar = (id) => {
      navigate(`/usuarios/editar-usuario/${id}`);
    };
  
    const limparFiltros = () => {
      setBusca("");
      setFiltroAcesso("TODOS");
      setPage(1);
    };
  
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Controle de Usuários
          </Typography>
  
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Total: <b>{total}</b>
          </Typography>
        </Box>
  
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              label="Buscar (nome, e-mail, CPF, contato)"
              variant="standard"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 280, flex: 1 }}
            />
  
            <FormControl variant="standard" sx={{ minWidth: 200 }}>
              <InputLabel>Nível de acesso</InputLabel>
              <Select
                value={filtroAcesso}
                onChange={(e) => {
                  setFiltroAcesso(e.target.value);
                  setPage(1);
                }}
                label="Nível de acesso"
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Usuario">Usuario</MenuItem>
              </Select>
            </FormControl>
  
            <Button variant="outlined" onClick={limparFiltros}>
              Limpar filtros
            </Button>
  
            <Button variant="contained" onClick={carregarUsuarios} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </Box>
        </Paper>
  
        <Paper sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Usuário</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>E-mail</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Contato</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Acesso</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
  
            <TableBody>
              {paginaAtual.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.fullName || "-"}</TableCell>
                  <TableCell>{u.name || "-"}</TableCell>
                  <TableCell>{u.email || "-"}</TableCell>
                  <TableCell>{u.cpf || "-"}</TableCell>
                  <TableCell>{u.contact || "-"}</TableCell>
                  <TableCell>{badgeAccess(getAccessLabel(u))}</TableCell>
  
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button variant="outlined" onClick={() => irParaEditar(u.id)}>
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => abrirConfirmacaoExclusao(u)}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
  
              {paginaAtual.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 4, textAlign: "center", opacity: 0.8 }}>
                    Nenhum usuário encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
  
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Página <b>{page}</b> de <b>{totalPages}</b>
            </Typography>
  
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="outlined" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </Box>
          </Box>
        </Paper>
  
        {/* Modal confirmação exclusão */}
        <ModalGenerico
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          tipo="confirmacao"
          titulo="Confirmar exclusão"
          subtitulo={
            userSelecionado
              ? `Deseja excluir o usuário: ${userSelecionado.fullName || userSelecionado.email}?`
              : "Deseja excluir este usuário?"
          }
          tamanho="medio"
        >
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenConfirm(false)}>
              Cancelar
            </Button>
            <Button fullWidth variant="contained" color="error" onClick={excluirUsuario}>
              Excluir
            </Button>
          </Box>
        </ModalGenerico>
  
        {/* Modal mensagem */}
        <ModalGenerico
          open={openMsg}
          onClose={() => setOpenMsg(false)}
          tipo={msgTipo}
          titulo={msgTitulo || "Mensagem"}
          subtitulo={msgTexto}
          tamanho="medio"
          tempoDeDuracao={msgTipo === "sucesso" ? 2500 : 0}
        />
      </Box>
    );
  };

export default UsuariosList
