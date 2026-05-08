import { join } from "node:path";

/** Monorepo root (`jet-meal/`), parent of `frontend/`. Same depth from `src/` and bundled `dist/main.js`. */
export const repoRoot = join(__dirname, "../../../../");
