import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Breadcrumbs, CircularProgress, Link as MuiLink, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseContentBuilder from '@/features/mentor/components/course/MentorCourseContentBuilder';
import MentorContentOverview from '@/features/mentor/components/course/MentorContentOverview';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorCoursePathSavePreviewDialog from '@/features/mentor/components/course/MentorCoursePathSavePreviewDialog';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { fetchMentorCourseDetail } from '@/features/mentor/services/mentorCourseService';
import { saveCoursePath } from '@/features/mentor/services/courseContentService';
import { uploadPendingMaterialsInPaths, hydrateTextMaterialsInPaths } from '@/features/mentor/utils/mentorMaterialUploadUtils';
import {
  applyCoursePathSaveResult,
  buildCoursePathOnlySavePayload,
  buildCoursePathSavePreviewPayload,
  buildCourseNodeSavePayload,
  buildCourseNodeSavePreviewPayload,
  hasCoursePathOnlySaveOperations,
  hasCourseNodeSaveOperations,
} from '@/features/mentor/utils/courseContentApiMappers';
import {
  courseDetailToEditCourse,
  loadEditCourseDraft,
  mapDetailPathsToEditPaths,
  persistEditContent,
} from '@/features/mentor/utils/mentorCourseEditStorage';
import {
  getNodeContentValidationToast,
  createEmptyMaterial,
  createEmptyNode,
  createEmptyPath,
  chapterHasContent,
  lessonHasContent,
  materialHasContent,
  isPathFieldsSnapshotSaved,
  isPathSnapshotSaved,
  isNodeSnapshotSaved,
  MATERIAL_TYPE_LABELS,
  parseContentFocusTarget,
  reorderMaterials,
  restorePathFromSnapshot,
  scrollToContentItem,
  serializePathSnapshot,
  validateNodeForSave,
  validatePathFieldsForSave,
  withNormalizedOrders,
} from '@/features/mentor/utils/mentorCourseContentUtils';

const COURSE_CONTENT_MOBILE_BACK_ID = 'course-content-mobile-back';

// ─── pure helpers ─────────────────────────────────────────────────────────────

