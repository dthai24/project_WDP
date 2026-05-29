/**
 * Mock detail payloads for Mentor course detail page.
 * Replace via fetchMentorCourseDetail(courseId) in mentorCourseService.js
 */

/** Khóa demo đầy đủ: 2 chương, mỗi chương 2 bài, mỗi bài đủ 4 loại học liệu */
const course1Paths = [
  {
    PathId: 1,
    PathName: 'Khởi động & Làm quen thuật ngữ',
    Description:
      'Nắm vững từ vựng nền tảng và các mẫu câu giao tiếp cơ bản trong môi trường công sở quốc tế.',
    nodes: [
      {
        NodeId: 1,
        NodeName: 'Chào hỏi và giới thiệu bản thân',
        NodeOrder: 1,
        Description: 'Luyện các cụm từ chào hỏi, giới thiệu bản thân và hỏi thăm đồng nghiệp.',
        materials: [
          {
            MaterialId: 1,
            MaterialType: 'VIDEO',
            Title: 'Video bài giảng: Chào hỏi công sở',
            MaterialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            MaterialOrder: 1,
          },
          {
            MaterialId: 2,
            MaterialType: 'TEXT',
            Title: 'Mẫu câu chào hỏi thường dùng',
            MaterialOrder: 2,
            Content:
              '<p>Good morning, everyone. Nice to meet you. My name is Alex and I work in the marketing department. How are you today?</p>',
          },
          {
            MaterialId: 3,
            MaterialType: 'DOC',
            Title: 'Tài liệu PDF: 50 từ vựng cốt lõi',
            MaterialOrder: 3,
            SourceType: 'upload',
            FileName: '50-core-vocabulary.pdf',
            MaterialUrl: null,
          },
          {
            MaterialId: 4,
            MaterialType: 'TEST',
            Title: 'Bài kiểm tra: Trắc nghiệm từ vựng chào hỏi',
            MaterialOrder: 4,
          },
        ],
      },
      {
        NodeId: 2,
        NodeName: 'Thuật ngữ kinh doanh cơ bản',
        NodeOrder: 2,
        Description: 'Làm quen các thuật ngữ thường gặp trong email, cuộc họp và báo cáo.',
        materials: [
          {
            MaterialId: 5,
            MaterialType: 'VIDEO',
            Title: 'Video: Thuật ngữ văn phòng hàng ngày',
            MaterialUrl: 'https://www.youtube.com/watch?v=example-office',
            MaterialOrder: 1,
          },
          {
            MaterialId: 6,
            MaterialType: 'TEXT',
            Title: 'Deadline, agenda và follow-up',
            MaterialOrder: 2,
            Content:
              '<p>Please find the agenda attached. Let us follow up on the action items after the meeting. The deadline for this task is Friday.</p>',
          },
          {
            MaterialId: 7,
            MaterialType: 'DOC',
            Title: 'Tài liệu: Bảng thuật ngữ kinh doanh A-Z',
            MaterialOrder: 3,
            SourceType: 'link',
            MaterialUrl: 'https://example.com/business-glossary.pdf',
          },
          {
            MaterialId: 8,
            MaterialType: 'TEST',
            Title: 'Bài kiểm tra: Ghép thuật ngữ với định nghĩa',
            MaterialOrder: 4,
          },
        ],
      },
    ],
  },
  {
    PathId: 2,
    PathName: 'Kỹ năng viết Email chuyên nghiệp',
    Description:
      'Ứng dụng từ vựng vào email công việc: cấu trúc chuẩn, tone phù hợp và cách xử lý tình huống nhạy cảm.',
    nodes: [
      {
        NodeId: 3,
        NodeName: 'Cấu trúc email chuẩn doanh nghiệp',
        NodeOrder: 1,
        Description: 'Subject line, opening, body, closing và cách ký tên chuyên nghiệp.',
        materials: [
          {
            MaterialId: 9,
            MaterialType: 'VIDEO',
            Title: 'Video: Cấu trúc Email chuẩn',
            MaterialUrl: 'https://www.youtube.com/watch?v=example-email',
            MaterialOrder: 1,
          },
          {
            MaterialId: 10,
            MaterialType: 'TEXT',
            Title: 'Mẫu email xin phép nghỉ và báo cáo tiến độ',
            MaterialOrder: 2,
            Content:
              '<p>Dear Mr. Smith, I am writing to request leave on Monday. Please find my progress report attached. Best regards, Alex.</p>',
          },
          {
            MaterialId: 11,
            MaterialType: 'DOC',
            Title: 'Tài liệu: Checklist email chuyên nghiệp',
            MaterialOrder: 3,
            SourceType: 'upload',
            FileName: 'professional-email-checklist.docx',
            MaterialUrl: null,
          },
          {
            MaterialId: 12,
            MaterialType: 'TEST',
            Title: 'Bài kiểm tra: Sắp xếp đoạn email đúng thứ tự',
            MaterialOrder: 4,
          },
        ],
      },
      {
        NodeId: 4,
        NodeName: 'Thực hành soạn email báo cáo',
        NodeOrder: 2,
        Description: 'Viết email cập nhật dự án, đề xuất giải pháp và phản hồi phản hồi từ sếp.',
        materials: [
          {
            MaterialId: 13,
            MaterialType: 'VIDEO',
            Title: 'Video: Demo soạn email báo cáo tuần',
            MaterialUrl: 'https://www.youtube.com/watch?v=example-report',
            MaterialOrder: 1,
          },
          {
            MaterialId: 14,
            MaterialType: 'TEXT',
            Title: 'Cách diễn đạt kết quả và đề xuất hành động',
            MaterialOrder: 2,
            Content:
              '<p>This week we completed phase one ahead of schedule. I recommend scheduling a review meeting next Tuesday to discuss the next milestone.</p>',
          },
          {
            MaterialId: 15,
            MaterialType: 'DOC',
            Title: 'Tài liệu: Mẫu email báo cáo tuần',
            MaterialOrder: 3,
            SourceType: 'link',
            MaterialUrl: 'https://example.com/weekly-report-template.docx',
          },
          {
            MaterialId: 16,
            MaterialType: 'TEST',
            Title: 'Bài kiểm tra: Soạn Email báo cáo tiến độ dự án',
            MaterialOrder: 4,
          },
        ],
      },
    ],
  },
];

