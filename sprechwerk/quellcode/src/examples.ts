// Beispiel-Bibliothek: die Methoden bleiben gleich, die Beispiele wechseln.
// So bleibt das Training frisch, auch wenn du es mehrmals am Tag machst.

// ---------------------------------------------------------------------------
// Übungstexte für „Lesen in Sinneinheiten“ und „Sprechen wie Sinatra“.
// „/“ trennt Sinneinheiten, *Wort* markiert das Schlüsselwort.
// ---------------------------------------------------------------------------
export const TEXTS: string[] = [
  'Am *Morgen* riecht die Straße / nach frischem *Brot*. / Ich bleibe kurz *stehen*, / atme einmal *aus* / und gehe dann *weiter*. / Niemand hat es *eilig*. / Also werde ich *langsamer*.',
  'Ein guter *Satz* / braucht keine *Eile*. / Er beginnt *ruhig*, / trägt eine *Idee* / und endet mit einem *Punkt*. / Wer *Pausen* macht, / klingt *klar* / und *sicher*.',
  'Am Abend wird die Stadt *leiser*. / Die *Lichter* gehen an, / eins nach dem *anderen*. / Ich erzähle dir von *heute*: / von einem *Lachen*, / einem guten *Gespräch* / und einem *Moment*, / in dem alles *leicht* war.',
  'Mein *Großvater* sagte immer: / Wer gut *zuhört*, / hat schon die Hälfte *gesagt*. / Er sprach *langsam*, / machte *Pausen*, / und der ganze *Tisch* / wurde *still*, / wenn er *anfing*.',
  'Der *Regen* klopft ans Fenster, / ganz *gleichmäßig*. / Ich koche mir einen *Tee* / und setze mich ans *Licht*. / Heute muss nichts *perfekt* sein. / Es *reicht*, / wenn es *gut* ist.',
  'Am *Meer* gibt es keinen Druck. / Die Wellen *kommen*, / die Wellen *gehen*. / Keine ist wie die *andere*, / und keine *entschuldigt* sich dafür. / Ich nehme mir ein *Beispiel*.',
  'Sinatra *beobachtete* Tommy Dorsey, / den *Posaunisten*, / Abend für *Abend*. / Er wollte *wissen*, / wo er *atmet*. / Dann *übte* er, / bis seine Sätze / wie von *selbst* flossen.',
  'Im *Zug* sitzt eine alte Dame. / Sie erzählt mir von *Paris*, / von einem kleinen *Café* / und einem *Lied*, / das sie nie *vergessen* hat. / Ich höre *zu* / und merke: / Gute Geschichten sind *einfach*.',
  'Ein *Fehler* ist kein Urteil. / Er ist nur ein *Hinweis*, / wo ich *genauer* hinschauen kann. / Ich atme *aus*, / sage den Satz *nochmal* / und gehe *weiter*.',
  'Im *Park* spielt ein Kind mit einem Ball. / Es denkt nicht *nach*, / ob es *gut* aussieht. / Es *lacht*, / es *rennt*, / es fällt *hin* / und steht wieder *auf*.',
  'Die *Küche* ist warm, / das *Radio* läuft leise. / Meine Mutter schneidet *Zwiebeln* / und summt eine *Melodie*. / Sie singt nicht *perfekt*, / aber sie singt *gern*. / Und genau das *hört* man.',
  'Wenn ich *spreche*, / spreche ich zu *einem* Menschen. / Nicht zu einer *Menge*, / nicht zu einem *Urteil*, / sondern zu einem *Gesicht*, / das mir *zuhört*.',
  'Der erste *Kaffee* am Morgen / ist ein kleines *Ritual*. / Die Tasse ist *warm*, / der Tag noch *leer*. / Ich *entscheide*, / wie er klingen soll: / *ruhig*, / *klar* / und *freundlich*.',
  'In den *Bergen* ist die Luft dünn. / Wer zu *schnell* geht, / kommt außer *Atem*. / Wer *gleichmäßig* geht, / kommt *weiter*. / Das gilt auch / für *Gespräche*.',
  'Eine gute *Geschichte* hat drei Teile: / einen *Anfang*, / der neugierig *macht*, / eine *Mitte*, / die *überrascht*, / und ein *Ende*, / das man *mitnimmt*.',
  'Auf dem *Markt* ruft ein Händler. / Seine Stimme ist *tief* / und völlig *entspannt*. / Er muss nicht *schreien*, / denn er *weiß*, / was er *verkauft*.',
  'Gestern habe ich *Mut* gebraucht. / Mein Herz hat *geklopft*, / meine Hände waren *kalt*. / Ich habe *trotzdem* gesprochen. / Und weißt du *was*? / Die Welt ist nicht *untergegangen*.',
  'Am *Bahnhof* warten viele Menschen. / Jeder hat ein *Ziel*, / jeder eine *Geschichte*. / Ich stelle mir *vor*, / wohin sie *fahren* / und wer *wartet*, / wenn sie *ankommen*.',
  'Musik lebt von *Pausen*. / Ohne *Stille* / gäbe es keinen *Rhythmus*. / Beim *Sprechen* ist es genauso: / Die Pause *trägt*, / was danach *kommt*.',
  'Mein *Freund* erzählt Witze / immer viel zu *schnell*. / Er lacht schon *vorher*, / und keiner versteht die *Pointe*. / Heute hat er es *langsam* versucht. / Zum ersten *Mal* / haben *alle* gelacht.',
  'Im *Winter* wird es früh dunkel. / Wir zünden *Kerzen* an / und erzählen uns *Geschichten*. / Niemand schaut auf die *Uhr*. / Die *Zeit* gehört / heute *uns*.',
  'Ein *Fremder* hat mich heute angelächelt, / einfach *so*. / Ich habe *zurückgelächelt*. / Für einen *Moment* / war der ganze *Stress* / ganz *klein*.',
  'Das *Meer* von oben: / ein blaues *Tuch*, / auf dem kleine *Boote* liegen. / Von hier *oben* / wirken alle *Sorgen* / wie diese Boote: / *klein* / und weit *weg*.',
  'Ein *Baum* wächst nicht in einer Nacht. / Jeder *Ring* im Holz / ist ein ganzes *Jahr*. / Auch meine *Stimme* wächst, / Ring für *Ring*, / Tag für *Tag*.',
  'Sinatra sagte *sinngemäß*: / Der *Text* kommt zuerst. / Erst wenn man ihn *versteht*, / weiß man, / wo man *betont* / und wo man *leise* wird.',
  'Heute koche ich für *Freunde*. / Es gibt *Pasta* / mit Tomaten und *Basilikum*. / Nichts *Kompliziertes*, / aber mit *Liebe* gemacht. / Am Ende zählt nicht das *Rezept*, / sondern der *Abend*.',
  'Wer *zuhört*, / lernt mehr als *gedacht*. / Man hört *Worte*, / aber auch *Pausen*, / *Zögern* / und *Freude*. / Gutes Zuhören ist / die *leiseste* Form / von *Respekt*.',
  'Im *Kino* wird es dunkel. / Das *Rascheln* hört auf. / Für zwei *Stunden* / bin ich in einer anderen *Welt*. / Danach gehe ich *langsam* nach Hause / und denke *nach*.',
  'Auf dem *Balkon* wachsen Tomaten, / jeden Tag ein bisschen *mehr*. / Ich *gieße* sie, / ich *warte*, / und irgendwann / sind sie *rot*. / Geduld *schmeckt* / am Ende *süß*.',
  'Ein *Gespräch* ist wie ein Tanz. / Einer *führt*, / der andere *folgt*, / dann *wechselt* es. / Niemand muss *perfekt* tanzen. / Es reicht, / im *Takt* zu bleiben.',
  'Die *Sonne* geht unter / hinter den *Dächern*. / Der Himmel wird *orange*, / dann *rosa*, / dann *blau*. / Ich bleibe *stehen* / und *schaue*, / bis es *dunkel* ist.',
  'Neue *Wege* machen nervös. / Das ist *normal*. / Der Körper sagt: / *Achtung*, / hier ist etwas *wichtig*. / Ich sage *danke* / und gehe den Weg *trotzdem*.',
  'Am *Wochenende* fahre ich ans Wasser. / Ich nehme ein *Buch* mit, / eine *Decke* / und gar keinen *Plan*. / Manchmal / ist *nichts* zu tun / das *Beste*.',
  'Ein guter *Witz* braucht Timing. / Zu *früh*, / und er verpufft. / Zu *spät*, / und er ist vorbei. / Genau im richtigen *Moment* / trifft er *mitten* ins Herz.',
  'In der *Bibliothek* ist es still. / Man hört nur *Seiten*, / die *umgeblättert* werden. / Hier spricht *niemand* laut, / und trotzdem / erzählen tausend *Bücher* / gleichzeitig ihre *Geschichten*.',
  'Ich stelle mir *vor*, / ich stehe auf einer *Bühne*. / Das Licht ist *warm*, / die Menschen *freundlich*. / Ich atme *aus* / und beginne / mit einem *Lächeln*.',
  'Fahrradfahren hat mir mein *Vater* beigebracht. / Er ist *nebenher* gelaufen, / hat *festgehalten* / und irgendwann *losgelassen*. / Ich habe es erst *gemerkt*, / als ich schon *fuhr*.',
  'Gute *Stimmen* sind nicht laut. / Sie sind *klar*. / Sie *wissen*, / was sie sagen wollen, / und lassen jedem *Wort* / seinen *Platz*.',
  'Der *Hafen* am Morgen: / *Möwen*, / *Salz* in der Luft / und Fischer, / die ihre *Netze* flicken. / Jeder hier hat seinen *Rhythmus*, / und keiner *hetzt*.',
  'Heute war ein *normaler* Tag. / Nichts *Besonderes*, / nichts *Schlimmes*. / Und *doch*: / ein gutes *Gespräch*, / ein warmes *Essen*, / ein *Lachen*. / Vielleicht sind normale Tage / die *besten*.',
];

