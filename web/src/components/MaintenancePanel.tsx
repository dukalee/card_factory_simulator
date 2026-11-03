import { MACHINE_ORDER, type MachineName } from '../sim/machines';
import type { ControlAction, Session } from '../sim/session';
import { Numpad } from './Numpad';
import { useDialog } from './Dialog';

const EXTRA_LABEL: Record<MachineName, string> = {
  InkMachine: '잉크 추가',
  HoloMachine: '시트 추가',
  LogoMachine: '조정',
  CuttingMachine: '위치 조정',
};
const EXTRA_ICON: Record<MachineName, string> = {
  InkMachine: '🖋️',
  HoloMachine: '🌈',
  LogoMachine: '🎯',
  CuttingMachine: '📐',
};
const SHORT: Record<MachineName, string> = { InkMachine: 'Ink', HoloMachine: 'Holo', LogoMachine: 'Logo', CuttingMachine: 'Cut' };

/** 선택한 머신의 정비 패널: STOP → 비밀번호 인증 → 컨트롤 활성화 */
export function MaintenancePanel({ session, active }: { session: Session; active: boolean }) {
  const { alert } = useDialog();
  const name = session.selected;
  const unlocked = session.unlocked[name];
  const extraLabel = EXTRA_LABEL[name];

  const onPassword = async (digits: string) => {
    const result = session.submitPassword(name, digits);
    if (result === 'running') await alert('시뮬레이션이 실행 중입니다.\nSTOP 후 입력하세요.');
    else if (result === 'ok') await alert('인증 성공! 컨트롤이 활성화되었습니다.', 'OK');
    else await alert('비밀번호가 틀렸습니다.', '오류', 'error');
  };

  const onControl = (action: ControlAction, label: string) => {
    void alert(session.control(name, action, label), '완료');
  };

  return (
    <>
      <h2>
        <span>정비 · {name}</span>
        <span className={unlocked ? 'txt-ok' : 'txt-mute'}>{unlocked ? '🔓 인증됨' : '🔒 PW 필요'}</span>
      </h2>
      <div className="pad">
        <div className="machine-tabs" role="tablist">
          {MACHINE_ORDER.map((n) => (
            <button
              key={n}
              role="tab"
              aria-selected={n === name}
              className={`mtab ${n === name ? 'on' : ''}`}
              onClick={() => session.selectMachine(n)}
            >
              {SHORT[n]}
            </button>
          ))}
        </div>
        {/* key 로 머신이 바뀔 때 입력 중이던 숫자를 초기화 */}
        <Numpad
          key={name}
          disabled={session.running}
          keyboard={active}
          onConfirm={onPassword}
          note={session.running ? '실행 중에는 입력 불가 · STOP 후 시도하세요' : undefined}
        />
        <div className="ctrl-row">
          <button className="btn btn-blue" disabled={!unlocked} onClick={() => onControl('extra', extraLabel)}>
            <span className="ci" aria-hidden="true">
              {EXTRA_ICON[name]}
            </span>
            {extraLabel}
          </button>
          <button className="btn btn-blue" disabled={!unlocked} onClick={() => onControl('oil', '윤활')}>
            <span className="ci" aria-hidden="true">
              🛢️
            </span>
            윤활
          </button>
          <button className="btn btn-blue" disabled={!unlocked} onClick={() => onControl('repair', '정비')}>
            <span className="ci" aria-hidden="true">
              🔧
            </span>
            정비
          </button>
        </div>
      </div>
    </>
  );
}
