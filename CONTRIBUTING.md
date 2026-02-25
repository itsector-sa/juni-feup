# Contributing — juni-feup

Obrigado por contribuires 🙌

## Setup
- Node 22+
- pnpm 9.x

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install
pnpm dev
```

## Quality
```bash
pnpm check
pnpm check:write
pnpm typecheck
```

## Branching
- `main` → sempre deployable
- `feat/<name>`, `fix/<name>`, `chore/<name>`

## Commits
- `feat(scope): msg`
- `fix(scope): msg`
- `chore(scope): msg`

Scopes: `app`, `auth`, `dashboard`, `projects`, `board`, `ui`, `msw`, `ci`
