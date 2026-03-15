// Simple in-memory cache to avoid refetching the same word
const cache = new Map();

export async function lookupWord(word) {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const [translationResult, definitionResult] = await Promise.allSettled([
    fetchTranslation(key),
    fetchDefinition(key),
  ]);

  const result = {
    translation: translationResult.status === 'fulfilled' ? translationResult.value : null,
    definition: definitionResult.status === 'fulfilled' ? definitionResult.value : null,
  };

  cache.set(key, result);
  return result;
}

async function fetchTranslation(word) {
  const apiKey = import.meta.env.VITE_DEEPL_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: [word], source_lang: 'FR', target_lang: 'EN' }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.translations?.[0]?.text;
  if (!text || text.toLowerCase() === word.toLowerCase()) return null;
  return text;
}

async function fetchDefinition(word) {
  const res = await fetch(
    `https://fr.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const entries = data.fr;
  if (!entries?.length) return null;

  return entries.slice(0, 2).map((entry) => ({
    pos: entry.partOfSpeech,
    defs: entry.definitions
      .slice(0, 3)
      .map((d) => d.definition.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean),
  }));
}
