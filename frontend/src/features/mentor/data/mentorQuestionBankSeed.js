/**
 * Seed Question Bank — khóa "Tiếng Anh Thương Mại & Giao Tiếp Công Sở" (courseId: 1).
 * Mỗi chương một bank, 3 kỹ năng (Nghe / Đọc / TV-NP), nhiều dạng trắc nghiệm.
 */

const COURSE_TITLE = 'Tiếng Anh Thương Mại & Giao Tiếp Công Sở';
const AUDIO_SAMPLE = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function opt(id, text, correct = false) {
  return { tempId: id, OptionText: text, IsCorrect: correct };
}

function mcqSingle(id, text, options, score = 10, active = true) {
  return {
    tempId: id,
    QuestionType: 'MULTIPLE_CHOICE',
    AllowMultipleAnswers: false,
    QuestionText: text,
    Score: score,
    isActive: active,
    Options: options,
  };
}

function mcqMulti(id, text, options, score = 10, active = true) {
  return {
    tempId: id,
    QuestionType: 'MULTIPLE_CHOICE',
    AllowMultipleAnswers: true,
    QuestionText: text,
    Score: score,
    isActive: active,
    Options: options,
  };
}

function section(id, skill, displayName, questions, extra = {}) {
  return {
    tempId: id,
    DisplayName: displayName,
    SectionTitle: '',
    SkillType: skill,
    Description: '',
    Questions: questions,
    ...extra,
  };
}

function listeningSection(id, displayName, questions) {
  return section(id, 'LISTENING', displayName, questions, {
    AudioSourceType: 'LINK',
    AudioUrl: AUDIO_SAMPLE,
    File: null,
    FileName: null,
    FileSize: null,
  });
}

function makeBank(id, chapterId, chapterTitle, sections, dates = {}) {
  const totalQuestionCount = sections.reduce(
    (sum, s) => sum + (s.Questions?.length ?? 0),
    0,
  );
  const now = '2026-03-01T08:00:00.000Z';
  return {
    id,
    title: chapterTitle,
    description: `Ngân hàng câu hỏi — ${chapterTitle}`,
    courseId: 1,
    courseTitle: COURSE_TITLE,
    chapterId,
    chapterTitle,
    sections,
    totalQuestionCount,
    publishedQuestionCount: 0,
    draftQuestionCount: totalQuestionCount,
    createdAt: dates.createdAt ?? now,
    updatedAt: dates.updatedAt ?? now,
    questionBankUpdatedAt: dates.questionBankUpdatedAt ?? now,
  };
}

