import { Box, Collapse, IconButton, InputBase, Switch, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import AppButton from '@/shared/ui/AppButton';
import MentorLessonBlock from './MentorLessonBlock';
import MentorLessonTabs from './MentorLessonTabs';
import MentorMaterialTabs from './MentorMaterialTabs';
import MentorMaterialRow from './MentorMaterialRow';
import MentorChapterCardMenu from './MentorChapterCardMenu';
import MentorSectionToolbar from './MentorSectionToolbar';
import MentorSectionTabToggle from './MentorSectionTabToggle';
import { ContentStatusIcon } from './MentorChapterTabs';
import { ContentFieldLabel, ContentShortDescriptionField } from './MentorContentSectionHeading';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import {
  chapterHasContent,
  filterLearningMaterials,
  isNewUnsavedPath,
  isNodeSnapshotSaved,
  isPathActive,
  lessonHasContent,
  materialHasContent,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import {
  BUILDER_CHAPTER_BAR_HEIGHT,
  BUILDER_PANEL_SX,
  BUILDER_SCROLL_MARGIN_MATERIAL,
  BUILDER_SCROLL_MARGIN_TOP,
  BUILDER_STICKY_ACTION_BAR_TOP,
  BUILDER_STICKY_MATERIAL_TABS_ONLY_TOP,
  breakoutBodyPaddingSx,
  materialPinnedRailStickySx,
  CHAPTER_THEME,
  CONTENT_SECTION_LABEL_SX,
  DELETE_ICON_BTN_SX,
  DELETE_NEW_PATH_BTN_SX,
  ICON_BTN_SX,
  chapterCardSx,
  contentAddButtonSx,
  contentFieldSx,
  contentInputInnerSx,
} from './mentorCourseContentStyles';

const MATERIAL_TYPE_LABEL = {
  VIDEO: 'Video',
  TEXT: 'Văn bản',
  DOC: 'Tài liệu',
};

function getMaterialToolbarSummary(material) {
  const typeLabel = MATERIAL_TYPE_LABEL[material.MaterialType] ?? 'Học liệu';
  const title = String(material.Title ?? '').trim();
  return `${typeLabel} · ${title || 'Chưa đặt tiêu đề'}`;
}

function PathPublishToggle({ path, onChange, disabled = false }) {
  const published = isPathActive(path);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.35,
        borderRadius: '999px',
        bgcolor: published ? 'rgba(4,120,87,0.08)' : 'rgba(100,116,139,0.08)',
        border: `1px solid ${published ? 'rgba(4,120,87,0.2)' : 'rgba(15,23,42,0.08)'}`,
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: published ? '#047857' : MUTED }}>
        Xuất bản
      </Typography>
      <Switch
        size="small"
        checked={published}
        onChange={(event) => onChange(path.tempId, { IsActive: event.target.checked ? 1 : 0 })}
        disabled={disabled}
        inputProps={{ 'aria-label': 'Xuất bản chương cho học viên' }}
        sx={{
          m: 0,
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#047857' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#047857' },
        }}
      />
    </Box>
  );
}

function PathChapterActions({ path, onChange, onDeleteNewPath, disabled = false }) {
  if (isNewUnsavedPath(path)) {
    return (
      <AppButton
        variant="outlined"
        onClick={() => onDeleteNewPath?.(path.tempId)}
        disabled={disabled}
        aria-label="Xóa chương mới"
        startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />}
        sx={DELETE_NEW_PATH_BTN_SX}
      >
        Xóa
      </AppButton>
    );
  }

  return <PathPublishToggle path={path} onChange={onChange} disabled={disabled} />;
}

