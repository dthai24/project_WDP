import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AppButton from '@/shared/ui/AppButton';
import MentorChapterCard from './MentorChapterCard';
import MentorChapterTabs from './MentorChapterTabs';
import MentorSectionTabToggle from './MentorSectionTabToggle';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import { BUILDER_PANEL_SX } from './mentorCourseContentStyles';
import { isPathSnapshotSaved, resolveChapterId, chapterHasContent } from '@/features/mentor/utils/mentorCourseContentUtils';

export default function MentorCourseContentBuilder({
  paths,
  errors = {},
  expandedPaths = {},
  expandedNodes = {},
  onTogglePath,
  onToggleNode,
  onAddPath,
  onPathChange,
  onPathDelete,
  onAddNode,
  onNodeChange,
  onNodeDelete,
  onAddMaterial,
  onMaterialChange,
  onMaterialDelete,
  onMaterialReorder,
  disabled = false,
  savedPathSnapshots = {},
  savingChapterId = null,
  onSaveChapter,
  showChapterSave = true,
  courseId = null,
  courseTitle = '',
  focusTarget = null,
}) {
  const [activeChapterId, setActiveChapterId] = useState(() => paths[0]?.tempId ?? null);
  const [chapterSectionOpen, setChapterSectionOpen] = useState(true);
  const pendingSelectLastRef = useRef(false);
  const activeChapterIndexRef = useRef(0);

  const hasErrorById = useMemo(() => {
    const map = {};
    for (const path of paths) {
      map[path.tempId] = Boolean(errors.paths?.[path.tempId]);
    }
    return map;
  }, [errors.paths, paths]);

  const hasContentById = useMemo(() => {
    const map = {};
    for (const path of paths) {
      map[path.tempId] = chapterHasContent(path);
    }
    return map;
  }, [paths]);

  useEffect(() => {
    if (paths.length === 0) {
      setActiveChapterId(null);
      return;
    }
    const stillExists = paths.some((p) => p.tempId === activeChapterId);
    if (!stillExists) {
      const nextIdx = Math.max(0, activeChapterIndexRef.current - 1);
      setActiveChapterId(paths[Math.min(nextIdx, paths.length - 1)]?.tempId ?? paths[0]?.tempId);
    }
  }, [paths, activeChapterId]);

  useEffect(() => {
    if (focusTarget?.pathTempId) {
      setActiveChapterId(focusTarget.pathTempId);
    }
  }, [focusTarget]);

  useEffect(() => {
    setChapterSectionOpen(true);
  }, [activeChapterId]);

  useEffect(() => {
    if (pendingSelectLastRef.current && paths.length > 0) {
      setActiveChapterId(paths[paths.length - 1].tempId);
      pendingSelectLastRef.current = false;
    }
  }, [paths]);

  const activePathIndex = paths.findIndex((p) => p.tempId === activeChapterId);
  const activePath = activePathIndex >= 0 ? paths[activePathIndex] : null;

  useEffect(() => {
    if (activePathIndex >= 0) activeChapterIndexRef.current = activePathIndex;
  }, [activePathIndex]);

  const handlePathDelete = useCallback((pathTempId) => {
    if (pathTempId === activeChapterId) {
      const idx = paths.findIndex((p) => p.tempId === pathTempId);
      const remaining = paths.filter((p) => p.tempId !== pathTempId);
      const nextIdx = Math.max(0, idx - 1);
      setActiveChapterId(remaining[nextIdx]?.tempId ?? null);
    }
    onPathDelete?.(pathTempId);
  }, [activeChapterId, paths, onPathDelete]);

  const handleAddChapterClick = () => {
    pendingSelectLastRef.current = true;
    onAddPath?.();
  };

  return (
    <>
      <Box id="content-builder-root" data-content-error="content-builder-root">
        {(errors.root ?? []).length > 0 && (
          <Box
            sx={{
              mb: 2,
              px: 1.5,
              py: 1,
              borderRadius: '10px',
              bgcolor: 'rgba(220,38,38,0.04)',
              border: '1px solid rgba(220,38,38,0.12)',
            }}
          >
            {(errors.root ?? []).map((message) => (
              <Typography key={message} sx={{ fontSize: 13, color: '#DC2626' }}>
                {message}
              </Typography>
            ))}
          </Box>
        )}

        {paths.length === 0 ? (
          <Box sx={{ ...BUILDER_PANEL_SX, textAlign: 'center', py: 5, px: 2.5 }}>
            <MenuBookOutlinedIcon sx={{ fontSize: 36, color: MUTED, mb: 1.5 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: TEXT, mb: 0.5 }}>
              Chưa có chương nào
            </Typography>
            <Typography sx={{ fontSize: 14, color: MUTED, mb: 2.5, maxWidth: 420, mx: 'auto', lineHeight: 1.55 }}>
              Thêm chương đầu tiên để bắt đầu xây dựng nội dung khóa học.
            </Typography>
            <AppButton
              onClick={handleAddChapterClick}
              disabled={disabled}
              startIcon={<AddRoundedIcon />}
              sx={{
                height: 40,
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: PRIMARY,
                '&:hover': { bgcolor: '#0E7490' },
              }}
            >
              Thêm chương
            </AppButton>
          </Box>
        ) : (
          <Box>
            <MentorChapterTabs
              paths={paths}
              activeId={activeChapterId}
              onChange={setActiveChapterId}
              onAdd={handleAddChapterClick}
              disabled={disabled}
              hasErrorById={hasErrorById}
              hasContentById={hasContentById}
              trailingActions={
                <MentorSectionTabToggle
                  label="Chương"
                  expanded={chapterSectionOpen}
                  onToggle={() => setChapterSectionOpen((v) => !v)}
                />
              }
            />

            <Box
              sx={{
                ...BUILDER_PANEL_SX,
                borderRadius: '0 0 14px 14px',
                borderTop: '1px solid rgba(15,23,42,0.1)',
                overflow: 'visible',
              }}
            >
              {activePath ? (
                <MentorChapterCard
                  key={activePath.tempId}
                  path={activePath}
                  pathIndex={activePathIndex}
                  courseId={courseId}
                  chapterId={resolveChapterId(activePath, activePathIndex)}
                  errors={errors.paths?.[activePath.tempId] ?? {}}
                  expanded
                  tabMode
                  expandedNodes={expandedNodes}
                  onToggle={() => onTogglePath(activePath.tempId)}
                  onToggleNode={onToggleNode}
                  onChange={onPathChange}
                  onDelete={() => handlePathDelete(activePath.tempId)}
                  onAddNode={() => onAddNode(activePath.tempId)}
                  onNodeChange={(nodeTempId, patch) =>
                    onNodeChange(activePath.tempId, nodeTempId, patch)
                  }
                  onNodeDelete={onNodeDelete}
                  onAddMaterial={onAddMaterial}
                  onMaterialChange={onMaterialChange}
                  onMaterialDelete={onMaterialDelete}
                  onMaterialReorder={onMaterialReorder}
                  disabled={disabled}
                  isSaved={isPathSnapshotSaved(activePath, savedPathSnapshots[activePath.tempId])}
                  saving={savingChapterId === activePath.tempId}
                  showSave={showChapterSave}
                  onSave={() => onSaveChapter?.(activePath.tempId)}
                  focusLessonId={
                    focusTarget?.pathTempId === activePath.tempId ? focusTarget.nodeTempId : null
                  }
                  focusMaterialId={
                    focusTarget?.pathTempId === activePath.tempId ? focusTarget.materialTempId : null
                  }
                  chapterSectionOpen={chapterSectionOpen}
                  onChapterSectionOpenChange={setChapterSectionOpen}
                />
              ) : null}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
