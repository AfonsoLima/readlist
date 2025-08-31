import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function LoginPassword() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Conta criada! Agora você já pode entrar.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: 16, border: '1px solid #333', borderRadius: 12 }}>
      <h2 style={{ marginBottom: 12 }}>{mode === 'signin' ? 'Entrar' : 'Criar conta'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
        <input
          type="email" placeholder="seu@email.com" value={email}
          onChange={e => setEmail(e.target.value)} required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #444', background: '#0a0a0a', color: '#eee' }}
        />
        <input
          type="password" placeholder="senha" value={password}
          onChange={e => setPassword(e.target.value)} required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #444', background: '#0a0a0a', color: '#eee' }}
        />
        {error && <div style={{ color: '#ff8080', fontSize: 13 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ padding: 10, borderRadius: 8 }}>
          {loading ? 'Aguarde…' : (mode === 'signin' ? 'Entrar' : 'Criar conta')}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 14, color: '#bbb' }}>
        {mode === 'signin' ? (
          <>Não tem conta? <button onClick={() => setMode('signup')} style={{ textDecoration: 'underline' }}>Criar</button></>
        ) : (
          <>Já tem conta? <button onClick={() => setMode('signin')} style={{ textDecoration: 'underline' }}>Entrar</button></>
        )}
      </div>
    </div>
  )
}
