import { Box, Typography } from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import UnpublishedRoundedIcon from '@mui/icons-material/UnpublishedRounded';
import {
  COURSE_THUMBNAIL_ASPECT,
  CREATE_CARD_SX,
  MUTED,
  PRIMARY,
  TEXT,
} from './mentorCourseCreateStyles';
import MentorCardSectionTitle from './MentorCardSectionTitle';
import ThumbnailImage from '@/shared/ui/ThumbnailImage';
import { underlineFieldSx as valueUnderlineSx } from '@/shared/ui/UnderlineFieldPopup';
import { formatMentorCourseDate, isCoursePublished } from '@/features/mentor/utils/mentorCourseUtils';
import { resolveCategoryChipSx, resolveLevelChipSx } from '@/shared/catalog/catalogRegistry';

const FIELD_COLORS = {
  title: '#0E7490',
  description: MUTED,
  instructor: '#4338CA',
  created: '#B45309',
  updated: '#0369A1',
};

function chipSxToColor(chipSx) {
  return chipSx.color ?? MUTED;
}

function getStatusMeta(published) {
  if (published) {
    return { color: '#047857', icon: PublishRoundedIcon };
  }
  return { color: MUTED, icon: UnpublishedRoundedIcon };
}

function InfoRow({ label, value, icon: Icon, iconColor, valueSx, rootSx }) {
  const accent = iconColor ?? MUTED;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        py: 1.4,
        ...rootSx,
      }}
    >
      <Icon sx={{ fontSize: 16, color: accent, flexShrink: 0, mt: 0.25 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, color: MUTED, fontWeight: 500, mb: 0.4, lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Box sx={valueUnderlineSx}>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              ...valueSx,
            }}
          >
            {value ?? '—'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function MentorCourseOverviewTab({ course }) {
  const published = isCoursePublished(course);
  const statusMeta = getStatusMeta(published);
  const categoryColor = chipSxToColor(
    resolveCategoryChipSx({
      id: course.CategoryId,
      displayName: course.CategoryDisplayName,
    }),
  );
  const levelColor = chipSxToColor(
    resolveLevelChipSx({
      id: course.LevelId,
      displayName: course.LevelDisplayName,
    }),
  );

  return (
    <Box sx={CREATE_CARD_SX}>
      <MentorCardSectionTitle title="Thông tin khóa học" />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <ThumbnailImage
          src={course.Thumbnail}
          label={course.CourseName}
          alt={course.CourseName}
          cacheKey={course.CourseUpdateAt ?? course.UpdatedAt ?? course.CourseCreateAt}
          iconSize={40}
          sx={{
            width: '100%',
            aspectRatio: String(COURSE_THUMBNAIL_ASPECT),
            borderRadius: '16px',
            border: '1px solid rgba(15,23,42,0.08)',
          }}
        />

        <Box>
          <InfoRow
            label="Tên khóa học"
            value={course.CourseName}
            icon={MenuBookOutlinedIcon}
            iconColor={FIELD_COLORS.title}
            valueSx={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 2,
            }}
          >
            <InfoRow
              label="Danh mục"
              value={course.CategoryDisplayName}
              icon={CategoryOutlinedIcon}
              iconColor={categoryColor}
            />
            <InfoRow
              label="Trình độ"
              value={course.LevelDisplayName}
              icon={SignalCellularAltOutlinedIcon}
              iconColor={levelColor}
            />
            <InfoRow
              label="Giảng viên"
              value={course.InStructorName}
              icon={PersonOutlineOutlinedIcon}
              iconColor={FIELD_COLORS.instructor}
            />
            <InfoRow
              label="Trạng thái"
              value={published ? 'Đã xuất bản' : 'Bản nháp'}
              icon={statusMeta.icon}
              iconColor={statusMeta.color}
              valueSx={{ color: statusMeta.color }}
            />
            <InfoRow
              label="Ngày tạo"
              value={formatMentorCourseDate(course.CourseCreateAt)}
              icon={EventOutlinedIcon}
              iconColor={FIELD_COLORS.created}
            />
            <InfoRow
              label="Cập nhật gần nhất"
              value={formatMentorCourseDate(course.CourseUpdateAt)}
              icon={UpdateOutlinedIcon}
              iconColor={FIELD_COLORS.updated}
            />
          </Box>

          <InfoRow
            label="Mô tả"
            value={course.Description || '—'}
            icon={DescriptionOutlinedIcon}
            iconColor={FIELD_COLORS.description}
            valueSx={{ fontWeight: 500, color: 'rgba(15,23,42,0.82)' }}
          />
        </Box>
      </Box>
    </Box>
  );
}
