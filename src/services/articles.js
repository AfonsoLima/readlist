import { supabase } from '../lib/supabase'

export async function listArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addArticle(url, opts = {}) {
  const payload = {
    url,
    title: opts.title ?? url,
    author: opts.author ?? null,
    tag: opts.tag ?? null,
    status: 'unread'
  }
  const { data, error } = await supabase
    .from('articles')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleRead(id, read) {
  const { error } = await supabase
    .from('articles')
    .update({ status: read ? 'read' : 'unread' })
    .eq('id', id)
  if (error) throw error
}

export async function removeArticle(id) {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw error
}
