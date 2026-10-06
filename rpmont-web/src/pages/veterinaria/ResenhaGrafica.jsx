import React, { useState, useEffect } from 'react';
import resenhaDescritiva from '../../assets/resenhaDescritiva.png';
import './ResenhaGrafica.css';

export const LARGURA_RESENHA = 1619;
export const ALTURA_RESENHA = 972;

export const FERRAMENTAS_RESENHA = [
  { tipo: 'rodopio', nome: 'Rodopio', icone: '✕', ajuda: 'Clique no centro do redemoinho.' },
  { tipo: 'espiga', nome: 'Espiga', icone: '✕—', ajuda: 'Clique para uma espiga curta ou arraste do rodopio na direção dos pelos.' },
  { tipo: 'golpe_lanca', nome: 'Golpe de lança', icone: '△', ajuda: 'Clique sobre a depressão.' },
  { tipo: 'cicatriz', nome: 'Cicatriz', icone: '↗', ajuda: 'Clique para uma seta curta ou arraste acompanhando a cicatriz.' },
  { tipo: 'mancha_branca', nome: 'Mancha branca', icone: '◯', ajuda: 'Clique para uma pequena marca ou arraste contornando a mancha.' },
  { tipo: 'calcado', nome: 'Calçado', icone: '—', ajuda: 'Clique para criar um traço ou arraste para ajustar o limite branco no membro. Descreva membro e altura.' },
  { tipo: 'despigmentacao', nome: 'Despigmentação', icone: '●', ajuda: 'Clique para uma pequena área ou arraste contornando a despigmentação.' },
  { tipo: 'circulo', nome: 'Círculo livre', icone: '○', ajuda: 'Anotação livre de versão anterior.' },
  { tipo: 'x', nome: 'X livre', icone: '×', ajuda: 'Anotação livre de versão anterior.' },
  { tipo: 'quadrado', nome: 'Quadrado livre', icone: '□', ajuda: 'Anotação livre de versão anterior.' },
];
export const nomeSinal = (tipo) => FERRAMENTAS_RESENHA.find((f) => f.tipo === tipo)?.nome || 'Sinal';
export const MEMBROS_RESENHA = ['Anterior direito', 'Anterior esquerdo', 'Posterior direito', 'Posterior esquerdo'];
export const CLASSES_CALCADO = ['Vestígio', 'Baixo', 'Médio', 'Alto'];
export const resumoSinal = (item) => [nomeSinal(item.tipo),
  item.tipo === 'espiga' ? (item.comRodopio === false ? 'sem rodopio' : 'com rodopio') : '',
  item.tipo === 'calcado' ? item.membro : '', item.tipo === 'calcado' ? item.classificacao : ''
].filter(Boolean).join(' · ');
export const tamanhoArea = (item) => Number.isFinite(item.tamanho) ? Math.min(2, Math.max(0.4, item.tamanho)) : 1;
export const pontosArea = (item) => item.pontos?.map((p) => ({ x: item.x + (p.x - item.x) * tamanhoArea(item), y: item.y + (p.y - item.y) * tamanhoArea(item) }));
export const corSinal = (tipo) => ['mancha_branca', 'calcado', 'despigmentacao', 'circulo', 'x', 'quadrado'].includes(tipo) ? '#c62828' : '#242b35';
const CONTORNOS = ['mancha_branca', 'despigmentacao'];
const LINHAS = ['espiga', 'cicatriz', 'calcado'];
const limitar = (valor, maximo) => Math.min(maximo, Math.max(0, Math.round(valor)));
const pontoValido = (p) => p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= LARGURA_RESENHA && p.y >= 0 && p.y <= ALTURA_RESENHA;

export const lerMarcacoes = (valor) => {
  try {
    const lista = typeof valor === 'string' ? JSON.parse(valor || '[]') : valor;
    return Array.isArray(lista) ? lista.filter((item) =>
      FERRAMENTAS_RESENHA.some((f) => f.tipo === item.tipo) && pontoValido(item) &&
      (!item.fim || pontoValido(item.fim)) &&
      (!item.pontos || (Array.isArray(item.pontos) && item.pontos.length <= 1200 && item.pontos.every(pontoValido)))
    ) : [];
  } catch { return []; }
};

