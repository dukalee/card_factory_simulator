import { useEffect, useState } from 'react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '*'];

interface Props {
  disabled: boolean;
  /** true 이면 물리 키보드(숫자 / Backspace / Enter)로도 입력 가능 */
  keyboard: boolean;
  onConfirm: (digits: string) => void;
}

/** 4자리 비밀번호 숫자패드. [*] (또는 Enter) 를 누르면 onConfirm(digits) 호출 */
export function Numpad({ disabled, keyboard, onConfirm }: Props) {
  const [digits, setDigits] = useState('');

  const press = (key: string) => {
    if (key === '*') {
      if (digits.length === 4) onConfirm(digits);
      setDigits('');
    } else if (key === '←') {
      setDigits((d) => d.slice(0, -1));
    } else if (digits.length < 4) {
      setDigits((d) => d + key);
    }
  };

  // 비활성화(시뮬레이션 실행) 시 입력 초기화
  useEffect(() => {
    if (disabled) setDigits('');
  }, [disabled]);

  // 물리 키보드 입력
  useEffect(() => {
    if (!keyboard || disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (document.querySelector('.modal-backdrop')) return; // 다른 대화상자가 열려 있으면 무시
      let key: string | null = null;
      if (/^[0-9]$/.test(e.key)) key = e.key;
      else if (e.key === 'Backspace') key = '←';
      else if (e.key === 'Enter' || e.key === '*') key = '*';
      if (key === null) return;
      e.preventDefault();
      press(key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const display = '●'.repeat(digits.length) + '-'.repeat(4 - digits.length);

  return (
    <div className="numpad">
      <div className="pin">입력: {display}</div>
      <div className="keys">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            className={`btn ${k === '*' ? 'btn-green' : k === '←' ? 'key-back' : ''}`}
            onClick={() => press(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