const course3Paths = [
  {
    PathId: 10,
    PathName: 'Giao tiếp hàng ngày',
    Description: null,
    nodes: [
      {
        NodeId: 20,
        NodeName: 'Chào hỏi và làm quen',
        NodeOrder: 1,
        materials: [
          {
            MaterialId: 30,
            MaterialType: 'VIDEO',
            Title: 'Video: Hello & Nice to meet you',
            MaterialOrder: 1,
          },
          {
            MaterialId: 31,
            MaterialType: 'TEXT',
            Title: 'Mẫu hội thoại cơ bản',
            MaterialOrder: 2,
            Content: '<p>Hi! How are you today?</p>',
          },
        ],
      },
    ],
  },
];

const course4Paths = [
  {
    PathId: 20,
    PathName: 'Đàm phán cơ bản',
    Description: 'Làm quen các cụm từ thương lượng.',
    nodes: [
      {
        NodeId: 40,
        NodeName: 'Mở đầu cuộc đàm phán',
        NodeOrder: 1,
        materials: [],
      },
    ],
  },
];

/** @type {Record<number, object>} */
export const mentorCourseDetailById = {
  1: {
    CourseId: 1,
    CourseName: 'Tiếng Anh Thương Mại & Giao Tiếp Công Sở',
    Description:
      'Nắm vững thuật ngữ kinh doanh, cách viết email chuyên nghiệp và văn hóa giao tiếp doanh nghiệp.',
    Thumbnail: null,
    CategoryId: 1,
    CategoryName: 'Giao tiếp',
    LevelId: 2,
    LevelName: 'Trung cấp',
    InstructorId: 3,
    InstructorName: 'Mentor Demo',
    Rating: 4.7,
    TotalLessons: 4,
    TotalNodes: 2,
    TotalMaterials: 16,
    StudentCount: 128,
    IsPublished: true,
    CreatedAt: '2025-11-12T08:00:00.000Z',
    UpdatedAt: '2026-03-18T10:30:00.000Z',
    paths: course1Paths,
  },
  2: {
    CourseId: 2,
    CourseName: 'Tiếng Anh Chuyên Ngành Tài Chính - Ngân Hàng',
    Description:
      'Hệ thống từ vựng về thị trường tiền tệ, tín dụng, báo cáo tài chính và nghiệp vụ ngân hàng quốc tế.',
    Thumbnail: null,
    CategoryId: 2,
    CategoryName: 'TOEIC',
    LevelId: 3,
    LevelName: 'Nâng cao',
    InstructorId: 3,
    InstructorName: 'Mentor Demo',
    Rating: 4.5,
    TotalLessons: 32,
    StudentCount: 86,
    IsPublished: true,
    CreatedAt: '2025-10-05T08:00:00.000Z',
    UpdatedAt: '2026-02-28T14:15:00.000Z',
    paths: [],
  },
  3: {
    CourseId: 3,
    CourseName: 'Tiếng Anh Giao Tiếp Đời Sống Hàng Ngày',
    Description:
      'Luyện tập các tình huống giao tiếp thường nhật: chào hỏi, giới thiệu bản thân, hỏi đường và duy trì hội thoại.',
    Thumbnail: null,
    CategoryId: 1,
    CategoryName: 'Giao tiếp',
    LevelId: 1,
    LevelName: 'Cơ bản',
    InstructorId: 3,
    InstructorName: 'Mentor Demo',
    Rating: 4.3,
    TotalLessons: 16,
    StudentCount: 54,
    IsPublished: true,
    CreatedAt: '2026-01-20T08:00:00.000Z',
    UpdatedAt: '2026-04-02T09:00:00.000Z',
    paths: course3Paths,
  },
  4: {
    CourseId: 4,
    CourseName: 'Tiếng Anh Đàm Phán & Hợp Đồng Thương Mại',
    Description:
      'Ngôn từ thương lượng giá cả, chốt sale và đọc hiểu các điều khoản pháp lý trong hợp đồng kinh tế.',
    Thumbnail: null,
    CategoryId: 3,
    CategoryName: 'IELTS',
    LevelId: 3,
    LevelName: 'Nâng cao',
    InstructorId: 3,
    InstructorName: 'Mentor Demo',
    Rating: null,
    TotalLessons: 8,
    StudentCount: 0,
    IsPublished: false,
    CreatedAt: '2026-04-10T08:00:00.000Z',
    UpdatedAt: '2026-04-12T16:45:00.000Z',
    paths: course4Paths,
  },
  5: {
    CourseId: 5,
    CourseName: 'Tiếng Anh Du Lịch & Khám Phá',
    Description:
      'Từ vựng và mẫu câu khi đi nước ngoài: sân bay, khách sạn, nhà hàng và xử lý sự cố.',
    Thumbnail: null,
    CategoryId: 4,
    CategoryName: 'Ngữ pháp',
    LevelId: 1,
    LevelName: 'Cơ bản',
    InstructorId: 3,
    InstructorName: 'Mentor Demo',
    Rating: null,
    TotalLessons: 0,
    StudentCount: 0,
    IsPublished: false,
    CreatedAt: '2026-04-15T08:00:00.000Z',
    UpdatedAt: '2026-04-15T08:00:00.000Z',
    paths: [],
  },
};
