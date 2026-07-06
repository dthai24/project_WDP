import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WhatshotOutlinedIcon from "@mui/icons-material/WhatshotOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { isStudent } from "@/features/auth/utils/authUtils";

export function isAdminAccountsActive(pathname) {
  return pathname === "/admin/accounts" || /^\/admin\/accounts\/\d+/.test(pathname);
}

export function isAdminCategoriesActive(pathname) {
  return pathname === "/admin/categories" || pathname.startsWith("/admin/categories/");
}

export function isAdminLevelsActive(pathname) {
  return pathname === "/admin/levels" || pathname.startsWith("/admin/levels/");
}

export function isAdminNewsActive(pathname) {
  return pathname === "/admin/news" || pathname.startsWith("/admin/news/");
}

export function isStudentNewsActive(pathname) {
  return pathname === "/news" || /^\/news\/\d+/.test(pathname);
}

export function isMentorQuestionBankActive(pathname) {
  return (
    pathname === "/mentor/question-banks" ||
    pathname.startsWith("/mentor/question-banks/") ||
    /^\/mentor\/courses\/\d+\/questions/.test(pathname)
  );
}

export function isMentorCoursesActive(pathname) {
  if (isMentorQuestionBankActive(pathname)) return false;
  return pathname === "/mentor/courses" || pathname.startsWith("/mentor/courses/");
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
      id: "placement-test",
      label: "Xếp lớp đầu vào",
      to: "/placement-test",
      Icon: QuizOutlinedIcon,
      disabled: !student,
    },
    {
      id: 'news',
      label: 'Tin tức',
      to: '/news',
      Icon: NewspaperOutlinedIcon,
      disabled: !student,
      isActiveMatch: isStudentNewsActive,
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
      isActiveMatch: isMentorCoursesActive,
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

export function getAdminMenuItems() {
  return [
    {
      id: "admin-dashboard",
      label: "Tổng quan",
      to: "/admin/dashboard",
      Icon: DashboardOutlinedIcon,
      disabled: false,
      isActiveMatch: (pathname) => pathname === "/admin/dashboard",
    },
    {
      id: "admin-accounts",
      label: "Tài khoản",
      to: "/admin/accounts",
      Icon: ManageAccountsOutlinedIcon,
      disabled: false,
      isActiveMatch: isAdminAccountsActive,
    },
    {
      id: "admin-courses",
      label: "Khóa học",
      to: "/admin/courses",
      Icon: BookOutlinedIcon,
      disabled: false,
      isActiveMatch: (pathname) => pathname === "/admin/courses" || pathname.startsWith("/admin/courses/"),
    },
    {
      id: "admin-applications",
      label: "Ứng tuyển",
      to: "/admin/applications",
      Icon: AssignmentIndOutlinedIcon,
      disabled: false,
      isActiveMatch: (pathname) => pathname === "/admin/applications" || pathname.startsWith("/admin/applications/"),
    },
    {
      id: "admin-categories",
      label: "Danh mục",
      to: "/admin/categories",
      Icon: CategoryOutlinedIcon,
      disabled: false,
      isActiveMatch: isAdminCategoriesActive,
    },
    {
      id: "admin-levels",
      label: "Trình độ",
      to: "/admin/levels",
      Icon: LayersOutlinedIcon,
      disabled: false,
      isActiveMatch: isAdminLevelsActive,
    },
    {
      id: "admin-news",
      label: "Tin tức",
      to: "/admin/news",
      Icon: NewspaperOutlinedIcon,
      disabled: false,
      isActiveMatch: isAdminNewsActive,
    },
    {
      id: "admin-history",
      label: "Nhật ký chỉnh sửa",
      to: "/admin/history",
      Icon: HistoryOutlinedIcon,
      disabled: false,
      isActiveMatch: (pathname) => pathname === "/admin/history",
    },
  ];
}
