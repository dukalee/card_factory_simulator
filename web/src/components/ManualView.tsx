import { MACHINE_ORDER, type MachineName } from '../sim/machines';

const STEPS = [
  { head: 'STOP 버튼', body: '시뮬레이션을 중단합니다.' },
  { head: '머신 탭 + PW 입력', body: '머신 탭을 선택하고 숫자패드에 4자리 PW를 입력한 뒤 [*]를 누릅니다.' },
  { head: '컨트롤 활성화', body: 'PW가 맞으면 컨트롤 버튼이 활성화됩니다.' },
  { head: '복구 후 재개', body: '버튼을 눌러 머신 상태를 복구한 뒤 START로 재개합니다.' },
];

const MACHINE_INFO: Record<MachineName, { ko: string; icon: string; controls: [string, string][] }> = {
  InkMachine: {
    ko: '잉크 프린팅',
    icon: '🎨',
    controls: [
      ['잉크 추가', '잉크 보충'],
      ['윤활', '윤활유 보충'],
      ['정비', '이물질 제거'],
    ],
  },
  HoloMachine: {
    ko: '홀로그램 부착',
    icon: '🌈',
    controls: [
      ['시트 추가', '홀로그램 시트 보충'],
      ['윤활', '윤활유 보충'],
      ['정비', '이물질 제거'],
    ],
  },
  LogoMachine: {
    ko: '보안 마킹',
    icon: '🔒',
    controls: [
      ['조정', '마킹 상태 교정'],
      ['윤활', '윤활유 보충'],
      ['정비', '이물질 제거'],
    ],
  },
  CuttingMachine: {
    ko: '커팅',
    icon: '✂️',
    controls: [
      ['위치 조정', '커팅 위치 교정'],
      ['윤활', '윤활유 보충'],
      ['정비', '이물질 제거'],
    ],
  },
};

/**
 * 매뉴얼 본문. 원본 텍스트(manual.txt)에서 생성일시와 비밀번호를 읽어 보기 좋게 그린다.
 * 자동 정비 매크로가 `.manual-text` 의 텍스트에서 "[InkMachine]  PW: 1234*" 형태를 찾으므로
 * 머신 이름과 PW 표기는 그 형태가 유지되도록 한 줄 안에 이어서 그린다.
 */
export function ManualView({ text }: { text: string }) {
  const created = /생성일시:\s*(.+)/.exec(text)?.[1] ?? '';
  const pw: Partial<Record<MachineName, string>> = {};
  for (const [, name, digits] of text.matchAll(/\[(\w+Machine)\]\s+PW:\s*(\d{4})\*/g)) pw[name as MachineName] = digits;

  return (
    <div className="manual-text mv">
      <header className="mv-head">
        <b>Card Factory Simulator Manual</b>
        {created && <small>생성일시 {created}</small>}
      </header>

      <section className="mv-goals">
        <div className="mv-card">
          <h4>🎯 목표</h4>
          <p>
            가능한 한 빨리 <b>정상 카드 10장</b>을 합격 처리하세요.
          </p>
        </div>
        <div className="mv-card">
          <h4>⏱ 점수 (낮을수록 좋음)</h4>
          <p>
            시작 후 매 초 <b>1점</b>씩 오르며, 불량 카드를 합격 처리하면 <b className="mv-bad">+10점</b>이 추가됩니다.
          </p>
        </div>
      </section>

      <h3 className="mv-title">컨트롤 사용 방법</h3>
      <ol className="mv-steps">
        {STEPS.map((s) => (
          <li key={s.head}>
            <b>{s.head}</b>
            <span>{s.body}</span>
          </li>
        ))}
      </ol>

      <h3 className="mv-title">머신별 비밀번호 · 컨트롤</h3>
      <div className="mv-machines">
        {MACHINE_ORDER.map((n) => (
          <article className="mv-machine" key={n}>
            <h4>
              <span className="mv-ico" aria-hidden="true">
                {MACHINE_INFO[n].icon}
              </span>
              <span className="mv-mname">
                <span className="mv-br">[</span>
                {n}
                <span className="mv-br">]</span>
              </span>{' '}
              <span className="mv-pw">
                PW: <b>{pw[n] ?? '----'}</b>*
              </span>
            </h4>
            <p className="mv-ko">{MACHINE_INFO[n].ko}</p>
            <ul>
              {MACHINE_INFO[n].controls.map(([label, desc]) => (
                <li key={label}>
                  <b>{label}</b>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
