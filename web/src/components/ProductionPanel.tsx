import { useEffect, useRef, useState } from 'react';
import { CardView } from '../cards/CardView';
import type { CardSpec } from '../cards/types';
import type { Session } from '../sim/session';

const CARD_RATIO = 640 / 897; // CardView 설계 크기 (폭/높이)

/** 주어진 칸(위아래·좌우)에 카드가 꽉 차도록 크기를 맞춰서 그린다 */
function FitCard({ spec, onClick }: { spec: CardSpec; onClick: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setWidth(Math.max(0, Math.floor(Math.min(el.clientWidth, el.clientHeight * CARD_RATIO))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mes-card" ref={boxRef}>
      {width > 0 && (
        <button className="fit-card" onClick={onClick} title="크게 보기">
          <CardView spec={spec} width={width} />
        </button>
      )}
    </div>
  );
}

/** 창 크기 (확대 창이 화면 안에 들어가도록 계산하는 데 사용) */
function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
}

/** 생산 수량 + 카드 검수(합격/불량). 카드의 실제 정상 여부는 화면에 노출하지 않음 */
export function ProductionPanel({ session }: { session: Session }) {
  const [zoom, setZoom] = useState(false);
  const vp = useViewport();
  // 확대 창: 높이(90vh - 제목/여백)와 폭 모두 화면 안에 들어오도록
  const zoomWidth = Math.max(160, Math.floor(Math.min(560, vp.w * 0.94 - 60, (vp.h * 0.9 - 110) * CARD_RATIO)));
  const { cards, verdicts, selectedCard } = session;
  const passed = cards.filter((c) => verdicts[c.name] === 'pass').length;
  const failed = cards.filter((c) => verdicts[c.name] === 'fail').length;
  const current = cards.find((c) => c.name === selectedCard) ?? null;
  const verdict = current ? verdicts[current.name] : undefined;

  return (
    <section className="panel prod">
      <h2>
        <span>생산 · 카드 검수</span>
        <span className="txt-mute">
          {passed + failed} / {cards.length} 검수
        </span>
      </h2>
      <div className="mes">
        <div className="mes-list">
          {cards.length === 0 ? (
            <p className="empty">생성된 카드가 여기에 표시됩니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>카드</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => {
                  const v = verdicts[c.name];
                  return (
                    <tr key={c.name} className={c.name === selectedCard ? 'sel' : ''} onClick={() => session.selectCard(c.name)}>
                      <td>
                        <CardView spec={c.spec} width={38} animate={false} />
                      </td>
                      <td>{c.name}</td>
                      <td>
                        <span className={`bd ${v ?? 'none'}`}>{v === 'pass' ? '✔ 합격' : v === 'fail' ? '✖ 불량' : '미검수'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mes-ins">
          <div className="kv">
            <div>
              <small>생산</small>
              <b>{cards.length}</b>
            </div>
            <div>
              <small>합격</small>
              <b className="txt-ok">{passed}</b>
            </div>
            <div>
              <small>불량</small>
              <b className="txt-err">{failed}</b>
            </div>
            <div>
              <small>미검수</small>
              <b>{cards.length - passed - failed}</b>
            </div>
          </div>
          {current ? (
            <>
              <FitCard spec={current.spec} onClick={() => setZoom(true)} />
              <b>{current.name}</b>
              {verdict ? (
                <span className={verdict === 'pass' ? 'txt-ok' : 'txt-err'}>{verdict === 'pass' ? '✔ 합격 처리됨' : '✖ 불량 처리됨'}</span>
              ) : (
                <div className="judge">
                  <button className="btn btn-green" disabled={session.finished} onClick={() => session.judge(current.name, 'pass')}>
                    ✔ 합격
                  </button>
                  <button className="btn btn-red" disabled={session.finished} onClick={() => session.judge(current.name, 'fail')}>
                    ✖ 불량
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mes-card blank">선택한 카드 없음</div>
          )}
        </div>
      </div>

      {zoom && current && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setZoom(false)}>
          <div className="modal zoom">
            <div className="modal-title">
              {current.name}
              <button className="btn-close" onClick={() => setZoom(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <CardView spec={current.spec} width={zoomWidth} />
          </div>
        </div>
      )}
    </section>
  );
}

