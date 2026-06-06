import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import MentorCourseCreateForm from '@/features/mentor/components/course/MentorCourseCreateForm';
import MentorCourseContentBuilder from '@/features/mentor/components/course/MentorCourseContentBuilder';
import MentorContentOverview from '@/features/mentor/components/course/MentorContentOverview';
import MentorChapterDraftDialog from '@/features/mentor/components/course/MentorChapterDraftDialog';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  fetchCourseCategories,
  fetchCourseLevels,
  fetchMentorCourseDetail,
} from '@/features/mentor/services/mentorCourseService';
import { getUser } from '@/features/auth/utils/authUtils';
import {
  buildCreateCourseStep1Payload,
  MENTOR_COURSE_FORM_INITIAL,
  validateMentorCourseForm,
} from '@/features/mentor/utils/mentorCourseFormUtils';
import {
  courseDetailToEditCourse,
  courseDetailToEditForm,
  loadEditCourseDraft,
  mapDetailPathsToEditPaths,
  saveEditCourseDraft,
} from '@/features/mentor/utils/mentorCourseEditStorage';
import {
  createEmptyMaterial,
  createEmptyNode,
  createEmptyPath,
  getFirstContentErrorTarget,
  hasContentValidationErrors,
  isPathSnapshotSaved,
  MATERIAL_TYPE_LABELS,
  reorderMaterials,
  sanitizePathsForStorage,
  scrollToContentItem,
  serializePathSnapshot,
  validateCourseContent,
  validatePathForSave,
  withNormalizedOrders,
} from '@/features/mentor/utils/mentorCourseContentUtils';

// ─── step indicator ────────────────────────────────────────────────────────────

const EDIT_STEPS = [
  { id: 'info', label: 'Thông tin cơ bản' },
  { id: 'content', label: 'Nội dung khóa học' },
];

