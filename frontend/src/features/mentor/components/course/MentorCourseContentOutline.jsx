import { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import {
  getMaterialReviewDetailSummary,
  countMaterialsInPath,
  REVIEW_OUTLINE_TYPE_LABELS,
} from '@/features/mentor/utils/mentorCourseReviewUtils';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  CHAPTER_THEME,
  LESSON_THEME,
  MATERIAL_TYPE_THEME,
} from './mentorCourseContentStyles';

function getItemKey(item, fallback) {
  return (
    item?.tempId ??
    item?.materialId ??
    item?.MaterialId ??
    item?.nodeId ??
    item?.NodeId ??
    item?.pathId ??
    item?.PathId ??
    fallback
  );
}

function MaterialOutlineRow({ material }) {
  const [expanded, setExpanded] = useState(false);
  const typeLabel = REVIEW_OUTLINE_TYPE_LABELS[material.MaterialType] ?? 'Học liệu';
  const title = String(material.Title ?? '').trim() || typeLabel;
  const detail = getMaterialReviewDetailSummary(material);
  const theme = MATERIAL_TYPE_THEME[material.MaterialType] ?? MATERIAL_TYPE_THEME.VIDEO;

  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        bgcolor: theme.soft,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.25,
          py: 1,
        }}
      >
        {detail && (
          <IconButton size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ p: 0.25 }}>
            {expanded ? (
              <ExpandLessRoundedIcon sx={{ fontSize: 16, color: theme.color }} />
            ) : (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16, color: theme.color }} />
            )}
          </IconButton>
        )}
        <Typography
          sx={{
            flex: 1,
            fontSize: 12.5,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.45,
            minWidth: 0,
          }}
        >
          <Box component="span" sx={{ color: theme.color }}>
            {typeLabel}:
          </Box>{' '}
          {title}
        </Typography>
      </Box>
      {detail && (
        <Collapse in={expanded}>
          <Box sx={{ px: 1.5, pb: 1.15, pt: 0.25 }}>
            <Typography
              sx={{
                fontSize: 11.5,
                color: MUTED,
                lineHeight: 1.5,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {detail}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function ChapterOutline({ path, pathIndex, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const nodes = path.Nodes ?? [];
  const chapterTitle = path.PathName || `Chương ${pathIndex + 1}`;
  const materialCount = countMaterialsInPath(path);

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        bgcolor: 'rgba(15,23,42,0.02)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.75,
          py: 1.5,
          bgcolor: CHAPTER_THEME.bg,
          borderBottom: expanded ? `1px solid ${CHAPTER_THEME.border}` : 'none',
        }}
      >
        {console.log(path)}
        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ p: 0.4 }}>
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20, color: CHAPTER_THEME.color }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: CHAPTER_THEME.color }} />
          )}
        </IconButton>
        {console.log("nodes", nodes)}
        <MenuBookRoundedIcon sx={{ fontSize: 18, color: CHAPTER_THEME.color }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
            Chương {pathIndex + 1}: {chapterTitle}
          </Typography>
          <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.15 }}>
            {nodes.length} bài học · {materialCount} học liệu
          </Typography>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 2 }}>
          {path.Description && (
            <Typography sx={{ fontSize: 13, color: MUTED, mb: 2, lineHeight: 1.6 }}>
              {path.Description}
            </Typography>
          )}

          {nodes.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: MUTED }}>Chương này chưa có bài học</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nodes.map((node, nodeIndex) => {
                const materials = node.Materials ?? [];
                const lessonTitle = node.NodeName || `Bài ${nodeIndex + 1}`;

                return (
                  <Box
                    key={getItemKey(node, `node-${pathIndex}-${nodeIndex}`)}
                    sx={{
                      pl: 1.5,
                      py: 1.25,
                      borderLeft: `2px solid ${LESSON_THEME.border}`,
                      bgcolor: 'rgba(99,102,241,0.03)',
                      borderRadius: '0 12px 12px 0',
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, mb: 1 }}>
                      Bài {nodeIndex + 1}: {lessonTitle}
                    </Typography>
                    {node.Description && (
                      <Typography sx={{ fontSize: 12.5, color: MUTED, mb: 1.25, lineHeight: 1.55 }}>
                        {node.Description}
                      </Typography>
                    )}
                    {materials.length === 0 ? (
                      <Typography sx={{ fontSize: 12.5, color: MUTED, fontStyle: 'italic' }}>
                        Chưa có học liệu
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                        {materials.map((material, materialIndex) => (
                          <MaterialOutlineRow
                            key={getItemKey(material, `material-${pathIndex}-${nodeIndex}-${materialIndex}`)}
                            material={material}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function MentorCourseContentOutline({ paths = [] }) {
  if (paths.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {paths.map((path, pathIndex) => (
        <ChapterOutline
          key={getItemKey(path, `path-${pathIndex}`)}
          path={path}
          pathIndex={pathIndex}
          defaultExpanded={pathIndex === 0}
        />
      ))}
    </Box>
  );
}
