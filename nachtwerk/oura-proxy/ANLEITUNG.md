# Nachtwerk direkt mit Oura verbinden

Das ist freiwillig. Ohne diese Einrichtung bringst du deine Daten wie bisher per Code aus Claude in die App.
Mit ihr holt Nachtwerk deine Nächte selbst bei Oura ab. Die Einrichtung dauert einmal etwa 30 Minuten.
Danach erneuert sich die Anmeldung von selbst. Will Oura doch einmal eine neue Anmeldung, sagt Nachtwerk dir Bescheid.

Stand: Oktober 2026. Oura und Cloudflare ändern ihre Seiten ab und zu. Heißt ein Knopf etwas anders, nimm den, der am besten passt.
Die Knöpfe stehen hier mit ihren englischen Namen, so wie die Seiten sie zeigen. Stell die Seiten nicht auf Deutsch um.

## Was du brauchst

- Ein Oura-Konto und eine aktive Oura-Mitgliedschaft. Ohne Mitgliedschaft gibt Oura keine Daten heraus.
- Einen Laptop mit Chrome oder Firefox für Schritt 1 und 2.
- Dein Handy mit Nachtwerk für Schritt 3. iPhone: Nachtwerk ist schon auf dem Home-Bildschirm
  (in Safari „Teilen“ → „Zum Home-Bildschirm“).
- Deine E-Mails am Laptop und am Handy. Oura und Cloudflare schicken dir Codes und Links.

## Kurz erklärt

- **Zugang bei Oura** (Oura nennt ihn „Application“): ein Eintrag auf Ouras Entwickler-Seite. Er erlaubt Nachtwerk,
  deine Daten zu lesen, wenn du zustimmst. Das ist nicht die Oura-App auf deinem Handy.
- **Client ID**: der Name dieses Zugangs. Nicht geheim.
- **Client Secret**: das Passwort dieses Zugangs. Geheim. Es kommt nur an eine Stelle: in Schritt 2 zu Cloudflare.
- **Redirect URI**: die Adresse, zu der Oura nach dem Anmelden zurückspringt. Hier ist das die Adresse von Nachtwerk.
- **Scopes**: welche Daten Nachtwerk lesen darf. „daily“ heißt Schlaf, Erholung und Aktivität. „spo2“ heißt
  Sauerstoff im Blut während der Nacht.
- **Brücke** (Cloudflare nennt sie „Worker“): ein kleines Programm bei Cloudflare. Es verbindet Nachtwerk mit Oura und
  hält das Client Secret. Es speichert keine Daten.
- **Deploy**: das Cloudflare-Wort für „übernehmen und live schalten“.
- **Secret** (bei Cloudflare): ein Wert, den Cloudflare verschlüsselt speichert. Danach kann ihn niemand mehr lesen, auch du nicht.
- **Anmelde-Code** (nur iPhone): bringt deine Anmeldung von Safari in die App vom Home-Bildschirm. Er beginnt mit `NWT.`
  und ist ein Schlüssel zu deinen Schlafdaten.

Warum das Ganze? Oura lässt Web-Apps wie Nachtwerk nicht direkt an die Daten. Außerdem verlangt Oura bei der Anmeldung
das Client Secret, und das gehört nicht aufs Handy. Beides löst die Brücke.

## 1. Zugang bei Oura anlegen (am Laptop, etwa 10 Minuten)

1. Öffne <https://developer.ouraring.com/applications> und klick auf „Sign In“ (anmelden). Gib die E-Mail deines
   Oura-Kontos ein. Oura mailt dir einen 6-stelligen Code, den gibst du ein. Fragt Oura, wie du dich anmelden willst,
   nimm den Code per E-Mail. Die Seite ist auf Englisch.
