import {
  EXTRA_ATTR,
  MACHINE_ORDER,
  SLOW_PROCESS_TIME,
  SPEED,
  rollProcessSeconds,
  createMachines,
  restoreMachine,
  type Machine,
  type MachineName,
} from './machines';
import { Logger } from './logger';
import { buildManual, generatePasswords } from './manual';
import { isNormalSpec, makeCardSpec, randomLogoFault } from '../cards/variant';
import type { CardKey, CardSpec, LogoFault } from '../cards/types';

export interface Card {
  name: string; // card_01 ...
  /** 카드를 그리는 모든 정보 (종류 + 불량 변형). 화면의 CardView 가 이것만으로 카드를 그린다 */
  spec: CardSpec;
  /** 모든 공정이 정상인 카드인가 — 정답(합격)이 되는 카드 (UI에는 노출하지 않음) */
  isNormal: boolean;
}

export type Verdict = 'pass' | 'fail';

/** 목표: 정상 카드를 이 장수만큼 합격 처리하면 끝. 점수 = 경과 초 + 오합격 × 페널티 (낮을수록 좋음) */
export const GOAL_NORMAL_CARDS = 10;
export const WRONG_ACCEPT_PENALTY = 10;

export type PasswordResult = 'running' | 'ok' | 'fail';
export type ControlAction = 'extra' | 'oil' | 'repair';

type DegradeAttr = 'fb' | 'oil' | 'ink' | 'filled' | 'loc';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const EXTRA_DONE_MESSAGE: Record<MachineName, string> = {
  InkMachine: 'InkMachine: 잉크 보충 완료.',
  HoloMachine: 'HoloMachine: 홀로그램 시트 추가 완료. filled=1.',
  LogoMachine: 'LogoMachine: 마킹 조정 완료.',
  CuttingMachine: 'CuttingMachine: 커팅 위치 교정 완료. loc=1(정중앙).',
};

/**
 * 시뮬레이션 전체 상태 + 엔진 (원본 SimScreen + SimulationEngine).
 * UI 는 subscribe 로 변경을 받아 다시 그린다.
 */
export class Session {
  readonly machines = createMachines();
  readonly logger = new Logger();
  cards: Card[] = [];
  running = false;
  selected: MachineName = 'InkMachine'; // 정비 패널에서 보고 있는 머신
  current: MachineName | null = null; // 지금 공정 중인 머신
  stalled: MachineName | null = null; // 응답 없이 멈춘 머신
  selectedCard: string | null = null;
  verdicts: Record<string, Verdict> = {};
  // ── 게임 진행 ──
  startedAt: number | null = null; // 첫 START 를 누른 시각 (이후 STOP 중에도 점수는 계속 오른다)
  endedAt: number | null = null;
  finished = false;
  goodAccepts = 0; // 정상 카드를 합격 처리한 수 (목표 진행도)
  wrongAccepts = 0; // 불량 카드를 합격 처리한 수 (각 +10점)
  status = '';
  error = '';
  manualText = '';
  progress: Record<MachineName, number> = { InkMachine: 0, HoloMachine: 0, LogoMachine: 0, CuttingMachine: 0 };
  unlocked: Record<MachineName, boolean> = {
    InkMachine: false,
    HoloMachine: false,
    LogoMachine: false,
    CuttingMachine: false,
  };

  /** 로고(보안 마킹) 불량 종류: 불량이 생길 때 누락/엉뚱한 위치 중 하나로 정해지고, 조정으로 복구되면 해제 */
  private logoFault: LogoFault | null = null;
  private lastCardKey?: CardKey;

  private stopFlag = false;
  private version = 0;
  private listeners = new Set<() => void>();

  constructor() {
    this.initSessionFiles();
  }

  // ── 구독 (useSyncExternalStore 용) ──────────────────────────────
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getVersion = () => this.version;
  emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  // ── 세션 파일(매뉴얼/비밀번호): 새 게임(타이틀 시작 · Reset)마다 한 번만 설정 ──
  private initSessionFiles() {
    const pw = generatePasswords();
    this.manualText = buildManual(pw);
    for (const name of MACHINE_ORDER) this.machines[name].password = pw[name];
  }

  // ── START / STOP / RESET ───────────────────────────────────────
  start() {
    if (this.running) return;
    this.error = '';
    if (this.finished) return;
    if (this.startedAt === null) this.startedAt = Date.now();
    this.logger.writeStart();
    // 비밀번호/매뉴얼은 타이틀에서 시작할 때(생성자)와 Reset 때만 만든다. START 를 눌러도 바뀌지 않는다.
    for (const n of MACHINE_ORDER) {
      this.machines[n].status = 1;
      this.unlocked[n] = false;
    }
    this.stopFlag = false;
    this.running = true;
    this.emit();
    void this.run();
  }

