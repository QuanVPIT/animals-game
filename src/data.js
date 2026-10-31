// Hình sticker nằm trong public/stickers/<id>.webp
export const sticker = (id) => `${import.meta.env.BASE_URL}stickers/${id}.webp`;
export const GIN_PHOTO = `${import.meta.env.BASE_URL}gin.webp`;

// 20 bạn thú trong Rừng Xanh. `food` = món bạn ấy thích, `sound` = tiếng kêu (nếu có)
export const ANIMALS = [
  { id: 'bear', name: 'con gấu', food: { emoji: '🍯', name: 'mật ong' }, sound: 'gừ gừ' },
  { id: 'fox', name: 'con cáo', food: { emoji: '🍇', name: 'quả nho' } },
  { id: 'rabbit', name: 'con thỏ', food: { emoji: '🥕', name: 'cà rốt' } },
  { id: 'koala', name: 'con gấu túi', food: { emoji: '🌿', name: 'lá cây' } },
  { id: 'lion', name: 'con sư tử', food: { emoji: '🍖', name: 'thịt' }, sound: 'gừm gừm' },
  { id: 'giraffe', name: 'con hươu cao cổ', food: { emoji: '🌿', name: 'lá cây' } },
  { id: 'elephant', name: 'con voi', food: { emoji: '🍉', name: 'dưa hấu' } },
  { id: 'panda', name: 'con gấu trúc', food: { emoji: '🎋', name: 'lá tre' } },
  { id: 'monkey', name: 'con khỉ', food: { emoji: '🍌', name: 'quả chuối' }, sound: 'khẹc khẹc' },
  { id: 'hedgehog', name: 'con nhím', food: { emoji: '🍎', name: 'quả táo' } },
  { id: 'owl', name: 'con cú mèo', food: { emoji: '🐛', name: 'con sâu' }, sound: 'cú cú' },
  { id: 'penguin', name: 'con chim cánh cụt', food: { emoji: '🐟', name: 'con cá' } },
  { id: 'tiger', name: 'con hổ', food: { emoji: '🍖', name: 'thịt' }, sound: 'gầm gừ' },
  { id: 'deer', name: 'con hươu', food: { emoji: '🌾', name: 'cỏ' } },
  { id: 'squirrel', name: 'con sóc', food: { emoji: '🌰', name: 'hạt dẻ' } },
  { id: 'dog', name: 'con chó', food: { emoji: '🦴', name: 'khúc xương' }, sound: 'gâu gâu' },
  { id: 'cat', name: 'con mèo', food: { emoji: '🐟', name: 'con cá' }, sound: 'meo meo' },
  { id: 'turtle', name: 'con rùa', food: { emoji: '🥬', name: 'rau xanh' } },
  { id: 'parrot', name: 'con vẹt', food: { emoji: '🌻', name: 'hạt hướng dương' } },
  { id: 'bee', name: 'con ong', food: { emoji: '🌸', name: 'mật hoa' }, sound: 'vo ve' },
];

// Màu cho trò bóng bay. `like` = bạn thú/đồ vật có màu đó để bé liên tưởng
export const COLORS = [
  { id: 'red', name: 'màu đỏ', hex: '#e53935', like: { animal: 'parrot', text: 'giống bạn Vẹt đấy' } },
  { id: 'yellow', name: 'màu vàng', hex: '#fdd835', like: { animal: 'bee', text: 'giống bạn Ong đấy' } },
  { id: 'green', name: 'màu xanh lá cây', hex: '#43a047', like: { animal: 'turtle', text: 'giống bạn Rùa đấy' } },
  { id: 'blue', name: 'màu xanh da trời', hex: '#1e88e5', like: { emoji: '🌤️', text: 'giống bầu trời đấy' } },
  { id: 'orange', name: 'màu cam', hex: '#fb8c00', like: { animal: 'fox', text: 'giống bạn Cáo đấy' } },
  { id: 'pink', name: 'màu hồng', hex: '#f06292', like: { emoji: '🌸', text: 'giống bông hoa đấy' } },
  { id: 'purple', name: 'màu tím', hex: '#8e24aa', like: { emoji: '🍇', text: 'giống quả nho đấy' } },
  { id: 'brown', name: 'màu nâu', hex: '#8d5a3b', like: { animal: 'bear', text: 'giống bạn Gấu đấy' } },
];

// Các chặng trên bản đồ Rừng Xanh
export const STAGES = [
  { id: 'find', icon: '🔍', title: 'Tìm bạn thú', hint: 'Nghe tên, chạm hình', color: '#7bdff2' },
  { id: 'feed', icon: '🍯', title: 'Cho bạn ăn', hint: 'Bạn thích ăn gì?', color: '#ffc75f' },
  { id: 'color', icon: '🎈', title: 'Bóng bay sắc màu', hint: 'Đoán màu', color: '#ff8fab' },
  { id: 'party', icon: '🎂', title: 'Tiệc sinh nhật', hint: 'Bữa tiệc lớn', color: '#b8a1ff' },
];

export const ROUNDS = 5;

export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "con gấu" -> "bạn Gấu" (cách gọi thân mật trong truyện)
export const friend = (a) => 'bạn ' + cap(a.name.replace(/^con /, '').replace(/^chim /, ''));

// Tạo danh sách câu hỏi cho một chặng: mỗi câu có đáp án và các lựa chọn
export function makeRounds(stage, count) {
  if (stage === 'color') {
    let last = null;
    return Array.from({ length: ROUNDS }, () => {
      const answer = pick(COLORS.filter((c) => c.id !== last));
      last = answer.id;
      const others = shuffle(COLORS.filter((c) => c.id !== answer.id)).slice(0, count - 1);
      return { answer, choices: shuffle([answer, ...others]) };
    });
  }
  return shuffle(ANIMALS)
    .slice(0, ROUNDS)
    .map((answer) => {
      // Chặng "cho ăn": lựa chọn là các món khác nhau
      const pool =
        stage === 'feed'
          ? ANIMALS.filter((a) => a.food.name !== answer.food.name)
          : ANIMALS.filter((a) => a.id !== answer.id);
      const others = [];
      for (const a of shuffle(pool)) {
        if (others.length === count - 1) break;
        if (stage === 'feed' && others.some((o) => o.food.name === a.food.name)) continue;
        others.push(a);
      }
      return { answer, choices: shuffle([answer, ...others]) };
    });
}
