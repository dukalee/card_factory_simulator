import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import './card.css';
import { ART_SVG } from './art';
import { CARD_DEFS, ENERGY } from './defs';
import type { CardKey, CardSpec, EnergyType } from './types';

const DESIGN_W = 640;
const DESIGN_H = 897;

/* ── 원화 이미지 자동 감지 ───────────────────────────────────────────
 * public/images/cards/{key}.webp 가 있으면 SVG 대신 사용. 정적 사이트에서도 동작하도록
 * 브라우저가 키마다 한 번만 확인한다(결과는 모듈 캐시에 보관). */
const artProbe = new Map<CardKey, Promise<string | null>>();
function probeArt(key: CardKey): Promise<string | null> {
  let p = artProbe.get(key);
  if (!p) {
    const url = `${import.meta.env.BASE_URL}images/cards/${key}.webp`;
    p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    artProbe.set(key, p);
  }
  return p;
}
function useArtImage(key: CardKey): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void probeArt(key).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [key]);
  return url;
}

/** SVG 안의 id / url(#id) 에 접두어를 붙여 같은 카드가 여러 장 있어도 id 충돌이 없게 한다 */
function uniqueIds(svg: string, prefix: string): string {
  return svg.replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
}

/* ── 잉크 누락 필터 ───────────────────────────────────────────────────
 * 잉크 색이 빠진 카드는 어떤 채널이 빠졌든 색 없이 흑백(휘도)으로만 인쇄된다. */
function InkFilter({ id }: { id: string }) {
  return (
    <svg className="cf-defs" width="0" height="0" aria-hidden="true">
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
      </filter>
    </svg>
  );
}

function Energy({ type, small }: { type: EnergyType; small?: boolean }) {
  return (
    <span className={`cf-en ${small ? 'sm' : ''}`} style={{ background: ENERGY[type].bg }} title={ENERGY[type].label}>
      <svg viewBox="0 0 24 24">
        <path d={ENERGY[type].path} />
      </svg>
    </span>
  );
}

interface Props {
  spec: CardSpec;
  /** 화면에 표시할 카드 폭(px). 높이는 5:7 비율로 자동 */
  width?: number;
  /** false 면 홀로 애니메이션을 멈춘다 (썸네일처럼 많이 띄울 때) */
  animate?: boolean;
}

/** 카드 한 장. spec(카드 종류 + 불량 변형)만으로 모든 것이 코드로 그려진다 */
export function CardView({ spec, width = 320, animate = true }: Props) {
  const def = CARD_DEFS[spec.key];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scale = width / DESIGN_W;
  const artImg = useArtImage(spec.key);
  const svg = useMemo(() => uniqueIds(ART_SVG[spec.key], `a${uid}`), [spec.key, uid]);
  const inkFilterId = spec.inkMissing.length ? `ink${uid}` : undefined;
  const { c1, c2, c3, box, gold } = def.colors;

  const vars = {
    '--s': scale,
    '--c1': c1,
    '--c2': c2,
    '--c3': c3,
    '--box': box,
    '--gold': gold,
    '--ox': `${spec.cut?.x ?? 0}px`,
    '--oy': `${spec.cut?.y ?? 0}px`,
  } as CSSProperties;

  const logoWrong = spec.logo.mode === 'wrong' ? spec.logo : null;

  return (
    <div className="cf-box" style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }}>
      {inkFilterId && <InkFilter id={inkFilterId} />}
      <div className={`cf-card ${spec.holo ? 'cf-holo' : ''} ${animate ? '' : 'cf-still'}`} style={vars}>
        <div className="cf-sheet" style={inkFilterId ? { filter: `url(#${inkFilterId})` } : undefined}>
          <div className="cf-in">
            <div className="cf-hdr">
              <span className="cf-chip">기본</span>
              <span className="cf-nm">{def.name}</span>
              <span className="cf-hp">
                HP<b>{def.hp}</b>
              </span>
              <span className="cf-ticon" style={{ background: ENERGY[spec.key].bg }}>
                <svg viewBox="0 0 24 24">
                  <path d={ENERGY[spec.key].path} />
                </svg>
              </span>
            </div>
            <div className="cf-flav">{def.flavor}</div>

            <div className="cf-art">
              {artImg ? (
                <img className="cf-art-img" src={artImg} alt="" draggable={false} />
              ) : (
                <svg viewBox="0 0 584 420" preserveAspectRatio="xMidYMid slice" dangerouslySetInnerHTML={{ __html: svg }} />
              )}
            </div>

            {def.attacks.map((a, i) => (
              <div className="cf-atk" key={a.name} style={{ top: i === 0 ? 556 : 658, height: i === 0 ? 96 : 112 }}>
                <div className="cf-row">
                  {a.energy.map((e, j) => (
                    <Energy type={e} key={j} />
                  ))}
                  <span className="cf-an">{a.name}</span>
                  <span className="cf-ad">{a.damage}</span>
                </div>
                <p>{a.text}</p>
              </div>
            ))}

            <div className="cf-stats">
              <div>
                약 점 <Energy type={def.weakness} small /> <span>×2</span>
              </div>
              <div>
                저항력 <i>—</i>
              </div>
              <div>
                후 퇴
                {Array.from({ length: def.retreat }, (_, i) => (
                  <Energy type="norm" small key={i} />
                ))}
              </div>
            </div>

            <div className="cf-foot">
              <span className={`cf-logo ${spec.logo.mode === 'ok' ? '' : 'cf-hide'}`}>POOKIMON</span>
              <span className="cf-no">
                <b>PKM</b>
                {def.no} {def.rarity}
              </span>
              <div className="cf-txt">
                <span>
                  {def.lore.map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* 엉뚱한 위치에 찍힌 로고 (보안 마킹 불량) */}
            {logoWrong && (
              <span
                className="cf-logo cf-logo-x"
                style={{ left: logoWrong.x, top: logoWrong.y, transform: `rotate(${logoWrong.rot}deg) scale(${logoWrong.scale})` }}
              >
                POOKIMON
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
