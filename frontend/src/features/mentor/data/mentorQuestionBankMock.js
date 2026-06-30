/**
 * Mock data cho Ngân hàng câu hỏi của Mentor.
 * Replace bằng API khi backend sẵn sàng.
 */

export const mentorQuestionBankMock = [
  {
    courseId: 1,
    courseName: 'Tiếng Anh Thương Mại & Giao Tiếp Công Sở',
    description:
      'Nắm vững thuật ngữ kinh doanh, cách viết email chuyên nghiệp và văn hóa giao tiếp doanh nghiệp.',
    status: 'published',
    totalQuestionCount: 85,
    publishedQuestionCount: 60,
    draftQuestionCount: 25,
    chapterWithQuestionCount: 3,
    quizCount: 4,
    questionBankUpdatedAt: '2026-03-18T10:30:00.000Z',
  },
  {
    courseId: 2,
    courseName: 'IELTS Band 6.5 – Luyện thi Toàn diện',
    description:
      'Chiến lược làm bài 4 kỹ năng Listening, Reading, Writing, Speaking nhắm mục tiêu band 6.5+.',
    status: 'published',
    totalQuestionCount: 120,
    publishedQuestionCount: 95,
    draftQuestionCount: 25,
    chapterWithQuestionCount: 5,
    quizCount: 8,
    questionBankUpdatedAt: '2026-04-02T14:15:00.000Z',
  },
  {
    courseId: 3,
    courseName: 'Tiếng Anh Giao Tiếp Đời Sống Hằng Ngày',
    description:
      'Luyện tập các tình huống giao tiếp thường nhật như mua sắm, hỏi đường, nhà hàng, du lịch.',
    status: 'published',
    totalQuestionCount: 64,
    publishedQuestionCount: 64,
    draftQuestionCount: 0,
    chapterWithQuestionCount: 4,
    quizCount: 5,
    questionBankUpdatedAt: '2026-02-10T09:00:00.000Z',
  },
];

/** Map mock course → item cho MentorQuestionBankList. */
export function mapQuestionBankMockToListItems(items = mentorQuestionBankMock) {
  return items.map((item) => ({
    CourseId: item.courseId,
    CourseName: item.courseName,
    CourseDescription: item.description,
    IsPublished: item.status === 'published',
    TotalQuestion: item.totalQuestionCount ?? 0,
    TotalQuestionIsPublic: item.publishedQuestionCount ?? 0,
    TotalDraftQuestion: item.draftQuestionCount ?? 0,
    ChapterWithQuestionCount: item.chapterWithQuestionCount ?? 0,
    QuizCount: item.quizCount ?? 0,
    UpdatedAt: item.questionBankUpdatedAt,
    Thumbnail: null,
  }));
}

/** Mục lục chương demo cho editor (cột phải). */
export const mentorCourseChaptersOutlineMock = {
  1: [
    {
      chapterId: 1,
      chapterTitle: 'Khởi động & Làm quen thuật ngữ',
      lessons: [{ lessonId: 101, lessonTitle: 'Chào hỏi công sở' }],
    },
    {
      chapterId: 2,
      chapterTitle: 'Kỹ năng viết Email chuyên nghiệp',
      lessons: [{ lessonId: 201, lessonTitle: 'Cấu trúc email' }],
    },
  ],
  3: [
    {
      chapterId: 1,
      chapterTitle: 'Chào hỏi & Giới thiệu bản thân',
      lessons: [{ lessonId: 301, lessonTitle: 'Hello & Hi' }],
    },
    {
      chapterId: 2,
      chapterTitle: 'Mua sắm & Hỏi giá',
      lessons: [{ lessonId: 302, lessonTitle: 'How much is it?' }],
    },
    {
      chapterId: 3,
      chapterTitle: 'Nhà hàng & Gọi món',
      lessons: [{ lessonId: 303, lessonTitle: 'Can I have the menu?' }],
    },
  ],
};

/** Bank theo chương — demo MentorCourseQuestionsPage. */
export const mentorCourseChapterBanksMock = {
  3: [
    {
      id: 3001,
      chapterId: 1,
      chapterTitle: 'Chào hỏi & Giới thiệu bản thân',
      title: 'Chào hỏi & Giới thiệu bản thân',
      totalQuestionCount: 15,
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 3002,
      chapterId: 2,
      chapterTitle: 'Mua sắm & Hỏi giá',
      title: 'Mua sắm & Hỏi giá',
      totalQuestionCount: 18,
      updatedAt: '2026-03-28T14:30:00.000Z',
    },
  ],
};

export function getMockChapterBanksForCourse(courseId) {
  return mentorCourseChapterBanksMock[Number(courseId)] ?? [];
}

export function getMockCourseFromQuestionBank(courseId) {
  return mentorQuestionBankMock.find((item) => String(item.courseId) === String(courseId)) ?? null;
}

export function getMockChaptersForCourse(courseId) {
  return mentorCourseChaptersOutlineMock[Number(courseId)] ?? [];
}

export const mentorQuestionBankFilterOptionsMock = {
  statusOptions: [
    { value: 'all', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Bản nháp' },
  ],
  questionStatusOptions: [
    { value: 'all', label: 'Tất cả câu hỏi' },
    { value: 'has_draft', label: 'Có câu hỏi nháp' },
    { value: 'all_published', label: 'Xuất bản hết' },
    { value: 'empty', label: 'Chưa có câu hỏi' },
  ],
  sortOptions: [
    { value: 'updated_desc', label: 'Mới cập nhật' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'questions_desc', label: 'Nhiều câu hỏi nhất' },
  ],
};
