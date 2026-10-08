// Übungen, Abläufe und Quellen von Sprechwerk. Die wechselnden Beispiele stehen in `examples.ts`.
// Jede Übung nennt ihre Grundlage. Belegte Aussagen sind in `why` knapp zusammengefasst.

import { CALM_LINES, CLEAR_TASKS, MELODY_LINES, PROMPTS, TEXTS } from './examples';

export type FocusId = 1 | 2 | 3 | 4;

export const FOCUS_OPTIONS: { id: FocusId; label: string }[] = [
  { id: 1, label: 'Ruhe & Atem' },
  { id: 2, label: 'Fokus statt Kopfkino' },
  { id: 3, label: 'Tempo & Klarheit' },
  { id: 4, label: 'Stimme & Melodie' },
];

// Vorausgewählt wie im Design (Karte 02 und 04).
export const DEFAULT_FOCUS: FocusId[] = [2, 4];

export type ExerciseKind = 'breath' | 'timer' | 'hold' | 'speak';

/** Welche Beispiel-Liste eine Sprech-Übung nutzt. */
export type ContentKind = 'text' | 'textEmphasis' | 'questions' | 'clear' | 'melody' | 'calm';

export interface ContentSpec {
  list: string[];
  label: string;
  /** Beschriftung des Knopfs für ein anderes Beispiel. */
  shuffle: string;
  /** Versatz, damit zwei Übungen mit derselben Liste nie dasselbe Beispiel zeigen. */
  salt: number;
  /** Übungstext mit Sinneinheiten statt einer einzelnen Zeile. */
  reading?: boolean;
  /** Markierte Wörter hervorheben. */
  marked?: boolean;
  /** Als gesprochener Satz in Anführungszeichen zeigen. */
  quote?: boolean;
}

export const CONTENT: Record<ContentKind, ContentSpec> = {
  text: { list: TEXTS, label: 'Dein Text', shuffle: 'Anderer Text', salt: 0, reading: true },
  textEmphasis: { list: TEXTS, label: 'Dein Text', shuffle: 'Anderer Text', salt: 20, reading: true, marked: true },
  questions: { list: PROMPTS, label: 'Deine Frage', shuffle: 'Neue Frage', salt: 0 },
  clear: { list: CLEAR_TASKS, label: 'Deine Aufgabe', shuffle: 'Andere Aufgabe', salt: 0 },
  melody: { list: MELODY_LINES, label: 'Dein Satz', shuffle: 'Anderer Satz', salt: 0, marked: true, quote: true },
  calm: { list: CALM_LINES, label: 'Dein Satz', shuffle: 'Anderer Satz', salt: 0, quote: true },
};

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  tag: string;
  title: string;
  minutes: number;
  /** Dauer für Timer und Sprech-Übungen in Sekunden. */
  seconds: number;
  /** Atemzyklen à 9,5 s für geführte Atmung. */
  cycles?: number;
  /** Schritte. „{laut}“ und „{anker}“ werden je Training durch eine Variante ersetzt. */
  steps: string[];
  phases?: { at: number; label: string }[];
  counterLabel?: string;
  /** Wechselnde Beispiele für Sprech-Übungen. */
  content?: ContentKind;
  why: string;
  source: string;
}

const SIGH_STEPS = [
  'Tief durch die Nase einatmen.',
  'Oben kurz nachatmen, ein zweiter kleiner Zug.',
  'Langsam durch den Mund aus, länger als das Einatmen.',
];

const SIGH_SOURCE = 'Balban, Spiegel, Huberman u. a., Stanford, Cell Reports Medicine 2023';

export const WARMUP: Exercise = {
  id: 'warmup-sigh',
  kind: 'breath',
  tag: 'Neurowissenschaft · Ankommen',
  title: 'Zyklisches Seufzen',
  minutes: 1,
  seconds: 57,
  cycles: 6,
  steps: SIGH_STEPS,
  why: 'Langes Ausatmen aktiviert das Ruhesystem des Körpers und bremst den Puls. Ein ruhiger Atem ist der Treibstoff für ruhiges Sprechen.',
  source: SIGH_SOURCE,
};

