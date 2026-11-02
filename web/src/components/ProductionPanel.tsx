import { useState } from 'react';
import { CardView } from '../cards/CardView';
import type { Session } from '../sim/session';

/** 생산 수량 + 카드 검수(합격/불량). 카드의 실제 정상 여부는 화면에 노출하지 않음 */
export function ProductionPanel({ session }: { session: Session }) {
  const [zoom, setZoom] = useState(false);
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
      <div className="prod-body">
        <div className="prod-left">
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
          {cards.length === 0 ? (
            <p className="empty">생성된 카드가 여기에 표시됩니다.</p>
          ) : (
            <div className="thumbs">
              {cards.map((c) => (
                <button
                  key={c.name}
                  className={`thumb ${verdicts[c.name] ?? ''} ${c.name === selectedCard ? 'sel' : ''}`}
                  onClick={() => session.selectCard(c.name)}
                >
                  <CardView spec={c.spec} width={66} animate={false} />
                  <span>{c.name.replace('card_', '#')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="prod-right">
          {current ? (
            <>
              <button className="preview" onClick={() => setZoom(true)} title="크게 보기">
                <CardView spec={current.spec} width={232} />
              </button>
              <div className="judge">
                <b>{current.name}</b>
                <span className="sp" />
                {verdict ? (
                  <span className={verdict === 'pass' ? 'txt-ok' : 'txt-err'}>{verdict === 'pass' ? '합격 처리됨' : '불량 처리됨'}</span>
                ) : (
                  <>
                    <button className="btn btn-green small" disabled={session.finished} onClick={() => session.judge(current.name, 'pass')}>
                      합격
                    </button>
                    <button className="btn btn-red small" disabled={session.finished} onClick={() => session.judge(current.name, 'fail')}>
                      불량
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="preview blank">선택한 카드 없음</div>
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
            <CardView spec={current.spec} width={Math.min(480, window.innerWidth - 80)} />
          </div>
        </div>
      )}
    </section>
  );
}

