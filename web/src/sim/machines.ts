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

/** 시뮬레이션 속도 배율. 2 = 공정 시간과 카드 간 대기 시간이 모두 절반 (machine.processTime 값 자체는 그대로) */
export const SPEED = 2;

export const NORMAL_PROCESS_TIME = 5;
export const SLOW_PROCESS_TIME = 15;

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
