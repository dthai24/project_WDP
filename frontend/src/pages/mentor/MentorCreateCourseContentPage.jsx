import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../components/common/AppButton';
import { toast } from '../../components/common/Toast';
import MentorCourseContentBuilder from '../../components/mentor/course/MentorCourseContentBuilder';
import MentorContentPreview from '../../components/mentor/course/MentorContentPreview';
import MentorCourseCreateStepIndicator from '../../components/mentor/course/MentorCourseCreateStepIndicator';
import MentorCourseLeaveDialog from '../../components/mentor/course/MentorCourseLeaveDialog';
import { useMentorCourseLeaveGuard } from '../../hooks/useMentorCourseLeaveGuard';
import { saveCreateCourseContent } from '../../services/mentorCourseService';
import { getUser } from '../../utils/authUtils';
import {
  createEmptyMaterial,
  createEmptyNode,
  createEmptyPath,
  hasContentValidationErrors,
  validateCourseContent,
  withNormalizedOrders,
} from '../../utils/mentorCourseContentUtils';
import { loadCreateCourseDraft } from '../../utils/mentorCourseCreateStorage';

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
      nodes: (path.nodes ?? []).map((node) =>
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
      nodes: (path.nodes ?? []).map((node) => {
        if (node.tempId !== nodeTempId) return node;
        return {
          ...node,
          materials: (node.materials ?? []).map((material) =>
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
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const instructorId = getUser()?.userId ?? null;
  const courseName = course?.CourseName ?? '';

  const isDirty = useMemo(() => {
    const snapshot = JSON.stringify(withNormalizedOrders(paths));
    if (!initialSnapshot) return paths.length > 0;
    return snapshot !== initialSnapshot;
  }, [paths, initialSnapshot]);

  const persistDraft = useCallback(async () => {
    if (!course) return;
    await saveCreateCourseContent(course, paths);
    setInitialSnapshot(JSON.stringify(withNormalizedOrders(paths)));
  }, [course, paths]);

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
    setCourse(draft.course);
    setPaths(loadedPaths);
    setInitialSnapshot(JSON.stringify(loadedPaths));
    setReady(true);
  }, [navigate]);

  const applyPaths = useCallback((updater) => {
    setPaths((prev) => withNormalizedOrders(updater(prev)));
    setValidationErrors({ root: [], paths: {} });
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
    setExpandedPaths((prev) => {
      const next = { ...prev };
      delete next[pathTempId];
      return next;
    });
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
      return;
    }

    setSubmitting(true);
    try {
      const result = await saveCreateCourseContent(course, paths);
      if (!result.ok) return;
      navigate('/mentor/courses/create/review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !course) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
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

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          mb: 0.75,
        }}
      >
        Xây nội dung khóa học
      </Typography>
      <Typography sx={{ fontSize: 15, color: '#64748B', mb: 2, maxWidth: 720 }}>
        Bước 2: Tạo chương, bài và học liệu cho khóa học.
      </Typography>

      <MentorCourseCreateStepIndicator currentStep={2} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          gap: 2.5,
          alignItems: 'start',
          mb: 2.5,
        }}
      >
        <MentorCourseContentBuilder
          paths={paths}
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
          onPathDelete={handlePathDelete}
          onAddNode={handleAddNode}
          onNodeChange={handleNodeChange}
          onNodeDelete={handleNodeDelete}
          onAddMaterial={handleAddMaterial}
          onMaterialChange={handleMaterialChange}
          onMaterialDelete={handleMaterialDelete}
          disabled={submitting || savingDraft}
          courseName={courseName}
        />

        <MentorContentPreview paths={paths} courseName={courseName} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 1.25,
          pt: 0.5,
        }}
      >
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/courses/create')}
          disabled={submitting || savingDraft || saving}
          sx={{ minWidth: 110, height: 44, borderRadius: '999px', fontWeight: 700 }}
        >
          Quay lại
        </AppButton>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          <AppButton
            variant="outlined"
            onClick={handleSaveDraftClick}
            loading={savingDraft}
            disabled={submitting || saving}
            sx={{ minWidth: 110, height: 44, borderRadius: '999px', fontWeight: 700 }}
          >
            Lưu nháp
          </AppButton>
          <AppButton
            onClick={handleNext}
            loading={submitting}
            endIcon={!submitting ? <ArrowForwardRoundedIcon /> : undefined}
            disabled={savingDraft || saving}
            sx={{
              minWidth: 128,
              height: 44,
              borderRadius: '999px',
              fontWeight: 700,
              bgcolor: '#0891B2',
              '&:hover': { bgcolor: '#0E7490' },
            }}
          >
            Tiếp theo
          </AppButton>
        </Box>
      </Box>

      <MentorCourseLeaveDialog
        open={dialogOpen}
        onStay={handleStay}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraft}
        saving={saving}
      />
    </Box>
  );
}
