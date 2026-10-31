# Bé Đoán Con Vật 🐶

Game đoán con vật cho bé 2–3 tuổi (React + Vite).

Chơi online: https://quanvpit.github.io/animals-game/

## Cách chơi
- 🔊 **Nghe tên**: máy đọc tên con vật, bé chạm đúng hình.
- 🍌 **Ai thích ăn?**: hiện thức ăn, bé chọn con vật thích ăn món đó.
- 🎵 **Ai kêu thế?**: máy đọc tiếng kêu (gâu gâu, meo meo…), bé chọn con vật.
- 🌑 **Tìm bóng**: hiện bóng đen, bé tìm con vật đúng.
- 🎈 **Chơi tự do**: chạm con nào thì nghe tên và tiếng kêu con đó, không có đúng sai.

Chọn sai 2 lần thì hình đúng sẽ sáng lên để gợi ý. Cứ 5 câu đúng là được ăn mừng to.
Chạm vào khung câu hỏi để nghe lại. Ở menu chỉnh được số hình mỗi câu (2, 3 hoặc 4).

## Chạy
```bash
npm install
npm run dev      # mở http://localhost:5173 (dùng được trên điện thoại cùng wifi)
npm run build    # tạo thư mục dist/
```

Giọng đọc dùng giọng tiếng Việt có sẵn trên máy (Safari/iPhone/iPad có sẵn; Chrome cũng có).

## Cập nhật bản online
```bash
npm run deploy
```
Lệnh này build game và đẩy lên nhánh `gh-pages`; GitHub Pages tự cập nhật sau khoảng 1 phút.
