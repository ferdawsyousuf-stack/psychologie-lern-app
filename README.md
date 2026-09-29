# Psychologie-Lern-App

Lern-Apps für den B.Sc. Psychologie an der FernUniversität in Hagen, gebaut als Artifacts auf claude.ai.
Dieses Repo ist das Backup mit Versionsgeschichte.

| Ordner | Artifact | Inhalt |
|---|---|---|
| `gehirnatlas/` | [Gehirnatlas](https://claude.ai/artifact/WQLJBEcPFpwG9hVRvv7UBh) | Hauptapp: Gehirn 2D/3D, Neuron, Synapse, Botenstoffe, Nervensystem, Sehen, Schlaf, Stress, Methoden, Fächer, Karteikarten (FSRS), Fälle, Quiz, Probeprüfung mit Themen-Tests und großer Probeklausur pro Modul, Lernwissenschaft |
| `studienplaner/` | [Modul 1 · Studienplaner WS 26/27](https://claude.ai/artifact/LxA83W7tpEgN47kd476Xqy) | Checkliste, Kurse, Wochenplan und Fristen für Modul 1 |

`gehirnatlas/index.html` ist der Seitenquelltext ohne den Dokumentrahmen, den claude.ai beim Veröffentlichen ergänzt.
`gehirnatlas/lib/` enthält pdf.js für den PDF-Import eigener Karteikarten.

Lokal ansehen: `python3 -m http.server` im jeweiligen Ordner, dann http://localhost:8000 öffnen.
Speicher-Funktionen (`window.claude.*`) gibt es nur im veröffentlichten Artifact; lokal fällt die App auf den Browser-Speicher zurück.

## Lerninhalte

Alle 13 Module haben eigene Karteikarten und Multiple-Choice-Fragen zu jedem Thema (701 Karten, 776 Fragen, mindestens 6 Fragen pro Thema). Die Inhalte stehen als `var BANK=` in `gehirnatlas/index.html`, je Modul mit `cards` (`t` = Thema), `questions` (`o` = vier Optionen, `a` = richtige Option, `e` = Erklärung, `d` = Schwierigkeit 1–3) und `cases`.
