# Graph Report - GeniusSquad  (2026-11-23)

## Corpus Check
- 92 files · ~58,519 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 520 nodes · 996 edges · 31 communities (28 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `387981ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mockData.ts
- enrollment.service.ts
- admin.route.ts
- compilerOptions
- dependencies
- Server/package.json
- sendResponse
- dependencies
- layout.tsx
- compilerOptions
- course.service.ts
- Genius Squad — Vercel Production Deployment Guide
- seed.ts
- next.config.mjs
- next-env.d.ts
- @prisma/client
- AppError
- auth.service.ts
- dbStore.ts
- scripts
- app.ts
- Project Initiation Document (PID): Genius Squad EdTech Platform
- Product Requirements Document (PRD): Genius Squad EdTech Platform
- Genius Squad - Workspace Rules & Guidelines
- vercel.json
- 3-Day Sprint Development Plan: Genius Squad EdTech Platform
- Genius Squad - Frontend (`Client/`) Agent Rules
- cookie.ts
- Rule: Prohibition of Unnecessary Console Logs in Production

## God Nodes (most connected - your core abstractions)
1. `sendResponse()` - 34 edges
2. `AppError` - 32 edges
3. `useAuth()` - 21 edges
4. `react` - 21 edges
5. `express` - 20 edges
6. `next` - 16 edges
7. `compilerOptions` - 16 edges
8. `@prisma/client` - 14 edges
9. `ProtectedRoute()` - 12 edges
10. `Project Initiation Document (PID): Genius Squad EdTech Platform` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Practical Enforcement` --references--> `globalErrorHandler()`  [INFERRED]
  AGENTS.md → Server/src/middlewares/globalErrorHandler.ts
- `Guidelines` --references--> `globalErrorHandler()`  [INFERRED]
  .agents/rules/no-unnecessary-console-logs.md → Server/src/middlewares/globalErrorHandler.ts
- `Practical Enforcement` --references--> `globalErrorHandler()`  [INFERRED]
  GEMINI.md → Server/src/middlewares/globalErrorHandler.ts
- `1. Standardized API Response Helper: `sendResponse`` --references--> `sendResponse()`  [INFERRED]
  PRD.md → Server/src/lib/sendResponse.ts
- `Rules & Workflow` --references--> `AppError`  [INFERRED]
  AGENTS.md → Server/src/lib/AppError.ts

## Import Cycles
- None detected.

## Communities (31 total, 3 thin omitted)

### Community 0 - "mockData.ts"
Cohesion: 0.08
Nodes (56): AdminCourseData, AdminCoursesContent(), AdminCoursesPage(), CourseFormData, initialFormState, AdminContent(), AdminPage(), AdminUserRecord (+48 more)

### Community 1 - "enrollment.service.ts"
Cohesion: 0.19
Nodes (9): TokenPayload, isDbConfigured, memoryStore, globalForPrisma, prisma, ICreateEnrollment, IEnrollmentResponse, createEnrollment() (+1 more)

### Community 2 - "admin.route.ts"
Cohesion: 0.09
Nodes (33): express, ref_zod, verifyToken(), authGuard(), Express, Request, validateRequest(), AdminRoutes (+25 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "dependencies"
Cohesion: 0.13
Nodes (15): cookie-parser, cors, jsonwebtoken, multer, prisma, dependencies, cookie-parser@^1.4.7, cors@^2.8.5 (+7 more)

### Community 5 - "Server/package.json"
Cohesion: 0.12
Nodes (23): tsx, @types/bcryptjs, @types/cookie-parser, @types/cors, @types/express, @types/jsonwebtoken, @types/multer, devDependencies (+15 more)

### Community 6 - "sendResponse"
Cohesion: 0.06
Nodes (49): 3. Architecture & Code Quality Standards, 1. Production Security: No Unnecessary Console Logs, 2. Security Architecture & Implementation Cautions, 3. Architecture & Code Quality Standards, 4. Codebase Intelligence & Graph Navigation with Graphify, Genius Squad - Workspace Rules & Guidelines, Practical Enforcement, Rules & Workflow (+41 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (31): dependencies, lucide-react@^1.77.0, next@^16.4.6, postcss@^8.5.1, react@^19.0.0, react-dom@^19.0.0, @tailwindcss/postcss@^4.0.0, zod@3.24.2 (+23 more)

### Community 8 - "layout.tsx"
Cohesion: 0.21
Nodes (12): client_src_app_globals, metadata, RootLayout(), Footer(), Icon(), Header(), CourseCardSkeleton(), DashboardEnrollmentSkeleton() (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 10 - "course.service.ts"
Cohesion: 0.18
Nodes (12): IAdminCourseResponse, ICourseFilter, ICourseResponse, ICreateCoursePayload, IUpdateCoursePayload, bulkDeleteCourses(), createCourse(), deleteCourse() (+4 more)

### Community 11 - "Genius Squad — Vercel Production Deployment Guide"
Cohesion: 0.12
Nodes (16): 1. Create a New Project on Vercel, 1. Create a Second Project on Vercel, 2. Configure Project Settings, 2. Configure Project Settings, 3. Add Environment Variables, 3. Add Environment Variables, 4. Deploy and Verify, 4. Deploy and Verify (+8 more)

### Community 12 - "seed.ts"
Cohesion: 0.25
Nodes (6): bcryptjs, dotenv, bcryptjs@^3.0.3, dotenv@^16.4.7, COURSES, prisma

### Community 14 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): NOTE: This file should not be edited, client_next_types_root_params_d, client_next_types_routes_d

### Community 15 - "@prisma/client"
Cohesion: 0.18
Nodes (6): @prisma/client, IAdminEnrollmentModel, IUser, ICourseModel, IEnrollmentModel, IUserModel

### Community 16 - "AppError"
Cohesion: 0.26
Nodes (7): AppError, IAdminEnrollmentResponse, IVerifyEnrollment, deleteUser(), updateUserRole(), updateUserStatus(), verifyEnrollment()

### Community 17 - "auth.service.ts"
Cohesion: 0.31
Nodes (8): signToken(), IAuthResponse, ILoginUser, IRegisterUser, AuthService, getMe(), loginUser(), registerUser()

### Community 18 - "dbStore.ts"
Cohesion: 0.24
Nodes (6): CourseData, INITIAL_COURSES, EnrollmentEntity, globalForStore, MemoryStore, UserEntity

### Community 19 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, postinstall, prisma:generate, prisma:push, start, vercel-build

### Community 21 - "app.ts"
Cohesion: 0.16
Nodes (11): ref_fs, ref_os, ref_path, app, globalErrorHandler(), courseImageUpload, fileFilter(), storage (+3 more)

### Community 22 - "Project Initiation Document (PID): Genius Squad EdTech Platform"
Cohesion: 0.07
Nodes (29): 10. Cost Breakdown & Budget Projections, 11. Approval & Sign-Off, 1.1 Project Overview, 1.2 Core Objectives, 1. Executive Summary & Project Purpose, 2.1 In-Scope (MVP Phase), 2.2 Out-of-Scope (Deferred to Phase 2), 2. Project Scope & Boundary (+21 more)

### Community 23 - "Product Requirements Document (PRD): Genius Squad EdTech Platform"
Cohesion: 0.11
Nodes (17): 1.1 Product Vision, 1.2 Core MVP Strategy: Lean & Zero-Cost Operations, 1. Product Vision & Operational Strategy, 1. Standardized API Response Helper: `sendResponse`, 2.1 Complete Technology Matrix, 2.2 Client Handover & Private Repository Deployment, 2. Generic Authentication & Role Guard Helper, 2. Technology Stack & Infrastructure Specifications (+9 more)

### Community 24 - "Genius Squad - Workspace Rules & Guidelines"
Cohesion: 0.25
Nodes (7): 1. Production Security: No Unnecessary Console Logs, 2. Security Architecture & Implementation Cautions, 4. Codebase Intelligence & Graph Navigation with Graphify, Genius Squad - Workspace Rules & Guidelines, Practical Enforcement, Rules & Workflow, Security Rationale & Risks

### Community 26 - "3-Day Sprint Development Plan: Genius Squad EdTech Platform"
Cohesion: 0.25
Nodes (7): 3-Day Sprint Development Plan: Genius Squad EdTech Platform, Day 1: Next.js Frontend & Express Server Separation (Completed), Day 2: Course Catalog, Checkout, Manual MFS Payment & Student Dashboard (Completed), Day 3: Admin Verification Portal, Vercel Deployment & Handover QA (In Progress), Objectives:, Objectives:, Sprint Overview & Daily Milestones

### Community 27 - "Genius Squad - Frontend (`Client/`) Agent Rules"
Cohesion: 0.33
Nodes (5): 1. Production Security: Zero Unnecessary Console Logs, 2. Architecture & Conventions, 3. Codebase Intelligence with Graphify, Genius Squad - Frontend (`Client/`) Agent Rules, This is NOT the Next.js you know

### Community 29 - "Rule: Prohibition of Unnecessary Console Logs in Production"
Cohesion: 0.50
Nodes (3): Description, Guidelines, Rule: Prohibition of Unnecessary Console Logs in Production

## Knowledge Gaps
- **146 isolated node(s):** `CourseFormData`, `AuthProps`, `DistrictSelectProps`, `ProtectedRouteProps`, `ApiResponse` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `mockData.ts` to `Genius Squad - Workspace Rules & Guidelines`, `layout.tsx`, `sendResponse`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **Why does `AppError` connect `AppError` to `enrollment.service.ts`, `admin.route.ts`, `sendResponse`, `course.service.ts`, `auth.service.ts`, `app.ts`, `Genius Squad - Workspace Rules & Guidelines`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `Rules & Workflow` connect `Genius Squad - Workspace Rules & Guidelines` to `mockData.ts`, `AppError`, `admin.route.ts`, `sendResponse`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `sendResponse()` (e.g. with `3. Architecture & Code Quality Standards` and `Rules & Workflow`) actually correct?**
  _`sendResponse()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AppError` (e.g. with `Rules & Workflow` and `Rules & Workflow`) actually correct?**
  _`AppError` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `useAuth()` (e.g. with `Rules & Workflow` and `Rules & Workflow`) actually correct?**
  _`useAuth()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CourseFormData`, `AuthProps`, `DistrictSelectProps` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._