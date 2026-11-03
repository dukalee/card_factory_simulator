import { MACHINE_ORDER, type MachineName } from '../sim/machines';
import type { Session } from '../sim/session';

const INFO: Record<MachineName, { key: string; ko: string; image: string }> = {
  InkMachine: { key: 'INK MACHINE', ko: '잉크 프린팅', image: 'step1_cmyk' },
  HoloMachine: { key: 'HOLO MACHINE', ko: '홀로그램 부착', image: 'step2_hologram' },
  LogoMachine: { key: 'LOGO MACHINE', ko: '보안 마킹', image: 'step3_security_marking' },
  CuttingMachine: { key: 'CUTTING MACHINE', ko: '커팅', image: 'step4_cutting' },
};

type StationState = 'stalled' | 'working' | 'done' | 'idle';

/** 화면에 보이는 증상만으로 상태를 판단 (고장 원인은 Admin 에서만 확인 가능) */
function stateOf(session: Session, name: MachineName): StationState {
  if (session.stalled === name) return 'stalled';
  if (session.current === name) return 'working';
  if (session.running && session.progress[name] >= 100) return 'done';
  return 'idle';
}

const LABEL: Record<StationState, string> = { stalled: '정지 · 응답 없음', working: '공정 중', done: '완료', idle: '대기' };

export function StationCard({ session, name }: { session: Session; name: MachineName }) {
  const { key, ko, image } = INFO[name];
  const idx = MACHINE_ORDER.indexOf(name) + 1;
  const state = stateOf(session, name);
  const pct = session.progress[name];

  return (
    <button
      type="button"
      className={`station ${state} ${session.selected === name ? 'selected' : ''}`}
      onClick={() => session.selectMachine(name)}
      aria-pressed={session.selected === name}
    >
      <div className="station-head">
        <span className="lamp" />
        <span>
          {idx}. {key}
        </span>
      </div>
      <img src={`${import.meta.env.BASE_URL}images/process/${image}.webp`} alt={`${ko} 공정`} draggable={false} />
      <div className="station-row">
        <div className="ring" style={{ ['--p' as string]: state === 'stalled' ? 100 : pct }} data-t={state === 'stalled' ? '!' : `${pct}%`} />
        <div className="station-text">
          <b>{ko}</b>
          <small>{LABEL[state]}</small>
        </div>
      </div>
    </button>
  );
}
