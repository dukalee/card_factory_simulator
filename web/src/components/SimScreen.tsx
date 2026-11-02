import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { download } from '../download';
import { MACHINE_ORDER } from '../sim/machines';
import type { Session } from '../sim/session';
import { AdminDashboard } from './AdminDashboard';
import { GOAL_NORMAL_CARDS, WRONG_ACCEPT_PENALTY } from '../sim/session';
import { Belt } from './Belt';
import { useDialog } from './Dialog';
import { LogPanel } from './LogPanel';
import { MaintenancePanel } from './MaintenancePanel';
import { ProductionPanel } from './ProductionPanel';
import { Scoreboard } from './Scoreboard';
import { StationCard } from './StationCard';

const ADMIN_PASSWORD = 'rootroot';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="chip mono">{now.toTimeString().slice(0, 8)}</span>;
}

/** 안돈 타워: 빨강=정지(응답 없음) / 노랑=대기 / 초록=가동 */
function Andon({ session }: { session: Session }) {
  const red = session.stalled !== null;
  const green = session.running && !red;
  const yellow = !session.running;
  return (
    <div className="tower h" title={red ? '정지' : green ? '가동 중' : '대기'}>
      <i className={red ? 'r' : ''} />
      <i className={yellow ? 'y' : ''} />
      <i className={green ? 'g' : ''} />
    </div>
  );
}

export function SimScreen({ session, onQuit }: { session: Session; onQuit: () => void }) {
  useSyncExternalStore(session.subscribe, session.getVersion);
  const { alert, confirm, promptPassword } = useDialog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [maintOpen, setMaintOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  // 목표(정상 카드 10장 합격)를 달성하면 결과 창을 띄운다
  useEffect(() => {
    if (session.finished) setResultOpen(true);
  }, [session.finished]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  // 단축키: M = 정비 서랍 열기/닫기, Esc = 닫기 (입력창/대화상자가 열려 있을 땐 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (document.querySelector('.modal-backdrop')) return;
      if (e.code === 'KeyM') setMaintOpen((o) => !o); // e.code: 한/영 자판과 무관
      else if (e.key === 'Escape') setMaintOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onAdmin = async () => {
    setMenuOpen(false);
    const pw = await promptPassword('Admin 비밀번호를 입력하세요.', 'Admin Dashboard');
    if (pw === null) return;
    if (pw === ADMIN_PASSWORD) setAdminOpen(true);
    else await alert('비밀번호가 틀렸습니다.', '오류', 'error');
  };

  const onReset = async () => {
    setMenuOpen(false);
    if (session.running) {
      await alert('시뮬레이션 실행 중에는 초기화할 수 없습니다.\nSTOP 후 시도하세요.');
      return;
    }
    const ok = await confirm(
      '로그를 초기화하고, 매뉴얼을 새로 작성하며, 생성된 카드 이미지를 모두 삭제합니다.\n계속하시겠습니까?',
      'Reset',
    );
    if (!ok) return;
    session.reset();
    await alert('초기화 완료.', 'Reset');
  };

  const onQuitClick = async () => {
    setMenuOpen(false);
    if (session.running) {
      await alert('시뮬레이션 실행 중에는 나갈 수 없습니다.\nSTOP 후 시도하세요.');
      return;
    }
    onQuit();
  };

  const closeAnd = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  const statusError = session.status.startsWith('[');

  return (
    <div className="app">
      <section className="hero theme-dark">
        <div className="topbar">
          <h1>CARD FACTORY · LINE-01</h1>
          <Andon session={session} />
          <span className="chip">
            MODE <b className={session.running ? 'txt-ok' : 'txt-warn'}>{session.running ? 'RUNNING' : 'STOPPED'}</b>
          </span>
          <Clock />
          <div className="file-menu" ref={menuRef}>
            <button className="btn" onClick={() => setMenuOpen((o) => !o)}>
              File ▾
            </button>
            {menuOpen && (
              <div className="menu-list">
                <button onClick={onAdmin}>Admin</button>
                <button onClick={closeAnd(() => download('manual.txt', session.manualText))}>manual.txt 저장</button>
                <button onClick={closeAnd(() => download('log.txt', session.logger.toText()))}>log.txt 저장</button>
                <hr />
                <button onClick={onReset}>Reset</button>
                <hr />
                <button onClick={onQuitClick}>Quit</button>
              </div>
            )}
          </div>
          <span className="sp" />
          <button className="btn" onClick={() => setManualOpen(true)}>
            📖 매뉴얼
          </button>
          <button className="btn btn-green" onClick={() => session.start()} disabled={session.running || session.finished}>
            ▶ START
          </button>
          <button className="btn btn-red" onClick={() => session.stop()} disabled={!session.running}>
            ■ STOP
          </button>
        </div>

        <div className="status-row">
          <div className={`status-line ${statusError ? 'err' : ''}`}>
            {session.finished
              ? '🏁 목표 달성!'
              : session.status || `대기 중 — START 를 누르면 시작합니다. 정상 카드 ${GOAL_NORMAL_CARDS}장을 가장 빨리 합격 처리하세요.`}
          </div>
          <Scoreboard session={session} />
        </div>

        <div className="stations">
          {MACHINE_ORDER.map((n) => (
            <StationCard key={n} session={session} name={n} />
          ))}
        </div>
        <div className="drops">
          {MACHINE_ORDER.map((n) => (
            <i key={n} />
          ))}
        </div>
        <Belt session={session} />
      </section>

      <section className="lower theme-light">
        <div className="prod-wrap">
          <ProductionPanel session={session} />
          <aside className={`drawer panel ${maintOpen ? 'open' : ''}`} aria-hidden={!maintOpen} inert={!maintOpen}>
            <MaintenancePanel session={session} active={maintOpen} />
          </aside>
          <button
            className={`drawer-handle ${maintOpen ? 'open' : ''}`}
            onClick={() => setMaintOpen((o) => !o)}
            aria-expanded={maintOpen}
            title="정비 패널 열기/닫기 (M)"
          >
            <span className="chev">{maintOpen ? '‹' : '›'}</span>
            <span className="lbl">정비 (M)</span>
          </button>
        </div>
        <LogPanel session={session} />
      </section>

      {resultOpen && (
        <div className="modal-backdrop">
          <div className="modal result">
            <div className="modal-title">🏁 목표 달성!</div>
            <div className="result-score">
              <small>최종 점수 (낮을수록 좋음)</small>
              <b className="mono">{session.score()}</b>
            </div>
            <table className="result-table">
              <tbody>
                <tr>
                  <td>소요 시간</td>
                  <td>{session.elapsedSeconds()}초</td>
                </tr>
                <tr>
                  <td>오합격 (불량을 합격 처리)</td>
                  <td>
                    {session.wrongAccepts}회 · +{session.wrongAccepts * WRONG_ACCEPT_PENALTY}점
                  </td>
                </tr>
                <tr>
                  <td>생산한 카드</td>
                  <td>{session.cards.length}장</td>
                </tr>
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setResultOpen(false)}>
                닫기
              </button>
              <button
                className="btn btn-green"
                onClick={() => {
                  setResultOpen(false);
                  onQuit();
                }}
              >
                새 게임
              </button>
            </div>
          </div>
        </div>
      )}
      {adminOpen && <AdminDashboard session={session} onClose={() => setAdminOpen(false)} />}
      {manualOpen && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setManualOpen(false)}>
          <div className="modal manual">
            <div className="modal-title">
              manual.txt
              <button className="btn-close" onClick={() => setManualOpen(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <pre className="manual-text">{session.manualText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
