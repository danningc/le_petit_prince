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
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=fr|en`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.responseData?.translatedText;
  // MyMemory echoes back the input when it can't translate
  if (!text || text.toLowerCase() === word) return null;
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