2. Klick auf „Create New“ (neu anlegen) und füll das Formular aus:
   - „Display Name“: `Nachtwerk`. Diesen Namen zeigt Oura später, wenn du zustimmst.
   - „Description“: `Schlaf-App nur für mich`
   - „Contact Email“: deine E-Mail-Adresse
   - „Website“, „Privacy Policy“ und „Terms of Service“ (drei Felder): jeweils
     `https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/`
   - „Redirect URIs“ (Feld „URI“): genau `https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/`.
     Mit `https://` am Anfang und Schrägstrich am Ende. Kopieren, nicht abtippen. „+ Add URI“ brauchst du nicht.
   - „Scopes“: nur **daily** und **spo2** anhaken. Alle anderen bleiben leer. Beide sind nötig. Fehlt spo2,
     klappt die Verbindung nicht richtig.
   - „I agree to the Oura API Agreement“ anhaken. Damit stimmst du Ouras Regeln für den Zugang zu.
3. Prüf noch einmal die Häkchen bei daily und spo2. Klick dann auf „Create Application“ (anlegen).
4. Klick bei Nachtwerk auf „View Details“ (Details). Dort stehen „Client ID“ und „Client Secret“.
   Lass die Seite offen, du brauchst beides gleich. Stehen dort auch Redirect URI und Scopes, prüf sie.
   „Reset Secret“ und „Request more users“ brauchst du nicht. „Reset Secret“ macht dein Secret ungültig.

Lehnt das Formular die Adresse bei „Website“, „Privacy Policy“ oder „Terms of Service“ ab, nimm dort
`https://github.com/ferdawsyousuf-stack/psychologie-lern-app`. Bei „Redirect URIs“ bleibt es genau die Nachtwerk-Adresse.

Das Client Secret ist ein Passwort. Schick es nicht per Mail, nicht in einen Chat (auch nicht an Claude) und mach
keinen Screenshot davon. Schickst du für Hilfe ein Bild dieser Seite, deck das Secret vorher ab.

## 2. Brücke anlegen (am Laptop, etwa 15 Minuten)

1. Leg ein kostenloses Konto an: <https://dash.cloudflare.com/sign-up>. E-Mail und Passwort eingeben, dann
   „Create Account“. Klick danach auf den Link in der Bestätigungs-Mail (auch im Spam schauen). Ohne Bestätigung
   lässt Cloudflare keinen Worker zu. Fragt Cloudflare nach einer Domain: überspringen. Zahlungsdaten brauchst du nicht.
2. Öffne <https://dash.cloudflare.com/?to=/:account/workers-and-pages>.
   Steht bei „Your subdomain“ dein Name oder ein Teil deiner E-Mail, kannst du mit „Change“ (ändern) ein neutrales
   Wort wählen. Es wird Teil der Brücken-Adresse. Mach das jetzt oder gar nicht, denn später ändert es die Adresse.
   Nach einer Änderung kann es ein paar Minuten dauern, bis die neue Adresse geht.
3. Klick auf „Create application“ (manchmal nur „Create“). Wähl „Start with Hello World!“ und klick „Get started“.
   Ersetz den vorgeschlagenen Namen durch `nachtwerk-oura`. Den Beispiel-Code kannst du hier noch nicht ändern,
   das ist normal. Klick auf „Deploy“.
4. Öffne in einem neuen Tab den Code der Brücke:
   <https://raw.githubusercontent.com/ferdawsyousuf-stack/psychologie-lern-app/HEAD/nachtwerk/oura-proxy/worker.js>.
   Drück Strg+A (alles markieren), dann Strg+C (kopieren). Am Mac cmd statt Strg.
5. Zurück bei Cloudflare: Klick auf „Edit code“ (Code bearbeiten). Siehst du nur „Continue to project“, klick darauf
   und dann oben rechts auf „Edit code“ (mit dem Zeichen `</>`).
   Klick in den Code, drück Strg+A, dann Entf (am Mac die Rücktaste), dann Strg+V.
   Klick oben rechts auf den blauen Knopf „Deploy“. Nicht auf „Save“ im Pfeil-Menü daneben: Das speichert nur
   und schaltet nichts frei.
   Rechts in der Vorschau kann jetzt „Client Secret: fehlt noch“ stehen. Das ist richtig, das Secret kommt im nächsten
   Punkt. Das Client Secret gehört nicht in den Code.
