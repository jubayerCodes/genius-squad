# Genius Squad - Backend (`Server/`) Agent Rules

Express.js + TypeScript + Prisma Modular API Server.

## 1. Production Security: Zero Unnecessary Console Logs

> [!CAUTION]
> **Strict Prohibition of Unnecessary Console Logs in Production**
> - Do NOT use or leave unnecessary `console.log`, `console.info`, or verbose console outputs in production controllers, services, or routes.
> - Printing incoming request bodies, tokens, database query results, or user information to server stdout creates serious compliance and security risks (credential leakage into log aggregators/terminal).
> - Server error logging is centralized in `globalErrorHandler` and must never print raw secrets or unscrubbed authentication headers.

## 2. Modular MVC & Service Layer
- Structure must strictly follow `src/modules/<module-name>/`:
  - `<module>.route.ts`
  - `<module>.controller.ts`
  - `<module>.service.ts`
  - `<module>.interface.ts`
  - `<module>.model.ts`
  - `<module>.validation.ts`
- Controllers ONLY receive request, call service, and send response via `sendResponse`. All logic lives in services.
- Routes are dynamically registered in `src/routes/index.ts` mounted at `/api/v1`.
- Always wrap async controllers in `catchAsync`.

## 3. Codebase Intelligence with Graphify
- Before modifying or adding backend services, models, or middlewares, use Graphify (`god_nodes`, `shortest_path`, `get_node`, or `graphify query`) to examine callers and module dependencies.
- After modifying backend code, run `graphify update .` to keep the project graph in sync.
