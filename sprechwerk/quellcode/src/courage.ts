// Bereich „Mut“: Angst überwinden und Selbstvertrauen aufbauen.
// Übungen, Wissen, Angst-Leiter und Gesprächs-Starter. Jede Übung nennt ihre Grundlage.

export type CourageCat = 'Angst' | 'Selbstvertrauen' | 'Gespräche';

export type CourageControl =
  | { kind: 'timer'; seconds: number; label: string }
  | { kind: 'speak'; seconds: number }
  | { kind: 'breath'; cycles: number };

export interface CourageExercise {
  id: string;
  cat: CourageCat;
  title: string;
  minutes: number;
  /** Ein Satz: worum es geht. */
  intro: string;
  steps: string[];
  /** Eine Auswahl, z. B. welches Sicherheitsverhalten du heute weglässt. */
  chips?: { label: string; options: string[] };
  /** Schreibfelder. Werden nicht gespeichert, außer bei `saveToWins`. */
  inputs?: { label: string; placeholder: string }[];
  /** Eine Einschätzung von 0 bis 10. */
  rating?: { label: string; low: string; high: string };
  /** Ausgefüllte Felder landen im Erfolgs-Tagebuch. */
  saveToWins?: boolean;
  control?: CourageControl;
  why: string;
  source: string;
}

export const COURAGE_CATS: CourageCat[] = ['Angst', 'Selbstvertrauen', 'Gespräche'];

