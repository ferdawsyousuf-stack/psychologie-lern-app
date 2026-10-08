# Psychologie-Lern-App

Lern-Apps für den B.Sc. Psychologie an der FernUniversität in Hagen, gebaut als Artifacts auf claude.ai.
Dieses Repo ist das Backup mit Versionsgeschichte.

| Ordner | Artifact | Inhalt |
|---|---|---|
| `gehirnatlas/` | [Gehirnatlas](https://claude.ai/artifact/WQLJBEcPFpwG9hVRvv7UBh) | Hauptapp: Gehirn 2D/3D, Neuron, Synapse, Botenstoffe, Nervensystem, Sehen, Schlaf, Stress, Methoden, Fächer, Karteikarten (FSRS), Fälle, Quiz, Probeprüfung mit Themen-Tests und großer Probeklausur pro Modul, Lernwissenschaft |
| `studienplaner/` | [Modul 1 · Studienplaner WS 26/27](https://claude.ai/artifact/LxA83W7tpEgN47kd476Xqy) | Checkliste, Kurse, Wochenplan und Fristen für Modul 1 |
| `sprechwerk/` | [Sprechwerk Daily](https://claude.ai/artifact/PLTMW3jcPoWe6HKS7a9J6p), [als Handy-App](https://ferdawsyousuf-stack.github.io/psychologie-lern-app/sprechwerk/) | Tägliches Sprechtraining: Atem, Aufmerksamkeit, Tempo, Stimme, Mission des Tages, Bühne, automatische Aufnahme |

`gehirnatlas/index.html` ist der Seitenquelltext ohne den Dokumentrahmen, den claude.ai beim Veröffentlichen ergänzt.
`gehirnatlas/lib/` enthält pdf.js für den PDF-Import eigener Karteikarten.

Lokal ansehen: `python3 -m http.server` im jeweiligen Ordner, dann http://localhost:8000 öffnen.
Speicher-Funktionen (`window.claude.*`) gibt es nur im veröffentlichten Artifact; lokal fällt die App auf den Browser-Speicher zurück.

## Sprechwerk als Handy-App

`sprechwerk/` ist eine installierbare Web-App, die GitHub Pages ausliefert
(Einstellungen → Pages → Branch dieses Repos, Ordner `/ (root)`). Einmal im Browser öffnen, dann:

- **iPhone:** in Safari auf Teilen tippen, dann „Zum Home-Bildschirm“.
- **Android:** in Chrome auf „Installieren“ tippen (oder Menü ⋮ → „App installieren“).

Danach startet sie vom Startbildschirm ohne Browserleiste, auch ohne Internet (`sw.js`), und nimmt
beim Sprechen automatisch auf. Der Fortschritt bleibt auf dem Handy.

`sprechwerk/index.html` ist gebaut (React eingebettet). Der Quellcode liegt in `sprechwerk/quellcode/`
(React 18, Tailwind, Vite, TypeScript); `npm install && npm run build` dort erzeugt die Web-App in `dist/`.
`.nojekyll` sorgt dafür, dass GitHub Pages alle Dateien unverändert ausliefert.

## Lerninhalte

Alle 13 Module haben eigene Karteikarten und Multiple-Choice-Fragen zu jedem Thema (701 Karten, 776 Fragen, mindestens 6 Fragen pro Thema). Die Inhalte stehen als `var BANK=` in `gehirnatlas/index.html`, je Modul mit `cards` (`t` = Thema), `questions` (`o` = vier Optionen, `a` = richtige Option, `e` = Erklärung, `d` = Schwierigkeit 1–3) und `cases`.
