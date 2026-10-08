import { useEffect, useState } from 'react';
import { DEFAULT_FOCUS, type FocusId } from './content';
import type { MissionDef } from './examples';
import { addMoment, addStage, completeSession, setOutcome, type Outcome } from './lib/progress';
import { useProgress } from './lib/store';
import { LayoutContext, useViewport } from './lib/layout';
import { buildSession, sessionMinutes, type Step } from './session';
import { Background, PhoneShell } from './components/ui';
import { InstallSheet } from './components/InstallSheet';
import { FocusScreen } from './screens/FocusScreen';
import { SessionScreen } from './screens/SessionScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { StageScreen } from './screens/StageScreen';
import { MomentSheet, SourcesSheet, VoiceSheet } from './screens/Sheets';

type Screen =
  | { name: 'focus' }
  | { name: 'session'; steps: Step[]; focus: FocusId[]; minutes: number }
  | { name: 'overview'; mode: 'done' | 'browse'; minutes: number }
  | { name: 'stage' };

type Sheet = 'voice' | 'moment' | 'sources' | null;

// Ab dieser Breite steht die App im Handy-Rahmen, darunter füllt sie den Bildschirm.
const FRAME_MIN_WIDTH = 440;

export default function App() {
  const viewport = useViewport();
  const compact = viewport.w < FRAME_MIN_WIDTH;
  const short = compact && viewport.h < 720;
  const scale = compact ? 1 : Math.max(0.55, Math.min(1, (viewport.h - 40) / 802, (viewport.w - 32) / 397));

  const { progress, update, sync } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'focus' });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('is-compact', compact);
  }, [compact]);

  const show = (next: Screen) => {
    setSheet(null);
    setScreen(next);
    setNonce((n) => n + 1);
  };

  const initialFocus: FocusId[] = progress.focus.length ? (progress.focus as FocusId[]) : DEFAULT_FOCUS;

  const startSession = (focus: FocusId[]) => {
    const steps = buildSession(focus, progress);
    show({ name: 'session', steps, focus, minutes: sessionMinutes(steps) });
  };

  const finishSession = (mission: MissionDef, existingId: string | null, minutes: number, focus: FocusId[]) => {
    update((p) => completeSession(p, minutes, mission, focus, existingId));
    show({ name: 'overview', mode: 'done', minutes });
  };

  return (
    <LayoutContext.Provider value={{ compact, short }}>
      <main className={compact ? 'h-full' : 'flex min-h-full items-center justify-center px-4 py-5'}>
        <PhoneShell compact={compact} scale={scale}>
          <Background />

          {screen.name === 'focus' && (
            <FocusScreen
              key={nonce}
              initial={initialFocus}
              minutesFor={(focus) => sessionMinutes(buildSession(focus, progress))}
              onStart={startSession}
              onVoice={() => setSheet('voice')}
              onOverview={() => show({ name: 'overview', mode: 'browse', minutes: 0 })}
              onStage={() => show({ name: 'stage' })}
            />
          )}

          {screen.name === 'session' && (
            <SessionScreen
              key={nonce}
              steps={screen.steps}
              bestExhale={progress.bestExhale}
              onOutcome={(id: string, outcome: Outcome) => update((p) => setOutcome(p, id, outcome))}
              onBest={(seconds) => {
                if (seconds > progress.bestExhale) update((p) => ({ ...p, bestExhale: Math.max(p.bestExhale, seconds) }));
              }}
              onExit={() => show({ name: 'focus' })}
              onFinish={(mission, existingId) => finishSession(mission, existingId, screen.minutes, screen.focus)}
            />
          )}

          {screen.name === 'overview' && (
            <OverviewScreen
              key={nonce}
              mode={screen.mode}
              minutes={screen.minutes}
              progress={progress}
              sync={sync}
              onMoment={() => setSheet('moment')}
              onMoments={(delta) => update((p) => addMoment(p, delta))}
              onSources={() => setSheet('sources')}
              onClose={() => show({ name: 'focus' })}
            />
          )}

          {screen.name === 'stage' && (
            <StageScreen
              key={nonce}
              progress={progress}
              onSave={(entry) => update((p) => addStage(p, entry))}
              onTraining={() => show({ name: 'focus' })}
              onOverview={() => show({ name: 'overview', mode: 'browse', minutes: 0 })}
              onSources={() => setSheet('sources')}
            />
          )}

          {__PWA__ && screen.name === 'focus' && sheet === null && <InstallSheet />}

          {sheet === 'voice' && <VoiceSheet onClose={() => setSheet(null)} />}
          {sheet === 'moment' && <MomentSheet onClose={() => setSheet(null)} />}
          {sheet === 'sources' && <SourcesSheet onClose={() => setSheet(null)} />}
        </PhoneShell>
      </main>
    </LayoutContext.Provider>
  );
}
