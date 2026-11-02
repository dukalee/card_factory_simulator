export type CardKey = 'fire' | 'water' | 'grass' | 'elec' | 'psy' | 'dark';
export type EnergyType = CardKey | 'norm';
export const CARD_KEYS: CardKey[] = ['fire', 'water', 'grass', 'elec', 'psy', 'dark'];

/** 잉크 채널: Cyan / Magenta / Yellow / blacK */
export type InkChannel = 'C' | 'M' | 'Y' | 'K';

/** 보안 마킹(로고) 상태: 정상 / 누락 / 엉뚱한 위치에 찍힘 */
export type LogoState =
  | { mode: 'ok' }
  | { mode: 'none' }
  | { mode: 'wrong'; x: number; y: number; rot: number; scale: number };

/** 로고 머신 불량 종류 (불량이 생길 때 하나로 정해짐) */
export type LogoFault = 'missing' | 'misplaced';

/**
 * 카드 한 장을 그리는 데 필요한 모든 것. 시뮬레이터는 머신 상태로 이 값을 만들고,
 * CardView 는 이 값만으로 카드를 그린다 (서버/이미지 파일 불필요).
 */
export interface CardSpec {
  key: CardKey;
  /** 홀로그램 시트가 붙었는가 (갤럭시 + 레인보우 믹스 효과) */
  holo: boolean;
  /** 커팅 위치 이탈: 인쇄물이 카드 안에서 평행 이동한 양(px, 카드 폭 640 기준). 회전 없음. null = 정상 */
  cut: { x: number; y: number } | null;
  logo: LogoState;
  /** 인쇄되지 않은 잉크 채널. 빈 배열 = 정상 */
  inkMissing: InkChannel[];
}

export interface Attack {
  energy: EnergyType[];
  name: string;
  damage: string;
  text: string;
}

export interface CardDef {
  name: string;
  hp: number;
  no: string;
  rarity: string;
  flavor: string;
  /** 프레임 색: c1 어두움 / c2 중간 / c3 밝음 / box 기술 박스 / gold 테두리 */
  colors: { c1: string; c2: string; c3: string; box: string; gold: string };
  attacks: [Attack, Attack];
  weakness: EnergyType;
  retreat: number;
  /** 하단 설명 (줄바꿈 단위) */
  lore: string[];
}
