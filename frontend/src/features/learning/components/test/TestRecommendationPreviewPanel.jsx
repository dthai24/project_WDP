import { useMemo } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import {
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_VOCABULARY,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  TEST_DIVIDER,
  TEST_MUTED,
  TEST_PRIMARY,
  TEST_SUCCESS,
  TEST_ERROR,
  TEST_TEXT,
} from './testTheme';

const SKILL_DEFINITIONS = [
  {
    skillType: TEST_SKILL_LISTENING,
    label: 'Nghe',
    typeId: 1,
    configKey: 'listeningSectionCount',
    unit: 'section',
  },
  {
    skillType: TEST_SKILL_READING,
    label: 'Đọc',
    typeId: 2,
    configKey: 'readingSectionCount',
    unit: 'section',
  },
  {
    skillType: TEST_SKILL_VOCABULARY,
    label: 'Từ vựng / Ngữ pháp',
    typeId: 3,
    configKey: 'vocabularyTotal',
    unit: 'câu',
  },
];

function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0%';
  return `${Math.round(num * 100)}%`;
}

const RECOMMENDATION_REASON_LABELS = {
  first_attempt: 'Lần đầu làm bài toàn khóa — dùng cấu hình gốc',
  missing_inputs: 'Thiếu thông tin để tạo đề xuất — dùng cấu hình gốc',
  no_section_stats: 'Chưa có thống kê từ lượt làm trước — dùng cấu hình gốc',
  recommended: 'Điều chỉnh đề theo kết quả bài làm gần nhất',
  base: 'Dùng cấu hình gốc của giảng viên',
  extreme_performance: 'Nghe/Đọc đạt 100% đúng hoặc 100% sai — giữ cấu hình gốc',
  extreme_performance_lr: 'Nghe/Đọc đạt 100% đúng hoặc 100% sai — giữ cấu hình gốc phần Nghe/Đọc',
};

function getRecommendationReasonLabel(reason) {
  if (!reason) return '—';
  return RECOMMENDATION_REASON_LABELS[reason] ?? reason;
}

function getRecommendationModeLabel(mode, reason) {
  if (mode === 'recommended') {
    if (reason === 'extreme_performance_lr') {
      return 'Đề xuất một phần (Từ vựng)';
    }
    return 'Đề xuất theo lịch sử';
  }

  if (reason === 'extreme_performance' || reason === 'extreme_performance_lr') {
    return 'Cấu hình gốc';
  }

  return 'Cấu hình gốc (lần đầu)';
}

function parseSectionTempId(sectionTempId) {
  const raw = String(sectionTempId ?? '');
  const composite = raw.match(/^(\d+)::section_(\d+)$/);
  if (composite) {
    return { pathId: Number(composite[1]), sectionId: Number(composite[2]) };
  }
  const simple = raw.match(/^section_(\d+)$/);
  return {
    pathId: null,
    sectionId: simple ? Number(simple[1]) : null,
  };
}

function buildPaperRowsBySkill(paper) {
  const map = new Map(SKILL_DEFINITIONS.map((skill) => [skill.skillType, []]));

  (paper?.sections ?? []).forEach((skillSection) => {
    const groups = skillSection.questionGroups?.length
      ? skillSection.questionGroups
      : [{
        questions: skillSection.questions ?? [],
        sectionId: 'default',
        displayName: skillSection.displayName,
        pathId: null,
      }];

    groups.forEach((group, index) => {
      const rows = map.get(skillSection.skillType) ?? [];
      rows.push({
        key: `${skillSection.skillType}-${group.sectionId ?? index}-${group.pathId ?? ''}`,
        pathId: group.pathId ?? null,
        sectionId: group.sectionId ?? null,
        displayName: group.displayName ?? skillSection.displayName ?? '—',
        questionCount: group.questions?.length ?? 0,
      });
      map.set(skillSection.skillType, rows);
    });
  });

  return map;
}

