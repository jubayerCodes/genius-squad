# Graph Report - GeniusSquad  (2026-11-23)

## Corpus Check
- 90 files · ~35,636 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 7, .example 2, .toml 1)

## Summary
- 521 nodes · 997 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- mockData.ts
- user.service.ts
- index.ts
- compilerOptions
- dependencies
- Server/package.json
- sendResponse
- dependencies
- layout.tsx
- compilerOptions
- AppError
- Genius Squad — Vercel Production Deployment Guide
- seed.ts
- next.config.mjs
- @prisma/client
- admin.service.ts
- auth.service.ts
- enrollment.service.ts
- scripts
- app.ts
- Project Initiation Document (PID): Genius Squad EdTech Platform
- Product Requirements Document (PRD): Genius Squad EdTech Platform
- Genius Squad - Workspace Rules & Guidelines
- vercel.json
- 3-Day Sprint Development Plan: Genius Squad EdTech Platform
- Genius Squad - Frontend (`Client/`) Agent Rules
- cookie.ts

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
- `Practical Enforcement` --references--> `globalErrorHandler()`  [INFERRED]
  GEMINI.md → Server/src/middlewares/globalErrorHandler.ts
- `1. Standardized API Response Helper: `sendResponse`` --references--> `sendResponse()`  [INFERRED]
  PRD.md → Server/src/lib/sendResponse.ts
- `Rules & Workflow` --references--> `useAuth()`  [INFERRED]
  AGENTS.md → Client/src/context/AuthContext.tsx
- `Rules & Workflow` --references--> `useAuth()`  [INFERRED]
  GEMINI.md → Client/src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (30 total, 6 thin omitted)

### Community 0 - "mockData.ts"
Cohesion: 0.08
Nodes (53): AdminCourseData, AdminCoursesContent(), AdminCoursesPage(), CourseFormData, initialFormState, AdminContent(), AdminPage(), AdminUserRecord (+45 more)

### Community 1 - "user.service.ts"
Cohesion: 0.32
Nodes (4): memoryStore, globalForPrisma, prisma, IUpdateProfile

### Community 2 - "index.ts"
Cohesion: 0.07
Nodes (37): express, TokenPayload, verifyToken(), authGuard(), Express, Request, validateRequest(), AdminController (+29 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "dependencies"
Cohesion: 0.14
Nodes (14): cookie-parser, cors, jsonwebtoken, multer, prisma, dependencies, cookie-parser@^1.4.7, cors@^2.8.5 (+6 more)

### Community 5 - "Server/package.json"
Cohesion: 0.12
Nodes (23): tsx, @types/bcryptjs, @types/cookie-parser, @types/cors, @types/express, @types/jsonwebtoken, @types/multer, devDependencies (+15 more)

### Community 6 - "sendResponse"
Cohesion: 0.07
Nodes (45): 3. Architecture & Code Quality Standards, 1. Production Security: No Unnecessary Console Logs, 2. Security Architecture & Implementation Cautions, 3. Architecture & Code Quality Standards, 4. Codebase Intelligence & Graph Navigation with Graphify, Genius Squad - Workspace Rules & Guidelines, Practical Enforcement, Rules & Workflow (+37 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (31): dependencies, lucide-react@^1.77.0, next@^16.4.6, postcss@^8.5.1, react@^19.0.0, react-dom@^19.0.0, @tailwindcss/postcss@^4.0.0, zod@3.24.2 (+23 more)

### Community 8 - "layout.tsx"
Cohesion: 0.21
Nodes (11): metadata, RootLayout(), Footer(), Icon(), Header(), CourseCardSkeleton(), DashboardEnrollmentSkeleton(), HeaderAuthSkeleton() (+3 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 10 - "AppError"
Cohesion: 0.18
Nodes (14): AppError, IAdminCourseResponse, ICourseFilter, ICourseResponse, ICreateCoursePayload, IUpdateCoursePayload, bulkDeleteCourses(), CourseService (+6 more)

### Community 11 - "Genius Squad — Vercel Production Deployment Guide"
Cohesion: 0.12
Nodes (16): 1. Create a New Project on Vercel, 1. Create a Second Project on Vercel, 2. Configure Project Settings, 2. Configure Project Settings, 3. Add Environment Variables, 3. Add Environment Variables, 4. Deploy and Verify, 4. Deploy and Verify (+8 more)

### Community 12 - "seed.ts"
Cohesion: 0.25
Nodes (6): bcryptjs, dotenv, bcryptjs@^3.0.3, dotenv@^16.4.7, COURSES, prisma

### Community 15 - "@prisma/client"
Cohesion: 0.17
Nodes (7): @prisma/client, @prisma/client@6.4.1, IAdminEnrollmentModel, IUser, ICourseModel, IEnrollmentModel, IUserModel

### Community 16 - "admin.service.ts"
Cohesion: 0.24
Nodes (6): IAdminEnrollmentResponse, IVerifyEnrollment, deleteUser(), updateUserRole(), updateUserStatus(), verifyEnrollment()

### Community 17 - "auth.service.ts"
Cohesion: 0.31
Nodes (8): signToken(), IAuthResponse, ILoginUser, IRegisterUser, AuthService, getMe(), loginUser(), registerUser()

### Community 18 - "enrollment.service.ts"
Cohesion: 0.18
Nodes (10): CourseData, INITIAL_COURSES, EnrollmentEntity, globalForStore, isDbConfigured, MemoryStore, UserEntity, ICreateEnrollment (+2 more)

### Community 19 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, postinstall, prisma:generate, prisma:push, start, vercel-build

### Community 21 - "app.ts"
Cohesion: 0.13
Nodes (10): Description, Guidelines, Rule: Prohibition of Unnecessary Console Logs in Production, app, globalErrorHandler(), courseImageUpload, fileFilter(), storage (+2 more)

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
Cohesion: 0.22
Nodes (8): 3-Day Sprint Development Plan: Genius Squad EdTech Platform, Day 1: Next.js Frontend & Express Server Separation (Completed), Day 2: Course Catalog, Checkout, Manual MFS Payment & Student Dashboard (Completed), Day 3: Admin Verification Portal, Vercel Deployment & Handover QA (In Progress), Objectives:, Objectives:, Objectives:, Sprint Overview & Daily Milestones

### Community 27 - "Genius Squad - Frontend (`Client/`) Agent Rules"
Cohesion: 0.33
Nodes (5): 1. Production Security: Zero Unnecessary Console Logs, 2. Architecture & Conventions, 3. Codebase Intelligence with Graphify, Genius Squad - Frontend (`Client/`) Agent Rules, This is NOT the Next.js you know

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `mockData.ts` to `Genius Squad - Workspace Rules & Guidelines`, `layout.tsx`, `sendResponse`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `sendResponse()` (e.g. with `3. Architecture & Code Quality Standards` and `Rules & Workflow`) actually correct?**
  _`sendResponse()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `mockData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08391608391608392 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `index.ts`, `sendResponse`, `admin.service.ts`, `auth.service.ts`, `enrollment.service.ts`, `app.ts`, `Genius Squad - Workspace Rules & Guidelines`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `AppError` (e.g. with `Rules & Workflow` and `Rules & Workflow`) actually correct?**
  _`AppError` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07372549019607844 - nodes in this community are weakly interconnected._
- **Why does `Rules & Workflow` connect `Genius Squad - Workspace Rules & Guidelines` to `mockData.ts`, `AppError`, `index.ts`, `sendResponse`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._