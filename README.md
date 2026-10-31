# Gin Ở Rừng Xanh 🌳

Game đoán con vật cho bé 2–3 tuổi (React + Vite).

Chơi online: https://quanvpit.github.io/animals-game/

## Cốt truyện
Bác Cú Mèo nhờ Gin giúp chuẩn bị sinh nhật bạn Gấu: các bạn thú đi lạc hết rồi! Gin đi qua các chặng trên bản đồ Rừng Xanh:

- 🔍 **Tìm bạn thú**: máy đọc "Con gấu đâu nhỉ?", bé chạm vào hình đúng (không cần biết chữ). Đúng thì máy nói "Đây là con gấu!" và món bạn ấy thích ăn.
- 🍯 **Cho bạn ăn**: bạn thú đói bụng, bé chọn món bạn ấy thích.
- 🎈 **Bóng bay sắc màu**: máy đọc "Gin tìm quả bóng màu đỏ nào!", bé chạm đúng quả bóng.
- 🎂 **Tiệc sinh nhật**: mở khi xong 3 chặng trên. Các bạn thú đã tìm được cùng Gin nhảy múa, chạm vào bạn nào thì nghe tên.
- 📒 **Album**: mỗi bạn thú tìm được thành một sticker trong album (20 bạn).

Mỗi chặng 5 câu. Sai 2 lần thì đáp án đúng sáng lên gợi ý. Ở bản đồ chỉnh được số lựa chọn (2, 3, 4).

Hình con vật nằm ở `public/stickers/`, ảnh Gin ở `public/gin.webp`. Danh sách con vật, thức ăn, màu ở `src/data.js`.

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
