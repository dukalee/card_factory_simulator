import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { download } from '../download';
import { MACHINE_ORDER } from '../sim/machines';
import type { Session } from '../sim/session';
import { AdminDashboard } from './AdminDashboard';
import { WRONG_ACCEPT_PENALTY } from '../sim/session';
import { Belt } from './Belt';
import { useDialog } from './Dialog';
import { LogPanel } from './LogPanel';
import { ManualView } from './ManualView';
import { MaintenancePanel } from './MaintenancePanel';
import { ProductionPanel } from './ProductionPanel';
import { Scoreboard } from './Scoreboard';
import { StationCard } from './StationCard';

const ADMIN_PASSWORD = 'rootroot';

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

  // 단축키: Tab = 정비 패널 열기/닫기, Esc = 닫기 (입력창/대화상자가 열려 있을 땐 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (document.querySelector('.modal-backdrop')) return;
      if (e.key === 'Tab') {
        e.preventDefault(); // 기본 포커스 이동 대신 패널 토글
        setMaintOpen((o) => !o);
      } else if (e.key === 'Escape') setMaintOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onAdmin = async () => {
    const pw = await promptPassword('Admin 비밀번호를 입력하세요.', 'Admin Dashboard');
    if (pw === null) return;
    if (pw === ADMIN_PASSWORD) setAdminOpen(true);
    else await alert('비밀번호가 틀렸습니다.', '오류', 'error');
  };

  const onGoTitle = async () => {
    setMenuOpen(false);
    if (session.running) {
      await alert('시뮬레이션 실행 중에는 타이틀로 이동할 수 없습니다.\nSTOP 후 시도하세요.');
      return;
    }
    const ok = await confirm('타이틀 화면으로 이동합니다.\n진행 중인 게임은 종료됩니다.\n이동하시겠습니까?', '타이틀로 이동');
    if (ok) onQuit();
  };

  const onReset = async () => {
    setMenuOpen(false);
    if (session.running) {
      await alert('시뮬레이션 실행 중에는 초기화할 수 없습니다.\nSTOP 후 시도하세요.');
      return;
    }
    const ok = await confirm(
      '로그를 초기화하고, 매뉴얼을 새로 작성하며, 생성된 카드를 모두 삭제합니다.\n계속하시겠습니까?',
      'Reset',
    );
    if (!ok) return;
    session.reset();
    await alert('초기화 완료.', 'Reset');
  };

  const statusError = session.status.startsWith('[');

  return (
    <div className="app">
      <section className="hero theme-dark">
        <div className="topbar">
          <h1>CARD FACTORY SIMULATOR</h1>
          <Andon session={session} />
          <span className="chip">
            MODE <b className={session.running ? 'txt-ok' : 'txt-warn'}>{session.running ? 'RUNNING' : 'STOPPED'}</b>
          </span>
          <span className="sp" />
          <Scoreboard session={session} />
          <button className="btn btn-admin tall" onClick={onAdmin} title="관리자 대시보드 (비밀번호 필요)">
            🛡 Admin<span className="adm-long"> Dashboard</span>
          </button>
          <button className="btn btn-manual tall" onClick={() => setManualOpen(true)} title="게임 매뉴얼 열기">
            📖 매뉴얼
          </button>
          <button className="btn btn-green tall" onClick={() => session.start()} disabled={session.running || session.finished}>
            ▶ START
          </button>
          <button className="btn btn-red tall" onClick={() => session.stop()} disabled={!session.running}>
            ■ STOP
          </button>
          <div className="top-menu" ref={menuRef}>
            <button className="btn btn-menu tall" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
              ☰ Menu
            </button>
            {menuOpen && (
              <div className="menu-list top-menu-list">
                <button onClick={onGoTitle}>🏠 타이틀로 이동</button>
                <hr />
                <button onClick={onReset}>↺ Reset</button>
              </div>
            )}
          </div>
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

        <div className="status-row">
          <div className={`status-line ${statusError ? 'err' : ''}`}>
            {session.finished
              ? '🏁 목표 달성!'
              : session.status}
          </div>
        </div>
      </section>

      <section className="lower theme-light">
        <div className="maint-dock">
          <button
            className={`drawer-handle ${maintOpen ? 'open' : ''}`}
            onClick={() => setMaintOpen((o) => !o)}
            aria-expanded={maintOpen}
            title="정비 패널 열기/닫기 (Tab)"
          >
            <span className="dh-ico" aria-hidden="true">
              🔧
            </span>
            <span className="chev">{maintOpen ? '‹' : '›'}</span>
            <span className="lbl">정비</span>
            <kbd className="dh-key">Tab</kbd>
          </button>
        </div>
        <div className="drawer-clip">
          <aside className={`drawer maint-col panel ${maintOpen ? 'open' : ''}`} aria-hidden={!maintOpen} inert={!maintOpen}>
            <MaintenancePanel session={session} active={maintOpen} />
          </aside>
        </div>
        <LogPanel session={session} />
        <div className="prod-wrap">
          <ProductionPanel session={session} />
        </div>
      </section>

      <footer className="app-footer">© 2026 aishift. All rights reserved.</footer>

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
              📖 매뉴얼
              <button className="btn-close" onClick={() => setManualOpen(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="manual-body">
              <ManualView text={session.manualText} />
            </div>
            <div className="manual-foot">
              <button className="btn btn-blue" onClick={() => download('manual.txt', session.manualText)}>
                ⬇ 매뉴얼 다운로드 (manual.txt)
              </button>
              <button className="btn" onClick={() => setManualOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
