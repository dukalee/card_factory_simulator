import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Kind = 'info' | 'error' | 'warning';

type DialogState =
  | { type: 'alert'; title: string; message: string; kind: Kind; resolve: () => void }
  | { type: 'confirm'; title: string; message: string; resolve: (ok: boolean) => void }
  | { type: 'password'; title: string; message: string; resolve: (v: string | null) => void };

interface DialogApi {
  alert: (message: string, title?: string, kind?: Kind) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
  promptPassword: (message: string, title?: string) => Promise<string | null>;
}

const Ctx = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('DialogProvider 가 필요합니다.');
  return api;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const alert = useCallback(
    (message: string, title = '알림', kind: Kind = 'info') =>
      new Promise<void>((resolve) => setDialog({ type: 'alert', title, message, kind, resolve })),
    [],
  );
  const confirm = useCallback(
    (message: string, title = '확인') =>
      new Promise<boolean>((resolve) => setDialog({ type: 'confirm', title, message, resolve })),
    [],
  );
  const promptPassword = useCallback(
    (message: string, title = '비밀번호') =>
      new Promise<string | null>((resolve) => setDialog({ type: 'password', title, message, resolve })),
    [],
  );

  const close = () => setDialog(null);

  return (
    <Ctx.Provider value={{ alert, confirm, promptPassword }}>
      {children}
      {dialog && <DialogView dialog={dialog} close={close} />}
    </Ctx.Provider>
  );
}

function DialogView({ dialog, close }: { dialog: DialogState; close: () => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finish = (ok: boolean) => {
    close();
    if (dialog.type === 'alert') dialog.resolve();
    else if (dialog.type === 'confirm') dialog.resolve(ok);
    else dialog.resolve(ok ? value : null);
  };

  const icon = dialog.type === 'alert' ? { info: 'ℹ️', error: '⛔', warning: '⚠️' }[dialog.kind] : dialog.type === 'confirm' ? '⚠️' : '🔒';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          finish(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && dialog.type !== 'alert') finish(false);
        }}
      >
        <div className="modal-title">
          <span>{icon}</span> {dialog.title}
        </div>
        <div className="modal-body">{dialog.message}</div>
        {dialog.type === 'password' && (
          <input
            ref={inputRef}
            type="password"
            className="modal-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
          />
        )}
        <div className="modal-actions">
          {dialog.type !== 'alert' && (
            <button type="button" className="btn btn-gray" onClick={() => finish(false)}>
              취소
            </button>
          )}
          <button type="submit" className="btn btn-blue" autoFocus={dialog.type !== 'password'}>
            확인
          </button>
        </div>
      </form>
    </div>
  );
}
