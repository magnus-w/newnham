# AdminPlan.md — Newnham CMS

## Architecture decision

**Vercel — local first, then online.**

- Develop and populate content locally with `vercel dev` (Magnus runs this)
- Deploy to Vercel when ready → Linda gets a URL + password, no terminal ever
- Same codebase, no rework between local and online phases

---

## Services used

| Service | Purpose |
|---------|---------|
| **Vercel Blob** | Store `data.json` content + all uploaded files (images, PDFs) |
| **Vercel** static hosting | Serve `index.html`, `example.html`, `editor.html` |
| **Vercel serverless functions** | `/api/data` and `/api/upload` — write access, password-protected |

No database needed. One service (Blob) handles both structured data and files.

---

## Data structure (data.json stored as a Blob)

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
        "image": "https://blob.vercel-storage.com/...",
        "subpage": {
          "headline": "Artikelns fulla titel",
          "intro": "Längre beskrivande text om detta arbete.",
          "document": "https://blob.vercel-storage.com/...",
          "documentType": "pdf"
        }
      }
    ]
  },
  "forfattare": { "intro": "...", "examples": [] },
  "redaktor":   { "intro": "...", "examples": [] }
}
```

`documentType` is `"pdf"` or `"jpg"` — controls how example.html renders it.

---

## API routes (serverless functions in `/api`)

### `GET /api/data`
Returns the current `data.json` blob. Public — used by index.html and example.html.

### `POST /api/data`
Replaces the `data.json` blob with the posted JSON body.
Password-protected: checks `Authorization: Bearer <EDITOR_PASSWORD>` header against env var.

### `POST /api/upload`
Accepts multipart file upload. Saves to Vercel Blob. Returns `{ url, pathname }`.
Password-protected: same mechanism.

---

## Password protection

Single env var: `EDITOR_PASSWORD` (set in Vercel dashboard + `.env.local` for local dev).

`editor.html` prompts for password on load, stores in `sessionStorage`, sends as Bearer token with every API call. No auth library needed.

---

## File structure

```
/
├── api/
│   ├── data.js       — GET + POST for data content
│   └── upload.js     — POST for file uploads
├── assets/           — static images already in repo
├── editor.html       — CMS UI (password-gated)
├── example.html      — dynamic template (?id= param)
├── index.html        — dynamic rendering (fetches /api/data)
├── package.json      — { "@vercel/blob": "..." }
└── .env.local        — EDITOR_PASSWORD, BLOB_READ_WRITE_TOKEN (gitignored)
```

---

## How index.html changes

- On load, fetches `GET /api/data`
- JS populates: hero intro, category intros, example card grids
- Example card links → `example.html?id=journalist-001`
- Graceful fallback if fetch fails (shows placeholder text)

---

## How example.html changes

- Reads `?id=` from URL
- Fetches `GET /api/data`
- Finds matching example across all categories
- Renders: headline, intro, document (PDF `<embed>` or `<img>`)
- Back button dynamically points to correct category anchor

---

## Editor UI (editor.html)

Split-pane: editor form left, live `<iframe>` preview right.

### Tabs
| Tab | Contents |
|-----|----------|
| **Hero** | Textarea: hero intro |
| **Journalist** | Category intro textarea + example accordion |
| **Författare** | Same |
| **Redaktör** | Same |

### Example accordion (per category)
Each row expands to show:
- Label, Title, Short description (text inputs / textarea)
- Card image — upload button → POST /api/upload → stores URL in data
- Sub-page: Headline, Intro
- Sub-page: Document — upload button (PDF or JPG), stores URL + type
- Reorder ↑↓ and delete ×

### Save behaviour
Every change auto-saves: debounced POST to `/api/data` with full JSON.
No manual save button needed.

### Preview
Right pane `<iframe>` pointing to `index.html`. Reloads after each save.
"Preview sub-page" button loads `example.html?id=…` for the open example.

---

## Build order

1. `package.json` — minimal (`@vercel/blob`)
2. `.env.local` — placeholder tokens
3. `api/data.js` — GET + POST
4. `api/upload.js` — POST
5. `data.json` — initial seed (Lorem Ipsum placeholders)
6. `index.html` — add fetch + JS rendering
7. `example.html` — convert to dynamic template
8. `editor.html` — CMS UI

## Local dev

```bash
npm install
vercel dev
# Site:    http://localhost:3000/index.html
# Editor:  http://localhost:3000/editor.html
```