// ─── Chương 1: Khởi động & Làm quen thuật ngữ ───────────────────────────────
const chapter1Sections = [
  listeningSection('ch1-l1', 'Nghe chào hỏi công sở', [
    mcqSingle(
      'ch1-l1-q1',
      'Nghe đoạn hội thoại. Alex làm việc ở bộ phận nào?',
      [
        opt('ch1-l1-q1-a', 'Marketing', true),
        opt('ch1-l1-q1-b', 'Human Resources'),
        opt('ch1-l1-q1-c', 'Finance'),
        opt('ch1-l1-q1-d', 'IT Support'),
      ],
    ),
    mcqMulti(
      'ch1-l1-q2',
      'Chọn TẤT CẢ cụm chào hỏi phù hợp môi trường công sở:',
      [
        opt('ch1-l1-q2-a', 'Good morning, everyone.', true),
        opt('ch1-l1-q2-b', 'Nice to meet you.', true),
        opt('ch1-l1-q2-c', 'Yo bro!'),
        opt('ch1-l1-q2-d', 'How are you today?', true),
      ],
      12,
    ),
  ]),
  section('ch1-r1', 'READING', 'Đọc hiểu thuật ngữ cơ bản', [
    mcqSingle(
      'ch1-r1-q1',
      'Chọn từ phù hợp: Good ___ , everyone.',
      [
        opt('ch1-r1-q1-a', 'morning', true),
        opt('ch1-r1-q1-b', 'night'),
        opt('ch1-r1-q1-c', 'bye'),
        opt('ch1-r1-q1-d', 'luck'),
      ],
    ),
    mcqSingle(
      'ch1-r1-q2',
      'Trong email kinh doanh, "ASAP" có nghĩa là:',
      [
        opt('ch1-r1-q2-a', 'As soon as possible', true),
        opt('ch1-r1-q2-b', 'At some appointed place'),
        opt('ch1-r1-q2-c', 'Annual sales action plan'),
        opt('ch1-r1-q2-d', 'After sales approval process'),
      ],
    ),
    mcqMulti(
      'ch1-r1-q3',
      'Chọn các thuật ngữ thuộc nhóm "Cuộc họp & Công việc":',
      [
        opt('ch1-r1-q3-a', 'agenda', true),
        opt('ch1-r1-q3-b', 'deadline', true),
        opt('ch1-r1-q3-c', 'follow-up', true),
        opt('ch1-r1-q3-d', 'sunscreen'),
      ],
    ),
    {
      tempId: 'ch1-r1-q4',
      QuestionType: 'SINGLE_CHOICE',
      QuestionText: '"Stakeholder" trong dự án là ai?',
      Score: 8,
      isActive: true,
      Options: [
        opt('ch1-r1-q4-a', 'Người có liên quan / quan tâm tới dự án', true),
        opt('ch1-r1-q4-b', 'Người cắm cổ phiếu'),
        opt('ch1-r1-q4-c', 'Nhân viên bảo vệ'),
        opt('ch1-r1-q4-d', 'Khách du lịch'),
      ],
    },
    mcqSingle(
      'ch1-r1-q5',
      'Câu ẩn (inactive) — test khóa câu trên khóa đã publish.',
      [
        opt('ch1-r1-q5-a', 'Đáp án A'),
        opt('ch1-r1-q5-b', 'Đáp án B', true),
      ],
      5,
      false,
    ),
  ]),
  section('ch1-w1', 'WRITING', 'Từ vựng & mẫu câu giới thiệu', [
    mcqSingle(
      'ch1-w1-q1',
      'Chọn câu giới thiệu bản thân trang trọng nhất:',
      [
        opt('ch1-w1-q1-a', 'My name is Alex and I work in the marketing department.', true),
        opt('ch1-w1-q1-b', 'I\'m Alex, whatever.'),
        opt('ch1-w1-q1-c', 'Call me Alex!!!'),
        opt('ch1-w1-q1-d', 'Alex here, don\'t ask.'),
      ],
    ),
    mcqMulti(
      'ch1-w1-q2',
      'Chọn các lỗi KHÔNG phù hợp email / giao tiếp công sở:',
      [
        opt('ch1-w1-q2-a', 'Viết tắt không chuẩn (u, r, pls)', true),
        opt('ch1-w1-q2-b', 'Chào hỏi lịch sự'),
        opt('ch1-w1-q2-c', 'Quá nhiều emoji 😂🔥', true),
        opt('ch1-w1-q2-d', 'Có chữ ký và thông tin liên hệ'),
      ],
    ),
    mcqSingle(
      'ch1-w1-q3',
      'Điền ý đúng: "Please find the ___ attached."',
      [
        opt('ch1-w1-q3-a', 'agenda', true),
        opt('ch1-w1-q3-b', 'lunch menu'),
        opt('ch1-w1-q3-c', 'vacation'),
        opt('ch1-w1-q3-d', 'password'),
      ],
    ),
  ]),
  section('ch1-w2', 'WRITING', 'Thuật ngữ kinh doanh cơ bản', [
    mcqSingle(
      'ch1-w2-q1',
      '"Deadline" trong công việc nghĩa là:',
      [
        opt('ch1-w2-q1-a', 'Hạn chót / thời hạn hoàn thành', true),
        opt('ch1-w2-q1-b', 'Ngày nghỉ phép'),
        opt('ch1-w2-q1-c', 'Buổi họp sáng'),
        opt('ch1-w2-q1-d', 'Hợp đồng lao động'),
      ],
    ),
    mcqMulti(
      'ch1-w2-q2',
      'Chọn các từ thuộc nhóm "Báo cáo & Tài liệu":',
      [
        opt('ch1-w2-q2-a', 'report', true),
        opt('ch1-w2-q2-b', 'summary', true),
        opt('ch1-w2-q2-c', 'holiday'),
        opt('ch1-w2-q2-d', 'attachment', true),
      ],
    ),
    mcqSingle(
      'ch1-w2-q3',
      '"Follow-up" thường dùng khi:',
      [
        opt('ch1-w2-q3-a', 'Theo dõi lại sau cuộc họp hoặc email trước', true),
        opt('ch1-w2-q3-b', 'Kết thúc hợp đồng'),
        opt('ch1-w2-q3-c', 'Nghỉ việc'),
        opt('ch1-w2-q3-d', 'Đặt vé máy bay'),
      ],
    ),
  ]),
];