  stop() {
    if (!this.running) return;
    this.logger.writeStop();
    this.stopFlag = true;
  }

  /** @returns 초기화했으면 true, 실행 중이라 불가하면 false */
  reset(): boolean {
    if (this.running) return false;
    this.logger.clear();
    this.initSessionFiles();
    this.cards = [];
    this.verdicts = {};
    this.selectedCard = null;
    this.startedAt = null;
    this.endedAt = null;
    this.finished = false;
    this.goodAccepts = 0;
    this.wrongAccepts = 0;
    this.logoFault = null;
    this.lastCardKey = undefined;
    for (const n of MACHINE_ORDER) {
      const m = this.machines[n];
      m.status = 0;
      restoreMachine(m);
      this.unlocked[n] = false;
    }
    this.logger.resetCount();
    this.status = '';
    this.error = '';
    this.emit();
    return true;
  }

  // ── 비밀번호 / 컨트롤 ───────────────────────────────────────────
  submitPassword(name: MachineName, digits: string): PasswordResult {
    if (this.running) return 'running';
    if (digits === this.machines[name].password) {
      this.unlocked[name] = true;
      this.logger.writePwSuccess(name);
      this.emit();
      return 'ok';
    }
    this.logger.writePwFail(name);
    return 'fail';
  }

  /** 컨트롤 버튼 처리. 완료 메시지를 반환 */
  control(name: MachineName, action: ControlAction, label: string): string {
    const m = this.machines[name];
    let msg: string;
    if (action === 'oil') {
      m.oil = 1;
      m.processTime = 5;
      this.logger.writeOil(name);
      msg = `${name}: 윤활 완료.`;
    } else if (action === 'repair') {
      m.fb = 1;
      this.logger.writeFix(name);
      msg = `${name}: 이물질 제거 완료.`;
    } else {
      m[EXTRA_ATTR[name]] = 1;
      this.logger.writeControl(name, label);
      msg = EXTRA_DONE_MESSAGE[name];
    }
    this.emit();
    return msg;
  }

  /** Admin Fix All */
  fixAll() {
    for (const n of MACHINE_ORDER) restoreMachine(this.machines[n]);
    this.error = '';
    this.emit();
  }

  selectMachine(name: MachineName) {
    this.selected = name;
    this.emit();
  }

  selectCard(name: string) {
    this.selectedCard = name;
    this.emit();
  }

  /** 카드 합격/불량 판정 (카드당 한 번만) */
  judge(name: string, verdict: Verdict) {
    if (this.verdicts[name] || this.finished) return;
    const card = this.cards.find((c) => c.name === name);
    if (!card) return;
    this.verdicts[name] = verdict;

    const wrongAccept = verdict === 'pass' && !card.isNormal;
    if (verdict === 'pass') {
      if (card.isNormal) this.goodAccepts++;
      else this.wrongAccepts++;
    }
    // 올바른 판정: 정상 카드를 합격, 불량 카드를 불량 처리
    const correct = verdict === 'pass' ? card.isNormal : !card.isNormal;
    this.logger.writeJudge(name, verdict, wrongAccept, correct);
    if (this.goodAccepts >= GOAL_NORMAL_CARDS) this.finish();
    this.emit();
  }

  /** 현재 점수: 시작 후 경과 초(매 초 +1) + 오합격 × 10. 목표를 달성하면 그 시점에 고정 */
  score(now: number = Date.now()): number {
    return this.elapsedSeconds(now) + this.wrongAccepts * WRONG_ACCEPT_PENALTY;
  }

  elapsedSeconds(now: number = Date.now()): number {
    if (this.startedAt === null) return 0;
    return Math.floor(((this.endedAt ?? now) - this.startedAt) / 1000);
  }

  private finish() {
    this.endedAt = Date.now();
    this.finished = true;
    this.logger.writeGoal(this.score());
    if (this.running) this.stop();
  }

  // ── 엔진 ───────────────────────────────────────────────────────
  private setStatus(s: string) {
    this.status = s;
    this.emit();
  }

  private setProgress(name: MachineName, pct: number) {
    const v = Math.floor(pct);
    if (this.progress[name] === v) return;
    this.progress[name] = v;
    this.emit();
  }

