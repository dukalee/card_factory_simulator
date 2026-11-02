import { CARD_KEYS, type CardKey, type CardSpec, type InkChannel, type LogoFault, type LogoState } from './types';

/** 커팅 이탈: 세기 100% 기준 최대 이동량(px, 카드 폭 640 기준). 실제 세기는 20~30% 고정 */
export const CUT_MAX_X = 120;
export const CUT_MAX_Y = 160;
export const CUT_STRENGTH_MIN = 0.2;
export const CUT_STRENGTH_MAX = 0.3;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** 8방향 중 랜덤, 세기 20~30%. 회전 없이 평행 이동만 */
const DIRECTIONS: readonly [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [1, -1], [-1, 1], [1, 1],
];
export function randomCut(): { x: number; y: number } {
  const [dx, dy] = pick(DIRECTIONS);
  const k = rand(CUT_STRENGTH_MIN, CUT_STRENGTH_MAX);
  return { x: dx * k * CUT_MAX_X, y: dy * k * CUT_MAX_Y };
}

/** 인쇄 안 된 잉크 조합: C/M/Y/K 중 1~3개 (14가지 중 하나) */
const INK_COMBOS: InkChannel[][] = (() => {
  const all: InkChannel[] = ['C', 'M', 'Y', 'K'];
  const combos: InkChannel[][] = [];
  for (let mask = 1; mask < 15; mask++) combos.push(all.filter((_, i) => mask & (1 << i)));
  return combos;
})();
export const randomInkMissing = (): InkChannel[] => [...pick(INK_COMBOS)];

/** 엉뚱한 위치의 로고: 카드 내부(616×873) 좌표 후보 중 하나 + 약간의 흔들림/기울기/크기 */
const LOGO_SPOTS: readonly [number, number][] = [
  [26, 142], [420, 150], [30, 330], [400, 470], [250, 300], [360, 566], [40, 600],
  [300, 700], [60, 782], [380, 784], [250, 100], [20, 46], [330, 640], [150, 520],
];
export function randomWrongLogo(): Extract<LogoState, { mode: 'wrong' }> {
  const [x, y] = pick(LOGO_SPOTS);
  return { mode: 'wrong', x: x + rand(-12, 12), y: y + rand(-12, 12), rot: rand(-22, 22), scale: rand(0.8, 1.4) };
}

export const randomLogoFault = (): LogoFault => (Math.random() < 0.5 ? 'missing' : 'misplaced');

/** 카드 종류는 무작위(직전과 같은 카드는 연속으로 나오지 않음) */
export function pickCardKey(prev?: CardKey): CardKey {
  return pick(prev ? CARD_KEYS.filter((k) => k !== prev) : CARD_KEYS);
}

/** 카드를 찍어낼 때의 머신 상태 */
export interface PrintState {
  inkOk: boolean;
  holoFilled: boolean;
  logoOk: boolean;
  cutOk: boolean;
}

/** 머신 상태 → 카드 스펙 (원본 image_service 를 대체) */
export function makeCardSpec(state: PrintState, logoFault: LogoFault | null, prevKey?: CardKey): CardSpec {
  return {
    key: pickCardKey(prevKey),
    holo: state.holoFilled,
    cut: state.cutOk ? null : randomCut(),
    logo: state.logoOk ? { mode: 'ok' } : logoFault === 'missing' ? { mode: 'none' } : randomWrongLogo(),
    inkMissing: state.inkOk ? [] : randomInkMissing(),
  };
}

/** 모든 공정이 정상인 카드인가 (합격이 정답인 카드) */
export const isNormalSpec = (s: CardSpec) => s.holo && s.cut === null && s.logo.mode === 'ok' && s.inkMissing.length === 0;
