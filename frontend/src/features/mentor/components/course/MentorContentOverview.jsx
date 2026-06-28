import { Box, Typography, alpha } from '@mui/material';
import { useCallback } from 'react';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import {
  filterLearningMaterials,
  MATERIAL_TYPE_LABELS,
  materialHasContent,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import {
  DETAIL_ENTITY_TITLE_SX,
  MUTED,
  PRIMARY,
  TEXT,
} from './mentorCourseCreateStyles';
import { BUILDER_PANEL_SX, MATERIAL_TYPE_THEME } from './mentorCourseContentStyles';

const PLACEHOLDER_TEXT = '#94A3B8';

function OutlineNavItem({
  prefix,
  title,
  isPlaceholder = false,
  meta,
  icon: Icon,
  iconColor,
  indent = 0,
  selected = false,
  onClick,
}) {
  const titleColor = isPlaceholder
    ? PLACEHOLDER_TEXT
    : selected
      ? PRIMARY
      : TEXT;
  const prefixColor = selected ? PRIMARY : TEXT;

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={!onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.65,
        width: '100%',
        textAlign: 'left',
        border: selected ? `1px solid ${alpha(PRIMARY, 0.35)}` : '1px solid transparent',
        background: 'none',
        cursor: onClick ? 'pointer' : 'default',
        font: 'inherit',
        pl: indent * 1.5 + 0.5,
        pr: 0.5,
        py: 0.55,
        borderRadius: '10px',
        bgcolor: selected ? alpha(PRIMARY, 0.08) : 'transparent',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': onClick && !selected ? { bgcolor: 'rgba(8,145,178,0.06)' } : undefined,
      }}
    >
      {Icon ? (
        <Icon sx={{ fontSize: 15, color: selected ? PRIMARY : iconColor, mt: 0.15, flexShrink: 0 }} />
      ) : (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '999px',
            bgcolor: iconColor ?? MUTED,
            mt: 0.55,
            flexShrink: 0,
            ml: 0.45,
          }}
        />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: indent >= 2 ? 12 : indent === 0 ? 13 : 12,
            fontWeight: selected ? 700 : indent === 0 ? 700 : 600,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Box component="span" sx={{ color: prefixColor }}>
            {prefix}
            :
          </Box>
          {' '}
          <Box component="span" sx={{ color: titleColor, fontWeight: isPlaceholder ? 500 : 'inherit' }}>
            {title}
          </Box>
        </Typography>
        {meta ? (
          <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15, lineHeight: 1.35 }}>
            {meta}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function truncateLabel(text, max = 48) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function getChapterOutline(path, pathIndex) {
  const prefix = `Chương ${pathIndex + 1}`;
  const nodes = path.nodes ?? [];
  const name = String(path.PathName ?? '').trim();

  if (nodes.length === 0) {
    return { prefix, title: 'Chưa có bài học', isPlaceholder: true, meta: null };
  }
  if (!name) {
    return { prefix, title: 'Chưa có tên chương', isPlaceholder: true, meta: `${nodes.length} bài học` };
  }
  return { prefix, title: name, isPlaceholder: false, meta: `${nodes.length} bài học` };
}

function getLessonOutline(node, nodeIndex, materials) {
  const prefix = `Bài ${nodeIndex + 1}`;
  const name = String(node.NodeName ?? node.nodeName ?? '').trim();

  if (materials.length === 0) {
    return { prefix, title: 'Chưa có học liệu', isPlaceholder: true, meta: null };
  }
  if (!name) {
    return { prefix, title: 'Chưa có tên bài học', isPlaceholder: true, meta: `${materials.length} học liệu` };
  }
  return { prefix, title: name, isPlaceholder: false, meta: `${materials.length} học liệu` };
}

function getMaterialOutline(material, materialIndex) {
  const prefix = MATERIAL_TYPE_LABELS[material.MaterialType] ?? 'Học liệu';

  if (!materialHasContent(material)) {
    return { prefix, title: 'Chưa có nội dung', isPlaceholder: true, meta: null };
  }

  const title = truncateLabel(material.Title);
  const displayTitle = title || `${prefix} ${materialIndex + 1}`;
  return { prefix, title: displayTitle, isPlaceholder: false, meta: null };
}

function isChapterSelected(focusTarget, pathTempId) {
  return focusTarget?.type === 'chapter' && focusTarget.pathTempId === pathTempId;
}

function isLessonSelected(focusTarget, pathTempId, nodeTempId) {
  return (
    focusTarget?.type === 'lesson'
    && focusTarget.pathTempId === pathTempId
    && focusTarget.nodeTempId === nodeTempId
  );
}

function isMaterialSelected(focusTarget, pathTempId, nodeTempId, materialTempId) {
  return (
    focusTarget?.type === 'material'
    && focusTarget.pathTempId === pathTempId
    && focusTarget.nodeTempId === nodeTempId
    && focusTarget.materialTempId === materialTempId
  );
}

export default function MentorContentOverview({
  paths,
  courseName = '',
  footer = null,
  focusTarget = null,
  onNavigateToItem,
}) {
  const handleNavigate = useCallback(
    (target) => {
      onNavigateToItem?.(target);
    },
    [onNavigateToItem],
  );

  const hasContent = paths.length > 0;

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
        {courseName ? (
          <Typography sx={{ ...DETAIL_ENTITY_TITLE_SX, mb: 1.25 }}>
            {courseName}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 1.25 }}>
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
            <ListAltRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            Mục lục nội dung
          </Typography>
        </Box>

        {!hasContent ? (
          <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
            Thêm chương đầu tiên để xem mục lục và điều hướng nhanh.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              maxHeight: { lg: 'calc(100vh - 280px)' },
              minHeight: 120,
              overflowY: 'auto',
              pr: 0.25,
              mr: -0.25,
            }}
          >
            {paths.map((path, pathIndex) => {
              const nodes = path.nodes ?? [];
              const chapterOutline = getChapterOutline(path, pathIndex);

              return (
                <Box key={path.tempId} sx={{ mb: 0.35 }}>
                  <OutlineNavItem
                    prefix={chapterOutline.prefix}
                    title={chapterOutline.title}
                    isPlaceholder={chapterOutline.isPlaceholder}
                    meta={chapterOutline.meta}
                    icon={MenuBookRoundedIcon}
                    iconColor={MUTED}
                    selected={isChapterSelected(focusTarget, path.tempId)}
                    onClick={() =>
                      handleNavigate({ type: 'chapter', pathTempId: path.tempId })
                    }
                  />

                  {nodes.map((node, nodeIndex) => {
                    const materials = filterLearningMaterials(
                      node.Materials ?? node.materials ?? [],
                    );
                    const lessonOutline = getLessonOutline(node, nodeIndex, materials);

                    return (
                      <Box key={node.tempId}>
                        <OutlineNavItem
                          prefix={lessonOutline.prefix}
                          title={lessonOutline.title}
                          isPlaceholder={lessonOutline.isPlaceholder}
                          meta={lessonOutline.meta}
                          icon={PlayLessonRoundedIcon}
                          iconColor={MUTED}
                          indent={1}
                          selected={isLessonSelected(focusTarget, path.tempId, node.tempId)}
                          onClick={() =>
                            handleNavigate({
                              type: 'lesson',
                              pathTempId: path.tempId,
                              nodeTempId: node.tempId,
                            })
                          }
                        />

                        {materials.map((material, materialIndex) => {
                          const materialOutline = getMaterialOutline(material, materialIndex);
                          const theme =
                            MATERIAL_TYPE_THEME[material.MaterialType]
                            ?? MATERIAL_TYPE_THEME.VIDEO;

                          return (
                            <OutlineNavItem
                              key={material.tempId}
                              prefix={materialOutline.prefix}
                              title={materialOutline.title}
                              isPlaceholder={materialOutline.isPlaceholder}
                              meta={materialOutline.meta}
                              icon={null}
                              iconColor={theme.color}
                              indent={2}
                              selected={isMaterialSelected(
                                focusTarget,
                                path.tempId,
                                node.tempId,
                                material.tempId,
                              )}
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

      {footer ? (
        <Box sx={{ display: { xs: 'none', lg: 'block' }, width: '100%' }}>
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}
