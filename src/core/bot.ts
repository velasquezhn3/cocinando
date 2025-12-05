// Minimal Bot stub kept for compatibility with older modules.
// The new DI-based entrypoint uses `src/index.ts`. This stub avoids
// build errors for leftover imports and should be removed when the
// legacy code is fully cleaned.

export class Bot {
  public async start() {
    // no-op minimal startup for legacy compatibility
    // Use the DI container and WhatsAppBot in the new bootstrap instead.
    return Promise.resolve();
  }
}
