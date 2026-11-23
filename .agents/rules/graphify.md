---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions.
---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- For any codebase, feature dependency, or architecture questions, when `graphify-out/graph.json` exists, always consult Graphify first before searching files or answering:
  - **Via MCP**: Call `query_graph`, `get_node`, `shortest_path`, `god_nodes`, or `get_neighbors` with `project_path: "."` (or the workspace path).
  - **Via CLI**: Run `graphify query "<question>"`, `graphify path "<A>" "<B>" --undirected`, `graphify explain "<concept>"`, or `graphify god-nodes`.
- Use `shortest_path` or `graphify path` to understand cross-module relationships before modifying shared functions, models, or components.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- Read `graphify-out/GRAPH_REPORT.md` for architectural overviews, community clustering, and high-degree god nodes.
- After modifying or creating code files in this session, run `graphify update .` to keep `graphify-out/graph.json` and `GRAPH_REPORT.md` current (AST extraction is local and zero-cost).