// ---------------------------------------------------------------------------
// Fragen für spontanes Sprechen („Gedanken ordnen“ und Stimm-Check).
// ---------------------------------------------------------------------------
export const PROMPTS: string[] = [
  'Was hat dich heute überrascht?',
  'Welcher Ort in deiner Stadt wird unterschätzt?',
  'Was war das beste Essen, das du je hattest?',
  'Welche Fähigkeit hättest du gern sofort?',
  'Was macht einen guten Gastgeber aus?',
  'Wohin würdest du morgen reisen, wenn alles bezahlt wäre?',
  'Was hat dich diese Woche zum Lachen gebracht?',
  'Welcher Song läuft gerade in deinem Kopf und warum?',
  'Was würdest du einem Freund raten, der vor einem Gespräch nervös ist?',
  'Was war dein Lieblingsspiel als Kind?',
  'Welcher Film hat dich zuletzt berührt?',
  'Was machst du an einem perfekten Sonntag?',
  'Welche Jahreszeit magst du am liebsten und warum?',
  'Wer hat dir etwas Wichtiges beigebracht?',
  'Was würdest du mit einer freien Woche anfangen?',
  'Welches Essen kannst du richtig gut kochen?',
  'Was ist das Schönste an deinem Viertel?',
  'Welche Erfindung findest du genial?',
  'Was nervt dich im Alltag, und wie gehst du damit um?',
  'Welches Tier wärst du gern für einen Tag?',
  'Was war dein bester Urlaub?',
  'Was bedeutet Freundschaft für dich?',
  'Welche Gewohnheit tut dir richtig gut?',
  'Was würdest du deinem 15-jährigen Ich sagen?',
  'Welches Buch oder welche Serie empfiehlst du gerade?',
  'Was ist dein Lieblingsgeräusch?',
  'Wo fühlst du dich zu Hause?',
  'Was hast du zuletzt zum ersten Mal gemacht?',
  'Welcher Mensch inspiriert dich?',
  'Was ist für dich ein guter Feierabend?',
  'Welche Musik hörst du, wenn du gute Laune willst?',
  'Was hast du dieses Jahr gelernt?',
  'Wie sieht für dich ein perfektes Frühstück aus?',
  'Was würdest du erfinden, wenn du könntest?',
  'Was ist das Mutigste, das du je getan hast?',
  'Welche Stadt möchtest du unbedingt einmal sehen?',
  'Was macht einen guten Tag aus?',
  'Erzähl von einem Moment, in dem du stolz auf dich warst.',
  'Was magst du an deiner Arbeit?',
  'Welcher Duft erinnert dich an früher?',
  'Wie würdest du einem Touristen deine Stadt zeigen?',
  'Was ist dein liebstes Ritual am Morgen?',
  'Welche Sportart würdest du gern können?',
  'Was ist das beste Geschenk, das du je bekommen hast?',
  'Welcher Rat hat dir wirklich geholfen?',
  'Was würdest du tun, wenn du einen Tag unsichtbar wärst?',
  'Wofür bist du heute dankbar?',
  'Welche kleine Sache macht dich sofort glücklich?',
  'Was war dein peinlichster, aber lustigster Moment?',
  'Wie stellst du dir dein Leben in fünf Jahren vor?',
  'Welches Gericht aus einem anderen Land liebst du?',
  'Wo denkst du am besten nach?',
  'Welche Superkraft hättest du gern?',
  'Was hast du von deinen Eltern gelernt?',
  'Welches Wetter magst du am liebsten?',
  'Was würdest du gern besser können?',
  'Erzähl von einem Abend, den du nie vergisst.',
  'Was macht für dich gute Musik aus?',
  'Auf welche App könntest du sofort verzichten?',
  'Was würdest du kochen, wenn Sinatra zu Besuch käme?',
];

