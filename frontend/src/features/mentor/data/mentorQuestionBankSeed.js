/**
 * Seed Question Bank — mỗi chương một bank.
 */

export const mentorQuestionBankSeed = [
  {
    id: 1001,
    title: 'Khởi động & Làm quen thuật ngữ',
    description: 'Luyện tập từ vựng và mẫu câu chào hỏi công sở',
    courseId: 1,
    courseTitle: 'Tiếng Anh Thương Mại & Giao Tiếp Công Sở',
    chapterId: 1,
    chapterTitle: 'Khởi động & Làm quen thuật ngữ',
    status: 'DRAFT',
    sections: [
      {
        tempId: 'seed-section-1',
        DisplayName: 'Bài đọc hiểu',
        SectionTitle: '',
        SkillType: 'READING',
        Description: '',
        Questions: [
          {
            tempId: 'seed-q-1',
            QuestionType: 'MULTIPLE_CHOICE',
            AllowMultipleAnswers: false,
            QuestionText: 'Chọn từ phù hợp: Good ___ , everyone.',
            Score: 10,
            Options: [
              { tempId: 'seed-o-1', OptionText: 'morning', IsCorrect: true },
              { tempId: 'seed-o-2', OptionText: 'night', IsCorrect: false },
            ],
          },
        ],
      },
    ],
    totalQuestionCount: 1,
    publishedQuestionCount: 0,
    draftQuestionCount: 1,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    questionBankUpdatedAt: '2026-03-01T08:00:00.000Z',
  },
];
