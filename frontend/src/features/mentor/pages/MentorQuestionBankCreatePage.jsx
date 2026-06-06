/**
 * MentorQuestionBankCreatePage
 * Route: /mentor/question-banks/create?courseId=1[&chapterId=2]
 *
 * Mỗi chương có đúng 1 ngân hàng câu hỏi (Nghe / Đọc / Từ vựng–Ngữ pháp).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  InputBase,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import Loading from '@/shared/ui/Loading';
import MentorTestSectionCard from '@/features/mentor/components/course/MentorTestSectionCard';
import MentorQuestionBankBaiNav from '@/features/mentor/components/questionBank/MentorQuestionBankBaiNav';
import MentorQuestionBankOverview from '@/features/mentor/components/questionBank/MentorQuestionBankOverview';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import {
  SCORING_MODE_AUTO,
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_READING,
  createQuestionBankSection,
  createQuestionBankSkillSections,
  ensureQuestionBankSkillSections,
  getFilledQuestionCount,
  getNonEmptyQuestionBankSections,
  getQuestionBankSectionDisplayTitle,
  getSectionBaiNumber,
  getSectionsBySkill,
  validateTestMaterial,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { CREATE_CARD_SX, MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  createQuestionBank,
  fetchCourseContentOutlineForQB,
  fetchCourseForQB,
  findQuestionBankByChapter,
  updateQuestionBank,
} from '@/features/mentor/services/questionBankService';

const FIELD_LABEL_SX = { fontSize: 12, fontWeight: 700, color: MUTED, mb: 0.5 };

const inputBaseSx = (hasError, disabled = false) => ({
  fontSize: 13,
  color: disabled ? MUTED : TEXT,
  px: 1.25,
  py: 0.75,
  borderRadius: '10px',
  border: `1px solid ${hasError ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
  bgcolor: disabled ? 'rgba(15,23,42,0.03)' : '#fff',
  width: '100%',
  opacity: disabled ? 0.75 : 1,
  '&:focus-within': {
    borderColor: hasError ? '#DC2626' : disabled ? 'rgba(15,23,42,0.12)' : PRIMARY,
  },
});

function FieldError({ msg }) {
  if (!msg) return null;
  return <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>{msg}</Typography>;
}

function validateForm(form, { chaptersCount = 0 } = {}) {
  const errors = {};
  if (chaptersCount === 0) {
    errors.chapterId = 'Khóa học chưa có chương';
  } else if (!form.chapterId) {
    errors.chapterId = 'Vui lòng chọn chương từ mục lục bên phải';
  }
  if (!form.title.trim()) errors.title = 'Vui lòng nhập tên bộ câu hỏi';
  return errors;
}

function resolveChapterEditorState(chapter, bankRes) {
  if (bankRes.ok) {
    const bank = bankRes.bank;
    const loadedSections = ensureQuestionBankSkillSections(
      bank.sections?.length > 0 ? bank.sections : [],
    );
    const firstReading =
      getSectionsBySkill(loadedSections, TEST_SKILL_READING)[0]?.tempId ??
      loadedSections[0]?.tempId ??
      '';

    return {
      editingBankId: bank.id,
      title: bank.title ?? '',
      sections: loadedSections,
      activeSectionId: firstReading,
    };
  }

  const initialSections = createQuestionBankSkillSections();
  return {
    editingBankId: null,
    title: `Bộ câu hỏi – ${chapter.chapterTitle}`,
    sections: initialSections,
    activeSectionId:
      initialSections.find((s) => s.SkillType === TEST_SKILL_READING)?.tempId ?? '',
  };
}

export default function MentorQuestionBankCreatePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const courseId = searchParams.get('courseId') ?? '';
  const chapterId = searchParams.get('chapterId') ?? '';

  const loadedChapterKeyRef = useRef('');

  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    courseId,
    chapterId,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [courseChapters, setCourseChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [sections, setSections] = useState(() => createQuestionBankSkillSections());
  const [sectionErrors, setSectionErrors] = useState({});
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_READING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [editingBankId, setEditingBankId] = useState(null);

  const isEditing = Boolean(editingBankId);

  const hasChapters = courseChapters.length > 0;

  const mapSectionsForSave = (sourceSections) =>
    sourceSections.map((section) => ({
      ...section,
      SectionTitle:
        String(section.SectionTitle ?? '').trim() ||
        getQuestionBankSectionDisplayTitle(section, sourceSections),
    }));

  const canUseBankInfo = useMemo(
    () => Boolean(form.chapterId) && hasChapters,
    [form.chapterId, hasChapters],
  );

  const canUseGenerator = canUseBankInfo && Boolean(form.title.trim());

  const questionCount = useMemo(() => getFilledQuestionCount(sections), [sections]);

  const skillSections = useMemo(
    () => getSectionsBySkill(sections, activeSkill),
    [sections, activeSkill],
  );

  const activeSection = useMemo(() => {
    if (activeSectionId) {
      const found = sections.find((section) => section.tempId === activeSectionId);
      if (found?.SkillType === activeSkill) return found;
    }
    return skillSections[0] ?? null;
  }, [sections, activeSkill, activeSectionId, skillSections]);

  const activeSectionIndex = useMemo(() => {
    if (!activeSection) return 0;
    return getSectionBaiNumber(activeSection, sections) - 1;
  }, [activeSection, sections]);

  const canDeleteActiveSection = skillSections.length > 1;

  const activeChapterId = chapterId || form.chapterId;

  const selectedChapter = useMemo(
    () => courseChapters.find((ch) => String(ch.chapterId) === String(activeChapterId)),
    [courseChapters, activeChapterId],
  );

  const applyChapterEditorState = useCallback((chapter, bankRes) => {
    const nextState = resolveChapterEditorState(chapter, bankRes);
    setEditingBankId(nextState.editingBankId);
    setForm((prev) => ({
      ...prev,
      chapterId: String(chapter.chapterId),
      title: nextState.title,
    }));
    setSections(nextState.sections);
    setSectionErrors({});
    setActiveSkill(TEST_SKILL_READING);
    setActiveSectionId(nextState.activeSectionId);
  }, []);

  const loadChapterContext = useCallback(
    (targetChapterId, { syncUrl = false } = {}) => {
      if (!courseId || !targetChapterId || courseChapters.length === 0) return false;

      const chapter = courseChapters.find((ch) => String(ch.chapterId) === String(targetChapterId));
      if (!chapter) return false;

      const chapterKey = `${courseId}-${targetChapterId}`;
      if (loadedChapterKeyRef.current === chapterKey) {
        if (syncUrl && String(chapterId) !== String(targetChapterId)) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set('courseId', courseId);
              next.set('chapterId', String(targetChapterId));
              return next;
            },
            { replace: true },
          );
        }
        return true;
      }

      const bankRes = findQuestionBankByChapter(courseId, targetChapterId);
      applyChapterEditorState(chapter, bankRes);
      loadedChapterKeyRef.current = chapterKey;

      if (syncUrl) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('courseId', courseId);
            next.set('chapterId', String(targetChapterId));
            return next;
          },
          { replace: true },
        );
      }
      return true;
    },
    [applyChapterEditorState, chapterId, courseChapters, courseId, setSearchParams],
  );

  useEffect(() => {
    if (!courseId) {
      navigate('/mentor/question-banks', { replace: true });
      return;
    }
    let mounted = true;
    setCourseLoading(true);
    fetchCourseForQB(courseId)
      .then((courseRes) => {
        if (!mounted) return;
        if (!courseRes.ok) {
          toast.error('Không tìm thấy khóa học.');
          navigate('/mentor/question-banks', { replace: true });
          return;
        }
        setCourse(courseRes.course);
      })
      .finally(() => {
        if (mounted) setCourseLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId, navigate]);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setChaptersLoading(true);
    fetchCourseContentOutlineForQB(courseId)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) setCourseChapters(res.chapters);
      })
      .finally(() => {
        if (mounted) setChaptersLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    loadedChapterKeyRef.current = '';
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !chapterId || courseChapters.length === 0) return;
    loadChapterContext(chapterId);
  }, [courseId, chapterId, courseChapters, loadChapterContext]);

  useEffect(() => {
    if (!activeSection && skillSections[0]) {
      setActiveSectionId(skillSections[0].tempId);
    }
  }, [activeSection, skillSections]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleChapterSelect = (nextChapterId) => {
    if (String(nextChapterId) === String(activeChapterId)) return;

    if (errors.chapterId) setErrors((prev) => ({ ...prev, chapterId: undefined }));
    loadChapterContext(nextChapterId, { syncUrl: true });
  };

  const handleSectionChange = (tempId, nextSection) => {
    setSections((prev) => prev.map((s) => (s.tempId === tempId ? nextSection : s)));
    if (sectionErrors[tempId]) {
      setSectionErrors((prev) => ({ ...prev, [tempId]: {} }));
    }
  };

  const handleDeleteSection = (tempId) => {
    const section = sections.find((item) => item.tempId === tempId);
    if (!section) return;

    const sameSkillSections = getSectionsBySkill(sections, section.SkillType);
    if (sameSkillSections.length <= 1) return;

    const nextSections = sections.filter((item) => item.tempId !== tempId);
    setSections(nextSections);
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });

    if (activeSectionId === tempId) {
      const fallback = getSectionsBySkill(nextSections, section.SkillType)[0];
      setActiveSectionId(fallback?.tempId ?? '');
    }
  };

  const handleSkillSelect = (skill) => {
    setActiveSkill(skill);
    const existing = getSectionsBySkill(sections, skill);
    if (existing[0]) {
      setActiveSectionId(existing[0].tempId);
      return;
    }

    const newSection = createQuestionBankSection(skill);
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.tempId);
  };

  const handleSectionSelect = (tempId) => {
    if (!tempId) return;
    const section = sections.find((item) => item.tempId === tempId);
    if (!section) return;
    setActiveSkill(section.SkillType);
    setActiveSectionId(tempId);
  };

  const handleAddBai = () => {
    const newSection = createQuestionBankSection(activeSkill);
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.tempId);
  };

  const validateSections = () => {
    if (!canUseGenerator) {
      if (!canUseBankInfo) {
        return {
          _context: 'Vui lòng nhập tên bộ câu hỏi trước khi tạo câu hỏi',
        };
      }
      return { _context: 'Vui lòng nhập tên bộ câu hỏi trước khi tạo câu hỏi' };
    }
    const materialErrors = validateTestMaterial(
      { Title: form.title, Sections: sections, ScoringMode: SCORING_MODE_AUTO },
      { inlineSections: true, skipTitle: true },
    );
    if (materialErrors.Sections) {
      return { sections: materialErrors.Sections, _sections: materialErrors._sections };
    }
    if (materialErrors._sections) {
      return { _sections: materialErrors._sections };
    }
    return {};
  };

  const handleSubmit = async () => {
    const formErrors = validateForm(form, { chaptersCount: courseChapters.length });
    const sectionValidation = validateSections();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (sectionValidation._context || sectionValidation._sections) {
      if (sectionValidation.sections) setSectionErrors(sectionValidation.sections);
      toast.error(
        sectionValidation._context ?? sectionValidation._sections ?? 'Vui lòng thêm câu hỏi.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const sectionsPayload = mapSectionsForSave(getNonEmptyQuestionBankSections(sections));

      const res = editingBankId
        ? await updateQuestionBank(editingBankId, {
            title: form.title.trim(),
            chapterTitle: selectedChapter?.chapterTitle ?? '',
            sections: sectionsPayload,
          })
        : await createQuestionBank({
            title: form.title.trim(),
            courseId: Number(courseId),
            courseTitle: course?.courseName ?? '',
            chapterId: Number(form.chapterId),
            chapterTitle: selectedChapter?.chapterTitle ?? '',
            sections: sectionsPayload,
          });

      if (!res.ok) {
        toast.error(
          res.message ??
            (editingBankId
              ? 'Cập nhật ngân hàng câu hỏi thất bại.'
              : 'Tạo ngân hàng câu hỏi thất bại.'),
        );
        return;
      }

      toast.success(
        editingBankId ? 'Cập nhật ngân hàng câu hỏi thành công!' : 'Tạo ngân hàng câu hỏi thành công!',
      );
      navigate('/mentor/question-banks');
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const footerActions = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%' }}>
      <AppButton
        loading={submitting}
        startIcon={<SaveOutlinedIcon />}
        onClick={handleSubmit}
        fullWidth
        sx={{
          height: 44,
          fontSize: 14,
          fontWeight: 700,
          borderRadius: '999px',
          bgcolor: PRIMARY,
          color: '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
        }}
      >
        Lưu ngân hàng
      </AppButton>
      <AppButton
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate('/mentor/question-banks')}
        fullWidth
        sx={{ height: 44, fontSize: 14, fontWeight: 600, borderRadius: '999px' }}
      >
        Huỷ
      </AppButton>
    </Box>
  );

  if (courseLoading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Loading size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 1520 }, mx: 'auto' }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 0.5, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
      >
        <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <MuiLink
          component={Link}
          to="/mentor/question-banks"
          underline="hover"
          sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
        >
          Ngân hàng câu hỏi
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          {isEditing ? 'Chỉnh sửa' : 'Tạo mới'}
        </Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.02em',
          mb: 0.5,
          maxWidth: 720,
        }}
      >
        {isEditing ? 'Ngân hàng câu hỏi' : 'Tạo ngân hàng câu hỏi'}
      </Typography>
      <Typography sx={{ fontSize: 14, color: MUTED, mb: 2, maxWidth: 720, lineHeight: 1.55 }}>
        Khóa học:{' '}
        <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
          {course?.courseName}
        </Box>
        {selectedChapter ? (
          <>
            {' · Chương: '}
            <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
              {selectedChapter.chapterTitle}
            </Box>
          </>
        ) : null}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
        }}
      >
        <Box sx={{ width: { xs: '100%', lg: 200 }, flexShrink: 0 }}>
          <MentorQuestionBankSkillNav
            sections={sections}
            activeSkill={activeSkill}
            disabled={!canUseGenerator}
            sectionErrors={sectionErrors}
            onSkillChange={handleSkillSelect}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            maxWidth: { lg: 1280 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
            gap: { xs: 2, lg: 2.5 },
            alignItems: 'start',
          }}
        >
        <Box id="question-bank-builder-root">
          <Box sx={{ ...CREATE_CARD_SX, mb: { xs: 2, lg: 0 } }}>
            {!canUseBankInfo && hasChapters && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: MUTED,
                  mb: 2,
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: 'rgba(15,23,42,0.04)',
                  lineHeight: 1.5,
                }}
              >
                Chọn chương từ mục lục khóa học ở cột bên phải để bắt đầu tạo bộ câu hỏi.
              </Typography>
            )}

            <Box
              id="qb-form-info"
              sx={{ mb: 2.5, opacity: canUseBankInfo ? 1 : 0.6, scrollMarginTop: 24 }}
            >
              <Box>
                <Typography sx={FIELD_LABEL_SX}>
                  Tên bộ câu hỏi <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
                </Typography>
                <InputBase
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Ví dụ: Bộ câu hỏi chương 1 – Từ vựng cơ bản"
                  fullWidth
                  disabled={!canUseBankInfo}
                  sx={inputBaseSx(Boolean(errors.title), !canUseBankInfo)}
                />
                <FieldError msg={errors.title} />
              </Box>
            </Box>

            <Box
              id="qb-questions"
              sx={{ opacity: canUseGenerator ? 1 : 0.6, scrollMarginTop: 24 }}
            >
              {!canUseGenerator && (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: MUTED,
                    mb: 2,
                    p: 1.25,
                    borderRadius: '10px',
                    bgcolor: 'rgba(15,23,42,0.04)',
                    lineHeight: 1.5,
                  }}
                >
                  {!canUseBankInfo
                    ? 'Chọn chương từ mục lục bên phải trước khi thêm câu hỏi.'
                    : 'Nhập tên bộ câu hỏi trước khi thêm câu hỏi.'}
                </Typography>
              )}

              <Box sx={{ pointerEvents: canUseGenerator ? 'auto' : 'none' }}>
                {activeSection ? (
                  <>
                    <MentorQuestionBankBaiNav
                      skillSections={skillSections}
                      allSections={sections}
                      activeSectionId={activeSection.tempId}
                      accentColor={TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? PRIMARY}
                      disabled={!canUseGenerator}
                      onSelect={handleSectionSelect}
                      onAdd={handleAddBai}
                    />
                    <Box id={`qb-section-${activeSection.tempId}`} sx={{ scrollMarginTop: 24, minWidth: 0 }}>
                      <MentorTestSectionCard
                        section={activeSection}
                        index={activeSectionIndex}
                        errors={sectionErrors[activeSection.tempId] ?? {}}
                        accentColor={TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? '#7C3AED'}
                        disabled={!canUseGenerator}
                        scoringMode={SCORING_MODE_AUTO}
                        totalScore={100}
                        questionCountAll={questionCount}
                        showScoreField={false}
                        lockSkillType
                        hideDelete={!canDeleteActiveSection}
                        questionBankMode
                        sectionBadgeLabel={`Bài số ${getSectionBaiNumber(activeSection, sections)}`}
                        defaultExpanded
                        onChange={(nextSection) =>
                          handleSectionChange(activeSection.tempId, nextSection)
                        }
                        onDelete={() => handleDeleteSection(activeSection.tempId)}
                      />
                    </Box>
                  </>
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>

        <MentorQuestionBankOverview
          courseName={course?.courseName}
          courseCategory={[course?.categoryName, course?.levelName].filter(Boolean).join(' · ')}
          chapterTitle={selectedChapter?.chapterTitle}
          selectedChapterId={activeChapterId}
          courseChapters={courseChapters}
          chaptersLoading={chaptersLoading}
          chapterError={errors.chapterId}
          courseId={courseId}
          footer={footerActions}
          onChapterSelect={handleChapterSelect}
        />
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'flex', lg: 'none' }, mt: 2.5, pb: 4 }}>{footerActions}</Box>
    </Box>
  );
}
