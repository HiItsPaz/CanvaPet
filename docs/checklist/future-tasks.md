# Integration Stub Future Tasks Checklist

This checklist tracks generic future cleanup tasks whenever environment variables, API keys, or config files are stubbed for development or testing purposes.

- [ ] Replace all dummy environment variables in `.env.local` with real values and secure them via secret management.
- [ ] Remove or refactor any fallback or stub logic in `src/**/*config.ts` or related configuration files.
- [ ] Restore strict validation behavior (throw errors) for missing required variables in config utilities.
- [ ] Add or update integration tests for API clients and services using real or sandbox credentials.
- [ ] Update project documentation and README with instructions for setting up and managing real credentials.
- [ ] Verify end-to-end flows against live or staging APIs to ensure correct behavior.
- [ ] Mark all tasks done and remove this checklist once cleanup is complete. 