export const COURAGE_EXERCISES: CourageExercise[] = [
  // ---------------------------------------------------------------- Angst
  {
    id: 'spotlight',
    cat: 'Angst',
    title: 'Spotlight-Check',
    minutes: 2,
    intro: 'Du überschätzt, wie sehr andere auf deine Fehler achten. Prüf es nach.',
    steps: [
      'Denk an einen Moment, in dem du dich versprochen hast.',
      'Schätz: Wie viele Leute haben es wirklich bemerkt?',
      'Halbier diese Zahl. Das kommt der Wirklichkeit näher.',
    ],
    rating: { label: 'Wie peinlich fühlt es sich jetzt an?', low: 'gar nicht', high: 'sehr' },
    why: 'Studierende trugen ein peinliches T-Shirt in einen Raum voller Leute. Sie schätzten, die Hälfte würde es bemerken. In Wahrheit war es etwa ein Viertel. Wir fühlen uns viel mehr im Rampenlicht, als wir es sind.',
    source: 'Gilovich, Medvec & Savitsky 2000: Spotlight-Effekt',
  },
  {
    id: 'transparency',
    cat: 'Angst',
    title: 'Unsichtbare Nervosität',
    minutes: 2,
    intro: 'Deine Aufregung fühlt sich riesig an. Von außen sieht man kaum etwas.',
    steps: [
      'Spür kurz hin, wo die Aufregung im Körper sitzt.',
      'Sag laut: „Meine Nervosität fühlt sich groß an, aber andere sehen kaum etwas davon.“',
      'Dann erzähl 30 Sekunden lang, wie dein Tag war.',
    ],
    control: { kind: 'speak', seconds: 30 },
    why: 'Redner, denen man vorher erklärte, dass man Nervosität von außen kaum sieht, hielten bessere Reden, fühlten sich wohler und wirkten auf Zuhörer gelassener.',
    source: 'Savitsky & Gilovich 2003: Illusion der Durchschaubarkeit',
  },
  {
    id: 'worry-write',
    cat: 'Angst',
    title: 'Sorgen aufschreiben',
    minutes: 5,
    intro: 'Vor einem wichtigen Gespräch: Schreib alle Sorgen raus, damit der Kopf frei wird.',
    steps: [
      'Stell den Timer und schreib alles auf, was dich am Gespräch beunruhigt.',
      'Nicht schön, nicht ordentlich. Einfach raus damit.',
      'Danach Handy weg, einmal ausatmen und los.',
    ],
    inputs: [{ label: 'Was befürchtest du?', placeholder: 'Ich habe Angst, dass …' }],
    control: { kind: 'timer', seconds: 300, label: 'Schreib alles raus' },
    why: 'Schüler und Studierende, die vor einer Prüfung 10 Minuten lang ihre Sorgen aufschrieben, schnitten besser ab. Besonders die Ängstlichen. Die Sorgen belegen dann weniger Platz im Arbeitsgedächtnis.',
    source: 'Ramirez & Beilock 2011, Science',
  },
  {
    id: 'three-outcomes',
    cat: 'Angst',
    title: 'Drei Ausgänge',
    minutes: 3,
    intro: 'Angst zeigt dir nur den schlimmsten Film. Schau dir alle drei an.',
    steps: [
      'Schreib auf, was im schlimmsten Fall passiert.',
      'Dann den besten Fall.',
      'Dann den wahrscheinlichsten Fall, ehrlich und nüchtern.',
      'Zum Schluss: Wenn das Schlimmste passiert, was würdest du dann tun?',
    ],
    inputs: [
      { label: 'Schlimmster Fall', placeholder: 'Ich bleibe hängen und alle lachen …' },
      { label: 'Bester Fall', placeholder: 'Ich erzähle es locker und alle hören zu …' },
      { label: 'Wahrscheinlichster Fall', placeholder: 'Ich stocke kurz, mache weiter, keiner achtet darauf …' },
      { label: 'Wenn das Schlimmste passiert, tue ich …', placeholder: 'kurz lachen, ausatmen, den Satz nochmal sagen …' },
    ],
    why: 'Ein Kernstück der kognitiven Verhaltenstherapie bei sozialer Angst: Katastrophen-Gedanken werden geprüft statt geglaubt. Meist ist der wahrscheinliche Ausgang viel harmloser, und selbst der schlimme ist zu bewältigen.',
    source: 'Kognitive Verhaltenstherapie, z. B. Hofmann & Otto 2008',
  },
  {
    id: 'safety',
    cat: 'Angst',
    title: 'Krücken weglassen',
    minutes: 2,
    intro: 'Kleine Tricks, die sich sicher anfühlen, halten die Angst am Leben. Lass heute einen weg.',
    steps: [
      'Such dir aus der Liste aus, was du oft machst.',
      'Nimm dir vor, genau das im nächsten Gespräch wegzulassen.',
      'Beobachte, was dann wirklich passiert.',
    ],
    chips: {
      label: 'Was machst du oft?',
      options: [
        'Blick vermeiden',
        'Schneller reden, um fertig zu werden',
        'Sätze vorher im Kopf proben',
        'Leiser sprechen',
        'Gespräch schnell beenden',
        'Lieber nichts sagen',
        'Mich sofort entschuldigen',
        'Hände verstecken',
      ],
    },
    why: 'Menschen mit sozialer Angst, die ihr Sicherheitsverhalten bewusst wegließen, hatten danach weniger Angst und glaubten weniger an ihre Befürchtungen als bei gleicher Übung mit Krücken. Erst ohne Krücke erlebt das Gehirn: Es geht auch so.',
    source: 'Wells u. a. 1995; Clark & Wells 1995',
  },
  {
    id: 'mistake',
    cat: 'Angst',
    title: 'Ein Fehler mit Absicht',
    minutes: 2,
    intro: 'Mach heute einen kleinen Fehler mit Absicht und schau, was wirklich passiert.',
    steps: [
      'Schreib vorher auf, was du befürchtest.',
      'Bau heute in ein Gespräch einen kleinen Stolperer ein, z. B.: „Ich nehme einen … äh, einen Kaffee.“',
      'Danach vergleichen: Was ist wirklich passiert? Trag es ins Erfolgs-Tagebuch ein.',
    ],
    inputs: [{ label: 'Was wird passieren, glaubst du?', placeholder: 'Die Person schaut komisch, lacht mich aus …' }],
    rating: { label: 'Wie sicher bist du, dass es schlimm wird?', low: 'gar nicht', high: 'ganz sicher' },
    why: 'In der kognitiven Therapie sozialer Angst testen Patienten ihre Befürchtungen mit absichtlichen kleinen Fehlern. Fast immer reagiert die Umwelt viel gelassener als erwartet. Genau dieser Unterschied baut die Angst ab.',
    source: 'Clark & Wells 1995: Verhaltensexperimente; Craske u. a. 2014',
  },
  {
    id: 'defusion',
    cat: 'Angst',
    title: 'Gedanken entschärfen',
    minutes: 1,
    intro: 'Ein Angstgedanke verliert seine Macht, wenn du ihn von außen anschaust.',
    steps: [
      'Nimm deinen lautesten Angstgedanken, z. B. „Ich blamiere mich.“',
      'Sag laut: „Ich habe den Gedanken, dass ich mich blamiere.“',
      'Nimm ein Wort daraus, z. B. „blamieren“, und sag es 30 Sekunden lang schnell hintereinander.',
    ],
    control: { kind: 'timer', seconds: 30, label: 'Wort schnell wiederholen' },
    why: 'Nach etwa 30 Sekunden schnellem Wiederholen wirkten negative Gedanken über sich selbst deutlich weniger glaubwürdig und unangenehm. Das Wort wird zum bloßen Klang.',
    source: 'Masuda, Hayes u. a. 2004; Akzeptanz- und Commitment-Therapie',
  },
  // ---------------------------------------------------------------- Selbstvertrauen
  {
    id: 'distance',
    cat: 'Selbstvertrauen',
    title: 'Mit dir wie mit einem Freund',
    minutes: 2,
    intro: 'Sprich vor einem Gespräch mit dir in der Du-Form und mit deinem Namen.',
    steps: [
      'Sag deinen Namen und sprich dich mit „du“ an.',
      'Zum Beispiel: „[Name], du bist vorbereitet. Du sprichst langsam. Du schaffst das, weil …“',
      'Eine Minute, laut oder leise.',
    ],
    control: { kind: 'speak', seconds: 60 },
    why: 'Vor einer Rede waren Menschen, die mit sich in der Du-Form und mit eigenem Namen sprachen, weniger ängstlich, sprachen besser und grübelten danach weniger als die, die „ich“ sagten. Der Abstand macht ruhiger.',
    source: 'Kross u. a. 2014: Selbstgespräch mit Abstand',
  },
  {
    id: 'compassion',
    cat: 'Selbstvertrauen',
    title: 'Freundlich zu dir',
    minutes: 1,
    intro: 'Nach einem Patzer: drei Sätze, die dich aufrichten statt runtermachen.',
    steps: [
      'Leg eine Hand auf die Brust.',
      '„Das war gerade unangenehm.“',
      '„Das kennt jeder Mensch.“',
      '„Ich darf freundlich zu mir sein und es nochmal versuchen.“',
    ],
    control: { kind: 'timer', seconds: 60, label: 'Ruhig atmen, die drei Sätze sagen' },
    why: 'Wer nach einem Fehler mitfühlend mit sich umging, war motivierter, es besser zu machen, und übte länger als wer sich nur selbst aufbaute oder kritisierte.',
    source: 'Breines & Chen 2012; Neff 2003',
  },
  {
    id: 'values',
    cat: 'Selbstvertrauen',
    title: 'Werte-Kompass',
    minutes: 3,
    intro: 'Vor einer stressigen Situation: Erinnere dich, was dir wirklich wichtig ist.',
    steps: [
      'Wähle den Wert, der dir am wichtigsten ist.',
      'Schreib zwei Sätze, warum er dir wichtig ist und wann du ihn zuletzt gelebt hast.',
      'Ein Versprecher ändert nichts daran, wer du bist.',
    ],
    chips: {
      label: 'Was ist dir am wichtigsten?',
      options: ['Familie', 'Freundschaft', 'Humor', 'Ehrlichkeit', 'Hilfsbereitschaft', 'Fleiß', 'Freiheit', 'Kreativität', 'Glaube'],
    },
    inputs: [{ label: 'Warum ist dir das wichtig?', placeholder: 'Weil …' }],
    why: 'Wer vor einer Stressprobe mit Rede kurz über seine wichtigsten Werte schrieb, zeigte eine deutlich geringere Stressreaktion des Körpers (Cortisol). Der Selbstwert hängt dann weniger an dieser einen Situation.',
    source: 'Creswell u. a. 2005: Selbstbestätigung durch Werte',
  },
  {
    id: 'posture',
    cat: 'Selbstvertrauen',
    title: 'Aufrecht ankommen',
    minutes: 1,
    intro: 'Eine Minute aufrechte Haltung vor einem Gespräch.',
    steps: [
      'Stell dich hin, Füße hüftbreit, Schultern locker nach hinten.',
      'Kinn waagerecht, Blick geradeaus, tief in den Bauch atmen.',
      'Eine Minute halten. Dann mit dieser Haltung ins Gespräch.',
    ],
    control: { kind: 'timer', seconds: 60, label: 'Aufrecht stehen, ruhig atmen' },
    why: 'Eine aufrechte, offene Haltung kann das Gefühl von Stärke etwas heben. Ehrlich gesagt: Die früher behaupteten Hormon-Effekte ließen sich nicht bestätigen. Es ist ein kleiner Schub fürs Gefühl, kein Zaubertrick.',
    source: 'Cuddy, Schultz & Fosse 2018; Ranehill u. a. 2015',
  },
  {
    id: 'evidence',
    cat: 'Selbstvertrauen',
    title: 'Beweise sammeln',
    minutes: 3,
    intro: 'Angst merkt sich jeden Patzer. Sammle bewusst die Momente, die gut liefen.',
    steps: [
      'Denk an drei Momente, in denen du gut gesprochen hast, egal wie klein.',
      'Schreib sie auf. Sie landen in deinem Erfolgs-Tagebuch.',
      'Lies sie vor dem nächsten schwierigen Gespräch.',
    ],
    inputs: [
      { label: 'Moment 1', placeholder: 'Ich habe einem Kunden etwas erklärt und …' },
      { label: 'Moment 2', placeholder: 'Ich habe einen Witz erzählt …' },
      { label: 'Moment 3', placeholder: 'Ich habe nachgefragt, obwohl …' },
    ],
    saveToWins: true,
    why: 'In der Therapie gegen negative Selbstbilder führen Patienten ein „Positiv-Tagebuch“, weil das Gehirn Gegenbeweise sonst übersieht. Gemeisterte Erfahrungen sind die stärkste Quelle von Selbstvertrauen.',
    source: 'Padesky 1994: Positiv-Tagebuch; Bandura 1977',
  },
  // ---------------------------------------------------------------- Gespräche
  {
    id: 'questions',
    cat: 'Gespräche',
    title: 'Fragen statt Druck',
    minutes: 1,
    intro: 'Du musst nicht glänzen. Stell eine Frage und dann eine Nachfrage.',
    steps: [
      'Im nächsten Gespräch: eine echte Frage stellen.',
      'Auf die Antwort eine Nachfrage: „Wie meinst du das?“, „Und dann?“, „Was hat dir daran gefallen?“',
      'Zuhören. Du nimmst dir damit auch den Druck, selbst viel reden zu müssen.',
    ],
    why: 'In Chat- und Speed-Dating-Studien wurden Menschen, die mehr Fragen stellten, deutlich mehr gemocht. Besonders Nachfragen wirken: Sie zeigen, dass man zuhört.',
    source: 'Huang, Yeomans, Brooks u. a. 2017',
  },
  {
    id: 'liking-gap',
    cat: 'Gespräche',
    title: 'Sympathie-Lücke',
    minutes: 1,
    intro: 'Nach einem Gespräch denkst du oft: „Die fand mich bestimmt komisch.“ Meist stimmt das nicht.',
    steps: [
      'Denk an dein letztes Gespräch.',
      'Schätz: Wie sehr mochte dich die Person?',
      'Rechne ein bis zwei Punkte drauf. So unterschätzen sich die meisten.',
    ],
    rating: { label: 'Wie sehr mochte dich die Person?', low: 'gar nicht', high: 'sehr' },
    why: 'Nach Gesprächen mit Fremden unterschätzten Menschen regelmäßig, wie sehr ihr Gegenüber sie mochte und das Gespräch genoss. Das galt für kurze wie für lange Gespräche. Bei Mitbewohnern hielt die Lücke sogar monatelang an.',
    source: 'Boothby, Cooney, Sandstrom & Clark 2018',
  },
  {
    id: 'strangers',
    cat: 'Gespräche',
    title: 'Fremde sind netter',
    minutes: 2,
    intro: 'Schätz vorher, wie ein kurzes Gespräch mit einem Fremden wird. Dann probier es aus.',
    steps: [
      'Schätz: Wie angenehm wird ein kurzes Gespräch mit einem Fremden?',
      'Sprich heute jemanden kurz an: Weg, Wetter, ein Kompliment.',
      'Danach vergleichen. Meistens ist es schöner als gedacht.',
    ],
    rating: { label: 'Wie angenehm wird es?', low: 'unangenehm', high: 'sehr angenehm' },
    why: 'Pendler, die in Bus oder Bahn einen Fremden ansprachen, hatten eine angenehmere Fahrt als die, die allein saßen. Vorher hatten sie genau das Gegenteil erwartet.',
    source: 'Epley & Schroeder 2014',
  },
];