6. Secret eintragen:
   - Geh zur Seite des Workers: Öffne den Link aus Punkt 2 und klick auf `nachtwerk-oura`.
   - Klick oben auf den Reiter „Settings“ (Einstellungen). Dort gibt es den Abschnitt „Runtime variables and secrets“
     (rechts im Menü heißt er „Variables and secrets“).
   - Steht neben der Überschrift ein Schalter mit „Production“ und „Previews Base“: „Production“ wählen.
     Unter „Previews Base“ wirkt das Secret nicht.
   - Klick auf „+ Add variable“ (in manchen Ansichten nur „Add“).
   - „Type“ (Art): von „Text“ auf **„Secret“** umstellen. Bei „Text“ wäre das Secret offen lesbar.
   - „Name“ (manchmal „Variable name“): `OURA_CLIENT_SECRET`. Am besten von hier kopieren: Großbuchstaben,
     Unterstriche, kein Leerzeichen.
   - „Value“ (Wert): das Client Secret aus Schritt 1 einfügen.
   - Klick auf „Deploy“.

   Danach zeigt die Zeile „Secret“, `OURA_CLIENT_SECRET` und ein Schloss mit „Value encrypted“ (verschlüsselt).
   Cloudflare zeigt das Secret nie wieder an. Das ist richtig.
   Kopier danach irgendetwas anderes, zum Beispiel die Client ID. Dann liegt das Secret nicht mehr in der Zwischenablage.
7. Selbsttest: Klick oben rechts auf der Seite des Workers auf „Visit“ (Seite öffnen). Findest du den Knopf nicht:
   Reiter „Domains“, dort die Adresse mit `workers.dev` anklicken.
   Ein neuer Tab geht auf. Seine Adresse sieht so aus: `https://nachtwerk-oura.deinwort.workers.dev`. Dort muss stehen:

   ```
   Nachtwerk-Brücke läuft.
   Client Secret: eingetragen.
   ```

   - „Client Secret: fehlt noch“: Prüf Punkt 6 (Name genau so, „Production“ gewählt, „Deploy“ geklickt).
     Dann den Tab neu laden.
   - „forbidden“: Es läuft noch ein alter Code. Punkt 4 und 5 wiederholen.
   - Etwas anderes, zum Beispiel „Hello World!“: Der Code wurde nicht ersetzt oder nur mit „Save“ gespeichert.
     Punkt 4 und 5 wiederholen.
   - Die Seite lädt nicht: ein paar Minuten warten und neu laden.

   Der Test zeigt nur, dass ein Secret da ist. Ob es stimmt, merkst du erst beim Anmelden in Schritt 3.
8. Schick dir eine Mail aufs Handy mit genau zwei Dingen: der Client ID aus Schritt 1 und der Adresse aus diesem Tab
   (endet auf `workers.dev`). Beides ist nicht geheim. Das Client Secret kommt nicht in die Mail.
   Heb die Mail auf. Du brauchst sie wieder, wenn du dich später neu anmeldest.

Der kostenlose Tarif erlaubt 100.000 Anfragen pro Tag. Nachtwerk braucht pro Aktualisierung etwa 10 bis 15.

## 3. In Nachtwerk anmelden (am Handy, etwa 5 Minuten)

**Vorher:** Öffne Nachtwerk, warte kurz, schließ es ganz (in der App-Übersicht wegwischen) und öffne es wieder.
Erst dann hast du die neue Version. Du erkennst sie so: Menü → „Direkt mit Oura“, dort steht bei Punkt 2
`OURA_CLIENT_SECRET`. Auf dem iPhone machst du das in der App vom Home-Bildschirm und in Safari
(dort die Seite zweimal neu laden).

