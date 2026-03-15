import WordToken from './WordToken';

const APOS = '[\u0027\u2018\u2019\u02BC]';
const CONTRACTION_CORE_RE = new RegExp(
  `^[^\\w\\u00C0-\\u017E]*(?:[a-zA-Z\\u00C0-\\u017E]{1,2}|[Qq]u)${APOS}([a-zA-Z\\u00C0-\\u017E][\\w\\u00C0-\\u017E-]*)`
);
const WORD_CORE_RE = /^[^\w\u00C0-\u017E]*([a-zA-Z\u00C0-\u017E][\u0027\u2018\u2019\u02BC\w\u00C0-\u017E-]*)/;

function extractCore(token) {
  const cm = token.match(CONTRACTION_CORE_RE);
  if (cm) return cm[1].toLowerCase();
  const wm = token.match(WORD_CORE_RE);
  return wm ? wm[1].toLowerCase() : null;
}

export default function Paragraph({ text, chapterIndex, paragraphIndex, savedWords, onWordSelect, highlightWord }) {
  const tokens = text.split(/\s+/);
  const savedSet = new Set(
    savedWords
      .filter((v) => v.chapterIndex === chapterIndex && v.paragraphIndex === paragraphIndex)
      .map((v) => v.word)
  );

  function getSentence(word) {
    const sentences = text.match(/[^.!?…]+[.!?…]*/g) || [text];
    const lower = word.toLowerCase();
    const found = sentences.find((s) => s.toLowerCase().includes(lower));
    return found ? found.trim() : text;
  }

  function handleSelect(core) {
    const word = core.toLowerCase();
    onWordSelect({
      word,
      chapterIndex,
      paragraphIndex,
      sentenceContext: getSentence(word),
      isSaved: savedSet.has(word),
    });
  }

  return (
    <p className={`para ${highlightWord ? 'highlight-para' : ''}`} data-para={`${chapterIndex}-${paragraphIndex}`}>
      {tokens.map((token, i) => {
        const core = extractCore(token);
        return (
          <WordToken
            key={i}
            word={token}
            isSaved={core ? savedSet.has(core) : false}
            onSelect={handleSelect}
          />
        );
      })}
    </p>
  );
}
