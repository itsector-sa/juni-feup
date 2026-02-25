# Architecture Notes — juni-feup

Este documento explica o “porquê” da organização do projeto e os padrões usados.

## State Management
- Client state: Zustand (auth, theme, toast, onboarding)
- Server state: React Query (dashboard/projects/board)

## Validation
- Zod + React Hook Form (schemas como fonte de verdade)

## Mock API
- MSW (handlers + db in-memory)
- Activity feed com logs de eventos

## Board
- dnd-kit + framer-motion
- Undo via toast action que faz move inverso

## Command Palette
- cmdk + keywords (g d / g p / new project)

## Onboarding Spotlight
- Overlay com hole via 4 rects
- Click-through highlight
- Steps: click Projects → click Board → create card event
