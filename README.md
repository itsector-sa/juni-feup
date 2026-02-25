# IT Sector | Juni FEUP

Mini “SaaS-style” app para workshop/aula prática (React 19 + Vite) com padrões modernos de frontend:
- **Auth** (client state com Zustand)
- **Server state** (React Query + Devtools)
- **Validation** (Zod + React Hook Form)
- **CRUD** (Projects)
- **Kanban Board** com **Drag & Drop**, animações e **Undo**
- **Command Palette** (Ctrl+K) e atalhos de teclado
- **Dark Mode** (persistente)
- **Dashboard** com charts + activity feed
- **Onboarding Tour** com spotlight interativo (click-through + gamified steps)

> Objetivo: dar uma base “real de produto” para estudantes: arquitetura, tooling, padrões e UX “premium”.

---

## 🚀 Quickstart

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install
pnpm dev
```

---

## Quality

- `pnpm check` — Biome check (lint + format + imports)
- `pnpm check:write` — aplica fixes automaticamente
- `pnpm typecheck` — TypeScript typecheck (tsc --noEmit)
- `pnpm ci` — check + typecheck + build

---

## GitHub Codespaces (Dev Container)

Este repo inclui `.devcontainer/` — basta criar um Codespace e correr `pnpm dev`.

---

## Deploy (GitHub Pages)

Deploy automático via GitHub Actions em pushes/merges para `main`.

URL final:
`https://itsector-sa.github.io/juni-feup/`

Configurar 1x:
Repo → Settings → Pages → Source: **GitHub Actions**

---

## Standards

See:
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `docs/ARCHITECTURE.md`

License: MIT
