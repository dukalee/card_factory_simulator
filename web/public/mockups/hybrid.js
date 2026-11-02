// 시안 공통 더미 데이터 + 렌더 헬퍼
const IMG = '../images/process/';
const RES = '../images/result/';
const S = [
  { key: 'INK', ko: '잉크 프린팅', img: 'step1_cmyk', st: '', p: 100, t: '100%', c: 'var(--ok)', pills: [['이물질 정상'], ['윤활 정상'], ['잉크 충분']], tags: [['FB', 'OK', 'ok'], ['OIL', 'OK', 'ok'], ['INK', 'OK', 'ok'], ['T', '5s', 'ok']] },
  { key: 'HOLO', ko: '홀로그램 부착', img: 'step2_hologram', st: 'warn', p: 62, t: '62%', c: 'var(--warn)', pills: [['이물질 정상'], ['윤활 부족', 'w'], ['시트 충분']], tags: [['FB', 'OK', 'ok'], ['OIL', 'LOW', 'wn'], ['SHEET', 'OK', 'ok'], ['T', '15s', 'wn']] },
  { key: 'LOGO', ko: '보안 마킹', img: 'step3_security_marking', st: '', p: 0, t: '0%', c: 'var(--ok)', pills: [['이물질 정상'], ['윤활 정상'], ['위치 정상']], tags: [['FB', 'OK', 'ok'], ['OIL', 'OK', 'ok'], ['POS', 'OK', 'ok'], ['T', '5s', 'ok']] },
  { key: 'CUT', ko: '커팅', img: 'step4_cutting', st: 'err', p: 100, t: '!', c: 'var(--err)', pills: [['이물질 감지', 'e'], ['윤활 정상'], ['위치 이탈', 'e']], tags: [['FB', 'FAULT', 'er'], ['OIL', 'OK', 'ok'], ['POS', 'OFF', 'er'], ['T', '5s', 'ok']] },
];
const pills = (s) => s.pills.map(([t, k]) => `<span class="pill ${k || ''}">${t}</span>`).join('');
const tags = (s) => s.tags.map(([a, b, k]) => `<span class="tag">${a}<b class="${k}">${b}</b></span>`).join('');

/* 링 게이지 + 필 칩 (B 스타일) */
const stRing = (s, i, size = 100) => `<div class="st ${s.st}"><h3><span class="lamp"></span>${i + 1}. ${s.key}</h3>
  <img src="${IMG}${s.img}.webp" style="height:${size}px" alt=""><div class="row"><div class="ring" data-t="${s.t}" style="--p:${s.p};--c:${s.c}"></div><div><b>${s.ko}</b><br><small>${s.tags[3][1]} / cycle</small></div></div>
  <div class="pills">${pills(s)}</div></div>`;
/* 진행 바 + 태그 그리드 (A 스타일) */
const stBar = (s, i, size = 90) => `<div class="st ${s.st}"><h3><span class="lamp"></span>${s.key} · ${s.ko}</h3>
  <img src="${IMG}${s.img}.webp" style="height:${size}px" alt=""><div class="bar"><i style="--p:${s.p === 100 && s.st === 'err' ? 0 : s.p}%;--c:${s.c}"></i></div><div class="tags">${tags(s)}</div></div>`;

const alarms = () => `<ul class="alarm">
  <li><span class="sev e">CRIT</span><div>Cut · 이물질 감지<time>21:04:32 · 미확인</time></div></li>
  <li><span class="sev e">CRIT</span><div>Cut · 커팅 위치 이탈<time>21:04:32 · 미확인</time></div></li>
  <li><span class="sev w">WARN</span><div>Holo · 윤활 부족 (공정 15s)<time>21:03:48</time></div></li>
  <li><span class="sev i">INFO</span><div>카드 #12 생성 완료<time>21:03:20</time></div></li></ul>`;
const log = () => `<div class="log"><div class="o">21:04:12 PROCESS InkMachine 5.0s</div><div class="o">21:04:17 PROCESS HoloMachine 15.0s</div><div class="e">21:04:32 ERROR CuttingMachine 이물질 감지</div><div>21:04:40 STOP</div><div>21:04:52 PW SUCCESS CuttingMachine</div></div>`;
const keypad = () => `<div class="pin">●●●-</div><div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0'].map((k) => `<button class="btn">${k}</button>`).join('')}<button class="btn go">ENT</button></div>`;
const kv = () => `<div class="kv"><div><small>생산 수량</small><b class="mono">12</b></div><div><small>합격</small><b class="mono" style="color:var(--ok)">9</b></div><div><small>불량</small><b class="mono" style="color:var(--err)">3</b></div><div><small>가동 시간</small><b class="mono">00:04:31</b></div></div>`;
const thumbs = () => `<div class="thumbs"><div class="th"><img src="${RES}holo_centered.webp" alt=""><div>#12</div></div><div class="th bad"><img src="${RES}normal_offcenter_missing_C_M.webp" alt=""><div>#11 불량</div></div><div class="th"><img src="${RES}normal_centered.webp" alt=""><div>#10</div></div><div class="th bad"><img src="${RES}normal_centered_missing_K.webp" alt=""><div>#9 불량</div></div></div>`;
const belt = () => `<div class="belt"><span class="cd"></span><span class="cd"></span><span class="cd"></span></div>`;
const fill = (id, html) => { document.getElementById(id).innerHTML = html; };
setInterval(() => document.querySelectorAll('.clk').forEach((e) => (e.textContent = new Date().toTimeString().slice(0, 8))), 500);
