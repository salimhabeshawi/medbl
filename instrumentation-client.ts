// Dev-only guard for a known Next.js 16 + Turbopack dev-overlay bug
// (vercel/next.js#86060): React's development performance instrumentation
// calls performance.measure() with a negative timestamp when a server
// component exits via redirect()/notFound() mid-render. Our auth gates and
// the /submit?type=own poet gate legitimately do exactly that.
//
// This swallows ONLY that specific spurious failure so it can't mask real
// navigation in dev. Production builds never load this file. Remove once
// the upstream fix ships in a stable Next.js release.
if (process.env.NODE_ENV === "development") {
  const original = performance.measure.bind(performance);
  performance.measure = ((...args: Parameters<typeof original>) => {
    try {
      return original(...args);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("negative time stamp")
      ) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw e;
    }
  }) as typeof performance.measure;
}

export {};