function buildListeningReadingRows(skillDef, preview, paperRows = []) {
  const chapterStats = skillDef.skillType === TEST_SKILL_LISTENING
    ? preview.listeningChapterStats ?? []
    : preview.readingChapterStats ?? [];

  const weights = skillDef.skillType === TEST_SKILL_LISTENING
    ? preview.chapterWeights?.listening ?? []
    : preview.chapterWeights?.reading ?? [];

  const weightMap = new Map(weights.map((item) => [Number(item.pathId), Number(item.weight)]));
  const sectionStats = (preview.previousSectionStats ?? []).filter(
    (row) => Number(row.typeId) === skillDef.typeId,
  );

  const paperMap = new Map(
    paperRows.map((row) => [`${row.pathId}-${row.sectionId}`, row]),
  );

  if (sectionStats.length > 0) {
    return sectionStats.map((row) => {
      const paperMatch = paperMap.get(`${row.pathId}-${row.sectionId}`);
      return {
        key: `${row.pathId}-${row.sectionId}`,
        pathId: row.pathId,
        sectionId: row.sectionId,
        sectionTitle: row.sectionTitle || '—',
        correctCount: row.correctCount,
        wrongCount: row.wrongCount,
        totalCount: row.totalCount,
        wrongRate: row.wrongRate,
        chapterWeight: weightMap.has(row.pathId) ? weightMap.get(row.pathId).toFixed(2) : '—',
        baseValue: '—',
        recommendedValue: '—',
        delta: '—',
        paperQuestionCount: paperMatch?.questionCount ?? '—',
      };
    });
  }

  if (chapterStats.length > 0) {
    return chapterStats.map((row) => ({
      key: `chapter-${row.pathId}`,
      pathId: row.pathId,
      sectionId: '—',
      sectionTitle: 'Tổng chương',
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      totalCount: row.totalCount,
      wrongRate: row.wrongRate,
      chapterWeight: weightMap.has(row.pathId) ? weightMap.get(row.pathId).toFixed(2) : '—',
      baseValue: '—',
      recommendedValue: '—',
      delta: '—',
      paperQuestionCount: paperRows
        .filter((item) => Number(item.pathId) === Number(row.pathId))
        .reduce((sum, item) => sum + item.questionCount, 0) || '—',
    }));
  }

  return paperRows.map((row) => ({
    key: row.key,
    pathId: row.pathId ?? '—',
    sectionId: row.sectionId ?? '—',
    sectionTitle: row.displayName,
    correctCount: '—',
    wrongCount: '—',
    totalCount: '—',
    wrongRate: null,
    chapterWeight: row.pathId != null && weightMap.has(Number(row.pathId))
      ? weightMap.get(Number(row.pathId)).toFixed(2)
      : '—',
    baseValue: '—',
    recommendedValue: '—',
    delta: '—',
    paperQuestionCount: row.questionCount,
  }));
}

function buildVocabularyRows(preview, paperRows = []) {
  const comparison = preview.vocabularyComparison ?? [];
  const sectionStats = (preview.previousSectionStats ?? []).filter(
    (row) => Number(row.typeId) === 3,
  );
  const statsMap = new Map(
    sectionStats.map((row) => [`${row.pathId}-${row.sectionId}`, row]),
  );
  const paperMap = new Map(
    paperRows.map((row) => [`${row.pathId}-${row.sectionId}`, row]),
  );

  if (comparison.length > 0) {
    return comparison.map((row) => {
      const { pathId, sectionId } = parseSectionTempId(row.sectionTempId);
      const stat = statsMap.get(`${pathId}-${sectionId}`);
      const paperMatch = paperMap.get(`${pathId}-${sectionId}`);

      return {
        key: row.sectionTempId,
        pathId: pathId ?? row.pathId ?? null,
        sectionId: sectionId ?? '—',
        sectionTitle: stat?.sectionTitle || row.sectionTempId,
        correctCount: stat?.correctCount ?? '—',
        wrongCount: stat?.wrongCount ?? '—',
        totalCount: stat?.totalCount ?? '—',
        wrongRate: stat?.wrongRate ?? null,
        chapterWeight: '—',
        baseValue: row.baseCount,
        recommendedValue: row.recommendedCount,
        delta: row.delta > 0 ? `+${row.delta}` : row.delta,
        isLocked: Boolean(row.isLocked),
        paperQuestionCount: paperMatch?.questionCount ?? '—',
      };
    });
  }

  return sectionStats.map((row) => {
    const paperMatch = paperMap.get(`${row.pathId}-${row.sectionId}`);
    return {
      key: `${row.pathId}-${row.sectionId}`,
      pathId: row.pathId,
      sectionId: row.sectionId,
      sectionTitle: row.sectionTitle || '—',
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      totalCount: row.totalCount,
      wrongRate: row.wrongRate,
      chapterWeight: '—',
      baseValue: '—',
      recommendedValue: '—',
      delta: '—',
      paperQuestionCount: paperMatch?.questionCount ?? '—',
    };
  });
}

