export type MachineName = 'InkMachine' | 'HoloMachine' | 'LogoMachine' | 'CuttingMachine';

export const MACHINE_ORDER: MachineName[] = ['InkMachine', 'HoloMachine', 'LogoMachine', 'CuttingMachine'];

/** 머신별 추가 속성: ink(잉크) / filled(홀로 시트) / loc(위치) */
export type ExtraAttr = 'ink' | 'filled' | 'loc';

export const EXTRA_ATTR: Record<MachineName, ExtraAttr> = {
  InkMachine: 'ink',
  HoloMachine: 'filled',
  LogoMachine: 'loc',
  CuttingMachine: 'loc',
};

export interface Machine {
  name: MachineName;
  status: number;
  fb: number; // 이물질(1=정상, 0=이물질 감지)
  oil: number; // 윤활(1=정상)
  processTime: number; // 초
  password: string;
  ink: number;
  filled: number;
  loc: number;
}

/** 시뮬레이션 속도 배율. 2 = 카드 간 대기 시간이 절반 (공정 시간은 아래 범위에서 매번 무작위로 정해짐) */
export const SPEED = 2;

/** machine.processTime 은 윤활 상태 표시값: NORMAL_PROCESS_TIME 이하면 정상, SLOW_PROCESS_TIME 이면 지연(윤활 부족) */
export const NORMAL_PROCESS_TIME = 5;
export const SLOW_PROCESS_TIME = 15;

/** 실제 공정 시간(초) 범위: 정상 2~4초, 지연(윤활 부족) 6~10초. 공정마다 이 안에서 무작위 */
export const NORMAL_SECONDS: readonly [number, number] = [2, 4];
export const SLOW_SECONDS: readonly [number, number] = [6, 10];
/** 이 시간(초)보다 오래 걸린 공정은 '공정 지연'으로 본다 (정상 최대 4초와 지연 최소 6초의 사이) */
export const SLOW_THRESHOLD_SEC = 5;

export function rollProcessSeconds(m: Pick<Machine, 'processTime'>): number {
  const [lo, hi] = m.processTime > NORMAL_PROCESS_TIME ? SLOW_SECONDS : NORMAL_SECONDS;
  return lo + Math.random() * (hi - lo);
}

export function createMachine(name: MachineName): Machine {
  return {
    name,
    status: 0,
    fb: 1,
    oil: 1,
    processTime: NORMAL_PROCESS_TIME,
    password: '',
    ink: 1,
    filled: 1,
    loc: 1,
  };
}

export function createMachines(): Record<MachineName, Machine> {
  return {
    InkMachine: createMachine('InkMachine'),
    HoloMachine: createMachine('HoloMachine'),
    LogoMachine: createMachine('LogoMachine'),
    CuttingMachine: createMachine('CuttingMachine'),
  };
}

/** 모든 머신을 정상 상태로 복구 (Reset / Admin Fix All 공용) */
export function restoreMachine(m: Machine) {
  m.fb = 1;
  m.oil = 1;
  m.processTime = NORMAL_PROCESS_TIME;
  m.ink = 1;
  m.filled = 1;
  m.loc = 1;
}
