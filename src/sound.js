// Hiệu ứng âm thanh (Web Audio) và giọng đọc tiếng Việt (Speech Synthesis)
let ctx = null;
let enabled = true;
let viVoice = null;

export const setSoundEnabled = (on) => {
  enabled = on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
};

// Tìm giọng tiếng Việt có sẵn trên máy (macOS/iOS: "Linh", Android/Chrome: Google Tiếng Việt)
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  viVoice = voices.find((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('vi')) || null;
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

// Đọc một câu, trả về Promise xong khi đọc hết (hoặc quá thời gian chờ)
export function speak(text, { rate = 0.85, pitch = 1.15 } = {}) {
  return new Promise((resolve) => {
    if (!enabled || !('speechSynthesis' in window)) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    if (viVoice) u.voice = viVoice;
    u.rate = rate;
    u.pitch = pitch;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 1500 + text.length * 120);
    speechSynthesis.speak(u);
  });
}

function audio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return enabled ? ctx : null;
}

// Một nốt nhạc; `to` là tần số đích nếu muốn trượt cao độ
function tone(freq, start, dur, { type = 'sine', vol = 0.25, to } = {}) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Tiếng vỗ tay từ nhiễu trắng
function applause(length = 1.4) {
  const c = audio();
  if (!c) return;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, Math.floor(sr * length), sr);
  const data = buf.getChannelData(0);
  for (let k = 0; k < length * 70; k++) {
    const pos = Math.floor(Math.random() * (data.length - sr * 0.03));
    const fade = 1 - pos / data.length;
    for (let j = 0; j < sr * 0.02; j++) data[pos + j] += (Math.random() * 2 - 1) * Math.exp(-j / (sr * 0.004)) * fade;
  }
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const g = c.createGain();
  src.buffer = buf;
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  g.gain.value = 0.35;
  src.connect(filter).connect(g).connect(c.destination);
  src.start();
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Nhạc khen, mỗi lần chọn ngẫu nhiên một kiểu
const CHEER_SOUNDS = [
  () => [784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.25, { type: 'triangle' })),
  () => [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, { vol: 0.3 })),
  () => tone(400, 0, 0.45, { to: 1800, vol: 0.2 }),
  () => [0, 0.12, 0.24].forEach((s, i) => tone(500 + i * 200, s, 0.1, { to: 1400 + i * 300, vol: 0.3 })),
  () => {
    tone(988, 0, 0.08, { type: 'square', vol: 0.12 });
    tone(1319, 0.08, 0.35, { type: 'square', vol: 0.12 });
  },
  () => applause(1.2),
];

// Tên gọi của bé, chọn ngẫu nhiên cho vui
const NAMES = ['Gin Đẹp Trai', 'Gin Thúi', 'Gin Đẹp Trai', 'Địch Thúi'];
const fill = (t) => t.replaceAll('{n}', pick(NAMES));

// Lời khen đa dạng cho bé
const PRAISES = [
  'Giỏi quá {n} ơi!',
  '{n} siêu quá!',
  'Hoan hô {n}!',
  'Tuyệt vời! Thơm {n} một cái nào!',
  'Oa! {n} giỏi nhất nhà!',
  '{n} chọn đúng rồi, vỗ tay nào!',
  'Quá đỉnh luôn {n} ơi!',
  'Yeah! {n} làm được rồi!',
  'Chính xác! {n} là số một!',
  'Hay quá hay quá! {n} giỏi ghê!',
  'Bác Cú Mèo khen {n} thông minh quá!',
  'Các bạn thú đang vỗ tay cho {n} kìa!',
];

const TRY_AGAIN = [
  'Chưa đúng rồi, {n} thử lại nha!',
  'Ồ, chưa phải rồi. {n} tìm lại nào!',
  'Gần đúng rồi! {n} thử cái khác xem!',
  'Hì hì, chưa phải. {n} chọn lại nha!',
];

const BIG_PRAISES = [
  'Oa! {n} xong chặng này rồi! Giỏi quá đi!',
  'Hoan hô {n}! Các bạn thú cảm ơn {n} nhiều lắm!',
  '{n} là nhà thám hiểm giỏi nhất Rừng Xanh!',
];

export function cheer() {
  pick(CHEER_SOUNDS)();
  return fill(pick(PRAISES));
}

export function oops() {
  tone(300, 0, 0.18, { type: 'triangle', to: 180, vol: 0.2 });
  return fill(pick(TRY_AGAIN));
}

export function bigCheer() {
  applause(2);
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', vol: 0.25 }));
  return fill(pick(BIG_PRAISES));
}

export function pop() {
  tone(600, 0, 0.12, { to: 1200, vol: 0.25 });
}

// Nhạc vui cho bữa tiệc (giai điệu tự sáng tác)
export function partyTune() {
  const notes = [523, 523, 659, 784, 659, 784, 1047, 880, 784, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, i * 0.18, 0.22, { type: 'triangle', vol: 0.22 }));
  applause(2.4);
}

// Tiếng "măm măm" khi cho ăn
export function munch() {
  [0, 0.16, 0.32].forEach((s) => tone(260, s, 0.1, { type: 'square', to: 180, vol: 0.12 }));
}

// Tiếng bóng nổ
export function balloonPop() {
  tone(900, 0, 0.08, { type: 'square', to: 120, vol: 0.3 });
}
