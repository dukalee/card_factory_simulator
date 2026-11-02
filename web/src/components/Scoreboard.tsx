import { useEffect, useReducer, useRef, useState } from 'react';
import { GOAL_NORMAL_CARDS, WRONG_ACCEPT_PENALTY, type Session } from '../sim/session';

function mmss(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

/** 점수 칸: 시작 후 초당 1점씩 계속 오르고(STOP 중에도), 불량 카드를 합격 처리하면 +10점. 낮을수록 좋다 */
export function Scoreboard({ session }: { session: Session }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const [penalty, setPenalty] = useState(false);
  const prevWrong = useRef(session.wrongAccepts);

  // 점수가 올라가는 동안 화면을 주기적으로 갱신
  const ticking = session.startedAt !== null && !session.finished;
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [ticking]);

  // 오합격 +10 알림
  useEffect(() => {
    if (session.wrongAccepts > prevWrong.current) {
      setPenalty(true);
      const id = setTimeout(() => setPenalty(false), 1300);
      prevWrong.current = session.wrongAccepts;
      return () => clearTimeout(id);
    }
    prevWrong.current = session.wrongAccepts;
  }, [session.wrongAccepts]);

  const { goodAccepts, wrongAccepts } = session;
  return (
    <div className={`scoreboard ${session.finished ? 'done' : ''}`}>
      <div className="score-main">
        <small>점수 (낮을수록 좋음)</small>
        <b className="mono">{session.score()}</b>
        {penalty && <span className="penalty">+{WRONG_ACCEPT_PENALTY}</span>}
      </div>
      <div className="score-info">
        <div className="goal">
          <span>
            정상 합격 <b>{goodAccepts}</b>/{GOAL_NORMAL_CARDS}
          </span>
          <span className="pips" aria-hidden="true">
            {Array.from({ length: GOAL_NORMAL_CARDS }, (_, i) => (
              <i key={i} className={i < goodAccepts ? 'on' : ''} />
            ))}
          </span>
        </div>
        <div className="score-sub">
          <span>⏱ {mmss(session.elapsedSeconds())}</span>
          <span className={wrongAccepts ? 'txt-err' : ''}>
            오합격 {wrongAccepts}
            {wrongAccepts > 0 && ` (+${wrongAccepts * WRONG_ACCEPT_PENALTY})`}
          </span>
        </div>
      </div>
    </div>
  );
}
