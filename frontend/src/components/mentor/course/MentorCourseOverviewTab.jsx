import { Box, Typography } from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import {
  COURSE_THUMBNAIL_ASPECT,
  CREATE_CARD_SX,
  PRIMARY,
  TEXT,
} from './mentorCourseCreateStyles';
import { formatMentorCourseDate } from '../../../utils/mentorCourseUtils';

function InfoRow({ label, value }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, mb: 0.25, lineHeight: 1.35 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

export default function MentorCourseOverviewTab({ course }) {
  const isPublished = course.status === 'published';

  return (
    <Box sx={CREATE_CARD_SX}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 4,
            height: 22,
            borderRadius: '999px',
            bgcolor: PRIMARY,
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: 17, fontWeight: 800, color: PRIMARY, lineHeight: 1.35 }}>
          Thông tin khóa học
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: String(COURSE_THUMBNAIL_ASPECT),
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: 'rgba(15,23,42,0.04)',
            border: '1px solid rgba(15,23,42,0.08)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {course.thumbnail ? (
            <Box
              component="img"
              src={course.thumbnail}
              alt={course.courseName}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MenuBookOutlinedIcon sx={{ fontSize: 40, color: PRIMARY, opacity: 0.65 }} />
          )}
        </Box>

        <Box>
          <InfoRow label="Tên khóa học" value={course.courseName} />
          <InfoRow label="Mô tả" value={course.description || '—'} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 0,
            }}
          >
            <InfoRow label="Danh mục" value={course.categoryName} />
            <InfoRow label="Trình độ" value={course.levelName} />
            <InfoRow label="Giảng viên" value={course.instructorName} />
            <InfoRow
              label="Trạng thái"
              value={isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            />
            <InfoRow label="Ngày tạo" value={formatMentorCourseDate(course.createdAt)} />
            <InfoRow label="Cập nhật gần nhất" value={formatMentorCourseDate(course.updatedAt)} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
