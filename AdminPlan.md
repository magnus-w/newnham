# AdminPlan.md — Newnham CMS

## What allabitar does (the reference pattern)

- Split-pane React app: left = editor form, right = live iframe preview
- All content lives in `data.json` in the repo
- Uses the **File System Access API** to open and auto-save `data.json` directly — no server required for text content
- Sends data to the preview iframe via `postMessage` for instant live preview
- Fallback (browsers without File System Access API): download/import JSON manually
- Three tabs: Show Info, Latest Episode, Episodes (accordion list)
- **No file uploads** — images are either external URLs or manually-placed local paths

---

## Key differences for newnham

### 1. Different content structure
Allabitar has a flat show + episodes model. Newnham has:
- One global field (hero intro)
- Three categories, each with their own intro text and a list of examples
- Each example card links to a sub-page that has its own headline, longer intro, and a document (PDF or JPG)

### 2. File uploads needed
Allabitar only handles text + URLs. Newnham needs actual uploads:
- **Card images** — the photo shown on each example card
- **Category images** — already in place (journalist.jpg etc.), but could be swappable
- **Documents** — a PDF or JPG shown full-width on each example sub-page

This means a **lightweight local server** is needed (like cv's server.js, or a simple `server.py`), accepting `POST /upload` and saving files to `assets/`.

### 3. Sub-page content
Allabitar has no sub-pages. For newnham, each example has a sub-page with:
- Headline
- Longer intro text
- A document (PDF or multi-image JPG)

**Proposed approach:** Instead of one static HTML file per example, make `example.html` a single **dynamic template** that reads `data.json` + a URL parameter (e.g. `example.html?id=journalist-001`) and renders the right content. No copying files — one template handles all sub-pages.

---

## Proposed data.json structure

```json
{
  "hero": {
    "intro": "Linda Newnhams text om sig själv..."
  },
  "journalist": {
    "intro": "Intro text for the journalist category.",
    "examples": [
      {
        "id": "journalist-001",
        "label": "Reportage",
        "title": "Artikelns titel",
        "description": "Kort beskrivande text på kortet.",
        "image": "assets/journalist/ex001-card.jpg",
        "subpage": {
          "headline": "Artikelns fulla titel",
          "intro": "Längre beskrivande text om detta arbete.",
          "document": "assets/journalist/ex001-document.pdf",
          "documentType": "pdf"
        }
      }
    ]
  },
  "forfattare": {
    "intro": "...",
    "examples": []
  },
  "redaktor": {
    "intro": "...",
    "examples": []
  }
}
```

`documentType` is `"pdf"` or `"jpg"` — controls how the sub-page renders it (`<embed>` vs `<img>`).

---

## How index.html changes

Currently all content is hardcoded HTML. With this system:
- On load, `index.html` fetches `data.json`
- JavaScript populates the hero intro, each category intro, and each example card grid
- Example card links become `example.html?id=journalist-001` etc.
- Falls back gracefully if `data.json` is missing (shows placeholder text)

This is a meaningful change to `index.html` but keeps it as a static file — no server rendering.

---

## How example.html changes

Becomes a dynamic template:
- Reads `?id=` from the URL
- Fetches `data.json`
- Finds the right example by ID across all categories
- Renders headline, intro, and document (PDF embed or img)
- Back button dynamically points to the right category anchor (`#journalist` etc.)

---

## Editor UI plan (editor.html)

**Same split-pane layout as allabitar** — editor left, live preview right.

### Tabs
| Tab | Contents |
|-----|----------|
| **Hero** | Single textarea: hero intro paragraph |
| **Journalist** | Category intro textarea + example accordion |
| **Författare** | Same |
| **Redaktör** | Same |

### Example accordion (per category — same pattern as allabitar episodes)
Each example row expands to show:
- **Label** — text input ("Reportage", "Intervju" etc.)
- **Title** — text input
- **Short description** — textarea (2–3 rows)
- **Card image** — upload button + preview (saves to `assets/journalist/`)
- **Sub-page: Headline** — text input
- **Sub-page: Intro** — textarea (4–5 rows)
- **Sub-page: Document** — upload button (PDF or JPG), shows type + filename
- Reorder ↑↓ and delete ×, same as allabitar

### Save / file handling
Same as allabitar:
- File System Access API opens `data.json` directly, auto-saves on change
- Fallback: download/import JSON

### Preview
- Right pane iframe showing `index.html`
- Live-updates as editor changes (via postMessage, same as allabitar)
- Sub-page preview: a second "Preview sub-page" link opens `example.html?id=…` in the iframe for the currently expanded example

---

## Server (server.py)

Simple Python HTTP server — same idea as allabitar's `start-server.py` but adds:

```
POST /upload
  body: multipart/form-data
  fields: file, category (journalist|forfattare|redaktor), type (card|document)
  saves to: assets/{category}/{filename}
  returns: { "path": "assets/journalist/filename.jpg" }
```

Also serves all static files (index.html, editor.html, data.json, assets/).

Start command:
```bash
python3 server.py
# Sajt:    http://localhost:4200/index.html
# Editor:  http://localhost:4200/editor.html
```

---

## Build order for next session

1. `server.py` — static serving + upload endpoint
2. `data.json` — initial structure with Lorem Ipsum content
3. `index.html` — add fetch + JS rendering of data.json content
4. `example.html` — convert to dynamic template
5. `editor.html` — build the CMS UI
6. Test full loop: edit → save → preview → sub-page
