import { supabase } from './supabase';

export async function loadVocab(userId, bookId) {
  const { data, error } = await supabase
    .from('vocab')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .order('saved_at', { ascending: true });

  if (error) { console.error(error); return []; }
  return data.map(toEntry);
}

export async function addWord(userId, bookId, { word, chapterIndex, paragraphIndex, sentenceContext }) {
  const { data, error } = await supabase
    .from('vocab')
    .insert({
      user_id: userId,
      book_id: bookId,
      word,
      chapter_index: chapterIndex,
      paragraph_index: paragraphIndex,
      sentence_context: sentenceContext,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = already saved, not a real error
    if (error.code !== '23505') console.error(error);
    return null;
  }
  return toEntry(data);
}

export async function removeWord(id) {
  const { error } = await supabase.from('vocab').delete().eq('id', id);
  if (error) console.error(error);
}

// Map snake_case DB columns → camelCase app fields
function toEntry(row) {
  return {
    id: row.id,
    word: row.word,
    chapterIndex: row.chapter_index,
    paragraphIndex: row.paragraph_index,
    sentenceContext: row.sentence_context,
    savedAt: row.saved_at,
  };
}