  private async run() {
    const order = MACHINE_ORDER.map((n) => this.machines[n]);
    try {
      while (!this.stopFlag) {
        let completed = true;
        MACHINE_ORDER.forEach((n) => (this.progress[n] = 0)); // 새 카드: 진행률 초기화

        // 4개 머신 순차 처리
        for (const m of order) {
          if (this.stopFlag) {
            completed = false;
            break;
          }
          this.selected = m.name;
          this.current = m.name;
          this.progress[m.name] = -1; // 같은 값이어도 강제 갱신
          this.setProgress(m.name, 0);

          if (m.fb === 0) {
            this.logger.writeError(m.name);
            this.stalled = m.name;
            this.setStatus(`[ERROR] ${m.name}: 이물질 감지 — 공정 대기 중 (정비 후 재시작 필요)`);
            while (!this.stopFlag) await sleep(100);
            completed = false;
            break;
          }

          const pt = rollProcessSeconds(m) * 1000;
          this.setStatus(`${m.name}: 공정 진행 중...`);
          const start = Date.now();
          while (!this.stopFlag) {
            const elapsed = Date.now() - start;
            this.setProgress(m.name, Math.min((elapsed / pt) * 100, 100));
            if (elapsed >= pt) break;
            await sleep(50);
          }
          if (this.stopFlag) {
            completed = false;
            break;
          }
          this.logger.writeProcess(m.name, start, Date.now());
          this.setProgress(m.name, 100);
          this.setStatus(`${m.name}: 완료`);
        }

        if (!completed || this.stopFlag) break;

        // 카드 이미지 생성
        this.setStatus('이미지 생성 중...');
        let card: Card;
        try {
          card = this.generateCard();
        } catch (e) {
          const short = String((e as Error).message ?? e).slice(0, 120);
          this.error = short;
          this.setStatus(`[이미지 오류] ${short}`);
          break;
        }

        this.logger.writeCardCreated(card.name);
        this.cards = [...this.cards, card];
        this.selectedCard = card.name;
        this.current = null;
        this.setStatus('카드 생성 완료');

        this.updateStates();

        // 다음 카드까지 대기 (원본: 0.1초 × 100 = 10초, SPEED 배율 적용)
        this.setStatus('다음 카드 생산 대기 중...');
        for (let i = 0; i < 100 / SPEED && !this.stopFlag; i++) await sleep(100);
      }
    } catch (e) {
      this.setStatus(`[엔진 오류] ${String((e as Error).message ?? e).slice(0, 100)}`);
    } finally {
      order.forEach((m) => (m.status = 0));
      MACHINE_ORDER.forEach((n) => (this.progress[n] = 0));
      this.current = null;
      this.stalled = null;
      this.running = false;
      this.stopFlag = false;
      if (!this.status.startsWith('[')) this.status = '중지됨 — 머신을 점검한 뒤 START 로 재개하세요.';
      this.emit();
    }
  }

  /** 머신 상태로 카드 스펙을 만든다 (이미지 파일을 고르던 원본 image_service 를 대체) */
  private generateCard(): Card {
    const { InkMachine: ink, HoloMachine: holo, LogoMachine: logo, CuttingMachine: cut } = this.machines;
    if (logo.loc === 1) this.logoFault = null;
    else if (!this.logoFault) this.logoFault = randomLogoFault();

    const spec = makeCardSpec(
      { inkOk: ink.ink === 1, holoFilled: holo.filled === 1, logoOk: logo.loc === 1, cutOk: cut.loc === 1 },
      this.logoFault,
      this.lastCardKey,
    );
    this.lastCardKey = spec.key;
    const name = `card_${String(this.cards.length + 1).padStart(2, '0')}`;
    return { name, spec, isNormal: isNormalSpec(spec) };
  }

  // ── 머신 상태 확률적 악화 ───────────────────────────────────────
  private updateStates() {
    const { InkMachine, HoloMachine, LogoMachine, CuttingMachine } = this.machines;
    this.degradeOne(InkMachine, ['ink', 0.15]);
    this.degradeOne(HoloMachine, ['filled', 0.15]);
    this.degradeOne(LogoMachine, ['loc', 0.15]); // 보안 마킹 불량: 누락 또는 엉뚱한 위치 (조정으로 복구)
    this.degradeOne(CuttingMachine, ['loc', 0.15]);
  }

  private degradeOne(m: Machine, extra: [DegradeAttr, number] | null) {
    const checks: [DegradeAttr, number][] = [];
    if (m.fb === 1) checks.push(['fb', 0.05]);
    if (m.oil === 1) checks.push(['oil', 0.1]);
    if (extra && m[extra[0]] === 1) checks.push(extra);

    // 한 번에 하나의 고장만 발생 (무작위 순서로 검사)
    checks.sort(() => Math.random() - 0.5);
    for (const [attr, prob] of checks) {
      if (Math.random() < prob) {
        m[attr] = 0;
        if (attr === 'oil') m.processTime = SLOW_PROCESS_TIME;
        return;
      }
    }
  }
}
