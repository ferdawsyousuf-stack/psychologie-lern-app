# Sprechwerk Daily

Tägliches Training für flüssiges, klares und selbstbewusstes Sprechen. Gebaut mit React 18, Tailwind CSS 3,
Lucide React, Vite und TypeScript.

## Ablauf

1. **Fokus wählen**: Ruhe & Atem, Fokus statt Kopfkino, Tempo & Klarheit, Stimme & Melodie.
2. **Training (7–12 Min)**: Atem zum Ankommen, eine Übung je Bereich (wechselt von Mal zu Mal),
   am Ende die Mission des Tages für den Alltag. Pro Tag gibt es eine Mission: Wer mehrmals am Tag
   trainiert, sieht sie als Erinnerung und kann sie gegen eine andere derselben Stufe tauschen.
   Ab dem zweiten Tag beginnt das Training mit einem kurzen Rückblick auf die letzte Mission.
3. **Fortschritt**: Tage in Folge, Trainings, Missionen „besser als befürchtet“, echte Momente.
4. **Moment-Hilfe**: 25 Sekunden vor einem Gespräch.
5. **Stimm-Check**: 30 Sekunden frei sprechen, mit Aufnahme, wo der Browser es erlaubt.
6. **Bühne** (oben rechts auf dem Startbildschirm): 60 Sekunden Auftritt vor vier vorgestellten
   Zuhörern. Vorher schätzt du ein, wie schlimm es wird (0–10), nachher, wie schlimm es war.
   Die Seite zeigt Auftritte und den Durchschnitt „erwartet → erlebt“. Grundlage: Slater u. a. 1999,
   Craske u. a. 2014, Wolpe 1969. Lokal läuft das Video aus dem Design im Hintergrund, auf claude.ai
   gezeichnetes Bühnenlicht.

Jede Übung nennt ihre Grundlage. Alle Quellen stehen in `src/content.ts` und in der App unter
„Die Wissenschaft dahinter“.

## Abwechslung

Die Methoden bleiben gleich, die Beispiele wechseln, damit das Training auch mehrmals am Tag frisch
bleibt. In `src/examples.ts` stehen 277 Beispiele:

| Liste | Anzahl | Wo |
| --- | --- | --- |
| Übungstexte | 40 | Lesen in Sinneinheiten, Sprechen wie Sinatra |
| Fragen | 60 | Gedanken ordnen, Stimm-Check |
| Drei-Sätze-Aufgaben | 30 | Klar statt weich |
| Melodie-Sätze | 30 | Melodie-Leiter (Betonung markiert) |
| Ruhige Sätze | 25 | Ruhige Stimme |
| Bühnen-Themen | 62 | Bühne, in 8 Kategorien |
| Missionen | 30 | 5 Stufen mit je 6 Varianten |

Dazu wechseln der Laut beim langen Ausatmen („sss“, „fff“, „sch“), der Anker der Atem-Meditation
und der „Blick nach außen“ in der Moment-Hilfe.

Jede Übung läuft einmal durch ihre ganze Liste, bevor sich ein Beispiel wiederholt
(`src/lib/rotation.ts`). Mit „Anderer Text“, „Neue Frage“, „Anderer Satz“, „Andere Aufgabe“,
„Anderes Thema“ und „Andere Mission“ lässt sich jederzeit wechseln, ohne dass innerhalb einer
Runde etwas doppelt kommt.

## Automatische Aufnahme

Alle Sprech-Übungen, der Stimm-Check und die Bühne nehmen automatisch auf: Ein Tipp startet
Sprechzeit und Aufnahme zugleich, mit dem Ende der Zeit stoppt beides, danach kannst du reinhören
(„Hör zu wie eine fremde Person“). Auf der Bühne gibt es nach dem Einschätzen „Auftritt anhören“.
Aufnahmen bleiben nur im Speicher des Browsers und verschwinden beim Weitergehen.

Ob aufgenommen werden kann, prüft die App zur Laufzeit (`src/lib/device.ts`, `src/lib/recorder.ts`):

- **Innerhalb von claude.ai** gibt der Rahmen der App das Mikrofon nicht frei. Dort läuft die
  Sprechzeit ohne Aufnahme, mit dem Hinweis auf die Sprachmemo-App.
- **Als eigene Datei oder Webseite** fragt der Browser einmal nach dem Mikrofon. Die Datei-Version
  entsteht mit dem Build-Modus `standalone` als `Sprechwerk Daily.html`. Sie läuft am Computer in
  Chrome oder Edge direkt per Doppelklick; am Handy braucht sie eine https-Adresse (z. B. GitHub Pages).
  Der Fortschritt liegt dann im Browser dieses Geräts.

## Lokal starten

```bash
npm install
npm run dev
```

Lokal lädt die App die Schrift „Helvetica Now Var“ und das Hintergrundbild von den angegebenen URLs,
und das Mikrofon kann für den Stimm-Check genutzt werden.

## Veröffentlichte Version auf claude.ai

Dort sind externe Bilder, fremde Schriften und das Mikrofon gesperrt. Die App zeigt dann einen
passenden Verlauf als Hintergrund, nutzt die Ersatzschriften ('Helvetica Neue', Helvetica, Arial)
und läuft bei Sprechübungen mit einer Sprechzeit statt einer Aufnahme. Der Fortschritt wird dort im
privaten Bereich deines Kontos gespeichert, sonst im Browser.

## Struktur

- `src/content.ts`: Übungen, Abläufe, Quellen
- `src/examples.ts`: alle wechselnden Beispiele (Texte, Fragen, Sätze, Themen, Missionen)
- `src/session.ts`: stellt das Training aus dem gewählten Fokus zusammen
- `src/lib/`: Fortschritt, Speicherung, Abwechslung, Zeitgeber, Ton und Layout
- `src/components/`: Liquid-Glass-Bausteine, Schieberegler, Atem-, Timer-, Halte- und Sprech-Steuerung
- `src/screens/`: Fokus, Training, Übersicht, Moment-Hilfe, Stimm-Check, Quellen

Sprechwerk ersetzt keine Therapie. Wenn es sich trotz Training festfährt, können Logopädie oder
Verhaltenstherapie gezielt mit dir üben.
