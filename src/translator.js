// Simple in-memory cache to avoid refetching the same word
const cache = new Map();

export async function lookupWord(word, lang = 'FR') {
  const normalized = word.toLowerCase();
  const key = `${lang}:${normalized}`;
  if (cache.has(key)) return cache.get(key);

  const promises = [fetchTranslation(normalized, lang)];
  if (lang === 'FR') promises.push(fetchDefinition(normalized));

  const [translationResult, definitionResult] = await Promise.allSettled(promises);

  const result = {
    translation: translationResult.status === 'fulfilled' ? translationResult.value : null,
    definition: definitionResult?.status === 'fulfilled' ? definitionResult.value : null,
  };

  cache.set(key, result);
  return result;
}

async function fetchTranslation(word, lang) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [word], source_lang: lang, target_lang: 'EN-US' }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.translations?.[0]?.text;
  if (!text || text.toLowerCase() === word.toLowerCase()) return null;
  return text;
}

async function fetchDefinition(word) {
  const res = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
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
