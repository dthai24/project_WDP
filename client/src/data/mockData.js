export const currentUser = {
  id: 1,
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuyenTu',
  coins: 1250,
  isPro: false,
  currentStreak: 7,
  totalWords: 486,
  learnedWords: 312,
  dueWords: 24,
};

export const weekDays = [
  { label: 'T2', isActive: true, isToday: false },
  { label: 'T3', isActive: true, isToday: false },
  { label: 'T4', isActive: true, isToday: false },
  { label: 'T5', isActive: true, isToday: false },
  { label: 'T6', isActive: true, isToday: false },
  { label: 'T7', isActive: false, isToday: false },
  { label: 'CN', isActive: true, isToday: true },
];

export const navItems = [
  { path: '/home', label: 'Trang chủ', icon: 'home', color: '#23ac38' },
  { path: '/category-list', label: 'Bộ từ vựng', icon: 'folder', color: '#1cb0f6' },
  { path: '/words', label: 'Từ vựng', icon: 'book', color: '#9333ea' },
  { path: '/practice', label: 'Luyện tập', icon: 'flashcard', color: '#7c3aed' },
  { path: '/games', label: 'Game', icon: 'game', color: '#ea580c' },
  { path: '/roadmap', label: 'Lộ trình', icon: 'roadmap', color: '#0284c7' },
  { path: '/leaderboard', label: 'Xếp hạng', icon: 'trophy', color: '#f59e0b' },
  { path: '/store', label: 'Cửa hàng', icon: 'store', color: '#1cb0f6' },
  { path: '/pricing', label: 'Nâng cấp Pro', icon: 'vip', color: '#a855f7', isVip: true },
];

export const categories = [
  {
    id: 1,
    name: 'TOEIC 450-550',
    description: 'Từ vựng cơ bản cho TOEIC 450-550 điểm',
    wordCount: 1200,
    progress: 45,
    tags: ['TOEIC', 'Cơ bản'],
    color: '#2563EB',
    isPublic: true,
  },
  {
    id: 2,
    name: 'TOEIC 750-850',
    description: 'Từ vựng trung cấp cho TOEIC 750-850 điểm',
    wordCount: 1500,
    progress: 28,
    tags: ['TOEIC', 'Trung cấp'],
    color: '#7C3AED',
    isPublic: true,
  },
  {
    id: 3,
    name: 'IELTS Academic 6.0',
    description: 'Từ vựng IELTS Academic band 6.0',
    wordCount: 800,
    progress: 62,
    tags: ['IELTS', 'Academic'],
    color: '#10B981',
    isPublic: true,
  },
  {
    id: 4,
    name: 'Oxford 3000',
    description: '3000 từ vựng Oxford phổ biến nhất',
    wordCount: 3000,
    progress: 15,
    tags: ['Oxford', 'Cơ bản'],
    color: '#F59E0B',
    isPublic: true,
  },
  {
    id: 5,
    name: 'Giao tiếp hàng ngày',
    description: 'Từ vựng giao tiếp thực tế hàng ngày',
    wordCount: 500,
    progress: 80,
    tags: ['Giao tiếp', 'Cá nhân'],
    color: '#F43F5E',
    isPublic: false,
  },
  {
    id: 6,
    name: 'THPT Quốc gia',
    description: 'Từ vựng ôn thi THPT Quốc gia môn Anh',
    wordCount: 900,
    progress: 55,
    tags: ['THPT', 'Ôn thi'],
    color: '#0EA5E9',
    isPublic: true,
  },
];

