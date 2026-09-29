# Designsystem Gehirnatlas

Ruhig, flach, eine Akzentfarbe. Die Farbe gehört den Inhalten: Hirnregionen, Module und Botenstoffe haben eigene Farben, die Oberfläche bleibt neutral.

## Farben (CSS-Variablen in `:root`)

| Rolle | Variable | Wert |
|---|---|---|
| Hintergrund | `--bg` | `#0B0E14` |
| Vertiefte Fläche (Eingaben, innere Boxen) | `--bg2` | `#0F131A` |
| Karte | `--panel` | `#12161E` |
| Hover, Auswahl | `--raise` | `#1A1F29` |
| Linie / starke Linie | `--line` / `--line2` | `#222834` / `#2F3643` |
| Text / gedämpft / leise | `--txt` / `--mut` / `--dim` | `#E9ECF2` / `#9BA3B2` / `#697181` |
| Marke Gold (Hauptaktion, Fortschritt, aktiver Reiter) | `--acc` | `#F2B84B` |
| Gold hell (Text auf Dunkel) | `--acc2` | `#F6CF85` |
| Richtig / Falsch | `--ok` / `--bad` | `#4CC38A` / `#EF6461` |

Grafiken (Gehirn, Zelle, Synapse, Sehbahn) liegen in dunklen Leuchtkästen mit `--viewer`.

## Schrift

- **Geist** für alles, Überschriften mit Stärke 600 und enger Laufweite (`-0.02em` bis `-0.04em`).
- **Geist Mono** nur für kleine Labels in Großbuchstaben (`.lbl`, `.eyebrow`, 11,5–12 px, `letter-spacing: .06em`) und Zahlen.

## Bausteine

- Karten: `--panel`, 1 px `--line`, Radius `--r` (14 px), kein Schatten.
- Innere Boxen: `--bg2`, Radius `--r-s` (10 px).
- Knöpfe: `.btn` = Gold (eine Hauptaktion pro Bereich), `.btn.ghost` = Rahmen.
- Filter-Chips: Pillenform, ausgewählt = invertiert (heller Grund, dunkle Schrift).
- Unternavigation: Reiter mit goldenem Unterstrich.
- KI-Funktionen (Claude) tragen das Zeichen ✦.

## Nicht verwenden

Farbverläufe auf Flächen, Leuchteffekte (`box-shadow` mit Farbe), Glas-Unschärfe auf Karten, Konfetti, Hüpf-Effekte beim Überfahren, Emojis in der Oberfläche.
