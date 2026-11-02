import { SPEED } from './machines';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatTime(ms: number = Date.now()): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export type Severity = 'crit' | 'warn' | 'info';

/** 화면(알람/이벤트 패널)용 로그 항목. log.txt 와 같은 사건을 사람이 읽기 쉬운 문장으로 보관 */
export interface LogEntry {
  time: number;
  sev: Severity;
  text: string;
}

/** 이 시간(초)보다 오래 걸린 공정은 '공정 지연' 경고로 표시 */
const SLOW_THRESHOLD_SEC = 6 / SPEED;

/** log.txt 에 해당하는 메모리 로거 (브라우저에는 파일 시스템이 없으므로 다운로드로 제공) */
export class Logger {
  lines: string[] = [];
  entries: LogEntry[] = [];
  actionCount = 0;

  clear() {
    this.lines = [];
    this.entries = [];
  }

  resetCount() {
    this.actionCount = 0;
  }

  private write(line: string, text: string, sev: Severity = 'info') {
    this.lines.push(line);
    this.entries.push({ time: Date.now(), sev, text });
  }

  writeProcess(machine: string, start: number, end: number) {
    const sec = (end - start) / 1000;
    const slow = sec > SLOW_THRESHOLD_SEC;
    this.write(
      `PROCESS: ${machine} | ${formatTime(start)} | ${formatTime(end)}`,
      slow ? `${machine} 공정 지연 (${sec.toFixed(1)}s)` : `${machine} 공정 완료 (${sec.toFixed(1)}s)`,
      slow ? 'warn' : 'info',
    );
  }
  writeError(machine: string) {
    this.write(`ERROR: ${machine} | ${formatTime()}`, `${machine} 오류 — 공정 정지, 응답 없음`, 'crit');
  }
  writeStart() {
    this.write(`START | ${formatTime()}`, '시뮬레이션 시작');
  }
  writeStop() {
    this.write(`STOP | ${formatTime()}`, '시뮬레이션 정지');
  }
  writePwFail(machine: string) {
    this.write(`PW FAIL: ${machine} | ${formatTime()}`, `${machine} 비밀번호 오류`, 'warn');
  }
  writePwSuccess(machine: string) {
    this.actionCount++;
    this.write(`PW SUCCESS: ${machine} | ${formatTime()}`, `${machine} 인증 성공`);
  }
  writeFix(machine: string) {
    this.actionCount++;
    this.write(`FIX: ${machine} | ${formatTime()}`, `${machine} 정비 실시`);
  }
  writeOil(machine: string) {
    this.actionCount++;
    this.write(`OIL: ${machine} | ${formatTime()}`, `${machine} 윤활 실시`);
  }
  writeControl(machine: string, button: string) {
    this.actionCount++;
    this.write(`FIX: ${machine} | ${formatTime()} | ${button}`, `${machine} ${button}`);
  }
  writeJudge(card: string, verdict: 'pass' | 'fail', penalty: boolean) {
    const tag = verdict === 'pass' ? 'PASS' : 'FAIL';
    this.write(
      `JUDGE: ${card} | ${tag}${penalty ? ' | PENALTY +10' : ''} | ${formatTime()}`,
      penalty ? `${card} 오합격 (+10점)` : `${card} ${verdict === 'pass' ? '합격' : '불량'} 처리`,
      penalty ? 'warn' : 'info',
    );
  }
  writeGoal(score: number) {
    this.write(`GOAL REACHED | score ${score} | ${formatTime()}`, `목표 달성! 최종 점수 ${score}점`);
  }
  writeCardCreated(name: string) {
    this.write(`CARD CREATED | ${formatTime()}`, `${name} 생성 완료`);
  }

  toText(): string {
    return this.lines.length ? this.lines.join('\n') + '\n' : '';
  }
}
