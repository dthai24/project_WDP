import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import MentorCourseContentBuilder from '@/features/mentor/components/course/MentorCourseContentBuilder';
import MentorContentOverview from '@/features/mentor/components/course/MentorContentOverview';
import MentorCourseContentFooterActions, {
  COURSE_CONTENT_MOBILE_FOOTER_ID,
} from '@/features/mentor/components/course/MentorCourseContentFooterActions';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorCourseCreateStepIndicator from '@/features/mentor/components/course/MentorCourseCreateStepIndicator';
import MentorCourseLeaveDialog from '@/features/mentor/components/course/MentorCourseLeaveDialog';
import MentorChapterDraftDialog from '@/features/mentor/components/course/MentorChapterDraftDialog';
import { useMentorCourseLeaveGuard } from '@/features/mentor/hooks/useMentorCourseLeaveGuard';
import { saveCreateCourseContent } from '@/features/mentor/services/mentorCourseService';
import { uploadPendingMaterialsInPaths } from '@/features/mentor/utils/mentorMaterialUploadUtils';
import { getUser } from '@/features/auth/utils/authUtils';
import {
  createEmptyMaterial,
  createEmptyNode,
  createEmptyPath,
  chapterHasContent,
  lessonHasContent,
  materialHasContent,
  hasContentValidationErrors,
  getFirstContentErrorTarget,
  parseContentFocusTarget,
  validateCourseContent,
  validatePathForSave,
  serializePathSnapshot,
  isPathSnapshotSaved,
  withNormalizedOrders,
  reorderMaterials,
  scrollToContentItem,
  MATERIAL_TYPE_LABELS,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import { loadCreateCourseDraft } from '@/features/mentor/utils/mentorCourseCreateStorage';

function getDeleteDialogContent(deleteConfirm) {
  if (!deleteConfirm) {
    return { title: 'Xác nhận', message: '' };
  }

  if (deleteConfirm.type === 'chapter') {
    return {
      title: 'Xóa chương?',
      message: `Bạn có chắc muốn xóa "${deleteConfirm.label}"? Toàn bộ bài học và học liệu trong chương sẽ bị xóa.`,
    };
  }

  if (deleteConfirm.type === 'lesson') {
    return {
      title: 'Xóa bài học?',
      message: `Bạn có chắc muốn xóa "${deleteConfirm.label}"? Toàn bộ học liệu trong bài học sẽ bị xóa.`,
    };
  }

  return {
    title: 'Xóa học liệu?',
    message: `Bạn có chắc muốn xóa "${deleteConfirm.label}"? Nội dung học liệu sẽ bị xóa vĩnh viễn.`,
  };
}

function LeaveAwareBreadcrumbLink({ to, children, onNavigate, sx }) {
  return (
    <MuiLink
      component="button"
      type="button"
      underline="hover"
      onClick={() => onNavigate(to)}
      sx={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        font: 'inherit',
        p: 0,
        ...sx,
      }}
    >
      {children}
    </MuiLink>
  );
}

function updatePathInList(paths, pathTempId, patch) {
  return paths.map((path) =>
    path.tempId === pathTempId ? { ...path, ...patch } : path,
  );
}

function updateNodeInPath(paths, pathTempId, nodeTempId, patch) {
  return paths.map((path) => {
    if (path.tempId !== pathTempId) return path;
    return {
      ...path,
      nodes: (path.nodes ?? path.Nodes ?? []).map((node) =>
        node.tempId === nodeTempId ? { ...node, ...patch } : node,
      ),
    };
  });
}

function updateMaterialInPath(paths, pathTempId, nodeTempId, materialTempId, patch) {
  return paths.map((path) => {
    if (path.tempId !== pathTempId) return path;
    return {
      ...path,
      nodes: (path.nodes ?? path.Nodes ?? []).map((node) => {
        if (node.tempId !== nodeTempId) return node;
        return {
          ...node,
          materials: (node.materials ?? node.Materials ?? []).map((material) =>
            material.tempId === materialTempId ? { ...material, ...patch } : material,
          ),
        };
      }),
    };
  });
}