function buildVocabularyChapters(preview, paperRows = []) {
  const flatRows = buildVocabularyRows(preview, paperRows);
  const chapterStatsMap = new Map(
    (preview.vocabularyChapterStats ?? []).map((item) => [Number(item.pathId), item]),
  );

  const ensureChapter = (groups, pathId) => {
    const id = Number(pathId);
    if (!Number.isInteger(id) || id <= 0) return null;
    if (!groups.has(id)) {
      const chapterStat = chapterStatsMap.get(id);
      groups.set(id, {
        pathId: id,
        chapterWrongRate: chapterStat?.wrongRate ?? null,
        chapterCorrectCount: chapterStat?.correctCount ?? null,
        chapterWrongCount: chapterStat?.wrongCount ?? null,
        chapterTotalCount: chapterStat?.totalCount ?? null,
        rows: [],
        baseTotal: 0,
        recommendedTotal: 0,
      });
    }
    return groups.get(id);
  };

  const groups = new Map();

  flatRows.forEach((row) => {
    const chapter = ensureChapter(groups, row.pathId);
    if (!chapter) return;
    chapter.rows.push(row);
    chapter.baseTotal += Number(row.baseValue) || 0;
    chapter.recommendedTotal += Number(row.recommendedValue) || 0;
  });

  (preview.baseConfigSummary?.vocabularyByChapter ?? []).forEach((item) => {
    const chapter = ensureChapter(groups, item.pathId);
    if (!chapter) return;
    if (chapter.baseTotal === 0) {
      chapter.baseTotal = Number(item.questionCount) || 0;
    }
  });

  (preview.recommendedConfigSummary?.vocabularyByChapter ?? []).forEach((item) => {
    const chapter = ensureChapter(groups, item.pathId);
    if (!chapter) return;
    if (chapter.recommendedTotal === 0) {
      chapter.recommendedTotal = Number(item.questionCount) || 0;
    }
  });

  return [...groups.values()].sort((a, b) => a.pathId - b.pathId);
}

function VocabularyChapterTable({ chapter, colors }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1.25 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEST_TEXT }}>
          Chương {chapter.pathId}
        </Typography>
        {chapter.chapterWrongRate != null && (
          <Chip
            size="small"
            label={`Tỷ lệ sai chương: ${formatPercent(chapter.chapterWrongRate)}`}
            sx={{ fontWeight: 600 }}
          />
        )}
        <Chip
          size="small"
          label={`Gốc: ${chapter.baseTotal} câu`}
          sx={{ fontWeight: 600, bgcolor: alpha(colors.color, 0.08), color: colors.color }}
        />
        <Chip
          size="small"
          label={`Đề xuất: ${chapter.recommendedTotal} câu`}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <TableContainer
        sx={{
          borderRadius: '12px',
          border: `1px solid ${alpha(colors.color, 0.18)}`,
          bgcolor: '#fff',
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: alpha(colors.color, 0.05) }}>
            <TableRow>
              <TableCell sx={headCellSx}>SectionId</TableCell>
              <TableCell sx={headCellSx}>Section</TableCell>
              <TableCell align="center" sx={headCellSx}>Đúng</TableCell>
              <TableCell align="center" sx={headCellSx}>Sai</TableCell>
              <TableCell align="center" sx={headCellSx}>Tổng</TableCell>
              <TableCell align="center" sx={headCellSx}>Tỷ lệ sai</TableCell>
              <TableCell align="center" sx={headCellSx}>Gốc</TableCell>
              <TableCell align="center" sx={headCellSx}>Đề xuất</TableCell>
              <TableCell align="center" sx={headCellSx}>Δ</TableCell>
              <TableCell align="center" sx={headCellSx}>Giữ gốc</TableCell>
              <TableCell align="center" sx={headCellSx}>Đề random</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chapter.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} sx={{ py: 3, textAlign: 'center', color: TEST_MUTED }}>
                  Chưa có section từ vựng cho chương này.
                </TableCell>
              </TableRow>
            ) : (
              chapter.rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell sx={bodyCellSx}>{row.sectionId}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.sectionTitle}</TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, color: TEST_SUCCESS, fontWeight: 700 }}>
                    {row.correctCount}
                  </TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, color: TEST_ERROR, fontWeight: 700 }}>
                    {row.wrongCount}
                  </TableCell>
                  <TableCell align="center" sx={bodyCellSx}>{row.totalCount}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      ...bodyCellSx,
                      fontWeight: 700,
                      color: row.wrongRate != null && row.wrongRate >= 0.5 ? TEST_ERROR : TEST_TEXT,
                    }}
                  >
                    {row.wrongRate != null ? formatPercent(row.wrongRate) : '—'}
                  </TableCell>
                  <TableCell align="center" sx={bodyCellSx}>{row.baseValue}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      ...bodyCellSx,
                      fontWeight: 700,
                      color: Number(row.delta) > 0 ? TEST_ERROR : Number(row.delta) < 0 ? TEST_SUCCESS : TEST_TEXT,
                    }}
                  >
                    {row.recommendedValue}
                  </TableCell>
                  <TableCell align="center" sx={bodyCellSx}>{row.delta}</TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, fontWeight: 700, color: row.isLocked ? TEST_PRIMARY : TEST_MUTED }}>
                    {row.isLocked ? 'Có' : '—'}
                  </TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, fontWeight: 700 }}>
                    {row.paperQuestionCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function VocabularySkillSection({ preview, chapters = [] }) {
  const colors = TEST_SKILL_CHIP_COLORS[TEST_SKILL_VOCABULARY];
  const baseValue = preview.baseConfigSummary?.vocabularyTotal ?? 0;
  const recommendedValue = preview.recommendedConfigSummary?.vocabularyTotal ?? 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: colors.color }}>
          Từ vựng / Ngữ pháp
        </Typography>
        <Chip
          size="small"
          label={`Tổng gốc: ${baseValue} câu`}
          sx={{ fontWeight: 600, bgcolor: alpha(colors.color, 0.08), color: colors.color }}
        />
        <Chip
          size="small"
          label={`Tổng đề xuất: ${recommendedValue} câu`}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {chapters.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: TEST_MUTED, py: 2 }}>
          Chưa có dữ liệu từ vựng/ngữ pháp theo chương.
        </Typography>
      ) : (
        chapters.map((chapter) => (
          <VocabularyChapterTable
            key={chapter.pathId}
            chapter={chapter}
            colors={colors}
          />
        ))
      )}
    </Box>
  );
}

