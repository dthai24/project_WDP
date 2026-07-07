import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AppButton from '@/shared/ui/AppButton';
import MentorChapterCard from './MentorChapterCard';
import MentorChapterTabs from './MentorChapterTabs';
import MentorSectionTabToggle from './MentorSectionTabToggle';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import { BUILDER_PANEL_SX } from './mentorCourseContentStyles';
import { isPathFieldsSnapshotSaved, resolveChapterId, chapterHasContent } from '@/features/mentor/utils/mentorCourseContentUtils';

export default function MentorCourseContentBuilder({
  paths,
  errors = {},
  expandedPaths = {},
  expandedNodes = {},
  onTogglePath,
  onToggleNode,
  onAddPath,
  onPathChange,
  onDeleteNewPath,
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
  showPathUpdate = false,
  updatingPathId = null,
  onUpdatePath,
  showNodeUpdate = false,
  updatingNodeKey = null,
  onUpdateNode,
  activeChapterId: controlledActiveChapterId,
  onActiveChapterChange,
  courseId = null,
  courseTitle = '',
  focusTarget = null,
}) {
  const [internalActiveChapterId, setInternalActiveChapterId] = useState(() => paths[0]?.tempId ?? null);
  const isControlledChapter = controlledActiveChapterId !== undefined;
  const activeChapterId = isControlledChapter ? controlledActiveChapterId : internalActiveChapterId;

  const setActiveChapterId = useCallback((nextChapterId) => {
    if (isControlledChapter) {
      onActiveChapterChange?.(nextChapterId);
      return;
    }
    setInternalActiveChapterId(nextChapterId);
  }, [isControlledChapter, onActiveChapterChange]);

  const requestActiveChapterChange = useCallback((nextChapterId) => {
    if (!nextChapterId || nextChapterId === activeChapterId) return;
    setActiveChapterId(nextChapterId);
  }, [activeChapterId, setActiveChapterId]);
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
      requestActiveChapterChange(
        paths[Math.min(nextIdx, paths.length - 1)]?.tempId ?? paths[0]?.tempId,
      );
    }
  }, [paths, activeChapterId, requestActiveChapterChange]);

  useEffect(() => {
    if (isControlledChapter) return;
    if (focusTarget?.pathTempId) {
      setInternalActiveChapterId(focusTarget.pathTempId);
    }
  }, [focusTarget, isControlledChapter]);

  useEffect(() => {
    setChapterSectionOpen(true);
  }, [activeChapterId]);

  useEffect(() => {
    if (pendingSelectLastRef.current && paths.length > 0) {
      requestActiveChapterChange(paths[paths.length - 1].tempId);
      pendingSelectLastRef.current = false;
    }
  }, [paths, requestActiveChapterChange]);

  const activePathIndex = paths.findIndex((p) => p.tempId === activeChapterId);
  const activePath = activePathIndex >= 0 ? paths[activePathIndex] : null;
  const activePathDirty = Boolean(
    activePath && !isPathFieldsSnapshotSaved(activePath, savedPathSnapshots[activePath.tempId]),
  );
  const updatingPath = updatingPathId === activePath?.tempId;

  useEffect(() => {
    if (activePathIndex >= 0) activeChapterIndexRef.current = activePathIndex;
  }, [activePathIndex]);

  const handleAddChapterClick = () => {
    pendingSelectLastRef.current = true;
    onAddPath?.();
  };

  const handleDeleteNewPath = useCallback((pathTempId) => {
    if (pathTempId === activeChapterId) {
      const idx = paths.findIndex((p) => p.tempId === pathTempId);
      const remaining = paths.filter((p) => p.tempId !== pathTempId);
      const nextIdx = Math.max(0, idx - 1);
      setActiveChapterId(remaining[nextIdx]?.tempId ?? null);
    }
    onDeleteNewPath?.(pathTempId);
  }, [activeChapterId, paths, onDeleteNewPath, setActiveChapterId]);

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
              onChange={requestActiveChapterChange}
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
                <>
                {showPathUpdate ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1.5,
                      p: 1.25,
                      borderRadius: '12px',
                      bgcolor: activePathDirty ? 'rgba(245,158,11,0.08)' : 'rgba(15,23,42,0.03)',
                      border: `1px solid ${activePathDirty ? 'rgba(245,158,11,0.22)' : 'rgba(15,23,42,0.06)'}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: activePathDirty ? '#92400E' : MUTED, lineHeight: 1.5 }}>
                      {activePathDirty
                        ? 'Thông tin path (tên, mô tả, xuất bản) chưa lưu.'
                        : 'Thông tin path đã đồng bộ.'}
                    </Typography>
                    <AppButton
                      startIcon={<SaveOutlinedIcon />}
                      onClick={() => onUpdatePath?.(activePath.tempId)}
                      disabled={disabled || updatingPath || !activePathDirty}
                      sx={{
                        height: 36,
                        px: 2,
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: '999px',
                        bgcolor: PRIMARY,
                        color: '#fff',
                        boxShadow: 'none',
                        flexShrink: 0,
                        '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
                        '&.Mui-disabled': { bgcolor: 'rgba(15,23,42,0.12)', color: MUTED },
                      }}
                    >
                      {updatingPath ? 'Đang cập nhật...' : 'Cập nhật path'}
                    </AppButton>
                  </Box>
                ) : null}
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
                  onDeleteNewPath={handleDeleteNewPath}
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
                  isSaved={isPathFieldsSnapshotSaved(activePath, savedPathSnapshots[activePath.tempId])}
                  saving={savingChapterId === activePath.tempId}
                  showSave={showChapterSave}
                  onSave={() => onSaveChapter?.(activePath.tempId)}
                  showNodeUpdate={showNodeUpdate}
                  savedPathSnapshot={savedPathSnapshots[activePath.tempId]}
                  updatingNodeKey={updatingNodeKey}
                  onUpdateNode={(nodeTempId) => onUpdateNode?.(activePath.tempId, nodeTempId)}
                  focusLessonId={
                    focusTarget?.pathTempId === activePath.tempId ? focusTarget.nodeTempId : null
                  }
                  focusMaterialId={
                    focusTarget?.pathTempId === activePath.tempId ? focusTarget.materialTempId : null
                  }
                  chapterSectionOpen={chapterSectionOpen}
                  onChapterSectionOpenChange={setChapterSectionOpen}
                />
                </>
              ) : null}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
