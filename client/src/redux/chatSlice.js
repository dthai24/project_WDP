import { createSlice } from "@reduxjs/toolkit";

const createInitialMessages = () => [
  {
    id: 1,
    text: "Xin chào! Em là trợ lý giáo dục AI chính thức của nền tảng English Master. 🎓\n\nHôm nay em có thể giúp anh/chị điều gì ạ?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const initialState = {
  messages: createInitialMessages(),
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: state.messages.length + 1,
        text: action.payload.text,
        sender: action.payload.sender,
        timestamp: new Date(),
      });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChat: (state) => {
      state.messages = createInitialMessages();
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  addMessage,
  setLoading,
  setError,
  clearError,
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