function getDeleteDialogContent(deleteConfirm) {
  if (!deleteConfirm) return { title: 'Xác nhận', message: '' };
  if (deleteConfirm.type === 'newPath') {
    return {
      title: 'Xóa chương mới?',
      message: `Bạn có chắc muốn xóa "${deleteConfirm.label}"? Chương này chưa lưu lên hệ thống.`,
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

function updatePathInList(paths, pathTempId, patch) {
  return paths.map((p) => (p.tempId === pathTempId ? { ...p, ...patch } : p));
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

// ─── page component ───────────────────────────────────────────────────────────

export default function MentorEditCourseContentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [coursePascal, setCoursePascal] = useState(null);
  const [paths, setPaths] = useState([]);
  const [ready, setReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ root: [], paths: {} });
  const [expandedPaths, setExpandedPaths] = useState({});
  const [expandedNodes, setExpandedNodes] = useState({});
  const [savedPathSnapshots, setSavedPathSnapshots] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [unsavedNavDialogOpen, setUnsavedNavDialogOpen] = useState(false);
  const [savePreviewOpen, setSavePreviewOpen] = useState(false);
  const [savePreviewPayload, setSavePreviewPayload] = useState(null);
  const [updatingPathId, setUpdatingPathId] = useState(null);
  const [updatingNodeKey, setUpdatingNodeKey] = useState(null);

  const pathsRef = useRef(paths);
  const savedPathSnapshotsRef = useRef(savedPathSnapshots);
  const savePayloadRef = useRef(null);
  const pendingPathTempIdRef = useRef(null);
  const pendingNodeTempIdRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const confirmSaveInFlightRef = useRef(false);

  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  useEffect(() => {
    savedPathSnapshotsRef.current = savedPathSnapshots;
  }, [savedPathSnapshots]);

  const courseName = coursePascal?.CourseName ?? '';

  const buildSnapshots = useCallback((nextPaths) => {
    const snap = {};
    nextPaths.forEach((p) => { snap[p.tempId] = serializePathSnapshot(p); });
    return snap;
  }, []);

  // ── initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Try edit storage first (basic info may already be filled from step 1)
      const existingDraft = loadEditCourseDraft(courseId);

      let resolvedCoursePascal = existingDraft?.course ?? null;
      let resolvedPaths = existingDraft?.paths ?? null;

      if (!resolvedCoursePascal || !resolvedPaths) {
        // Fetch from server
        const result = await fetchMentorCourseDetail(courseId);
        if (cancelled) return;

        if (!result.success) {
          toast.error('Không thể tải nội dung khóa học.');
          navigate(`/mentor/courses/${courseId}`, { replace: true });
          return;
        }

        if (!resolvedCoursePascal) {
          resolvedCoursePascal = courseDetailToEditCourse(result.course);
        }
        if (!resolvedPaths) {
          resolvedPaths = mapDetailPathsToEditPaths(
            result.course.Paths ?? result.course.paths ?? [],
          );
        }
      }

      if (cancelled) return;

      const hydratedPaths = await hydrateTextMaterialsInPaths(resolvedPaths);
      if (cancelled) return;

      const loaded = withNormalizedOrders(hydratedPaths);
      const snapshots = buildSnapshots(loaded);

      setCoursePascal(resolvedCoursePascal);
      setPaths(loaded);
      setSavedPathSnapshots(snapshots);
      setActiveChapterId(loaded[0]?.tempId ?? null);
      setReady(true);
    })();

    return () => { cancelled = true; };
  }, [buildSnapshots, courseId, navigate]);

  // ── path / node / material handlers ────────────────────────────────────────

  const applyPaths = useCallback((updater) => {
    setPaths((prev) => withNormalizedOrders(updater(prev)));
    setValidationErrors({ root: [], paths: {} });
  }, []);

  const handleAddPath = () => {
    const newPath = createEmptyPath();
    applyPaths((prev) => [...prev, newPath]);
    setExpandedPaths((prev) => ({ ...prev, [newPath.tempId]: true }));
    setSavedPathSnapshots((prev) => ({
      ...prev,
      [newPath.tempId]: serializePathSnapshot(newPath),
    }));
  };

  const handlePathChange = (pathTempId, patch) =>
    applyPaths((prev) => updatePathInList(prev, pathTempId, patch));

  const handleDeleteNewPath = (pathTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    if (!path || path.PathId) return;

    applyPaths((prev) => prev.filter((p) => p.tempId !== pathTempId));
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
    if (activeChapterId === pathTempId) {
      const remaining = paths.filter((p) => p.tempId !== pathTempId);
      setActiveChapterId(remaining[0]?.tempId ?? null);
    }
  };

  const requestDeleteNewPath = (pathTempId) => {
    const path = paths.find((item) => item.tempId === pathTempId);
    if (!path || path.PathId) return;

    if (!chapterHasContent(path)) {
      handleDeleteNewPath(pathTempId);
      return;
    }

    setDeleteConfirm({
      type: 'newPath',
      pathTempId,
      label: String(path.PathName ?? '').trim() || 'Chương mới',
    });
  };

  const requestDeleteNode = (pathTempId, nodeTempId) => {
    const p = paths.find((x) => x.tempId === pathTempId);
    const n = (p?.nodes ?? p?.Nodes ?? []).find((x) => x.tempId === nodeTempId);
    if (!n) return;
    if (!lessonHasContent(n)) {
      handleNodeDelete(pathTempId, nodeTempId);
      return;
    }
    setDeleteConfirm({ type: 'lesson', pathTempId, nodeTempId, label: String(n?.NodeName ?? '').trim() || 'Bài học này' });
  };

  const requestDeleteMaterial = (pathTempId, nodeTempId, materialTempId) => {
    const p = paths.find((x) => x.tempId === pathTempId);
    const n = (p?.nodes ?? p?.Nodes ?? []).find((x) => x.tempId === nodeTempId);
    const m = (n?.materials ?? n?.Materials ?? []).find((x) => x.tempId === materialTempId);
    if (!m) return;
    if (!materialHasContent(m)) {
      handleMaterialDelete(pathTempId, nodeTempId, materialTempId);
      return;
    }
    const title = String(m?.Title ?? '').trim();
    const typeLabel = MATERIAL_TYPE_LABELS[m?.MaterialType] ?? 'Học liệu';
    setDeleteConfirm({ type: 'material', pathTempId, nodeTempId, materialTempId, label: title || `${typeLabel} này` });
  };

  const handleNodeDelete = (pathTempId, nodeTempId) => {
    applyPaths((prev) =>
      prev.map((p) =>
        p.tempId === pathTempId
          ? {
              ...p,
              nodes: (p.nodes ?? p.Nodes ?? []).filter((n) => n.tempId !== nodeTempId),
            }
          : p,
      ),
    );
    setExpandedNodes((prev) => { const n = { ...prev }; delete n[nodeTempId]; return n; });
  };

  const handleMaterialDelete = (pathTempId, nodeTempId, materialTempId) => {
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathTempId) return p;
        return {
          ...p,
          nodes: (p.nodes ?? p.Nodes ?? []).map((n) =>
            n.tempId !== nodeTempId
              ? n
              : {
                  ...n,
                  materials: (n.materials ?? n.Materials ?? []).filter(
                    (m) => m.tempId !== materialTempId,
                  ),
                },
          ),
        };
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'newPath') {
      handleDeleteNewPath(deleteConfirm.pathTempId);
    } else if (deleteConfirm.type === 'lesson') {
      handleNodeDelete(deleteConfirm.pathTempId, deleteConfirm.nodeTempId);
    } else {
      handleMaterialDelete(deleteConfirm.pathTempId, deleteConfirm.nodeTempId, deleteConfirm.materialTempId);
    }
    setDeleteConfirm(null);
  };

  const handleAddNode = (pathTempId) => {
    const newNode = createEmptyNode();
    applyPaths((prev) =>
      prev.map((p) =>
        p.tempId === pathTempId
          ? { ...p, nodes: [...(p.nodes ?? p.Nodes ?? []), newNode] }
          : p,
      ),
    );
    setExpandedNodes((prev) => ({ ...prev, [newNode.tempId]: true }));
  };

  const handleNodeChange = (pathTempId, nodeTempId, patch) =>
    applyPaths((prev) => updateNodeInPath(prev, pathTempId, nodeTempId, patch));

  const handleAddMaterial = (pathTempId, nodeTempId) => {
    const newMaterial = createEmptyMaterial();
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathTempId) return p;
        return {
          ...p,
          nodes: (p.nodes ?? p.Nodes ?? []).map((n) =>
            n.tempId === nodeTempId
              ? { ...n, materials: [...(n.materials ?? n.Materials ?? []), newMaterial] }
              : n,
          ),
        };
      }),
    );
  };

  const handleMaterialChange = (pathTempId, nodeTempId, materialTempId, patch) =>
    applyPaths((prev) => updateMaterialInPath(prev, pathTempId, nodeTempId, materialTempId, patch));

  const handleMaterialReorder = (pathTempId, nodeTempId, fromIndex, toIndex) => {
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathTempId) return p;
        return {
          ...p,
          nodes: (p.nodes ?? p.Nodes ?? []).map((n) =>
            n.tempId !== nodeTempId
              ? n
              : {
                  ...n,
                  materials: reorderMaterials(
                    n.materials ?? n.Materials ?? [],
                    fromIndex,
                    toIndex,
                  ),
                },
          ),
        };
      }),
    );
  };

  const handleUpdatePath = (pathTempId) => {
    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path) return;

    const isDirty = !isPathFieldsSnapshotSaved(path, savedPathSnapshotsRef.current[pathTempId]);
    if (!isDirty) {
      toast.info('Không có thay đổi path để lưu.');
      return;
    }

    const previewPayload = buildCoursePathSavePreviewPayload(
      courseId,
      pathsRef.current,
      pathTempId,
      savedPathSnapshotsRef.current,
    );

    if (!previewPayload || !hasCoursePathOnlySaveOperations(previewPayload)) {
      toast.info('Không có thay đổi path để lưu.');
      return;
    }

    pendingPathTempIdRef.current = pathTempId;
    pendingNodeTempIdRef.current = null;
    savePayloadRef.current = previewPayload;
    setSavePreviewPayload(previewPayload);
    setSavePreviewOpen(true);
  };

  const handleUpdateNode = (pathTempId, nodeTempId) => {
    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    const node = (path?.nodes ?? []).find((item) => item.tempId === nodeTempId);
    if (!path || !node) return;

    if (!path.PathId) {
      toast.error('Vui lòng cập nhật path trước khi lưu bài học.');
      return;
    }

    const isDirty = !isNodeSnapshotSaved(path, nodeTempId, savedPathSnapshotsRef.current[pathTempId]);
    if (!isDirty) {
      toast.info('Không có thay đổi bài học để lưu.');
      return;
    }

    const previewPayload = buildCourseNodeSavePreviewPayload(
      courseId,
      pathsRef.current,
      pathTempId,
      nodeTempId,
      savedPathSnapshotsRef.current,
    );

    if (!previewPayload || !hasCourseNodeSaveOperations(previewPayload)) {
      toast.info('Không có thay đổi bài học để lưu.');
      return;
    }

    pendingPathTempIdRef.current = pathTempId;
    pendingNodeTempIdRef.current = nodeTempId;
    savePayloadRef.current = previewPayload;
    setSavePreviewPayload(previewPayload);
    setSavePreviewOpen(true);
  };

  const handleSavePreviewClose = () => {
    if (updatingPathId || updatingNodeKey) return;
    setSavePreviewOpen(false);
    setSavePreviewPayload(null);
    savePayloadRef.current = null;
    pendingPathTempIdRef.current = null;
    pendingNodeTempIdRef.current = null;
  };

  const handleConfirmSavePreview = async () => {
    if (confirmSaveInFlightRef.current) return;

    const pathTempId = pendingPathTempIdRef.current;
    const nodeTempId = pendingNodeTempIdRef.current;
    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path || !pathTempId) return;

    const saveScope = savePayloadRef.current?.saveScope ?? 'path';
    const pathIndex = pathsRef.current.findIndex((item) => item.tempId === pathTempId);

    if (saveScope === 'path') {
      const pathErrors = validatePathFieldsForSave(path);
      if (Object.keys(pathErrors).length > 0) {
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
        if (pathErrors.PathName) toast.error(pathErrors.PathName);
        setExpandedPaths((prev) => ({ ...prev, [pathTempId]: true }));
        setSavePreviewOpen(false);
        savePayloadRef.current = null;
        pendingPathTempIdRef.current = null;
        return;
      }
    } else {
      const node = (path.nodes ?? []).find((item) => item.tempId === nodeTempId);
      if (!node) return;

      const nodeErrors = validateNodeForSave(node);
      if (Object.keys(nodeErrors).length > 0) {
        setValidationErrors((prev) => ({
          ...prev,
          paths: {
            ...(prev.paths ?? {}),
            [pathTempId]: {
              ...(prev.paths?.[pathTempId] ?? {}),
              nodes: {
                ...(prev.paths?.[pathTempId]?.nodes ?? {}),
                [nodeTempId]: nodeErrors,
              },
            },
          },
        }));

        const validationToast = getNodeContentValidationToast(nodeErrors, node);
        if (validationToast) toast.error(validationToast);

        setExpandedPaths((prev) => ({ ...prev, [pathTempId]: true }));
        setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
        setSavePreviewOpen(false);
        savePayloadRef.current = null;
        pendingPathTempIdRef.current = null;
        pendingNodeTempIdRef.current = null;
        return;
      }
    }

    confirmSaveInFlightRef.current = true;
    if (saveScope === 'path') {
      setUpdatingPathId(pathTempId);
    } else {
      setUpdatingNodeKey(`${pathTempId}:${nodeTempId}`);
    }

    try {
      let workingPath = path;

      if (saveScope === 'node') {
        [workingPath] = await uploadPendingMaterialsInPaths([path]);
      }

      const savePayload = saveScope === 'path'
        ? buildCoursePathOnlySavePayload(
          workingPath,
          {
            courseId: Number(courseId),
            pathOrder: pathIndex >= 0 ? pathIndex + 1 : 1,
          },
          savedPathSnapshotsRef.current[pathTempId],
        )
        : buildCourseNodeSavePayload(
          workingPath,
          nodeTempId,
          {
            courseId: Number(courseId),
            pathOrder: pathIndex >= 0 ? pathIndex + 1 : 1,
          },
          savedPathSnapshotsRef.current[pathTempId],
        );

      const hasOperations = saveScope === 'path'
        ? hasCoursePathOnlySaveOperations(savePayload)
        : hasCourseNodeSaveOperations(savePayload);

      if (!hasOperations) {
        toast.info(saveScope === 'path'
          ? 'Không có thay đổi path để lưu.'
          : 'Không có thay đổi bài học để lưu.');
        return;
      }

      const result = await saveCoursePath({
        ...savePayload,
        context: {
          ...(savePayload?.context ?? {}),
          courseId: Number(courseId),
          pathOrder: pathIndex >= 0 ? pathIndex + 1 : 1,
        },
      });

      if (!result.ok) {
        toast.error(result.message ?? (saveScope === 'path'
          ? 'Không thể cập nhật path.'
          : 'Không thể cập nhật bài học.'));
        return;
      }

      const savedPath = applyCoursePathSaveResult(workingPath, result);
      const nextPaths = withNormalizedOrders(
        pathsRef.current.map((item) => (item.tempId === pathTempId ? savedPath : item)),
      );

      persistEditContent(courseId, coursePascal, nextPaths);
      setPaths(nextPaths);
      setSavedPathSnapshots((prev) => ({
        ...prev,
        [pathTempId]: serializePathSnapshot(savedPath),
      }));
      setSavePreviewOpen(false);
      setSavePreviewPayload(null);
      savePayloadRef.current = null;
      pendingPathTempIdRef.current = null;
      pendingNodeTempIdRef.current = null;
      toast.success(saveScope === 'path' ? 'Đã cập nhật path.' : 'Đã cập nhật bài học.');
    } catch (error) {
      toast.error(error?.message || (saveScope === 'path'
        ? 'Không thể cập nhật path. Vui lòng thử lại.'
        : 'Không thể cập nhật bài học. Vui lòng thử lại.'));
    } finally {
      confirmSaveInFlightRef.current = false;
      setUpdatingPathId(null);
      setUpdatingNodeKey(null);
    }
  };

  const revertActivePathChanges = useCallback((pathTempId) => {
    if (!pathTempId) return;

    const snapshot = savedPathSnapshotsRef.current[pathTempId];
    if (!snapshot) return;

    setPaths((prev) => prev.map((path) => (
      path.tempId === pathTempId
        ? restorePathFromSnapshot(path, snapshot)
        : path
    )));
    setValidationErrors((prev) => ({
      ...prev,
      paths: {
        ...(prev.paths ?? {}),
        [pathTempId]: undefined,
      },
    }));
  }, []);

  const requestPathNavigation = useCallback((navigateFn) => {
    const currentPathId = activeChapterId;
    if (!currentPathId) {
      navigateFn();
      return;
    }

    const path = pathsRef.current.find((item) => item.tempId === currentPathId);
    const isDirty = path
      && !isPathSnapshotSaved(path, savedPathSnapshotsRef.current[currentPathId]);

    if (!isDirty) {
      navigateFn();
      return;
    }

    pendingNavigationRef.current = navigateFn;
    setUnsavedNavDialogOpen(true);
  }, [activeChapterId]);

  const handleRequestChapterChange = useCallback((nextChapterId) => {
    if (nextChapterId === activeChapterId) return;
    if (!nextChapterId) {
      setActiveChapterId(null);
      return;
    }
    requestPathNavigation(() => setActiveChapterId(nextChapterId));
  }, [activeChapterId, requestPathNavigation]);

  const handleUnsavedNavCancel = () => {
    pendingNavigationRef.current = null;
    setUnsavedNavDialogOpen(false);
  };

  const handleUnsavedNavContinue = () => {
    const navigateFn = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setUnsavedNavDialogOpen(false);
    revertActivePathChanges(activeChapterId);
    navigateFn?.();
  };

  const handleNavigateToContent = useCallback((target) => {
    const applyNavigation = () => {
      if (target?.pathTempId) {
        setActiveChapterId(target.pathTempId);
      }
      setFocusTarget(target);
      scrollToContentItem(target, { setExpandedPaths, setExpandedNodes });
    };

    if (target?.pathTempId && target.pathTempId !== activeChapterId) {
      requestPathNavigation(applyNavigation);
      return;
    }

    applyNavigation();
  }, [activeChapterId, requestPathNavigation]);

  const handleBack = () => {
    navigate(`/mentor/courses/${courseId}/edit`);
  };

  if (!ready || !coursePascal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={32} sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  const deleteDialogContent = getDeleteDialogContent(deleteConfirm);
  const busy = Boolean(updatingPathId || updatingNodeKey);

  const backButton = (
    <AppButton
      variant="outlined"
      startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
      onClick={handleBack}
      disabled={busy}
      sx={{
        height: 42,
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: 14,
        px: 2,
        width: { xs: '100%', lg: 'auto' },
      }}
    >
      Quay lại
    </AppButton>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', xl: 1600 }, mx: 'auto' }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
      >
        <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/mentor/courses" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Khóa học của tôi
        </MuiLink>
        <MuiLink component={Link} to={`/mentor/courses/${courseId}`} underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Chi tiết khóa học
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          Chỉnh sửa nội dung
        </Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 15, sm: 16 },
          fontWeight: 600,
          color: MUTED,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          mb: 0.75,
        }}
      >
        Chỉnh sửa nội dung khóa học
      </Typography>

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
          courseId={Number(courseId)}
          courseTitle={courseName}
          errors={validationErrors}
          expandedPaths={expandedPaths}
          expandedNodes={expandedNodes}
          onTogglePath={(id) =>
            setExpandedPaths((prev) => ({ ...prev, [id]: prev[id] === false }))
          }
          onToggleNode={(id) =>
            setExpandedNodes((prev) => ({ ...prev, [id]: prev[id] === false }))
          }
          onAddPath={handleAddPath}
          onPathChange={handlePathChange}
          onDeleteNewPath={requestDeleteNewPath}
          onAddNode={handleAddNode}
          onNodeChange={handleNodeChange}
          onNodeDelete={requestDeleteNode}
          onAddMaterial={handleAddMaterial}
          onMaterialChange={handleMaterialChange}
          onMaterialDelete={requestDeleteMaterial}
          onMaterialReorder={handleMaterialReorder}
          disabled={busy}
          savedPathSnapshots={savedPathSnapshots}
          showChapterSave={false}
          showPathUpdate
          updatingPathId={updatingPathId}
          onUpdatePath={handleUpdatePath}
          showNodeUpdate
          updatingNodeKey={updatingNodeKey}
          onUpdateNode={handleUpdateNode}
          activeChapterId={activeChapterId}
          onActiveChapterChange={handleRequestChapterChange}
          focusTarget={focusTarget}
        />

        <MentorContentOverview
          paths={paths}
          courseName={courseName}
          focusTarget={focusTarget}
          footer={backButton}
          onNavigateToItem={handleNavigateToContent}
        />
      </Box>

      <Box
        id={COURSE_CONTENT_MOBILE_BACK_ID}
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
        {backButton}
      </Box>

      <ScrollToTopButton
        avoidSelectors={['#app-site-footer', `#${COURSE_CONTENT_MOBILE_BACK_ID}`]}
      />

      <ConfirmDialog
        open={unsavedNavDialogOpen}
        onClose={handleUnsavedNavCancel}
        onConfirm={handleUnsavedNavContinue}
        title="Thay đổi chưa được lưu"
        message="Nếu bạn chuyển sang mục khác, các thay đổi sẽ không được lưu. Bạn có muốn tiếp tục?"
        confirmLabel="Tiếp tục"
        cancelLabel="Hủy"
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

      <MentorCoursePathSavePreviewDialog
        open={savePreviewOpen}
        payload={savePreviewPayload}
        loading={Boolean(updatingPathId || updatingNodeKey)}
        onClose={handleSavePreviewClose}
        onConfirm={handleConfirmSavePreview}
      />
    </Box>
  );
}
