import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import './Veterinaria.css';

// ⚠️ Trocar por validação no backend quando possível
const ADMIN_PASS = 'admin123';

// --- Modal simples de senha admin ---
const ConfirmSenhaModal = ({ open, onClose, onConfirm }) => {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!open) {
      setSenha('');
      setErro('');
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shield-lock me-2"></i>Senha de Administrador
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="password"
              className="form-control"
              placeholder="Informe a senha de administrador"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!senha) return setErro('Informe a senha.');
                  if (senha !== ADMIN_PASS) return setErro('Senha inválida.');
                  setErro('');
                  onConfirm();
                }
              }}
            />
            {erro && <p className="text-danger mt-2">{erro}</p>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!senha) return setErro('Informe a senha.');
                if (senha !== ADMIN_PASS) return setErro('Senha inválida.');
                setErro('');
                onConfirm();
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Modal de edição ---
const EditarModal = ({ open, onClose, item, onSave }) => {
  const [form, setForm] = useState({ matricula: '', nomeAuxiliar: '', dataServico: '' });
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (open && item) {
      setForm({
        matricula: item.matricula || '',
        nomeAuxiliar: item.nomeAuxiliar || '',
        dataServico: item.dataServico || '',
      });
      setErro('');
    }
  }, [open, item]);

  if (!open) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-pencil-square me-2"></i>Editar Relatório</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Matrícula</label>
              <input
                className="form-control"
                value={form.matricula}
                onChange={(e) => setForm((p) => ({ ...p, matricula: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Auxiliar Veterinário</label>
              <input
                className="form-control"
                value={form.nomeAuxiliar}
                onChange={(e) => setForm((p) => ({ ...p, nomeAuxiliar: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Data do Serviço</label>
              <input
                type="date"
                className="form-control"
                value={form.dataServico}
                onChange={(e) => setForm((p) => ({ ...p, dataServico: e.target.value }))}
              />
            </div>
            {erro && <p className="text-danger mt-2">{erro}</p>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-success"
              onClick={() => {
                if (!form.matricula || !form.nomeAuxiliar || !form.dataServico) {
                  return setErro('Preencha todos os campos.');
                }
                onSave(form);
              }}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VeterinariaRelatorioServicoList = () => {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSenha, setShowSenha] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null); // { tipo: 'editar'|'excluir', item, next? }
  const [showEditar, setShowEditar] = useState(false);

  const navigate = useNavigate();

  const carregar = async () => {
    setLoading(true);
    try {
      // Coleção: relatoriosServico  -> [{id, matricula, nomeAuxiliar, dataServico}]
      const res = await axios.get('/relatoriosServico');
      setItens(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar relatórios:', e);
      setItens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const listaFiltrada = useMemo(() => {
    const q = (busca || '').toLowerCase().trim();
    if (!q) return itens;
    return itens.filter((r) =>
      String(r.matricula || '').toLowerCase().includes(q) ||
      String(r.nomeAuxiliar || '').toLowerCase().includes(q) ||
      String(r.dataServico || '').toLowerCase().includes(q)
    );
  }, [itens, busca]);

  const pedirSenha = (tipo, item, next) => {
    setAcaoPendente({ tipo, item, next });
    setShowSenha(true);
  };

  const onSenhaConfirm = () => {
    setShowSenha(false);
    if (!acaoPendente) return;
    const { tipo, item, next } = acaoPendente;

    if (tipo === 'editar') {
      setShowEditar(true);
    } else if (tipo === 'excluir') {
      next?.();
    }
  };

  const handleEditarSalvar = async (novo) => {
    if (!acaoPendente?.item) return;
    try {
      await axios.put(`/relatoriosServico/${acaoPendente.item.id}`, {
        ...acaoPendente.item,
        ...novo,
      });
      setShowEditar(false);
      setAcaoPendente(null);
      await carregar();
    } catch (e) {
      console.error('Erro ao editar relatório:', e);
      alert('Erro ao editar relatório.');
    }
  };

  const handleExcluir = async (item) => {
    if (!window.confirm(`Excluir relatório de ${item.nomeAuxiliar} (${item.dataServico})?`)) return;
    try {
      await axios.delete(`/relatoriosServico/${item.id}`);
      await carregar();
    } catch (e) {
      console.error('Erro ao excluir relatório:', e);
      alert('Erro ao excluir relatório.');
    }
  };

  const handleConsultar = (item) => {
    // Abre a página que gera o PDF já com a data do serviço
    navigate('/veterinaria/relatorio-servico', { state: { dataServico: item.dataServico } });
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className="relatorio-card shadow p-4 rounded-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary m-0">Relatórios de Serviço</h2>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              style={{ maxWidth: 320 }}
              placeholder="Buscar por matrícula, nome ou data (aaaa-mm-dd)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={carregar} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 160 }}>Matrícula</th>
                <th>Auxiliar Veterinário</th>
                <th style={{ width: 160 }}>Data do Serviço</th>
                <th style={{ width: 260 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              )}
              {listaFiltrada.map((item) => (
                <tr key={item.id}>
                  <td>{item.matricula}</td>
                  <td>{item.nomeAuxiliar}</td>
                  <td>{item.dataServico}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleConsultar(item)}
                        title="Consultar / Gerar PDF"
                      >
                        <i className="bi bi-filetype-pdf me-1"></i>Consultar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => pedirSenha('editar', item)}
                        title="Editar (requer senha)"
                      >
                        <i className="bi bi-pencil-square me-1"></i>Editar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => pedirSenha('excluir', item, () => handleExcluir(item))}
                        title="Excluir (requer senha)"
                      >
                        <i className="bi bi-trash3 me-1"></i>Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modais */}
      <ConfirmSenhaModal
        open={showSenha}
        onClose={() => { setShowSenha(false); setAcaoPendente(null); }}
        onConfirm={onSenhaConfirm}
      />

      <EditarModal
        open={showEditar}
        onClose={() => { setShowEditar(false); setAcaoPendente(null); }}
        item={acaoPendente?.item || null}
        onSave={handleEditarSalvar}
      />
    </div>
  );
};

export default VeterinariaRelatorioServicoList;
