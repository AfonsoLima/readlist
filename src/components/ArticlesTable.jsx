import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { listArticles, addArticle, toggleRead, removeArticle } from '../services/articles'

export default function ArticlesTable() {
  const [rows, setRows] = useState([])
  const [newUrl, setNewUrl] = useState('')

  async function refresh() {
    setRows(await listArticles())
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newUrl) return
    try {
      await addArticle(newUrl)
      setNewUrl('')
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('articles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <h2>Read List</h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Cole a URL do artigo..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Salvar</button>
      </form>

      <table width="100%" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Título</th>
            <th>Autor</th>
            <th>URL</th>
            <th>Tag</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{r.title || '-'}</td>
              <td>{r.author || '-'}</td>
              <td><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td>
              <td>{r.tag || '-'}</td>
              <td>{new Date(r.saved_at).toLocaleString()}</td>
              <td>{r.status}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleRead(r.id, r.status !== 'read')}>
                  {r.status === 'read' ? 'Marcar não lido' : 'Marcar lido'}
                </button>
                <button onClick={() => removeArticle(r.id)}>Excluir</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="7" style={{ color: '#666' }}>Nenhum artigo ainda.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