// ---------------------------------------------------------------------------
// Aufgaben für „Klar statt weich“: immer drei Sätze, klar und ohne Weichmacher.
// ---------------------------------------------------------------------------
export const CLEAR_TASKS: string[] = [
  'Erzähl in drei Sätzen, was heute passiert ist.',
  'Beschreib in drei Sätzen deinen Weg zur Arbeit.',
  'Sag in drei Sätzen, was du an deinem besten Freund magst.',
  'Erklär in drei Sätzen, wie man dein Lieblingsessen kocht.',
  'Beschreib in drei Sätzen dein Zimmer.',
  'Sag in drei Sätzen, was du am Wochenende vorhast.',
  'Empfiehl in drei Sätzen einen Film.',
  'Beschreib in drei Sätzen das Wetter von heute.',
  'Erzähl in drei Sätzen von deinem letzten Urlaub.',
  'Sag in drei Sätzen, warum du gern dort wohnst, wo du wohnst.',
  'Beschreib in drei Sätzen einen Menschen, den du magst.',
  'Erklär in drei Sätzen, wofür du dein Handy am meisten nutzt.',
  'Sag in drei Sätzen, was dich glücklich macht.',
  'Beschreib in drei Sätzen ein Foto, an das du dich gern erinnerst.',
  'Erzähl in drei Sätzen, was du gestern Abend gemacht hast.',
  'Sag in drei Sätzen, was du heute noch erledigen willst.',
  'Beschreib in drei Sätzen deinen Lieblingsort.',
  'Erklär in drei Sätzen eine Regel aus deinem Lieblingsspiel.',
  'Sag in drei Sätzen, welche Musik du magst und warum.',
  'Beschreib in drei Sätzen einen guten Morgen.',
  'Gib in drei Sätzen einen Tipp gegen Stress.',
  'Erzähl in drei Sätzen, was du zuletzt gelernt hast.',
  'Beschreib in drei Sätzen deine Stadt für jemanden, der nie dort war.',
  'Sag in drei Sätzen, was du bei der Arbeit gut kannst.',
  'Erklär in drei Sätzen, warum Pausen wichtig sind.',
  'Beschreib in drei Sätzen ein Geräusch, das du magst.',
  'Sag in drei Sätzen, worauf du dich diese Woche freust.',
  'Erzähl in drei Sätzen von einem Tier, das du kennst.',
  'Beschreib in drei Sätzen ein Essen, ohne seinen Namen zu sagen.',
  'Sag in drei Sätzen, was einen guten Freund ausmacht.',
];

