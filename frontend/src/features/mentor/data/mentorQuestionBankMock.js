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
  {
    courseId: 4,
    courseName: 'Ngữ pháp Tiếng Anh Nền Tảng',
    description:
      'Củng cố 12 thì động từ, câu điều kiện, câu bị động và các cấu trúc nâng cao.',
    status: 'draft',
    totalQuestionCount: 45,
    publishedQuestionCount: 20,
    draftQuestionCount: 25,
    chapterWithQuestionCount: 2,
    quizCount: 3,
    questionBankUpdatedAt: '2026-05-01T16:45:00.000Z',
  },
  {
    courseId: 5,
    courseName: 'TOEIC Listening & Reading 750+',
    description: 'Luyện đề TOEIC theo format ETS mới nhất, giải thích chi tiết từng đáp án.',
    status: 'draft',
    totalQuestionCount: 30,
    publishedQuestionCount: 0,
    draftQuestionCount: 30,
    chapterWithQuestionCount: 1,
    quizCount: 1,
    questionBankUpdatedAt: '2026-05-20T11:00:00.000Z',
  },
];

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
