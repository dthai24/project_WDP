import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import { isStudent } from "@/features/auth/utils/authUtils";

export function isMentorQuestionBankActive(pathname) {
  return (
    pathname === "/mentor/question-banks" ||
    /^\/mentor\/courses\/\d+\/questions$/.test(pathname)
  );
}

export function getStudentMenuItems(user) {
  const student = isStudent(user);
  return [
    {
      id: "home",
      label: "Trang chủ",
      to: "/home",
      Icon: HomeOutlinedIcon,
      disabled: false,
      end: true,
    },
    {
      id: "courses",
      label: "Khóa học",
      to: "/courses",
      Icon: MenuBookOutlinedIcon,
      disabled: !student,
    },
    {
      id: "paths",
      label: "Lộ trình",
      Icon: RouteOutlinedIcon,
      disabled: true,
    },
    {
      id: "news",
      label: "Tin tức",
      Icon: NewspaperOutlinedIcon,
      disabled: true,
    },
  ];
}

export function getMentorMenuItems() {
  return [
    {
      id: "mentor-courses",
      label: "Khóa học của tôi",
      to: "/mentor/courses",
      Icon: MenuBookRoundedIcon,
      disabled: false,
    },
    {
      id: "mentor-question-banks",
      label: "Ngân hàng câu hỏi",
      to: "/mentor/question-banks",
      Icon: QuizOutlinedIcon,
      disabled: false,
      isActiveMatch: isMentorQuestionBankActive,
    },
    {
      id: "mentor-news",
      label: "Tin tức",
      to: "/mentor/news",
      Icon: ArticleRoundedIcon,
      disabled: false,
    },
    {
      id: "mentor-student-progress",
      label: "Tiến độ học viên",
      to: "/mentor/student-progress",
      Icon: InsightsRoundedIcon,
      disabled: false,
    },
  ];
}