Mach die Anmeldung am Stück. Nach 30 Minuten verfällt sie, dann fängst du neu an.

### Android

1. Öffne die Nachtwerk-App. Tippe oben rechts auf das Menü, dann auf „Direkt mit Oura“.
2. Füg bei „Client ID“ und „Brücken-Adresse“ die Werte aus deiner Mail ein (lang tippen, „Einfügen“). Nicht abtippen.
3. Tippe auf „Bei Oura anmelden“. Gib bei Oura deine E-Mail ein und dann den Code, den Oura dir mailt.
4. Jetzt kommt Ouras Seite zum Zustimmen. Dort muss „Nachtwerk“ stehen, sonst brich ab.
   Warte, bis die Seite fertig geladen ist. Die Häkchen bei daily und spo2 müssen beide gesetzt sein.
   Tippe dann auf „Allow“ (erlauben; der Knopf kann auch auf Deutsch beschriftet sein).
5. Du landest wieder in Nachtwerk. Dort steht „Anmeldung bei Oura …“ und dann „Oura: … Schlafphasen geladen“. Fertig.

Nutz Nachtwerk danach nur in der App, nicht zusätzlich in einem Chrome-Tab. Zwei offene Nachtwerk gleichzeitig
können dich abmelden.

### iPhone

Auf dem iPhone hat die App vom Home-Bildschirm einen eigenen Speicher. Darum meldest du dich in Safari an und bringst
die Anmeldung danach mit dem Anmelde-Code in die App.

1. Öffne in **Safari** (kein privates Fenster) `https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/`.
   Tipp: In der App vom Home-Bildschirm gibt es im Oura-Fenster den Knopf „Adresse für Safari kopieren“.
2. Tippe oben rechts auf das Menü, dann auf „Direkt mit Oura“.
3. Füg bei „Client ID“ und „Brücken-Adresse“ die Werte aus deiner Mail ein (lang tippen, „Einfügen“). Nicht abtippen.
4. Tippe auf „Bei Oura anmelden“. Gib bei Oura deine E-Mail ein und dann den Code, den Oura dir mailt.
5. Auf Ouras Seite zum Zustimmen muss „Nachtwerk“ stehen, sonst brich ab. Warte, bis die Seite fertig geladen ist.
   Beide Häkchen (daily und spo2) gesetzt lassen. Tippe auf „Allow“ (erlauben).
6. Du landest wieder in Nachtwerk in Safari. Die Daten laden und das Oura-Fenster geht von selbst auf.
   **Du bist noch nicht fertig.**
7. Tippe auf „Anmelde-Code kopieren“. Safari meldet sich dabei ab. Das ist richtig.
8. Öffne die App vom Home-Bildschirm. Menü → „Code einfügen“. Lang ins Feld tippen, „Einfügen“, dann „Übernehmen“.
9. Die App fragt „Diese Oura-Verbindung übernehmen?“ und zeigt Brücke und Client ID. Tippe nur auf OK, wenn die
   Brücke deine ist (`https://nachtwerk-oura.deinwort.workers.dev`).
10. Es steht „Oura-Anmeldung übernommen“ und dann „Oura: … Schlafphasen geladen“. Fertig.
11. Kopier danach irgendetwas anderes, damit der Anmelde-Code nicht in der Zwischenablage bleibt.

Klappt das Kopieren in Punkt 7 nicht, steht der Code markiert in einem Feld darunter. Lang tippen, „Kopieren“, dann
weiter mit Punkt 8. Safari ist auch dann schon abgemeldet. Tippe dort nicht auf „Trennen“: Das würde die Anmeldung
auch in der App beenden.

## Später

- Die Anmeldung erneuert sich von selbst. Du musst nichts tun.
- Öffne morgens zuerst die Oura-App auf dem Handy, damit die Nacht in Ouras Cloud ist. Nachtwerk lädt beim Öffnen
  selbst, wenn die Daten älter als 3 Stunden sind. Sonst tippst du oben auf „Aktualisieren“.