export default function MentorChapterCard({
  path,
  pathIndex,
  errors = {},
  expanded = true,
  expandedNodes = {},
  onToggle,
  onToggleNode,
  onChange,
  onDeleteNewPath,
  onAddNode,
  onNodeChange,
  onNodeDelete,
  onAddMaterial,
  onMaterialChange,
  onMaterialDelete,
  onMaterialReorder,
  disabled = false,
  isSaved = false,
  saving = false,
  onSave,
  showSave = true,
  showNodeUpdate = false,
  savedPathSnapshot = null,
  updatingNodeKey = null,
  onUpdateNode,
  courseId = null,
  chapterId = null,
  onQuizSetup,
  quizSetupDisabled = false,
  quizSetupDisabledReason = '',
  tabMode = false,
  focusLessonId = null,
  focusMaterialId = null,
  chapterSectionOpen: chapterSectionOpenProp,
  onChapterSectionOpenChange,
}) {
  const nodesNormal = path.nodes ?? path.Nodes ?? [];
  const lessonCount = nodesNormal.length;
  const hasContent = chapterHasContent(path);
  const [activeLessonId, setActiveLessonId] = useState(
    () => focusLessonId ?? nodesNormal[0]?.tempId ?? null,
  );
  const [activeMaterialId, setActiveMaterialId] = useState(null);
  const [chapterSectionOpenInternal, setChapterSectionOpenInternal] = useState(true);
  const [lessonSectionOpen, setLessonSectionOpen] = useState(true);
  const [materialsSectionOpen, setMaterialsSectionOpen] = useState(true);
  const pendingSelectLastLessonRef = useRef(false);
  const pendingSelectLastMaterialRef = useRef(false);
  const preserveLessonIdRef = useRef(null);
  const prevNodeCountRef = useRef(nodesNormal.length);
  const activeLessonIndexRef = useRef(0);
  const activeMaterialIndexRef = useRef(0);
  const appliedFocusKeyRef = useRef('');
  const materialAnchorRef = useRef(null);
  const materialCollapseSentinelRef = useRef(null);
  const scrollRafRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const upperCompactAppliedRef = useRef(false);

  const chapterSectionOpen = tabMode && chapterSectionOpenProp !== undefined
    ? chapterSectionOpenProp
    : chapterSectionOpenInternal;

  const chapterSectionOpenRef = useRef(chapterSectionOpen);
  const lessonSectionOpenRef = useRef(lessonSectionOpen);

  useEffect(() => {
    chapterSectionOpenRef.current = chapterSectionOpen;
  }, [chapterSectionOpen]);

  useEffect(() => {
    lessonSectionOpenRef.current = lessonSectionOpen;
  }, [lessonSectionOpen]);

  const collapseUpperSections = useCallback(() => {
    if (!tabMode) return;
    if (chapterSectionOpenRef.current) onChapterSectionOpenChange?.(false);
    if (lessonSectionOpenRef.current) setLessonSectionOpen(false);
    upperCompactAppliedRef.current = true;
  }, [tabMode, onChapterSectionOpenChange]);

  const hasLessonErrorById = useMemo(() => {
    const map = {};
    for (const node of nodesNormal) {
      map[node.tempId] = Boolean(errors.nodes?.[node.tempId]);
    }
    return map;
  }, [errors.nodes, nodesNormal]);

  const hasLessonContentById = useMemo(() => {
    const map = {};
    for (const node of nodesNormal) {
      map[node.tempId] = lessonHasContent(node);
    }
    return map;
  }, [nodesNormal]);

  useEffect(() => {
    if (nodesNormal.length === 0) {
      setActiveLessonId(null);
      prevNodeCountRef.current = 0;
      return;
    }

    const prevCount = prevNodeCountRef.current;
    const nextCount = nodesNormal.length;
    prevNodeCountRef.current = nextCount;

    if (preserveLessonIdRef.current) {
      const preservedId = preserveLessonIdRef.current;
      preserveLessonIdRef.current = null;
      if (nodesNormal.some((n) => n.tempId === preservedId)) {
        setActiveLessonId(preservedId);
        return;
      }
    }

    if (pendingSelectLastLessonRef.current && nextCount > prevCount) {
      setActiveLessonId(nodesNormal[nextCount - 1].tempId);
      pendingSelectLastLessonRef.current = false;
      return;
    }

    const stillExists = activeLessonId != null
      && nodesNormal.some((n) => n.tempId === activeLessonId);
    if (!stillExists) {
      const nextIdx = Math.max(0, activeLessonIndexRef.current - 1);
      setActiveLessonId(nodesNormal[Math.min(nextIdx, nodesNormal.length - 1)]?.tempId ?? null);
    }
  }, [nodesNormal, activeLessonId]);

  useEffect(() => {
    if (!focusLessonId) return;
    const focusKey = `${focusLessonId}:${focusMaterialId ?? ''}`;
    if (appliedFocusKeyRef.current === focusKey) return;
    appliedFocusKeyRef.current = focusKey;
    setActiveLessonId(focusLessonId);
    setLessonSectionOpen(true);
    if (focusMaterialId) {
      setActiveMaterialId(focusMaterialId);
      setMaterialsSectionOpen(true);
    }
  }, [focusLessonId, focusMaterialId]);

  const activeLessonIndex = nodesNormal.findIndex((n) => n.tempId === activeLessonId);
  const activeLesson = activeLessonIndex >= 0 ? nodesNormal[activeLessonIndex] : null;
  const activeMaterials = filterLearningMaterials(activeLesson?.Materials ?? activeLesson?.materials ?? []);
  const activeNodeDirty = Boolean(
    showNodeUpdate
    && activeLesson
    && !isNodeSnapshotSaved(path, activeLesson.tempId, savedPathSnapshot),
  );
  const updatingActiveNode = Boolean(
    activeLesson && updatingNodeKey === `${path.tempId}:${activeLesson.tempId}`,
  );

  useEffect(() => {
    if (activeLessonIndex >= 0) activeLessonIndexRef.current = activeLessonIndex;
  }, [activeLessonIndex]);

  const hasMaterialErrorById = useMemo(() => {
    const map = {};
    if (!activeLesson) return map;
    const lessonErrors = errors.nodes?.[activeLesson.tempId]?.materials ?? {};
    for (const material of activeMaterials) {
      map[material.tempId] = Boolean(lessonErrors[material.tempId]);
    }
    return map;
  }, [activeLesson, activeMaterials, errors.nodes]);

  const hasMaterialContentById = useMemo(() => {
    const map = {};
    for (const material of activeMaterials) {
      map[material.tempId] = materialHasContent(material);
    }
    return map;
  }, [activeMaterials]);

  useEffect(() => {
    if (pendingSelectLastMaterialRef.current && activeMaterials.length > 0) {
      setActiveMaterialId(activeMaterials[activeMaterials.length - 1].tempId);
      pendingSelectLastMaterialRef.current = false;
      return;
    }
    if (activeMaterials.length === 0) {
      setActiveMaterialId(null);
      return;
    }
    const stillExists = activeMaterials.some((m) => m.tempId === activeMaterialId);
    if (!stillExists) {
      const nextIdx = Math.max(0, activeMaterialIndexRef.current - 1);
      setActiveMaterialId(
        activeMaterials[Math.min(nextIdx, activeMaterials.length - 1)]?.tempId ?? null,
      );
    }
  }, [activeMaterials, activeMaterialId]);

  const activeMaterialIndex = activeMaterials.findIndex((m) => m.tempId === activeMaterialId);
  const activeMaterial = activeMaterialIndex >= 0 ? activeMaterials[activeMaterialIndex] : null;

  useEffect(() => {
    if (activeMaterialIndex >= 0) activeMaterialIndexRef.current = activeMaterialIndex;
  }, [activeMaterialIndex]);

  const handleNodeDelete = useCallback((nodeTempId) => {
    if (nodeTempId === activeLessonId) {
      const idx = nodesNormal.findIndex((n) => n.tempId === nodeTempId);
      const remaining = nodesNormal.filter((n) => n.tempId !== nodeTempId);
      const nextIdx = Math.max(0, idx - 1);
      setActiveLessonId(remaining[nextIdx]?.tempId ?? null);
      setActiveMaterialId(null);
    }
    onNodeDelete(path.tempId, nodeTempId);
  }, [activeLessonId, nodesNormal, onNodeDelete, path.tempId]);

  const handleMaterialDelete = useCallback((nodeTempId, materialTempId) => {
    if (nodeTempId === activeLessonId && materialTempId === activeMaterialId) {
      const materials = filterLearningMaterials(
        activeLesson?.Materials ?? activeLesson?.materials ?? [],
      );
      const idx = materials.findIndex((m) => m.tempId === materialTempId);
      const remaining = materials.filter((m) => m.tempId !== materialTempId);
      const nextIdx = Math.max(0, idx - 1);
      setActiveMaterialId(remaining[nextIdx]?.tempId ?? null);
    }
    onMaterialDelete(path.tempId, nodeTempId, materialTempId);
  }, [activeLesson, activeLessonId, activeMaterialId, onMaterialDelete, path.tempId]);

  useEffect(() => {
    if (!chapterSectionOpen && !lessonSectionOpen) return;
    const sentinel = materialCollapseSentinelRef.current;
    if (!sentinel) return;
    const stickyTop = BUILDER_STICKY_MATERIAL_TABS_ONLY_TOP;
    if (sentinel.getBoundingClientRect().top <= stickyTop + 8) {
      upperCompactAppliedRef.current = false;
    }
  }, [chapterSectionOpen, lessonSectionOpen]);

  useEffect(() => {
    if (!tabMode || !activeLesson) return undefined;

    const stickyTop = BUILDER_STICKY_MATERIAL_TABS_ONLY_TOP;

    const maybeCompactOnMaterialReach = (scrollingDown = true) => {
      const sentinel = materialCollapseSentinelRef.current;
      if (!sentinel) return;

      const sentinelTop = sentinel.getBoundingClientRect().top;
      const reachedMaterialTabs = sentinelTop <= stickyTop + 4;

      if (!reachedMaterialTabs) {
        if (sentinelTop > stickyTop + 16) {
          upperCompactAppliedRef.current = false;
        }
        return;
      }

      if (!scrollingDown) return;

      if (upperCompactAppliedRef.current) return;

      const chapterOpen = chapterSectionOpenRef.current;
      const lessonOpen = lessonSectionOpenRef.current;
      if (!chapterOpen && !lessonOpen) {
        upperCompactAppliedRef.current = true;
        return;
      }

      collapseUpperSections();
    };

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        const nextY = window.scrollY;
        const scrollingDown = nextY >= lastScrollYRef.current;
        lastScrollYRef.current = nextY;
        maybeCompactOnMaterialReach(scrollingDown);
      });
    };

    let observer;
    const attachObserver = () => {
      const el = materialCollapseSentinelRef.current;
      if (!el || observer) return;
      observer = new IntersectionObserver(
        () => {
          const nextY = window.scrollY;
          const scrollingDown = nextY >= lastScrollYRef.current;
          lastScrollYRef.current = nextY;
          maybeCompactOnMaterialReach(scrollingDown);
        },
        {
          root: null,
          rootMargin: `-${stickyTop}px 0px 0px 0px`,
          threshold: [0, 1],
        },
      );
      observer.observe(el);
    };

    lastScrollYRef.current = window.scrollY;
    attachObserver();
    const attachRaf = requestAnimationFrame(attachObserver);
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();

    return () => {
      cancelAnimationFrame(attachRaf);
      observer?.disconnect();
      document.removeEventListener('scroll', onScroll, { capture: true });
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [tabMode, activeLesson, activeMaterials.length, collapseUpperSections]);

  const handleAddLesson = () => {
    pendingSelectLastLessonRef.current = true;
    onAddNode();
  };

  const handleAddMaterial = () => {
    if (!activeLesson) return;
    preserveLessonIdRef.current = activeLesson.tempId;
    pendingSelectLastMaterialRef.current = true;
    onAddMaterial(path.tempId, activeLesson.tempId);
  };

  const renderMaterialsTabPanel = () => {
    if (!activeLesson) return null;

    const panelSx = tabMode
      ? { scrollMarginTop: BUILDER_SCROLL_MARGIN_MATERIAL, pt: 2, pb: 2.5 }
      : {
          ...BUILDER_PANEL_SX,
          borderRadius: activeMaterials.length > 0 ? '0 0 10px 10px' : '10px',
          borderTop: activeMaterials.length > 0 ? '1px solid rgba(15,23,42,0.08)' : undefined,
          minHeight: activeMaterials.length > 0 ? 120 : 72,
          scrollMarginTop: BUILDER_SCROLL_MARGIN_MATERIAL,
        };

    return (
      <Box sx={panelSx}>
        {activeMaterial ? (
          <MentorMaterialRow
            key={activeMaterial.tempId}
            material={activeMaterial}
            materialIndex={activeMaterialIndex}
            errors={errors.nodes?.[activeLesson.tempId]?.materials?.[activeMaterial.tempId] ?? {}}
            onChange={(materialTempId, patch) =>
              onMaterialChange(path.tempId, activeLesson.tempId, materialTempId, patch)
            }
            onDelete={(materialTempId) =>
              handleMaterialDelete(activeLesson.tempId, materialTempId)
            }
            disabled={disabled}
            courseId={courseId}
            chapterId={chapterId}
            tabMode
            hideDelete
          />
        ) : (
          <Box sx={{ py: 2, px: 0 }}>
            <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              Bài học này chưa có học liệu. Nhấn + trên thanh tab để thêm.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderMaterialsZoneTabMode = () => {
    if (!activeLesson) {
      return (
        <Typography sx={{ mt: 2.5, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          Thêm bài học để gắn học liệu.
        </Typography>
      );
    }

    return (
      <Box
        ref={materialAnchorRef}
        sx={{
          mt: chapterSectionOpen || lessonSectionOpen ? 2.5 : 0,
          scrollMarginTop: BUILDER_STICKY_MATERIAL_TABS_ONLY_TOP,
        }}
      >
        <Box
          ref={materialCollapseSentinelRef}
          aria-hidden
          sx={{ height: 0, width: '100%', pointerEvents: 'none' }}
        />
        <Box
          sx={(theme) => ({
            ...materialPinnedRailStickySx(BUILDER_STICKY_MATERIAL_TABS_ONLY_TOP, 30),
            ...breakoutBodyPaddingSx()(theme),
          })}
        >
          <MentorMaterialTabs
            materials={activeMaterials}
            activeId={activeMaterialId}
            onChange={setActiveMaterialId}
            onAdd={handleAddMaterial}
            disabled={disabled}
            hasErrorById={hasMaterialErrorById}
            hasContentById={hasMaterialContentById}
            trailingActions={
              <MentorSectionTabToggle
                label="Học liệu"
                expanded={materialsSectionOpen}
                onToggle={() => setMaterialsSectionOpen((v) => !v)}
              />
            }
          />
          {activeMaterial ? (
            <MentorSectionToolbar
              hasContent={materialHasContent(activeMaterial)}
              summary={getMaterialToolbarSummary(activeMaterial)}
              actions={
                <IconButton
                  size="small"
                  onClick={() =>
                    handleMaterialDelete(activeLesson.tempId, activeMaterial.tempId)
                  }
                  disabled={disabled}
                  aria-label="Xóa học liệu"
                  sx={DELETE_ICON_BTN_SX}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              }
              sx={{ borderBottom: 'none' }}
            />
          ) : null}
        </Box>
        <Collapse in={materialsSectionOpen}>
          {renderMaterialsTabPanel()}
        </Collapse>
      </Box>
    );
  };

  const renderMaterialsBody = () => {
    if (!activeLesson) {
      return (
        <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55, px: 0, py: 0.5 }}>
          Thêm bài học để gắn học liệu.
        </Typography>
      );
    }

    if (tabMode) {
      return renderMaterialsTabPanel();
    }

    return (
      <>
        <MentorMaterialTabs
          materials={activeMaterials}
          activeId={activeMaterialId}
          onChange={setActiveMaterialId}
          onAdd={handleAddMaterial}
          disabled={disabled}
          hasErrorById={hasMaterialErrorById}
          hasContentById={hasMaterialContentById}
        />
        <Box
          sx={{
            ...BUILDER_PANEL_SX,
            borderRadius: '0 0 10px 10px',
            borderTop: '1px solid rgba(15,23,42,0.08)',
            minHeight: activeMaterials.length > 0 ? 120 : 72,
          }}
        >
          {activeMaterial ? (
            <MentorMaterialRow
              key={activeMaterial.tempId}
              material={activeMaterial}
              materialIndex={activeMaterialIndex}
              errors={errors.nodes?.[activeLesson.tempId]?.materials?.[activeMaterial.tempId] ?? {}}
              onChange={(materialTempId, patch) =>
                onMaterialChange(path.tempId, activeLesson.tempId, materialTempId, patch)
              }
              onDelete={(materialTempId) =>
                handleMaterialDelete(activeLesson.tempId, materialTempId)
              }
              disabled={disabled}
              courseId={courseId}
              chapterId={chapterId}
              tabMode
            />
          ) : (
            <Box sx={{ px: 2, py: 2.5 }}>
              <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
                Bài học này chưa có học liệu. Nhấn + trên thanh tab để thêm.
              </Typography>
            </Box>
          )}
        </Box>
      </>
    );
  };

  const renderMaterialsSection = () => renderMaterialsBody();

  const renderLessonMaterialStickyRail = () => (
    <>
      <MentorLessonTabs
        nodes={nodesNormal}
        activeId={activeLessonId}
        onChange={setActiveLessonId}
        onAdd={handleAddLesson}
        disabled={disabled}
        hasErrorById={hasLessonErrorById}
        hasContentById={hasLessonContentById}
        trailingActions={
          <MentorSectionTabToggle
            label="Bài học"
            expanded={lessonSectionOpen}
            onToggle={() => setLessonSectionOpen((v) => !v)}
          />
        }
      />
      {activeLesson ? (
        <MentorSectionToolbar
          hasContent={lessonHasContent(activeLesson)}
          summary={`Bài ${activeLessonIndex + 1} · ${activeMaterials.length} học liệu`}
          actions={
            <IconButton
              size="small"
              onClick={() => handleNodeDelete(activeLesson.tempId)}
              disabled={disabled}
              aria-label="Xóa bài học"
              sx={DELETE_ICON_BTN_SX}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          }
        />
      ) : null}
    </>
  );

  const renderNodeUpdateBar = () => {
    if (!showNodeUpdate || !activeLesson) return null;

    const needsPathFirst = !path.PathId;

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mt: 2,
          p: 1.25,
          borderRadius: '12px',
          bgcolor: activeNodeDirty ? 'rgba(245,158,11,0.08)' : 'rgba(15,23,42,0.03)',
          border: `1px solid ${activeNodeDirty ? 'rgba(245,158,11,0.22)' : 'rgba(15,23,42,0.06)'}`,
        }}
      >
        <Typography sx={{ fontSize: 12, color: activeNodeDirty ? '#92400E' : MUTED, lineHeight: 1.5 }}>
          {needsPathFirst
            ? 'Cập nhật path trước khi lưu bài học này.'
            : activeNodeDirty
              ? 'Bài học và học liệu chưa lưu.'
              : 'Bài học đã đồng bộ.'}
        </Typography>
        <AppButton
          startIcon={<SaveOutlinedIcon />}
          onClick={() => onUpdateNode?.(activeLesson.tempId)}
          disabled={disabled || updatingActiveNode || !activeNodeDirty || needsPathFirst}
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
          {updatingActiveNode ? 'Đang cập nhật...' : 'Cập nhật Node'}
        </AppButton>
      </Box>
    );
  };

  const renderLessonsSection = () => (
    <Box sx={{ mt: 0 }}>
      {errors._nodes && (
        <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 1 }}>
          {errors._nodes}
        </Typography>
      )}

      {tabMode ? (
        <Collapse in={lessonSectionOpen} unmountOnExit collapsedSize={0}>
          <Box sx={{ mt: 2.5, scrollMarginTop: BUILDER_SCROLL_MARGIN_TOP }}>
            {activeLesson ? (
              <MentorLessonBlock
                key={activeLesson.tempId}
                node={activeLesson}
                nodeIndex={activeLessonIndex}
                errors={errors.nodes?.[activeLesson.tempId] ?? {}}
                tabMode
                fieldsOnly
                showDelete={false}
                onChange={onNodeChange}
                onDelete={() => handleNodeDelete(activeLesson.tempId)}
                disabled={disabled}
              />
            ) : (
              <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
                Chương này chưa có bài học. Nhấn + trên thanh tab để thêm.
              </Typography>
            )}
          </Box>
        </Collapse>
      ) : (
        <>
          <Typography sx={{ ...CONTENT_SECTION_LABEL_SX, mt: 0, mb: 1.25 }}>Bài học</Typography>
          {lessonCount === 0 ? (
            <Typography sx={{ fontSize: 13, color: MUTED, mb: 1.5, lineHeight: 1.55 }}>
              Chương này chưa có bài học.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 1.5 }}>
              {nodesNormal.map((node, nodeIndex) => (
                <MentorLessonBlock
                  key={node.tempId}
                  node={node}
                  nodeIndex={nodeIndex}
                  courseId={courseId}
                  chapterId={chapterId}
                  errors={errors.nodes?.[node.tempId] ?? {}}
                  expanded={expandedNodes[node.tempId] !== false}
                  onToggle={() => onToggleNode(node.tempId)}
                  onChange={onNodeChange}
                  onDelete={() => handleNodeDelete(node.tempId)}
                  onAddMaterial={() => onAddMaterial(path.tempId, node.tempId)}
                  onMaterialChange={(materialTempId, patch) =>
                    onMaterialChange(path.tempId, node.tempId, materialTempId, patch)
                  }
                  onMaterialDelete={(materialTempId) =>
                    handleMaterialDelete(node.tempId, materialTempId)
                  }
                  onMaterialReorder={(fromIndex, toIndex) =>
                    onMaterialReorder(path.tempId, node.tempId, fromIndex, toIndex)
                  }
                  disabled={disabled}
                />
              ))}
            </Box>
          )}
          <Box
            component="button"
            type="button"
            onClick={onAddNode}
            disabled={disabled}
            sx={{
              ...contentAddButtonSx(),
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 18 }} />
            Thêm bài học
          </Box>
        </>
      )}
    </Box>
  );

  const actionBar = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.5,
        px: 2,
        py: 1.25,
        minHeight: BUILDER_CHAPTER_BAR_HEIGHT,
        boxSizing: 'border-box',
        borderBottom: tabMode ? '1px solid rgba(15,23,42,0.06)' : 'none',
      }}
    >
      {tabMode ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 'auto', minWidth: 0 }}>
          <ContentStatusIcon hasContent={hasContent} size={16} />
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: MUTED }}>
            Chương {pathIndex + 1} · {lessonCount} bài học
            <Box component="span" sx={{ color: hasContent ? '#059669' : '#94A3B8', ml: 0.75 }}>
              · {hasContent ? 'Đã có nội dung' : 'Chưa có nội dung'}
            </Box>
          </Typography>
        </Box>
      ) : null}
      {onQuizSetup ? (
        <MentorChapterCardMenu
          disabled={disabled}
          quizSetupDisabled={quizSetupDisabled}
          quizSetupDisabledReason={quizSetupDisabledReason}
          onQuizSetup={onQuizSetup}
        />
      ) : null}
      <PathChapterActions
        path={path}
        onChange={onChange}
        onDeleteNewPath={onDeleteNewPath}
        disabled={disabled}
      />
    </Box>
  );

  const body = (
    <Box
      sx={{
        px: 2,
        pt: tabMode && !chapterSectionOpen ? 0 : 2.5,
        pb: 2.5,
      }}
    >
      {tabMode ? (
        <Collapse in={chapterSectionOpen} unmountOnExit collapsedSize={0}>
          <Box sx={{ scrollMarginTop: BUILDER_STICKY_ACTION_BAR_TOP + 8 }}>
            <ContentFieldLabel>Tên chương *</ContentFieldLabel>
            <Box sx={contentFieldSx(Boolean(errors.PathName), CHAPTER_THEME)}>
              <InputBase
                value={path.PathName}
                onChange={(event) => onChange(path.tempId, { PathName: event.target.value })}
                disabled={disabled}
                placeholder="Ví dụ: TOEIC 900+: Chiến lược cao điểm"
                fullWidth
                sx={contentInputInnerSx}
              />
            </Box>
            {errors.PathName && (
              <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}>
                {errors.PathName}
              </Typography>
            )}

            <ContentShortDescriptionField
              label="Mô tả ngắn"
              value={path.Description}
              onChange={(event) => onChange(path.tempId, { Description: event.target.value })}
              disabled={disabled}
              theme={CHAPTER_THEME}
              placeholder="Mô tả ngắn về nội dung chương (tuỳ chọn)"
              labelSx={{ mt: 2 }}
            />
          </Box>
        </Collapse>
      ) : (
        <>
          <ContentFieldLabel>Tên chương *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.PathName), CHAPTER_THEME)}>
            <InputBase
              value={path.PathName}
              onChange={(event) => onChange(path.tempId, { PathName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: TOEIC 900+: Chiến lược cao điểm"
              fullWidth
              sx={contentInputInnerSx}
            />
          </Box>
          {errors.PathName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}>
              {errors.PathName}
            </Typography>
          )}

          <ContentShortDescriptionField
            label="Mô tả ngắn"
            value={path.Description}
            onChange={(event) => onChange(path.tempId, { Description: event.target.value })}
            disabled={disabled}
            theme={CHAPTER_THEME}
            placeholder="Mô tả ngắn về nội dung chương (tuỳ chọn)"
            labelSx={{ mt: 2 }}
          />
        </>
      )}

      {tabMode ? (
        <Box
          sx={(theme) => ({
            ...breakoutBodyPaddingSx()(theme),
            mt: chapterSectionOpen ? 2.5 : 0,
            borderBottom: '1px solid rgba(15,23,42,0.06)',
          })}
        >
          {renderLessonMaterialStickyRail()}
        </Box>
      ) : null}

      {renderLessonsSection()}

      {tabMode ? renderMaterialsZoneTabMode() : null}

      {tabMode ? renderNodeUpdateBar() : null}

          {showSave ? (
            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid rgba(15,23,42,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {isSaved ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#059669', flexShrink: 0 }} />
                ) : (
                  <CloudOffOutlinedIcon sx={{ fontSize: 17, color: MUTED, flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isSaved ? '#059669' : MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {isSaved ? 'Chương đã lưu' : 'Chưa lưu'}
                </Typography>
              </Box>

              <AppButton
                variant="outlined"
                onClick={onSave}
                loading={saving}
                disabled={disabled}
                sx={{
                  height: 36,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  borderColor: 'rgba(15,23,42,0.12)',
                  color: TEXT,
                  '&:hover': {
                    borderColor: PRIMARY,
                    bgcolor: 'rgba(8,145,178,0.04)',
                  },
                }}
              >
                Lưu chương
              </AppButton>
            </Box>
          ) : null}
    </Box>
  );

  if (tabMode) {
    return (
      <Box data-content-error={`chapter-${path.tempId}`}>
        {actionBar}
        {body}
      </Box>
    );
  }

  return (
    <Box sx={chapterCardSx(expanded)} data-content-error={`chapter-${path.tempId}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: expanded ? `1px solid rgba(15,23,42,0.06)` : 'none',
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={ICON_BTN_SX} aria-label="Thu gọn chương">
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <MenuBookRoundedIcon sx={{ fontSize: 20, color: PRIMARY, flexShrink: 0 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>
            Chương {pathIndex + 1}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {path.PathName || 'Chưa đặt tên chương'}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 12, fontWeight: 500, color: MUTED, flexShrink: 0 }}>
          {lessonCount} bài học
        </Typography>

        {onQuizSetup ? (
          <MentorChapterCardMenu
            disabled={disabled}
            quizSetupDisabled={quizSetupDisabled}
            quizSetupDisabledReason={quizSetupDisabledReason}
            onQuizSetup={onQuizSetup}
          />
        ) : null}

        <PathChapterActions
          path={path}
          onChange={onChange}
          onDeleteNewPath={onDeleteNewPath}
          disabled={disabled}
        />
      </Box>

      <Collapse in={expanded}>
        {body}
      </Collapse>
    </Box>
  );
}