// ─── Chương 2: Kỹ năng viết Email chuyên nghiệp ─────────────────────────────
const chapter2Sections = [
  listeningSection('ch2-l1', 'Nghe email được đọc to', [
    mcqSingle(
      'ch2-l1-q1',
      'Người nói yêu cầu gì trước thứ Sáu?',
      [
        opt('ch2-l1-q1-a', 'Gửi bản báo cáo đã cập nhật', true),
        opt('ch2-l1-q1-b', 'Hủy cuộc họp'),
        opt('ch2-l1-q1-c', 'Đặt vé máy bay'),
        opt('ch2-l1-q1-d', 'Nghỉ phép'),
      ],
    ),
    mcqMulti(
      'ch2-l1-q2',
      'Email này thuộc loại nào? (chọn tất cả đúng)',
      [
        opt('ch2-l1-q2-a', 'Request / Yêu cầu', true),
        opt('ch2-l1-q2-b', 'Follow-up', true),
        opt('ch2-l1-q2-c', 'Thư cá nhân'),
        opt('ch2-l1-q2-d', 'Formal tone', true),
      ],
    ),
  ]),
  section('ch2-r1', 'READING', 'Đọc mẫu email', [
    mcqSingle(
      'ch2-r1-q1',
      'Subject line phù hợp khi xin gia hạn deadline:',
      [
        opt('ch2-r1-q1-a', 'URGENT!!! HELP!!!'),
        opt('ch2-r1-q1-b', 'Request for Extension — Project Alpha Deliverables', true),
        opt('ch2-r1-q1-c', 'Hi'),
        opt('ch2-r1-q1-d', 'Re: Re: Re: stuff'),
      ],
    ),
    mcqMulti(
      'ch2-r1-q2',
      'Phần thường có trong email business chuẩn:',
      [
        opt('ch2-r1-q2-a', 'Salutation (lời chào)', true),
        opt('ch2-r1-q2-b', 'Body (nội dung chính)', true),
        opt('ch2-r1-q2-c', 'Closing & signature', true),
        opt('ch2-r1-q2-d', 'Meme ảnh chế'),
      ],
    ),
    mcqSingle(
      'ch2-r1-q3',
      '"Please find attached" dùng khi nào?',
      [
        opt('ch2-r1-q3-a', 'Khi email có file đính kèm', true),
        opt('ch2-r1-q3-b', 'Khi tìm đồ trong kho'),
        opt('ch2-r1-q3-c', 'Khi kết thúc cuộc gọi'),
        opt('ch2-r1-q3-d', 'Khi từ chối offer'),
      ],
    ),
  ]),
  section('ch2-w1', 'WRITING', 'Viết email đúng cấu trúc', [
    mcqSingle(
      'ch2-w1-q1',
      'Cách kết thúc email trang trọng:',
      [
        opt('ch2-w1-q1-a', 'Cheers,'),
        opt('ch2-w1-q1-b', 'Best regards,', true),
        opt('ch2-w1-q1-c', 'Later,'),
        opt('ch2-w1-q1-d', 'XOXO'),
      ],
    ),
    mcqMulti(
      'ch2-w1-q2',
      'Khi trả lời email (Reply All), nên:',
      [
        opt('ch2-w1-q2-a', 'Kiểm tra danh sách người nhận', true),
        opt('ch2-w1-q2-b', 'Giữ thread liên quan', true),
        opt('ch2-w1-q2-c', 'Chia sẻ mật khẩu trong email'),
        opt('ch2-w1-q2-d', 'Trả lời ngắn gọn, rõ ràng', true),
      ],
    ),
  ]),
];