// ---------------------------------------------------------------------------
// Sätze für die „Melodie-Leiter“: Die Stimme springt auf den markierten Wörtern.
// ---------------------------------------------------------------------------
export const MELODY_LINES: string[] = [
  'Das war *wirklich* ein richtig *guter* Tag.',
  'Ich habe *heute* etwas *Neues* gelernt.',
  'Das ist die *beste* Idee seit *Langem*.',
  'Hast du das *gesehen*? Das war *unglaublich*!',
  'Ich freue mich *riesig* auf das *Wochenende*.',
  'Dieser Kaffee ist *genau* richtig *heute*.',
  'Das hast du *wirklich* großartig *gemacht*.',
  'Ich war noch *nie* so *entspannt*.',
  'Weißt du, was das *Schönste* daran *war*?',
  'Das ist nicht *irgendein* Lied, das ist *Sinatra*.',
  'Morgen wird es *richtig* schön *sonnig*.',
  'Ich *kann* das, und ich *will* das.',
  'Stell dir *vor*, wir fahren ans *Meer*.',
  'Das Essen war *einfach* nur *fantastisch*.',
  'Endlich ist *Freitag*, endlich *Feierabend*!',
  'Ich habe *dich* so *lange* nicht gesehen.',
  'Das ist *genau* das, was ich *meine*.',
  'Was für ein *schöner* Abend *heute*.',
  'Du glaubst nicht, *wen* ich *getroffen* habe.',
  'Das Konzert war *laut*, aber *wunderbar*.',
  'Heute probiere ich etwas ganz *Neues*, *versprochen*.',
  'Ich *liebe* den Duft von frischem *Brot*.',
  'Das war *knapp*, aber wir haben es *geschafft*.',
  '*Ruhig* bleiben, *langsam* sprechen.',
  'Das klingt *spannend*, erzähl *mehr*!',
  'Ich hätte *nie* gedacht, dass es so *leicht* ist.',
  'Wir sehen uns *morgen*, ich *freu* mich.',
  'Das ist *mein* Lieblingsplatz in der *Stadt*.',
  'Was für eine *Überraschung*, ich bin *sprachlos*!',
  'Jeden Tag ein *bisschen* besser, *Schritt* für Schritt.',
];

