import { Box, Typography } from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import {
  countContentStats,
  filterLearningMaterials,
  MATERIAL_TYPE_LABELS,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import {
  BUILDER_PANEL_SX,
  CHAPTER_THEME,
  LESSON_THEME,
  MATERIAL_SECTION_THEME,
  MATERIAL_TYPE_THEME,
} from './mentorCourseContentStyles';

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

function OutlineNavItem({
  label,
  meta,
  icon: Icon,
  iconColor,
  indent = 0,
  onClick,
  disabled = false,
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.65,
        width: '100%',
        textAlign: 'left',
        border: 'none',
        background: 'none',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        font: 'inherit',
        pl: indent * 1.5,
        pr: 0.5,
        py: 0.55,
        borderRadius: '10px',
        transition: 'background-color 0.15s',
        '&:hover': onClick && !disabled ? { bgcolor: 'rgba(8,145,178,0.06)' } : undefined,
        '&:disabled': { opacity: 0.55, cursor: 'default' },
      }}
    >
      {Icon ? (
        <Icon sx={{ fontSize: 15, color: iconColor, mt: 0.15, flexShrink: 0 }} />
      ) : iconColor ? (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '999px',
            bgcolor: iconColor,
            mt: 0.55,
            flexShrink: 0,
            ml: 0.45,
          }}
        />
      ) : null}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: indent === 2 ? 12 : 13,
            fontWeight: indent === 0 ? 700 : 600,
            color: TEXT,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </Typography>
        {meta && (
          <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15, lineHeight: 1.35 }}>
            {meta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function MentorContentOverview({
  paths,
  courseName = '',
  footer = null,
  onNavigateToItem,
}) {
  const { pathCount, nodeCount, materialCount } = countContentStats(paths);

  const handleNavigate = (target) => {
    if (onNavigateToItem) onNavigateToItem(target);
  };

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              maxHeight: { lg: 'calc(100vh - 380px)' },
              overflowY: 'auto',
              pr: 0.25,
              mr: -0.25,
            }}
          >
            {/* Update count (chapter, lesson, materials) */}
            {paths.map((path, pathIndex) => {
              const nodes = path.nodes ?? [];
              const chapterTitle = path.PathName || `Chương ${pathIndex + 1}`;

              return (
                <Box key={path.tempId} sx={{ mb: 0.5 }}>
                  <OutlineNavItem
                    label={`Chương ${pathIndex + 1}: ${chapterTitle}`}
                    meta={
                      nodes.length > 0
                        ? `${nodes.length} bài học`
                        : 'Chưa có bài học'
                    }
                    icon={MenuBookRoundedIcon}
                    iconColor={CHAPTER_THEME.color}
                    indent={0}
                    onClick={() =>
                      handleNavigate({ type: 'chapter', pathTempId: path.tempId })
                    }
                  />

                  {nodes.map((node, nodeIndex) => {
                    const materials = filterLearningMaterials(node.materials ?? []);
                    const lessonTitle = node.NodeName || `Bài ${nodeIndex + 1}`;

                    return (
                      <Box key={node.tempId}>
                        <OutlineNavItem
                          label={`Bài ${nodeIndex + 1}: ${lessonTitle}`}
                          meta={
                            materials.length > 0
                              ? `${materials.length} học liệu`
                              : 'Chưa có học liệu'
                          }
                          icon={PlayLessonRoundedIcon}
                          iconColor={LESSON_THEME.color}
                          indent={1}
                          onClick={() =>
                            handleNavigate({
                              type: 'lesson',
                              pathTempId: path.tempId,
                              nodeTempId: node.tempId,
                            })
                          }
                        />

                        {materials.map((material, materialIndex) => {
                          const typeLabel =
                            MATERIAL_TYPE_LABELS[material.MaterialType] ?? 'Học liệu';
                          const materialTitle =
                            String(material.Title ?? '').trim() ||
                            `${typeLabel} ${materialIndex + 1}`;
                          const theme =
                            MATERIAL_TYPE_THEME[material.MaterialType] ??
                            MATERIAL_TYPE_THEME.VIDEO;

                          return (
                            <OutlineNavItem
                              key={material.tempId}
                              label={`${typeLabel}: ${materialTitle}`}
                              icon={null}
                              iconColor={theme.color}
                              indent={2}
                              onClick={() =>
                                handleNavigate({
                                  type: 'material',
                                  pathTempId: path.tempId,
                                  nodeTempId: node.tempId,
                                  materialTempId: material.tempId,
                                })
                              }
                            />
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* This content buttons */}
      {footer && (
        <Box sx={{ display: { xs: 'none', lg: 'block' }, width: '100%' }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}
