/* 코드로 그린 캐릭터 일러스트 (SVG, 584×420). 같은 이름의 원화 이미지(public/images/cards/{key}.webp)가 있으면 그쪽이 우선한다. */
import type { CardKey } from './types';

export const ART_SVG: Record<CardKey, string> = {
  fire: `<defs>
<linearGradient id="f-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34102e"/><stop offset=".55" stop-color="#cf4a2c"/><stop offset="1" stop-color="#ffb347"/></linearGradient>
<radialGradient id="f-gl" cx=".5" cy=".6" r=".55"><stop offset="0" stop-color="#ffd98a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
<linearGradient id="f-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a13"/><stop offset=".55" stop-color="#ffaa2b"/><stop offset="1" stop-color="#fff2a0"/></linearGradient>
</defs>
<rect width="584" height="420" fill="url(#f-bg)"/><circle cx="292" cy="280" r="250" fill="url(#f-gl)"/>
<path d="M0 420V330l90-80 40 40 70-60 60 100v90z" fill="#2a0c1e" opacity=".75"/><path d="M584 420V310l-84-70-50 60-60-40-50 80v80z" fill="#2a0c1e" opacity=".75"/>
<g fill="#ffd36b"><circle cx="70" cy="120" r="4"/><circle cx="120" cy="190" r="3"/><circle cx="500" cy="110" r="4"/><circle cx="455" cy="180" r="3"/><circle cx="530" cy="220" r="3"/><circle cx="40" cy="240" r="3"/><circle cx="175" cy="90" r="3"/><circle cx="410" cy="70" r="3"/></g>
<ellipse cx="292" cy="394" rx="190" ry="20" fill="#2a0c1e" opacity=".55"/>
<g transform="translate(410 300)"><path d="M0 70C50 70 110 20 100-40 92-95 40-100 50-160c70 40 130 110 110 190-12 55-80 90-160 80z" fill="url(#f-fl)"/><path d="M20 55C60 50 96 10 88-30c-5-30-30-40-30-70 40 30 80 70 66 120-10 36-52 60-104 35z" fill="#fff2a0" opacity=".75"/></g>
<ellipse cx="236" cy="380" rx="32" ry="16" fill="#d9691a"/><ellipse cx="348" cy="380" rx="32" ry="16" fill="#d9691a"/>
<ellipse cx="292" cy="310" rx="104" ry="80" fill="#f08a2c"/><ellipse cx="292" cy="330" rx="64" ry="52" fill="#ffe2b5"/>
<ellipse cx="200" cy="312" rx="22" ry="36" transform="rotate(22 200 312)" fill="#f08a2c"/><ellipse cx="384" cy="312" rx="22" ry="36" transform="rotate(-22 384 312)" fill="#f08a2c"/>
<ellipse cx="190" cy="340" rx="15" ry="13" fill="#5a2a14"/><ellipse cx="394" cy="340" rx="15" ry="13" fill="#5a2a14"/>
<path d="M196 160 172 52l78 62z" fill="#f08a2c"/><path d="M203 146 190 84l44 34z" fill="#ffd59a"/><path d="M388 160 412 52l-78 62z" fill="#f08a2c"/><path d="M381 146 394 84l-44 34z" fill="#ffd59a"/>
<ellipse cx="292" cy="205" rx="114" ry="92" fill="#f39a3a"/>
<path d="M290 120C262 92 282 66 292 30c10 36 34 60 2 90z" fill="url(#f-fl)"/>
<path d="M182 214l-38 22 42 14zM402 214l38 22-42 14z" fill="#f39a3a"/>
<ellipse cx="292" cy="240" rx="58" ry="40" fill="#ffe2b5"/>
<ellipse cx="248" cy="205" rx="23" ry="29" fill="#2b1320"/><ellipse cx="336" cy="205" rx="23" ry="29" fill="#2b1320"/>
<circle cx="256" cy="194" r="9" fill="#fff"/><circle cx="344" cy="194" r="9" fill="#fff"/><circle cx="242" cy="214" r="4.5" fill="#fff"/><circle cx="330" cy="214" r="4.5" fill="#fff"/>
<ellipse cx="292" cy="224" rx="10" ry="6.5" fill="#3a1a22"/>
<path d="M266 242q26 30 52 0q-26 10-52 0z" fill="#7a2230"/><path d="M280 250q12 14 24 0q-12 5-24 0z" fill="#ff8aa0"/>
<circle cx="212" cy="236" r="14" fill="#ff5f55" opacity=".6"/><circle cx="372" cy="236" r="14" fill="#ff5f55" opacity=".6"/>`,
  water: `<defs>
<linearGradient id="w-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfeeff"/><stop offset=".35" stop-color="#3fa9e6"/><stop offset="1" stop-color="#0b3b78"/></linearGradient>
<linearGradient id="w-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5bb4ff"/><stop offset="1" stop-color="#2b72d4"/></linearGradient>
</defs>
<rect width="584" height="420" fill="url(#w-bg)"/>
<g fill="#fff" opacity=".18"><path d="M120 0h50l90 420h-90z"/><path d="M300 0h40l30 420h-90z"/><path d="M430 0h56l-60 420h-80z"/></g>
<g fill="none" stroke="#fff" stroke-width="3" opacity=".7"><circle cx="70" cy="300" r="14"/><circle cx="110" cy="230" r="8"/><circle cx="520" cy="270" r="16"/><circle cx="490" cy="170" r="9"/><circle cx="60" cy="150" r="6"/><circle cx="545" cy="90" r="7"/></g>
<path d="M0 380q60-24 120 0t120 0 120 0 120 0 104-10v50H0z" fill="#0a2f66" opacity=".7"/>
<path d="M60 420c0-40 18-60 30-90 6 30 24 40 18 90zM500 420c-4-50 14-70 28-96 8 34 26 44 14 96z" fill="#ff7aa8" opacity=".9"/>
<path d="M300 70c-8-30 6-46 0-66 18 20 28 44 6 66zM262 80c-14-24-2-40-10-58 20 14 30 36 12 58zM338 80c14-24 2-40 10-58-20 14-30 36-12 58z" fill="#e8f9ff" opacity=".95"/>
<path d="M430 250c50-10 94-54 80-110 30 20 44 70 24 108-22 40-72 56-110 40z" fill="#3b86e6"/><path d="M468 214c28-12 46-34 44-62" stroke="#a9d6ff" stroke-width="6" fill="none" stroke-linecap="round"/>
<ellipse cx="290" cy="250" rx="168" ry="118" fill="url(#w-body)"/>
<path d="M130 290c60 70 260 74 320 0 10 40-40 96-160 96s-170-56-160-96z" fill="#e9f6ff"/>
<g stroke="#bcd9f2" stroke-width="4" fill="none" stroke-linecap="round"><path d="M190 330q100 26 200 0"/><path d="M210 354q80 20 160 0"/></g>
<ellipse cx="148" cy="290" rx="26" ry="50" transform="rotate(30 148 290)" fill="#3b86e6"/><ellipse cx="432" cy="290" rx="26" ry="50" transform="rotate(-30 432 290)" fill="#3b86e6"/>
<ellipse cx="226" cy="230" rx="26" ry="32" fill="#10294f"/><ellipse cx="354" cy="230" rx="26" ry="32" fill="#10294f"/>
<circle cx="235" cy="218" r="10" fill="#fff"/><circle cx="363" cy="218" r="10" fill="#fff"/><circle cx="218" cy="242" r="5" fill="#fff"/><circle cx="346" cy="242" r="5" fill="#fff"/>
<path d="M248 288q42 40 84 0q-42 14-84 0z" fill="#8a2a48"/><path d="M270 298q20 18 40 0q-20 6-40 0z" fill="#ff8aa6"/>
<circle cx="180" cy="270" r="17" fill="#ff8aa6" opacity=".55"/><circle cx="400" cy="270" r="17" fill="#ff8aa6" opacity=".55"/>
<path d="M220 168q70-34 150 0" stroke="#a9d6ff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`,
  grass: `<defs>
<linearGradient id="g-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6b8"/><stop offset=".45" stop-color="#b7e98a"/><stop offset="1" stop-color="#3f9e4a"/></linearGradient>
<radialGradient id="g-sun" cx=".8" cy=".12" r=".4"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
</defs>
<rect width="584" height="420" fill="url(#g-bg)"/><rect width="584" height="420" fill="url(#g-sun)"/>
<circle cx="480" cy="62" r="34" fill="#fffbe0"/>
<g fill="#2f7a3a" opacity=".85"><path d="M0 300q40-110 90-20 20-100 70-10 30-70 70 20v130H0z"/><path d="M584 310q-40-100-90-20-24-96-70-10-34-60-72 20v120h232z"/></g>
<g fill="#7a4f2a"><rect x="62" y="270" width="12" height="60"/><rect x="520" y="270" width="12" height="60"/></g>
<path d="M0 360q150-50 292-10t292-10v80H0z" fill="#2f8a3c"/>
<g fill="#fff" opacity=".9"><circle cx="110" cy="200" r="4"/><circle cx="160" cy="150" r="3"/><circle cx="440" cy="190" r="4"/><circle cx="400" cy="120" r="3"/><circle cx="60" cy="100" r="3"/></g>
<g fill="#ff9ec0"><circle cx="110" cy="380" r="9"/><circle cx="480" cy="386" r="9"/><circle cx="520" cy="370" r="7"/></g><g fill="#fff"><circle cx="110" cy="380" r="3"/><circle cx="480" cy="386" r="3"/></g>
<ellipse cx="292" cy="398" rx="200" ry="18" fill="#1f5a2a" opacity=".5"/>
<ellipse cx="292" cy="252" rx="176" ry="140" fill="#3f9a4a"/><ellipse cx="292" cy="236" rx="150" ry="118" fill="#58b85c"/>
<g fill="none" stroke="#2f7a3a" stroke-width="6" stroke-linejoin="round"><path d="M292 124l56 32v62l-56 32-56-32v-62z"/><path d="M236 156 176 140M348 156l60-16M236 218l-60 20M348 218l60 20M292 124V96M292 250v34"/><path d="M176 140l-30 62 30 36M408 140l30 62-30 36"/></g>
<path d="M292 118c-4-40 4-64 0-86" stroke="#2f7a3a" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M292 62c-50-30-90-4-96 28 44 14 84 0 96-28z" fill="#5fd06a"/><path d="M292 62c50-30 90-4 96 28-44 14-84 0-96-28z" fill="#4cbf5c"/><path d="M292 62c-30-8-60 2-80 18" stroke="#2f8a3c" stroke-width="3" fill="none"/>
<circle cx="292" cy="30" r="14" fill="#ffd3e4"/><circle cx="292" cy="30" r="6" fill="#ffb347"/>
<ellipse cx="190" cy="372" rx="38" ry="22" fill="#a9d878"/><ellipse cx="394" cy="372" rx="38" ry="22" fill="#a9d878"/>
<ellipse cx="292" cy="300" rx="104" ry="84" fill="#b8e486"/>
<ellipse cx="292" cy="290" rx="86" ry="66" fill="#c9ee9c"/>
<ellipse cx="248" cy="270" rx="22" ry="28" fill="#1d3a22"/><ellipse cx="336" cy="270" rx="22" ry="28" fill="#1d3a22"/>
<circle cx="256" cy="259" r="9" fill="#fff"/><circle cx="344" cy="259" r="9" fill="#fff"/><circle cx="241" cy="280" r="4.5" fill="#fff"/><circle cx="329" cy="280" r="4.5" fill="#fff"/>
<path d="M270 312q22 24 44 0q-22 8-44 0z" fill="#7a2f3c"/><ellipse cx="292" cy="298" rx="6" ry="4" fill="#3b6a3a"/>
<circle cx="210" cy="298" r="14" fill="#ff9ec0" opacity=".6"/><circle cx="374" cy="298" r="14" fill="#ff9ec0" opacity=".6"/>`,
  elec: `<defs>
<linearGradient id="e-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1445"/><stop offset=".6" stop-color="#5a3aa8"/><stop offset="1" stop-color="#ffcf4a"/></linearGradient>
<radialGradient id="e-gl" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#fff3a0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></radialGradient>
</defs>
<rect width="584" height="420" fill="url(#e-bg)"/><circle cx="292" cy="250" r="260" fill="url(#e-gl)"/>
<g fill="#2b1f66" opacity=".8"><ellipse cx="90" cy="70" rx="110" ry="40"/><ellipse cx="200" cy="40" rx="100" ry="36"/><ellipse cx="500" cy="60" rx="120" ry="42"/><ellipse cx="400" cy="30" rx="90" ry="30"/></g>
<path d="M150 0 90 140h50L100 260l120-160h-52L220 0z" fill="#fff6a8" opacity=".9"/><path d="M470 0l-50 110h44l-34 120 110-150h-46L520 0z" fill="#fff6a8" opacity=".75"/>
<g fill="#fff" opacity=".9"><path d="M60 330l6 12 12 6-12 6-6 12-6-12-12-6 12-6zM520 340l5 10 10 5-10 5-5 10-5-10-10-5 10-5z"/></g>
<path d="M0 392q150-30 292-6t292-8v42H0z" fill="#3a2a78"/><ellipse cx="292" cy="398" rx="190" ry="18" fill="#1c1445" opacity=".6"/>
<path d="M392 330l40-60-28-10 70-100-20-8 80-90-20 70 34 8-70 78 30 6-40 100-30-20-26 40z" fill="#ffd21f" stroke="#c88a00" stroke-width="4" stroke-linejoin="round"/>
<path d="M392 330c-30 10-60 4-70-14l30-10z" fill="#2f9fe0"/>
<ellipse cx="230" cy="378" rx="30" ry="15" fill="#2f9fe0"/><ellipse cx="354" cy="378" rx="30" ry="15" fill="#2f9fe0"/>
<ellipse cx="292" cy="312" rx="96" ry="78" fill="#5cc4ff"/><ellipse cx="292" cy="330" rx="58" ry="48" fill="#eefaff"/>
<ellipse cx="204" cy="300" rx="22" ry="36" transform="rotate(25 204 300)" fill="#5cc4ff"/><ellipse cx="380" cy="300" rx="22" ry="36" transform="rotate(-25 380 300)" fill="#5cc4ff"/>
<g stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M170 300l-24-26 26-4-20-24"/><path d="M416 300l24-26-26-4 20-24"/></g>
<path d="M196 150 168 40l74 58z" fill="#5cc4ff"/><path d="M196 128 182 70l36 28z" fill="#ffe14d"/><path d="M388 150 416 40l-74 58z" fill="#5cc4ff"/><path d="M388 128 402 70l-36 28z" fill="#ffe14d"/>
<ellipse cx="292" cy="205" rx="112" ry="92" fill="#74d0ff"/><path d="M292 112l-22 40h18l-12 36 34-46h-20l16-30z" fill="#ffe14d" stroke="#c88a00" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="292" cy="236" rx="54" ry="38" fill="#eefaff"/>
<ellipse cx="248" cy="198" rx="23" ry="30" fill="#2a1710"/><ellipse cx="336" cy="198" rx="23" ry="30" fill="#2a1710"/>
<circle cx="256" cy="186" r="9" fill="#fff"/><circle cx="344" cy="186" r="9" fill="#fff"/><circle cx="242" cy="208" r="4.5" fill="#fff"/><circle cx="330" cy="208" r="4.5" fill="#fff"/>
<ellipse cx="292" cy="228" rx="9" ry="6" fill="#3a1a10"/><path d="M270 244q22 24 44 0q-22 8-44 0z" fill="#2a4a7a"/>
<circle cx="196" cy="236" r="19" fill="#ffe14d"/><circle cx="388" cy="236" r="19" fill="#ffe14d"/>
<g stroke="#c88a00" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M180 238l8-10 4 8 8-10"/><path d="M372 238l8-10 4 8 8-10"/></g>`,
  psy: `<defs>
<linearGradient id="p-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1650"/><stop offset=".55" stop-color="#6a3aa8"/><stop offset="1" stop-color="#ff9ad0"/></linearGradient>
<radialGradient id="p-moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe8"/><stop offset=".8" stop-color="#ffeec0"/><stop offset="1" stop-color="#ffeec0" stop-opacity="0"/></radialGradient>
</defs>
<rect width="584" height="420" fill="url(#p-bg)"/>
<circle cx="292" cy="190" r="190" fill="url(#p-moon)" opacity=".9"/>
<g fill="#fff" opacity=".95"><path d="M60 70l5 12 12 5-12 5-5 12-5-12-12-5 12-5zM510 100l4 10 10 4-10 4-4 10-4-10-10-4 10-4zM120 190l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM470 220l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM40 270l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="180" cy="50" r="3"/><circle cx="400" cy="40" r="3"/><circle cx="550" cy="180" r="3"/><circle cx="30" cy="160" r="3"/></g>
<g fill="#f6c6f0" opacity=".85"><ellipse cx="80" cy="360" rx="120" ry="40"/><ellipse cx="220" cy="390" rx="130" ry="36"/><ellipse cx="500" cy="372" rx="130" ry="42"/><ellipse cx="380" cy="400" rx="120" ry="32"/></g>
<ellipse cx="292" cy="398" rx="150" ry="16" fill="#8a4aa8" opacity=".4"/>
<g transform="translate(440 300)"><circle r="40" fill="#fff"/><circle cx="-8" cy="-6" r="28" fill="#fff4fb"/></g>
<ellipse cx="236" cy="376" rx="32" ry="17" fill="#f3d4f6"/><ellipse cx="348" cy="376" rx="32" ry="17" fill="#f3d4f6"/>
<ellipse cx="292" cy="310" rx="96" ry="80" fill="#f8e2fa"/><ellipse cx="292" cy="330" rx="58" ry="48" fill="#fff"/>
<ellipse cx="206" cy="304" rx="20" ry="34" transform="rotate(22 206 304)" fill="#f8e2fa"/><ellipse cx="378" cy="304" rx="20" ry="34" transform="rotate(-22 378 304)" fill="#f8e2fa"/>
<g transform="translate(150 262)"><path d="M0 24l5-14 5 14 14 5-14 5-5 14-5-14-14-5z" fill="#ffe36b"/></g>
<path d="M214 170C190 110 188 50 214 8c26 40 30 100 8 164z" fill="#f8e2fa"/><path d="M216 150c-16-44-16-90 0-120 16 30 16 80 2 122z" fill="#ffb0dc"/>
<path d="M370 170c24-50 52-84 70-88-8 36-30 78-60 98z" fill="#f8e2fa"/><path d="M376 150c20-34 38-56 52-62-6 24-22 52-46 70z" fill="#ffb0dc"/>
<ellipse cx="292" cy="212" rx="112" ry="92" fill="#fbe8fc"/>
<path d="M292 128c-14 6-22 18-22 32 6-4 12-5 18 0 6-14 4-24 4-32z" fill="#ffd54a" stroke="#e0a800" stroke-width="2"/>
<ellipse cx="248" cy="212" rx="24" ry="31" fill="#3a1f5e"/><ellipse cx="336" cy="212" rx="24" ry="31" fill="#3a1f5e"/>
<circle cx="257" cy="200" r="10" fill="#fff"/><circle cx="345" cy="200" r="10" fill="#fff"/><circle cx="241" cy="222" r="5" fill="#fff"/><circle cx="329" cy="222" r="5" fill="#fff"/>
<path d="M286 238l6 5 6-5z" fill="#d86aa8"/><path d="M276 250q16 14 32 0" stroke="#a04a88" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="208" cy="244" r="16" fill="#ff8ac8" opacity=".6"/><circle cx="376" cy="244" r="16" fill="#ff8ac8" opacity=".6"/>`,
  dark: `<defs>
<linearGradient id="d-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a26"/><stop offset=".7" stop-color="#262060"/><stop offset="1" stop-color="#44307a"/></linearGradient>
<radialGradient id="d-moon" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#e8e4ff"/><stop offset="1" stop-color="#8a80d8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="584" height="420" fill="url(#d-bg)"/><circle cx="292" cy="170" r="175" fill="url(#d-moon)"/><circle cx="292" cy="170" r="118" fill="#f1eeff"/>
<g fill="#d8d3f6"><circle cx="250" cy="130" r="18"/><circle cx="340" cy="190" r="26"/><circle cx="300" cy="100" r="10"/></g>
<g fill="#fff"><circle cx="60" cy="60" r="2.5"/><circle cx="120" cy="140" r="2"/><circle cx="500" cy="80" r="2.5"/><circle cx="540" cy="170" r="2"/><circle cx="450" cy="30" r="2"/><circle cx="40" cy="220" r="2"/></g>
<g fill="#ffe97a"><circle cx="90" cy="300" r="4"/><circle cx="500" cy="300" r="4"/><circle cx="130" cy="250" r="3"/><circle cx="470" cy="240" r="3"/></g>
<g fill="#120f34"><path d="M0 420V250l20-60 20 60 24-40 24 40 20-30 24 60v140z"/><path d="M584 420V240l-20-60-20 60-24-40-24 40-20-30-24 60v150z"/></g>
<path d="M0 396q150-22 292-4t292-8v36H0z" fill="#0b0924"/>
<path d="M40 340q250 22 504 0v18q-254 24-504 0z" fill="#5a3f2a"/>
<path d="M130 220c-70-20-120 40-120 120 40-20 90-10 120 10z" fill="#3a2f78"/><path d="M454 220c70-20 120 40 120 120-40-20-90-10-120 10z" fill="#3a2f78"/>
<path d="M120 250c-40 0-76 26-90 70M464 250c40 0 76 26 90 70" stroke="#6a5ab8" stroke-width="5" fill="none" stroke-linecap="round"/>
<ellipse cx="292" cy="290" rx="112" ry="100" fill="#4b3a8a"/><ellipse cx="292" cy="312" rx="72" ry="72" fill="#9a8ad8"/>
<g fill="none" stroke="#7a68c0" stroke-width="4" stroke-linecap="round"><path d="M250 290q10 12 20 0M274 290q10 12 20 0M298 290q10 12 20 0M322 290q10 12 20 0M262 318q10 12 20 0M286 318q10 12 20 0M310 318q10 12 20 0M274 346q10 12 20 0M298 346q10 12 20 0"/></g>
<g fill="#ff9a2e"><path d="M214 372l-10 16 16-4zM232 376l-4 18 14-8zM370 372l10 16-16-4zM352 376l4 18-14-8z"/></g>
<path d="M200 140 176 52l62 46z" fill="#3a2f78"/><path d="M384 140 408 52l-62 46z" fill="#3a2f78"/>
<ellipse cx="292" cy="200" rx="114" ry="94" fill="#4b3a8a"/>
<ellipse cx="292" cy="212" rx="94" ry="72" fill="#7a68c0"/>
<circle cx="244" cy="206" r="40" fill="#ffe36b"/><circle cx="340" cy="206" r="40" fill="#ffe36b"/>
<circle cx="244" cy="206" r="40" fill="none" stroke="#2a1f58" stroke-width="5"/><circle cx="340" cy="206" r="40" fill="none" stroke="#2a1f58" stroke-width="5"/>
<circle cx="248" cy="210" r="22" fill="#1b1238"/><circle cx="336" cy="210" r="22" fill="#1b1238"/>
<circle cx="257" cy="198" r="9" fill="#fff"/><circle cx="345" cy="198" r="9" fill="#fff"/><circle cx="240" cy="220" r="4.5" fill="#fff"/><circle cx="328" cy="220" r="4.5" fill="#fff"/>
<path d="M280 232l12 22 12-22z" fill="#ff9a2e"/>
<circle cx="200" cy="248" r="13" fill="#ff7aa8" opacity=".5"/><circle cx="384" cy="248" r="13" fill="#ff7aa8" opacity=".5"/>`,
};