- Sagt Nachtwerk „Bitte neu anmelden“ oder „Oura-Anmeldung abgelaufen“: Mach Schritt 3 noch einmal. Client ID und
  Brücken-Adresse stehen in deiner Mail. Auf dem iPhone immer in Safari, nie mit „Neu anmelden“ in der App vom
  Home-Bildschirm.
- Musst du den Code der Brücke einmal ersetzen: Punkt 2.4 und 2.5. Das Secret bleibt dabei erhalten.

## Sicher bleiben

- Client ID und Brücken-Adresse sind nicht geheim. Du darfst sie dir per Mail schicken.
- Das Client Secret gibst du nur bei Cloudflare als „Secret“ ein. Nicht in Nachtwerk, nicht in eine Mail, nicht in
  einen Chat, nicht in den Code der Brücke.
- Ist das Client Secret doch irgendwo gelandet: Klick bei Oura unter „View Details“ auf „Reset Secret“. Trag das neue
  Secret bei Cloudflare ein (siehe „Secret ändern“ unten) und mach den Selbsttest (2.7).
- Der Anmelde-Code ist ein Schlüssel zu deinen Schlafdaten. Füg ihn nur in Nachtwerk ein. Schick ihn niemandem, auch
  nicht in einen Chat mit Claude.
- Öffne keine Nachtwerk-Links, die dir jemand anderes schickt. Bestätige nur deine eigene Brücken-Adresse.
- Stimm bei Oura nur zu, wenn auf der Seite „Nachtwerk“ steht.
- Ist ein Anmelde-Code in falsche Hände geraten: Tippe in Nachtwerk im Oura-Fenster auf „Trennen“. Nachtwerk meldet
  die Anmeldung dann auch bei Oura ab. Melde dich danach neu an (Schritt 3). Ganz sicher gehst du, wenn du zusätzlich
  bei <https://developer.ouraring.com/applications> den Zugang Nachtwerk löschst und neu anlegst (Schritt 1, dann
  neues Secret bei Cloudflare wie in 2.6 und 2.7).

## Wenn etwas nicht klappt

Meldungen unten im Bild verschwinden nach ein paar Sekunden. Die ganze Meldung siehst du meist im Oura-Fenster
(Menü → „Direkt mit Oura“ oder „Oura: aktualisieren“).
Brauchst du Hilfe, schick den Wortlaut der Meldung oder einen Screenshot von Nachtwerk. Nie das Client Secret und nie
den Anmelde-Code.

**Bei Cloudflare**

- „verify your email“ oder Fehler 10034: Profil-Symbol → „My Profile“ → „Email Address“ → „Send verification email“.
  Dann den Link in der Mail klicken.
- Secret ändern: Seite des Workers → „Settings“ → „Runtime variables and secrets“. Beim Eintrag `OURA_CLIENT_SECRET`
  auf den Papierkorb klicken. Dann neu mit „+ Add variable“ anlegen wie in 2.6 und „Deploy“. Danach Selbsttest (2.7).
- Der Selbsttest zeigt etwas anderes als „Client Secret: eingetragen.“: siehe Punkt 2.7.

**Bei Oura**

- Oura zeigt eine Fehlerseite statt der Anmeldung, zum Beispiel mit „client“ oder „redirect“ im Text: Die Client ID
  ist falsch eingefügt, oder die Redirect URI beim Zugang stimmt nicht genau. Prüf beides bei „View Details“ und füg
  die Client ID in Nachtwerk neu ein.
- Keine Mail mit Code: im Spam schauen. Nimm die E-Mail-Adresse, mit der du in der Oura-App angemeldet bist.

**Meldungen in Nachtwerk**

