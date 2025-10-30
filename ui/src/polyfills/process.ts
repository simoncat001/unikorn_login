// Polyfill a minimal global `process` object for browser environments where it is absent.
// Some bundled modules expect `process.env` to exist (as provided by webpack/CRA),
// but when the app is served by a bare httpd the global may be missing. This shim
// prevents `ReferenceError: process is not defined` while keeping the object minimal.

declare global {
  interface Window {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }
}

if (typeof window !== "undefined") {
  const w = window as Window;
  if (!w.process) {
    w.process = { env: {} };
  } else if (!w.process.env) {
    w.process.env = {};
  }
}

export {};
