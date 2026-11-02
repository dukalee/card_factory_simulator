import { MACHINE_ORDER, type MachineName } from './machines';
import { formatTime } from './logger';

/** 머신별 중복 없는 4자리 비밀번호 생성 */
export function generatePasswords(): Record<MachineName, string> {
  const used = new Set<string>();
  const result = {} as Record<MachineName, string>;
  for (const name of MACHINE_ORDER) {
    let pw: string;
    do {
      pw = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
    } while (used.has(pw));
    used.add(pw);
    result[name] = pw;
  }
  return result;
}

export function buildManual(pw: Record<MachineName, string>): string {
  const lines = [
    '=== Card Factory Simulator Manual ===',
    `생성일시: ${formatTime()}`,
    '',
    '* 목표: 가능한 한 빨리 정상 카드 10장을 합격 처리하세요.',
    '* 점수(낮을수록 좋음): 시작 후 매 초 1점씩 오르며, 불량 카드를 합격 처리하면 +10점이 추가됩니다.',
    '',
    '* 컨트롤 사용 방법:',
    '  1. STOP 버튼을 눌러 시뮬레이션을 중단합니다.',
    '  2. 머신 탭을 선택하고 숫자패드에 4자리 PW를 입력한 뒤 [*]를 누릅니다.',
    '  3. PW가 맞으면 control 버튼이 활성화됩니다.',
    '  4. 버튼을 눌러 머신 상태를 복구한 후 START로 재개합니다.',
    '',
    `[InkMachine]  PW: ${pw.InkMachine}*`,
    '  잉크추가 : 잉크 보충',
    '  윤활     : 윤활유 보충',
    '  정비     : 이물질 제거',
    '',
    `[HoloMachine]  PW: ${pw.HoloMachine}*`,
    '  시트추가 : 홀로그램 시트 보충 ',
    '  윤활     : 윤활유 보충 ',
    '  정비     : 이물질 제거',
    '',
    `[LogoMachine]  PW: ${pw.LogoMachine}*`,
    '  조정     : 마킹 상태 교정',
    '  윤활     : 윤활유 보충 ',
    '  정비     : 이물질 제거',
    '',
    `[CuttingMachine]  PW: ${pw.CuttingMachine}*`,
    '  위치조정 : 커팅 위치 교정 ',
    '  윤활     : 윤활유 보충',
    '  정비     : 이물질 제거 ',
    '',
  ];
  return lines.join('\n');
}
