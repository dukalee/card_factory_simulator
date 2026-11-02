import type { CardDef, CardKey, EnergyType } from './types';

/** 에너지/타입 아이콘 (24×24 path)과 둥근 아이콘 배경 */
export const ENERGY: Record<EnergyType, { path: string; bg: string; label: string }> = {
  fire: {
    label: '불꽃',
    path: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',
    bg: 'radial-gradient(circle at 35% 30%,#ff9a6a,#e23b1e)',
  },
  water: {
    label: '물',
    path: 'M12 2C9 7 6 10 6 14a6 6 0 0 0 12 0c0-4-3-7-6-12z',
    bg: 'radial-gradient(circle at 35% 30%,#7fc4ff,#1f6fd0)',
  },
  grass: {
    label: '풀',
    path: 'M20 4C10 4 5 9 5 16c0 1 0 2 .5 3 .5-4 3-7 7-9-3 3-4 5-4.5 8.5C16 18 20 13 20 4z',
    bg: 'radial-gradient(circle at 35% 30%,#8be28a,#2f9a3e)',
  },
  elec: {
    label: '전기',
    path: 'M13 2 5 14h6l-1 8 9-13h-6z',
    bg: 'radial-gradient(circle at 35% 30%,#ffe872,#e0a800)',
  },
  psy: {
    label: '에스퍼',
    path: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
    bg: 'radial-gradient(circle at 35% 30%,#f2a6f0,#a94bc0)',
  },
  dark: {
    label: '악',
    path: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z',
    bg: 'radial-gradient(circle at 35% 30%,#8b7fd0,#3a2f78)',
  },
  norm: {
    label: '무색',
    path: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
    bg: 'radial-gradient(circle at 35% 30%,#f4f4f8,#a9acb8)',
  },
};

export const CARD_DEFS: Record<CardKey, CardDef> = {
  fire: {
    name: '불씨여우',
    hp: 90,
    no: '002/100',
    rarity: 'R',
    flavor: '꼬리 끝에 작은 불씨를 품은 장난꾸러기',
    colors: { c1: '#7a2418', c2: '#d0502e', c3: '#f8cdb0', box: '#fdeedd', gold: '#d9a84a' },
    attacks: [
      { energy: ['fire'], name: '불똥 튀기기', damage: '20', text: '동전을 던져 앞면이 나오면 상대를 화상 상태로 만든다.' },
      { energy: ['fire', 'fire', 'norm'], name: '화염 꼬리치기', damage: '90', text: '이 포켓몬에게 불 에너지가 3개 이상 붙어 있으면 상대의 벤치에도 20데미지를 준다.' },
    ],
    weakness: 'water',
    retreat: 1,
    lore: ['꼬리의 불꽃은 기분에 따라 크기가 변한다.', '화가 나면 활활, 기쁘면 살랑살랑 흔들린다.'],
  },
  water: {
    name: '방울고래',
    hp: 120,
    no: '003/100',
    rarity: 'RR',
    flavor: '물방울을 뿜어 무지개를 만드는 아기 고래',
    colors: { c1: '#123c70', c2: '#2b7bc8', c3: '#c5e3fb', box: '#e1f0fc', gold: '#d9b45a' },
    attacks: [
      { energy: ['water'], name: '물방울 쏘기', damage: '30', text: '상대 벤치의 포켓몬 1마리에게도 10데미지를 준다.' },
      { energy: ['water', 'water', 'norm'], name: '해일 파도', damage: '110', text: '다음 차례에 이 포켓몬은 이 기술을 사용할 수 없다.' },
    ],
    weakness: 'elec',
    retreat: 2,
    lore: ['등의 분수공으로 물방울을 뿜는다.', '햇빛이 비치면 작은 무지개가 생긴다.'],
  },
  grass: {
    name: '잎새거북',
    hp: 110,
    no: '004/100',
    rarity: 'R',
    flavor: '등껍질 위에서 새싹이 자라는 느긋한 거북',
    colors: { c1: '#1d5a2d', c2: '#3f9d4d', c3: '#d3f0c4', box: '#e6f5db', gold: '#d2b050' },
    attacks: [
      { energy: ['grass'], name: '덩굴 휘감기', damage: '20', text: '상대의 후퇴 에너지를 다음 차례까지 1개 늘린다.' },
      { energy: ['grass', 'grass', 'norm'], name: '광합성 폭발', damage: '80+', text: '이 포켓몬에게 붙은 풀 에너지 1개당 데미지를 10 추가하고 HP를 30 회복한다.' },
    ],
    weakness: 'fire',
    retreat: 3,
    lore: ['등껍질의 새싹은 햇빛을 받을수록 자란다.', '꽃이 피면 주변이 향기로 가득해진다.'],
  },
  elec: {
    name: '찌릿냥',
    hp: 80,
    no: '005/100',
    rarity: 'RR',
    flavor: '번개 모양 꼬리가 자랑인 장난꾸러기 고양이',
    colors: { c1: '#6a4f00', c2: '#dcab10', c3: '#fdeea0', box: '#fff6cf', gold: '#c99a2a' },
    attacks: [
      { energy: ['elec'], name: '정전기 찌릿', damage: '20', text: '동전을 던져 앞면이 나오면 상대를 마비 상태로 만든다.' },
      { energy: ['elec', 'elec', 'norm'], name: '번개 꼬리', damage: '100', text: '이 포켓몬에게 붙은 에너지를 1개 트래시한다.' },
    ],
    weakness: 'dark',
    retreat: 1,
    lore: ['볼의 전기주머니에 전기를 모은다.', '화가 나면 머리카락이 곤두선다.'],
  },
  psy: {
    name: '달빛토끼',
    hp: 100,
    no: '006/100',
    rarity: 'SR',
    flavor: '보름달 밤에만 모습을 드러내는 신비한 토끼',
    colors: { c1: '#552a6e', c2: '#a655b8', c3: '#f4d6f4', box: '#f8e8f7', gold: '#e0b45a' },
    attacks: [
      { energy: ['psy'], name: '달빛 반짝', damage: '30', text: '상대의 배틀 포켓몬을 잠듦 상태로 만든다.' },
      { energy: ['psy', 'psy', 'norm'], name: '초승달 베기', damage: '90', text: '다음 차례에 이 포켓몬이 받는 데미지를 20 줄인다.' },
    ],
    weakness: 'dark',
    retreat: 1,
    lore: ['이마의 초승달 무늬가 빛나면 소원이 이루어진다고 전해진다.'],
  },
  dark: {
    name: '밤그림부엉',
    hp: 100,
    no: '007/100',
    rarity: 'RR',
    flavor: '달이 뜨는 숲에서 조용히 지켜보는 부엉이',
    colors: { c1: '#171436', c2: '#4a3b8a', c3: '#d6d0f2', box: '#e6e2f6', gold: '#c9a84a' },
    attacks: [
      { energy: ['dark'], name: '어둠 속의 눈', damage: '', text: '상대의 손을 보고, 그중 1장을 골라 덱 맨 아래에 넣는다.' },
      { energy: ['dark', 'dark', 'norm'], name: '그림자 급습', damage: '90', text: '상대의 벤치에 포켓몬이 있으면 데미지를 30 추가한다.' },
    ],
    weakness: 'psy',
    retreat: 2,
    lore: ['어둠 속에서도 모든 것을 꿰뚫어 본다.', '노란 눈동자와 마주치면 움직일 수 없다.'],
  },
};
