import { Box, Typography } from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { countContentStats } from '../../../utils/mentorCourseContentUtils';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import { BUILDER_PANEL_SX, CHAPTER_THEME, LESSON_THEME, MATERIAL_SECTION_THEME } from './mentorCourseContentStyles';

function StatPill({ label, value, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 1.25,
        py: 1,
        borderRadius: '12px',
        bgcolor: 'rgba(15,23,42,0.03)',
        border: '1px solid rgba(15,23,42,0.06)',
        textAlign: 'center',
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color, mt: 0.25, lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function MentorContentOverview({
  paths,
  courseName = '',
  footer = null,
}) {
  const { pathCount, nodeCount, materialCount } = countContentStats(paths);

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ ...BUILDER_PANEL_SX, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: 'rgba(8,145,178,0.08)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <InsightsRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            Tổng quan nội dung
          </Typography>
        </Box>

        {courseName && (
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 1.5, lineHeight: 1.5 }}>
            Khóa học:{' '}
            <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
              {courseName}
            </Box>
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <StatPill label="Chương" value={pathCount} color={CHAPTER_THEME.color} />
          <StatPill label="Bài học" value={nodeCount} color={LESSON_THEME.color} />
          <StatPill label="Học liệu" value={materialCount} color={MATERIAL_SECTION_THEME.color} />
        </Box>

        {paths.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
            Thêm chương đầu tiên để xem outline nội dung khóa học.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {paths.map((path, pathIndex) => {
              const nodeLen = (path.nodes ?? []).length;
              const chapterTitle = path.PathName || `Chương ${pathIndex + 1}`;

              return (
                <Box key={path.tempId}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                    <MenuBookRoundedIcon
                      sx={{ fontSize: 17, color: CHAPTER_THEME.color, mt: 0.15, flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                        Chương {pathIndex + 1}: {chapterTitle}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25, lineHeight: 1.45 }}>
                        {nodeLen > 0
                          ? `${nodeLen} bài học`
                          : 'Thêm bài học để hoàn thiện cấu trúc chương.'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {footer && (
        <Box sx={{ display: { xs: 'none', lg: 'block' }, width: '100%' }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}
