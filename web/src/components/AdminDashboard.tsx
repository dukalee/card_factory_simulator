import { useEffect, useReducer } from 'react';
import { MACHINE_ORDER, NORMAL_PROCESS_TIME, type Machine, type MachineName } from '../sim/machines';
import type { ControlAction, Session } from '../sim/session';

type Tone = 'ok' | 'bad' | 'warn';
interface Row {
  label: string;
  value: string;
  tone: Tone;
  hint?: string;
  /** 이 항목을 고치는 컨트롤 (문제가 있을 때만 수리 버튼으로 표시) */
  fix?: { action: ControlAction; label: string };
}

const MACHINE_INFO: Record<MachineName, { ko: string; icon: string }> = {
  InkMachine: { ko: '잉크 프린팅', icon: '🎨' },
  HoloMachine: { ko: '홀로그램 부착', icon: '🌈' },
  LogoMachine: { ko: '보안 마킹', icon: '🔒' },
  CuttingMachine: { ko: '커팅', icon: '✂️' },
};

/** 머신 하나의 점검 항목을 사람이 읽을 수 있는 문장으로 변환 */
function buildRows(name: MachineName, m: Machine): Row[] {
  const rows: Row[] = [
    m.fb === 1
      ? { label: '이물질', value: '없음', tone: 'ok' }
      : { label: '이물질', value: '감지됨', tone: 'bad', hint: '제거하면 다시 가동 가능', fix: { action: 'repair', label: '정비' } },
    m.oil === 1
      ? { label: '윤활유', value: '충분', tone: 'ok' }
      : { label: '윤활유', value: '부족', tone: 'bad', hint: '보충하면 공정 시간도 정상으로', fix: { action: 'oil', label: '윤활' } },
    // 대시보드에는 정상/지연만 표시 (정확한 소요 시간은 이벤트 로그에 기록됨)
    m.processTime <= NORMAL_PROCESS_TIME
      ? { label: '공정 시간', value: '정상', tone: 'ok' }
      : { label: '공정 시간', value: '지연', tone: 'warn', hint: '윤활유를 수리하면 정상으로' },
  ];
  if (name === 'InkMachine') {
    rows.push(
      m.ink === 1
        ? { label: '잉크', value: '충분', tone: 'ok' }
        : { label: '잉크', value: '부족', tone: 'bad', hint: '흑백 카드가 생성됨', fix: { action: 'extra', label: '잉크 추가' } },
    );
  } else if (name === 'HoloMachine') {
    rows.push(
      m.filled === 1
        ? { label: '홀로그램 시트', value: '있음', tone: 'ok' }
        : { label: '홀로그램 시트', value: '없음', tone: 'bad', hint: '홀로 없는 카드가 생성됨', fix: { action: 'extra', label: '시트 추가' } },
    );
  } else if (name === 'LogoMachine') {
    rows.push(
      m.loc === 1
        ? { label: '마킹 위치', value: '정상', tone: 'ok' }
        : { label: '마킹 위치', value: '어긋남', tone: 'bad', hint: '로고가 누락/이탈됨', fix: { action: 'extra', label: '조정' } },
    );
  } else {
    rows.push(
      m.loc === 1
        ? { label: '커팅 위치', value: '정상', tone: 'ok' }
        : { label: '커팅 위치', value: '어긋남', tone: 'bad', hint: '커팅이 이탈됨', fix: { action: 'extra', label: '위치 조정' } },
    );
  }
  return rows;
}

/** 지금 이 머신이 하고 있는 일 */
function runState(session: Session, name: MachineName): { text: string; tone: Tone } {
  if (session.stalled === name) return { text: '정지 · 응답 없음', tone: 'bad' };
  if (session.current === name) return { text: '공정 중', tone: 'ok' };
  return session.running ? { text: '대기', tone: 'warn' } : { text: '정지', tone: 'warn' };
}

export function AdminDashboard({ session, onClose }: { session: Session; onClose: () => void }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const data = MACHINE_ORDER.map((name) => {
    const m = session.machines[name];
    const rows = buildRows(name, m);
    return { name, m, rows, issues: rows.filter((r) => r.tone === 'bad').length };
  });
  const healthy = data.filter((d) => d.issues === 0).length;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal admin">
        <div className="modal-title">
          🛡 Admin Dashboard · 머신 점검
          <button className="btn-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="ad-summary">
          <div className={`ad-sum ${healthy === data.length ? 'ok' : 'bad'}`}>
            <small>정상 머신</small>
            <b>
              {healthy} / {data.length}
            </b>
          </div>
          <div className={`ad-sum ${session.running ? 'ok' : 'warn'}`}>
            <small>시뮬레이션</small>
            <b>{session.running ? '실행 중' : '정지'}</b>
          </div>
          <div className={`ad-sum wide ${session.error ? 'bad' : 'ok'}`}>
            <small>현재 오류</small>
            <b>{session.error || '없음'}</b>
          </div>
        </div>

        <div className="ad-grid">
          {data.map(({ name, m, rows, issues }) => {
            const rs = runState(session, name);
            return (
              <article className={`ad-machine ${issues ? 'has-issue' : ''}`} key={name}>
                <header>
                  <span className="ad-ico" aria-hidden="true">
                    {MACHINE_INFO[name].icon}
                  </span>
                  <div className="ad-name">
                    <b>{MACHINE_INFO[name].ko}</b>
                    <small>{name}</small>
                  </div>
                  <span className={`ad-badge ${rs.tone}`}>{rs.text}</span>
                </header>
                <div className="ad-pw">
                  <span>비밀번호</span>
                  <code>{m.password || '----'}</code>
                </div>
                <ul>
                  {rows.map((r) => (
                    <li key={r.label}>
                      <span className={`ad-dot ${r.tone}`} />
                      <span className="ad-label">{r.label}</span>
                      <span className="ad-value">
                        <b className={r.tone}>{r.value}</b>
                        {r.hint && <small>{r.hint}</small>}
                      </span>
                      {r.fix && r.tone !== 'ok' ? (
                        <button
                          className="btn btn-green ad-repair"
                          onClick={() => r.fix && session.control(name, r.fix.action, r.fix.label)}
                          title={`${r.label} 수리`}
                        >
                          🔧 수리
                        </button>
                      ) : (
                        <span />
                      )}
                    </li>
                  ))}
                </ul>
                <footer className={issues ? 'bad' : 'ok'}>{issues ? `점검 필요 ${issues}건` : '이상 없음'}</footer>
              </article>
            );
          })}
        </div>

        <div className="ad-actions">
          <button className="btn btn-green ad-fix" onClick={() => session.fixAll()}>
            🔧 모든 머신 정상 복구 (Fix All)
          </button>
          <button className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