// ---------------------------------------------------------------------------
// Wissen: kurze Erklärungen mit einem Tipp.
// ---------------------------------------------------------------------------
export interface KnowledgeCard {
  id: string;
  title: string;
  text: string;
  tip: string;
  source: string;
}

export const KNOWLEDGE: KnowledgeCard[] = [
  {
    id: 'speed',
    title: 'Warum du unter Stress schneller redest',
    text: 'Bei Stress schaltet der Körper auf Alarm: Puls hoch, Atem flach, alles soll schnell vorbei sein. Angst belegt außerdem einen Teil des Arbeitsgedächtnisses, der dann fürs Formulieren fehlt. Deshalb holpert der Satzanfang.',
    tip: 'Erst ausatmen, dann sprechen. Pausen geben dem Kopf die Zeit, die die Angst ihm nimmt.',
    source: 'Eysenck u. a. 2007',
  },
  {
    id: 'circle',
    title: 'Der Teufelskreis im Kopf',
    text: 'Wer Angst hat, sich zu blamieren, beobachtet sich beim Sprechen selbst: Wie klinge ich? Sieht man es mir an? Diese Selbstbeobachtung frisst Aufmerksamkeit, man spricht schlechter, und das bestätigt die Angst.',
    tip: 'Aufmerksamkeit nach außen: auf das Gesicht, die Worte, ein Detail im Raum.',
    source: 'Clark & Wells 1995',
  },
  {
    id: 'wander',
    title: 'Wenn die Gedanken woanders sind',
    text: 'Abschweifen ist normal, das Gehirn tut es von selbst. Entscheidend ist, wie schnell du zurückkommst. Genau das trainieren Aufmerksamkeitsübungen und Meditation: das Zurückholen, nicht das Nie-Abschweifen.',
    tip: 'Merkst du es im Gespräch: kurz ausatmen, auf ein Detail am Gegenüber schauen, weiterreden.',
    source: 'Wells: Aufmerksamkeitstraining; Goldin & Gross 2010',
  },
  {
    id: 'spotlight',
    title: 'Der Spotlight-Effekt',
    text: 'Wir glauben, alle sehen unsere Fehler. In einem Versuch schätzten Studierende mit einem peinlichen T-Shirt, die Hälfte der Leute würde es bemerken. Tatsächlich war es etwa ein Viertel.',
    tip: 'Teil deine Schätzung, wie viele etwas bemerkt haben, durch zwei.',
    source: 'Gilovich, Medvec & Savitsky 2000',
  },
  {
    id: 'transparency',
    title: 'Man sieht dir weniger an, als du denkst',
    text: 'Die eigene Nervosität fühlt sich riesig an, von außen sieht man sie kaum. Fachleute nennen das die Illusion der Durchschaubarkeit. Redner, die das vorher wussten, hielten bessere Reden.',
    tip: 'Sag dir vor dem Sprechen: „Es fühlt sich groß an, aber man sieht es kaum.“',
    source: 'Savitsky & Gilovich 2003',
  },
  {
    id: 'liking-gap',
    title: 'Andere mögen dich mehr, als du glaubst',
    text: 'Nach Gesprächen mit Fremden unterschätzen fast alle, wie sehr ihr Gegenüber sie mochte. Der innere Kritiker bewertet viel strenger als die anderen.',
    tip: 'Nach einem Gespräch: deinen Eindruck um ein bis zwei Punkte nach oben korrigieren.',
    source: 'Boothby u. a. 2018',
  },
  {
    id: 'strangers',
    title: 'Fremde sind netter, als du denkst',
    text: 'Pendler, die im Zug einen Fremden ansprachen, hatten eine angenehmere Fahrt als die, die allein saßen. Vorher hatten sie das Gegenteil erwartet.',
    tip: 'Kleine Gespräche mit Fremden sind ein ideales Übungsfeld: wenig Risiko, oft ein guter Moment.',
    source: 'Epley & Schroeder 2014',
  },
  {
    id: 'disfluency',
    title: 'Fehler gehören zum Sprechen',
    text: 'Auch im ganz normalen Gespräch hat jeder Unebenheiten: „äh“, Wiederholungen, Neustarts. Gezählt wurden etwa sechs pro hundert Wörter. Ein Versprecher ist also normal, kein Zeichen von Schwäche.',
    tip: 'Wenn du hängst: Satz einfach nochmal sagen, ohne Entschuldigung.',
    source: 'Bortfeld u. a. 2001',
  },
  {
    id: 'avoid',
    title: 'Vermeiden füttert die Angst',
    text: 'Jedes Mal, wenn du ausweichst, lernt das Gehirn: „Gut, dass wir weg sind, das war gefährlich.“ Wer sich der Situation stellt und erlebt, dass es gut geht, lernt neu. Am stärksten, wenn es besser läuft als befürchtet.',
    tip: 'Vorher kurz schätzen, wie schlimm es wird, nachher vergleichen. Genau dafür gibt es die Angst-Leiter.',
    source: 'Craske u. a. 2014',
  },
  {
    id: 'safety',
    title: 'Die versteckten Krücken',
    text: 'Schnell reden, Blick vermeiden, Sätze vorher proben: Das fühlt sich sicher an, hält die Angst aber am Leben. Denn so erlebst du nie, dass es auch ohne geht.',
    tip: 'Lass immer nur eine Krücke auf einmal weg, nicht alle gleichzeitig.',
    source: 'Wells u. a. 1995',
  },
  {
    id: 'friends',
    title: 'Warum es bei Freunden schwerer sein kann',
    text: 'Wenn man in einer Runde einmal ausgelacht wurde, merkt sich das Gehirn: Diese Runde ist heikel. Fremde kennen diese Geschichte nicht, Freunde schon. Das alte Gefühl verschwindet nicht durch Nachdenken, sondern durch neue, gute Erfahrungen mit genau diesen Menschen.',
    tip: 'Übe auch in der Freundesrunde, in kleinen Schritten: erst eine kurze Beobachtung, später eine Geschichte.',
    source: 'Craske u. a. 2014: inhibitorisches Lernen',
  },
  {
    id: 'reappraise',
    title: 'Aufregung umdeuten statt unterdrücken',
    text: 'Herzklopfen fühlt sich bei Angst und bei Vorfreude fast gleich an. Wer sich sagt „Ich bin aufgeregt“ statt „Ich bin ruhig“, schneidet beim Reden besser ab. Beruhigen klappt unter Druck schlecht, umdeuten klappt gut.',
    tip: 'Vor dem Gespräch leise sagen: „Ich bin aufgeregt.“',
    source: 'Brooks 2014',
  },
  {
    id: 'mastery',
    title: 'Selbstvertrauen kommt nach dem Tun',
    text: 'Du musst dich nicht erst sicher fühlen, um anzufangen. Die stärkste Quelle von Selbstvertrauen sind gemeisterte Erfahrungen, auch ganz kleine. Das Gefühl folgt dem Handeln.',
    tip: 'Jeden Tag eine kleine Mission. Und sie ins Erfolgs-Tagebuch schreiben.',
    source: 'Bandura 1977',
  },
  {
    id: 'thoughts',
    title: 'Gedanken sind keine Tatsachen',
    text: '„Die halten mich für komisch“ ist eine Vermutung, kein Beweis. Angstgedanken zu prüfen statt ihnen sofort zu glauben, ist einer der wirksamsten Bausteine der Therapie gegen soziale Angst.',
    tip: 'Frag dich: Was spricht dafür, was dagegen? Was würde ich einem Freund sagen? Dafür gibt es den Gedanken-Check.',
    source: 'Hofmann & Otto 2008',
  },
  {
    id: 'compassion',
    title: 'Freundlich zu dir statt streng',
    text: 'Viele glauben, Strenge mit sich selbst mache besser. Das Gegenteil stimmt: Wer nach einem Fehler mitfühlend mit sich spricht, ist motivierter, es nochmal zu versuchen.',
    tip: 'Sprich mit dir so, wie du mit einem guten Freund sprechen würdest.',
    source: 'Breines & Chen 2012',
  },
  {
    id: 'questions',
    title: 'Fragen machen sympathisch',
    text: 'Menschen, die mehr Fragen stellen, vor allem Nachfragen, werden mehr gemocht. Du musst also nicht witzig oder schlau sein, nur interessiert.',
    tip: 'Hängst du im Gespräch, stell eine Frage. Das nimmt den Druck und hält das Gespräch am Laufen.',
    source: 'Huang u. a. 2017',
  },
  {
    id: 'distance',
    title: 'Mit dir reden wie mit einem Freund',
    text: 'Selbstgespräch in der Du-Form und mit eigenem Namen schafft Abstand zu den Gefühlen. Vor einer Rede waren Menschen damit weniger ängstlich und sprachen besser.',
    tip: 'Statt „Ich schaffe das nicht“: „[Name], du schaffst das, du hast es schon oft gemacht.“',
    source: 'Kross u. a. 2014',
  },
  {
    id: 'worry',
    title: 'Sorgen aufschreiben macht den Kopf frei',
    text: 'Wer vor einer Prüfung zehn Minuten seine Sorgen aufschrieb, schnitt besser ab, besonders ängstliche Menschen. Was auf dem Papier steht, muss der Kopf nicht mehr festhalten.',
    tip: 'Vor einem wichtigen Gespräch fünf Minuten Sorgen rausschreiben. Die Übung findest du unter „Angst“.',
    source: 'Ramirez & Beilock 2011',
  },
  {
    id: 'values',
    title: 'Werte geben Halt',
    text: 'Wer vor einer Stressprobe kurz über seine wichtigsten Werte schreibt, zeigt weniger körperlichen Stress. Ein Gespräch ist dann nicht mehr ein Urteil über dich als Ganzes.',
    tip: 'Erinnere dich vor schwierigen Momenten an das, was dir wirklich wichtig ist.',
    source: 'Creswell u. a. 2005',
  },
  {
    id: 'body',
    title: 'Kaffee, Schlaf und Nervosität',
    text: 'Viel Koffein kann Herzklopfen und innere Unruhe verstärken, und wenig Schlaf macht das Gehirn deutlich empfindlicher für Angst. Wenn du an solchen Tagen schneller sprichst, ist das kein Zufall und kein Rückschritt.',
    tip: 'Vor wichtigen Gesprächen lieber ein Kaffee weniger, und am Abend davor genug Schlaf.',
    source: 'Lara 2010; Ben Simon u. a. 2020',
  },
];

