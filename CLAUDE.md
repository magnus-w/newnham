# CLAUDE.md — Linda Newnham Portfolio

## Instructions
1. Don't assume. Surface tradeoffs before acting.
2. Minimum code that solves the problem. Nothing speculative.
3. Touch only what you must.
4. This is a static site — no build step, no framework.

## Running the project

```bash
python3 -m http.server 4200
# → http://localhost:4200
```

## Deployment

Deployed to Vercel, live at **newnham.se**. Linked to this GitHub repo — every push to `main` auto-deploys.

**Workflow:** edit locally → preview with Python server → `git push` → live in ~30s. No Vercel CLI needed locally.

**DNS (at domain registrar):**
- `newnham.se` → A record → `76.76.21.21` (apex domains can't use CNAME)
- `www.newnham.se` → CNAME → `cname.vercel-dns.com`
- Google Workspace MX + TXT records coexist fine — Vercel only touches A/CNAME

**API routes:** `api/data.js` and `api/upload.js` are served as Vercel serverless functions at `/api/data` and `/api/upload`.

**Note:** `editor.html` has no authentication — keep the URL obscure or add auth before sharing publicly.

## Architecture

Single-page portfolio for Linda Newnham (journalist, författare, redaktör).

### Files
- `index.html` — entire site (all styles, all sections, minimal JS)
- `example.html` — sub-page template; copy to e.g. `journalist/artikel.html` per example
- `assets/` — images (linda.jpg, journalist.jpg, forfattare.jpg, redaktor.jpg)

### Page structure (index.html)
1. **Topbar** — sticky, blurred. Brand + desktop nav (Start · Journalist · Författare · Redaktör) + Kontakt CTA. Mobile: hamburger replaces nav + CTA.
2. **Hero** — two-column (text left, portrait right). Headline "Linda Newnham", italic lede "Journalist, författare och redaktör" where each word is a **secret anchor link** (cream background reveals on hover/tap, no other visual change). Intro paragraph below rule.
3. **Category cards** — 3-column grid (`#categories`). Each card: full-bleed image, italic category word + ↗ arrow, scrolls to category section.
4. **Category sections** — `#journalist`, `#forfattare`, `#redaktor`. Each: TILLBAKA pill → full-width hero image → 640px intro paragraph → 3-column example cards grid → TILLBAKA pill.
5. **Footer** — `#contact`. Dark background, "Ta kontakt", email + Instagram.

### Typography
All **EB Garamond** — no other typefaces.
- Headlines: weight 400, large, tight leading
- Body / intro text: weight 400, 16px, line-height 1.75
- Lede (hero callout): italic, weight 400, `clamp(22px, 2.4vw, 32px)`
- Labels (eyebrow, tags, TILLBAKA, mobile menu): weight 500, 10–11px, uppercase, `letter-spacing: 0.16–0.18em`, `var(--ink-4)`
- Category titles on hero images: italic, weight 400, `clamp(56px, 8vw, 120px)`

### Colours
```
--bg: #faf8f5      warm off-white
--paper: #ffffff
--ink: #1b1815     warm near-black
--ink-2: #2f2b25
--ink-3: #635d55
--ink-4: #9a9488   labels, muted text
--rule: #e5dfd5    borders
--cream: #f1ebe0   hover backgrounds
--sand: #e6dcc8    placeholder image bg
--accent: #6b2936  wine red (brand dot, selection)
--pop: #c8a96e     gold (footer em)
```

### Navigation
- Smooth scroll via `scroll-behavior: smooth` on `<html>`
- `scroll-padding-top: 58px` accounts for sticky topbar
- Back buttons → `href="#top"` (`id="top"` on `<body>`)
- Category cards → `href="#journalist"` etc. (same-page anchors)
- Secret lede links → same anchors, no visual indication at rest
- Mobile menu closes on: link tap, outside tap

### Adding an example sub-page
1. Copy `example.html` to e.g. `journalist/artikel-titel.html`
2. Update `href` in both back buttons to `../index.html#journalist`
3. Fill in title, meta line, description text
4. Drop in image or PDF (see comments in the file for three options)
5. Update the corresponding `<a href="...">` in `index.html` example grid

### Images
- Category card + hero images: swap `assets/journalist.jpg` etc. for real images
- Example card images: add `<img src="...">` inside `.example-thumb` div
- Portrait: `assets/linda.jpg`, `object-position: center top`

### Placeholder content
All Lorem Ipsum text needs replacing:
- `hero-intro` paragraph in the hero
- `cat-intro` paragraphs in each of the three category sections
- Example card titles, tags, and descriptions