// ─── Chương 3: Thuyết trình và họp hành công sở ─────────────────────────────
const chapter3Sections = [
  listeningSection('ch3-l1', 'Nghe phần mở đầu presentation', [
    mcqSingle(
      'ch3-l1-q1',
      'Diễn giả giới thiệu chủ đề bằng câu nào?',
      [
        opt('ch3-l1-q1-a', 'Today I\'d like to outline our Q2 strategy.', true),
        opt('ch3-l1-q1-b', 'I hate meetings.'),
        opt('ch3-l1-q1-c', 'Who wants lunch?'),
        opt('ch3-l1-q1-d', 'Let me tell you a joke.'),
      ],
    ),
    mcqMulti(
      'ch3-l1-q2',
      'Các cụm chuyển slide trong đoạn nghe:',
      [
        opt('ch3-l1-q2-a', 'Moving on to the next point', true),
        opt('ch3-l1-q2-b', 'As you can see on this slide', true),
        opt('ch3-l1-q2-c', 'Whatever'),
        opt('ch3-l1-q2-d', 'To summarize', true),
      ],
    ),
  ]),
  section('ch3-r1', 'READING', 'Đọc agenda cuộc họp', [
    mcqSingle(
      'ch3-r1-q1',
      '"Agenda" trong cuộc họp là gì?',
      [
        opt('ch3-r1-q1-a', 'Chương trình / nội dung cuộc họp', true),
        opt('ch3-r1-q1-b', 'Đồ uống giải khát'),
        opt('ch3-r1-q1-c', 'Máy chiếu'),
        opt('ch3-r1-q1-d', 'Biên bản năm trước'),
      ],
    ),
    mcqMulti(
      'ch3-r1-q2',
      'Vai trò "facilitator" có thể bao gồm:',
      [
        opt('ch3-r1-q2-a', 'Điều phối thảo luận', true),
        opt('ch3-r1-q2-b', 'Giữ đúng thời lượng', true),
        opt('ch3-r1-q2-c', 'Quyết định lương toàn công ty'),
        opt('ch3-r1-q2-d', 'Ghi nhận action items', true),
      ],
    ),
  ]),
  section('ch3-w1', 'WRITING', 'Ngôn ngữ thuyết trình', [
    mcqSingle(
      'ch3-w1-q1',
      'Cụm nào dùng để nhấn mạnh số liệu?',
      [
        opt('ch3-w1-q1-a', 'It\'s worth noting that sales grew by 20%.', true),
        opt('ch3-w1-q1-b', 'Sales are fine I guess.'),
        opt('ch3-w1-q1-c', 'Numbers are boring.'),
        opt('ch3-w1-q1-d', 'Don\'t ask me.'),
      ],
    ),
    mcqMulti(
      'ch3-w1-q2',
      'Cách hỏi ý kiến trong họp (chọn đúng):',
      [
        opt('ch3-w1-q2-a', 'Does anyone have questions?', true),
        opt('ch3-w1-q2-b', 'What are your thoughts on this?', true),
        opt('ch3-w1-q2-c', 'Shut up and listen.'),
        opt('ch3-w1-q2-d', 'Could you share your feedback?', true),
      ],
    ),
  ]),
];

// ─── Chương 4: Đàm phán và thương lượng cơ bản ──────────────────────────────
const chapter4Sections = [
  listeningSection('ch4-l1', 'Nghe đàm phán giá', [
    mcqSingle(
      'ch4-l1-q1',
      'Bên mua đề xuất điều kiện nào?',
      [
        opt('ch4-l1-q1-a', 'Giảm 5% nếu đặt hàng số lượng lớn', true),
        opt('ch4-l1-q1-b', 'Miễn phí vĩnh viễn'),
        opt('ch4-l1-q1-c', 'Thanh toán sau 10 năm'),
        opt('ch4-l1-q1-d', 'Không ký hợp đồng'),
      ],
    ),
    mcqMulti(
      'ch4-l1-q2',
      'Chiến lược đàm phán win-win thể hiện qua:',
      [
        opt('ch4-l1-q2-a', 'Tìm lợi ích chung', true),
        opt('ch4-l1-q2-b', 'Đe dọa đối tác'),
        opt('ch4-l1-q2-c', 'Linh hoạt về điều khoản', true),
        opt('ch4-l1-q2-d', 'Bỏ qua quan tâm đối phương'),
      ],
    ),
  ]),
  section('ch4-r1', 'READING', 'Đọc điều khoản hợp đồng', [
    mcqSingle(
      'ch4-r1-q1',
      '"Counteroffer" nghĩa là gì?',
      [
        opt('ch4-r1-q1-a', 'Đề nghị đối ứng / phản đề xuất', true),
        opt('ch4-r1-q1-b', 'Từ chối hoàn toàn'),
        opt('ch4-r1-q1-c', 'Chấp nhận ngay'),
        opt('ch4-r1-q1-d', 'Hủy thương vụ'),
      ],
    ),
    mcqMulti(
      'ch4-r1-q2',
      'BATNA giúp negotiator:',
      [
        opt('ch4-r1-q2-a', 'Biết điểm rút lui hợp lý', true),
        opt('ch4-r1-q2-b', 'Tăng quyền lực đàm phán', true),
        opt('ch4-r1-q2-c', 'Tránh chấp nhận deal tệ', true),
        opt('ch4-r1-q2-d', 'Thay thế việc chuẩn bị'),
      ],
    ),
  ]),
  section('ch4-w1', 'WRITING', 'Cụm từ đàm phán', [
    mcqSingle(
      'ch4-w1-q1',
      'Từ chối lịch sự nhưng kiên quyết:',
      [
        opt('ch4-w1-q1-a', 'I\'m afraid we can\'t accept that price.', true),
        opt('ch4-w1-q1-b', 'No way!'),
        opt('ch4-w1-q1-c', 'You\'re wrong.'),
        opt('ch4-w1-q1-d', 'Whatever you say.'),
      ],
    ),
    mcqMulti(
      'ch4-w1-q2',
      'Cụm mở đường cho thỏa hiệp:',
      [
        opt('ch4-w1-q2-a', 'What if we meet halfway?', true),
        opt('ch4-w1-q2-b', 'Let\'s explore other options.', true),
        opt('ch4-w1-q2-c', 'Take it or leave it.'),
        opt('ch4-w1-q2-d', 'Would you consider a volume discount?', true),
      ],
    ),
  ]),
];

