import { useState } from 'react';
import { CardView } from './CardView';
import { CARD_DEFS } from './defs';
import { CARD_KEYS, type CardKey, type CardSpec, type InkChannel } from './types';
import { randomCut, randomWrongLogo } from './variant';

const INKS: InkChannel[] = ['C', 'M', 'Y', 'K'];
const INK_LABEL: Record<InkChannel, string> = { C: 'C 시안', M: 'M 마젠타', Y: 'Y 옐로', K: 'K 블랙' };

/** 카드 갤러리: 카드 종류와 모든 불량 변형(홀로 / 커팅 이탈 / 로고 불량 / 잉크 누락)을 직접 확인한다 */
export function CardGallery({ onBack }: { onBack: () => void }) {
  const [key, setKey] = useState<CardKey>('fire');
  const [holo, setHolo] = useState(true);
  const [cut, setCut] = useState<CardSpec['cut']>(null);
  const [logo, setLogo] = useState<CardSpec['logo']>({ mode: 'ok' });
  const [ink, setInk] = useState<InkChannel[]>([]);

  const spec: CardSpec = { key, holo, cut, logo, inkMissing: ink };
  const toggleInk = (c: InkChannel) => setInk((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  const reset = () => {
    setHolo(true);
    setCut(null);
    setLogo({ mode: 'ok' });
    setInk([]);
  };

  return (
    <div className="gallery theme-dark">
      <header className="gallery-head">
        <h1>카드 갤러리</h1>
        <span className="txt-mute">카드는 모두 코드로 그려지며, 시뮬레이터는 머신 상태로 이 변형들을 자동으로 만듭니다.</span>
        <span className="sp" />
        <button className="btn" onClick={onBack}>
          ← 돌아가기
        </button>
      </header>

      <div className="gallery-body">
        <div className="gallery-stage">
          <CardView spec={spec} width={400} />
        </div>

        <div className="gallery-ctl">
          <h2>카드 종류</h2>
          <div className="seg">
            {CARD_KEYS.map((k) => (
              <button key={k} className={k === key ? 'on' : ''} onClick={() => setKey(k)}>
                {CARD_DEFS[k].name}
              </button>
            ))}
          </div>

          <h2>홀로그램</h2>
          <div className="seg">
            <button className={holo ? 'on' : ''} onClick={() => setHolo(true)}>
              적용됨 (정상)
            </button>
            <button className={!holo ? 'on' : ''} onClick={() => setHolo(false)}>
              홀로 시트 없음
            </button>
          </div>

          <h2>커팅 위치</h2>
          <div className="seg">
            <button className={cut === null ? 'on' : ''} onClick={() => setCut(null)}>
              정상
            </button>
            <button className={cut !== null ? 'on' : ''} onClick={() => setCut(randomCut())}>
              이탈 (🎲 방향 랜덤 · 세기 20~30%)
            </button>
          </div>

          <h2>보안 마킹(로고)</h2>
          <div className="seg">
            <button className={logo.mode === 'ok' ? 'on' : ''} onClick={() => setLogo({ mode: 'ok' })}>
              정상
            </button>
            <button className={logo.mode === 'none' ? 'on' : ''} onClick={() => setLogo({ mode: 'none' })}>
              누락
            </button>
            <button className={logo.mode === 'wrong' ? 'on' : ''} onClick={() => setLogo(randomWrongLogo())}>
              엉뚱한 위치 (🎲)
            </button>
          </div>

          <h2>인쇄 안 된 잉크 (체크한 채널이 누락)</h2>
          <div className="seg">
            {INKS.map((c) => (
              <button key={c} className={ink.includes(c) ? 'on' : ''} onClick={() => toggleInk(c)}>
                {INK_LABEL[c]}
              </button>
            ))}
          </div>

          <button className="btn gallery-reset" onClick={reset}>
            모두 정상으로
          </button>
        </div>
      </div>

      <h2 className="gallery-sub">전체 카드 (모두 정상)</h2>
      <div className="gallery-all">
        {CARD_KEYS.map((k) => (
          <button key={k} className="gallery-pick" onClick={() => setKey(k)}>
            <CardView spec={{ key: k, holo: true, cut: null, logo: { mode: 'ok' }, inkMissing: [] }} width={200} />
          </button>
        ))}
      </div>
    </div>
  );
}
