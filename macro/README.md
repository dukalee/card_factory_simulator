# 자동 정비 매크로 (Python + Playwright)

게임 화면 위에 **🤖 자동 정비 패널**을 띄우고, 패널 버튼을 누르면 파이썬이 사람이 하는 클릭 그대로

`STOP → 정비 서랍 열기 → 머신 선택 → 비밀번호 입력 → 컨트롤 클릭 → (선택) START`

를 수행합니다. 비밀번호는 게임 시작 직후 매뉴얼에서 한 번만 읽습니다 (새 게임/Reset 때만 바뀜).

## 준비
```
pip install playwright        # 이미 설치돼 있으면 생략 (설치된 Chrome 또는 Edge 를 사용)
```
게임 주소: 기본 `http://localhost:5199/` (개발 서버). 배포한 사이트면 `--url` 로 지정.

## 사용
```
python card_factory_macro.py                       # 패널 모드: 브라우저가 열리고 오른쪽 아래에 패널 표시
python card_factory_macro.py --fix holo extra      # 한 번만 실행하고 종료
python card_factory_macro.py --fix cut oil --no-resume
python card_factory_macro.py --selftest            # 헤드리스 자체 검증 (PASS/FAIL)
python card_factory_macro.py --url https://내-사이트/
```

| MACHINE | extra (머신 고유 버튼) | oil | repair |
|---|---|---|---|
| `ink`  | 잉크 추가 | 윤활 | 정비 |
| `holo` | 시트 추가 | 윤활 | 정비 |
| `logo` | 조정 | 윤활 | 정비 |
| `cut`  | 위치 조정 | 윤활 | 정비 |

## 파이썬 코드에서 직접 쓰기
```python
from card_factory_macro import FactoryMacro, launch
from playwright.sync_api import sync_playwright

with sync_playwright() as pw:
    page = launch(pw, "", headless=False).new_page()
    macro = FactoryMacro(page)
    page.goto("http://localhost:5199/")
    macro.ensure_game()          # 타이틀에서 게임 시작 + 비밀번호 읽기
    macro.start()
    macro.fix("holo", "extra")   # 홀로 시트 추가 (STOP → 인증 → 추가 → START)
```

## 다음 단계 (아직 없음)
이 매크로는 **정비 동작만** 자동화합니다. "어느 머신을 고쳐야 하는지"를 알아내는 부분은 별도입니다.
- 로그로 알 수 있는 것: `ERROR` → 정비, `PROCESS` 시간이 길면 → 윤활
- 카드 이미지로만 알 수 있는 것: 잉크/홀로 시트/커팅 위치/로고 불량, 합격·불량 판정