// ─── Chương 5: Điện thoại và hội nghị trực tuyến ───────────────────────────
const chapter5Sections = [
  listeningSection('ch5-l1', 'Nghe cuộc gọi conference', [
    mcqSingle(
      'ch5-l1-q1',
      'Người tham gia gặp vấn đề kỹ thuật gì?',
      [
        opt('ch5-l1-q1-a', 'Micro bị tắt / không nghe được', true),
        opt('ch5-l1-q1-b', 'Mất hộ chiếu'),
        opt('ch5-l1-q1-c', 'Sai múi giờ một năm'),
        opt('ch5-l1-q1-d', 'Quên mật khẩu email'),
      ],
    ),
    mcqMulti(
      'ch5-l1-q2',
      'Cụm xin phép chen ngang:',
      [
        opt('ch5-l1-q2-a', 'Sorry to interrupt, but...', true),
        opt('ch5-l1-q2-b', 'May I add something here?', true),
        opt('ch5-l1-q2-c', 'Stop talking!'),
        opt('ch5-l1-q2-d', 'If I could jump in for a moment', true),
      ],
    ),
  ]),
  section('ch5-r1', 'READING', 'Đọc hướng dẫn Zoom/Teams', [
    mcqSingle(
      'ch5-r1-q1',
      '"Mute yourself when not speaking" nghĩa là:',
      [
        opt('ch5-r1-q1-a', 'Tắt mic khi không phát biểu', true),
        opt('ch5-r1-q1-b', 'Tắt camera'),
        opt('ch5-r1-q1-c', 'Rời cuộc họp'),
        opt('ch5-r1-q1-d', 'Ghi âm cuộc họp'),
      ],
    ),
    mcqMulti(
      'ch5-r1-q2',
      'Netiquette trong họp online:',
      [
        opt('ch5-r1-q2-a', 'Vào đúng giờ', true),
        opt('ch5-r1-q2-b', 'Nền phòng họp gọn gàng', true),
        opt('ch5-r1-q2-c', 'Multitask ồn ào'),
        opt('ch5-r1-q2-d', 'Test mic trước khi họp', true),
      ],
    ),
  ]),
  section('ch5-w1', 'WRITING', 'Script điện thoại công sở', [
    mcqSingle(
      'ch5-w1-q1',
      'Mở đầu cuộc gọi chuyên nghiệp:',
      [
        opt('ch5-w1-q1-a', 'Good morning, this is Lan from ABC Corp. May I speak with Mr. Park?', true),
        opt('ch5-w1-q1-b', 'Who is this?'),
        opt('ch5-w1-q1-c', 'Hello???'),
        opt('ch5-w1-q1-d', 'Yo Park!'),
      ],
    ),
    mcqMulti(
      'ch5-w1-q2',
      'Khi chuyển cuộc gọi (transfer), nên:',
      [
        opt('ch5-w1-q2-a', 'Thông báo cho người nhận trước', true),
        opt('ch5-w1-q2-b', 'Giới thiệu ngắn lý do gọi', true),
        opt('ch5-w1-q2-c', 'Cúp máy ngay'),
        opt('ch5-w1-q2-d', 'Xác nhận người nhận sẵn sàng', true),
      ],
    ),
  ]),
];

