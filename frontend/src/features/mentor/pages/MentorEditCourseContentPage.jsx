import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Breadcrumbs, CircularProgress, Link as MuiLink, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseContentBuilder from '@/features/mentor/components/course/MentorCourseContentBuilder';
import MentorCourseContentSidebar from '@/features/mentor/components/course/MentorCourseContentSidebar';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import { useNavigationGuard } from '@/context/NavigationGuardContext';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { fetchMentorCourseDetail } from '@/features/mentor/services/mentorCourseService';
import { saveCoursePath, deleteCoursePath } from '@/features/mentor/services/courseContentService';
import { uploadPendingMaterialInPath, hydrateTextMaterialsInPaths } from '@/features/mentor/utils/mentorMaterialUploadUtils';
import {
  applyCoursePathSaveResult,
  buildCoursePathOnlySavePayload,
  buildCourseNodeOnlySavePayload,
  buildCourseMaterialSavePayload,
  hasCoursePathOnlySaveOperations,
  hasCourseNodeOnlySaveOperations,
  hasCourseMaterialSaveOperations,
} from '@/features/mentor/utils/courseContentApiMappers';
import {
  courseDetailToEditCourse,
  loadEditCourseDraft,
  mapDetailPathsToEditPaths,
  persistEditContent,
} from '@/features/mentor/utils/mentorCourseEditStorage';
import {
  filterLearningMaterials,
  getMaterialContentValidationToast,
  createEmptyMaterial,
  createEmptyNode,
  createEmptyPath,
  chapterHasContent,
  lessonHasContent,
  materialHasContent,
  isPathFieldsSnapshotSaved,
  isPathSnapshotSaved,
  isNodeFieldsSnapshotSaved,
  isMaterialSnapshotSaved,
  MATERIAL_TYPE_LABELS,
  reorderMaterials,
  restorePathFromSnapshot,
  serializePathSnapshot,
  validateMaterialForSave,
  validateNodeFieldsForSave,
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

function getSaveConfirmDialogContent({
  saveScope,
  path,
  pathIndex,
  node,
  material,
}) {
  if (saveScope === 'path') {
    const name = String(path?.PathName ?? '').trim() || 'Chưa đặt tên';
    return {
      title: 'Cập nhật chương?',
      message: `Lưu thông tin chương ${pathIndex + 1}: "${name}" lên hệ thống? Chỉ tên, mô tả và trạng thái xuất bản của chương được cập nhật.`,
      confirmLabel: 'Cập nhật path',
    };
  }

  if (saveScope === 'node') {
    const name = String(node?.NodeName ?? node?.nodeName ?? '').trim() || 'Chưa đặt tên';
    return {
      title: 'Cập nhật bài học?',
      message: `Lưu thông tin bài học "${name}" lên hệ thống? Chỉ tên, mô tả và trạng thái xuất bản của bài học được cập nhật.`,
      confirmLabel: 'Cập nhật Node',
    };
  }

  const materialLabel = String(material?.Title ?? '').trim()
    || MATERIAL_TYPE_LABELS[material?.MaterialType]
    || 'Học liệu';

  return {
    title: 'Cập nhật học liệu?',
    message: `Lưu học liệu "${materialLabel}" lên hệ thống? Chỉ nội dung học liệu này được cập nhật.`,
    confirmLabel: 'Cập nhật học liệu',
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
  const [saveConfirm, setSaveConfirm] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [unsavedNavDialogOpen, setUnsavedNavDialogOpen] = useState(false);
  const [updatingPathId, setUpdatingPathId] = useState(null);
  const [updatingNodeKey, setUpdatingNodeKey] = useState(null);
  const [updatingMaterialKey, setUpdatingMaterialKey] = useState(null);

  const pathsRef = useRef(paths);
  const savedPathSnapshotsRef = useRef(savedPathSnapshots);
  const pendingNavigationRef = useRef(null);
  const requestNavigationRef = useRef(null);
  const confirmSaveInFlightRef = useRef(false);
  const { registerNavigationGuard } = useNavigationGuard() ?? {};

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
      setFocusTarget(null);
      setReady(true);
    })();

    return () => { cancelled = true; };
  }, [buildSnapshots, courseId, navigate]);

  // ── path / node / material handlers ────────────────────────────────────────

  const applyPaths = useCallback((updater) => {
    setPaths((prev) => withNormalizedOrders(updater(prev)));
    setValidationErrors({ root: [], paths: {} });
  }, []);

  const performAddPath = useCallback(() => {
    const newPath = createEmptyPath();
    applyPaths((prev) => [...prev, newPath]);
    setExpandedPaths((prev) => ({ ...prev, [newPath.tempId]: true }));
    setSavedPathSnapshots((prev) => ({
      ...prev,
      [newPath.tempId]: serializePathSnapshot(newPath),
    }));
    setActiveChapterId(newPath.tempId);
    setFocusTarget({ type: 'chapter-edit', pathTempId: newPath.tempId });
  }, [applyPaths]);

  const handlePathChange = (pathTempId, patch) =>
    applyPaths((prev) => updatePathInList(prev, pathTempId, patch));

  const handleDeleteNewPath = async (pathTempId) => {
    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path) return;

    if (path.PathId) {
      setUpdatingPathId(pathTempId);
      try {
        const result = await deleteCoursePath(path.PathId);
        if (!result.ok) {
          toast.error(result.message ?? 'Không thể xóa chương.');
          return;
        }
      } finally {
        setUpdatingPathId(null);
      }
    }

    const nextPaths = withNormalizedOrders(
      pathsRef.current.filter((p) => p.tempId !== pathTempId),
    );

    persistEditContent(courseId, coursePascal, nextPaths);
    setPaths(nextPaths);
    setValidationErrors({ root: [], paths: {} });
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
      setActiveChapterId(nextPaths[0]?.tempId ?? null);
      setFocusTarget(null);
    }
  };

  const requestDeleteNewPath = (pathTempId) => {
    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path) return;

    if (!path.PathId && !chapterHasContent(path)) {
      handleDeleteNewPath(pathTempId);
      return;
    }

    if (!path.PathId) {
      setDeleteConfirm({
        type: 'newPath',
        pathTempId,
        label: String(path.PathName ?? '').trim() || 'Chương mới',
      });
      return;
    }

    handleDeleteNewPath(pathTempId);
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

  const performAddNode = useCallback((pathTempId) => {
    const newNode = createEmptyNode();
    applyPaths((prev) =>
      prev.map((p) =>
        p.tempId === pathTempId
          ? { ...p, nodes: [...(p.nodes ?? p.Nodes ?? []), newNode] }
          : p,
      ),
    );
    setExpandedNodes((prev) => ({ ...prev, [newNode.tempId]: true }));
    setActiveChapterId(pathTempId);
    setFocusTarget({
      type: 'lesson',
      pathTempId,
      nodeTempId: newNode.tempId,
    });
  }, [applyPaths]);

  const handleNodeChange = (pathTempId, nodeTempId, patch) =>
    applyPaths((prev) => updateNodeInPath(prev, pathTempId, nodeTempId, patch));

  const performAddMaterial = useCallback((pathTempId, nodeTempId) => {
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
    setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
    setActiveChapterId(pathTempId);
    setFocusTarget({
      type: 'material',
      pathTempId,
      nodeTempId,
      materialTempId: newMaterial.tempId,
    });
  }, [applyPaths]);

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
    requestScopedSave('path', pathTempId, null, null);
  };

  const handleUpdateNode = (pathTempId, nodeTempId) => {
    requestScopedSave('node', pathTempId, nodeTempId, null);
  };

  const handleUpdateMaterial = (pathTempId, nodeTempId, materialTempId) => {
    requestScopedSave('material', pathTempId, nodeTempId, materialTempId);
  };

  const requestScopedSave = (saveScope, pathTempId, nodeTempId, materialTempId) => {
    if (confirmSaveInFlightRef.current) return;

    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path || !pathTempId) return;

    const pathIndex = pathsRef.current.findIndex((item) => item.tempId === pathTempId);
    const snapshot = savedPathSnapshotsRef.current[pathTempId];
    const node = (path.nodes ?? []).find((item) => item.tempId === nodeTempId);
    const material = filterLearningMaterials(node?.materials ?? node?.Materials ?? [])
      .find((item) => item.tempId === materialTempId);

    if (saveScope === 'path') {
      if (isPathFieldsSnapshotSaved(path, snapshot)) {
        toast.info('Không có thay đổi path để lưu.');
        return;
      }

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
        return;
      }
    } else if (saveScope === 'node') {
      if (!node) return;
      if (!path.PathId) {
        toast.error('Vui lòng cập nhật path trước khi lưu bài học.');
        return;
      }
      if (isNodeFieldsSnapshotSaved(path, nodeTempId, snapshot)) {
        toast.info('Không có thay đổi bài học để lưu.');
        return;
      }

      const nodeErrors = validateNodeFieldsForSave(node);
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
        toast.error(nodeErrors.NodeName ?? 'Vui lòng kiểm tra lại thông tin bài học.');
        setExpandedPaths((prev) => ({ ...prev, [pathTempId]: true }));
        setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
        return;
      }
    } else {
      if (!node || !material) return;
      if (!path.PathId) {
        toast.error('Vui lòng cập nhật path trước khi lưu học liệu.');
        return;
      }
      if (!node.NodeId) {
        toast.error('Vui lòng cập nhật node trước khi lưu học liệu.');
        return;
      }
      if (isMaterialSnapshotSaved(path, nodeTempId, materialTempId, snapshot)) {
        toast.info('Không có thay đổi học liệu để lưu.');
        return;
      }

      const materialErrors = validateMaterialForSave(material);
      if (Object.keys(materialErrors).length > 0) {
        setValidationErrors((prev) => ({
          ...prev,
          paths: {
            ...(prev.paths ?? {}),
            [pathTempId]: {
              ...(prev.paths?.[pathTempId] ?? {}),
              nodes: {
                ...(prev.paths?.[pathTempId]?.nodes ?? {}),
                [nodeTempId]: {
                  ...(prev.paths?.[pathTempId]?.nodes?.[nodeTempId] ?? {}),
                  materials: {
                    ...(prev.paths?.[pathTempId]?.nodes?.[nodeTempId]?.materials ?? {}),
                    [materialTempId]: materialErrors,
                  },
                },
              },
            },
          },
        }));
        const validationToast = getMaterialContentValidationToast(materialErrors);
        if (validationToast) toast.error(validationToast);
        setExpandedPaths((prev) => ({ ...prev, [pathTempId]: true }));
        setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
        return;
      }
    }

    const dialogContent = getSaveConfirmDialogContent({
      saveScope,
      path,
      pathIndex,
      node,
      material,
    });

    setSaveConfirm({
      saveScope,
      pathTempId,
      nodeTempId,
      materialTempId,
      ...dialogContent,
    });
  };

  const handleConfirmScopedSave = () => {
    if (!saveConfirm || confirmSaveInFlightRef.current) return;
    const { saveScope, pathTempId, nodeTempId, materialTempId } = saveConfirm;
    void executeScopedSave(saveScope, pathTempId, nodeTempId, materialTempId);
  };

  const executeScopedSave = async (saveScope, pathTempId, nodeTempId, materialTempId) => {
    if (confirmSaveInFlightRef.current) return;

    const path = pathsRef.current.find((item) => item.tempId === pathTempId);
    if (!path || !pathTempId) return;

    const pathIndex = pathsRef.current.findIndex((item) => item.tempId === pathTempId);

    confirmSaveInFlightRef.current = true;
    if (saveScope === 'path') {
      setUpdatingPathId(pathTempId);
    } else if (saveScope === 'node') {
      setUpdatingNodeKey(`${pathTempId}:${nodeTempId}`);
    } else {
      setUpdatingMaterialKey(`${pathTempId}:${nodeTempId}:${materialTempId}`);
    }

    try {
      let workingPath = path;
      let nextPathsDraft = pathsRef.current;

      if (saveScope === 'material') {
        const [uploadedPath] = await uploadPendingMaterialInPath(
          pathsRef.current,
          pathTempId,
          nodeTempId,
          materialTempId,
        );
        if (uploadedPath) {
          workingPath = uploadedPath;
          nextPathsDraft = pathsRef.current.map((item) => (
            item.tempId === pathTempId ? uploadedPath : item
          ));
          setPaths(nextPathsDraft);
          pathsRef.current = nextPathsDraft;
        }
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
        : saveScope === 'node'
          ? buildCourseNodeOnlySavePayload(
            workingPath,
            nodeTempId,
            {
              courseId: Number(courseId),
              pathOrder: pathIndex >= 0 ? pathIndex + 1 : 1,
            },
            savedPathSnapshotsRef.current[pathTempId],
          )
          : buildCourseMaterialSavePayload(
            workingPath,
            nodeTempId,
            materialTempId,
            {
              courseId: Number(courseId),
              pathOrder: pathIndex >= 0 ? pathIndex + 1 : 1,
            },
            savedPathSnapshotsRef.current[pathTempId],
          );

      const hasOperations = saveScope === 'path'
        ? hasCoursePathOnlySaveOperations(savePayload)
        : saveScope === 'node'
          ? hasCourseNodeOnlySaveOperations(savePayload)
          : hasCourseMaterialSaveOperations(savePayload);

      if (!hasOperations) {
        toast.info(
          saveScope === 'path'
            ? 'Không có thay đổi path để lưu.'
            : saveScope === 'node'
              ? 'Không có thay đổi bài học để lưu.'
              : 'Không có thay đổi học liệu để lưu.',
        );
        setSaveConfirm(null);
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
        toast.error(result.message ?? (
          saveScope === 'path'
            ? 'Không thể cập nhật path.'
            : saveScope === 'node'
              ? 'Không thể cập nhật bài học.'
              : 'Không thể cập nhật học liệu.'
        ));
        return;
      }

      const savedPath = applyCoursePathSaveResult(workingPath, result);
      const nextPaths = withNormalizedOrders(
        nextPathsDraft.map((item) => (item.tempId === pathTempId ? savedPath : item)),
      );

      pathsRef.current = nextPaths;
      setPaths(nextPaths);
      setSavedPathSnapshots((prev) => ({
        ...prev,
        [pathTempId]: serializePathSnapshot(savedPath),
      }));

      queueMicrotask(() => {
        persistEditContent(courseId, coursePascal, nextPaths);
      });

      setSaveConfirm(null);
      toast.success(
        saveScope === 'path'
          ? 'Đã cập nhật path.'
          : saveScope === 'node'
            ? 'Đã cập nhật bài học.'
            : 'Đã cập nhật học liệu.',
      );
    } catch (error) {
      toast.error(error?.message || (
        saveScope === 'path'
          ? 'Không thể cập nhật path. Vui lòng thử lại.'
          : saveScope === 'node'
            ? 'Không thể cập nhật bài học. Vui lòng thử lại.'
            : 'Không thể cập nhật học liệu. Vui lòng thử lại.'
      ));
    } finally {
      confirmSaveInFlightRef.current = false;
      setUpdatingPathId(null);
      setUpdatingNodeKey(null);
      setUpdatingMaterialKey(null);
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

  const requestContentNavigation = useCallback((navigateFn) => {
    const currentPathId = activeChapterId;
    if (!currentPathId) {
      navigateFn();
      return;
    }

    const path = pathsRef.current.find((item) => item.tempId === currentPathId);
    const snapshot = savedPathSnapshotsRef.current[currentPathId];
    const isDirty = Boolean(path && !isPathSnapshotSaved(path, snapshot));

    if (!isDirty) {
      navigateFn();
      return;
    }

    pendingNavigationRef.current = navigateFn;
    setUnsavedNavDialogOpen(true);
  }, [activeChapterId]);

  requestNavigationRef.current = requestContentNavigation;

  useEffect(() => {
    if (!registerNavigationGuard) return undefined;
    return registerNavigationGuard((navigateFn) => {
      requestNavigationRef.current?.(navigateFn);
    });
  }, [registerNavigationGuard]);

  const handleGuardedLinkNavigate = useCallback((to) => (event) => {
    event.preventDefault();
    requestContentNavigation(() => navigate(to));
  }, [navigate, requestContentNavigation]);

  const handleAddPath = useCallback(() => {
    requestContentNavigation(performAddPath);
  }, [performAddPath, requestContentNavigation]);

  const handleAddNode = useCallback((pathTempId) => {
    requestContentNavigation(() => performAddNode(pathTempId));
  }, [performAddNode, requestContentNavigation]);

  const handleAddMaterial = useCallback((pathTempId, nodeTempId) => {
    requestContentNavigation(() => performAddMaterial(pathTempId, nodeTempId));
  }, [performAddMaterial, requestContentNavigation]);

  const handleRequestChapterChange = useCallback((nextChapterId) => {
    if (nextChapterId === activeChapterId) return;
    if (!nextChapterId) {
      requestContentNavigation(() => setActiveChapterId(null));
      return;
    }
    requestContentNavigation(() => {
      setActiveChapterId(nextChapterId);
      setFocusTarget(null);
    });
  }, [activeChapterId, requestContentNavigation]);

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

  const handleSelectChapter = useCallback((pathTempId) => {
    const navigate = () => {
      setActiveChapterId(pathTempId);
      setFocusTarget(null);
    };

    if (pathTempId === activeChapterId && !focusTarget) {
      navigate();
      return;
    }

    requestContentNavigation(navigate);
  }, [activeChapterId, focusTarget, requestContentNavigation]);

  const handleEditChapter = useCallback((pathTempId) => {
    const navigate = () => {
      setActiveChapterId(pathTempId);
      setFocusTarget({ type: 'chapter-edit', pathTempId });
    };

    if (
      pathTempId === activeChapterId
      && focusTarget?.type === 'chapter-edit'
      && focusTarget?.pathTempId === pathTempId
    ) {
      navigate();
      return;
    }

    requestContentNavigation(navigate);
  }, [activeChapterId, focusTarget, requestContentNavigation]);

  const handleSelectNode = useCallback((pathTempId, nodeTempId) => {
    const navigate = () => {
      setActiveChapterId(pathTempId);
      setFocusTarget({ type: 'lesson', pathTempId, nodeTempId });
      setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
    };

    if (
      pathTempId === activeChapterId
      && focusTarget?.type === 'lesson'
      && focusTarget?.nodeTempId === nodeTempId
    ) {
      navigate();
      return;
    }

    requestContentNavigation(navigate);
  }, [activeChapterId, focusTarget, requestContentNavigation]);

  const handleSelectMaterial = useCallback((pathTempId, nodeTempId, materialTempId) => {
    const navigate = () => {
      setActiveChapterId(pathTempId);
      setFocusTarget({ type: 'material', pathTempId, nodeTempId, materialTempId });
      setExpandedNodes((prev) => ({ ...prev, [nodeTempId]: true }));
    };

    if (
      pathTempId === activeChapterId
      && focusTarget?.type === 'material'
      && focusTarget?.nodeTempId === nodeTempId
      && focusTarget?.materialTempId === materialTempId
    ) {
      navigate();
      return;
    }

    requestContentNavigation(navigate);
  }, [activeChapterId, focusTarget, requestContentNavigation]);

  const handleBack = () => {
    requestContentNavigation(() => navigate(`/mentor/courses/${courseId}?tab=content`));
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
        <MuiLink component={Link} to="/home" underline="hover" onClick={handleGuardedLinkNavigate('/home')} sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/mentor/courses" underline="hover" onClick={handleGuardedLinkNavigate('/mentor/courses')} sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Khóa học của tôi
        </MuiLink>
        <MuiLink component={Link} to={`/mentor/courses/${courseId}`} underline="hover" onClick={handleGuardedLinkNavigate(`/mentor/courses/${courseId}`)} sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
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
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 4fr) minmax(0, 8fr)' },
          gap: { xs: 2, lg: 2 },
          alignItems: 'start',
        }}
      >
        <MentorCourseContentSidebar
          paths={paths}
          courseName={courseName}
          activeChapterId={activeChapterId}
          focusTarget={focusTarget}
          errors={validationErrors}
          savedPathSnapshots={savedPathSnapshots}
          onSelectChapter={handleSelectChapter}
          onEditChapter={handleEditChapter}
          onSelectNode={handleSelectNode}
          onSelectMaterial={handleSelectMaterial}
          onAddChapter={handleAddPath}
          onAddNode={handleAddNode}
          onAddMaterial={handleAddMaterial}
          onDeleteNewPath={handleDeleteNewPath}
          disabled={busy}
          footer={backButton}
        />

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
          showMaterialUpdate
          updatingMaterialKey={updatingMaterialKey}
          onUpdateMaterial={handleUpdateMaterial}
          activeChapterId={activeChapterId}
          onActiveChapterChange={handleRequestChapterChange}
          onRequestContentNavigation={requestContentNavigation}
          focusTarget={focusTarget}
          sidebarLayout
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
        open={Boolean(saveConfirm)}
        onClose={() => {
          if (updatingPathId || updatingNodeKey || updatingMaterialKey) return;
          setSaveConfirm(null);
        }}
        onConfirm={handleConfirmScopedSave}
        title={saveConfirm?.title ?? 'Xác nhận cập nhật'}
        message={saveConfirm?.message ?? ''}
        confirmLabel={saveConfirm?.confirmLabel ?? 'Cập nhật'}
        cancelLabel="Hủy"
        loading={Boolean(updatingPathId || updatingNodeKey || updatingMaterialKey)}
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
    </Box>
  );
}
