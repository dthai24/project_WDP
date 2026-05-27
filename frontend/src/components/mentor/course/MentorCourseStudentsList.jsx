import { Box, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import EmptyState from '../../common/EmptyState';
import Loading from '../../common/Loading';
import MentorCourseStudentRow from './MentorCourseStudentRow';
import { MUTED } from './mentorCourseCreateStyles';
import {
  STUDENT_TABLE_GRID_COLUMNS,
  STUDENT_TABLE_HEADERS,
} from '../../../utils/mentorCourseStudentsUtils';

const TABLE_ROW_SX = {
  display: { xs: 'none', md: 'grid' },
  gridTemplateColumns: STUDENT_TABLE_GRID_COLUMNS,
  gap: 2,
  px: 2.25,
  alignItems: 'center',
};

function ListHeader() {
  return (
    <Box
      sx={{
        ...TABLE_ROW_SX,
        py: 1.25,
        bgcolor: 'rgba(15,23,42,0.02)',
        borderBottom: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      {STUDENT_TABLE_HEADERS.map((label, index) => (
        <Typography
          key={label}
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            textAlign: index === STUDENT_TABLE_HEADERS.length - 1 ? 'right' : 'left',
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  );
}

export default function MentorCourseStudentsList({
  students,
  loading,
  hasAnyStudents,
  isFiltered,
  onViewDetail,
  onClearFilters,
}) {
  if (loading) {
    return <Loading message="Đang tải danh sách học viên..." />;
  }

  if (!hasAnyStudents) {
    return (
      <EmptyState
        embedded
        icon={GroupsOutlinedIcon}
        title="Chưa có học viên nào"
        description="Khi học viên đăng ký khóa học, danh sách và tiến độ sẽ hiển thị tại đây."
      />
    );
  }

  if (students.length === 0 && isFiltered) {
    return (
      <EmptyState
        embedded
        icon={SearchOffOutlinedIcon}
        title="Không tìm thấy học viên phù hợp"
        description="Thử thay đổi từ khóa hoặc bộ lọc."
        actionLabel="Xóa bộ lọc"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <ListHeader />
      {students.map((student) => (
        <MentorCourseStudentRow
          key={student.userId}
          student={student}
          onViewDetail={onViewDetail}
        />
      ))}
    </Box>
  );
}
