# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Build production bundle to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run extract    # Extract and clean text from a PDF book → public/*.txt
```

No test suite exists in this project.

## Architecture

This is a vocabulary learning PWA. Users read French novels or Dutch text with clickable words, look up translations/definitions, save words to a personal vocab list, and study them as flashcards.

**Stack:**
- React 19 + Vite — frontend, PWA (installable, offline-capable via Workbox)
- Supabase — Postgres database + passwordless email auth (OTP)
- DeepL API — French→English or Dutch→English translation
- Netlify — hosting + serverless function to proxy DeepL (keeps API key server-side)

**API key handling:** DeepL API key must never be exposed in the browser. In dev, Vite proxies `/api/translate` to DeepL with the key from `.env`. In production, `netlify/functions/translate.mjs` does the same using a Netlify environment variable.

## Key Data Flows

**Word lookup:** User clicks a word → `WordToken` → `WordPanel` calls `translator.js` → parallel fetch to DeepL (via proxy) and Wiktionary → results cached in memory.

**Vocab persistence:** `store.js` wraps Supabase queries for the `vocab` table. `App.jsx` loads vocab on auth, passes it down, and calls store functions on add/remove.

**Book loading:** Plain-text files in `public/` (processed from PDFs by `scripts/extract-pdf.mjs`) are fetched and parsed by `textLoader.js` into chapters/paragraphs using regex.

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DEEPL_API_KEY=     # Dev only — never committed, used by Vite proxy
DEEPL_API_KEY=          # Production — set in Netlify dashboard
```