export const fimVisivel = (item) => {
  const fim = item.fim;
  if (fim && Math.hypot(fim.x - item.x, fim.y - item.y) >= 12) return fim;
  if (item.tipo === 'cicatriz') return { x: limitar(item.x + 48, LARGURA_RESENHA), y: limitar(item.y - 48, ALTURA_RESENHA) };
  if (item.tipo === 'espiga') return { x: limitar(item.x + 65, LARGURA_RESENHA), y: item.y };
  return { x: limitar(item.x + 70, LARGURA_RESENHA), y: item.y };
};
export const pontaSeta = (item) => {
  const fim = fimVisivel(item);
  const dx = fim.x - item.x, dy = fim.y - item.y;
  const comprimento = Math.hypot(dx, dy) || 1;
  const ux = dx / comprimento, uy = dy / comprimento;
  return [
    { x: fim.x - ux * 19 - uy * 11, y: fim.y - uy * 19 + ux * 11 },
    { x: fim.x - ux * 19 + uy * 11, y: fim.y - uy * 19 - ux * 11 },
  ];
};

export const SimboloResenha = ({ item }) => {
  const { x, y, tipo } = item;
  const pontos = CONTORNOS.includes(tipo) ? pontosArea(item) : item.pontos;
  const cor = corSinal(tipo);
  const traco = { stroke: cor, strokeWidth: 7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (tipo === 'circulo') return <circle cx={x} cy={y} r="25" {...traco} />;
  if (tipo === 'quadrado') return <rect x={x - 25} y={y - 25} width="50" height="50" {...traco} />;
  if (tipo === 'rodopio' || tipo === 'x' || tipo === 'espiga') return <g {...traco}>
    {(tipo !== 'espiga' || item.comRodopio !== false) && <path d={`M ${x - 22} ${y - 22} L ${x + 22} ${y + 22} M ${x + 22} ${y - 22} L ${x - 22} ${y + 22}`} />}
    {tipo === 'espiga' && <path d={`M ${x} ${y} L ${fimVisivel(item).x} ${fimVisivel(item).y}`} />}
  </g>;
  if (tipo === 'golpe_lanca') return <path d={`M ${x} ${y - 28} L ${x + 27} ${y + 22} L ${x - 27} ${y + 22} Z`} {...traco} />;
  if (tipo === 'calcado') {
    if (pontos?.length > 1) return <polyline points={pontos.map((p) => `${p.x},${p.y}`).join(' ')} {...traco} strokeWidth="8" />;
    return <path d={`M ${x} ${y} L ${fimVisivel(item).x} ${fimVisivel(item).y}`} {...traco} strokeWidth="10" />;
  }
  if (tipo === 'cicatriz') {
    const ponta = fimVisivel(item);
    const [a, b] = pontaSeta(item);
    return <path d={`M ${x} ${y} L ${ponta.x} ${ponta.y} M ${a.x} ${a.y} L ${ponta.x} ${ponta.y} L ${b.x} ${b.y}`} {...traco} />;
  }
  if (CONTORNOS.includes(tipo)) {
    if (!pontos || pontos.length < 3) return <ellipse cx={x} cy={y} rx={32 * tamanhoArea(item)} ry={22 * tamanhoArea(item)} {...traco}
      fill={tipo === 'despigmentacao' ? cor : 'none'} fillOpacity={tipo === 'despigmentacao' ? 0.22 : 1} />;
    return <polygon points={pontos.map((p) => `${p.x},${p.y}`).join(' ')} {...traco} strokeWidth="8"
      fill={tipo === 'despigmentacao' ? cor : 'none'} fillOpacity={tipo === 'despigmentacao' ? 0.22 : 1} />;
  }
  return null;
};

const ResenhaGrafica = ({ marcacoes, onChange, onPendingChange }) => {
  const [tipo, setTipo] = useState('rodopio');
  const [pendente, setPendente] = useState(null);
  const [desenhando, setDesenhando] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [editando, setEditando] = useState(null);
  const [comRodopio, setComRodopio] = useState(true);
  useEffect(() => { onPendingChange?.(!!pendente); }, [pendente, onPendingChange]);
  const atualizarPendente = (campo, valor) => setPendente((atual) => ({ ...atual, [campo]: valor }));
  const editar = (indice) => {
    const item = marcacoes[indice];
    setEditando(indice); setTipo(item.tipo); setPendente({ ...item }); setDescricao(item.descricao || '');
  };

  const ferramenta = FERRAMENTAS_RESENHA.find((f) => f.tipo === tipo);
  const posicao = (event) => {
    const svg = event.currentTarget;
    const matriz = svg.getScreenCTM();
    if (!matriz) return null;
    const ponto = svg.createSVGPoint();
    ponto.x = event.clientX; ponto.y = event.clientY;
    const { x, y } = ponto.matrixTransform(matriz.inverse());
    return { x: limitar(x, LARGURA_RESENHA), y: limitar(y, ALTURA_RESENHA) };
  };
  const iniciar = (event) => {
    if (pendente || event.button !== 0) return;
    const p = posicao(event);
    if (!p) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPendente({ id: crypto.randomUUID(), tipo, ...p, ...(tipo === 'espiga' ? { comRodopio } : {}), ...(CONTORNOS.includes(tipo) ? { pontos: [p], tamanho: 1 } : LINHAS.includes(tipo) ? { fim: p } : {}) });
    setDescricao('');
    setDesenhando(true);
  };
  const mover = (event) => {
    if (!desenhando) return;
    const p = posicao(event);
    if (!p) return;
    setPendente((atual) => {
      if (!atual) return atual;
      if (CONTORNOS.includes(atual.tipo)) {
        const anterior = atual.pontos.at(-1);
        if (Math.hypot(p.x - anterior.x, p.y - anterior.y) < 6 || atual.pontos.length >= 1200) return atual;
        return { ...atual, pontos: [...atual.pontos, p] };
      }
      return LINHAS.includes(atual.tipo) && (atual.tipo !== 'calcado' || Math.hypot(p.x - atual.x, p.y - atual.y) > 12) ? { ...atual, fim: p } : atual;
    });
  };
  const terminar = () => setDesenhando(false);
  const confirmar = () => {
    if (!pendente || !descricao.trim()) return;
    const item = { ...pendente, descricao: descricao.trim() };
    if (item.tipo === 'calcado' && (!item.membro || !item.classificacao)) return;
    onChange(editando === null ? [...marcacoes, item] : marcacoes.map((antigo, i) => i === editando ? item : antigo));
    setPendente(null); setDescricao(''); setEditando(null);
  };
  const cancelar = () => { setPendente(null); setDescricao(''); setDesenhando(false); setEditando(null); };
  const desfazer = () => onChange(marcacoes.slice(0, -1));

  return <section className="resenha-editor">
    <div className="resenha-editor__heading"><div><h5>Resenha gráfica</h5><p>Selecione o sinal, marque a prancha e descreva o que observou.</p></div>
      <span className="resenha-editor__counter">{marcacoes.length} {marcacoes.length === 1 ? 'sinal' : 'sinais'}</span></div>
    <div className="resenha-editor__legend"><span><i className="resenha-editor__dot black" /> Sinais escuros</span><span><i className="resenha-editor__dot red" /> Marcas brancas ou despigmentadas</span></div>
    <div className="resenha-editor__tools" role="group" aria-label="Ferramentas da resenha">
      {FERRAMENTAS_RESENHA.slice(0, 7).map((f) => <button key={f.tipo} type="button" disabled={!!pendente}
        aria-pressed={tipo === f.tipo} className={`resenha-editor__tool ${tipo === f.tipo ? 'active' : ''}`}
        onClick={() => setTipo(f.tipo)} title={f.ajuda}><span style={{ color: corSinal(f.tipo) }}>{f.icone}</span>{f.nome}</button>)}
      {['circulo', 'x', 'quadrado'].some((antigo) => marcacoes.some((m) => m.tipo === antigo)) &&
        <span className="resenha-editor__legacy">Marcações livres antigas continuam visíveis.</span>}
    </div>
    <div className="resenha-editor__tip" role="status"><strong>{ferramenta.nome}:</strong> {ferramenta.ajuda}</div>
    {tipo === 'espiga' && !pendente && <label className="resenha-editor__option"><input type="checkbox" checked={comRodopio} onChange={(e) => setComRodopio(e.target.checked)} /> A espiga começa em um rodopio (mostrar X)</label>}
    <details className="resenha-editor__guide"><summary>Entenda os símbolos</summary><p>X: rodopio. X com traço: espiga com rodopio. Traço preto: espiga sem rodopio. Triângulo: golpe de lança. Seta: cicatriz.</p><p>Contorno vermelho: pelos brancos. Área vermelha sombreada: pele despigmentada. No calçado, marque o limite branco e informe membro e altura. Direita e esquerda são as do animal.</p></details>
    <div className="resenha-editor__canvas"><svg viewBox={`0 0 ${LARGURA_RESENHA} ${ALTURA_RESENHA}`}
      role="img" aria-label="Prancha do equino para marcar sinais" style={{ touchAction: 'none', cursor: pendente && !desenhando ? 'default' : 'crosshair' }}
      onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar} onPointerCancel={terminar}>
      <image href={resenhaDescritiva} width={LARGURA_RESENHA} height={ALTURA_RESENHA} pointerEvents="none" />
      {[...marcacoes.map((m, i) => editando === i && pendente ? pendente : m), ...(pendente && editando === null ? [pendente] : [])].map((item, indice) => <g key={item.id || indice} pointerEvents="none">
        <SimboloResenha item={item} /><text x={Math.min(item.x + 30, LARGURA_RESENHA - 45)} y={Math.max(item.y - 22, 38)} fill={corSinal(item.tipo)} stroke="white" strokeWidth="6" paintOrder="stroke" fontSize="32" fontWeight="bold">{indice + 1}</text>
      </g>)}</svg></div>
    {pendente && !desenhando && <div className="resenha-editor__description"><label htmlFor="descricao-marcacao" className="form-label fw-bold">{editando === null ? 'Novo sinal' : `Editar sinal ${editando + 1}`} · {nomeSinal(pendente.tipo)}</label>
      {pendente.tipo === 'espiga' && <label className="resenha-editor__option"><input type="checkbox" checked={pendente.comRodopio !== false} onChange={(e) => atualizarPendente('comRodopio', e.target.checked)} /> Com rodopio na origem (mostrar X)</label>}
      {pendente.tipo === 'calcado' && <div className="resenha-editor__fields">
        <label>Membro<select className="form-select" value={pendente.membro || ''} onChange={(e) => atualizarPendente('membro', e.target.value)}><option value="">Selecione o membro</option>{MEMBROS_RESENHA.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>Calçamento<select className="form-select" value={pendente.classificacao || ''} onChange={(e) => atualizarPendente('classificacao', e.target.value)}><option value="">Selecione a altura</option>{CLASSES_CALCADO.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>}
      {CONTORNOS.includes(pendente.tipo) && <label className="resenha-editor__size" htmlFor="tamanho-sinal">Tamanho da área: {Math.round(tamanhoArea(pendente) * 100)}%<input id="tamanho-sinal" type="range" min="0.4" max="2" step="0.1" value={tamanhoArea(pendente)} onChange={(e) => atualizarPendente('tamanho', Number(e.target.value))} /></label>}
      <textarea id="descricao-marcacao" className="form-control" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="2" placeholder="Ex.: anterior esquerdo, calçado até o boleto" autoFocus />
      <div className="d-flex gap-2 mt-2"><button type="button" className="btn btn-primary" disabled={!descricao.trim() || (pendente.tipo === 'calcado' && (!pendente.membro || !pendente.classificacao))} onClick={confirmar}>{editando === null ? 'Confirmar sinal' : 'Salvar edição'}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelar}>Descartar</button></div>
    </div>}
    <div className="resenha-editor__list-heading"><strong>Sinais registrados</strong><button type="button" className="btn btn-sm btn-outline-secondary" disabled={!marcacoes.length || !!pendente} onClick={desfazer}>Desfazer último</button></div>
    {marcacoes.length === 0 ? <p className="text-muted mb-0">Nenhum sinal registrado ainda.</p> : <ol className="resenha-editor__list">{marcacoes.map((item, indice) => <li key={item.id || indice}>
      <span className="resenha-editor__number" style={{ color: corSinal(item.tipo) }}>{indice + 1}</span><div><strong>{resumoSinal(item)}</strong><p>{item.descricao}</p></div>
      <button type="button" className="btn btn-sm btn-outline-primary" disabled={!!pendente} onClick={() => editar(indice)}>Editar</button>
      <button type="button" className="btn btn-sm btn-outline-danger" disabled={!!pendente} aria-label={`Excluir sinal ${indice + 1}`} onClick={() => onChange(marcacoes.filter((_, i) => i !== indice))}>Excluir</button>
    </li>)}</ol>}
  </section>;
};
export default ResenhaGrafica;
