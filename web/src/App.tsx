import { useEffect, useState } from 'react';
import { CardGallery } from './cards/CardGallery';
import { DialogProvider } from './components/Dialog';
import { MainScreen } from './components/MainScreen';
import { SimScreen } from './components/SimScreen';
import { Session } from './sim/session';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  // #cards 로 접속하면 카드 갤러리 (정적 배포에서도 동작하는 해시 라우팅)
  const [gallery, setGallery] = useState(() => window.location.hash === '#cards');
  useEffect(() => {
    const onHash = () => setGallery(window.location.hash === '#cards');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const closeGallery = () => {
    window.location.hash = '';
    setGallery(false);
  };

  if (gallery) return <CardGallery onBack={closeGallery} />;

  return (
    <DialogProvider>
      {session ? (
        <SimScreen session={session} onQuit={() => setSession(null)} />
      ) : (
        // 시작할 때마다 새 세션(로그/매뉴얼/머신 상태 초기화)
        <MainScreen
          onStart={() => {
            const next = new Session();
            // 개발 모드 전용: 브라우저 콘솔/자동 테스트에서 세션을 조작할 수 있게 노출 (프로덕션 빌드에서는 제거됨)
            if (import.meta.env.DEV) (window as unknown as { __session?: Session }).__session = next;
            setSession(next);
          }}
        />
      )}
    </DialogProvider>
  );
}
