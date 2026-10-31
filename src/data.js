// Danh sách con vật. `sound` = tiếng kêu, `food` = thức ăn (null nếu không dùng trong màn đó)
export const ANIMALS = [
  { id: 'cho', emoji: '🐶', name: 'con chó', sound: 'gâu gâu', food: { emoji: '🦴', name: 'xương' } },
  { id: 'meo', emoji: '🐱', name: 'con mèo', sound: 'meo meo', food: { emoji: '🐟', name: 'cá' } },
  { id: 'bo', emoji: '🐮', name: 'con bò', sound: 'ò ò', food: { emoji: '🌾', name: 'cỏ' } },
  { id: 'ga', emoji: '🐔', name: 'con gà', sound: 'ò ó o', food: { emoji: '🌽', name: 'ngô' } },
  { id: 'vit', emoji: '🦆', name: 'con vịt', sound: 'cạp cạp', food: { emoji: '🐌', name: 'ốc' } },
  { id: 'lon', emoji: '🐷', name: 'con lợn', sound: 'ụt ịt', food: { emoji: '🥬', name: 'rau' } },
  { id: 'khi', emoji: '🐵', name: 'con khỉ', sound: 'khẹc khẹc', food: { emoji: '🍌', name: 'chuối' } },
  { id: 'tho', emoji: '🐰', name: 'con thỏ', sound: null, food: { emoji: '🥕', name: 'cà rốt' } },
  { id: 'gau', emoji: '🐻', name: 'con gấu', sound: 'gừ gừ', food: { emoji: '🍯', name: 'mật ong' } },
  { id: 'sutu', emoji: '🦁', name: 'con sư tử', sound: 'gừm gừm', food: { emoji: '🍖', name: 'thịt' } },
  { id: 'ech', emoji: '🐸', name: 'con ếch', sound: 'ộp ộp', food: { emoji: '🦟', name: 'muỗi' } },
  { id: 'chuot', emoji: '🐭', name: 'con chuột', sound: 'chít chít', food: { emoji: '🧀', name: 'phô mai' } },
  { id: 'ngua', emoji: '🐴', name: 'con ngựa', sound: 'hí hí', food: { emoji: '🍎', name: 'táo' } },
  { id: 'cuu', emoji: '🐑', name: 'con cừu', sound: 'be be', food: null },
  { id: 'chim', emoji: '🐦', name: 'con chim', sound: 'líu lo', food: null },
  { id: 'voi', emoji: '🐘', name: 'con voi', sound: null, food: null },
  { id: 'ho', emoji: '🐯', name: 'con hổ', sound: 'gầm gừ', food: null },
  { id: 'rua', emoji: '🐢', name: 'con rùa', sound: null, food: null },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

// Các cách chơi. `pool` = con vật dùng được, `ask` = nội dung câu hỏi
export const MODES = [
  {
    id: 'name',
    icon: '🔊',
    title: 'Nghe tên',
    color: '#ff8fab',
    pool: ANIMALS,
    ask: (a) => ({ show: '🔊', label: a.name, say: `${cap(a.name)} đâu? Gin Thúi chỉ ${a.name} nào!` }),
  },
  {
    id: 'food',
    icon: '🍌',
    title: 'Ai thích ăn?',
    color: '#ffc75f',
    pool: ANIMALS.filter((a) => a.food),
    ask: (a) => ({ show: a.food.emoji, label: a.food.name, say: `Ai thích ăn ${a.food.name} nhỉ?` }),
  },
  {
    id: 'sound',
    icon: '🎵',
    title: 'Ai kêu thế?',
    color: '#7bdff2',
    pool: ANIMALS.filter((a) => a.sound),
    ask: (a) => ({ show: '🎵', label: `${cap(a.sound)}!`, say: `${cap(a.sound)}, ${a.sound}! Ai kêu thế nhỉ?` }),
  },
  {
    id: 'shadow',
    icon: '🌑',
    title: 'Tìm bóng',
    color: '#b8a1ff',
    pool: ANIMALS,
    ask: (a) => ({ show: a.emoji, shadow: true, label: 'Bóng của con nào?', say: 'Bóng của con nào đây nhỉ?' }),
  },
];

// Câu hỏi mới: 1 đáp án đúng + các con khác, không lặp lại con vừa hỏi
export function makeQuestion(mode, count, lastId) {
  const pool = mode.pool.filter((a) => a.id !== lastId);
  const answer = pick(pool);
  const others = shuffle(mode.pool.filter((a) => a.id !== answer.id)).slice(0, count - 1);
  return { answer, choices: shuffle([answer, ...others]), ...mode.ask(answer) };
}

export function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
