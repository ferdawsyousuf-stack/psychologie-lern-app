import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Lokale Version: lädt Schrift und Hintergrundbild direkt von den angegebenen URLs.
// `vite build` erzeugt die Web-App fürs Handy (mit Service Worker aus public/).
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react()],
  define: { __ARTIFACT__: 'false', __PWA__: JSON.stringify(command === 'build') },
}));