// ---------------------------------------------------------------------------
// Angst-Leiter: Vorschläge von leicht nach schwer. Die Zahl ist die geschätzte Angst (0–10).
// ---------------------------------------------------------------------------
export const LADDER_PRESETS: { id: string; text: string; fear: number }[] = [
  { id: 'p01', text: 'Jemanden auf der Straße nach der Uhrzeit fragen', fear: 2 },
  { id: 'p02', text: 'An der Kasse einen ganzen Satz sagen, nicht nur „Danke“', fear: 2 },
  { id: 'p03', text: 'Im Laden nach einer Empfehlung fragen', fear: 3 },
  { id: 'p04', text: 'Einer fremden Person ein kleines Kompliment machen', fear: 4 },
  { id: 'p05', text: 'Irgendwo anrufen statt eine Nachricht zu schreiben', fear: 4 },
  { id: 'p06', text: 'Mit einem Fremden drei Sätze Smalltalk führen', fear: 5 },
  { id: 'p07', text: 'Einem Freund eine Sprachnachricht von 30 Sekunden schicken', fear: 4 },
  { id: 'p08', text: 'Unter Freunden eine kleine Beobachtung erzählen', fear: 5 },
  { id: 'p09', text: 'Unter Freunden bewusst langsam sprechen, auch wenn jemand drängelt', fear: 6 },
  { id: 'p10', text: 'In der Freundesrunde eine Geschichte bis zum Ende erzählen', fear: 7 },
  { id: 'p11', text: 'In einer Gruppe von fünf oder mehr deine Meinung sagen', fear: 7 },
  { id: 'p12', text: 'In der Runde einen Witz erzählen', fear: 8 },
  { id: 'p13', text: 'Bei einer Feier einen kurzen Toast halten', fear: 9 },
];