// ---------------------------------------------------------------------------
// Sätze für die „Ruhige Stimme“: tief, langsam, warm, Satzenden sinken.
// ---------------------------------------------------------------------------
export const CALM_LINES: string[] = [
  'Alles gut. Wir finden eine Lösung. Lass uns kurz durchatmen.',
  'Ich verstehe dich. Erzähl mir in Ruhe, was passiert ist.',
  'Kein Stress. Wir machen einen Schritt nach dem anderen.',
  'Das klingt anstrengend. Ich bin da und höre zu.',
  'Wir haben Zeit. Niemand muss sich beeilen.',
  'Danke, dass du das sagst. Lass uns gemeinsam schauen.',
  'Das schaffen wir. Ganz ruhig, eins nach dem anderen.',
  'Ich nehme mir kurz Zeit und antworte dir dann.',
  'Guten Abend. Schön, dass du da bist. Mach es dir bequem.',
  'Lass uns kurz innehalten. Was ist dir jetzt am wichtigsten?',
  'Das ist ein guter Punkt. Ich denke kurz darüber nach.',
  'Du bist nicht allein damit. Wir klären das zusammen.',
  'Ich habe dich gehört. Und ich nehme das ernst.',
  'Erst atmen, dann sprechen. Wir haben alle Zeit der Welt.',
  'Willkommen zurück. Wie war deine Woche?',
  'Alles der Reihe nach. Fang einfach vorne an.',
  'Ich bin mir sicher, dass wir einen Weg finden.',
  'Das ist okay. Fehler passieren. Wir machen weiter.',
  'Ruhig. Klar. Langsam. So klingt Vertrauen.',
  'Danke für deine Geduld. Das bedeutet mir viel.',
  'Schön, dich zu sehen. Wie geht es dir wirklich?',
  'Ich höre dir zu. Nimm dir die Zeit, die du brauchst.',
  'Das klingt nach einem langen Tag. Setz dich erst mal.',
  'Wir müssen das nicht heute lösen. Morgen ist auch ein Tag.',
  'Gute Nacht. Schlaf gut. Morgen wird ein guter Tag.',
];

// ---------------------------------------------------------------------------
// Kleine Varianten innerhalb derselben Methode.
// ---------------------------------------------------------------------------
/** Laute für „Atem für lange Sätze“. */
export const HOLD_SOUNDS: string[] = ['sss', 'fff', 'sch'];

