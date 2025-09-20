// src/components/SetPassword.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SetPassword() {
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setMsg('');

    if (!pwd || pwd.length < 8) {
      setMsg('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (pwd !== pwd2) {
      setMsg('As senhas não conferem.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;

      setMsg('Senha definida com sucesso! Faça logout e entre novamente com e-mail + senha.');
      setPwd('');
      setPwd2('');
    } catch (err) {
      setMsg(err.message || 'Não foi possível definir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Definir senha</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <input
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800"
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Salvando…' : 'Salvar senha'}
        </button>
        {msg && <div className="text-sm text-neutral-300">{msg}</div>}
      </form>
    </div>
  );
}
