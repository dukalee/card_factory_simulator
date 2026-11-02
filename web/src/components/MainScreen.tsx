export function MainScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="main-screen theme-dark">
      <div className="tower h big">
        <i className="r" />
        <i className="y" />
        <i className="g" />
      </div>
      <h1>CARD FACTORY SIMULATOR</h1>
      <p>잉크 → 홀로그램 → 로고 → 커팅 공정을 감시하고, 이상이 생긴 머신을 찾아 복구하세요.</p>
      <p className="goal-text">
        <b>목표</b> 정상 카드 10장을 가장 빨리 합격 처리하세요.
        <br />
        <b>점수</b> 매 초 +1점 (낮을수록 좋음) · 불량 카드를 합격 처리하면 +10점
      </p>
      <p className="hint">결과물은 브라우저 메모리에 보관됩니다. log.txt / manual.txt 는 File 메뉴에서 저장할 수 있습니다.</p>
      <button className="btn btn-green start-big" onClick={onStart}>
        ▶ 시뮬레이터 시작
      </button>
      <a className="link-quiet" href="#cards">
        카드 갤러리 보기
      </a>
    </div>
  );
}
