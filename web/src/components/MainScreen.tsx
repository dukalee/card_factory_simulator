export function MainScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="main-screen theme-dark">
      <div className="ms-tag">PRODUCTION LINE SIMULATION</div>
      <h1>CARD FACTORY SIMULATOR</h1>
      <p className="ms-sub">
        잉크 → 홀로그램 → 로고 → 커팅. 공정을 감시하고, 이상이 생긴 머신을 복구해
        <br />
        정상 카드 10장을 가장 빨리 합격 처리하세요.
      </p>
      <p className="ms-rule">
        <b>점수</b> 매 초 +1점 (낮을수록 좋음) · 불량 카드를 합격 처리하면 +10점
      </p>
      <div className="ms-belt" aria-hidden="true">
        <span className="wp" />
        <span className="wp" style={{ animationDelay: '-2.3s' }} />
        <span className="wp" style={{ animationDelay: '-4.6s' }} />
      </div>
      <div className="ms-btns">
        <button className="btn btn-green start-big" onClick={onStart}>
          ▶ 시뮬레이터 시작
        </button>
        <a className="link-quiet" href="#guide">
          📖 설명서
        </a>
      </div>
      <footer className="main-footer">© 2026 aishift. All rights reserved.</footer>
    </div>
  );
}
