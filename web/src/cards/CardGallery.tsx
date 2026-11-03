import { useState, type ReactNode } from 'react';
import { CardView } from './CardView';
import { CARD_DEFS, ENERGY } from './defs';
import { ProcessGuide } from './ProcessGuide';
import { CARD_KEYS, type CardKey, type CardSpec, type InkChannel } from './types';
import { randomCut, randomInkMissing, randomWrongLogo } from './variant';

/** 설정 한 묶음: 아이콘 + 제목 + 현재 상태 칩 + 선택 버튼들 */
function Group({ icon, title, state, ok, children }: { icon: string; title: string; state: string; ok: boolean; children: ReactNode }) {
  return (
    <section className="gl-group">
      <header>
        <span className="gl-ico" aria-hidden="true">
          {icon}
        </span>
        <h2>{title}</h2>
        <span className={`gl-chip ${ok ? 'ok' : 'bad'}`}>{state}</span>
      </header>
      <div className="seg">{children}</div>
    </section>
  );
}

/** 카드 갤러리: 카드 종류와 모든 불량 변형(홀로 / 커팅 이탈 / 로고 불량 / 잉크 누락)을 직접 확인한다 */
export function CardGallery({ onBack }: { onBack: () => void }) {
  const [key, setKey] = useState<CardKey>('fire');
  const [holo, setHolo] = useState(true);
  const [cut, setCut] = useState<CardSpec['cut']>(null);
  const [logo, setLogo] = useState<CardSpec['logo']>({ mode: 'ok' });
  const [ink, setInk] = useState<InkChannel[]>([]);

  const spec: CardSpec = { key, holo, cut, logo, inkMissing: ink };
  const defects = [!holo, cut !== null, logo.mode !== 'ok', ink.length > 0].filter(Boolean).length;
  const reset = () => {
    setHolo(true);
    setCut(null);
    setLogo({ mode: 'ok' });
    setInk([]);
  };

  return (
    <div className="gallery theme-dark">
      <header className="gallery-head">
        <div className="gl-title">
          <h1>PROCESS GUIDE</h1>
          <span>공정 설명서 · 머신별 역할과 하자, 수리 방법을 알아보고 하자 카드의 실제 모습을 확인하세요.</span>
        </div>
        <span className="sp" />
        <button className="btn gl-back" onClick={onBack}>
          ← 돌아가기
        </button>
      </header>

      <ProcessGuide />

      <h2 className="pg-title pg-title-ex">공정 하자 예시 · 카드 갤러리</h2>
      <p className="pg-lead">각 하자가 카드에 어떻게 나타나는지 직접 켜 보세요. 시뮬레이터는 머신 상태에 따라 이 변형들을 자동으로 만듭니다.</p>
      <div className="gallery-body">
        <div className="gallery-stage">
          <div className="gl-name">
            <b>{CARD_DEFS[key].name}</b>
            <span className={`gl-chip ${defects ? 'bad' : 'ok'}`}>{defects ? `불량 요소 ${defects}개` : '정상 카드'}</span>
          </div>
          <CardView spec={spec} width={400} />
        </div>

        <div className="gallery-ctl">
          <Group icon="🃏" title="카드 종류" state={CARD_DEFS[key].name} ok>
            {CARD_KEYS.map((k) => (
              <button key={k} className={k === key ? 'on' : ''} onClick={() => setKey(k)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ENERGY[k].path} />
                </svg>
                {CARD_DEFS[k].name}
              </button>
            ))}
          </Group>

          <Group icon="🌈" title="홀로그램" state={holo ? '정상' : '시트 없음'} ok={holo}>
            <button className={holo ? 'on' : ''} onClick={() => setHolo(true)}>
              적용됨 (정상)
            </button>
            <button className={!holo ? 'on bad' : ''} onClick={() => setHolo(false)}>
              홀로 시트 없음
            </button>
          </Group>

          <Group icon="✂️" title="커팅 위치" state={cut === null ? '정상' : '이탈'} ok={cut === null}>
            <button className={cut === null ? 'on' : ''} onClick={() => setCut(null)}>
              정상
            </button>
            <button className={cut !== null ? 'on bad' : ''} onClick={() => setCut(randomCut())}>
              이탈 (🎲 방향 랜덤 · 세기 20~30%)
            </button>
          </Group>

          <Group
            icon="🔒"
            title="보안 마킹(로고)"
            state={logo.mode === 'ok' ? '정상' : logo.mode === 'none' ? '누락' : '위치 이탈'}
            ok={logo.mode === 'ok'}
          >
            <button className={logo.mode === 'ok' ? 'on' : ''} onClick={() => setLogo({ mode: 'ok' })}>
              정상
            </button>
            <button className={logo.mode === 'none' ? 'on bad' : ''} onClick={() => setLogo({ mode: 'none' })}>
              누락
            </button>
            <button className={logo.mode === 'wrong' ? 'on bad' : ''} onClick={() => setLogo(randomWrongLogo())}>
              엉뚱한 위치 (🎲)
            </button>
          </Group>

          <Group icon="🎨" title="잉크" state={ink.length === 0 ? '정상' : '누락 (흑백)'} ok={ink.length === 0}>
            <button className={ink.length === 0 ? 'on' : ''} onClick={() => setInk([])}>
              정상 (컬러)
            </button>
            <button className={ink.length > 0 ? 'on bad' : ''} onClick={() => setInk(randomInkMissing())}>
              잉크 누락 (흑백)
            </button>
          </Group>

          <button className="btn gl-reset" onClick={reset}>
            ↺ 모두 정상으로
          </button>
        </div>
      </div>

      <footer className="gl-footer">© 2026 aishift. All rights reserved.</footer>
    </div>
  );
}
