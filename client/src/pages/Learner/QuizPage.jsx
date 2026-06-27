import React from "react";
import { moduleQuizQuestions, saveQuizScore } from "../../services/data";
import QuizEngine from "../../components/common/QuizEngine";

export default function QuizPage({ course, moduleTitle, onNavigate, onBack, isFinal }) {
  const questions = moduleQuizQuestions.slice(0, isFinal ? 10 : 5);

  const handleComplete = (result) => {
    saveQuizScore(isFinal ? "final" : moduleTitle || "module", result.correctCount, result.total);
  };

  return (
    <QuizEngine
      questions={questions}
      title={isFinal ? "Bai kiem tra cuoi khoa" : `Kiem tra: ${moduleTitle || "Module"}`}
      subtitle={`${questions.length} cau hoi - ${isFinal ? "30 phut" : "10 phut"}`}
      timeLimit={isFinal ? 1800 : 600}
      passingScore={70}
      onComplete={handleComplete}
      onBack={() => onBack()}
      showInPage={false}
    />
  );
}