// ---------------------------------------------------------------------------
// Gedanken-Check: Hilfen für Gegenargumente.
// ---------------------------------------------------------------------------
export const THOUGHT_HINTS: string[] = [
  'Andere achten viel weniger auf mich, als ich denke.',
  'Man sieht meine Nervosität kaum.',
  'Andere mögen mich meist mehr, als ich glaube.',
  'Jeder hat beim Sprechen Unebenheiten, etwa sechs pro hundert Wörter.',
  'Ein Versprecher ist kein Urteil über mich.',
  'Ich muss nicht perfekt sein, nur echt.',
  'Es ist schon oft gut gegangen.',
];

export const THOUGHT_EXAMPLES: string[] = [
  'Die halten mich für komisch.',
  'Ich bleibe bestimmt wieder hängen.',
  'Alle merken, dass ich nervös bin.',
  'Wenn ich mich verspreche, lachen sie.',
  'Ich habe nichts Interessantes zu sagen.',
];

export const WIN_EXAMPLES: string[] = [
  'Ich habe jemanden angesprochen.',
  'Ich habe langsam gesprochen.',
  'Ich habe einen Satz zu Ende gesagt, obwohl ich kurz hing.',
  'Ich habe eine Nachfrage gestellt.',
  'Ich habe unter Freunden etwas erzählt.',
  'Ich habe mich nicht entschuldigt, sondern einfach weitergemacht.',
];

