import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Flame,
  Brain,
  FileText,
  Moon,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  TrendingUp,
  Edit2,
  X,
  Mail,
  Bell,
  ArrowLeft,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  BookOpen,
  Lock,
  Download,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Trash2,
  Check,
  Play,
  Pause,
  Award,
  Users,
  Search,
  Volume2,
} from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'
import { Profile } from './Profile'

// Quiz questions constant
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Chọn câu viết đúng ngữ pháp tiếng Anh:",
    options: [
      "She don't like reading books in her free time.",
      "She doesn't likes reading books in her free time.",
      "She doesn't like reading books in her free time.",
      "She don't likes reading books in her free time."
    ],
    answer: 2,
    explanation: "Với chủ ngữ số ít là 'She', ta phải sử dụng trợ động từ phủ định 'doesn't' kết hợp động từ nguyên mẫu không chia 'like'."
  },
  {
    id: 2,
    question: "Điền giới từ đúng: 'I have been living in Hanoi _______ 2018.'",
    options: [
      "for",
      "since",
      "in",
      "during"
    ],
    answer: 1,
    explanation: "Dùng 'since' trước mốc thời gian cụ thể (2018) trong thì Hiện tại hoàn thành để chỉ thời điểm bắt đầu hành động."
  },
  {
    id: 3,
    question: "Điền thì thích hợp: 'By the time the teacher arrived, the students _______ their assignments.'",
    options: [
      "finish",
      "finished",
      "have finished",
      "had finished"
    ],
    answer: 3,
    explanation: "Hành động 'finish' xảy ra và hoàn thành TRƯỚC một hành động khác trong quá khứ ('arrived'), nên dùng thì Quá khứ hoàn thành (had + V3/ed)."
  },
  {
    id: 4,
    question: "If I _______ you, I would take that job offer immediately.",
    options: ["am", "was", "were", "would be"],
    answer: 2,
    explanation: "Đây là câu điều kiện loại 2 diễn tả giả định không có thật ở hiện tại. Động từ to-be chia là 'were' cho tất cả các ngôi."
  },
  {
    id: 5,
    question: "The man _______ you met yesterday is my English teacher.",
    options: ["which", "whom", "whose", "whoever"],
    answer: 1,
    explanation: "'Whom' làm tân ngữ chỉ người thay thế cho 'The man' đứng trước."
  },
  {
    id: 6,
    question: "I wish I _______ more time to travel last summer.",
    options: ["have", "had", "would have", "had had"],
    answer: 3,
    explanation: "Câu ước ở quá khứ (wish in the past) dùng cấu trúc 'had + V3/ed'. Ở đây động từ chính là 'have' nên chia thành 'had had'."
  },
  {
    id: 7,
    question: "She asked me where I _______ from.",
    options: ["come", "came", "have come", "will come"],
    answer: 1,
    explanation: "Trong câu gián tiếp (Reported Speech), mệnh đề hỏi cần được lùi thì từ Hiện tại đơn (come) sang Quá khứ đơn (came)."
  },
  {
    id: 8,
    question: "We are looking forward to _______ you at the conference next week.",
    options: ["meet", "meeting", "met", "be met"],
    answer: 1,
    explanation: "Cấu trúc 'look forward to' đi kèm với V-ing (to ở đây là giới từ)."
  },
  {
    id: 9,
    question: "This is the most _______ book I have ever read.",
    options: ["interest", "interested", "interesting", "interestingly"],
    answer: 2,
    explanation: "Dùng tính từ đuôi '-ing' (interesting) để chỉ tính chất, đặc điểm của sự vật (cuốn sách)."
  },
  {
    id: 10,
    question: "He drove _______ to avoid causing an accident in the heavy rain.",
    options: ["careful", "carefully", "careless", "carelessly"],
    answer: 1,
    explanation: "Dùng trạng từ 'carefully' để bổ nghĩa cho động từ thường 'drove'."
  },
  {
    id: 11,
    question: "They have built a new school in this village _______ last year.",
    options: ["for", "since", "during", "in"],
    answer: 1,
    explanation: "Dùng 'since' đi kèm với mốc thời gian 'last year' trong thì Hiện tại hoàn thành."
  },
  {
    id: 12,
    question: "If it rains tomorrow, we _______ the outdoor picnic.",
    options: ["cancel", "would cancel", "will cancel", "canceled"],
    answer: 2,
    explanation: "Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai: If + S + V(s/es), S + will + V-inf."
  },
  {
    id: 13,
    question: "English _______ all over the world by millions of people.",
    options: ["is spoken", "speaks", "is speaking", "has spoken"],
    answer: 0,
    explanation: "Câu bị động ở thì Hiện tại đơn: S + am/is/are + V3/ed. Chủ ngữ 'English' là danh từ không đếm được."
  },
  {
    id: 14,
    question: "My father suggested _______ by train to enjoy the scenery.",
    options: ["go", "to go", "going", "gone"],
    answer: 2,
    explanation: "Cấu trúc 'suggest + V-ing' đề nghị làm một việc gì đó."
  },
  {
    id: 15,
    question: "The girl _______ dog was lost was crying on the street.",
    options: ["who", "whom", "whose", "which"],
    answer: 2,
    explanation: "Dùng đại từ quan hệ sở hữu 'whose' đứng trước danh từ 'dog' để chỉ sự sở hữu (chú chó của cô gái)."
  },
  {
    id: 16,
    question: "He is not used to _______ early in the morning.",
    options: ["get up", "getting up", "got up", "to get up"],
    answer: 1,
    explanation: "Cấu trúc 'be/get used to + V-ing' diễn tả việc quen với việc gì đó ở hiện tại."
  },
  {
    id: 17,
    question: "Choose the word whose underlined part is pronounced differently: pl<u>ay</u>ed, stay<u>ed</u>, call<u>ed</u>, want<u>ed</u>.",
    options: ["played", "stayed", "called", "wanted"],
    answer: 3,
    explanation: "wanted phát âm là /id/, các từ còn lại phát âm tận cùng là /d/."
  },
  {
    id: 18,
    question: "The exam was _______ difficult than we had expected.",
    options: ["much", "more", "most", "as"],
    answer: 1,
    explanation: "Dùng cấu trúc so sánh hơn với tính từ dài 'difficult': S + V + more + adj + than."
  },
  {
    id: 19,
    question: "We decided not to go out because of the _______ rain.",
    options: ["heavy", "strong", "hardly", "big"],
    answer: 0,
    explanation: "Mưa lớn/nặng hạt trong tiếng Anh thường đi kèm tính từ 'heavy' (heavy rain)."
  },
  {
    id: 20,
    question: "Neither my sisters nor my brother _______ ready to go yet.",
    options: ["is", "are", "were", "have been"],
    answer: 0,
    explanation: "Trong cấu trúc 'Neither... nor...', động từ chia theo chủ ngữ gần nhất đứng sau 'nor' (my brother - số ít)."
  },
  {
    id: 21,
    question: "The children are excited _______ going to the zoo this weekend.",
    options: ["about", "with", "at", "for"],
    answer: 0,
    explanation: "Cấu trúc 'excited about' hào hứng, phấn khích về việc gì."
  },
  {
    id: 22,
    question: "By next month, she _______ English for five years.",
    options: ["will learn", "will have learned", "has learned", "is learning"],
    answer: 1,
    explanation: "Dùng thì Tương lai hoàn thành (will have + V3/ed) để diễn tả hành động sẽ hoàn thành trước một mốc thời gian trong tương lai."
  },
  {
    id: 23,
    question: "The meeting _______ because of the storm.",
    options: ["postponed", "was postponed", "has postponed", "is postponing"],
    answer: 1,
    explanation: "Bị động quá khứ đơn: cuộc họp đã bị hoãn lại (was postponed)."
  },
  {
    id: 24,
    question: "He ran as fast as he could, _______ he still missed the bus.",
    options: ["but", "and", "so", "because"],
    answer: 0,
    explanation: "Dùng liên từ chỉ sự tương phản 'but' (nhưng)."
  },
  {
    id: 25,
    question: "You _______ smoke in the hospital; it is strictly prohibited.",
    options: ["don't have to", "mustn't", "needn't", "shouldn't"],
    answer: 1,
    explanation: "Dùng 'mustn't' để chỉ sự cấm đoán (prohibited)."
  },
  {
    id: 26,
    question: "Although he was very tired, _______ he finished his homework.",
    options: ["but", "however", "he still", "so"],
    answer: 2,
    explanation: "Trong tiếng Anh, đã dùng 'Although' ở đầu câu thì không dùng 'but' ở vế sau. Ta chọn 'he still' để bổ nghĩa cho hành động."
  },
  {
    id: 27,
    question: "She is the student _______ won the first prize in the competition.",
    options: ["whom", "who", "which", "whose"],
    answer: 1,
    explanation: "Dùng đại từ quan hệ 'who' làm chủ ngữ chỉ người thay thế cho 'the student'."
  },
  {
    id: 28,
    question: "He is looking _______ a new job since he was laid off last week.",
    options: ["after", "for", "at", "up"],
    answer: 1,
    explanation: "Cụm động từ 'look for' nghĩa là tìm kiếm (a new job)."
  },
  {
    id: 29,
    question: "If you had studied harder, you _______ the final exam yesterday.",
    options: ["would pass", "will pass", "would have passed", "passed"],
    answer: 2,
    explanation: "Câu điều kiện loại 3 giả định trái ngược quá khứ: If + S + had + V3, S + would have + V3."
  },
  {
    id: 30,
    question: "I don't mind _______ you with your homework if you need help.",
    options: ["help", "to help", "helping", "helped"],
    answer: 2,
    explanation: "Cấu trúc 'mind + V-ing' phiền hoặc ngại làm việc gì đó."
  }
];

// Flashcards constant
const FLASHCARDS = [
  {
    id: 1,
    title: "Conditional Type 3",
    formula: "If + S + had + V3/ed, S + would + have + V3/ed",
    usage: "Diễn tả giả thiết trái ngược với thực tế trong quá khứ."
  },
  {
    id: 2,
    title: "Câu điều kiện loại 2",
    formula: "If + S + V2/ed, S + would/could + V-inf",
    usage: "Diễn tả giả thiết không có thực ở hiện tại (to-be luôn chia 'were')."
  },
  {
    id: 3,
    title: "Wish in the past",
    formula: "S + wish + S + had + V3/ed (hoặc: If only...)",
    usage: "Diễn tả mong ước trái ngược với sự thật trong quá khứ."
  },
  {
    id: 4,
    title: "Mệnh đề quan hệ WHO vs WHOM",
    formula: "S + (WHO + V) + V2... vs S + (WHOM + S2 + V2) + V...",
    usage: "WHO làm chủ ngữ của mệnh đề quan hệ; WHOM làm tân ngữ."
  },
  {
    id: 5,
    title: "Phân biệt Look up vs Look after",
    formula: "Look up: Tra cứu (từ điển) | Look after: Chăm sóc",
    usage: "Cụm động từ (Phrasal Verbs) thường gặp trong IELTS và THPT."
  }
]