export const POOLS: Record<FocusId, Exercise[]> = {
  1: [
    {
      id: 'sigh',
      kind: 'breath',
      tag: 'Neurowissenschaft · Atem',
      title: 'Zyklisches Seufzen',
      minutes: 3,
      seconds: 171,
      cycles: 18,
      steps: SIGH_STEPS,
      why: 'In der Stanford-Studie hob diese Atmung die Stimmung stärker als Achtsamkeitsmeditation und senkte die Atemfrequenz in Ruhe. Geübt wurde 5 Minuten täglich.',
      source: SIGH_SOURCE,
    },
    {
      id: 'sss',
      kind: 'hold',
      tag: 'Stimmtraining · Atem',
      title: 'Atem für lange Sätze',
      minutes: 3,
      seconds: 180,
      steps: [
        'Kurz durch die Nase einatmen.',
        'Kreis halten und leise auf „{laut}“ ausatmen.',
        'Loslassen, wenn die Luft ausgeht. Nicht pressen.',
      ],
      why: 'Sinatra ging auf frühen Radioaufnahmen hörbar die Luft aus. Er trainierte gezielt seine Atemkontrolle und sang danach deutlich längere Phrasen.',
      source: 'Jazz History Online; Sinatra in LIFE (1965) über Tommy Dorsey',
    },
  ],
  2: [
    {
      id: 'att',
      kind: 'timer',
      tag: 'Psychologie · Metakognitive Therapie',
      title: 'Aufmerksamkeit lenken',
      minutes: 3,
      seconds: 180,
      steps: [
        'Blick auf einen Punkt. Minute 1: ein Geräusch halten.',
        'Minute 2: alle paar Sekunden zu einem anderen springen.',
        'Minute 3: alle Geräusche gleichzeitig hören.',
      ],
      phases: [
        { at: 0, label: 'Ein Geräusch halten' },
        { at: 60, label: 'Zwischen Geräuschen springen' },
        { at: 120, label: 'Alles gleichzeitig hören' },
      ],
      why: 'Trainiert, deine Aufmerksamkeit bewusst nach außen zu lenken, statt dich selbst zu beobachten. Genau das brauchst du mitten im Gespräch.',
      source: 'Adrian Wells, Univ. Manchester: Attention Training Technique (Kurzform, Original 12 Min.)',
    },
    {
      id: 'meditation',
      kind: 'timer',
      tag: 'Neurowissenschaft · Achtsamkeit',
      title: 'Atem-Meditation',
      minutes: 3,
      seconds: 180,
      steps: [
        '{anker}',
        'Abgeschweift? Tippe auf „Zurück zum Atem“.',
        'Sanft zurückkommen. Jede Rückkehr ist eine Wiederholung.',
      ],
      counterLabel: 'Zurück zum Atem',
      why: 'Nach einem Achtsamkeitstraining waren Menschen mit sozialer Angst weniger ängstlich und sahen sich positiver. Ihre Amygdala reagierte ruhiger auf negative Gedanken über sich selbst.',
      source: 'Goldin & Gross, Stanford, Emotion 2010',
    },
  ],
  3: [
    {
      id: 'units',
      kind: 'speak',
      tag: 'Sprecherziehung · Tempo',
      title: 'Lesen in Sinneinheiten',
      minutes: 3,
      seconds: 90,
      content: 'text',
      steps: [
        'Langsamer, als es sich richtig anfühlt.',
        'Bei jedem / kurz stoppen und nachatmen.',
        'Wortenden sauber, das Satzende sinkt.',
      ],
      why: 'Angst belegt einen Teil des Arbeitsgedächtnisses, der dann fürs Formulieren fehlt. Pausen an Sinngrenzen geben dir Zeit zum Atmen und Denken.',
      source: 'Eysenck u. a., Attentional Control Theory, Emotion 2007',
    },
    {
      id: 'clear',
      kind: 'speak',
      tag: 'Linguistik · Klare Sprache',
      title: 'Klar statt weich',
      minutes: 3,
      seconds: 60,
      content: 'clear',
      steps: [
        'Kein „irgendwie“, „vielleicht“ oder „ähm“.',
        'Jedes Satzende sinkt wie ein Punkt.',
        'Lieber kurz schweigen als füllen.',
      ],
      why: 'In Studien wirkten Sprecher mit Zögerlauten, Weichmachern und Frage-Betonung weniger überzeugend und weniger kompetent.',
      source: 'Erickson, Lind, Johnson & O’Barr, 1978',
    },
    {
      id: 'prep',
      kind: 'speak',
      tag: 'Rhetorik · Struktur',
      title: 'Gedanken ordnen',
      minutes: 3,
      seconds: 60,
      content: 'questions',
      steps: [
        'Punkt: deine Aussage in einem Satz.',
        'Grund und Beispiel: warum, was erlebt?',
        'Punkt: Aussage wiederholen. Fertig.',
      ],
      why: 'Die PREP-Struktur entlastet den Kopf. Du musst nicht überlegen, was als Nächstes kommt, nur noch, was du sagen willst.',
      source: 'Spontanrede-Training, z. B. „Table Topics“ bei Toastmasters',
    },
  ],
  4: [
    {
      id: 'sinatra',
      kind: 'speak',
      tag: 'Sinatra · Phrasierung',
      title: 'Sprechen wie Sinatra',
      minutes: 3,
      seconds: 90,
      content: 'textEmphasis',
      steps: [
        'Markiertes Wort länger und wärmer.',
        'Nach jedem Punkt innerlich „eins“ zählen.',
        'Sprich zu einer Person, nicht zu vielen.',
      ],
      why: 'Sinatra stellte den Text an erste Stelle: erst verstehen, dann entscheiden, wo betont und wo leise wird. Oft sang er minimal hinter dem Takt. Das klingt entspannt statt gehetzt.',
      source: 'Sinatra-Zitat in Elsewhere; Wikipedia: Frank Sinatra’s recorded legacy',
    },
    {
      id: 'melody',
      kind: 'speak',
      tag: 'Stimmforschung · Melodie',
      title: 'Melodie-Leiter',
      minutes: 3,
      seconds: 60,
      content: 'melody',
      steps: [
        '20 Sekunden summen, Ton gleiten lassen.',
        'Satz erst ganz flach, dann übertrieben.',
        'Dann halb so viel. Betonung auf den markierten Wörtern.',
      ],
      why: 'Ob eine Stimme lebendig und charismatisch wirkt, hängt stark an der Tonhöhe und ihrer Variation, am Tempo und an der Lautstärke. Studien zeigen: Charisma lässt sich trainieren.',
      source: 'Frontiers in Communication 2020; Antonakis u. a. 2011; Summen: Titze 2006',
    },
    {
      id: 'dj',
      kind: 'speak',
      tag: 'Praxis · FBI-Verhandlung',
      title: 'Ruhige Stimme',
      minutes: 3,
      seconds: 60,
      content: 'calm',
      steps: [
        'Etwas tiefer ansetzen, langsam, warm.',
        'Jedes Satzende sinkt nach unten.',
        'Leicht lächeln. Das hört man.',
      ],
      why: 'Der frühere FBI-Verhandler Chris Voss nutzt diese tiefe, langsame Stimme mit fallenden Satzenden, um angespannte Gespräche zu beruhigen.',
      source: 'Chris Voss, „Never Split the Difference“; CNBC 2020',
    },
  ],
};

