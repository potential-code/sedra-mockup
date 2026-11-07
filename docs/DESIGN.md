# SEDRA mockup design system

Design read: accessible learning web app for people of determination aged 13 to 35. Warm, playful
but calm. SEDRA greens on a light sage page, white cards that lift, real photos everywhere.
Dials: variance 5, motion 5 (always off with reduced motion), density 4. Light theme only, plus the
black/white high-contrast preference (brief §3).

## Hard rules (brief, never break)

- Brief §3 accessibility: 48px targets, 18px body, one task per screen, focus visible, keyboard,
  labelled controls, no colour-only status (icon + text), no autoplay, no carousel, no timers,
  untimed checks, plain language, no horizontal scroll at 320px / 150% text.
- Contrast: headings `text-sedra-green` (#4b662f) or `text-ink` on white/sage; buttons white on
  `bg-sedra-green`. Never text in `sedra-lime`, `sedra-pale`, or small text in `sedra-mid`.
  White text on photos only over a green scrim.
- Logo: `<Logo />` only, on white, never recoloured. Brand motifs (tree, leaf border) are
  decoration: static, `aria-hidden`, never under body text, hidden in high contrast.
- Brief §2 achievements: badges are STATIC (no animation, no sound).
- No em dashes in copy. Every string via i18n (EN + AR). RTL via logical classes
  (`ms/me/ps/pe/start/end`, `text-start`); mirror directional arrows only (`rtl-mirror`).

## Tokens (src/styles/app.css)

- Page bg `bg-background` (#f4f7ee light sage). Cards `bg-surface` (white).
- Greens: `sedra-green` #4b662f, `sedra-green-800` #3c5225 (sidebar, dark panels),
  `sedra-mid`, `sedra-lime`, `sedra-pale`, `sedra-pale-50/100`; `sedra-brown` accent.
- Text: `text-ink`, `text-ink-soft`.
- Elevation: `shadow-sm | shadow-md | shadow-lg | shadow-pop` (green-tinted).
- Radius system: cards `rounded-2xl`, buttons/inputs `rounded-xl`, chips/avatars `rounded-full`.

## Utilities / components to use

- `card-pop`: white card, shadow-md, lifts on hover/focus-within (transform only).
- `motif-tree` (light panels) / `motif-tree-light` (green panels): faint tree watermark bottom-end.
- `<LeafBorder />`, `<ValuesBand />` from `@/components/shared/Motifs`.
- `<Reveal delay={stagger(i)}>` from `@/components/motion/Reveal`: fade-rise on first view; static
  under reduced motion. Use for hero, card grids, sections. Do not wrap every paragraph.
- `motion/react` for state feedback (correct-answer tick, progress fill, step change). Always
  gate with `useReducedMotion()` from `@/hooks/use-reduced-motion` (device setting always wins).
  Animate transform/opacity only. Springs: `{ type: 'spring', stiffness: 260, damping: 24 }`.
- Images: `asset('images/...')`, programme photos `images/programme-*.webp`, unit stills
  `images/units/<ID>.webp`, hero `images/home-hero.webp`, supporter `images/supporter.webp`.
  Always alt text (or `alt=""` if decorative next to the same text), width/height set,
  `object-cover`, rounded to match card.
- Icons: lucide-react (project standard), `aria-hidden`, size-5/6.

## Patterns

- Page header: soft hero band (`rounded-3xl bg-white shadow-md motif-tree`) with h1, one line,
  one primary action; optional photo on the end side on lg.
- Card grids: `grid gap-5 sm:grid-cols-2 xl:grid-cols-3`, each `card-pop overflow-hidden` with
  a photo top (aspect-[4/3] or [16/9]), body p-5, one clear action.
- Progress: big number + small bar or ring, label as text ("3 of 8 units complete").
- Status chips: `rounded-full px-3 py-1 text-sm font-semibold` + icon + text.
- Section spacing: `py-8` between sections, `container-page` max 72rem, `gap-6`.
