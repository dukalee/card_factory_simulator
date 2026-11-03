interface Defect {
  /** 어떤 문제가 생기는가 */
  problem: string;
  /** 화면에서 보이는 증상 / 카드에 나타나는 결과 */
  effect: string;
  /** 고치는 방법 (정비 패널의 버튼 이름) */
  fix: { icon: string; label: string };
}

interface MachineGuide {
  key: string;
  name: string;
  ko: string;
  icon: string;
  image: string;
  role: string;
  defects: Defect[];
}

const COMMON: Defect[] = [
  {
    problem: '이물질 감지',
    effect: '공정이 멈추고 "응답 없음"으로 표시됨 (다음 카드가 만들어지지 않음)',
    fix: { icon: '🔧', label: '정비' },
  },
  {
    problem: '윤활유 부족',
    effect: '공정 시간이 2.5초에서 7.5초로 느려짐 (로그에 "공정 지연" 표시)',
    fix: { icon: '🛢️', label: '윤활' },
  },
];

const MACHINES: MachineGuide[] = [
  {
    key: 'ink',
    name: 'INK MACHINE',
    ko: '잉크 프린팅',
    icon: '🎨',
    image: 'step1_cmyk',
    role: '카드 원본에 C·M·Y·K 잉크로 그림과 글자를 인쇄합니다.',
    defects: [
      { problem: '잉크 부족', effect: '색이 인쇄되지 않아 카드가 흑백으로 나옴', fix: { icon: '🖋️', label: '잉크 추가' } },
    ],
  },
  {
    key: 'holo',
    name: 'HOLO MACHINE',
    ko: '홀로그램 부착',
    icon: '🌈',
    image: 'step2_hologram',
    role: '인쇄된 카드 위에 홀로그램 시트를 붙여 반짝이는 효과를 냅니다.',
    defects: [
      { problem: '시트 소진', effect: '홀로그램이 붙지 않은 평범한 카드가 나옴', fix: { icon: '🌈', label: '시트 추가' } },
    ],
  },
  {
    key: 'logo',
    name: 'LOGO MACHINE',
    ko: '보안 마킹',
    icon: '🔒',
    image: 'step3_security_marking',
    role: '카드 하단에 POOKIMON 보안 로고를 레이저로 찍습니다.',
    defects: [
      { problem: '마킹 위치 어긋남', effect: '로고가 없거나, 엉뚱한 위치에 기울어져 찍힘', fix: { icon: '🎯', label: '조정' } },
    ],
  },
  {
    key: 'cut',
    name: 'CUTTING MACHINE',
    ko: '커팅',
    icon: '✂️',
    image: 'step4_cutting',
    role: '인쇄된 시트를 카드 모양으로 잘라 완성합니다.',
    defects: [
      { problem: '커팅 위치 어긋남', effect: '인쇄 면이 한쪽으로 밀려 테두리가 어긋남', fix: { icon: '📐', label: '위치 조정' } },
    ],
  },
];

const STEPS = [
  { head: 'STOP', body: '시뮬레이션을 멈춥니다. (실행 중에는 정비할 수 없습니다)' },
  { head: '정비 패널 열기', body: 'Tab 키나 왼쪽 "정비" 손잡이로 패널을 엽니다.' },
  { head: '머신 선택', body: '고장 난 머신의 탭(Ink / Holo / Logo / Cut)을 선택합니다.' },
  { head: '비밀번호 입력', body: '📖 매뉴얼에서 해당 머신의 4자리 PW를 확인해 입력하고 [*]를 누릅니다.' },
  { head: '수리 버튼', body: '인증되면 활성화되는 버튼으로 고칩니다.' },
  { head: 'START', body: '다시 시작합니다. 이물질이 감지돼 멈췄던 머신도 START 로 재개합니다.' },
];

/** 공정 설명서: 머신별 역할 · 하자 · 수리 방법 + 공통 수리 순서 */
export function ProcessGuide() {
  return (
    <div className="pg">
      <h2 className="pg-title">머신별 설명 · 하자 · 수리 방법</h2>
      <div className="pg-grid">
        {MACHINES.map((m, i) => (
          <article className="pg-machine" key={m.key}>
            <header>
              <span className="pg-no">{i + 1}</span>
              <div>
                <b>
                  <span aria-hidden="true">{m.icon} </span>
                  {m.ko}
                </b>
                <small>{m.name}</small>
              </div>
            </header>
            <img src={`${import.meta.env.BASE_URL}images/process/${m.image}.webp`} alt={`${m.ko} 공정`} draggable={false} />
            <p className="pg-role">{m.role}</p>
            <ul className="pg-defects">
              {[...m.defects, ...COMMON].map((d) => (
                <li key={d.problem}>
                  <div className="pg-problem">
                    <span className="pg-tag">하자</span>
                    <b>{d.problem}</b>
                  </div>
                  <p>{d.effect}</p>
                  <div className="pg-fix">
                    <span className="pg-tag fix">수리</span>
                    <span className="pg-btn">
                      <span aria-hidden="true">{d.fix.icon}</span> {d.fix.label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="pg-title">수리 순서</h2>
      <ol className="pg-steps">
        {STEPS.map((s) => (
          <li key={s.head}>
            <b>{s.head}</b>
            <span>{s.body}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