// Missionen für den Alltag stehen mit allen Varianten in `examples.ts`.
export const MISSION_ROUTINE: { label: string; text: string }[] = [
  { label: 'Vorher', text: 'Zweimal seufzen, dann leise: „Ich bin aufgeregt.“' },
  { label: 'Dabei', text: 'Wenn ich abschweife, atme ich aus und schaue auf ein Detail vor mir.' },
  { label: 'Danach', text: 'Was hatte ich befürchtet, und was ist wirklich passiert?' },
];

export const MISSION_WHY = {
  why: 'Selbstvertrauen wächst am stärksten durch gemeisterte Erfahrungen. Du musst nicht warten, bis du dich bereit fühlst.',
  source: 'Bandura 1977; Brooks 2014; Gollwitzer 1999; Clark & Wells 1995',
};

export const OUTCOMES = [
  { id: 'better', label: 'Besser als befürchtet' },
  { id: 'expected', label: 'Wie erwartet' },
  { id: 'harder', label: 'Schwieriger als gedacht' },
  { id: 'notyet', label: 'Noch nicht gemacht' },
] as const;

export const CHECKIN_WHY = {
  why: 'Angst macht Vorhersagen. Hier sammelst du Beweise, ob sie stimmen.',
  source: 'Clark & Wells 1995: Verhaltensexperimente',
};

