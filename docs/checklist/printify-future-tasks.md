# Printify Integration Future Tasks Checklist

This checklist tracks tasks to complete once real Printify credentials and production settings are available.

- [ ] Replace dummy `PRINTIFY_API_KEY` in `.env.local` with the real API key and secure it via secret management.
- [ ] Replace dummy `PRINTIFY_SHOP_ID` in `.env.local` with the real shop ID and secure it via secret management.
- [ ] Restore original `getRequiredEnvVar()` behavior in `src/lib/printify/config.ts` to throw on missing vars.
- [ ] Remove or refactor any fallback logic added for missing Printify environment variables.
- [ ] Add integration tests for Printify client functions (`getPrintifyShippingRates`, `createPrintifyOrder`, etc.) using real or sandbox credentials.
- [ ] Update project documentation and README with instructions for setting up Printify keys.
- [ ] Verify end-to-end order flow with the live Printify API in a staging environment.
- [ ] Remove this checklist or mark all items done once the integration is fully verified. 