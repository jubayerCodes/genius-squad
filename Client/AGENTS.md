# Genius Squad - Frontend (`Client/`) Agent Rules

Next.js 15 (App Router) + React 19 + Tailwind CSS frontend application.

## 1. Production Security: Zero Unnecessary Console Logs

> [!CAUTION]
> **Strict Prohibition of Unnecessary Console Logs in Production**
> - Do NOT use or leave unnecessary `console.log`, `console.info`, `console.debug`, or `console.dir` statements.
> - Exposing application state, API payloads, tokens, or demographic data in the browser console causes severe security and information leakage vulnerabilities.
> - Client-side errors must be captured and reflected in the UI (e.g. error toasts, alert banners, form error states), never dumped to `console.log`.

## 2. Architecture & Conventions
- Pure Next.js 15 App Router structure in `src/app/`.
- Styling: Tailwind CSS v4.
- All API interactions must route through `src/lib/apiClient.ts` using the dynamic Next.js rewrite proxy to `/api/v1/*`.
- Global auth state is managed by `src/context/AuthContext.tsx`.

## 3. Codebase Intelligence with Graphify
- Before modifying shared components, hooks, or pages, use Graphify (`god_nodes`, `shortest_path`, `get_node`, or `graphify query`) to examine component trees and dependencies.
- After modifying frontend code, run `graphify update .` to keep the project graph in sync.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
