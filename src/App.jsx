import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, Trash2, Plus, Link2, Filter, Tag as TagIcon, RefreshCcw, Database, Info } from "lucide-react";

/** @typedef {"Lido" | "Não lido"} Status */

// ==== Utils ====
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmtDate = (d) => new Date(d).toLocaleString("pt-BR", { hour12: false });
const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

// ==== Storage Keys ====
const KEY_ARTICLES = "readlist_articles_v1";
const KEY_TAGS = "readlist_tags_v1";

export default function App() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState(() => {
    const raw = localStorage.getItem(KEY_ARTICLES);
    return raw ? JSON.parse(raw) : [];
  });
  const [tags, setTags] = useState(() => {
    const raw = localStorage.getItem(KEY_TAGS);
    return raw ? JSON.parse(raw) : ["Geral", "Tecnologia", "Negócios", "Educação"]; // iniciais
  });
  const [filters, setFilters] = useState({ tag: "Todos", status: "Todos", search: "" });
  const [prefill, setPrefill] = useState(null); // { title, author }
  const [pendingFromBookmarklet, setPendingFromBookmarklet] = useState(false);

  useEffect(() => localStorage.setItem(KEY_ARTICLES, JSON.stringify(articles)), [articles]);
  useEffect(() => localStorage.setItem(KEY_TAGS, JSON.stringify(tags)), [tags]);

  // Recebe dados via querystring do bookmarklet (?url=&title=&author=)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const u = sp.get('url');
      if (u) {
        setUrl(u);
        const t = sp.get('title') || '';
        const a = sp.get('author') || '';
        setPrefill({ title: t, author: a });
        setPendingFromBookmarklet(true);
        // Limpa querystring para evitar salvar bookmarks com dados efêmeros
        const newUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      }
    } catch {/* ignore */}
  }, []);

  const onAddUrl = (e) => {
    e?.preventDefault?.();
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) { alert("URL inválida. Tente algo como https://exemplo.com/artigo"); return; }
    if (articles.some(a => a.url === trimmed)) { alert("Essa URL já está na lista."); return; }

    const u = new URL(trimmed);
    const defaultTitle = (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/+$/, "");

    const newItem = {
      id: uid(),
      title: (prefill?.title && prefill.title.trim()) || defaultTitle || trimmed,
      author: (prefill?.author && prefill.author.trim()) || "",
      url: trimmed,
      tag: tags[0] || "Geral",
      savedAt: new Date().toISOString(),
      status: /** @type {Status} */("Não lido"),
    };
    setArticles(prev => [newItem, ...prev]);
    setUrl("");
    setPrefill(null);
    setPendingFromBookmarklet(false);
  };

  const updateArticle = (id, patch) => setArticles(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  const removeArticle = (id) => setArticles(prev => prev.filter(a => a.id !== id));

  const addNewTag = () => {
    const name = prompt("Nome da nova tag:");
    const clean = name?.trim();
    if (!clean) return;
    if (tags.includes(clean)) { alert("Essa tag já existe."); return; }
    setTags(prev => [...prev, clean]);
  };

  const clearAll = () => {
    if (!confirm("Tem certeza que deseja apagar todos os artigos?")) return;
    setArticles([]);
  };

  const addExamples = () => {
    const samples = [
      {
        id: uid(),
        title: "[Exemplo] Bounded Context (DDD)",
        author: "Martin Fowler",
        url: "https://martinfowler.com/bliki/BoundedContext.html",
        tag: tags[1] || "Tecnologia",
        savedAt: new Date().toISOString(),
        status: /** @type {Status} */("Não lido"),
      },
      {
        id: uid(),
        title: "[Exemplo] Product-Market Fit Survey",
        author: "Sean Ellis",
        url: "https://www.seanellis.me/product-market-fit",
        tag: tags[2] || "Negócios",
        savedAt: new Date().toISOString(),
        status: /** @type {Status} */("Lido"),
      },
    ];
    setArticles(prev => [...samples, ...prev]);
  };

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const tagOk = filters.tag === "Todos" || a.tag === filters.tag;
      const statusOk = filters.status === "Todos" || a.status === filters.status;
      const s = filters.search.toLowerCase();
      const searchOk = !s || a.title.toLowerCase().includes(s) || a.author.toLowerCase().includes(s) || a.url.toLowerCase().includes(s);
      return tagOk && statusOk && searchOk;
    });
  }, [articles, filters]);

  const uniqueTags = useMemo(() => ["Todos", ...tags], [tags]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Read List — v0.1</h1>
            <p className="text-neutral-400 text-sm">Bookmarklet com confirmação → preenche e você confirma o salvamento.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addExamples} className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm flex items-center gap-2"><Database size={16}/>Adicionar exemplos</button>
            <button onClick={clearAll} className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm flex items-center gap-2"><Trash2 size={16}/>Limpar tudo</button>
          </div>
        </header>

        {/* Aviso quando vier do bookmarklet */}
        {pendingFromBookmarklet && (
          <div className="bg-indigo-950/30 border border-indigo-800/60 text-indigo-200 rounded-2xl p-3 flex items-start gap-2">
            <Info size={18} className="mt-0.5"/>
            <div>
              <div className="font-medium">Dados recebidos do bookmarklet</div>
              <div className="text-indigo-200/80 text-sm">Revise e clique em <strong>Salvar</strong> para confirmar.</div>
            </div>
          </div>
        )}

        {/* Add Bar */}
        <form onSubmit={onAddUrl} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"><Link2 size={18}/></span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole a URL do artigo e pressione Enter"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-neutral-950/70 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2">
              <Plus size={18}/> Salvar
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Dica: após salvar, você pode editar Título/Autor clicando na célula.</p>

          {pendingFromBookmarklet && (
            <div className="mt-3 p-3 rounded-xl border border-indigo-700/40 bg-indigo-900/20 text-sm">
              <div className="font-medium mb-1">Pré-visualização</div>
              <div className="text-neutral-300 break-words"><span className="text-neutral-400">Título:</span> {prefill?.title || <em className="text-neutral-500">(vazio)</em>}</div>
              <div className="text-neutral-300 break-words"><span className="text-neutral-400">Autor:</span> {prefill?.author || <em className="text-neutral-500">(vazio)</em>}</div>
              <div className="text-neutral-300 break-words"><span className="text-neutral-400">URL:</span> {url}</div>
              <div className="mt-2 flex gap-2">
                <button type="submit" className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Confirmar e salvar</button>
                <button type="button" onClick={() => { setPrefill(null); setPendingFromBookmarklet(false); setUrl(""); }} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">Descartar</button>
              </div>
            </div>
          )}
        </form>

        {/* Filtros */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-neutral-300"><Filter size={16}/> Filtros</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={filters.tag} onChange={e=>setFilters(f=>({...f, tag:e.target.value}))} className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800">
              {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))} className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800">
              {['Todos','Não lido','Lido'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              value={filters.search}
              onChange={e=>setFilters(f=>({...f, search:e.target.value}))}
              placeholder="Buscar por título, autor ou URL"
              className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800"
            />
            <button onClick={addNewTag} className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm flex items-center gap-2"><TagIcon size={16}/>Nova tag</button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
            <div className="col-span-3">Título</div>
            <div className="col-span-2">Autor</div>
            <div className="col-span-3">URL</div>
            <div className="col-span-2">Tag</div>
            <div className="col-span-1">Salvo em</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="p-6 text-neutral-400">Nenhum artigo ainda. Adicione uma URL acima para começar.</div>
            ) : filtered.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-12 px-4 py-3 border-b border-neutral-850/50 hover:bg-neutral-900/40"
              >
                {/* Título (editável) */}
                <div className="col-span-3 pr-2">
                  <InlineEdit value={a.title} onChange={(v)=>updateArticle(a.id,{ title: v })} placeholder="Sem título" />
                </div>
                {/* Autor (editável) */}
                <div className="col-span-2 pr-2">
                  <InlineEdit value={a.author} onChange={(v)=>updateArticle(a.id,{ author: v })} placeholder="Autor opcional" />
                </div>
                {/* URL */}
                <div className="col-span-3 pr-2 truncate">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline break-all">{a.url}</a>
                </div>
                {/* Tag */}
                <div className="col-span-2 pr-2">
                  <select value={a.tag} onChange={e=>updateArticle(a.id,{ tag: e.target.value })} className="w-full px-2 py-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    {tags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Data */}
                <div className="col-span-1 pr-2 text-sm text-neutral-300">{fmtDate(a.savedAt)}</div>
                {/* Status + Ações */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    onClick={()=>updateArticle(a.id,{ status: a.status === "Lido" ? "Não lido" : "Lido" })}
                    className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 ${a.status === "Lido" ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-neutral-800 border-neutral-700 text-neutral-200"}`}
                    title={a.status === "Lido" ? "Marcar como Não lido" : "Marcar como Lido"}
                  >
                    {a.status === "Lido" ? <CheckCircle size={14}/> : <Circle size={14}/>} {a.status}
                  </button>
                  <button onClick={()=>removeArticle(a.id)} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300" title="Remover">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Rodapé */}
        <div className="text-xs text-neutral-500 flex items-center gap-2">
          <RefreshCcw size={14}/> Dados salvos no seu navegador (localStorage). Nenhum servidor necessário.
        </div>
      </div>
    </div>
  );
}

function InlineEdit({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  useEffect(()=>setDraft(value || ""), [value]);
  return (
    <div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e)=>setDraft(e.target.value)}
          onKeyDown={(e)=>{ if (e.key === 'Enter') { onChange(draft.trim()); setEditing(false); } if (e.key === 'Escape') { setDraft(value || ""); setEditing(false);} }}
          onBlur={()=>{ onChange(draft.trim()); setEditing(false); }}
          placeholder={placeholder}
          className="w-full px-2 py-2 rounded-lg bg-neutral-950 border border-neutral-800"
        />
      ) : (
        <button onClick={()=>setEditing(true)} className="text-left w-full px-2 py-1.5 rounded-lg hover:bg-neutral-900/60">
          <span className={value ? "" : "text-neutral-500"}>{value || placeholder}</span>
        </button>
      )}
    </div>
  );
}

// ajuste fino de borda
const style = document.createElement('style');
style.innerHTML = `.border-neutral-850\/50{border-color: rgba(38,38,38,0.5);}`;
document.head.appendChild(style);
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Login />
  }

  return (
    <div>
      {/* aqui depois vamos colocar sua tabela de artigos */}
      <h1>Read List</h1>
    </div>
  )
}

