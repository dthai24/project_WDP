import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import BecomeMentor from "../pages/Mentor/BecomeMentor";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/become-mentor" element={<BecomeMentor />} />
        {/*có thể thêm các route khác (Admin, Learner) ở đây */}
      </Routes>
    </BrowserRouter>
  );
}