# PPE Guard

AI-Assisted PPE Compliance System — **frontend only** (TypeScript + React + Tailwind + Node/Vite). Detection uses **mock data**; no YOLOv8 model is wired yet.

## Stack

- React 19 + TypeScript
- Vite (Node.js tooling)
- Tailwind CSS v4
- React Router
- Lucide icons

## Run

```bash
npm install
npm run dev
```

## Folder layout

```
src/
  components/     # reusable UI, layout, feature widgets
    layout/
    ui/
    dashboard/
    records/
  pages/          # route-level screens
  data/           # mock datasets
  types/          # shared TypeScript types
  context/        # auth (mock login)
```

## Workflow coverage (UI)

| Flow | Route |
| --- | --- |
| Login (Safety Officer / Site Engineer) | `/login` |
| Site Dashboard | `/` |
| Records (snapshots) | `/records` |
| Register / worker database | `/workers` |
| Worker compliance history | `/workers/:id` |
| Create toolbox (attendance + required PPE) | `/toolbox/create` |
| Work sessions | `/work-sessions` |
| Session detail (mock AI results) | `/work-sessions/:id` |
| Review violations | `/violations` |
| Review evidence | `/evidence` |
| Reports | `/reports` |
| Settings | `/settings` |