- „In der Brücke fehlt noch das Client Secret (Anleitung, Schritt 2).“: Punkt 2.6 und 2.7.
- „Oura kennt diese Client ID oder dieses Client Secret nicht. Prüf beides.“: Vergleich die Client ID in Nachtwerk mit
  „View Details“. Trag das Secret bei Cloudflare neu ein (Secret ändern). Dann neu anmelden.
- „Oura kennt diese Client ID nicht. …“: Client ID bei „View Details“ neu kopieren und in Nachtwerk einfügen.
- „Die Brücke ist veraltet. …“: Punkt 2.4 und 2.5 wiederholen.
- „Die Brücke zu Oura ist nicht erreichbar. Stimmt die Adresse?“: Füg die Brücken-Adresse aus deiner Mail neu ein.
  Sie endet auf `workers.dev`. Mach den Selbsttest (2.7). Klappt es im WLAN nicht, versuch es mit mobilen Daten.
- „Die Brücken-Adresse sieht so aus: …“: Die Adresse ist unvollständig. Neu aus der Mail einfügen.
- „Oura hat die Freigabe für Schlafdaten nicht erteilt …“ oder „Hake bei … „daily“ und „spo2“ an …“: Neu anmelden und
  bei Oura beide Häkchen gesetzt lassen. Prüf auch bei „View Details“, ob daily und spo2 angehakt sind.
- Schlaf ist da, aber keine Sauerstoff-Werte: Die Freigabe für spo2 fehlt. Prüf das Häkchen bei „View Details“ und melde
  dich neu an. Lässt es sich beim Zugang nicht mehr ändern: Zugang neu anlegen (Schritt 1), neues Secret (2.6 und 2.7),
  neu anmelden mit der neuen Client ID (Schritt 3).
- „Oura-Anmeldung abgebrochen.“: Du hast bei Oura abgebrochen. Einfach neu anmelden.
- „Anmeldung nicht bestätigt. Bitte noch mal anmelden.“: Die Anmeldung hat länger als 30 Minuten gedauert oder lief in
  einem anderen Fenster. In Nachtwerk noch einmal „Bei Oura anmelden“ tippen.
- „Auf dem iPhone: Bitte die Anmeldung hier in Safari noch einmal starten.“: Starte die Anmeldung in Safari, nicht in
  der App vom Home-Bildschirm.
- „Bitte neu anmelden. Nachtwerk nutzt jetzt Ouras neues Anmeldeverfahren.“: Lade die neue Version (siehe „Vorher“ in
  Schritt 3) und melde dich neu an.
- „Die Anmeldung bei Oura gilt nicht mehr.“ oder „… ist abgelaufen.“: Schritt 3 noch einmal.
- „Der Anmelde-Code ist unvollständig …“ oder „… abgelaufen.“: Safari ist nach dem Kopieren abgemeldet. Melde dich dort
  noch einmal an (iPhone, Punkt 2 bis 7) und kopier den neuen Code.
- „Brücken-Adresse nicht übernommen.“: Du hast „Abbrechen“ getippt. Code noch einmal einfügen und bei deiner Adresse
  OK tippen.
- „Dieser Anmelde-Code ist älter als deine jetzige Anmeldung.“: Du bist schon verbunden. Nichts zu tun.
- „Anmelde-Codes nur über „Code einfügen“ …“: Jemand hat dir einen Link mit Anmelde-Code geschickt. Nachtwerk hat ihn
  nicht übernommen. Lösch den Link.
- „Die Verbindung brach bei der letzten Erneuerung ab.“: Schritt 3 noch einmal.
- „Oura verweigert „…“. …“: Ein Häkchen fehlt beim Zugang, oder deine Oura-Mitgliedschaft ist nicht aktiv.
- „Oura ist gerade nicht erreichbar.“, „Oura bremst gerade.“ oder „Oura hat keine lesbare Antwort geschickt.“: Später
  noch einmal versuchen.
- Die letzte Nacht fehlt: Öffne zuerst die Oura-App und warte, bis sie synchronisiert hat. Dann in Nachtwerk
  „Aktualisieren“.
