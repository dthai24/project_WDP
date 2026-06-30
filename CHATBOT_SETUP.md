# 🤖 EM Assistant Chatbot - Hướng dẫn Setup

## ✅ Đã thiết lập xong:

### 1. **Gemini API Integration**
- ✅ API Key cần được lưu trong `server/.env`
- ✅ Backend route `/api/chat` gọi Gemini API
- ✅ Support cả regular response và streaming response

### 2. **Redux State Management**
- ✅ `chatSlice.js` - Redux store cho quản lý conversation history
- ✅ `store.js` - Redux store configuration
- ✅ `index.js` - Integrated Redux Provider vào app

### 3. **ChatBot Components**
- ✅ `ChatBot.jsx` - Main chat component (modal)
  - Hiển thị tin nhắn từ user và bot
  - Typing indicator animation
  - Error handling
  - Streaming response support
- ✅ `FloatingChatButton.jsx` - Button floating ở góc phải
  - Bounce animation
  - Pulse ring effect
  - Mobile responsive

### 4. **Styling**
- ✅ `ChatBot.css` - Beautiful chat UI
  - Gradient colors
  - Smooth animations
  - Mobile responsive
- ✅ `FloatingChatButton.css` - Floating button styles

## 🚀 Cách chạy:

### Terminal 1 - Start Server:
```bash
cd server
npm run dev
```

### Terminal 2 - Start Client:
```bash
cd client
npm start
```

### Browser:
- Backend chạy trên `http://localhost:5050`
- React app sẽ chạy trên `http://localhost:3000`
- Click button 💬 ở góc phải để mở chatbot
- Chat với EM Assistant!

## 📝 Prompt đã tích hợp:

Chatbot được cấu hình với prompt chi tiết bao gồm:

### Identity:
- Name: **EM Assistant**
- Platform: **English Master (WDP301 Project)**
- Language: Tiếng Việt chuyên nghiệp

### Core Features:
- **Adaptive Learning** - Placement Test + Skip Lesson
- **Gamification** - Daily Streak + Leaderboards + Badges
- **Hybrid Evaluation** - AI Auto-grading + Mentor Feedback

### Target Audience:
- 👶 Cấp 1-2 (Beginner)
- 🎓 Cấp 3 (Intermediate)
- 📚 Đại học & Sau ĐH (Advanced)

### Conversation Strategy:
- ✅ Initial greeting with guided questions
- ✅ Different flows for different user types
- ✅ Formatted output (bullets, bold, emojis)
- ✅ Call-to-action for engagement

## 🔧 Customization:

### Thay đổi prompt:
Chỉnh sửa `SYSTEM_PROMPT` trong `server/src/routes/chatRoutes.js`

### Thay đổi styling:
- `ChatBot.css` - Chat modal styles
- `FloatingChatButton.css` - Button styles

### Thêm tính năng:
- Thêm action creators mới vào `chatSlice.js`
- Update component `ChatBot.jsx` để xử lý tính năng mới

## 🐛 Troubleshooting:

### "API Key is undefined":
- Kiểm tra `server/.env` có `GEMINI_API_KEY`
- Restart backend server sau khi sửa `.env`

### "Chat không hoạt động":
- Mở DevTools (F12) > Console để xem error
- Kiểm tra API key có đúng không
- Kiểm tra network call trong Network tab

### Styling không hoạt động:
- Clear browser cache (Ctrl+Shift+Delete)
- Restart npm server

## 📚 File Structure:

```
client/
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx          # Main chat component
│   │   ├── ChatBot.css
│   │   ├── FloatingChatButton.jsx
│   │   └── FloatingChatButton.css
│   ├── services/
│   │   └── geminiService.js     # Client API wrapper gọi backend
│   ├── redux/
│   │   ├── store.js             # Redux store
│   │   └── chatSlice.js         # Chat reducer
│   ├── App.jsx                  # Updated with chatbot
│   └── index.js                 # Updated with Redux Provider
server/
└── .env                         # GEMINI_API_KEY config
```

## 🎯 Tiếp theo:

1. Test chatbot trên localhost:3000
2. Tune prompt nếu cần
3. Integrate vào pages cần thiết
4. Deploy lên production
5. Monitor API usage

Chúc code tốt! 🎉