/** Anker für die Atem-Meditation. */
export const MEDITATION_ANCHORS: string[] = [
  'Augen zu, spür den Atem an der Nase.',
  'Augen zu, spür, wie sich der Bauch hebt und senkt.',
  'Augen zu, zähl die Ausatmer von 1 bis 10, dann von vorn.',
  'Augen zu, spür den Atem im Brustkorb.',
];

/** Worauf der Blick in der Moment-Hilfe geht. */
export const MOMENT_FOCUS: string[] = [
  'Blick nach außen: Welche Augenfarbe hat die Person?',
  'Blick nach außen: Was hält die Person in der Hand?',
  'Blick nach außen: Welche Farbe hat ihre Kleidung?',
  'Blick nach außen: Wie klingt ihre Stimme gerade?',
  'Blick nach außen: Was steht hinter ihr im Raum?',
  'Blick nach außen: Lächelt sie gerade, oder ist sie konzentriert?',
  'Blick nach außen: Welches Detail fällt dir an ihr zuerst auf?',
  'Blick nach außen: Wie ist das Licht im Raum?',
  'Blick nach außen: Was hat sie gerade als Letztes gesagt?',
  'Blick nach außen: Welche drei Dinge siehst du um sie herum?',
];

// ---------------------------------------------------------------------------
// Themen für die Bühne.
// ---------------------------------------------------------------------------
export interface StageTopic {
  cat: string;
  text: string;
}

const topics = (cat: string, texts: string[]): StageTopic[] => texts.map((text) => ({ cat, text }));

export const STAGE_TOPICS: StageTopic[] = [
  ...topics('Vorstellen', [
    'Stell dich vor, als wärst du Gastgeber eines schönen Abends.',
    'Stell dich in einer Minute vor: Name, was du magst, was dich ausmacht.',
    'Stell dich vor, als würdest du heute einen neuen Job beginnen.',
    'Stell dich einer Gruppe vor, die dich noch nicht kennt.',
    'Stell dich vor, als wärst du Moderator einer Radiosendung.',
    'Begrüß neue Nachbarn und erzähl kurz von deiner Straße.',
    'Stell dein Lieblingshobby vor, als wäre es eine eigene Fernsehsendung.',
    'Stell dich vor, als wärst du Kapitän eines Schiffs kurz vor der Abfahrt.',
  ]),
  ...topics('Toast', [
    'Halte einen kurzen Toast auf einen guten Freund.',
    'Halte einen Toast auf deine Familie.',
    'Halte eine Geburtstagsrede für jemanden, den du magst.',
    'Halte einen Toast auf das Wochenende.',
    'Halte eine kurze Rede zum Abschied eines Kollegen.',
    'Bedank dich vor allen Gästen bei jemandem, der dir geholfen hat.',
    'Halte einen Toast auf das neue Jahr.',
  ]),
  ...topics('Überzeugen', [
    'Überzeug uns in einer Minute von deinem Lieblingsfilm.',
    'Überzeug uns, dass Frühstück die beste Mahlzeit ist.',
    'Überzeug uns, mehr spazieren zu gehen.',
    'Überzeug uns, deine Stadt zu besuchen.',
    'Überzeug uns, dass Pausen produktiv sind.',
    'Überzeug uns von deiner Lieblingsmusik.',
    'Überzeug uns, ein neues Hobby anzufangen.',
    'Überzeug uns, heute früher schlafen zu gehen.',
    'Empfiehl uns ein Essen, das jeder einmal probieren sollte.',
  ]),
  ...topics('Erzählen', [
    'Erzähl von einem Ort, an dem du dich frei fühlst.',
    'Erzähl, was dich diese Woche zum Lachen gebracht hat.',
    'Erzähl von einem Menschen, den du bewunderst, und warum.',
    'Erzähl von deinem schönsten Ferientag als Kind.',
    'Erzähl von einer Begegnung mit einem Fremden, die du nicht vergisst.',
    'Erzähl von einem Moment, in dem du mutig warst.',
    'Erzähl von deinem Lieblingsessen und wer es für dich gekocht hat.',
    'Erzähl von einem Tag, an dem alles schiefging, und wie er endete.',
    'Erzähl von einem Geschenk, das dir viel bedeutet.',
    'Erzähl von einer Reise, die dich verändert hat.',
  ]),
  ...topics('Erklären', [
    'Erklär einem Kind, was du bei der Arbeit machst.',
    'Erklär, wie man den perfekten Kaffee macht.',
    'Erklär einem Touristen, wie man sich in deiner Stadt zurechtfindet.',
    'Erklär, warum Schlaf so wichtig ist.',
    'Erklär die Regeln deines Lieblingsspiels.',
    'Erklär, wie man einen Fahrradreifen flickt.',
    'Erklär einem Freund, wie zyklisches Seufzen geht.',
    'Erklär, was ein gutes Gespräch ausmacht.',
    'Verrat uns einen Tipp, der dein Leben leichter gemacht hat.',
  ]),
  ...topics('Sinatra-Moment', [
    'Begrüß dein Publikum, als wärst du Sinatra in Las Vegas.',
    'Kündige den nächsten Song an, als wärst du Showmaster in den 60ern.',
    'Erzähl, warum dich eine bestimmte Stimme fasziniert.',
    'Moderier einen Abend mit Live-Musik, ganz entspannt und charmant.',
    'Verabschiede dein Publikum nach einem großen Konzert.',
    'Bedank dich beim Orchester, als wärst du der Star des Abends.',
  ]),
  ...topics('Meinung', [
    'Was ist wichtiger: Talent oder Übung? Sag deine Meinung.',
    'Sollte man im Urlaub erreichbar sein? Begründe deine Meinung.',
    'Stadt oder Land: Wo lebt man besser?',
    'Ist Pünktlichkeit überbewertet? Sag, was du denkst.',
    'Sollten Handys beim Essen weg? Begründe es.',
    'Morgenmensch oder Nachtmensch: Was ist besser?',
    'Was macht einen guten Chef aus?',
  ]),
  ...topics('Fantasie', [
    'Du hast eine Zeitmaschine. Wohin reist du und warum?',
    'Du darfst ein Restaurant eröffnen. Wie sieht es aus?',
    'Du bist für einen Tag Bürgermeister. Was änderst du?',
    'Du wachst in einer fremden Stadt auf. Was machst du zuerst?',
    'Du gewinnst eine Reise für zwei. Wen nimmst du mit?',
    'Du darfst ein Lied für die ganze Welt spielen. Welches und warum?',
  ]),
];

