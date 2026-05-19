# Global Superpowers Web Tool Routing Note

Use this note as candidate global guidance for Superpowers sessions.

## Routing

- If a task needs current external web data, documentation, or website content, use `firecrawl` first. Save crawled/search output under `.firecrawl/`, then summarize from the saved evidence.
- If a task needs local UI operation, login, click, modal, screenshot, or localhost verification, use `browser:browser`.
- Do not use Firecrawl for localhost verification. Use Browser for local app behavior.
- If Docker or another dev server is already running, avoid port conflicts by using a temporary port through config or command flags. Prefer soft runtime config over committed port changes.

## Evidence Rule

- For external web facts, cite the crawled source.
- For local app facts, cite repo files, tests, and browser verification.
- Do not guess configuration or workflow behavior when it can be verified from code, docs, or UI.
