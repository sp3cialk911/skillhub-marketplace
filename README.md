# skillhub-marketplace
A unified marketplace for digital products, online courses, and local skill exchange with payments, certificates, and community features

## CI/CD and deployment

GitHub Actions runs lint, tests, builds, an API health check, and Docker Compose/image validation on pull requests and pushes to `develop` and `main`. Successful pushes publish commit-tagged API and frontend images to GHCR. Hosting-provider deployment is intentionally not configured.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for local validation commands, GitHub Environment setup, required variables, provider setup, migrations, rollback, and post-deployment checks.