// Knowledge map nodes structure
const KNOWLEDGE_NODES = [
  {
    id: 'tenses-present',
    module: 'Thì & Khía Cạnh (Tenses & Aspect)',
    title: 'Thì Hiện Tại Hoàn Thành',
    subtitle: 'Present Perfect Tense',
    percentage: 100,
    status: 'completed',
    premium: false,
    readiness: 'Hoàn hảo (95%)',
    summary: 'Dùng để diễn tả hành động đã hoàn thành cho tới hiện tại mà không đề cập thời gian cụ thể.',
    rules: [
      'Khẳng định: S + have/has + V3/ed',
      'Phủ định: S + have/has + not + V3/ed',
      'Nghi vấn: Have/Has + S + V3/ed?',
      'Dấu hiệu: since, for, already, yet, just, ever, never, so far...'
    ],
    tasks: [
      { text: 'Làm bài tập phân biệt Hiện tại hoàn thành & Quá khứ đơn', done: true },
      { text: 'Nhận diện các trạng từ chỉ thời gian đặc trưng', done: true }
    ]
  },
  {
    id: 'relative-clauses',
    module: 'Mệnh Đề & Câu (Clauses & Sentences)',
    title: 'Mệnh Đề Quan Hệ',
    subtitle: 'Relative Clauses',
    percentage: 75,
    status: 'in_progress',
    premium: false,
    readiness: 'Khá tốt (75%)',
    summary: 'Dùng giải thích rõ hơn cho danh từ đứng trước. Gồm mệnh đề xác định & không xác định.',
    rules: [
      'Who: Chủ ngữ/tân ngữ chỉ người',
      'Whom: Tân ngữ chỉ người',
      'Which: Chủ ngữ/tân ngữ chỉ vật',
      'That: Thay cho Who, Whom, Which trong mệnh đề xác định',
      'Whose: Chỉ sở hữu của người/vật'
    ],
    tasks: [
      { text: 'Luyện tập rút gọn mệnh đề quan hệ', done: false },
      { text: 'Phân biệt mệnh đề xác định và không xác định', done: true }
    ]
  },
  {
    id: 'reported-speech',
    module: 'Mệnh Đề & Câu (Clauses & Sentences)',
    title: 'Câu Gián Tiếp',
    subtitle: 'Reported Speech',
    percentage: 0,
    status: 'locked',
    premium: true,
    readiness: 'Chưa học (0%)',
    summary: 'Thuật lại lời nói của người khác. Cần lùi thì, đổi ngôi và đổi trạng ngữ thời gian/nơi chốn.',
    rules: [
      'Lùi thì: Hiện tại đơn -> Quá khứ đơn, Hiện tại hoàn thành -> Quá khứ hoàn thành...',
      'Đổi ngôi: Ngôi thứ nhất -> người nói, Ngôi thứ hai -> người nghe',
      'Đổi trạng từ: here -> there, now -> then, today -> that day, yesterday -> the day before'
    ],
    tasks: [
      { text: 'Nắm vững quy tắc lùi thì động từ khuyết thiếu', done: false },
      { text: 'Luyện tập chuyển câu hỏi Yes/No và Wh-question', done: false }
    ]
  },
  {
    id: 'phrasal-verbs',
    module: 'Từ Vựng & Cụm Từ (Vocabulary & Phrasals)',
    title: 'Cụm Động Từ Thông Dụng',
    subtitle: 'Common Phrasal Verbs',
    percentage: 60,
    status: 'in_progress',
    premium: false,
    readiness: 'Cơ bản (60%)',
    summary: 'Động từ kết hợp giới từ/trạng từ tạo nghĩa mới hoàn toàn.',
    rules: [
      'Take off: Cất cánh, cởi đồ',
      'Look after: Chăm sóc',
      'Give up: Từ bỏ',
      'Bring up: Nuôi nấng, đề cập'
    ],
    tasks: [
      { text: 'Học 20 cụm động từ với Look và Take', done: true },
      { text: 'Áp dụng phrasal verbs vào bài viết Writing', done: false }
    ]
  },
  {
    id: 'pronunciation-ed',
    module: 'Phát Âm & Luyện Nghe (Pronunciation & Listening)',
    title: 'Phát Âm Đuôi -ed và -s/es',
    subtitle: 'Pronunciation of -ed & -s/es',
    percentage: 90,
    status: 'completed',
    premium: false,
    readiness: 'Hoàn hảo (90%)',
    summary: 'Quy tắc phát âm dựa vào âm tận cùng là vô thanh hay hữu thanh.',
    rules: [
      '-ed phát âm /id/ sau t, d; phát âm /t/ sau âm vô thanh; phát âm /d/ sau âm hữu thanh còn lại.',
      '-s/es phát âm /s/ sau p, t, k, f, th; phát âm /iz/ sau âm gió s, z, sh, ch, ge...; phát âm /z/ cho lại.'
    ],
    tasks: [
      { text: 'Luyện phát âm 30 từ tận cùng bằng -ed', done: true },
      { text: 'Làm bài tập phân biệt phát âm đuôi trong đề thi THPT', done: true }
    ]
  },
  {
    id: 'ielts-listening-academic',
    module: 'Phát Âm & Luyện Nghe (Pronunciation & Listening)',
    title: 'Luyện Nghe IELTS Academic',
    subtitle: 'Academic IELTS Listening',
    percentage: 0,
    status: 'locked',
    premium: true,
    readiness: 'Chưa học (0%)',
    summary: 'Nghe hiểu các bài đối thoại học thuật, ghi nhớ ý chính và tránh các bẫy nhiễu phổ biến.',
    rules: [
      'Đoán dạng thông tin cần điền (danh từ, số, ngày tháng, tên riêng...)',
      'Nhận diện từ nối chuyển ý (however, but, on the other hand...)',
      'Luyện nghe chép chính tả (dictation) hàng ngày để tăng phản xạ nghe'
    ],
    tasks: [
      { text: 'Nghe Podcast bài giảng số 1 và note key words', done: false },
      { text: 'Làm đề thi thử IELTS Listening Section 3', done: false }
    ]
  }
]

