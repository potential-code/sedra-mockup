# SEDRA learning mockup

Clickable, frontend-only mockup of the SEDRA Foundation bilingual (English/Arabic) learning
platform for people of determination: Life Skills (Healthy Communication) and Hospitality for
All (Introduction to Hospitality). Built from Rawzaba's brief (`docs/brief.txt`). Illustrative
demo data only; progress is saved in the browser (Reset demo data in Demo mode).

## Run

```bash
bun install
bun run dev      # http://127.0.0.1:5180
bun run build    # typecheck + static build to dist/sedra/learning-platform/
bun run lint
```

The build uses `base: './'` and hash routing (`#/learn`), so `dist/sedra/learning-platform/`
can be copied as-is into `potential-mockups/sites/sedra/learning-platform/`.

## Structure

- `shared/types.ts` content, progress and demo types
- `src/content/` 16 units, 2 courses, EXT01 (Localized `{ en, ar }`)
- `src/i18n/{en,ar}/*.json` UI strings (common, learner, admin)
- `src/store/` one versioned localStorage db (`sedra-demo-db`), actions and hooks
- `src/mocks/` fictional personas, sessions, support requests, admin learners
- `src/routes/` thin route files → `src/features/<area>/` pages
- `public/brand`, `public/images`, `public/media/{LS02,HF01}` (Vera v2 videos, captions, transcripts)
- `docs/sources/` original client files, PDF renders and notes
