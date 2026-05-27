import { Box, Typography } from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded';
import { countContentStats } from '../../../utils/mentorCourseContentUtils';
import { CREATE_CARD_SX, MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  CHAPTER_THEME,
  LESSON_THEME,
  MATERIAL_SECTION_THEME,
  MATERIAL_TYPE_THEME,
} from './mentorCourseContentStyles';
import { MentorContentBlockHeading } from './MentorContentSectionHeading';

const MATERIAL_ICONS = {
  VIDEO: PlayCircleRoundedIcon,
  DOC: DescriptionRoundedIcon,
  TEST: QuizRoundedIcon,
};

function StatRow({ label, value, theme }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: '10px',
        bgcolor: theme.bg,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.color }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{value}</Typography>
    </Box>
  );
}

export default function MentorContentPreview({ paths, courseName = '' }) {
  const { pathCount, nodeCount, materialCount } = countContentStats(paths);

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={CREATE_CARD_SX}>
        <MentorContentBlockHeading
          Icon={InsightsRoundedIcon}
          label="Tóm tắt cấu trúc"
          theme={{ color: TEXT, bg: 'rgba(15,23,42,0.06)', border: 'rgba(15,23,42,0.08)' }}
        />

        {courseName && (
          <Typography sx={{ fontSize: 14, color: MUTED, mb: 1.25, lineHeight: 1.5, fontWeight: 500 }}>
            <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
              {courseName}
            </Box>
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <StatRow label="Chương" value={pathCount} theme={CHAPTER_THEME} />
          <StatRow label="Bài" value={nodeCount} theme={LESSON_THEME} />
          <StatRow label="Học liệu" value={materialCount} theme={MATERIAL_SECTION_THEME} />
        </Box>
      </Box>

      <Box sx={CREATE_CARD_SX}>
        <MentorContentBlockHeading
          Icon={PreviewRoundedIcon}
          label="Xem trước"
          theme={{ color: TEXT, bg: 'rgba(15,23,42,0.06)', border: 'rgba(15,23,42,0.08)' }}
        />

        {paths.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
            Cấu trúc khóa học sẽ hiển thị ở đây khi bạn thêm chương.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {paths.map((path, pathIndex) => (
              <Box key={path.tempId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 0.5 }}>
                  <MenuBookRoundedIcon sx={{ fontSize: 18, color: CHAPTER_THEME.color }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                    {path.PathName || `Chương ${pathIndex + 1}`}
                  </Typography>
                </Box>

                {(path.nodes ?? []).length === 0 ? (
                  <Typography sx={{ fontSize: 12, color: MUTED, pl: 3.25 }}>
                    Chưa có bài
                  </Typography>
                ) : (
                  <Box sx={{ pl: 3.25, display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                    {(path.nodes ?? []).map((node, nodeIndex) => (
                      <Box key={node.tempId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                          <AssignmentRoundedIcon sx={{ fontSize: 16, color: LESSON_THEME.color }} />
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                            {node.NodeName || `Bài ${nodeIndex + 1}`}
                          </Typography>
                        </Box>

                        {(node.materials ?? []).length > 0 && (
                          <Box sx={{ pl: 2.5, mt: 0.4, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                            {(node.materials ?? []).map((material) => {
                              const typeTheme = MATERIAL_TYPE_THEME[material.MaterialType] ?? MATERIAL_TYPE_THEME.VIDEO;
                              const Icon = MATERIAL_ICONS[material.MaterialType] ?? PlayCircleRoundedIcon;
                              return (
                                <Box
                                  key={material.tempId}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}
                                >
                                  <Icon sx={{ fontSize: 14, color: typeTheme.color }} />
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: MUTED,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {material.Title || material.MaterialType}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