// Die ersten beiden Schritte der Moment-Hilfe. Der dritte, „Blick nach außen“, wechselt (examples.ts).
export const MOMENT_STEPS = ['Zweimal seufzen: doppelt ein, lang aus.', 'Leise sagen: „Ich bin aufgeregt.“'];

export const MOMENT_WHY = {
  why: 'Aufregung umdeuten statt unterdrücken: In Harvard-Studien schnitten Menschen damit beim Reden besser ab als mit dem Versuch, sich zu beruhigen.',
  source: 'Alison Wood Brooks, Harvard, 2014',
};

export const VOICE_STEPS = [
  'Hör dir die Aufnahme an wie eine fremde Person.',
  'Achte nur auf drei Dinge: Pausen, Satzenden, Tempo.',
  'Merk dir einen Punkt fürs nächste Mal.',
];

export const VOICE_WHY = {
  why: 'Wie wir uns fühlen und wie wir klingen, liegt oft weit auseinander. Aufnahmen zeigen dir die Wirklichkeit statt das Kopfkino.',
  source: 'Clark & Wells: Video-Feedback in der Therapie sozialer Angst',
};

// Bühne: Auftritt vor einem vorgestellten Publikum. Die Themen stehen in `examples.ts`.
export const STAGE_SECONDS = 60;

export const STAGE_WHY = {
  why: 'Menschen reagieren sogar auf ein rein virtuelles Publikum, als wäre es echt. Darum wirkt das Üben vor vorgestellten Zuhörern. Entscheidend ist der Vergleich: Was hast du befürchtet, und was ist passiert?',
  source: 'Slater, Pertaub & Steed 1999; Craske u. a. 2014; Skala 0–10 nach Wolpe 1969',
};

export interface SourceItem {
  who: string;
  what: string;
  url: string;
}

