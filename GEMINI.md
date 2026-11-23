# Genius Squad - Workspace Rules & Guidelines

These rules apply across the entire Genius Squad repository (both `Client/` and `Server/`). All implementing agents, developers, and workflows must strictly adhere to these guidelines.

---

## 1. Production Security: No Unnecessary Console Logs

> [!CAUTION]
> **Strict Prohibition of Unnecessary Console Logs in Production**
> Never use or leave unnecessary `console.log`, `console.info`, `console.debug`, `console.dir`, or verbose `console.warn` statements in production code.

### Security Rationale & Risks
1. **Information Leakage & Sensitive Data Exposure:**
   - In browser environments, anything written to `console.log` remains visible to anyone opening the browser Developer Tools.
   - Logging user objects, authentication tokens (JWTs), request/response payloads, or demographic info exposes Personally Identifiable Information (PII) such as student/father names, phone numbers, email addresses, and transaction IDs.
   - In server environments, indiscriminate logging can write sensitive credentials, secrets, or internal stack traces into persistent log files or terminal stdout.
2. **Attack Surface Mapping:**
   - Detailed client-side logs reveal API endpoint structures, internal state management logic, and verification routines, allowing attackers to understand and exploit security checks (e.g., IDOR or parameter tampering).
3. **Performance & Memory Overhead:**
   - Console calls hold references to logged objects in memory, preventing proper garbage collection in JavaScript runtime engines (V8), degrading performance under heavy usage.

### Practical Enforcement
- **Strict Cleanup:** Remove all temporary debugging `console.log` statements before completing code changes.
- **Production Error Handling:** Only allow controlled, sanitized server-side error logging via `globalErrorHandler` (which strips sensitive tokens and credentials).
- **Client-Side Safe Catching:** Client API calls and state handlers must handle errors via UI feedback state (toasts, alerts, error messages) rather than dumping error objects to `console.log`.

---

## 2. Security Architecture & Implementation Cautions

1. **Zero-Trust Identity Extraction (IDOR Prevention):**
   - Backend routes must **NEVER** accept or trust a `userId` supplied in the request body, URL parameters, or query strings for profile updates or personal orders.
   - `userId` must **always** be extracted directly from the verified JWT payload (`req.user.id`).
2. **Server-Side Pricing Authority:**
   - The frontend must **never** send the payment `amount` to the database. The backend queries the official course fee from the database/catalog and assigns that amount.
3. **Role-Based Server Guards:**
   - Every admin route (`/api/v1/admin/*`) must be secured on the server with `authGuard('ADMIN')`.
4. **TrxID Deduplication:**
   - Strict `UNIQUE` constraint and validation regex on `transactionId` to prevent duplicate or fraudulent MFS submission.
5. **Password & Credential Security:**
   - Passwords must be hashed using `bcryptjs` (salt rounds $\ge 10$). Never log, return, or store plaintext passwords.

---

## 3. Architecture & Code Quality Standards

1. **Decoupled Architecture:**
   - `Client/`: Pure frontend built with **Next.js 15 (App Router)** and Tailwind CSS.
   - `Server/`: Dedicated Node.js + Express API server adhering strictly to the **Modular MVC pattern** (`Server/src/modules/` with controller, service, route, interface, model, validation).
2. **Controller vs. Service Layer Separation:**
   - Controllers only listen to HTTP route calls, forward operational tasks to the service layer, and send standardized responses via `sendResponse`.
   - All business logic, queries, and store operations belong exclusively in the service layer.
3. **DRY (Don't Repeat Yourself):**
   - Avoid duplicate logic across both frontend and backend.
   - Use reusable higher-order helpers (`catchAsync`), standardized envelopes (`sendResponse`), and Zod validation schemas.

---

## 4. Codebase Intelligence & Graph Navigation with Graphify

> [!IMPORTANT]
> **Mandatory Codebase Connection & Relationship Verification**
> Before implementing new features, modifying shared utilities, refactoring modules, or answering questions about codebase architecture and dependencies, agents MUST inspect the project's dependency graph via Graphify.

### Rules & Workflow
1. **Query Connections Before Modifying Code:**
   - Use the **`graphify` MCP tools** (`query_graph`, `get_node`, `shortest_path`, `get_neighbors`, `god_nodes`, `graph_stats`) with `project_path: "."` or the workspace path.
   - Alternatively, use the **Graphify CLI**:
     - `graphify query "<question>"` for structural questions.
     - `graphify path "<Source>" "<Target>" --undirected` to trace relationships between files, classes, or functions.
     - `graphify explain "<Symbol>"` to inspect incoming/outgoing edges and degree of connection.
     - `graphify god-nodes` to see critical architectural hubs (e.g. `AppError`, `useAuth`, `sendResponse`, `authGuard`).
2. **Reviewing High-Level Architecture:**
   - Refer to `graphify-out/GRAPH_REPORT.md` for community clustering, architectural hubs, and surprising cross-module connections.
3. **Synchronize Graph After Changes:**
   - After creating, updating, or deleting code files in `Client/` or `Server/`, run:
     ```bash
     graphify update .
     ```
     This executes fast, zero-token AST extraction to keep `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` accurate.
