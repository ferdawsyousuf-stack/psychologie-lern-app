/// <reference types="vite/client" />

/** true im Build für claude.ai: dort sind externe Bilder, Schriften und das Mikrofon gesperrt. */
declare const __ARTIFACT__: boolean;

/** true in der Web-App fürs Handy (GitHub Pages): Service Worker, Installieren-Hinweis. */
declare const __PWA__: boolean;

/** Laufzeit von claude.ai-Artifacts. Fehlt außerhalb von claude.ai. */
interface ClaudeRuntime {
  use(name: string): Promise<unknown>;
}

interface Window {
  claude?: ClaudeRuntime;
}
