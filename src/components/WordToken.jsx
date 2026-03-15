import { useState } from 'react';

// Covers straight apostrophe, left/right single quotes, modifier letter apostrophe
const APOS = '[\\u0027\\u2018\\u2019\\u02BC]';

// French contraction: "J'interrogeai," → pre="", prefix="J'", core="interrogeai", post=","
const CONTRACTION_RE = new RegExp(
  `^([^\\w\\u00C0-\\u017E]*)((?:[a-zA-Z\\u00C0-\\u017E]{1,2}|[Qq]u)${APOS})([a-zA-Z\\u00C0-\\u017E][\\w\\u00C0-\\u017E-]*)([^\\w\\u00C0-\\u017E]*)$`
);

// Plain word: "bonjour," → pre="", core="bonjour", post=","
// Keep apostrophe in core so compound words like "aujourd'hui" stay whole
const WORD_RE = /^([^\w\u00C0-\u017E]*)([a-zA-Z\u00C0-\u017E][\u0027\u2018\u2019\u02BC\w\u00C0-\u017E-]*)([^\w\u00C0-\u017E]*)$/;

export default function WordToken({ word, isSaved, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const contractionMatch = word.match(CONTRACTION_RE);
  if (contractionMatch) {
    const [, pre, prefix, core, post] = contractionMatch;
    return (
      <>
        {pre}
        <span className="contraction-prefix">{prefix}</span>
        <span
          className={`word-token ${isSaved ? 'saved' : ''} ${hovered ? 'hovered' : ''}`}
          onClick={() => onSelect(core)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title={isSaved ? 'Sauvegardé — cliquez pour plus' : 'Cliquez pour définition / sauvegarder'}
        >
          {core}
        </span>
        {post}{' '}
      </>
    );
  }

  const wordMatch = word.match(WORD_RE);
  if (!wordMatch) {
    return <span>{word} </span>;
  }
  const [, pre, core, post] = wordMatch;

  return (
    <>
      {pre}
      <span
        className={`word-token ${isSaved ? 'saved' : ''} ${hovered ? 'hovered' : ''}`}
        onClick={() => onSelect(core)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={isSaved ? 'Sauvegardé — cliquez pour plus' : 'Cliquez pour définition / sauvegarder'}
      >
        {core}
      </span>
      {post}{' '}
    </>
  );
}