export const words = [
  { id: 1, word: 'accomplish', phonetic: '/əˈkʌmplɪʃ/', meaning: 'hoàn thành', example: 'She accomplished her goal.', level: 2, category: 'TOEIC 450-550' },
  { id: 2, word: 'benefit', phonetic: '/ˈbenɪfɪt/', meaning: 'lợi ích', example: 'Exercise has many benefits.', level: 3, category: 'TOEIC 450-550' },
  { id: 3, word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', meaning: 'toàn diện', example: 'A comprehensive study guide.', level: 1, category: 'IELTS Academic 6.0' },
  { id: 4, word: 'deteriorate', phonetic: '/dɪˈtɪəriəreɪt/', meaning: 'xấu đi, suy giảm', example: 'His health began to deteriorate.', level: 0, category: 'IELTS Academic 6.0' },
  { id: 5, word: 'efficient', phonetic: '/ɪˈfɪʃnt/', meaning: 'hiệu quả', example: 'An efficient way to learn.', level: 4, category: 'Oxford 3000' },
  { id: 6, word: 'facilitate', phonetic: '/fəˈsɪlɪteɪt/', meaning: 'tạo điều kiện thuận lợi', example: 'Technology facilitates communication.', level: 2, category: 'TOEIC 750-850' },
  { id: 7, word: 'genuine', phonetic: '/ˈdʒenjuɪn/', meaning: 'thật, chân thật', example: 'She showed genuine interest.', level: 3, category: 'Giao tiếp hàng ngày' },
  { id: 8, word: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', meaning: 'giả thuyết', example: 'Test the hypothesis carefully.', level: 1, category: 'IELTS Academic 6.0' },
  { id: 9, word: 'implement', phonetic: '/ˈɪmplɪment/', meaning: 'thực hiện', example: 'Implement the new policy.', level: 2, category: 'TOEIC 750-850' },
  { id: 10, word: 'justify', phonetic: '/ˈdʒʌstɪfaɪ/', meaning: 'biện minh', example: 'Can you justify your decision?', level: 0, category: 'TOEIC 450-550' },
];

export const practiceModes = [
  { id: 'flashcard', name: 'Flashcard', description: 'Học từ vựng với thẻ ghi nhớ thông minh', icon: '🃏', color: '#7C3AED' },
  { id: 'quiz', name: 'Trắc nghiệm', description: 'Chọn đáp án đúng cho từ vựng', icon: '❓', color: '#2563EB' },
  { id: 'matching', name: 'Nối nghĩa', description: 'Nối từ tiếng Anh với nghĩa tiếng Việt', icon: '🔗', color: '#10B981' },
  { id: 'typing', name: 'Gõ từ', description: 'Nghe và gõ lại từ vựng chính xác', icon: '⌨️', color: '#F59E0B' },
  { id: 'listening', name: 'Nghe viết', description: 'Nghe phát âm và viết lại từ', icon: '🎧', color: '#F43F5E' },
  { id: 'mixed', name: 'Tổng hợp', description: 'Kết hợp nhiều chế độ luyện tập', icon: '🎯', color: '#EA580C' },
];

export const games = [
  { id: 1, name: 'Memory Match', description: 'Lật thẻ tìm cặp từ-nghĩa', players: 12500, icon: '🧠', color: '#7C3AED' },
  { id: 2, name: 'Word Scramble', description: 'Sắp xếp chữ cái thành từ đúng', players: 8900, icon: '🔤', color: '#2563EB' },
  { id: 3, name: 'Speed Quiz', description: 'Trả lời nhanh trong thời gian giới hạn', players: 15200, icon: '⚡', color: '#F59E0B' },
  { id: 4, name: 'Listening Challenge', description: 'Nghe và chọn từ đúng', players: 7600, icon: '🎵', color: '#10B981' },
  { id: 5, name: 'Word Builder', description: 'Ghép chữ tạo từ vựng mới', players: 5400, icon: '🏗️', color: '#EA580C' },
  { id: 6, name: 'Spelling Bee', description: 'Đánh vần từ vựng chính xác', players: 9800, icon: '🐝', color: '#F43F5E' },
];

export const roadmaps = [
  {
    id: 1,
    title: 'TOEIC Foundation',
    subtitle: '450 → 550 điểm',
    progress: 45,
    totalDecks: 12,
    completedDecks: 5,
    color: '#2563EB',
    stages: [
      { name: 'Basic Vocabulary', status: 'completed', words: 300 },
      { name: 'Business Terms', status: 'completed', words: 250 },
      { name: 'Office Communication', status: 'in-progress', words: 200 },
      { name: 'Travel & Tourism', status: 'locked', words: 250 },
      { name: 'Finance & Banking', status: 'locked', words: 200 },
    ],
  },
  {
    id: 2,
    title: 'IELTS Academic',
    subtitle: 'Band 5.0 → 6.5',
    progress: 28,
    totalDecks: 15,
    completedDecks: 4,
    color: '#10B981',
    stages: [
      { name: 'Academic Words A-C', status: 'completed', words: 400 },
      { name: 'Academic Words D-F', status: 'in-progress', words: 400 },
      { name: 'Reading Vocabulary', status: 'locked', words: 350 },
      { name: 'Writing Task 2', status: 'locked', words: 300 },
      { name: 'Speaking Topics', status: 'locked', words: 250 },
    ],
  },
  {
    id: 3,
    title: 'Oxford 3000',
    subtitle: 'Từ cơ bản đến nâng cao',
    progress: 15,
    totalDecks: 10,
    completedDecks: 1,
    color: '#F59E0B',
    stages: [
      { name: 'Level A1-A2', status: 'completed', words: 600 },
      { name: 'Level B1', status: 'in-progress', words: 800 },
      { name: 'Level B2', status: 'locked', words: 800 },
      { name: 'Level C1', status: 'locked', words: 800 },
    ],
  },
];

export const leaderboard = [
  { rank: 1, name: 'Minh Anh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinhAnh', streak: 45, words: 4520, coins: 8900 },
  { rank: 2, name: 'Hoàng Long', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HoangLong', streak: 38, words: 3890, coins: 7200 },
  { rank: 3, name: 'Ngọc Hân', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NgocHan', streak: 32, words: 3450, coins: 6800 },
  { rank: 4, name: 'Tuấn Kiệt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TuanKiet', streak: 28, words: 2980, coins: 5400 },
  { rank: 5, name: 'Bảo Trâm', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BaoTram', streak: 25, words: 2650, coins: 4900 },
  { rank: 6, name: 'Quang Huy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuangHuy', streak: 21, words: 2340, coins: 4200 },
  { rank: 7, name: 'Đức Anh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DucAnh', streak: 18, words: 2100, coins: 3800 },
  { rank: 8, name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuyenTu', streak: 7, words: 312, coins: 1250, isCurrentUser: true },
];

export const storeItems = [
  { id: 1, name: 'Avatar Mèo dễ thương', type: 'avatar', price: 200, image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat', owned: true },
  { id: 2, name: 'Avatar Robot', type: 'avatar', price: 350, image: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot', owned: false },
  { id: 3, name: 'Nền gradient xanh', type: 'background', price: 500, image: 'linear-gradient(135deg, #667eea, #764ba2)', owned: false },
  { id: 4, name: 'Nền hoàng hôn', type: 'background', price: 500, image: 'linear-gradient(135deg, #f093fb, #f5576c)', owned: true },
  { id: 5, name: 'Hiệu ứng pháo hoa', type: 'effect', price: 800, image: '🎆', owned: false },
  { id: 6, name: 'Âm thanh gõ phím', type: 'sound', price: 300, image: '🔊', owned: false },
  { id: 7, name: 'Khung avatar vàng', type: 'frame', price: 600, image: '👑', owned: false },
  { id: 8, name: 'Sticker streak 30 ngày', type: 'sticker', price: 150, image: '🔥', owned: true },
];

export const pricingPlans = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    period: 'mãi mãi',
    features: ['Flashcard cơ bản', '3 bộ từ vựng', 'Game luyện tập', 'Streak tracking', '100 coin/ngày'],
    color: '#6B7280',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99000,
    period: '/tháng',
    features: ['Không giới hạn bộ từ', 'AI tạo từ vựng', 'Tất cả game & chế độ', 'Lộ trình TOEIC/IELTS', '500 coin/ngày', 'Không quảng cáo'],
    color: '#F59E0B',
    popular: true,
  },
  {
    id: 'pro-year',
    name: 'Pro Năm',
    price: 799000,
    period: '/năm',
    features: ['Tất cả tính năng Pro', 'Tiết kiệm 33%', 'Avatar độc quyền', 'Hỗ trợ ưu tiên', '1000 coin/ngày'],
    color: '#7C3AED',
  },
];

export const classes = [
  { id: 1, name: 'Lớp TOEIC Tháng 6', teacher: 'Cô Mai', students: 28, decks: 5, code: 'TOEIC06' },
  { id: 2, name: 'IELTS Reading 6.5+', teacher: 'Thầy Hùng', students: 15, decks: 8, code: 'IELTS65' },
  { id: 3, name: 'Giao tiếp cơ bản', teacher: 'Cô Lan', students: 32, decks: 4, code: 'SPEAK01' },
];

export const landingStats = [
  { value: '100.000+', label: 'người học', icon: 'users' },
  { value: '6 mode', label: 'game luyện tập', icon: 'game' },
  { value: 'SRS', label: 'nhắc ôn thông minh', icon: 'brain' },
];

export const landingFeatures = [
  {
    eyebrow: 'Decks & Community',
    title: 'Tạo bộ từ, gom chủ đề và học cùng cộng đồng',
    description: 'Quản lý bộ từ theo lộ trình, tag, chủ đề hoặc mục tiêu riêng.',
    bullets: ['Tạo deck riêng trong vài giây', 'Gắn nhãn TOEIC, IELTS, THPT', 'Kết nối thư viện cộng đồng'],
    chips: ['Tạo deck mới', 'Theo chủ đề', 'Cộng đồng'],
    color: '#2563EB',
  },
  {
    eyebrow: 'Roadmap & Library',
    title: 'Lộ trình rõ ràng cho TOEIC, IELTS và học theo level',
    description: 'Không phải đoán nên học gì tiếp theo. Lộ trình được sắp xếp từ cơ bản tới nâng cao.',
    bullets: ['Theo dõi roadmap theo kỳ thi', 'Quản lý sub-deck, thư mục', 'Flashcard ở trung tâm trải nghiệm'],
    chips: ['Lộ trình', 'Sub-decks', 'Flashcard'],
    color: '#10B981',
  },
  {
    eyebrow: 'Games & SRS',
    title: 'Biến việc ôn từ thành game ngắn, nhanh và dễ quay lại',
    description: 'Chuyển cùng một bộ từ sang trắc nghiệm, nối nghĩa, gõ từ, nghe viết hoặc chế độ tổng hợp.',
    bullets: ['6 chế độ luyện tập', 'SRS tự động đưa từ sắp quên', 'Cảm giác học giống game'],
    chips: ['6 mode', 'SRS', 'Coin thưởng'],
    color: '#7C3AED',
  },
];

export const testimonials = [
  { quote: 'Ban đầu chỉ định thử, nhưng học xong chuyển sang chơi game luôn nên cuối cùng ngày nào cũng vào.', author: 'Minh Anh', role: 'Sinh viên ôn TOEIC' },
  { quote: 'Mình hay học lung tung, giờ có roadmap nên biết hôm nay học gì và ôn gì, không bỏ rơi nữa.', author: 'Hoàng Long', role: 'Người đi làm tự học tiếng Anh' },
  { quote: 'Con mình thích phần coin với cửa hàng lắm, học xong là vào mua đồ liền.', author: 'Chị Hương', role: 'Phụ huynh' },
];

export const faqs = [
  { q: 'Luyện Từ có miễn phí để bắt đầu không?', a: 'Có. Bạn có thể đăng ký và bắt đầu học ngay trên web, dùng flashcard, game luyện tập và lộ trình cơ bản.' },
  { q: 'Trang này hỗ trợ những mục tiêu học nào?', a: 'Bạn có thể học theo lộ trình TOEIC, IELTS, THPT, Oxford 3000 hoặc tự tạo bộ từ riêng.' },
  { q: 'Spaced Repetition hoạt động như thế nào?', a: 'Hệ thống đánh dấu các từ cần ôn lại và đưa chúng quay trở lại đúng thời điểm bạn dễ quên nhất.' },
  { q: 'Tôi có thể học trên điện thoại không?', a: 'Có. Toàn bộ giao diện được tối ưu để dùng tốt trên điện thoại, tablet và laptop.' },
];

export const flashcardDeck = words.slice(0, 5);