export const SOURCE_GROUPS: { title: string; items: SourceItem[] }[] = [
  {
    title: 'Neurowissenschaft',
    items: [
      {
        who: 'Balban, Spiegel, Huberman u. a. (2023)',
        what: 'Zyklisches Seufzen: 5 Minuten täglich hoben die Stimmung stärker als Achtsamkeitsmeditation und senkten die Atemfrequenz in Ruhe. Cell Reports Medicine.',
        url: 'https://doi.org/10.1016/j.xcrm.2022.100895',
      },
      {
        who: 'Goldin & Gross (2010)',
        what: 'Achtsamkeitstraining bei sozialer Angst: weniger Angst, besseres Selbstbild, ruhigere Amygdala bei negativen Gedanken über sich selbst. Emotion.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20141305/',
      },
    ],
  },
  {
    title: 'Psychologie & Psychotherapie',
    items: [
      {
        who: 'Clark & Wells (1995)',
        what: 'Kognitives Modell sozialer Angst: Selbstbeobachtung und Sicherheitsverhalten halten die Angst aufrecht. Behandlung mit Video-Feedback, Fokus nach außen und Verhaltensexperimenten.',
        url: 'https://www.sciencedirect.com/science/article/pii/S1077722916300232',
      },
      {
        who: 'Wells: Attention Training Technique',
        what: 'Übersichtsarbeit zur Wirksamkeit des Aufmerksamkeitstrainings (Knowles, Foden, El-Deredy & Wells).',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27129094/',
      },
      {
        who: 'Eysenck, Derakshan, Santos & Calvo (2007)',
        what: 'Attentional Control Theory: Angst bindet Kapazität im Arbeitsgedächtnis. Emotion.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17516812/',
      },
      {
        who: 'Brooks (2014)',
        what: '„Ich bin aufgeregt“ statt „Ich bin ruhig“: bessere Leistung beim Singen, Reden und Rechnen. Journal of Experimental Psychology: General.',
        url: 'https://www.hbs.edu/faculty/Pages/item.aspx?num=45869',
      },
      {
        who: 'Gollwitzer (1999)',
        what: 'Wenn-Dann-Pläne helfen, Vorsätze im entscheidenden Moment umzusetzen. American Psychologist.',
        url: 'https://www.socmot.uni-konstanz.de/publications/implementation-intentions-strong-effects-simple-plans',
      },
      {
        who: 'Craske u. a. (2014)',
        what: 'Exposition wirkt über verletzte Erwartungen: Je größer der Unterschied zwischen Befürchtung und Wirklichkeit, desto mehr lernt das Gehirn. Behaviour Research and Therapy.',
        url: 'https://nationalsocialanxietycenter.com/research-summaries/inhibitory-learning-in-exposure-therapy-for-social-anxiety-and-other-anxiety-related-disorders/',
      },
      {
        who: 'Slater, Pertaub & Steed (1999)',
        what: 'Menschen reagieren auf ein freundliches oder ablehnendes Publikum, selbst wenn es rein virtuell ist.',
        url: 'https://www.baillement.com/dossier/slater.public.speaking.pdf',
      },
      {
        who: 'Wolpe (1969)',
        what: 'Die Skala von 0 bis 10 für erlebte Belastung (SUDS), Standard in der Expositionstherapie.',
        url: 'https://en.wikipedia.org/wiki/Subjective_units_of_distress_scale',
      },
      {
        who: 'Bandura (1977)',
        what: 'Selbstwirksamkeit: Gemeisterte Erfahrungen stärken das Zutrauen am meisten. Psychological Review.',
        url: 'https://longevity.stanford.edu/self-efficacy-toward-a-unifying-theory-of-behavior-change/',
      },
    ],
  },
  {
    title: 'Sprache & Stimme',
    items: [
      {
        who: 'Erickson, Lind, Johnson & O’Barr (1978)',
        what: 'Zögerlaute, Weichmacher und Frage-Betonung senken die Glaubwürdigkeit von Sprechern.',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/002210317890015X',
      },
      {
        who: 'Frontiers in Communication (2020)',
        what: 'Stimmliches Charisma hängt vor allem an Tonhöhe und ihrer Variation, am Tempo und an der Lautstärke.',
        url: 'https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2020.611555/full',
      },
      {
        who: 'Antonakis, Fenley & Liechti (2011)',
        what: 'Kann man Charisma lernen? Zwei Trainingsstudien. Academy of Management Learning & Education.',
        url: 'https://doi.org/10.5465/amle.2010.0012',
      },
      {
        who: 'Titze (2006)',
        what: 'Stimmtraining mit halb geschlossenem Vokaltrakt, zum Beispiel Summen. Journal of Speech, Language, and Hearing Research.',
        url: 'https://pubs.asha.org/doi/full/10.1044/1092-4388(2006/035)',
      },
    ],
  },
  {
    title: 'Praxis',
    items: [
      {
        who: 'Chris Voss, früher FBI-Verhandler',
        what: 'Die „Late-Night-FM-DJ“-Stimme: tief, langsam, warm, mit fallenden Satzenden.',
        url: 'https://www.cnbc.com/2020/01/07/ex-fbi-negotiator-chris-voss-how-to-negotiate.html',
      },
      {
        who: 'Sinatra über Tommy Dorsey',
        what: 'Lange Phrasen durch Atemkontrolle, abgeschaut beim Posaunisten Tommy Dorsey.',
        url: 'https://www.jerryjazzmusician.com/great-encounters-21-the-influence-of-tommy-dorsey-on-frank-sinatra/',
      },
      {
        who: 'Sinatra: „The written word is first“',
        what: 'Erst den Text verstehen, dann Betonung und Timing wählen, oft minimal hinter dem Takt.',
        url: 'https://elsewhere.co.nz/essentialelsewhere/2827/frank-sinatra-in-the-wee-small-hours-1955',
      },
      {
        who: 'Sinatra im Radio',
        what: 'Auf frühen Aufnahmen geht ihm hörbar die Luft aus. Danach werden seine Phrasen deutlich länger.',
        url: 'https://jazzhistoryonline.com/frank-sinatra-radio/',
      },
    ],
  },
];
