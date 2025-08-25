import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) alert(error.message)
    else alert('Enviamos um link de acesso para o seu e‑mail.')
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', gap: 8 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
      />
      <button type="submit">Entrar</button>
    </form>
  )
}