export function Dashboard({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentPage, _setCurrentPage] = useState('dashboard')
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 14,
    minutes: 42,
    seconds: 18,
  })
  const [examName, setExamName] = useState('Kỳ thi tiếng Anh THPT Quốc gia')
  const [isEditingExam, setIsEditingExam] = useState(false)
  const [editExamName, setEditExamName] = useState(examName)
  const [editExamDate, setEditExamDate] = useState('')
  const [showNotifPopup, setShowNotifPopup] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const navigate = useNavigate()

  // --- Student Demo State ---
  const [xp, setXp] = useState(currentUser?.xp || 1520)
  const [isPro, setIsPro] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('PRO') // 'PRO' or 'PREMIUM'

  // Quiz States
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const [pendingPage, setPendingPage] = useState(null)
  const [essayText, setEssayText] = useState('')
  const [savedQuizProgress, setSavedQuizProgress] = useState(null)
  const [savedEssayProgress, setSavedEssayProgress] = useState(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [restoreType, setRestoreType] = useState(null)

  // Custom page transition blocker if quiz is active or essay has content
  const setCurrentPage = (page) => {
    if ((quizStarted && !quizCompleted) || (currentPage === 'essay' && essayText.trim().length > 0)) {
      setPendingPage(page);
    } else {
      _setCurrentPage(page);
    }
  }

  // 1. Auto-save quiz progress to localStorage
  useEffect(() => {
    if (!currentUser) return;
    const userEmail = currentUser.email;
    if (quizStarted && !quizCompleted) {
      const state = {
        quizStarted,
        currentQuestion,
        selectedAnswer,
        quizScore,
        answerSubmitted,
        quizCompleted,
      };
      localStorage.setItem(`lexiora_quiz_backup_${userEmail}`, JSON.stringify(state));
    } else if (quizCompleted) {
      localStorage.removeItem(`lexiora_quiz_backup_${userEmail}`);
    }
  }, [quizStarted, currentQuestion, selectedAnswer, quizScore, answerSubmitted, quizCompleted, currentUser]);

  // 2. Check for saved quiz or essay progress on mount
  useEffect(() => {
    if (!currentUser) return;
    const userEmail = currentUser.email;
    const quizBackup = localStorage.getItem(`lexiora_quiz_backup_${userEmail}`);
    const essayBackup = localStorage.getItem(`lexiora_essay_backup_${userEmail}`);

    if (quizBackup) {
      try {
        const parsed = JSON.parse(quizBackup);
        if (parsed.quizStarted && !parsed.quizCompleted) {
          setSavedQuizProgress(parsed);
          setRestoreType('quiz');
          setShowRestoreModal(true);
        }
      } catch (e) {
        console.error("Error parsing quiz backup:", e);
      }
    } else if (essayBackup && essayBackup.trim().length > 0) {
      setSavedEssayProgress(essayBackup);
      setRestoreType('essay');
      setShowRestoreModal(true);
    }
  }, [currentUser]);

  // 3. Auto-save essay draft to localStorage
  useEffect(() => {
    if (!currentUser) return;
    const userEmail = currentUser.email;
    if (essayText && essayText.trim().length > 0) {
      localStorage.setItem(`lexiora_essay_backup_${userEmail}`, essayText);
    } else {
      localStorage.removeItem(`lexiora_essay_backup_${userEmail}`);
    }
  }, [essayText, currentUser]);

  // 5. Browser tab/window close warning (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if ((quizStarted && !quizCompleted) || (currentPage === 'essay' && essayText.trim().length > 0)) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizStarted, quizCompleted]);

  // Documents & Chatbot States
  const [selectedDocId, setSelectedDocId] = useState(1)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Xin chào! Tôi là AI Mentor Tiếng Anh. Bạn cần hỏi gì về tài liệu này?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  // Flashcards (Night Mode) States
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Pricing & Payment States
  const [showPaymentQR, setShowPaymentQR] = useState(false)
  const [paymentTimer, setPaymentTimer] = useState(120)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)

  // Planner States
  const [plannerTasks, setPlannerTasks] = useState([
    { id: 1, title: 'Học 10 Phrasal Verbs về chủ đề Work & Study', checked: true },
    { id: 2, title: 'Luyện 1 bài nghe IELTS Listening Section 1', checked: false },
    { id: 3, title: 'Ôn tập phân biệt cấu trúc Since & For', checked: true },
    { id: 4, title: 'Hoàn thành bài viết IELTS Writing Task 1', checked: false },
    { id: 5, title: 'Học ngữ pháp Mệnh đề quan hệ (Relative Clauses)', checked: false }
  ])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [activeMapNode, setActiveMapNode] = useState('relative-clauses')

  // Gamification leader board
  const leaderboard = [
    { name: 'Trần Thị B', xp: 2100, streak: 15, role: 'PRO' },
    { name: currentUser?.name || 'Bạn', xp: xp, streak: currentUser?.streak || 8, role: isPremium ? 'PREMIUM' : isPro ? 'PRO' : 'FREE' },
    { name: 'Nguyễn Văn A', xp: 850, streak: 3, role: 'FREE' }
  ].sort((a, b) => b.xp - a.xp)

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Payment QR Countdown Effect
  useEffect(() => {
    let interval;
    if (showPaymentQR && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer(prev => prev - 1);
      }, 1000);
    } else if (paymentTimer === 0) {
      setShowPaymentQR(false);
    }
    return () => clearInterval(interval);
  }, [showPaymentQR, paymentTimer]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // --- Handlers ---
  const handleSelectAnswer = (index) => {
    if (answerSubmitted) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerSubmitted) return
    setAnswerSubmitted(true)
    const isCorrect = selectedAnswer === QUIZ_QUESTIONS[currentQuestion].answer
    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }
  }

  const handleNextQuizQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
    } else {
      // Finished
      setQuizCompleted(true)
      const pointsEarned = quizScore * 20 + (quizScore === QUIZ_QUESTIONS.length ? 15 : 0)
      setXp(prev => prev + pointsEarned)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setQuizScore(0)
    setAnswerSubmitted(false)
    setQuizCompleted(false)
    setQuizStarted(true)
  }

  const handleSendChat = (textToSend = chatInput) => {
    if (!textToSend.trim()) return
    
    const userMsg = { sender: 'user', text: textToSend }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsAiTyping(true)

    setTimeout(() => {
      let replyText = "Tôi đã ghi nhận câu hỏi của bạn. Vui lòng đặt câu hỏi tập trung vào ngữ pháp và từ vựng tiếng Anh trong tài liệu nhé!"
      const query = textToSend.toLowerCase()

      if (query.includes('since') || query.includes('for')) {
        replyText = "• **Since** (từ khi): Đi với mốc thời gian cụ thể (Since 2018, Since last week, Since Monday).\n• **For** (trong khoảng): Đi với một khoảng thời gian (For 5 years, For 2 hours, For a long time)."
      } else if (query.includes('quá khứ hoàn thành') || query.includes('past perfect')) {
        replyText = "Cấu trúc Thì Quá khứ hoàn thành:\n**S + had + V3/ed**\n*Cách dùng:* Diễn tả một hành động xảy ra và kết thúc TRƯỚC một hành động khác trong quá khứ. Ví dụ: 'The train had left before we arrived.'"
      } else if (query.includes('điều kiện loại 3') || query.includes('conditional 3')) {
        replyText = "Cấu trúc Câu điều kiện loại 3:\n**If + S + had + V3, S + would have + V3**\n*Cách dùng:* Diễn tả sự việc không có thật trong quá khứ. Ví dụ: 'If I had studied harder, I would have passed the exam.'"
      } else if (query.includes('phrasal verb') || query.includes('cụm động từ')) {
        replyText = "Bí kíp nhớ Phrasal Verbs:\n1. Học theo nhóm chủ đề (ví dụ: travel, work, health).\n2. Đặt câu ví dụ thực tế.\n3. Sử dụng flashcards để ôn tập hàng ngày."
      } else if (query.includes('hello') || query.includes('chào')) {
        replyText = "Xin chào! Tôi có thể giúp bạn giải đáp các cấu trúc ngữ pháp Tiếng Anh hoặc gợi ý học từ vựng hiệu quả."
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: replyText }])
      setIsAiTyping(false)
    }, 800)
  }

  const handleVerifyUpgrade = () => {
    setIsVerifyingPayment(true)
    setTimeout(() => {
      setIsVerifyingPayment(false)
      setShowPaymentQR(false)
      if (selectedPlan === 'PREMIUM') {
        setIsPro(true)
        setIsPremium(true)
      } else {
        setIsPro(true)
        setIsPremium(false)
      }
    }, 1800)
  }

  const handleAddPlannerTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      checked: false
    }
    setPlannerTasks(prev => [...prev, newTask])
    setNewTaskTitle('')
  }

  const handleTogglePlannerTask = (id) => {
    setPlannerTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
  }

  const handleDeletePlannerTask = (id) => {
    setPlannerTasks(prev => prev.filter(t => t.id !== id))
  }

  // Calculate stats
  const completedTasksCount = plannerTasks.filter(t => t.checked).length
  const progressPercent = plannerTasks.length > 0 
    ? Math.round((completedTasksCount / plannerTasks.length) * 100) 
    : 0

  const dashboardTasks = [
    { id: 1, title: 'Ôn tập Mệnh đề quan hệ (Relative Clauses)', duration: '45 phút', type: 'Đọc', status: 'done' },
    { id: 2, title: 'Luyện Quiz Cấu trúc điều kiện (Conditionals)', duration: '30 phút', type: 'Thực hành', status: 'doing' },
    { id: 3, title: 'Đọc 100 cụm động từ Phrasal Verbs', duration: '60 phút', type: 'Đọc', status: 'todo' },
  ]

  const mockDocuments = [
    { id: 1, title: "12 Thì Tiếng Anh Căn Bản", pages: 12, size: "1.2 MB", desc: "Tóm tắt cấu trúc, dấu hiệu và bài tập ứng dụng của 12 thì tiếng Anh cơ bản." },
    { id: 2, title: "Bí Quyết IELTS Speaking Band 7.5+", pages: 25, size: "3.4 MB", desc: "Tài liệu chia sẻ từ vựng nâng cao, idioms và cấu trúc giúp cải thiện điểm IELTS Speaking." },
    { id: 3, title: "150 Cụm động từ (Phrasal Verbs) thường gặp", pages: 8, size: "850 KB", desc: "Tổng hợp các cụm động từ thông dụng kèm ví dụ chi tiết trong đề thi tiếng Anh." }
  ]

  return (
    <div 
      className="min-h-screen flex text-slate-800 font-sans antialiased w-full"
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
      }}
    >
      {/* Email Notification Popup */}
      <AnimatePresence>
        {showNotifPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotifPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowNotifPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Bật thông báo qua Email
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Bạn có muốn nhận thông báo nhắc nhở lịch học, kết quả quiz và
                  cập nhật kiến thức tiếng anh mới qua email{' '}
                  <span className="font-semibold text-primary">
                    {currentUser?.email || 'student@gmail.com'}
                  </span>{' '}
                  không?
                </p>
              </div>

              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setShowNotifPopup(false)}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Mail size={18} /> Có, gửi cho tôi
                </button>
                <button
                  onClick={() => setShowNotifPopup(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
                >
                  Không, cảm ơn
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer justify-center group">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                  Không hiển thị lại
                </span>
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Exam Modal */}
      <AnimatePresence>
        {isEditingExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">
                  Chỉnh sửa kỳ thi
                </h3>
                <button
                  onClick={() => setIsEditingExam(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên kỳ thi mục tiêu
                  </label>
                  <input
                    type="text"
                    value={editExamName}
                    onChange={(e) => setEditExamName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm font-sans"
                    placeholder="VD: Kỳ thi IELTS Academic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày thi dự kiến
                  </label>
                  <input
                    type="date"
                    value={editExamDate}
                    onChange={(e) => setEditExamDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm font-sans"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingExam(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setExamName(editExamName || 'Kỳ thi mới')
                    if (editExamDate) {
                      const target = new Date(editExamDate).getTime()
                      const now = new Date().getTime()
                      const diff = Math.max(0, target - now)
                      setTimeLeft({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((diff % (1000 * 60)) / 1000),
                      })
                    }
                    setIsEditingExam(false)
                  }}
                  className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment QR Modal */}
      <AnimatePresence>
        {showPaymentQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/20">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-primary" size={20} /> Thanh toán nâng cấp {selectedPlan === 'PREMIUM' ? 'PREMIUM' : 'PRO'}
                </h3>
                <button
                  onClick={() => setShowPaymentQR(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 text-center space-y-4">
                <p className="text-sm text-slate-500">
                  Vui lòng quét mã QR dưới đây bằng ứng dụng ngân hàng (VietQR) để kích hoạt gói {selectedPlan === 'PREMIUM' ? 'PREMIUM' : 'PRO'} ngay lập tức.
                </p>

                {/* Simulated QR Code */}
                <div className="w-56 h-56 bg-slate-100 border border-slate-200 rounded-2xl mx-auto flex flex-col items-center justify-center relative p-3">
                  {/* Outer border decoration */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                  
                  {/* Mock QR pattern */}
                  <svg className="w-40 h-40 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" fill="black"/>
                    <rect x="10" y="10" width="15" height="15" fill="white"/>
                    <rect x="12" y="12" width="11" height="11" fill="black"/>
                    
                    <rect x="70" y="5" width="25" height="25" fill="black"/>
                    <rect x="75" y="10" width="15" height="15" fill="white"/>
                    <rect x="77" y="12" width="11" height="11" fill="black"/>
                    
                    <rect x="5" y="70" width="25" height="25" fill="black"/>
                    <rect x="10" y="75" width="15" height="15" fill="white"/>
                    <rect x="12" y="77" width="11" height="11" fill="black"/>
                    
                    <rect x="40" y="40" width="20" height="20" fill="black"/>
                    <rect x="45" y="45" width="10" height="10" fill="white"/>
                    
                    {/* Tiny random pixels to make it look like QR */}
                    <rect x="35" y="10" width="5" height="5"/>
                    <rect x="45" y="5" width="8" height="5"/>
                    <rect x="60" y="15" width="5" height="10"/>
                    <rect x="15" y="40" width="10" height="5"/>
                    <rect x="10" y="55" width="5" height="8"/>
                    <rect x="35" y="65" width="12" height="5"/>
                    <rect x="50" y="80" width="15" height="8"/>
                    <rect x="75" y="45" width="5" height="12"/>
                    <rect x="85" y="60" width="10" height="5"/>
                    <rect x="70" y="80" width="8" height="12"/>
                  </svg>
                  
                  {/* Brand Center Mark */}
                  <div className="absolute bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary font-sans leading-none">{selectedPlan}</span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  Số tiền: <span className="text-primary text-lg">{selectedPlan === 'PREMIUM' ? '399,000 đ' : '99,000 đ'}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-1.5 text-xs font-mono">
                  <div><span className="text-slate-400">Ngân hàng:</span> Techcombank</div>
                  <div><span className="text-slate-400">Số tài khoản:</span> 1903567890123</div>
                  <div><span className="text-slate-400">Chủ tài khoản:</span> HOC VIEN TIENG ANH MASTER</div>
                  <div><span className="text-slate-400">Nội dung chuyển khoản:</span> <span className="text-primary font-bold">MASTER {selectedPlan} {currentUser?.email || 'STUDENT'}</span></div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-50 py-1.5 px-3 rounded-full w-fit mx-auto">
                  <Clock size={14} /> Mã QR hết hạn sau: {Math.floor(paymentTimer / 60)}:{(paymentTimer % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={handleVerifyUpgrade}
                  disabled={isVerifyingPayment}
                  className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isVerifyingPayment ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Đang kiểm tra giao dịch...
                    </>
                  ) : (
                    "Xác nhận đã chuyển khoản"
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Hệ thống tự động kích hoạt ngay sau khi nhận được tiền.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
      />
      
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <TopBar currentUser={currentUser} />
        
        <AnimatePresence mode="wait">
          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Profile
                onLogout={onLogout || (() => navigate('/'))}
                setCurrentPage={setCurrentPage}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6 pb-20"
            >
              {/* Welcome Banner */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-primary/20 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 mb-6 md:mb-0">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                    Học viên {isPremium ? 'PREMIUM 💎' : isPro ? 'PRO ⭐️' : 'MEMBER'}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Chào mừng trở lại, {currentUser?.name || 'Alex'}! 🎯
                  </h1>
                  <p className="text-white/80">
                    Bạn đã sẵn sàng 73% cho kỳ thi mục tiêu. (Tích lũy: <span className="font-bold text-yellow-300">{xp} XP</span>)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    <Target size={16} /> Trọng tâm hôm nay: Mệnh đề quan hệ (Relative Clauses)
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="relative z-10 bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40 text-center group shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      {examName}
                    </p>
                    <button
                      onClick={() => setIsEditingExam(true)}
                      className="text-slate-700 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { label: 'DAYS', value: timeLeft.days },
                      { label: 'HOURS', value: timeLeft.hours },
                      { label: 'MINS', value: timeLeft.minutes },
                      { label: 'SECS', value: timeLeft.seconds },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-white text-primary font-bold text-xl md:text-2xl w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-inner">
                          {item.value.toString().padStart(2, '0')}
                        </div>
                        <span className="text-[10px] mt-1 text-slate-700 font-bold">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Stats Row */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="bg-white/75 backdrop-blur-md rounded-2xl p-5 border border-rose-100/50 shadow-sm hover:shadow-md hover:border-rose-200/60 transition-all flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="73, 100"
                            className="animate-[dash_1.5s_ease-out]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">
                          73%
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Điểm sẵn sàng</p>
                        <p className="text-xs text-success flex items-center gap-1 mt-1 font-semibold">
                          <TrendingUp size={12} /> +5% tuần này
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/75 backdrop-blur-md rounded-2xl p-5 border border-rose-100/50 shadow-sm hover:shadow-md hover:border-rose-200/60 transition-all flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                        <Flame size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Chuỗi học tập</p>
                        <p className="text-xl font-bold text-text-primary">{currentUser?.streak || 8} Ngày</p>
                        <p className="text-xs text-slate-400 mt-1">Kỷ lục: 21 ngày</p>
                      </div>
                    </div>

                    <div className="bg-white/75 backdrop-blur-md rounded-2xl p-5 border border-rose-100/50 shadow-sm hover:shadow-md hover:border-rose-200/60 transition-all flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                        <Brain size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Kiến thức đã nắm</p>
                        <p className="text-xl font-bold text-text-primary">
                          24 <span className="text-sm text-slate-400 font-normal">/ 35 chuyên đề</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tasks */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-rose-100/50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-text-primary">
                        Nhiệm vụ ôn tập hôm nay
                      </h2>
                      <button
                        onClick={() => setCurrentPage('planner')}
                        className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        Kế hoạch chi tiết <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {dashboardTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${task.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : task.status === 'doing' ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 hover:border-primary/30'}`}
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="text-success flex-shrink-0" size={24} />
                          ) : task.status === 'doing' ? (
                            <Clock className="text-primary flex-shrink-0 animate-pulse" size={24} />
                          ) : (
                            <Circle className="text-slate-300 flex-shrink-0" size={24} />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-slate-500' : 'text-text-primary'}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {task.duration}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.type === 'Đọc' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {task.type}
                              </span>
                            </div>
                          </div>
                          {task.status !== 'done' && (
                            <button 
                              onClick={() => {
                                if (task.id === 2) setCurrentPage('quiz')
                                if (task.id === 3) setCurrentPage('documents')
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors active:scale-95"
                            >
                              {task.status === 'doing' ? 'Làm ngay' : 'Bắt đầu'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Streak Calendar */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-rose-100/50 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-text-primary mb-4">
                      Tính nhất quán học tập (Kiến thức tích lũy)
                    </h2>
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                      {Array.from({ length: 40 }).map((_, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-1 flex-shrink-0">
                          {Array.from({ length: 7 }).map((_, rowIndex) => {
                            const val = (colIndex * 7 + rowIndex) % 5
                            let colorClass = 'bg-slate-100'
                            if (val === 1) colorClass = 'bg-rose-200'
                            else if (val === 2) colorClass = 'bg-rose-350'
                            else if (val === 3) colorClass = 'bg-rose-500'
                            else if (val === 4) colorClass = 'bg-rose-600'
                            return (
                              <div
                                key={rowIndex}
                                className={`w-3.5 h-3.5 rounded-sm ${colorClass} transition-colors hover:scale-110 cursor-pointer`}
                                title="Đã học hoàn thành bài"
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>Ít ôn</span>
                      <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                      <div className="w-3 h-3 rounded-sm bg-rose-200"></div>
                      <div className="w-3 h-3 rounded-sm bg-rose-450"></div>
                      <div className="w-3 h-3 rounded-sm bg-rose-600"></div>
                      <span>Chăm chỉ</span>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Quick Actions & Payment */}
                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-rose-100/50 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-text-primary mb-4">
                      Thao tác học nhanh
                    </h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => setCurrentPage('documents')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-light hover:bg-primary/5 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary text-sm">
                            Học qua tài liệu
                          </h4>
                          <p className="text-xs text-slate-500">English Grammar, IELTS PDF</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setCurrentPage('quiz')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-success hover:bg-success/5 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Brain size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary text-sm">
                            Luyện tập Quiz
                          </h4>
                          <p className="text-xs text-slate-500">Nhận điểm XP tăng tốc</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setCurrentPage('night')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-800 hover:bg-slate-900 hover:text-white transition-all text-left group relative overflow-hidden active:scale-98"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                          <Moon size={20} />
                        </div>
                        <div className="relative z-10">
                          <h4 className="font-semibold text-sm group-hover:text-white">
                            Chế độ đêm trước thi
                          </h4>
                          <p className="text-xs text-slate-500 group-hover:text-slate-300">
                            Ôn tập nhanh với Flashcards
                          </p>
                        </div>
                        <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger text-white">
                          GẤP
                        </span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Payment Gateway Mock */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-br from-rose-500 via-pink-500 to-primary rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <CreditCard size={20} /> Nâng cấp Học viên
                        </h3>
                        <p className="text-xs text-rose-100 mt-1">
                          Mở khóa 100% học liệu & AI Mentor / Giáo viên
                        </p>
                      </div>
                      <span className="bg-amber-400 text-rose-950 text-[10px] font-bold px-2 py-1 rounded">
                        {isPremium ? 'PREMIUM' : isPro ? 'PRO' : 'FREE'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-6 relative z-10 text-xs">
                      <div className="flex items-center gap-2 text-rose-100">
                        <CheckCircle2 size={14} className={isPremium ? "text-emerald-300" : "text-rose-300 opacity-60"} /> 
                        <span className={isPremium ? "" : "line-through opacity-70"}>Không giới hạn hỏi đáp AI Mentor</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-100">
                        <CheckCircle2 size={14} className="text-emerald-300" /> Tải đầy đủ tài liệu ôn thi
                      </div>
                      <div className="flex items-center gap-2 text-rose-100">
                        <CheckCircle2 size={14} className={isPremium ? "text-emerald-300" : "text-rose-300 opacity-60"} /> 
                        <span className={isPremium ? "" : "line-through opacity-70"}>Chat 1-1 hỗ trợ trực tiếp với Mentor</span>
                      </div>
                    </div>
                    {isPremium ? (
                      <div className="w-full text-center py-2.5 rounded-xl bg-white/20 border border-white/30 text-white font-bold text-sm">
                        Đã là thành viên PREMIUM 💎
                      </div>
                    ) : isPro ? (
                      <div className="space-y-2">
                        <div className="w-full text-center py-2 bg-white/20 border border-white/30 text-white font-bold text-xs rounded-xl">
                          Đã là thành viên PRO (99k) ⭐️
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPlan('PREMIUM')
                            setCurrentPage('pricing')
                          }}
                          className="w-full bg-white text-primary font-bold py-2 rounded-xl hover:bg-rose-50 active:scale-95 transition-all text-xs shadow"
                        >
                          Nâng cấp Premium chat Mentor & AI (399k)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCurrentPage('pricing')}
                        className="w-full bg-white text-primary font-bold py-2.5 rounded-xl hover:bg-rose-50 active:scale-95 transition-all relative z-10 shadow-md text-sm"
                      >
                        Nâng cấp ngay - chỉ từ 99k
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interactive Quiz Page */}
          {currentPage === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setQuizStarted(false)
                    setCurrentPage('dashboard')
                  }}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Luyện Tập Quiz Tiếng Anh</h1>
                  <p className="text-sm text-slate-500">Kiểm tra và tích lũy XP củng cố kiến thức ngữ pháp.</p>
                </div>
              </div>

              {!quizStarted && !quizCompleted ? (
                <div className="bg-white rounded-3xl p-8 border border-rose-100/50 shadow-sm max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Brain size={44} className="animate-bounce" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Chọn Chế Độ Luyện Tập</h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                    Kiểm tra và nâng cao trình độ tiếng Anh thông qua hình thức Trắc nghiệm củng cố hoặc Viết bài luận Essay tự luận.
                  </p>
                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 max-w-sm mx-auto text-left text-xs space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" /> Trắc nghiệm: 30 câu hỏi đa dạng chủ đề ngữ pháp
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" /> Tự luận: Luyện viết Essay theo chủ đề IELTS
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" /> Tự động lưu tiến trình và cảnh báo đóng tab
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setQuizStarted(true)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow"
                    >
                      Bắt đầu làm Trắc nghiệm
                    </button>
                    <button
                      onClick={() => setCurrentPage('essay')}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow"
                    >
                      Luyện viết Essay tự luận
                    </button>
                  </div>
                </div>
              ) : quizCompleted ? (
                <div className="bg-white rounded-3xl p-8 border border-rose-100/50 shadow-sm max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Award size={44} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Hoàn Thành Thử Thách!</h2>
                    <p className="text-sm text-slate-500 mt-1">Bạn đã hoàn thành xuất sắc bài quiz ôn tập.</p>
                  </div>

                  <div className="bg-slate-50 py-6 px-8 rounded-3xl border border-slate-100 max-w-sm mx-auto grid grid-cols-2 gap-4">
                    <div className="text-center border-r border-slate-200">
                      <div className="text-3xl font-extrabold text-primary">{quizScore} / {QUIZ_QUESTIONS.length}</div>
                      <div className="text-xs text-slate-400 font-semibold mt-1">Câu trả lời đúng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-success">
                        +{quizScore * 20 + (quizScore === QUIZ_QUESTIONS.length ? 15 : 0)} XP
                      </div>
                      <div className="text-xs text-slate-400 font-semibold mt-1">Điểm tích lũy nhận</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleRestartQuiz}
                      className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 active:scale-95 transition-all"
                    >
                      Làm lại quiz
                    </button>
                    <button
                      onClick={() => {
                        setQuizCompleted(false)
                        setQuizStarted(false)
                        setCurrentPage('dashboard')
                      }}
                      className="btn-primary text-sm"
                    >
                      Trở về trang chủ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Active Question */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span>CÂU HỎI {currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
                      <span className="text-primary">{Math.round(((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100)}% HOÀN THÀNH</span>
                    </div>

                    {/* Progress Fill */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      ></div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 leading-relaxed">
                      {QUIZ_QUESTIONS[currentQuestion].question}
                    </h3>

                    <div className="space-y-3">
                      {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => {
                        let btnStyle = "border-slate-200 hover:border-primary/40 hover:bg-rose-50/20"
                        let checkIcon = null

                        if (selectedAnswer === index) {
                          btnStyle = "border-primary bg-primary/5 text-primary font-semibold"
                        }

                        if (answerSubmitted) {
                          const isCorrectChoice = index === QUIZ_QUESTIONS[currentQuestion].answer
                          const isSelectedChoice = index === selectedAnswer

                          if (isCorrectChoice) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                            checkIcon = <CheckCircle2 size={18} className="text-emerald-500" />
                          } else if (isSelectedChoice) {
                            btnStyle = "border-rose-500 bg-rose-50 text-rose-800"
                            checkIcon = <X size={18} className="text-rose-500" />
                          } else {
                            btnStyle = "border-slate-100 text-slate-400 opacity-60"
                          }
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleSelectAnswer(index)}
                            disabled={answerSubmitted}
                            className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between active:scale-99 ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {checkIcon}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      {!answerSubmitted ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                          className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all active:scale-95"
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1 active:scale-95"
                        >
                          {currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Hoàn thành' : 'Tiếp tục'} <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right panel: Explanation feedback */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-4 relative overflow-hidden">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle size={18} className="text-primary" /> Phân tích học tập
                    </h3>
                    <div className="divider"></div>
                    
                    {!isPremium ? (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                          <Lock size={20} />
                        </div>
                        <h4 className="font-bold text-xs text-slate-800">Giải thích AI bị khóa</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Nâng cấp gói Premium (399k) để mở khóa phân tích chi tiết đáp án và mẹo làm bài của AI Mentor.
                        </p>
                        <button
                          onClick={() => setCurrentPage('pricing')}
                          className="px-4 py-2 bg-primary text-white font-bold text-[10px] rounded-xl active:scale-95 transition-all shadow"
                        >
                          Nâng cấp Premium
                        </button>
                      </div>
                    ) : answerSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {selectedAnswer === QUIZ_QUESTIONS[currentQuestion].answer ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 text-xs px-2.5 py-1 rounded-lg">Chính xác! 🎉</span>
                          ) : (
                            <span className="text-rose-600 font-bold bg-rose-50 text-xs px-2.5 py-1 rounded-lg">Chưa chính xác 😢</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-1 text-xs">Giải thích chi tiết:</h4>
                          <p className="text-slate-500 leading-relaxed text-[11px]">
                            {QUIZ_QUESTIONS[currentQuestion].explanation}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-slate-400 text-xs text-center py-10 leading-relaxed">
                        Hãy chọn phương án bạn cho là đúng và bấm "Kiểm tra đáp án" để xem phân tích chi tiết từ AI Mentor.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Documents & AI Chatbot Page */}
          {currentPage === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Học Liệu & Trợ Lý AI</h1>
                  <p className="text-sm text-slate-500">Mở và tải các tài liệu kiến thức tiếng anh cùng sự giải đáp trực tiếp từ AI.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Documents List (col-span-3) */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-rose-100/50 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Danh sách tài liệu</h3>
                  <div className="space-y-2">
                    {mockDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${selectedDocId === doc.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                      >
                        <span className="font-bold truncate">{doc.title}</span>
                        <span className="text-[10px] text-slate-400">{doc.pages} trang • {doc.size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PDF Viewer Mockup (col-span-5) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-sm">Trình xem tài liệu</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (!isPro && !isPremium) setCurrentPage('pricing')
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title="Tải xuống PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 min-h-[350px] flex flex-col justify-between relative overflow-hidden font-sans">
                    <div>
                      <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                        Trang 1 / {mockDocuments.find(d => d.id === selectedDocId)?.pages}
                      </div>

                      {/* Display content depending on selected doc */}
                      {selectedDocId === 1 && (
                        <div className="space-y-3 text-xs text-slate-700">
                          <h4 className="font-bold text-sm text-slate-900">Chuyên đề 1: Thì Hiện tại đơn (Present Simple)</h4>
                          <p><strong>1. Khái niệm:</strong> Dùng để diễn tả một hành động lặp đi lặp lại thành một thói quen, một phong tục hoặc một sự thật hiển nhiên ở hiện tại.</p>
                          <p><strong>2. Cấu trúc:</strong></p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Khẳng định: S + V(s/es)</li>
                            <li>Phủ định: S + do/does + not + V-inf</li>
                            <li>Nghi vấn: Do/Does + S + V-inf?</li>
                          </ul>
                          <p><strong>3. Từ nhận biết:</strong> always, usually, often, sometimes, everyday...</p>
                        </div>
                      )}
                      
                      {selectedDocId === 2 && (
                        <div className="space-y-3 text-xs text-slate-700">
                          <h4 className="font-bold text-sm text-slate-900">IELTS Speaking Part 2 - Chiến thuật đột phá</h4>
                          <p><strong>1. Tổng quan:</strong> Thí sinh nhận một gợi ý (Cue Card) và có 1 phút chuẩn bị, sau đó nói liên tục trong vòng 1-2 phút.</p>
                          <p><strong>2. Cấu trúc bài nói chuẩn (PPF):</strong></p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Present (Hiện tại): Mô tả thực trạng, bối cảnh chính của chủ đề.</li>
                            <li>Past (Quá khứ): Kể lại một kỷ niệm hoặc một câu chuyện liên quan.</li>
                            <li>Future (Tương lai): Dự định hoặc mong muốn của bạn về chủ đề này.</li>
                          </ul>
                        </div>
                      )}

                      {selectedDocId === 3 && (
                        <div className="space-y-3 text-xs text-slate-700">
                          <h4 className="font-bold text-sm text-slate-900">150 Phrasal Verbs Thông Dụng (Trích)</h4>
                          <div className="space-y-2">
                            <div><strong>1. Look up:</strong> tra cứu (từ điển, thông tin). <br/><em>Ví dụ:</em> Look up the new words in the dictionary.</div>
                            <div><strong>2. Look after:</strong> chăm sóc, nuôi nẵng. <br/><em>Ví dụ:</em> She looks after her grandmother carefully.</div>
                            <div><strong>3. Give up:</strong> từ bỏ. <br/><em>Ví dụ:</em> Never give up your English dreams.</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pro blur blocker */}
                    {!isPro && !isPremium ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent pt-24 pb-6 text-center space-y-3 z-10 px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-rose-100">
                          <Lock size={12} /> Khóa nội dung tài liệu
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Các trang 2 đến {mockDocuments.find(d => d.id === selectedDocId)?.pages} đã bị ẩn đi. Nâng cấp tài khoản để mở khóa toàn bộ học liệu.
                        </p>
                        <button
                          onClick={() => setCurrentPage('pricing')}
                          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          Mở khóa tài liệu (chỉ từ 99k)
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Đã kích hoạt gói {isPremium ? 'PREMIUM 💎' : 'PRO ⭐️'} - Đã mở khóa 100% tài liệu
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Chatbot Mentor (col-span-4) */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm flex flex-col h-[480px] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Sparkles size={16} className="text-primary animate-pulse" /> AI Mentor Tiếng Anh
                    </h3>
                  </div>

                  {/* Lock overlay if not Premium */}
                  {!isPremium && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Lock size={20} />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800">Khóa tính năng AI Mentor</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
                        Hỏi đáp và giải nghĩa bài học 24/7 trực tiếp cùng trợ lý AI Mentor chỉ có ở gói Premium (399k).
                      </p>
                      <button
                        onClick={() => setCurrentPage('pricing')}
                        className="px-4 py-2 bg-primary text-white font-bold text-[10px] rounded-xl active:scale-95 transition-all shadow"
                      >
                        Nâng cấp Premium (399k)
                      </button>
                    </div>
                  )}

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'}`}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs border border-slate-200/50 flex items-center gap-1.5">
                          <RefreshCw size={12} className="animate-spin" /> AI đang suy nghĩ...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions bubbles */}
                  <div className="py-2 flex flex-wrap gap-1 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => handleSendChat("Since và For dùng như thế nào?")}
                      className="text-[10px] bg-slate-50 hover:bg-rose-50 hover:text-primary text-slate-500 px-2 py-1 rounded-lg border border-slate-100 transition-colors"
                    >
                      💡 Dùng Since & For?
                    </button>
                    <button
                      onClick={() => handleSendChat("Giải thích cấu trúc Quá khứ hoàn thành?")}
                      className="text-[10px] bg-slate-50 hover:bg-rose-50 hover:text-primary text-slate-500 px-2 py-1 rounded-lg border border-slate-100 transition-colors"
                    >
                      💡 Quá khứ hoàn thành?
                    </button>
                    <button
                      onClick={() => handleSendChat("Ví dụ về câu điều kiện loại 3?")}
                      className="text-[10px] bg-slate-50 hover:bg-rose-50 hover:text-primary text-slate-500 px-2 py-1 rounded-lg border border-slate-100 transition-colors"
                    >
                      💡 Điểu kiện loại 3?
                    </button>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendChat()
                    }}
                    className="flex gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Hỏi AI cấu trúc ngữ pháp..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-light"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors active:scale-95"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* Night Mode Page */}
          {currentPage === 'night' && (
            <motion.div
              key="night"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pb-20 p-6 md:p-8 rounded-3xl min-h-[500px]"
              style={{
                background: "linear-gradient(135deg, #090d16 0%, #0e1628 50%, #15102a 100%)",
                color: "#e2e8f0"
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">Chế Độ Đêm Trước Thi</h1>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">CẤP TỐC</span>
                  </div>
                  <p className="text-sm text-slate-400">Ôn tập tập trung 100% bằng Flashcard, củng cố cấu trúc tiếng anh nhanh.</p>
                </div>
              </div>

              {/* Flashcard Component */}
              <div className="max-w-md mx-auto space-y-6 pt-6">
                
                {/* Flippable card */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-64 bg-slate-900 border border-slate-700/60 rounded-3xl relative cursor-pointer overflow-hidden shadow-2xl transition-all duration-500 preserve-3d"
                  style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: '0 10px 30px -5px rgba(225, 29, 72, 0.15)'
                  }}
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 flex flex-col justify-between p-6 backface-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      display: isFlipped ? 'none' : 'flex'
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <span>CHỦ ĐỀ NGỮ PHÁP</span>
                      <span>THẺ {currentFlashcard + 1} / 5</span>
                    </div>
                    <div className="text-center my-auto space-y-2">
                      <h2 className="text-2xl font-extrabold text-white">{FLASHCARDS[currentFlashcard].title}</h2>
                      <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mt-1">Bấm để lật xem cấu trúc</p>
                    </div>
                    <div className="text-center text-[10px] text-slate-600 font-medium">
                      Nhấp chuột để xem giải nghĩa ở mặt sau
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 flex flex-col justify-between p-6 bg-slate-900"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      display: isFlipped ? 'flex' : 'none'
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                      <span>ĐÁP ÁN & CÔNG THỨC</span>
                      <span>THẺ {currentFlashcard + 1} / 5</span>
                    </div>
                    
                    <div className="text-center my-auto space-y-4 px-2">
                      <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 text-emerald-300 font-mono text-sm break-all font-semibold">
                        {FLASHCARDS[currentFlashcard].formula}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {FLASHCARDS[currentFlashcard].usage}
                      </p>
                    </div>
                    
                    <div className="text-center text-[10px] text-slate-500 font-medium">
                      Nhấp chuột để xem lại mặt trước
                    </div>
                  </div>
                </div>

                {/* Progress dot */}
                <div className="flex justify-center gap-1.5">
                  {FLASHCARDS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${currentFlashcard === i ? 'w-6 bg-rose-500' : 'w-1.5 bg-slate-700'}`}
                    ></div>
                  ))}
                </div>

                {/* Navigation controls */}
                <div className="flex justify-between items-center px-4">
                  <button
                    disabled={currentFlashcard === 0}
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentFlashcard(prev => prev - 1)
                    }}
                    className="px-4 py-2 border border-slate-700 bg-slate-800/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 active:scale-95"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Lật thẻ
                  </button>
                  <button
                    disabled={currentFlashcard === FLASHCARDS.length - 1}
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentFlashcard(prev => prev + 1)
                    }}
                    className="px-4 py-2 border border-slate-700 bg-slate-800/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 active:scale-95"
                  >
                    Thẻ tiếp theo
                  </button>
                </div>
              </div>

              {/* Night study guidelines */}
              <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 mt-8 text-xs text-slate-400 space-y-2">
                <h4 className="font-bold text-white text-center">💡 Lời khuyên ôn thi đêm muộn</h4>
                <p>• Tránh học dồn dập nhiều tiếng liên tục. Hãy áp dụng quy tắc Pomodoro (Học 25 phút, nghỉ 5 phút).</p>
                <p>• Uống đủ nước ấm, tránh lạm dụng cà phê quá muộn để giữ đầu óc tỉnh táo sáng mai khi làm bài.</p>
              </div>
            </motion.div>
          )}

          {/* Pricing & Upgrades Page */}
          {currentPage === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Bảng Giá Dịch Vụ</h1>
                  <p className="text-sm text-slate-500">Nâng cấp tài khoản để tối đa hóa khả năng đạt kết quả cao.</p>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
                
                {/* Free Plan */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Gói Thành Viên Free</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Cơ bản cho người mới học trải nghiệm.</p>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">
                      0 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                    </div>
                    <div className="divider"></div>
                    <ul className="space-y-2.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Làm Quiz ôn tập (3 bài/ngày)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Xem <strong>1 tập thử</strong> Podcast & Video
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Truy cập tài liệu cơ bản
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <X size={14} className="text-slate-350" /> Toàn bộ kho Podcast & Video
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <X size={14} className="text-slate-350" /> Trợ lý AI Mentor & Chat Mentor 1-1
                      </li>
                    </ul>
                  </div>
                  <button
                    disabled
                    className="w-full bg-slate-100 text-slate-400 font-bold py-2.5 rounded-xl text-xs"
                  >
                    {!isPro && !isPremium ? "Gói đang sử dụng" : "Gói cơ bản"}
                  </button>
                </div>

                {/* Pro Plan (99k) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-primary/40 transition-colors shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1">
                        Pro ⭐️
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Mở khóa đầy đủ kho tài liệu học tập.</p>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">
                      99,000 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                    </div>
                    <div className="divider"></div>
                    <ul className="space-y-2.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> <strong>Không giới hạn</strong> làm Quiz
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Mở khóa 100% tài liệu ôn tập
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> <strong>Toàn bộ kho Podcast</strong> bài giảng
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> <strong>Toàn bộ kho Video</strong> hoạt hình
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <X size={14} className="text-slate-350" /> Trợ lý AI Mentor & Chat Mentor 1-1
                      </li>
                    </ul>
                  </div>

                  {isPro && !isPremium ? (
                    <div className="w-full text-center py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs rounded-xl">
                      Đang hoạt động (PRO) ⭐️
                    </div>
                  ) : isPremium ? (
                    <div className="w-full text-center py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl">
                      Đã mở khóa từ gói Premium
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan('PRO')
                        setPaymentTimer(120)
                        setShowPaymentQR(true)
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/20 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
                    >
                      Nâng cấp Pro (99k)
                    </button>
                  )}
                </div>

                {/* Premium Plan (399k) */}
                <div className="bg-white rounded-3xl p-6 border-2 border-primary shadow-lg shadow-rose-100 flex flex-col justify-between space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-xl">
                    Mentor & AI
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                        Premium 💎
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Học kèm Mentor 1-1, trợ lý AI & Đầy đủ đa phương tiện.</p>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-800">
                      399,000 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                    </div>
                    <div className="divider"></div>
                    <ul className="space-y-2.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Bao gồm toàn bộ tính năng gói Pro
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> <strong>Trợ lý AI Mentor phân tích & hỏi đáp 24/7</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> <strong>Chat 1-1 hỗ trợ trực tiếp với Mentor</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Mở khóa kho Podcast & Video bài giảng
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Sửa bài viết (Writing) & nói (Speaking)
                      </li>
                    </ul>
                  </div>

                  {isPremium ? (
                    <div className="w-full text-center py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs rounded-xl">
                      Đang hoạt động (PREMIUM) 💎
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan('PREMIUM')
                        setPaymentTimer(120)
                        setShowPaymentQR(true)
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/20 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
                    >
                      Nâng cấp Premium (399k)
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* Planner / Study Targets Checklist Page */}
          {currentPage === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Kế Hoạch & Mục Tiêu</h1>
                  <p className="text-sm text-slate-500">Lên kế hoạch các chủ đề cần ôn tập và theo dõi tiến trình của bạn.</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-6">
                
                {/* Progress tracker */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>TIẾN ĐỘ HOÀN THÀNH MỤC TIÊU</span>
                    <span className="text-primary">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hoàn thành mục tiêu giúp bạn củng cố kiến thức tiếng anh vững vàng hơn trước kỳ thi.
                  </p>
                </div>

                <div className="divider"></div>

                {/* Add new task */}
                <form onSubmit={handleAddPlannerTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Thêm mục tiêu ôn tập mới... (ví dụ: Học 5 từ vựng IELTS)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-light"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-1 transition-colors active:scale-95"
                  >
                    <Plus size={16} /> Thêm
                  </button>
                </form>

                {/* Tasks checklist */}
                <div className="space-y-2.5">
                  {plannerTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Chưa có mục tiêu học tập nào được đặt ra. Hãy thêm mục tiêu ở ô bên trên!
                    </div>
                  ) : (
                    plannerTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${task.checked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-rose-100'}`}
                      >
                        <div 
                          onClick={() => handleTogglePlannerTask(task.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                        >
                          {task.checked ? (
                            <CheckCircle2 className="text-success flex-shrink-0" size={20} />
                          ) : (
                            <Circle className="text-slate-300 flex-shrink-0" size={20} />
                          )}
                          <span className={`text-sm ${task.checked ? 'line-through text-slate-500' : 'text-slate-700 font-medium'}`}>
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePlannerTask(task.id)}
                          className="text-slate-400 hover:text-danger p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* Gamification / Leaderboard Page */}
          {currentPage === 'gamification' && (
            <motion.div
              key="gamification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Bảng Xếp Hạng Gamification</h1>
                  <p className="text-sm text-slate-500">Cạnh tranh lành mạnh cùng bạn bè và nhận các huy hiệu danh giá.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
                
                {/* Leaderboard Card (col-span-2) */}
                <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Award size={18} className="text-primary" /> Xếp hạng tuần này
                  </h3>
                  
                  <div className="space-y-2">
                    {leaderboard.map((user, index) => {
                      const isMe = user.name === (currentUser?.name || 'Bạn')
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isMe ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-white border-slate-100'}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-6 text-center font-black text-sm ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`}>
                              #{index + 1}
                            </span>
                            
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                alt="Avatar"
                                className="w-full h-full"
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-slate-800'}`}>{user.name}</span>
                                {user.role === 'PRO' && (
                                  <span className="text-[8px] bg-amber-450 text-rose-950 font-extrabold px-1.5 py-0.5 rounded uppercase">PRO ⭐️</span>
                                )}
                                {user.role === 'PREMIUM' && (
                                  <span className="text-[8px] bg-amber-400 text-rose-950 font-extrabold px-1.5 py-0.5 rounded uppercase">PREMIUM 💎</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Flame size={12} className="text-orange-500" /> Chuỗi {user.streak} ngày liên tục
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-800">{user.xp}</span>
                            <span className="text-[10px] text-slate-400 block font-bold">XP</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Achievements Card (col-span-1) */}
                <div className="bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Huy hiệu đạt được</h3>
                  <div className="divider"></div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-2xl text-center space-y-1">
                      <span className="text-2xl">🔥</span>
                      <h4 className="font-bold text-slate-800 text-[10px] truncate">Hành trình 8 ngày</h4>
                      <p className="text-[8px] text-slate-400">Duy trì streak liên tiếp</p>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-2xl text-center space-y-1">
                      <span className="text-2xl">🏆</span>
                      <h4 className="font-bold text-slate-800 text-[10px] truncate">Siêu Trí Tuệ</h4>
                      <p className="text-[8px] text-slate-400">Làm đúng 100% quiz</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center space-y-1 opacity-50 relative group">
                      <span className="text-2xl">👑</span>
                      <h4 className="font-bold text-slate-800 text-[10px] truncate">Chúa Tể Học Thuật</h4>
                      <p className="text-[8px] text-slate-400">Tích lũy 3000 XP</p>
                      <Lock size={12} className="absolute top-2 right-2 text-slate-400" />
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center space-y-1 opacity-50 relative group">
                      <span className="text-2xl">⚡</span>
                      <h4 className="font-bold text-slate-800 text-[10px] truncate">Chuyên Gia Đêm Khuya</h4>
                      <p className="text-[8px] text-slate-400">Học sau 12h đêm</p>
                      <Lock size={12} className="absolute top-2 right-2 text-slate-400" />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* General fallback view for remaining pages (Knowledge map, readiness score, progress details, podcast, video, community, mentor support) */}
          {['knowledge', 'readiness', 'progress', 'community', 'podcast', 'video', 'mentor'].includes(currentPage) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {currentPage === 'knowledge' && 'Bản Đồ Kiến Thức'}
                    {currentPage === 'readiness' && 'Độ Sẵn Sàng Thi'}
                    {currentPage === 'progress' && 'Tiến Độ Học Tập'}
                    {currentPage === 'community' && 'Cộng Đồng Trao Đổi'}
                    {currentPage === 'podcast' && 'Podcast Bài Giảng'}
                    {currentPage === 'video' && 'Video Tóm Tắt'}
                    {currentPage === 'mentor' && 'Hỗ Trợ Mentor 1-1'}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {currentPage === 'knowledge' && 'Sơ đồ tư duy trực quan về các chủ đề ngữ pháp tiếng Anh.'}
                    {currentPage === 'readiness' && 'Phân tích chi tiết mức độ sẵn sàng cho kỳ thi của bạn.'}
                    {currentPage === 'progress' && 'Báo cáo thống kê thời gian học và tỷ lệ làm đúng quiz.'}
                    {currentPage === 'community' && 'Diễn đàn chia sẻ bí quyết học và đặt câu hỏi cho bạn bè, thầy cô.'}
                    {currentPage === 'podcast' && 'Luyện nghe tiếng Anh thụ động và học cấu trúc qua âm thanh.'}
                    {currentPage === 'video' && 'Tổng hợp các bài giảng tóm tắt kiến thức tiếng anh dạng hoạt hình ngắn.'}
                    {currentPage === 'mentor' && 'Kết nối trực tiếp và đặt câu hỏi cho các mentor nhiều kinh nghiệm.'}
                  </p>
                </div>
              </div>

              {/* Specific custom content mock for each */}
              <div className={`${currentPage === 'knowledge' ? 'max-w-6xl' : 'max-w-4xl'} bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm mx-auto transition-all duration-300`}>
                
                {currentPage === 'knowledge' && (() => {
                  const activeNode = KNOWLEDGE_NODES.find(n => n.id === activeMapNode) || KNOWLEDGE_NODES[0];
                  // Group nodes by module
                  const modules = {};
                  KNOWLEDGE_NODES.forEach(node => {
                    if (!modules[node.module]) {
                      modules[node.module] = [];
                    }
                    modules[node.module].push(node);
                  });

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Knowledge Map Node Tree */}
                      <div className="lg:col-span-7 space-y-8">
                        <div className="flex justify-between items-center pb-2 border-b border-rose-100/50">
                          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                            <Target className="text-primary" size={20} />
                            Lộ Trình Học Tập Bản Thân
                          </h3>
                          <span className="text-xs font-semibold text-primary bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100/30">
                            6 chủ đề cốt lõi
                          </span>
                        </div>

                        <div className="relative pl-4 space-y-10 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-rose-100">
                          {Object.entries(modules).map(([moduleName, nodes], modIdx) => {
                            // Find icon for module
                            let moduleIcon = <BookOpen size={16} />;
                            if (moduleName.includes("Mệnh Đề")) moduleIcon = <Sparkles size={16} />;
                            if (moduleName.includes("Từ Vựng")) moduleIcon = <Award size={16} />;
                            if (moduleName.includes("Phát Âm")) moduleIcon = <Volume2 size={16} />;

                            return (
                              <div key={moduleName} className="relative space-y-4">
                                {/* Module Marker Circle */}
                                <div className="absolute -left-[21px] top-1.5 w-6 h-6 rounded-full bg-rose-100 border-4 border-white flex items-center justify-center text-primary shadow-sm z-10">
                                  {moduleIcon}
                                </div>
                                <div className="pl-4">
                                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">{moduleName}</h4>
                                  
                                  <div className="grid grid-cols-1 gap-3">
                                    {nodes.map((node) => {
                                      const isActive = activeMapNode === node.id;
                                      const isLocked = node.premium && !isPremium;
                                      
                                      return (
                                        <div
                                          key={node.id}
                                          onClick={() => setActiveMapNode(node.id)}
                                          className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                                            isActive
                                              ? 'bg-rose-50/40 border-primary shadow-md shadow-primary/5 -translate-y-0.5'
                                              : 'bg-white border-slate-100 hover:border-rose-200 hover:bg-slate-50/30 hover:-translate-y-0.5 shadow-sm'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                              {/* Status Icon */}
                                              <div className="flex-shrink-0">
                                                {node.status === 'completed' && (
                                                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 size={16} />
                                                  </div>
                                                )}
                                                {node.status === 'in_progress' && (
                                                  <div className="relative w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                                                    <span className="absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-60"></span>
                                                    <Clock size={16} />
                                                  </div>
                                                )}
                                                {node.status === 'locked' && (
                                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <Lock size={14} />
                                                  </div>
                                                )}
                                              </div>

                                              <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                  <h5 className={`text-xs font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                                                    {node.title}
                                                  </h5>
                                                  {node.premium && (
                                                    <span className="flex-shrink-0 text-[8px] font-black tracking-widest text-amber-600 bg-amber-100 px-1 rounded uppercase">
                                                      PREMIUM
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{node.subtitle}</p>
                                              </div>
                                            </div>

                                            {/* Progress / Locked badge */}
                                            <div className="flex-shrink-0 text-right">
                                              {isLocked ? (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                                  <Lock size={10} />
                                                  <span>Khóa</span>
                                                </div>
                                              ) : (
                                                <div className="text-right">
                                                  <span className="text-[10px] font-bold text-slate-600">{node.percentage}%</span>
                                                  <div className="w-12 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                                                    <div className="bg-primary h-full rounded-full" style={{ width: `${node.percentage}%` }}></div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Review & Study Detail Panel */}
                      <div className="lg:col-span-5 relative bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-5 min-h-[450px]">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold tracking-wider text-primary uppercase bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                            {activeNode.module}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {activeNode.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium italic">{activeNode.subtitle}</p>
                        </div>

                        {/* Mastery level progress bar */}
                        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                            <span>Mức độ sẵn sàng</span>
                            <span className="text-primary font-mono">{activeNode.readiness}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full" style={{ width: `${activeNode.percentage}%` }}></div>
                          </div>
                        </div>

                        {/* Core Summary and Rules */}
                        <div className="space-y-2.5">
                          <h5 className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">Tóm tắt cốt lõi</h5>
                          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3">
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              {activeNode.summary}
                            </p>
                            <div className="pt-2 border-t border-slate-50 space-y-1.5">
                              {activeNode.rules.map((rule, rIdx) => (
                                <div key={rIdx} className="flex items-start gap-2 text-[10px] text-slate-600">
                                  <span className="text-primary flex-shrink-0 mt-0.5">•</span>
                                  <span className="font-mono leading-relaxed">{rule}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Practice checklist tasks */}
                        <div className="space-y-2.5">
                          <h5 className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">Nhiệm vụ luyện tập</h5>
                          <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
                            {activeNode.tasks.map((task, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between gap-3 text-[10px]">
                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                    task.done
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-500'
                                      : 'border-slate-300'
                                  }`}>
                                    {task.done && <Check size={10} strokeWidth={3} />}
                                  </div>
                                  <span className={task.done ? 'line-through text-slate-400' : ''}>{task.text}</span>
                                </div>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] ${
                                  task.done
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : 'text-slate-400 bg-slate-50'
                                }`}>
                                  {task.done ? 'Xong' : 'Chưa'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <button
                            onClick={() => {
                              if (activeNode.premium && !isPremium) {
                                setCurrentPage('pricing');
                              } else {
                                setCurrentPage('quiz');
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-primary hover:bg-primary-dark text-white font-bold text-[10px] rounded-xl transition-all active:scale-95 shadow shadow-primary/10"
                          >
                            <Play size={12} fill="white" />
                            <span>Luyện tập Quiz</span>
                          </button>
                          <button
                            onClick={() => {
                              if (activeNode.premium && !isPremium) {
                                setCurrentPage('pricing');
                              } else {
                                setCurrentPage('documents');
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm"
                          >
                            <Sparkles className="text-primary" size={12} />
                            <span>Hỏi AI Mentor</span>
                          </button>
                        </div>

                        {/* Premium lock overlay */}
                        {activeNode.premium && !isPremium && (
                          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 transition-all duration-300 border border-amber-500/20">
                            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                              <Lock size={24} />
                            </div>
                            
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-sm text-white tracking-wide">
                                Chủ Đề Premium
                              </h4>
                              <p className="text-[10px] text-slate-300 font-medium max-w-[200px] leading-relaxed">
                                Cần nâng cấp gói Premium (399k) để mở khóa lý thuyết nâng cao, AI Mentor 1-1 và ngân hàng đề thi chất lượng cao.
                              </p>
                            </div>

                            {/* Features list under lock */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 w-full text-left space-y-1.5 text-[9px] text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-500">✔</span>
                                <span>AI Mentor phân tích đáp án chi tiết</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-500">✔</span>
                                <span>Luyện nghe Podcast giáo viên độc quyền</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-500">✔</span>
                                <span>Video hoạt hình tóm tắt bài học sinh động</span>
                              </div>
                            </div>

                            <button
                              onClick={() => setCurrentPage('pricing')}
                              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-[10px] rounded-xl active:scale-[0.98] transition-all shadow-md shadow-amber-500/10"
                            >
                              Nâng cấp gói Premium (399k)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {currentPage === 'readiness' && (
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 text-sm">Chỉ số năng lực hiện tại</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { skill: 'Ngữ pháp (Grammar)', percent: 80, color: 'bg-emerald-500', feedback: 'Nắm chắc các thì cơ bản và mệnh đề quan hệ.' },
                        { skill: 'Từ vựng (Vocabulary)', percent: 70, color: 'bg-blue-500', feedback: 'Cần trau dồi thêm các idioms thông dụng.' },
                        { skill: 'Kỹ năng Đọc (Reading)', percent: 75, color: 'bg-indigo-500', feedback: 'Tốc độ đọc khá ổn, cần cải thiện kỹ năng Skimming.' },
                        { skill: 'Kỹ năng Nghe (Listening)', percent: 60, color: 'bg-amber-500', feedback: 'Cần luyện nghe các chủ đề học thuật nhiều hơn.' }
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>{item.skill}</span>
                            <span className="text-primary">{item.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 italic mt-1">{item.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentPage === 'progress' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">Biểu đồ thời gian tự học trong tuần</h3>
                    <div className="flex justify-between items-end h-48 border-b border-slate-200 pb-2 pt-6 max-w-md mx-auto">
                      {[
                        { day: 'T2', hours: 1.5 },
                        { day: 'T3', hours: 2.0 },
                        { day: 'T4', hours: 0.5 },
                        { day: 'T5', hours: 3.2 },
                        { day: 'T6', hours: 1.2 },
                        { day: 'T7', hours: 2.5 },
                        { day: 'CN', hours: 4.0 }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-10">
                          <span className="text-[10px] text-slate-400 font-bold">{bar.hours}h</span>
                          <div 
                            className="w-4 bg-gradient-to-t from-primary to-primary-light rounded-t-sm transition-all hover:opacity-80" 
                            style={{ height: `${bar.hours * 30}px` }}
                          ></div>
                          <span className="text-[10px] font-bold text-slate-500">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentPage === 'community' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">Câu hỏi thảo luận nổi bật</h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: "Làm sao để phân biệt nhanh Gerund (V-ing) vs Infinitive (To V)?", user: "Trần Thị B", comments: 12 },
                        { title: "Xin các tips luyện phát âm đuôi -ed và -s/es không bị nhầm lẫn với ạ!", user: "Nguyễn Văn A", comments: 8 },
                        { title: "Bài tập viết lại câu dùng Mệnh đề quan hệ rút gọn làm thế nào?", user: "Lê Minh Tuấn", comments: 5 }
                      ].map((post, i) => (
                        <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-rose-100 transition-colors flex justify-between items-center cursor-pointer">
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 hover:text-primary transition-colors">{post.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">Đăng bởi <span className="font-semibold">{post.user}</span></p>
                          </div>
                          <span className="text-[10px] text-primary bg-rose-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                            <MessageSquare size={12} /> {post.comments} phản hồi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentPage === 'podcast' && (() => {
                  const PODCASTS = [
                    { id: 1, title: 'IELTS Listening Secrets - Tập 1', subtitle: 'Mentor Trần Thị Hương • 15 phút', free: true, progress: '04:12', total: '15:00' },
                    { id: 2, title: 'Bí quyết phát âm Tiếng Anh chuẩn - Tập 2', subtitle: 'Mentor Nguyễn Văn Hùng • 20 phút', free: false, progress: '00:00', total: '20:00' },
                    { id: 3, title: 'Phrasal Verbs thần thánh IELTS - Tập 3', subtitle: 'Mentor Trần Thị Hương • 18 phút', free: false, progress: '00:00', total: '18:00' },
                  ];
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-sm">Podcast Bài Giảng</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
                          {isPro || isPremium ? `${PODCASTS.length} tập • Đã mở khóa toàn bộ` : '1 tập miễn phí'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {PODCASTS.map((ep) => {
                          const isLocked = !ep.free && !isPro && !isPremium;
                          return (
                            <div key={ep.id} className={`relative rounded-2xl border transition-all overflow-hidden ${
                              isLocked ? 'border-slate-100 bg-slate-50/50' : 'border-rose-100/60 bg-white shadow-sm'
                            }`}>
                              {ep.free && (
                                <span className="absolute top-3 right-3 text-[8px] font-black tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase">Miễn phí</span>
                              )}
                              {isLocked && (
                                <span className="absolute top-3 right-3 text-[8px] font-black tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                                  <Lock size={8} /> Pro
                                </span>
                              )}
                              <div className="p-4 flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isLocked ? 'bg-slate-100 text-slate-300' : 'bg-primary/10 text-primary'
                                }`}>
                                  {isLocked ? <Lock size={20} /> : <Volume2 size={20} className={ep.free ? 'animate-pulse' : ''} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-xs font-bold truncate ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{ep.title}</h4>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{ep.subtitle}</p>
                                  {!isLocked && (
                                    <div className="mt-2 space-y-1">
                                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                        <div className="bg-primary h-full" style={{ width: ep.free ? '28%' : '0%' }}></div>
                                      </div>
                                      <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                                        <span>{ep.progress}</span><span>{ep.total}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {isLocked ? (
                                  <button
                                    onClick={() => setCurrentPage('pricing')}
                                    className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-[9px] rounded-lg active:scale-95 transition-all shadow-sm"
                                  >
                                    Mở khóa Pro
                                  </button>
                                ) : (
                                  <button className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors active:scale-90">
                                    <Play size={14} fill="white" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!isPro && !isPremium && (
                        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-700">Mở khóa toàn bộ {PODCASTS.length} tập Podcast</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Nâng cấp gói Pro (99k/tháng) để nghe không giới hạn</p>
                          </div>
                          <button
                            onClick={() => setCurrentPage('pricing')}
                            className="flex-shrink-0 px-4 py-2 bg-primary text-white font-bold text-[10px] rounded-xl active:scale-95 transition-all shadow"
                          >
                            Nâng cấp Pro
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {currentPage === 'video' && (() => {
                  const VIDEOS = [
                    { id: 1, title: 'Cách nhớ 1000 từ vựng trong 1 tháng', duration: '5:30', views: '1.2k', free: true, color: 'from-blue-400 to-indigo-500' },
                    { id: 2, title: 'Bẫy từ & bẫy cấu trúc đề THPT Quốc gia', duration: '8:15', views: '3.4k', free: false, color: 'from-rose-400 to-pink-500' },
                    { id: 3, title: 'Mệnh đề quan hệ qua 5 ví dụ thực tế', duration: '6:00', views: '2.1k', free: false, color: 'from-emerald-400 to-teal-500' },
                    { id: 4, title: 'Conditional Types 1-2-3 bằng sơ đồ tư duy', duration: '9:45', views: '4.7k', free: false, color: 'from-amber-400 to-orange-500' },
                  ];
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-sm">Video Bài Giảng Hoạt Hình</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
                          {isPro || isPremium ? `${VIDEOS.length} video • Đã mở khóa` : '1 video miễn phí'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {VIDEOS.map((vid) => {
                          const isLocked = !vid.free && !isPro && !isPremium;
                          return (
                            <div key={vid.id} className={`relative rounded-2xl border overflow-hidden transition-all group cursor-pointer ${
                              isLocked
                                ? 'border-slate-100 opacity-80 hover:opacity-100'
                                : 'border-rose-100/60 hover:shadow-md hover:-translate-y-0.5'
                            }`}>
                              {/* Thumbnail */}
                              <div className={`h-32 bg-gradient-to-br ${vid.color} flex items-center justify-center relative`}>
                                {isLocked ? (
                                  <div className="flex flex-col items-center gap-1.5">
                                    <Lock size={22} className="text-white/70" />
                                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Cần gói Pro</span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play size={18} className="text-white" fill="white" />
                                  </div>
                                )}
                                <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 text-white font-bold py-0.5 px-1.5 rounded">{vid.duration}</span>
                                {vid.free && (
                                  <span className="absolute top-2 left-2 text-[8px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-full uppercase">Miễn phí</span>
                                )}
                              </div>
                              {/* Info */}
                              <div className="p-3.5 bg-white space-y-1">
                                <h4 className={`text-xs font-bold line-clamp-1 ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{vid.title}</h4>
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] text-slate-400">{vid.views} lượt xem</p>
                                  {isLocked && (
                                    <button
                                      onClick={() => setCurrentPage('pricing')}
                                      className="text-[9px] font-bold text-primary hover:underline"
                                    >
                                      Mở khóa Pro →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!isPro && !isPremium && (
                        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-700">Mở khóa {VIDEOS.length - 1} video còn lại</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Nâng cấp gói Pro (99k/tháng) để xem không giới hạn</p>
                          </div>
                          <button
                            onClick={() => setCurrentPage('pricing')}
                            className="flex-shrink-0 px-4 py-2 bg-primary text-white font-bold text-[10px] rounded-xl active:scale-95 transition-all shadow"
                          >
                            Nâng cấp Pro
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {currentPage === 'mentor' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">Chat 1-1 Hỗ Trợ Trực Tiếp với Mentor</h3>
                      {isPremium ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">Premium đang hoạt động 💎</span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full flex items-center gap-1"><Lock size={9} /> Cần gói Premium</span>
                      )}
                    </div>

                    {/* Premium lock banner */}
                    {!isPremium && (
                      <div className="bg-slate-900 rounded-2xl p-5 flex items-center gap-4 border border-amber-500/20">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                          <Lock size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white">Tính năng dành riêng cho gói Premium</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Gói Premium (399k) cho phép bạn kết nối trực tiếp & chat 1-1 với Mentor chuyên gia tiếng Anh bất cứ lúc nào.</p>
                        </div>
                        <button
                          onClick={() => setCurrentPage('pricing')}
                          className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[10px] rounded-xl active:scale-95 transition-all"
                        >
                          Nâng cấp
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {[
                        { name: 'Mentor Trần Thị Hương', spec: 'IELTS Academic Band 8.5', exp: '5 năm kinh nghiệm', status: 'online', rating: '4.9', sessions: '312' },
                        { name: 'Mentor Nguyễn Văn Hùng', spec: 'TOEIC 990 & Giao tiếp doanh nghiệp', exp: '3 năm kinh nghiệm', status: 'busy', rating: '4.8', sessions: '214' },
                      ].map((mentor, i) => (
                        <div key={i} className={`p-4 border rounded-2xl transition-all flex items-center justify-between gap-4 ${
                          isPremium
                            ? 'border-rose-100/60 bg-white hover:border-primary/30 hover:shadow-sm'
                            : 'border-slate-100 bg-slate-50/50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isPremium ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {mentor.name.charAt(7)}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                mentor.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}></span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className={`text-xs font-bold ${isPremium ? 'text-slate-800' : 'text-slate-400'}`}>{mentor.name}</h4>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${mentor.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {mentor.status === 'online' ? 'Online' : 'Bận'}
                                </span>
                              </div>
                              <p className={`text-[10px] mt-0.5 ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>{mentor.spec} • {mentor.exp}</p>
                              <p className={`text-[9px] mt-0.5 ${isPremium ? 'text-slate-400' : 'text-slate-300'}`}>⭐ {mentor.rating} • {mentor.sessions} buổi</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (!isPremium) {
                                setCurrentPage('pricing');
                              } else {
                                alert(`Đã kết nối thành công! Bắt đầu chat 1-1 với ${mentor.name}.`);
                              }
                            }}
                            className={`flex-shrink-0 px-3 py-2 font-bold text-[10px] rounded-xl transition-all active:scale-95 ${
                              isPremium
                                ? 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isPremium ? 'Chat ngay' : 'Khóa'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* AI Mentor 24/7 panel */}
                    <div className={`relative rounded-2xl border p-5 space-y-3 overflow-hidden ${
                      isPremium ? 'border-primary/30 bg-rose-50/20' : 'border-slate-100 bg-slate-50/50'
                    }`}>
                      {!isPremium && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Lock size={14} />
                            <span>Cần gói Premium để sử dụng AI Mentor 24/7</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">AI Mentor Tiếng Anh 24/7</h4>
                          <p className="text-[10px] text-slate-500">Phân tích & hỏi đáp không giới hạn</p>
                        </div>
                        <span className="ml-auto text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">ONLINE</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">AI</div>
                          <div className="bg-slate-50 rounded-xl rounded-tl-none px-3 py-2 text-[10px] text-slate-600 leading-relaxed">
                            Xin chào! Tôi là AI Mentor của bạn. Hỏi tôi bất cứ điều gì về Ngữ pháp, Từ vựng hay Phát âm Tiếng Anh nhé!
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => isPremium && setCurrentPage('documents')}
                        className={`w-full py-2 font-bold text-[10px] rounded-xl transition-all ${
                          isPremium ? 'bg-primary text-white hover:bg-primary-dark active:scale-95' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isPremium ? 'Bắt đầu hỏi AI Mentor →' : 'Yêu cầu Premium'}
                      </button>
                    </div>
                  </div>
                )}

                {currentPage === 'essay' && (
                  <motion.div
                    key="essay"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentPage('quiz')
                        }}
                        className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-primary transition-all active:scale-90"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900">Luyện Viết Essay Tự Luận</h1>
                        <p className="text-sm text-slate-500">Viết bài luận ngắn và hệ thống sẽ tự động lưu nháp cho bạn.</p>
                      </div>
                    </div>

                    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-6">
                      <div className="bg-rose-50/40 border border-rose-100 p-5 rounded-2xl">
                        <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                          <Edit2 size={16} /> Đề bài Essay (IELTS Writing Task 2)
                        </h3>
                        <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                          "Some people think that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree with this opinion?"
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>BÀI VIẾT CỦA BẠN (Hệ thống tự động lưu nháp)</span>
                          <span className="text-primary font-mono">{essayText.trim().split(/\s+/).filter(Boolean).length} từ</span>
                        </div>
                        <textarea
                          value={essayText}
                          onChange={(e) => setEssayText(e.target.value)}
                          placeholder="Nhập nội dung bài luận của bạn tại đây (tối thiểu 150 từ)..."
                          className="w-full p-5 rounded-2xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-700 text-sm resize-none leading-relaxed transition-all"
                          style={{ height: '320px', minHeight: '200px' }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1.5 font-medium">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Đã lưu tự động
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setEssayText("");
                              localStorage.removeItem(`lexiora_essay_backup_${currentUser.email}`);
                              alert("Đã xóa bản nháp thành công.");
                            }}
                            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all"
                          >
                            Xóa nháp
                          </button>
                          <button
                            onClick={() => {
                              alert("Chúc mừng! Bài luận của bạn đã được nộp thành công và đang chờ Mentor chấm điểm.");
                              setEssayText("");
                              localStorage.removeItem(`lexiora_essay_backup_${currentUser.email}`);
                              setCurrentPage('dashboard');
                            }}
                            disabled={essayText.trim().length === 0}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            Nộp bài luận
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Restore Progress Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-100 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 text-base">Phát hiện bài làm chưa hoàn thành!</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Bạn có một bài làm {restoreType === 'quiz' ? 'Trắc nghiệm' : 'Essay tự luận'} lưu trữ trước đó. Bạn có muốn tiếp tục bài làm này không?
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => {
                  const userEmail = currentUser?.email;
                  if (restoreType === 'quiz') {
                    localStorage.removeItem(`lexiora_quiz_backup_${userEmail}`);
                  } else {
                    localStorage.removeItem(`lexiora_essay_backup_${userEmail}`);
                    setEssayText("");
                  }
                  setShowRestoreModal(false);
                }}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl active:scale-95 transition-all"
              >
                Làm bài mới
              </button>
              <button
                onClick={() => {
                  if (restoreType === 'quiz' && savedQuizProgress) {
                    setQuizStarted(savedQuizProgress.quizStarted);
                    setCurrentQuestion(savedQuizProgress.currentQuestion);
                    setSelectedAnswer(savedQuizProgress.selectedAnswer);
                    setQuizScore(savedQuizProgress.quizScore);
                    setAnswerSubmitted(savedQuizProgress.answerSubmitted);
                    setQuizCompleted(savedQuizProgress.quizCompleted);
                    _setCurrentPage('quiz');
                  } else if (restoreType === 'essay' && savedEssayProgress) {
                    setEssayText(savedEssayProgress);
                    _setCurrentPage('essay');
                  }
                  setShowRestoreModal(false);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dark text-white text-xs font-bold rounded-2xl active:scale-95 transition-all shadow-md"
              >
                Tiếp tục bài làm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocker Custom Fullscreen Overlay Modal */}
      {pendingPage && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-100 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 text-base">Bạn đang làm dở bài Quiz!</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Bạn có chắc chắn muốn chuyển hướng? Tiến trình bài làm hiện tại của bạn sẽ được tự động lưu lại.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setPendingPage(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl active:scale-95 transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => {
                  const targetPage = pendingPage;
                  setPendingPage(null);
                  _setCurrentPage(targetPage);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-2xl active:scale-95 transition-all shadow-md shadow-rose-500/10"
              >
                Rời đi & Lưu bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
