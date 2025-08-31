// src/services/articles.js
import { supabase } from '../lib/supabase.js'

// Converte 'read'|'unread' (DB) <-> 'Lido'|'Não lido' (UI)
export const toUiStatus = (dbStatus) => (dbStatus === 'read' ? 'Lido' : 'Não lido')
export const toDbStatus = (uiStatus) => (uiStatus === 'Lido' ? 'read' : 'unread')

// SELECT
export async function listArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(row => ({
    id: row.id,
    title: row.title ?? '',
    author: row.author ?? '',
    url: row.url,
    tag: row.tag ?? 'Geral',
    savedAt: row.saved_at,
    status: toUiStatus(row.status)
  }))
}

// INSERT
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
  if (error) throw new Error(error.message)
  return {
    id: data.id,
    title: data.title ?? '',
    author: data.author ?? '',
    url: data.url,
    tag: data.tag ?? 'Geral',
    savedAt: data.saved_at,
    status: toUiStatus(data.status)
  }
}

// UPDATE (campos arbitrários)
export async function updateArticleFields(id, patchUi) {
  const patchDb = {}
  if (patchUi.title !== undefined) patchDb.title = patchUi.title
  if (patchUi.author !== undefined) patchDb.author = patchUi.author
  if (patchUi.tag !== undefined) patchDb.tag = patchUi.tag
  if (patchUi.status !== undefined) patchDb.status = toDbStatus(patchUi.status)
  if (patchUi.savedAt !== undefined) patchDb.saved_at = patchUi.savedAt

  const { error } = await supabase
    .from('articles')
    .update(patchDb)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// TOGGLE read/unread
export async function toggleRead(id, uiRead) {
  const { error } = await supabase
    .from('articles')
    .update({ status: uiRead ? 'read' : 'unread' })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// DELETE
export async function removeArticle(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
