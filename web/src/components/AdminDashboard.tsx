import { useEffect, useReducer } from 'react';
import { MACHINE_ORDER, type Machine, type MachineName } from '../sim/machines';
import type { Session } from '../sim/session';

type Attr = 'password' | 'status' | 'fb' | 'oil' | 'process_time' | 'ink' | 'filled' | 'loc';

const ATTRS: Record<MachineName, Attr[]> = {
  InkMachine: ['password', 'status', 'fb', 'oil', 'process_time', 'ink'],
  HoloMachine: ['password', 'status', 'fb', 'oil', 'process_time', 'filled'],
  LogoMachine: ['password', 'status', 'fb', 'oil', 'process_time', 'loc'],
  CuttingMachine: ['password', 'status', 'fb', 'oil', 'process_time', 'loc'],
};
function readAttr(m: Machine, attr: Attr): string | number {
  return attr === 'process_time' ? m.processTime : m[attr];
}

function colorClass(attr: Attr, val: string | number): string {
  if (attr === 'password') return 'v-dark';
  if (attr === 'process_time') return (val as number) <= 5 ? 'v-green' : 'v-orange';
  if (attr === 'loc') return val === 1 ? 'v-green' : val === 0 ? 'v-red' : 'v-orange';
  return val === 1 ? 'v-green' : 'v-red';
}

export function AdminDashboard({ session, onClose }: { session: Session; onClose: () => void }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal admin">
        <div className="modal-title">
          Admin Dashboard
          <button className="btn-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="admin-grid">
          {MACHINE_ORDER.map((name) => (
            <fieldset className="group" key={name}>
              <legend>{name}</legend>
              {ATTRS[name].map((attr) => {
                const val = readAttr(session.machines[name], attr);
                return (
                  <div className="admin-row" key={attr}>
                    <span className="admin-attr">{attr}</span>
                    <span className={`admin-val ${colorClass(attr, val)}`}>{String(val)}</span>
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>
        <fieldset className="group">
          <legend>오류</legend>
          <span className={session.error ? 'v-red' : 'v-green'}>{session.error || '없음'}</span>
        </fieldset>
        <button className="btn btn-green fix-all" onClick={() => session.fixAll()}>
          Fix All
        </button>
      </div>
    </div>
  );
}
