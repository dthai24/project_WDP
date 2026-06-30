import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/shared/layout/Header";
import Footer from "@/shared/layout/Footer";
import ChatBot from "@/shared/ui/ChatBot/ChatBot";
import FloatingChatButton from "@/shared/ui/ChatBot/FloatingChatButton";

/** Chiều cao header — dùng cho sticky offset trong mentor builder. */
export const HEADER_HEIGHT = 68;

/** Padding cho vùng nội dung page (mentor layout dùng). */
export const pageContentSx = {
  width: "100%",
  boxSizing: "border-box",
  py: { xs: 2, sm: 3, md: 4 },
  px: { xs: 2, sm: 3, md: 4, lg: 6 },
};

export default function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-slate-900 antialiased">
      <Header />
      <main className="flex-1 pt-16 sm:pt-[68px]">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatButton onClick={() => setChatOpen(true)} />
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
