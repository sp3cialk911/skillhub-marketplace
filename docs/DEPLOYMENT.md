# Deployment

This repository provides application CI and GHCR image publishing. No hosting provider has been selected or connected; successful image publication is **not** a deployment.

## Local validation

Requirements: Node.js 20+, npm, Docker, and the Docker Compose plugin.

From the repository root:

```sh
npm ci
npm run lint --workspace=client
npm run lint --workspace=server
npm test --workspace=client -- --passWithNoTests
npm test --workspace=server -- --passWithNoTests
npm run build --workspace=client
test -s client/dist/index.html
npm run build --workspace=server
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml build
```

The frontend and backend currently have no test files; `--passWithNoTests` keeps those checks explicit while allowing the existing test runners to be used when suites are added. The API has a smoke check in CI. To run the local stack and check its health:

```sh
docker compose -f compose.yaml up --build -d
curl --fail http://localhost:5000/health
curl --fail http://localhost:8080/
docker compose -f compose.yaml down
```

The Compose file uses the literal `local-development-only` database password and is for local development/validation only. Do not use it as a production configuration.

## GitHub Actions and GHCR

`.github/workflows/ci.yml` runs for pull requests and pushes to `develop` and `main`. It installs the npm workspaces from the root lockfile, runs frontend/backend lint and test commands, builds both workspaces, checks the frontend artifact, smoke-tests `/health`, and validates/builds the Compose services.

The staging and production workflows run only after a successful **push** run of `Quality checks` on `develop` or `main`, respectively. They publish these images to the repository's GHCR namespace:

- `ghcr.io/<owner>/<repository>/api:<commit-sha>` and `:staging` or `:production`
- `ghcr.io/<owner>/<repository>/frontend:<commit-sha>` and `:staging` or `:production`

The workflows use the scoped `GITHUB_TOKEN` with `packages: write`; no registry password is required. Each workflow then emits a notice at an explicitly marked hosting-provider placeholder. Replace that step only after the provider and its deployment mechanism have been selected and configured.

## GitHub Environments

Create GitHub Environments named `staging` and `production` under **Settings → Environments**. Recommended protection:

- Restrict allowed deployment branches to `develop` for staging and `main` for production.
- Require one or more reviewers for production; consider a wait timer and reviewers for staging.
- Keep environment secrets separate and grant them only to the relevant deployment.

The workflow currently needs no provider credential to publish GHCR images. Set this environment variable before image publication:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Public API base URL compiled into the frontend image, including `/api` (for example, `https://api.example.invalid/api`). Use a real URL for the chosen deployment. If unset, the workflow uses `/api`, which requires the hosting platform to route that path to the API. |

No provider-specific deployment secrets are currently consumed. After choosing a host, add only the provider-issued deployment credential(s) that its documented action/CLI requires as environment secrets. Runtime application configuration (for example, database connection details, JWT signing key, and any payment/storage/email credentials) belongs in the hosting provider's secret manager, not in this repository or build workflow. Configure staging and production independently.

## Select and configure a hosting provider

Choose where the frontend and API containers will run, how the frontend will reach the API, and which managed PostgreSQL and Redis services they will use. Confirm the provider supports pulling private GHCR images (or make the images public intentionally), health checks, environment-specific configuration, and immutable image references. Then replace the respective placeholder with a provider-specific deployment step that pulls the exact commit SHA tag. No Vercel, Render, Railway, or other host is assumed to be configured.

The frontend is a static Nginx image. Set `VITE_API_URL` to the API's externally reachable base URL; it is embedded at build time, so changing the environment variable requires rebuilding the frontend image.

## Database migrations

Before enabling a real deployment, implement and review the database migration process. The repository currently has no migration implementation (`db:migrate` is only a declared script target); do not assume schema changes will be applied automatically. Run reviewed, backward-compatible migrations as a separate controlled release step, back up production data first, and ensure application versions can safely coexist during rollout. Never run destructive schema changes as an unreviewed startup side effect.

## Rollback

Deploy images by immutable commit SHA, not by the mutable environment tag. To roll back, redeploy the previously known-good API and frontend SHA tags, verify health and user-facing behavior, and investigate the failed release. Roll back or forward database changes only with a reviewed recovery plan and a verified backup; an application image rollback cannot undo an incompatible migration.

## Post-deployment checks

After a provider deployment is configured, verify:

1. The API's public `/health` endpoint returns HTTP 200 and `{"status":"ok",...}`.
2. The frontend responds successfully and loads its assets.
3. Frontend API requests target the intended API base URL and are allowed by API CORS configuration.
4. Provider container health, application logs, database/Redis connectivity, and any required migrations are healthy.
5. A representative read-only application flow succeeds in staging before promoting the same commit to production.

The current health endpoint reports process availability; it does not assert database readiness. Treat provider-level dependency checks and application-level smoke tests as additional release gates.