// ─── Chương 6: Văn hóa làm việc quốc tế ────────────────────────────────────
const chapter6Sections = [
  listeningSection('ch6-l1', 'Nghe về văn hóa làm việc', [
    mcqSingle(
      'ch6-l1-q1',
      'Đoạn nghe nhấn mạnh khác biệt nào giữa các nền văn hóa?',
      [
        opt('ch6-l1-q1-a', 'Mức độ trực tiếp vs gián tiếp trong giao tiếp', true),
        opt('ch6-l1-q1-b', 'Loại cà phê uống'),
        opt('ch6-l1-q1-c', 'Màu sơn văn phòng'),
        opt('ch6-l1-q1-d', 'Thương hiệu laptop'),
      ],
    ),
    mcqMulti(
      'ch6-l1-q2',
      'High-context culture thường:',
      [
        opt('ch6-l1-q2-a', 'Dựa nhiều vào ngữ cảnh và quan hệ', true),
        opt('ch6-l1-q2-b', 'Nói thẳng mọi ý kiến'),
        opt('ch6-l1-q2-c', 'Tránh làm mất thể diện đối phương', true),
        opt('ch6-l1-q2-d', 'Coi trọng thứ bậc', true),
      ],
    ),
  ]),
  section('ch6-r1', 'READING', 'Đọc case study đa văn hóa', [
    mcqSingle(
      'ch6-r1-q1',
      '"Small talk" trước họp quan trọng vì:',
      [
        opt('ch6-r1-q1-a', 'Xây dựng rapport và tin cậy', true),
        opt('ch6-r1-q1-b', 'Lãng phí thời gian bắt buộc'),
        opt('ch6-r1-q1-c', 'Thay thế agenda'),
        opt('ch6-r1-q1-d', 'Chỉ dùng ở Việt Nam'),
      ],
    ),
    mcqMulti(
      'ch6-r1-q2',
      'Cần tránh khi làm việc quốc tế:',
      [
        opt('ch6-r1-q2-a', 'Giả định mọi người giống mình', true),
        opt('ch6-r1-q2-b', 'Tìm hiểu phong tục cơ bản'),
        opt('ch6-r1-q2-c', 'Dùng stereotype cực đoan', true),
        opt('ch6-r1-q2-d', 'Hỏi lại khi không chắc', true),
      ],
    ),
  ]),
  section('ch6-w1', 'WRITING', 'Email đa văn hóa', [
    mcqSingle(
      'ch6-w1-q1',
      'Email tới đối tác Nhật nên:',
      [
        opt('ch6-w1-q1-a', 'Trang trọng, rõ ràng, tránh áp lực quá trực tiếp', true),
        opt('ch6-w1-q1-b', 'Dùng toàn slang'),
        opt('ch6-w1-q1-c', 'Bỏ qua lời chào'),
        opt('ch6-w1-q1-d', 'Viết hoa toàn bộ'),
      ],
    ),
    mcqMulti(
      'ch6-w1-q2',
      'Time zone awareness nghĩa là:',
      [
        opt('ch6-w1-q2-a', 'Ghi rõ múi giờ khi hẹn họp', true),
        opt('ch6-w1-q2-b', 'Gửi email 3h sáng địa phương đối tác'),
        opt('ch6-w1-q2-c', 'Dùng công cụ chuyển múi giờ', true),
        opt('ch6-w1-q2-d', 'Bỏ qua lễ tết địa phương'),
      ],
    ),
  ]),
];

// ─── Chương 7: Báo cáo và thuyết minh số liệu ───────────────────────────────
const chapter7Sections = [
  listeningSection('ch7-l1', 'Nghe phần trình bày KPI', [
    mcqSingle(
      'ch7-l1-q1',
      'Doanh thu quý vừa qua thay đổi thế nào theo đoạn nghe?',
      [
        opt('ch7-l1-q1-a', 'Tăng 12% so với quý trước', true),
        opt('ch7-l1-q1-b', 'Giảm 50%'),
        opt('ch7-l1-q1-c', 'Không đổi'),
        opt('ch7-l1-q1-d', 'Chưa có số liệu'),
      ],
    ),
    mcqMulti(
      'ch7-l1-q2',
      'Các chỉ số được nhắc tới:',
      [
        opt('ch7-l1-q2-a', 'Revenue', true),
        opt('ch7-l1-q2-b', 'Conversion rate', true),
        opt('ch7-l1-q2-c', 'Employee birthday'),
        opt('ch7-l1-q2-d', 'Customer retention', true),
      ],
    ),
  ]),
  section('ch7-r1', 'READING', 'Đọc báo cáo tóm tắt', [
    mcqSingle(
      'ch7-r1-q1',
      '"YoY" trong báo cáo tài chính nghĩa là:',
      [
        opt('ch7-r1-q1-a', 'Year over year', true),
        opt('ch7-r1-q1-b', 'Yes or yes'),
        opt('ch7-r1-q1-c', 'Your own yield'),
        opt('ch7-r1-q1-d', 'Yesterday only'),
      ],
    ),
    mcqMulti(
      'ch7-r1-q2',
      'Biểu đồ phù hợp so sánh xu hướng theo thời gian:',
      [
        opt('ch7-r1-q2-a', 'Line chart', true),
        opt('ch7-r1-q2-b', 'Bar chart'),
        opt('ch7-r1-q2-c', 'Area chart', true),
        opt('ch7-r1-q2-d', 'Pie chart cho 20 mục nhỏ'),
      ],
    ),
  ]),
  section('ch7-w1', 'WRITING', 'Diễn đạt số liệu', [
    mcqSingle(
      'ch7-w1-q1',
      'Câu mô tả tăng trưởng chính xác:',
      [
        opt('ch7-w1-q1-a', 'Sales rose by 15% compared to last quarter.', true),
        opt('ch7-w1-q1-b', 'Sales went up a lot.'),
        opt('ch7-w1-q1-c', 'Numbers are crazy good!!!'),
        opt('ch7-w1-q1-d', 'We sold stuff.'),
      ],
    ),
    mcqMulti(
      'ch7-w1-q2',
      'Khi thuyết minh số liệu, nên:',
      [
        opt('ch7-w1-q2-a', 'Nêu nguồn dữ liệu', true),
        opt('ch7-w1-q2-b', 'Giải thích ý nghĩa business', true),
        opt('ch7-w1-q2-c', 'Đọc từng con số không giải thích'),
        opt('ch7-w1-q2-d', 'Highlight điểm then chốt', true),
      ],
    ),
  ]),
];

