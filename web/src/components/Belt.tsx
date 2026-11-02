import { MACHINE_ORDER } from '../sim/machines';
import type { Session } from '../sim/session';

/** 컨베이어. 공정 중인 카드가 진행률에 맞춰 이동 */
export function Belt({ session }: { session: Session }) {
  const idx = session.current ? MACHINE_ORDER.indexOf(session.current) : -1;
  const pos = idx >= 0 ? ((idx + session.progress[MACHINE_ORDER[idx]] / 100) / MACHINE_ORDER.length) * 100 : null;
  return (
    <div className={`belt ${session.running && !session.stalled ? 'on' : ''}`}>
      {pos !== null && <span className="workpiece" style={{ left: `${pos}%`, transform: `translateX(-${pos}%)` }} />}
    </div>
  );
}
