# Nachtwerk direkt mit Oura verbinden

Das ist freiwillig. Ohne diese Einrichtung kommen die Daten per Code aus Nachtwerk in Claude aufs Handy.
Mit ihr holt die App deine Nächte selbst. Einmal etwa 15 Minuten, danach alle 30 Tage einmal neu anmelden.

Warum zwei Schritte? Oura lässt Browser-Apps nicht direkt an die Daten (die API sendet keine CORS-Freigabe).
Darum braucht es eine kleine Brücke, die Anfragen weiterreicht. Sie speichert nichts.

## 1. Oura-App anlegen (Client ID)

1. Öffne <https://developer.ouraring.com> und melde dich mit deinem Oura-Konto an.
2. Lege eine neue Anwendung an:
   - Name: `Nachtwerk`
   - Website, Datenschutz-Link und Nutzungsbedingungen: `https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/`
   - Redirect-URI, genau so, mit Schrägstrich am Ende: `https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/`
   - Bereiche (Scopes): alle Häkchen entfernen außer **Daily** und **SpO2**
3. Speichern und die **Client ID** kopieren. Das Client Secret brauchst du nicht; gib es nirgends ein.

Für eine einzelne Person braucht die App keine Prüfung durch Oura. Für den Datenzugriff muss die Oura-Mitgliedschaft aktiv sein.

## 2. Brücke anlegen (Cloudflare Worker)

1. Erstelle ein kostenloses Konto auf <https://dash.cloudflare.com/sign-up>.
2. Links „Workers & Pages“ öffnen, dann „Erstellen“ → „Worker erstellen“. Name zum Beispiel `nachtwerk-oura`, dann „Bereitstellen“.
3. „Code bearbeiten“ öffnen, alles löschen und den Inhalt von [`worker.js`](worker.js) einfügen. „Bereitstellen“ tippen.
4. Die Adresse des Workers kopieren. Sie sieht so aus: `https://nachtwerk-oura.DEINNAME.workers.dev`

Der kostenlose Tarif erlaubt 100.000 Anfragen pro Tag; Nachtwerk braucht pro Aktualisierung etwa fünf.

## 3. In Nachtwerk eintragen

1. Nachtwerk auf dem Handy öffnen → Menü → „Direkt mit Oura“.
2. Client ID und Brücken-Adresse eintragen, „Bei Oura anmelden“ tippen, bei Oura bestätigen.
3. Du landest wieder in der App, die Nächte werden geladen.

Tipps:

- Öffne morgens zuerst die Oura-App, damit die Nacht in der Cloud ist.
- iPhone: Landet die Anmeldung in Safari statt in der App, dort im Oura-Fenster „Anmelde-Code kopieren“ tippen
  und den Code in der App unter „Code einfügen“ einsetzen.
- Nach etwa 30 Tagen läuft die Anmeldung ab. Nachtwerk sagt dir drei Tage vorher Bescheid.