// ─── Chương 8: Phản hồi và coaching nội bộ ─────────────────────────────────
const chapter8Sections = [
  listeningSection('ch8-l1', 'Nghe buổi 1-on-1 feedback', [
    mcqSingle(
      'ch8-l1-q1',
      'Manager muốn nhân viên cải thiện điều gì?',
      [
        opt('ch8-l1-q1-a', 'Giao tiếp tiến độ dự án rõ ràng hơn', true),
        opt('ch8-l1-q1-b', 'Đổi màu tóc'),
        opt('ch8-l1-q1-c', 'Nghỉ việc'),
        opt('ch8-l1-q1-d', 'Chuyển sang bộ phận khác ngay'),
      ],
    ),
    mcqMulti(
      'ch8-l1-q2',
      'Feedback mang tính xây dựng thường:',
      [
        opt('ch8-l1-q2-a', 'Cụ thể, có ví dụ', true),
        opt('ch8-l1-q2-b', 'Tập trung hành vi, không công kích cá nhân', true),
        opt('ch8-l1-q2-c', 'Chỉ chỉ trích không gợi ý'),
        opt('ch8-l1-q2-d', 'Đề xuất bước cải thiện', true),
      ],
    ),
  ]),
  section('ch8-r1', 'READING', 'Đọc mẫu feedback', [
    mcqSingle(
      'ch8-r1-q1',
      '"Constructive feedback" là phản hồi:',
      [
        opt('ch8-r1-q1-a', 'Mang tính xây dựng, giúp cải thiện', true),
        opt('ch8-r1-q1-b', 'Chỉ khen không góp ý'),
        opt('ch8-r1-q1-c', 'Công khai trên mạng xã hội'),
        opt('ch8-r1-q1-d', 'Không cần ví dụ'),
      ],
    ),
    mcqMulti(
      'ch8-r1-q2',
      'Mô hình SBI (Situation-Behavior-Impact) gồm:',
      [
        opt('ch8-r1-q2-a', 'Situation — bối cảnh', true),
        opt('ch8-r1-q2-b', 'Behavior — hành vi quan sát được', true),
        opt('ch8-r1-q2-c', 'Impact — tác động', true),
        opt('ch8-r1-q2-d', 'Salary — lương'),
      ],
    ),
  ]),
  section('ch8-w1', 'WRITING', 'Viết phản hồi lịch sự', [
    mcqSingle(
      'ch8-w1-q1',
      'Cách mở đầu feedback 1-on-1:',
      [
        opt('ch8-w1-q1-a', 'I\'d like to share some observations from our last project.', true),
        opt('ch8-w1-q1-b', 'You always mess up.'),
        opt('ch8-w1-q1-c', 'Everyone hates your work.'),
        opt('ch8-w1-q1-d', 'Why are you like this?'),
      ],
    ),
    mcqMulti(
      'ch8-w1-q2',
      'Khi nhận feedback, nên:',
      [
        opt('ch8-w1-q2-a', 'Lắng nghe, không phòng thủ ngay', true),
        opt('ch8-w1-q2-b', 'Hỏi làm rõ nếu cần', true),
        opt('ch8-w1-q2-c', 'Tranh cãi gay gắt'),
        opt('ch8-w1-q2-d', 'Cảm ơn và lên kế hoạch hành động', true),
      ],
    ),
  ]),
];