// ---------------------------------------------------------------------------
// Gesprächs-Starter und Retter-Sätze.
// ---------------------------------------------------------------------------
export interface StarterGroup {
  id: string;
  title: string;
  intro: string;
  lines: string[];
}

export const STARTERS: StarterGroup[] = [
  {
    id: 'rescue',
    title: 'Retter-Sätze',
    intro: 'Für den Moment, wenn du hängst oder den Faden verlierst. Ruhig sagen, dann weiter.',
    lines: [
      'Moment, ich sortiere kurz meine Gedanken.',
      'Lass mich das anders sagen.',
      'Wo war ich? Ach ja …',
      'Ich fang den Satz nochmal an.',
      'Gute Frage, lass mich kurz überlegen.',
      'Wie sag ich das am besten …',
      'Ich habe gerade den Faden verloren, worüber sprachen wir?',
      'Kurz gesagt: …',
      'Das Wort fällt mir gerade nicht ein, du weißt, was ich meine.',
      'Warte, das ist mir wichtig, ich sag es nochmal richtig.',
    ],
  },
  {
    id: 'strangers',
    title: 'Mit Fremden',
    intro: 'Kurze, leichte Einstiege. Ein Satz plus eine Frage reicht.',
    lines: [
      'Entschuldigung, wissen Sie, wie spät es ist?',
      'Ist hier noch frei?',
      'Schönes Wetter heute. Haben Sie noch was Schönes vor?',
      'Coole Jacke, wo gibt es die?',
      'Kennen Sie sich hier aus? Ich suche …',
      'Können Sie mir etwas empfehlen?',
      'Ist das gut? Ich überlege, es auch zu nehmen.',
      'Wie heißt Ihr Hund? Der ist ja süß.',
      'Ganz schön voll heute, oder?',
      'Wartet ihr auch auf den Bus nach …?',
      'Darf ich kurz fragen, wo Sie das gekauft haben?',
      'Sie sehen aus, als kennen Sie sich aus: Welche Richtung zum Bahnhof?',
      'Ich bin neu hier, was kann man in der Gegend machen?',
      'Was ist Ihr Lieblingsgericht hier?',
      'Danke, das war wirklich nett von Ihnen.',
    ],
  },
  {
    id: 'friends',
    title: 'Unter Freunden',
    intro: 'Einstiege, mit denen du selbst ein Thema setzt.',
    lines: [
      'Rate mal, was mir heute passiert ist.',
      'Ich hab was Lustiges gesehen, wartet …',
      'Was war euer Highlight diese Woche?',
      'Ich brauche mal eure Meinung zu was.',
      'Kennt ihr das, wenn …?',
      'Ich hab mir überlegt, wir könnten mal …',
      'Habt ihr schon von … gehört?',
      'Weißt du noch, als wir …?',
      'Ich hab einen neuen Song entdeckt, hört mal.',
      'Was würdet ihr machen, wenn …?',
      'Heute ist mir was Komisches aufgefallen.',
      'Ehrlich gesagt war meine Woche ziemlich …',
      'Wer hat Lust, am Wochenende …?',
      'Ich muss euch was erzählen.',
      'Was ist das Beste, was ihr in letzter Zeit gegessen habt?',
    ],
  },
  {
    id: 'follow-up',
    title: 'Nachfragen',
    intro: 'Halten jedes Gespräch am Laufen und nehmen dir den Druck, selbst viel zu reden.',
    lines: [
      'Wie meinst du das?',
      'Und wie ging es dann weiter?',
      'Was hat dir daran gefallen?',
      'Wie bist du darauf gekommen?',
      'Echt? Erzähl mehr.',
      'Wie war das für dich?',
      'Was war das Schwierigste daran?',
      'Und was hast du dann gemacht?',
      'Würdest du das nochmal machen?',
      'Was hat dich am meisten überrascht?',
      'Seit wann machst du das schon?',
      'Wie fühlst du dich jetzt damit?',
    ],
  },
  {
    id: 'exit',
    title: 'Gespräch beenden',
    intro: 'Freundlich rausgehen, ohne Ausrede und ohne Hektik.',
    lines: [
      'Schön, mit dir zu reden. Ich muss weiter, bis bald!',
      'Das war nett. Ich wünsch dir noch einen schönen Tag.',
      'Danke für den Tipp, das probiere ich aus.',
      'Ich lass dich mal weitermachen. Bis zum nächsten Mal!',
      'Lass uns das bald weiterbesprechen.',
      'Ich muss los, aber erzähl mir nächstes Mal, wie es ausgegangen ist.',
      'War schön, dich zu sehen. Mach’s gut!',
      'Dann viel Erfolg morgen!',
    ],
  },
];

export const COURAGE_WHY = {
  why: 'Angst wird nicht kleiner durch Warten, sondern durch neue Erfahrungen: Schritt für Schritt, mit einem Plan und ehrlichem Vergleich zwischen Befürchtung und Wirklichkeit. Das Selbstvertrauen folgt dem Tun.',
  source: 'Craske u. a. 2014; Bandura 1977; Clark & Wells 1995',
};