export default function MentorCreateCourseContentPage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [paths, setPaths] = useState([]);
  const [ready, setReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ root: [], paths: {} });
  const [expandedPaths, setExpandedPaths] = useState({});
  const [expandedNodes, setExpandedNodes] = useState({});
  const [savedPathSnapshots, setSavedPathSnapshots] = useState({});
  const [isCourseContentDraftSaved, setIsCourseContentDraftSaved] = useState(false);
  const [savingChapterId, setSavingChapterId] = useState(null);
  const [chapterDraftDialogOpen, setChapterDraftDialogOpen] = useState(false);
  const [pendingChapterTempId, setPendingChapterTempId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const instructorId = getUser()?.userId ?? null;
  const courseName = course?.CourseName ?? '';

  const isDirty = useMemo(
    () => paths.some((path) => !isPathSnapshotSaved(path, savedPathSnapshots[path.tempId])),
    [paths, savedPathSnapshots],
  );

  const buildPathSnapshots = useCallback((nextPaths) => {
    const snapshots = {};
    nextPaths.forEach((path) => {
      snapshots[path.tempId] = serializePathSnapshot(path);
    });
    return snapshots;
  }, []);

  const persistDraft = useCallback(async ({ markAllSaved = true } = {}) => {
    if (!course) return;
    await saveCreateCourseContent(course, paths);
    setIsCourseContentDraftSaved(true);
    if (markAllSaved) {
      setSavedPathSnapshots(buildPathSnapshots(paths));
    }
  }, [buildPathSnapshots, course, paths]);

  const {
    dialogOpen,
    saving,
    requestLeave,
    handleStay,
    handleDiscard,
    handleSaveDraft,
  } = useMentorCourseLeaveGuard({
    isDirty,
    form: {},
    instructorId,
    onPersistDraft: persistDraft,
  });

  useEffect(() => {
    const draft = loadCreateCourseDraft();
    if (!draft?.course) {
      toast.error('Vui lòng hoàn thành thông tin cơ bản trước.');
      navigate('/mentor/courses/create', { replace: true });
      return;
    }

    const loadedPaths = withNormalizedOrders(draft.paths ?? []);
    const snapshots = {};
    loadedPaths.forEach((path) => {
      snapshots[path.tempId] = serializePathSnapshot(path);
    });

    setCourse(draft.course);
    setPaths(loadedPaths);
    setSavedPathSnapshots(snapshots);
    setIsCourseContentDraftSaved(
      Boolean(draft.meta?.contentDraftSaved) || loadedPaths.length > 0,
    );
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!isDirty) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const applyPaths = useCallback((updater) => {
    setPaths((prev) => withNormalizedOrders(updater(prev)));
    setValidationErrors({ root: [], paths: {} });
  }, []);

  const handleNavigateToContent = useCallback((target) => {
    setFocusTarget(target);
    scrollToContentItem(target, { setExpandedPaths, setExpandedNodes });
  }, []);

  const handleAddPath = () => {
    const newPath = createEmptyPath();
    applyPaths((prev) => [...prev, newPath]);
    setExpandedPaths((prev) => ({ ...prev, [newPath.tempId]: true }));
  };

  const handlePathChange = (pathTempId, patch) => {
    applyPaths((prev) => updatePathInList(prev, pathTempId, patch));
  };

  const handlePathDelete = (pathTempId) => {
    applyPaths((prev) => prev.filter((path) => path.tempId !== pathTempId));
    setSavedPathSnapshots((prev) => {
      const next = { ...prev };
      delete next[pathTempId];
      return next;
    });
    setExpandedPaths((prev) => {
      const next = { ...prev };
      delete next[pathTempId];
      return next;
    });
  };

  const requestDeletePath = (pathTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    if (!path) return;
    if (!chapterHasContent(path)) {
      handlePathDelete(pathTempId);
      return;
    }
    const label = String(path?.PathName ?? '').trim() || 'Chương này';
    setDeleteConfirm({ type: 'chapter', pathTempId, label });
  };

  const requestDeleteNode = (pathTempId, nodeTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    const node = (path?.nodes ?? []).find((item) => item.tempId === nodeTempId);
    if (!node) return;
    if (!lessonHasContent(node)) {
      handleNodeDelete(pathTempId, nodeTempId);
      return;
    }
    const label = String(node?.NodeName ?? '').trim() || 'Bài học này';
    setDeleteConfirm({ type: 'lesson', pathTempId, nodeTempId, label });
  };

  const requestDeleteMaterial = (pathTempId, nodeTempId, materialTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    const node = (path?.nodes ?? []).find((item) => item.tempId === nodeTempId);
    const material = (node?.materials ?? []).find((item) => item.tempId === materialTempId);
    if (!material) return;
    if (!materialHasContent(material)) {
      handleMaterialDelete(pathTempId, nodeTempId, materialTempId);
      return;
    }
    const title = String(material?.Title ?? '').trim();
    const typeLabel = MATERIAL_TYPE_LABELS[material?.MaterialType] ?? 'Học liệu';
    const label = title || `${typeLabel} này`;
    setDeleteConfirm({
      type: 'material',
      pathTempId,
      nodeTempId,
      materialTempId,
      label,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'chapter') {
      handlePathDelete(deleteConfirm.pathTempId);
    } else if (deleteConfirm.type === 'lesson') {
      handleNodeDelete(deleteConfirm.pathTempId, deleteConfirm.nodeTempId);
    } else {
      handleMaterialDelete(
        deleteConfirm.pathTempId,
        deleteConfirm.nodeTempId,
        deleteConfirm.materialTempId,
      );
    }

    setDeleteConfirm(null);
  };

  const handleAddNode = (pathTempId) => {
    const newNode = createEmptyNode();
    applyPaths((prev) =>
      prev.map((path) =>
        path.tempId === pathTempId
          ? { ...path, nodes: [...(path.nodes ?? []), newNode] }
          : path,
      ),
    );
    setExpandedNodes((prev) => ({ ...prev, [newNode.tempId]: true }));
  };

  const handleNodeChange = (pathTempId, nodeTempId, patch) => {
    applyPaths((prev) => updateNodeInPath(prev, pathTempId, nodeTempId, patch));
  };

  const handleNodeDelete = (pathTempId, nodeTempId) => {
    applyPaths((prev) =>
      prev.map((path) =>
        path.tempId === pathTempId
          ? { ...path, nodes: (path.nodes ?? []).filter((node) => node.tempId !== nodeTempId) }
          : path,
      ),
    );
    setExpandedNodes((prev) => {
      const next = { ...prev };
      delete next[nodeTempId];
      return next;
    });
  };

  const handleAddMaterial = (pathTempId, nodeTempId) => {
    const newMaterial = createEmptyMaterial();
    applyPaths((prev) =>
      prev.map((path) => {
        if (path.tempId !== pathTempId) return path;
        return {
          ...path,
          nodes: (path.nodes ?? []).map((node) =>
            node.tempId === nodeTempId
              ? { ...node, materials: [...(node.materials ?? []), newMaterial] }
              : node,
          ),
        };
      }),
    );
  };

  const handleMaterialChange = (pathTempId, nodeTempId, materialTempId, patch) => {
    applyPaths((prev) =>
      updateMaterialInPath(prev, pathTempId, nodeTempId, materialTempId, patch),
    );
  };

  const handleMaterialDelete = (pathTempId, nodeTempId, materialTempId) => {
    applyPaths((prev) =>
      prev.map((path) => {
        if (path.tempId !== pathTempId) return path;
        return {
          ...path,
          nodes: (path.nodes ?? []).map((node) =>
            node.tempId === nodeTempId
              ? {
                ...node,
                materials: (node.materials ?? []).filter(
                  (material) => material.tempId !== materialTempId,
                ),
              }
              : node,
          ),
        };
      }),
    );
  };

  const handleMaterialReorder = (pathTempId, nodeTempId, fromIndex, toIndex) => {
    applyPaths((prev) =>
      prev.map((path) => {
        if (path.tempId !== pathTempId) return path;
        return {
          ...path,
          nodes: (path.nodes ?? []).map((node) => {
            if (node.tempId !== nodeTempId) return node;
            return {
              ...node,
              materials: reorderMaterials(node.materials ?? [], fromIndex, toIndex),
            };
          }),
        };
      }),
    );
  };

  const executeChapterSave = async (pathTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    if (!path) return false;

    const pathErrors = validatePathForSave(path);
    if (pathErrors.PathName) {
      setValidationErrors((prev) => ({
        ...prev,
        paths: {
          ...(prev.paths ?? {}),
          [pathTempId]: {
            ...(prev.paths?.[pathTempId] ?? {}),
            ...pathErrors,
          },
        },
      }));
      toast.error(pathErrors.PathName);
      return false;
    }

    setSavingChapterId(pathTempId);
    try {
      await persistDraft({ markAllSaved: false });
      setSavedPathSnapshots((prev) => ({
        ...prev,
        [pathTempId]: serializePathSnapshot(path),
      }));
      toast.success('Đã lưu chương.');
      return true;
    } finally {
      setSavingChapterId(null);
    }
  };

  const handleSaveChapter = (pathTempId) => {
    if (!isCourseContentDraftSaved) {
      setPendingChapterTempId(pathTempId);
      setChapterDraftDialogOpen(true);
      return;
    }

    void executeChapterSave(pathTempId);
  };

  const handleChapterDraftDialogSave = async () => {
    if (!pendingChapterTempId) return;

    const saved = await executeChapterSave(pendingChapterTempId);
    if (!saved) return;

    setIsCourseContentDraftSaved(true);
    setChapterDraftDialogOpen(false);
    setPendingChapterTempId(null);
  };

  const handleChapterDraftDialogCancel = () => {
    if (savingChapterId) return;
    setChapterDraftDialogOpen(false);
    setPendingChapterTempId(null);
  };

  const handleSaveDraftClick = async () => {
    setSavingDraft(true);
    try {
      await persistDraft();
      toast.success('Đã lưu bản nháp nội dung khóa học.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    const errors = validateCourseContent(paths);
    setValidationErrors(errors);

    if (hasContentValidationErrors(errors)) {
      toast.error('Vui lòng kiểm tra lại cấu trúc nội dung khóa học.');

      setExpandedPaths((prev) => {
        const next = { ...prev };
        paths.forEach((path) => {
          if (errors.paths?.[path.tempId]) next[path.tempId] = true;
        });
        return next;
      });

      setExpandedNodes((prev) => {
        const next = { ...prev };
        paths.forEach((path) => {
          const pathErrors = errors.paths?.[path.tempId];
          if (!pathErrors?.nodes) return;
          (path.nodes ?? []).forEach((node) => {
            if (pathErrors.nodes[node.tempId]) next[node.tempId] = true;
          });
        });
        return next;
      });

      const target = getFirstContentErrorTarget(errors, paths);
      if (target) {
        const focus = parseContentFocusTarget(target, paths);
        if (focus) setFocusTarget(focus);
        setTimeout(() => {
          document
            .querySelector(`[data-content-error="${target}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 220);
      }
      return;
    }

    setSubmitting(true);
    try {
      const uploadedPaths = await uploadPendingMaterialsInPaths(paths);
      const result = await saveCreateCourseContent(course, uploadedPaths);
      if (!result.ok) {
        toast.error('Không thể lưu nội dung. Vui lòng thử lại.');
        return;
      }
      navigate('/mentor/courses/create/review');
    } catch (error) {
      toast.error(error?.message || 'Không thể tải học liệu lên. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !course) return null;

  const deleteDialogContent = getDeleteDialogContent(deleteConfirm);

  const footerActions = (
    <MentorCourseContentFooterActions
      onBack={() => navigate('/mentor/courses/create')}
      onSaveDraft={handleSaveDraftClick}
      onPrimary={handleNext}
      primaryLabel="Tiếp theo"
      primaryEndIcon={!submitting ? <ArrowForwardRoundedIcon /> : undefined}
      backDisabled={submitting || savingDraft || saving}
      saveDraftDisabled={submitting || saving}
      primaryDisabled={savingDraft || saving}
      saveDraftLoading={savingDraft}
      primaryLoading={submitting}
    />
  );

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', xl: 1600 }, mx: 'auto' }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}
      >
        <LeaveAwareBreadcrumbLink
          to="/home"
          onNavigate={requestLeave}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Trang chủ
        </LeaveAwareBreadcrumbLink>
        <LeaveAwareBreadcrumbLink
          to="/mentor/courses"
          onNavigate={requestLeave}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Khóa học của tôi
        </LeaveAwareBreadcrumbLink>
        <LeaveAwareBreadcrumbLink
          to="/mentor/courses/create"
          onNavigate={requestLeave}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Tạo khóa học
        </LeaveAwareBreadcrumbLink>
        <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
          Xây nội dung
        </Typography>
      </Breadcrumbs>

      <MentorCourseCreateStepIndicator currentStep={2} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
          gap: { xs: 2, lg: 2 },
          alignItems: 'start',
        }}
      >
        <MentorCourseContentBuilder
          paths={paths}
          courseTitle={courseName}
          errors={validationErrors}
          expandedPaths={expandedPaths}
          expandedNodes={expandedNodes}
          onTogglePath={(pathTempId) =>
            setExpandedPaths((prev) => ({
              ...prev,
              [pathTempId]: prev[pathTempId] === false,
            }))
          }
          onToggleNode={(nodeTempId) =>
            setExpandedNodes((prev) => ({
              ...prev,
              [nodeTempId]: prev[nodeTempId] === false,
            }))
          }
          onAddPath={handleAddPath}
          onPathChange={handlePathChange}
          onPathDelete={requestDeletePath}
          onAddNode={handleAddNode}
          onNodeChange={handleNodeChange}
          onNodeDelete={requestDeleteNode}
          onAddMaterial={handleAddMaterial}
          onMaterialChange={handleMaterialChange}
          onMaterialDelete={requestDeleteMaterial}
          onMaterialReorder={handleMaterialReorder}
          disabled={submitting || savingDraft || Boolean(savingChapterId)}
          savedPathSnapshots={savedPathSnapshots}
          savingChapterId={savingChapterId}
          onSaveChapter={handleSaveChapter}
          focusTarget={focusTarget}
        />

        <MentorContentOverview
          paths={paths}
          courseName={courseName}
          focusTarget={focusTarget}
          footer={footerActions}
          onNavigateToItem={handleNavigateToContent}
        />
      </Box>

      <Box
        id={COURSE_CONTENT_MOBILE_FOOTER_ID}
        sx={{
          display: { xs: 'block', lg: 'none' },
          position: 'sticky',
          bottom: 0,
          zIndex: 5,
          mt: 2.5,
          pt: 1.5,
          pb: 'max(20px, env(safe-area-inset-bottom, 0px))',
          bgcolor: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(15,23,42,0.08)',
        }}
      >
        {footerActions}
      </Box>

      <ScrollToTopButton
        avoidSelectors={['#app-site-footer', `#${COURSE_CONTENT_MOBILE_FOOTER_ID}`]}
      />

      <MentorCourseLeaveDialog
        open={dialogOpen}
        onStay={handleStay}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraft}
        saving={saving}
      />

      <MentorChapterDraftDialog
        open={chapterDraftDialogOpen}
        onCancel={handleChapterDraftDialogCancel}
        onSaveDraft={handleChapterDraftDialogSave}
        saving={Boolean(savingChapterId)}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title={deleteDialogContent.title}
        message={deleteDialogContent.message}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        destructive
      />
    </Box>
  );
}