// ---------------------------------------------------------------------------
// Missionen für den Alltag: fünf Stufen mit je sechs Varianten.
// Die Stufe steigt nach je drei erledigten Missionen.
// ---------------------------------------------------------------------------
export interface MissionDef {
  level: number;
  title: string;
  text: string;
}

const level = (n: number, list: [string, string][]): MissionDef[] =>
  list.map(([title, text]) => ({ level: n, title, text }));

export const MISSIONS: MissionDef[] = [
  ...level(1, [
    ['Drei Mini-Sätze', 'Sprich heute drei fremde Menschen kurz an: Frag, wo etwas steht, grüß jemanden mit einem Satz und wünsch an der Kasse einen schönen Tag.'],
    ['Nach dem Weg fragen', 'Frag eine fremde Person nach dem Weg oder nach der Uhrzeit, auch wenn du es eigentlich weißt. Bedank dich mit einem ganzen Satz.'],
    ['Ein kleines Kompliment', 'Mach heute einer fremden Person ein ehrliches, kleines Kompliment, zum Beispiel zu einer Jacke oder einem Hund.'],
    ['Klar bestellen', 'Bestell heute irgendwo etwas mit ruhiger, klarer Stimme und schau dabei die Person an.'],
    ['Einen Satz mehr', 'Grüß heute zwei Nachbarn oder Kollegen mit einem Satz mehr als sonst, zum Beispiel: „Schönen Feierabend nachher!“'],
    ['Um Rat fragen', 'Frag im Laden nach einer Empfehlung, zum Beispiel welches Brot heute am besten ist.'],
  ]),
  ...level(2, [
    ['Eine echte Rückfrage', 'Stell einer fremden Person eine echte Frage, zum Beispiel wie ihr Tag läuft, und hör dir die Antwort ganz an.'],
    ['Smalltalk übers Wetter', 'Sag einer fremden Person etwas zum Wetter und stell eine Frage hinterher.'],
    ['Nachfragen statt nicken', 'Wenn dir heute jemand etwas erzählt, stell eine Nachfrage, bevor du antwortest.'],
    ['Eine Empfehlung geben', 'Empfiehl heute jemandem etwas, das du magst, und nenn einen Grund dafür.'],
    ['Anrufen statt schreiben', 'Ruf heute irgendwo an, wo du sonst eine Nachricht schreiben würdest, und frag etwas.'],
    ['Zwei ehrliche Sätze', 'Wenn dich heute jemand fragt, wie es dir geht, antworte mit zwei ehrlichen Sätzen statt nur mit „gut“.'],
  ]),
  ...level(3, [
    ['Ein echter Moment', 'Bemerk etwas Echtes und sprich es aus, so wie bei den Croques. Einmal bei der Arbeit, einmal woanders.'],
    ['Etwas Gutes benennen', 'Sag heute einer Person, was dir an ihr oder ihrer Arbeit positiv aufgefallen ist.'],
    ['Eine kleine Geschichte', 'Erzähl heute jemandem in drei Sätzen etwas, das dir gestern passiert ist.'],
    ['Lachen teilen', 'Wenn dich heute etwas zum Schmunzeln bringt, sprich es laut aus, statt es nur zu denken.'],
    ['Meinung sagen', 'Sag heute einmal deine ehrliche Meinung zu etwas Kleinem, zum Beispiel zu Musik oder Essen.'],
    ['Danke mit Grund', 'Bedank dich heute bei jemandem und sag dazu, warum es dir geholfen hat.'],
  ]),
  ...level(4, [
    ['Unter Freunden', 'Erzähl Freunden eine kleine Beobachtung aus deinem Tag, drei bis vier Sätze. Schau dabei in ihre Gesichter.'],
    ['Das Thema setzen', 'Fang bei Freunden heute selbst ein Thema an, statt zu warten, bis jemand anderes etwas sagt.'],
    ['Eine Frage in die Runde', 'Stell in einer Gruppe eine Frage an alle und hör dir die Antworten an.'],
    ['Eine gemeinsame Erinnerung', 'Erzähl Freunden eine lustige Erinnerung, die ihr zusammen habt.'],
    ['Zu Ende sprechen', 'Erzähl Freunden etwas und sprich bis zum Ende, auch wenn jemand dazwischenredet. Freundlich, aber ganz.'],
    ['Sprachnachricht', 'Schick einem Freund eine Sprachnachricht von 30 Sekunden statt einer Textnachricht.'],
  ]),
  ...level(5, [
    ['Bewusst langsam', 'Sprich in einem Gespräch absichtlich langsamer, obwohl der Impuls „schneller“ sagt. Beobachte, was wirklich passiert.'],
    ['Pause aushalten', 'Mach mitten in einem Satz bewusst zwei Sekunden Pause. Beobachte, wie dein Gegenüber reagiert.'],
    ['Blick halten', 'Halte in einem Gespräch den Blickkontakt bis zum Ende deines Satzes.'],
    ['Ohne Entschuldigung', 'Wenn du dich heute versprichst, sag den Satz einfach nochmal, ohne dich zu entschuldigen.'],
    ['Eine Minute am Stück', 'Erzähl heute einmal mindestens eine Minute am Stück, ohne abzukürzen.'],
    ['In der Runde', 'Sag heute in einer Gruppe von drei oder mehr Menschen einen ganzen Gedanken laut.'],
  ]),
];

export const missionsForLevel = (n: number): MissionDef[] => MISSIONS.filter((m) => m.level === n);

export const findMission = (title: string): MissionDef | undefined => MISSIONS.find((m) => m.title === title);

/** Anzahl aller Beispiele, für die Anzeige in der App. */
export const EXAMPLE_COUNT =
  TEXTS.length +
  PROMPTS.length +
  CLEAR_TASKS.length +
  MELODY_LINES.length +
  CALM_LINES.length +
  STAGE_TOPICS.length +
  MISSIONS.length;