function EditStepIndicator({ activeTab, onTabChange, infoValid }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 2.5 }}>
      {EDIT_STEPS.map(({ id, label }, index) => {
        const stepNumber = index + 1;
        const isActive = activeTab === id;
        const isDone = EDIT_STEPS.findIndex((s) => s.id === activeTab) > index;
        const isClickable = id === 'content' ? infoValid : true;

        return (
          <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.6, cursor: isClickable ? 'pointer' : 'default' }}
              onClick={() => isClickable && onTabChange(id)}
            >
              <Box
                sx={{
                  width: 22, height: 22, borderRadius: '999px',
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  bgcolor: isDone || isActive ? PRIMARY : 'rgba(100,116,139,0.12)',
                  color: isDone || isActive ? '#fff' : MUTED,
                  border: isActive ? `2px solid ${PRIMARY}` : '2px solid transparent',
                  boxShadow: isActive ? '0 0 0 3px rgba(8,145,178,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {isDone ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : stepNumber}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12 },
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? TEXT : isDone ? TEXT : MUTED,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </Typography>
            </Box>
            {index < EDIT_STEPS.length - 1 && (
              <Box sx={{
                width: { xs: 16, sm: 28 }, height: 1,
                bgcolor: isDone ? PRIMARY : 'rgba(15,23,42,0.1)',
                flexShrink: 0,
              }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── path helpers ──────────────────────────────────────────────────────────────

function updatePathInList(paths, id, patch) {
  return paths.map((p) => (p.tempId === id ? { ...p, ...patch } : p));
}

function updateNodeInPath(paths, pathId, nodeId, patch) {
  return paths.map((p) => {
    if (p.tempId !== pathId) return p;
    return { ...p, nodes: (p.nodes ?? []).map((n) => (n.tempId === nodeId ? { ...n, ...patch } : n)) };
  });
}

function updateMaterialInPath(paths, pathId, nodeId, matId, patch) {
  return paths.map((p) => {
    if (p.tempId !== pathId) return p;
    return {
      ...p,
      nodes: (p.nodes ?? []).map((n) => {
        if (n.tempId !== nodeId) return n;
        return { ...n, materials: (n.materials ?? []).map((m) => (m.tempId === matId ? { ...m, ...patch } : m)) };
      }),
    };
  });
}

function getDeleteDialogContent(dc) {
  if (!dc) return { title: 'Xác nhận', message: '' };
  if (dc.type === 'chapter') return { title: 'Xóa chương?', message: `Bạn có chắc muốn xóa "${dc.label}"? Toàn bộ bài học và học liệu trong chương sẽ bị xóa.` };
  if (dc.type === 'lesson') return { title: 'Xóa bài học?', message: `Bạn có chắc muốn xóa "${dc.label}"? Toàn bộ học liệu trong bài học sẽ bị xóa.` };
  return { title: 'Xóa học liệu?', message: `Bạn có chắc muốn xóa "${dc.label}"? Nội dung học liệu sẽ bị xóa vĩnh viễn.` };
}

// ─── page ──────────────────────────────────────────────────────────────────────

export default function MentorEditCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const instructorId = getUser()?.userId ?? null;

  // ── tab ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('info');

  // ── basic info ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState(MENTOR_COURSE_FORM_INITIAL);
  const [formErrors, setFormErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // ── content ──────────────────────────────────────────────────────────────────
  const [paths, setPaths] = useState([]);
  const [contentErrors, setContentErrors] = useState({ root: [], paths: {} });
  const [expandedPaths, setExpandedPaths] = useState({});
  const [expandedNodes, setExpandedNodes] = useState({});
  const [savedSnapshots, setSavedSnapshots] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [savingChapterId, setSavingChapterId] = useState(null);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [pendingChapterId, setPendingChapterId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [coursePascal, setCoursePascal] = useState(null);

  // ── page ─────────────────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const infoValid = useMemo(() => {
    const errs = validateMentorCourseForm(form);
    const name = String(form.CourseName ?? '').trim();
    return Object.keys(errs).length === 0 && name.length >= 3 && Boolean(form.CategoryId) && Boolean(form.LevelId);
  }, [form]);

  const buildSnapshots = useCallback((nextPaths) => {
    const s = {};
    nextPaths.forEach((p) => { s[p.tempId] = serializePathSnapshot(p); });
    return s;
  }, []);

  // ── load ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [categoryResult, levelResult] = await Promise.all([
        fetchCourseCategories(),
        fetchCourseLevels(),
      ]);
      const courseResult = await fetchMentorCourseDetail(courseId);

      if (cancelled) return;

      if (!courseResult.success) {
        toast.error('Không thể tải thông tin khóa học.');
        navigate(`/mentor/courses/${courseId}`, { replace: true });
        return;
      }

      const course = courseResult.course;
      const existing = loadEditCourseDraft(courseId);

      if (existing?.course) {
        const dc = existing.course;
        setForm({
          CourseName: dc.CourseName ?? '',
          Description: dc.Description ?? '',
          CategoryId: dc.CategoryId != null ? String(dc.CategoryId) : '',
          LevelId: dc.LevelId != null ? String(dc.LevelId) : '',
          Thumbnail: dc.Thumbnail ?? '',
          IsPublished: Boolean(dc.IsPublished),
        });
        setCoursePascal(dc);
      } else {
        setForm(courseDetailToEditForm(course));
        setCoursePascal(courseDetailToEditCourse(course));
      }

      const loadedPaths = withNormalizedOrders(
        existing?.paths ?? mapDetailPathsToEditPaths(course.paths ?? []),
      );
      const snaps = buildSnapshots(loadedPaths);
      setPaths(loadedPaths);
      setSavedSnapshots(snaps);
      setIsSaved(Boolean(existing?.meta?.contentSaved) || loadedPaths.length > 0);

      if (categoryResult.ok) setCategoryOptions(categoryResult.categories);
      else toast.error(categoryResult.message || 'Không thể tải danh mục.');
      if (levelResult.ok) setLevelOptions(levelResult.levels);
      else toast.error(levelResult.message || 'Không thể tải trình độ.');

      setOptionsLoading(false);
      setPageLoading(false);
    })();

    return () => { cancelled = true; };
  }, [buildSnapshots, courseId, navigate]);

  // ── form handlers ─────────────────────────────────────────────────────────────

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'IsPublished' ? Boolean(value) : value }));
    if (formErrors[name]) {
      setFormErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleNextTab = () => {
    const fe = validateMentorCourseForm(form);
    if (Object.keys(fe).length > 0) {
      setFormErrors(fe);
      return;
    }
    setActiveTab('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── path / node / material handlers ──────────────────────────────────────────

  const applyPaths = useCallback((updater) => {
    setPaths((prev) => withNormalizedOrders(updater(prev)));
    setContentErrors({ root: [], paths: {} });
  }, []);

  const handleNavigateToContent = useCallback((target) => {
    scrollToContentItem(target, { setExpandedPaths, setExpandedNodes });
  }, []);

  const handleAddPath = () => {
    const np = createEmptyPath();
    applyPaths((prev) => [...prev, np]);
    setExpandedPaths((prev) => ({ ...prev, [np.tempId]: true }));
  };

  const handlePathChange = (id, patch) => applyPaths((prev) => updatePathInList(prev, id, patch));

  const handlePathDelete = (id) => {
    applyPaths((prev) => prev.filter((p) => p.tempId !== id));
    setSavedSnapshots((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setExpandedPaths((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleNodeDelete = (pathId, nodeId) => {
    applyPaths((prev) =>
      prev.map((p) => p.tempId === pathId ? { ...p, nodes: (p.nodes ?? []).filter((n) => n.tempId !== nodeId) } : p),
    );
    setExpandedNodes((prev) => { const n = { ...prev }; delete n[nodeId]; return n; });
  };

  const handleMaterialDelete = (pathId, nodeId, matId) => {
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathId) return p;
        return { ...p, nodes: (p.nodes ?? []).map((n) => n.tempId !== nodeId ? n : { ...n, materials: (n.materials ?? []).filter((m) => m.tempId !== matId) }) };
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'chapter') handlePathDelete(deleteConfirm.pathTempId);
    else if (deleteConfirm.type === 'lesson') handleNodeDelete(deleteConfirm.pathTempId, deleteConfirm.nodeTempId);
    else handleMaterialDelete(deleteConfirm.pathTempId, deleteConfirm.nodeTempId, deleteConfirm.materialTempId);
    setDeleteConfirm(null);
  };

  const requestDeletePath = (id) => {
    const p = paths.find((x) => x.tempId === id);
    setDeleteConfirm({ type: 'chapter', pathTempId: id, label: String(p?.PathName ?? '').trim() || 'Chương này' });
  };

  const requestDeleteNode = (pathId, nodeId) => {
    const p = paths.find((x) => x.tempId === pathId);
    const n = (p?.nodes ?? []).find((x) => x.tempId === nodeId);
    setDeleteConfirm({ type: 'lesson', pathTempId: pathId, nodeTempId: nodeId, label: String(n?.NodeName ?? '').trim() || 'Bài học này' });
  };

  const requestDeleteMaterial = (pathId, nodeId, matId) => {
    const p = paths.find((x) => x.tempId === pathId);
    const n = (p?.nodes ?? []).find((x) => x.tempId === nodeId);
    const m = (n?.materials ?? []).find((x) => x.tempId === matId);
    const typeLabel = MATERIAL_TYPE_LABELS[m?.MaterialType] ?? 'Học liệu';
    setDeleteConfirm({ type: 'material', pathTempId: pathId, nodeTempId: nodeId, materialTempId: matId, label: String(m?.Title ?? '').trim() || `${typeLabel} này` });
  };

  const handleAddNode = (pathId) => {
    const nn = createEmptyNode();
    applyPaths((prev) => prev.map((p) => p.tempId === pathId ? { ...p, nodes: [...(p.nodes ?? []), nn] } : p));
    setExpandedNodes((prev) => ({ ...prev, [nn.tempId]: true }));
  };

  const handleNodeChange = (pathId, nodeId, patch) =>
    applyPaths((prev) => updateNodeInPath(prev, pathId, nodeId, patch));

  const handleAddMaterial = (pathId, nodeId) => {
    const nm = createEmptyMaterial();
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathId) return p;
        return { ...p, nodes: (p.nodes ?? []).map((n) => n.tempId === nodeId ? { ...n, materials: [...(n.materials ?? []), nm] } : n) };
      }),
    );
  };

  const handleMaterialChange = (pathId, nodeId, matId, patch) =>
    applyPaths((prev) => updateMaterialInPath(prev, pathId, nodeId, matId, patch));

  const handleMaterialReorder = (pathId, nodeId, from, to) => {
    applyPaths((prev) =>
      prev.map((p) => {
        if (p.tempId !== pathId) return p;
        return { ...p, nodes: (p.nodes ?? []).map((n) => n.tempId !== nodeId ? n : { ...n, materials: reorderMaterials(n.materials ?? [], from, to) }) };
      }),
    );
  };

  // ── chapter save ──────────────────────────────────────────────────────────────

  const persistToStorage = useCallback((nextPaths) => {
    const prev = loadEditCourseDraft(courseId) ?? {};
    saveEditCourseDraft(courseId, {
      ...prev,
      courseId: Number(courseId),
      paths: sanitizePathsForStorage(nextPaths ?? paths),
    });
    setIsSaved(true);
  }, [courseId, paths]);

  const executeChapterSave = async (pathId) => {
    const p = paths.find((x) => x.tempId === pathId);
    if (!p) return false;
    const pe = validatePathForSave(p);
    if (pe.PathName) {
      setContentErrors((prev) => ({ ...prev, paths: { ...(prev.paths ?? {}), [pathId]: { ...(prev.paths?.[pathId] ?? {}), ...pe } } }));
      toast.error(pe.PathName);
      return false;
    }
    setSavingChapterId(pathId);
    try {
      persistToStorage(paths);
      setSavedSnapshots((s) => ({ ...s, [pathId]: serializePathSnapshot(p) }));
      toast.success('Đã lưu chương.');
      return true;
    } finally {
      setSavingChapterId(null);
    }
  };

  const handleSaveChapter = (pathId) => {
    if (!isSaved) {
      setPendingChapterId(pathId);
      setChapterDialogOpen(true);
      return;
    }
    void executeChapterSave(pathId);
  };

  const handleChapterDialogSave = async () => {
    if (!pendingChapterId) return;
    const ok = await executeChapterSave(pendingChapterId);
    if (!ok) return;
    setChapterDialogOpen(false);
    setPendingChapterId(null);
  };

  // ── save all → review ─────────────────────────────────────────────────────────

  const handleSaveAll = async () => {
    const fe = validateMentorCourseForm(form);
    if (Object.keys(fe).length > 0) {
      setFormErrors(fe);
      setActiveTab('info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.error('Vui lòng kiểm tra lại thông tin cơ bản.');
      return;
    }
    if (!instructorId) {
      toast.error('Không xác định được mentor. Vui lòng đăng nhập lại.');
      return;
    }

    const ce = validateCourseContent(paths);
    setContentErrors(ce);
    if (hasContentValidationErrors(ce)) {
      toast.error('Vui lòng kiểm tra lại cấu trúc nội dung khóa học.');
      setExpandedPaths((prev) => {
        const n = { ...prev };
        paths.forEach((p) => { if (ce.paths?.[p.tempId]) n[p.tempId] = true; });
        return n;
      });
      setExpandedNodes((prev) => {
        const n = { ...prev };
        paths.forEach((p) => {
          const pe2 = ce.paths?.[p.tempId];
          if (!pe2?.nodes) return;
          (p.nodes ?? []).forEach((node) => { if (pe2.nodes[node.tempId]) n[node.tempId] = true; });
        });
        return n;
      });
      const target = getFirstContentErrorTarget(ce, paths);
      if (target) {
        setTimeout(() => {
          document.querySelector(`[data-content-error="${target}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 180);
      }
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildCreateCourseStep1Payload(form, instructorId);
      const newCoursePascal = {
        ...courseDetailToEditCourse({ courseId: Number(courseId) }),
        ...payload,
      };
      saveEditCourseDraft(courseId, {
        courseId: Number(courseId),
        course: newCoursePascal,
        paths: sanitizePathsForStorage(paths),
        meta: { contentSaved: true },
      });
      navigate(`/mentor/courses/${courseId}/review`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={32} sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  const busy = submitting || Boolean(savingChapterId);
  const deleteDialogContent = getDeleteDialogContent(deleteConfirm);

  // Footer for Tab 1
  const tab1Footer = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1.25, pt: 0.5 }}>
      <AppButton
        variant="outlined"
        onClick={() => navigate(`/mentor/courses/${courseId}`)}
        disabled={busy}
        sx={{ minWidth: 100, height: 44, borderRadius: '999px', fontWeight: 700 }}
      >
        Hủy
      </AppButton>
      <AppButton
        onClick={handleNextTab}
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{
          minWidth: 148, height: 44, borderRadius: '999px', fontWeight: 700,
          bgcolor: PRIMARY, '&:hover': { bgcolor: '#0E7490' },
        }}
      >
        Tiếp theo
      </AppButton>
    </Box>
  );

  // Footer for Tab 2 (inside sidebar + mobile bottom)
  const tab2Actions = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, width: '100%' }}>
      <AppButton
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        onClick={() => { setActiveTab('info'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={busy}
        sx={{ flex: '1 1 0', minWidth: 0, height: 42, borderRadius: '999px', fontWeight: 700, fontSize: { xs: 12, sm: 13 } }}
      >
        Quay lại
      </AppButton>
      <AppButton
        onClick={handleSaveAll}
        loading={submitting}
        endIcon={!submitting ? <SaveRoundedIcon sx={{ fontSize: 16 }} /> : undefined}
        disabled={Boolean(savingChapterId)}
        sx={{
          flex: '2 1 0', minWidth: 0, height: 42, borderRadius: '999px',
          fontWeight: 700, fontSize: { xs: 12, sm: 13 },
          bgcolor: PRIMARY, '&:hover': { bgcolor: '#0E7490' },
        }}
      >
        Lưu thay đổi
      </AppButton>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator="/" sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}>
        <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/mentor/courses" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Khóa học của tôi
        </MuiLink>
        <MuiLink component={Link} to={`/mentor/courses/${courseId}`} underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Chi tiết khóa học
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>Chỉnh sửa</Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', mb: 2, maxWidth: 720 }}
      >
        {activeTab === 'info' ? 'Chỉnh sửa thông tin khóa học' : 'Chỉnh sửa nội dung khóa học'}
      </Typography>

      <EditStepIndicator
        activeTab={activeTab}
        onTabChange={setActiveTab}
        infoValid={infoValid}
      />

      {/* ── Tab 1: Thông tin cơ bản ───────────────────────────────────────── */}
      {activeTab === 'info' && (
        <Box sx={{ maxWidth: 1080 }}>
          <MentorCourseCreateForm
            form={form}
            errors={formErrors}
            onChange={handleFormChange}
            onSubmit={(e) => { e.preventDefault(); handleNextTab(); }}
            disabled={busy}
            categoryOptions={categoryOptions}
            levelOptions={levelOptions}
            optionsLoading={optionsLoading}
            footer={tab1Footer}
          />
        </Box>
      )}

      {/* ── Tab 2: Nội dung khóa học ──────────────────────────────────────── */}
      {activeTab === 'content' && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
              gap: { xs: 2, lg: 2.5 },
              alignItems: 'start',
            }}
          >
            <MentorCourseContentBuilder
              paths={paths}
              errors={contentErrors}
              expandedPaths={expandedPaths}
              expandedNodes={expandedNodes}
              onTogglePath={(id) => setExpandedPaths((prev) => ({ ...prev, [id]: prev[id] === false }))}
              onToggleNode={(id) => setExpandedNodes((prev) => ({ ...prev, [id]: prev[id] === false }))}
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
              disabled={busy}
              savedPathSnapshots={savedSnapshots}
              savingChapterId={savingChapterId}
              onSaveChapter={handleSaveChapter}
            />

            <MentorContentOverview
              paths={paths}
              courseName={coursePascal?.CourseName ?? form.CourseName}
              footer={tab2Actions}
              onNavigateToItem={handleNavigateToContent}
            />
          </Box>

          {/* Mobile action row */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mt: 2.5 }}>
            {tab2Actions}
          </Box>
        </>
      )}

      {/* Dialogs */}
      <MentorChapterDraftDialog
        open={chapterDialogOpen}
        onCancel={() => {
          if (savingChapterId) return;
          setChapterDialogOpen(false);
          setPendingChapterId(null);
        }}
        onSaveDraft={handleChapterDialogSave}
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