// ─── Chương 9: Tổng kết và luyện tập tích hợp ───────────────────────────────
const chapter9Sections = [
  listeningSection('ch9-l1', 'Nghe tổng hợp tình huống công sở', [
    mcqSingle(
      'ch9-l1-q1',
      'Trong đoạn nghe, nhân viên cần làm gì sau cuộc họp?',
      [
        opt('ch9-l1-q1-a', 'Gửi email tóm tắt action items', true),
        opt('ch9-l1-q1-b', 'Xóa toàn bộ ghi chú'),
        opt('ch9-l1-q1-c', 'Bỏ qua deadline'),
        opt('ch9-l1-q1-d', 'Không liên hệ lại'),
      ],
    ),
    mcqMulti(
      'ch9-l1-q2',
      'Kỹ năng được ôn tập trong chương tổng kết:',
      [
        opt('ch9-l1-q2-a', 'Email chuyên nghiệp', true),
        opt('ch9-l1-q2-b', 'Thuyết trình & họp', true),
        opt('ch9-l1-q2-c', 'Đàm phán cơ bản', true),
        opt('ch9-l1-q2-d', 'Nấu ăn văn phòng'),
      ],
    ),
  ]),
  section('ch9-r1', 'READING', 'Đọc tình huống tích hợp', [
    mcqSingle(
      'ch9-r1-q1',
      'Email follow-up sau họp nên có:',
      [
        opt('ch9-r1-q1-a', 'Tóm tắt quyết định và người phụ trách', true),
        opt('ch9-r1-q1-b', 'Chỉ emoji'),
        opt('ch9-r1-q1-c', 'Không subject line'),
        opt('ch9-r1-q1-d', 'Mật khẩu đăng nhập'),
      ],
    ),
    mcqMulti(
      'ch9-r1-q2',
      'Checklist giao tiếp công sở hiệu quả:',
      [
        opt('ch9-r1-q2-a', 'Rõ ràng, súc tích', true),
        opt('ch9-r1-q2-b', 'Tôn trọng văn hóa đối tác', true),
        opt('ch9-r1-q2-c', 'Tránh xác nhận deadline'),
        opt('ch9-r1-q2-d', 'Chủ động follow-up', true),
      ],
    ),
    mcqSingle(
      'ch9-r1-q3',
      'Câu inactive — test toggle trên khóa publish.',
      [
        opt('ch9-r1-q3-a', 'A'),
        opt('ch9-r1-q3-b', 'B', true),
      ],
      5,
      false,
    ),
  ]),
  section('ch9-w1', 'WRITING', 'Luyện tập viết tổng hợp', [
    mcqSingle(
      'ch9-w1-q1',
      'Chọn câu kết thúc email follow-up phù hợp:',
      [
        opt('ch9-w1-q1-a', 'Please let me know if you have any questions.', true),
        opt('ch9-w1-q1-b', 'Reply ASAP or else!!!'),
        opt('ch9-w1-q1-c', 'Whatever.'),
        opt('ch9-w1-q1-d', 'Bye forever.'),
      ],
    ),
    mcqMulti(
      'ch9-w1-q2',
      'Khi trình bày kết quả quý cho sếp, nên:',
      [
        opt('ch9-w1-q2-a', 'Mở đầu bằng highlight chính', true),
        opt('ch9-w1-q2-b', 'Dùng số liệu cụ thể', true),
        opt('ch9-w1-q2-c', 'Tránh đề xuất bước tiếp theo'),
        opt('ch9-w1-q2-d', 'Kết thúc bằng action plan', true),
      ],
    ),
  ]),
];

export const mentorQuestionBankSeed = [
  makeBank(1001, 1, 'Khởi động & Làm quen thuật ngữ', chapter1Sections, {
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-03-05T10:30:00.000Z',
    questionBankUpdatedAt: '2026-03-05T10:30:00.000Z',
  }),
  makeBank(1002, 2, 'Kỹ năng viết Email chuyên nghiệp', chapter2Sections, {
    createdAt: '2026-02-12T09:00:00.000Z',
    updatedAt: '2026-03-04T14:00:00.000Z',
    questionBankUpdatedAt: '2026-03-04T14:00:00.000Z',
  }),
  makeBank(1003, 3, 'Thuyết trình và họp hành công sở', chapter3Sections),
  makeBank(1004, 4, 'Đàm phán và thương lượng cơ bản', chapter4Sections),
  makeBank(1005, 5, 'Điện thoại và hội nghị trực tuyến', chapter5Sections),
  makeBank(1006, 6, 'Văn hóa làm việc quốc tế', chapter6Sections),
  makeBank(1007, 7, 'Báo cáo và thuyết minh số liệu', chapter7Sections),
  makeBank(1008, 8, 'Phản hồi và coaching nội bộ', chapter8Sections),
  makeBank(1009, 9, 'Tổng kết và luyện tập tích hợp', chapter9Sections, {
    updatedAt: '2026-03-06T09:15:00.000Z',
    questionBankUpdatedAt: '2026-03-06T09:15:00.000Z',
  }),
];