function SkillStatsTable({ skillDef, preview, rows = [] }) {
  const colors = TEST_SKILL_CHIP_COLORS[skillDef.skillType] ?? TEST_SKILL_CHIP_COLORS[TEST_SKILL_LISTENING];
  const baseSummary = preview.baseConfigSummary ?? {};
  const recommendedSummary = preview.recommendedConfigSummary ?? {};
  const baseValue = baseSummary[skillDef.configKey] ?? 0;
  const recommendedValue = recommendedSummary[skillDef.configKey] ?? 0;
  const isVocabulary = skillDef.skillType === TEST_SKILL_VOCABULARY;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: colors.color }}>
          {skillDef.label}
        </Typography>
        <Chip
          size="small"
          label={`Config gốc: ${baseValue} ${skillDef.unit}`}
          sx={{ fontWeight: 600, bgcolor: alpha(colors.color, 0.08), color: colors.color }}
        />
        <Chip
          size="small"
          label={`Đề xuất: ${recommendedValue} ${skillDef.unit}`}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <TableContainer
        sx={{
          borderRadius: '12px',
          border: `1px solid ${alpha(colors.color, 0.18)}`,
          bgcolor: '#fff',
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: alpha(colors.color, 0.05) }}>
            <TableRow>
              <TableCell sx={headCellSx}>PathId</TableCell>
              <TableCell sx={headCellSx}>SectionId</TableCell>
              <TableCell sx={headCellSx}>Section</TableCell>
              <TableCell align="center" sx={headCellSx}>Đúng</TableCell>
              <TableCell align="center" sx={headCellSx}>Sai</TableCell>
              <TableCell align="center" sx={headCellSx}>Tổng</TableCell>
              <TableCell align="center" sx={headCellSx}>Tỷ lệ sai</TableCell>
              {!isVocabulary && <TableCell align="center" sx={headCellSx}>Weight chương</TableCell>}
              {isVocabulary && <TableCell align="center" sx={headCellSx}>Gốc</TableCell>}
              {isVocabulary && <TableCell align="center" sx={headCellSx}>Đề xuất</TableCell>}
              {isVocabulary && <TableCell align="center" sx={headCellSx}>Δ</TableCell>}
              <TableCell align="center" sx={headCellSx}>Đề random</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isVocabulary ? 11 : 10} sx={{ py: 3, textAlign: 'center', color: TEST_MUTED }}>
                  Chưa có dữ liệu cho kỹ năng này.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell sx={bodyCellSx}>{row.pathId}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.sectionId}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.sectionTitle}</TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, color: TEST_SUCCESS, fontWeight: 700 }}>
                    {row.correctCount}
                  </TableCell>
                  <TableCell align="center" sx={{ ...bodyCellSx, color: TEST_ERROR, fontWeight: 700 }}>
                    {row.wrongCount}
                  </TableCell>
                  <TableCell align="center" sx={bodyCellSx}>{row.totalCount}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      ...bodyCellSx,
                      fontWeight: 700,
                      color: row.wrongRate != null && row.wrongRate >= 0.5 ? TEST_ERROR : TEST_TEXT,
                    }}
                  >
                    {row.wrongRate != null ? formatPercent(row.wrongRate) : '—'}
                  </TableCell>
                  {!isVocabulary && (
                    <TableCell align="center" sx={{ ...bodyCellSx, fontWeight: 700, color: TEST_PRIMARY }}>
                      {row.chapterWeight}
                    </TableCell>
                  )}
                  {isVocabulary && (
                    <TableCell align="center" sx={bodyCellSx}>{row.baseValue}</TableCell>
                  )}
                  {isVocabulary && (
                    <TableCell
                      align="center"
                      sx={{
                        ...bodyCellSx,
                        fontWeight: 700,
                        color: Number(row.delta) > 0 ? TEST_ERROR : Number(row.delta) < 0 ? TEST_SUCCESS : TEST_TEXT,
                      }}
                    >
                      {row.recommendedValue}
                    </TableCell>
                  )}
                  {isVocabulary && (
                    <TableCell align="center" sx={bodyCellSx}>{row.delta}</TableCell>
                  )}
                  <TableCell align="center" sx={{ ...bodyCellSx, fontWeight: 700 }}>
                    {row.paperQuestionCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

const headCellSx = {
  fontWeight: 700,
  color: TEST_MUTED,
  fontSize: 12,
  whiteSpace: 'nowrap',
};

const bodyCellSx = {
  fontSize: 13,
  color: TEST_TEXT,
};

export default function TestRecommendationPreviewPanel({
  preview = null,
  paper = null,
  loading = false,
  errorMessage = '',
}) {
  const paperRowsBySkill = useMemo(() => buildPaperRowsBySkill(paper), [paper]);

  const skillRows = useMemo(() => {
    if (!preview) return new Map();

    const map = new Map();
    SKILL_DEFINITIONS.forEach((skillDef) => {
      const paperRows = paperRowsBySkill.get(skillDef.skillType) ?? [];
      if (skillDef.skillType === TEST_SKILL_VOCABULARY) {
        return;
      }
      map.set(
        skillDef.skillType,
        buildListeningReadingRows(skillDef, preview, paperRows),
      );
    });
    return map;
  }, [preview, paperRowsBySkill]);

  const vocabularyChapters = useMemo(() => {
    if (!preview) return [];
    const paperRows = paperRowsBySkill.get(TEST_SKILL_VOCABULARY) ?? [];
    return buildVocabularyChapters(preview, paperRows);
  }, [preview, paperRowsBySkill]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Typography sx={{ fontSize: 14, color: TEST_ERROR, fontWeight: 600, mb: 2 }}>
        {errorMessage}
      </Typography>
    );
  }

  if (!preview) return null;

  const modeLabel = getRecommendationModeLabel(preview.mode, preview.reason);
  const reasonLabel = getRecommendationReasonLabel(preview.reason);
  const modeColor = preview.mode === 'recommended' ? '#7C3AED' : TEST_PRIMARY;

  return (
    <Box
      sx={{
        mt: 3,
        bgcolor: '#fff',
        borderRadius: '16px',
        border: `1px solid ${TEST_DIVIDER}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2.5, borderBottom: `1px solid ${TEST_DIVIDER}` }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: TEST_TEXT, mb: 1 }}>
          Thống kê bài làm gần nhất và Đề xuất bổ sung kiến thức
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={modeLabel}
            size="small"
            sx={{ fontWeight: 700, bgcolor: alpha(modeColor, 0.1), color: modeColor }}
          />
          <Chip
            label={`Lý do: ${reasonLabel}`}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={preview.hasSubmittedBefore ? 'Đã từng làm bài toàn khóa' : 'Chưa từng làm bài toàn khóa'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {preview.latestAttemptId && (
            <Chip
              label={`Lượt làm gần nhất: #${preview.latestAttemptId}`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2.5 }}>
        {SKILL_DEFINITIONS.filter((skillDef) => skillDef.skillType !== TEST_SKILL_VOCABULARY).map((skillDef) => (
          <SkillStatsTable
            key={skillDef.skillType}
            skillDef={skillDef}
            preview={preview}
            rows={skillRows.get(skillDef.skillType) ?? []}
          />
        ))}

        <VocabularySkillSection preview={preview} chapters={vocabularyChapters} />
      </Box>
    </Box>
  );
}
