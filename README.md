# GearSight

AI-Assisted PPE Compliance System — React + Tailwind UI, runnable in the **browser** or as a **desktop app** (Electron).

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Lucide icons
- Electron (desktop window around the same UI)

## Run in the browser

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`).

## Run as a desktop app

```bash
npm install
npm run electron:dev
```

This starts Vite, then opens GearSight in an Electron window. DevTools open automatically.

### How to see your changes while testing

1. Keep `npm run electron:dev` running.
2. Edit any React/Tailwind file under `src/` (for example `LiveFeedCard.tsx`).
3. Save the file.
4. The desktop window updates by itself (Vite hot reload). Usually no restart needed.

If the window looks stuck:

- Press `Ctrl+R` in the Electron window to refresh, or
- Stop the terminal (`Ctrl+C`) and run `npm run electron:dev` again.

### Preview the production build in Electron

```bash
npm run electron:preview
```

This builds the UI once, then opens Electron without hot reload. Use this to check the packaged-style load path.

## Project structure

```
src/
  App.tsx                 # routes only
  components/             # shared across pages
    layout/               # Sidebar, Footer, AppLayout, PageHeader
    brand/
    ui/
    tutorial/
    SnapshotThumb.tsx
  pages/
    live-feed/
      LiveFeedPage.tsx
      components/
    records/
      RecordsPage.tsx
      components/
    login/
      LoginPage.tsx
      components/
    signup/
      SignUpPage.tsx
      components/
    about/
      AboutPage.tsx
      components/
    loading/
      LoadingPage.tsx
      components/
```

## Pages

| Flow | Route |
| --- | --- |
| Login | `/login` |
| Live Feed | `/` |
| Records (list / grid) | `/records` |
| About us | `/about` |

## Supabase backend

Cloud auth, projects, toolbox sessions, snapshots, and reports use Supabase.

1. Create a Supabase project.
2. Run [`supabase/migrations/202603290001_init.sql`](supabase/migrations/202603290001_init.sql) in the SQL Editor.
3. Copy `.env.example` → `.env.local` and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
4. Restart `npm run dev`.

Details: [`supabase/README.md`](supabase/README.md).

Local RT-DETR (`npm run detect`) and phone GPS verify stay on this machine.

## Note on detection

Electron wraps the **same frontend UI**. Live PPE detection runs via the local Python RT-DETR service (`npm run detect`).
