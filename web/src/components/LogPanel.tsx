import { useLayoutEffect, useRef } from 'react';
import { download } from '../download';
import { formatClock, type Severity } from '../sim/logger';
import type { Session } from '../sim/session';

const SEV_LABEL: Record<Severity, string> = { crit: 'CRIT', warn: 'WARN', info: 'INFO' };
const STICK_THRESHOLD = 40; // 맨 아래에서 이 px 이내면 새 로그를 따라 내려감

/** 이벤트 로그. 시간순으로 계속 쌓이고, 맨 아래를 보고 있으면 자동으로 따라 내려간다 */
export function LogPanel({ session }: { session: Session }) {
  const entries = session.logger.entries;
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  };

  const lastStart = entries.map((e) => e.text).lastIndexOf('시뮬레이션 시작');
  const issues = (lastStart >= 0 ? entries.slice(lastStart) : entries).filter((e) => e.sev !== 'info').length;

  return (
    <section className="panel log-panel">
      <h2>
        <span>이벤트 로그</span>
        <span className="log-meta">
          <span className={issues ? 'txt-err' : 'txt-mute'}>{issues ? `● ${issues} 경고` : '이상 없음'}</span>
          <span className="txt-mute">{entries.length}건</span>
          <button className="link" onClick={() => download('log.txt', session.logger.toText())}>
            log.txt 저장
          </button>
        </span>
      </h2>
      <div className="log-list" ref={listRef} onScroll={onScroll}>
        {entries.length === 0 ? (
          <p className="empty">아직 이벤트가 없습니다. START 를 눌러 시작하세요.</p>
        ) : (
          entries.map((e, i) => (
            <div className={`log-row ${e.sev}`} key={`${e.time}-${i}`}>
              <time>{formatClock(e.time)}</time>
              <span className={`sev ${e.sev}`}>{SEV_LABEL[e.sev]}</span>
              <span>{e.text}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
