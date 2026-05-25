# StoryLite E2E

Playwright end-to-end tests for the `@storylite/web` StoryLite demo app.

## Layout

- `tests/apps/web/**`: `apps/web` browser coverage.
- `tests/shared/**`: helpers reusable across future app-specific suites.

Keep route lists, fixtures, and app-specific assertions inside `tests/apps/<app-name>/`.

## Commands

Run from the monorepo root:

| Task                | Command                                  |
| ------------------- | ---------------------------------------- |
| Install Chromium    | `pnpm -F @storylite/e2e run e2e:install` |
| Typecheck E2E tests | `pnpm -F @storylite/e2e run typecheck`   |
| Run E2E tests       | `pnpm -F @storylite/e2e run e2e`         |
| Run headed (slow)   | `pnpm -F @storylite/e2e run e2e:show`    |

If `STORYLITE_E2E_WEB_BASE_URL` is not set, Playwright builds `@storylite/web` and serves the static
bundle with `vite preview` on `http://127.0.0.1:6340`. Set `STORYLITE_E2E_WEB_PORT` when that port
is busy. Set `STORYLITE_E2E_WEB_BASE_URL` only when intentionally testing an already-running target.

Optional env files loaded by `playwright.config.ts`: repo `.env`, `apps/web/.env`, `apps/e2e/.env`,
and `STORYLITE_E2E_ENV_FILE` when you need a shared stack env file.

Do not commit `test-results/`, `playwright-report/`, traces, screenshots, or videos.
