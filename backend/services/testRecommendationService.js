/**
 * =============================================================================
 * FILE    : testRecommendationService.js
 * MỤC ĐÍCH: Service đề xuất cấu hình bài kiểm tra toàn khóa (scope = 'final')
 * TÀI LIỆU: Thuật toán đề xuất câu hỏi.docx
 * =============================================================================
 * I. TỔNG QUAN
 * ------------
 * Service này triển khai thuật toán "đề xuất câu hỏi" cho bài kiểm tra cuối khóa.
 * Chỉ chạy khi học viên ĐÃ TỪNG nộp bài ít nhất một lần; lần đầu dùng config mentor gốc.
 *
 * Nguyên tắc chung (theo docx):
 *   - Chương học viên SAI NHIỀU hơn (weight cao) → lần sau được phân bổ NHIỀU section/câu hơn
 *   - Tổng section/câu SAU ĐỀ XUẤT <= mentor config (không bắt buộc bằng đúng mentor)
 *   - Chương weight = 0 → không xuất hiện lần làm tiếp theo (Case 3)
 *   - Bank thiếu section/câu → bù theo weight cao → thấp; hết bank → dừng bù
 *   - Service này CHỈ điều chỉnh config (phân bổ theo chương), KHÔNG random câu hỏi
 *   - Random đề thực tế: studentTestPaperService → testPaperRandomService
 *
 * II. RULE DOCX — NGHE / ĐỌC
 * ----------------------------
 * - Tổng section sau đề xuất <= tổng section mentor
 * - Chương thiếu section trong bank → lấy hết section chương đó
 * - Bù phần thiếu sang chương khác theo weight cao → thấp
 * - Random section nếu chương đủ section trong bank
 * - Hết bank → dừng bù, chấp nhận tổng hiện tại (<= mentor)
 * - Weight = 0 → chương không xuất hiện (Case 3)
 * - Công thức: weight = tổng sai / tổng câu; floor phân bổ; bù phần thiếu vào weight lớn nhất
 * - Case 1: weight bằng nhau → giữ config mentor
 * - Exception: chỉ còn 1 chương weight>0 → toàn bộ section thuộc chương đó
 *
 * III. RULE DOCX — TỪ VỰNG / NGỮ PHÁP
 * ------------------------------------
 * - Tổng câu và tổng section sau đề xuất <= mentor
 * - Bank thiếu → lấy hết section chương, bù weight cao → thấp, hết bank → dừng bù
 * - Weight = 0 → chương không xuất hiện (ví dụ: 49 câu mentor → còn 30 câu nếu C3 biến mất)
 * - Bước 1-2: tính weight, xếp hạng ưu tiên
 * - Bước 3: allocateByWeight + rebalanceSectionAllocation
 * - Bước 4: chia đều câu/chương theo mentorQuestionCount; bù vào section nhiều câu nhất
 * - Mỗi section: questionCount không vượt availableCount trong bank
 *
 * IV. ÁNH XẠ DOCX → HÀM
 * ---------------------
 * | Nội dung docx                          | Hàm triển khai                          |
 * |----------------------------------------|-----------------------------------------|
 * | Công thức weight theo chương          | aggregateChapterWeights                 |
 * | Case 1: weight bằng nhau              | allWeightsEqual → null, giữ mentor      |
 * | Case 2: phân bổ section               | allocateByWeight                        |
 * | Case 3: weight = 0                    | filter weight > 0 trong positive        |
 * | Exception: 1 chương còn               | allocateByWeight (positive.length = 1)  |
 * | Nghe/Đọc đề xuất + bank               | recommendListeningReadingAllocation       |
 * | Bank rebalance (cả Nghe/Đọc & Từ vựng)| rebalanceSectionAllocation              |
 * | Từ vựng plan đầy đủ                   | recommendVocabularyPlan                 |
 * | Chia câu đều theo section             | distributeQuestionsAcrossSections       |
 * | Tổng hợp toàn bài                     | recommendCourseTestFromStats            |
 *
 * V. LUỒNG CONTROLLER (studentTestController.startTestAttempt)
 * ------------------------------------------------------------
 *   resolveCourseTestPaperConfig → hasSubmittedBefore?
 *     false → buildCourseTestPaper (mentor gốc)
 *     true  → buildRecommendedCourseTestPaper (đề xuất + random)
 *
 * VI. VÍ DỤ SỐ DOCX
 * -----------------
 * Nghe — 5 section, weight C1=0.35, C2=0.7, C3=0.6 → C1=1, C2=3, C3=1
 * Từ vựng — 12 section → C1=5, C2=3, C3=4; C3 weight=0 → chỉ C1+C2, tổng 30 câu <= 49
 * =============================================================================
 */

// Model truy vấn DB: đọc stat attempt, đếm số lần nộp bài, lấy testId final theo courseId
const studentTestModel = require('../Models/studentTestModel');

// Service lấy config bài test toàn khóa do mentor cấu hình
// (questionConfigs, selectedChapterIds, sectionCount, sectionQuestionCounts...)
const chapterQuizConfigService = require('./chapterQuizConfigService');

/**
 * Hằng số kỹ năng — khớp với:
 *   - Cột SkillType trong bảng Test_Attempt_Section_Stats
 *   - Field `part` trong config mentor (questionConfigs[].part)
 */
const SKILL_LISTENING = 'LISTENING';   // Nghe
const SKILL_READING = 'READING';       // Đọc (docx: dùng chung quy tắc với Nghe)
const SKILL_VOCABULARY = 'VOCABULARY'; // Từ vựng / Ngữ pháp

// =============================================================================
// PHẦN 1: ĐỌC VÀ CHUẨN HÓA DỮ LIỆU TỪ CƠ SỞ DỮ LIỆU
// =============================================================================

/**
 * Chuẩn hóa một dòng thống kê section từ DB sang object JavaScript thống nhất.
 *
 * Dữ liệu từ DB có thể ở dạng PascalCase (AttemptId) hoặc camelCase (attemptId).
 * Hàm này gom về một cấu trúc duy nhất để các hàm tính weight / phân bổ phía sau
 * không phải xử lý hai kiểu đặt tên khác nhau.
 *
 * @param {object} row - Một dòng từ bảng Test_Attempt_Section_Stats
 * @returns {object}   Stat đã chuẩn hóa
 */
function mapSectionStatRow(row = {}) {
  return {
    // Khóa chính bản ghi stat
    attemptSectionStatId: row.AttemptSectionStatId ?? row.attemptSectionStatId ?? null,

    // ID lần làm bài (attempt) chứa stat này
    attemptId: Number(row.AttemptId ?? row.attemptId) || null,

    // ID khóa học
    courseId: Number(row.CourseId ?? row.courseId) || null,

    // ID chương (pathId) — dùng để gom stat theo chương khi tính tỷ lệ sai
    pathId: Number(row.PathId ?? row.pathId) || null,

    // ID loại nội dung (nếu có)
    typeId: Number(row.TypeId ?? row.typeId) || null,

    // Kỹ năng: LISTENING | READING | VOCABULARY
    skillType: String(row.SkillType ?? row.skillType ?? '').trim().toUpperCase() || null,

    // ID section cụ thể trong chương
    sectionId: Number(row.SectionId ?? row.sectionId) || null,

    // Tiêu đề section — chỉ phục vụ hiển thị, không dùng trong tính toán
    sectionTitle: row.SectionTitle ?? row.sectionTitle ?? null,

    // Số câu trả lời đúng
    correctCount: Number(row.CorrectCount ?? row.correctCount) || 0,

    // Số câu trả lời sai — TỬ SỐ khi tính tỷ lệ sai (theo docx)
    wrongCount: Number(row.WrongCount ?? row.wrongCount) || 0,

    // Tổng số câu đã làm — MẪU SỐ khi tính tỷ lệ sai (theo docx)
    totalCount: Number(row.TotalCount ?? row.totalCount) || 0,

    // Thời điểm tạo bản ghi
    createdAt: row.CreatedAt ?? row.createdAt ?? null,
  };
}

/**
 * Lấy thống kê section của lần làm bài final test GẦN NHẤT đã nộp của học viên.
 *
 * Theo docx, thuật toán chỉ dựa trên kết quả lần làm GẦN NHẤT
 * (không gộp trung bình nhiều lần làm).
 *
 * Dữ liệu trả về là đầu vào cho toàn bộ chuỗi:
 *   aggregateChapterWeights → allocateByWeight → recommendCourseTestFromStats
 *
 * @param {object} thamSo
 * @param {number} thamSo.userId   - ID học viên
 * @param {number} thamSo.courseId - ID khóa học
 * @param {number} [thamSo.testId] - ID bài test (tùy chọn; thiếu thì query theo courseId)
 * @returns {Promise<{ attemptId: number|null, sectionStats: object[] }>}
 */
async function getLatestCourseTestAttemptStats({ userId, courseId, testId }) {
  const safeUserId = Number(userId);
  const safeCourseId = Number(courseId);

  // userId không hợp lệ → trả rỗng; nơi gọi sẽ fallback config mentor gốc
  if (!Number.isInteger(safeUserId) || safeUserId <= 0) {
    return { attemptId: null, sectionStats: [] };
  }

  // courseId không hợp lệ → trả rỗng tương tự
  if (!Number.isInteger(safeCourseId) || safeCourseId <= 0) {
    return { attemptId: null, sectionStats: [] };
  }

  // Xác định testId:
  //   - Ưu tiên testId truyền từ controller
  //   - Không có → query DB lấy testId bài final của khóa học
  const resolvedTestId = Number(testId)
    || await studentTestModel.getTestIdByCourseForFinal(safeCourseId);

  if (!resolvedTestId) {
    return { attemptId: null, sectionStats: [] };
  }

  // Lấy tất cả stat section của học viên với bài test này (có thể nhiều attempt)
  const rows = await studentTestModel.getSectionStatsByUserAndTest(safeUserId, resolvedTestId);

  if (!rows.length) {
    return { attemptId: null, sectionStats: [] };
  }

  // Sắp xếp attempt mới nhất lên đầu:
  //   Tiêu chí 1: SubmittedAt giảm dần (nộp gần nhất trước)
  //   Tiêu chí 2: cùng thời gian → AttemptId lớn hơn trước
  const sorted = rows.toSorted((a, b) => {
    const submittedA = new Date(a.SubmittedAt ?? a.StartedAt ?? 0).getTime();
    const submittedB = new Date(b.SubmittedAt ?? b.StartedAt ?? 0).getTime();
    if (submittedB !== submittedA) return submittedB - submittedA;
    return Number(b.AttemptId ?? 0) - Number(a.AttemptId ?? 0);
  });

  const latestAttemptId = Number(sorted[0]?.AttemptId);
  if (!latestAttemptId) {
    return { attemptId: null, sectionStats: [] };
  }

  // Chỉ lấy stat thuộc attempt mới nhất, chuẩn hóa qua mapSectionStatRow
  return {
    attemptId: latestAttemptId,
    sectionStats: sorted
      .filter((row) => Number(row.AttemptId) === latestAttemptId)
      .map(mapSectionStatRow),
  };
}

/**
 * Lấy cấu hình bài kiểm tra toàn khóa do mentor thiết lập.
 *
 * Config mentor là cấu hình GỐC (baseline) — điểm xuất phát cho mọi lần làm bài:
 *   - Tổng section Nghe / Đọc (sectionCount)
 *   - Danh sách section Từ vựng + số câu mỗi section (sectionQuestionCounts)
 *   - Các chương nguồn câu hỏi (selectedChapterIds)
 *
 * Theo docx RULE: tổng section/câu sau đề xuất <= mentor config.
 *
 * @param {number} courseId - ID khóa học
 * @returns {Promise<{ ok: boolean, config?: object, message?: string }>}
 */
async function getMentorCourseTestConfig(courseId) {
  const safeCourseId = Number(courseId);

  if (!Number.isInteger(safeCourseId) || safeCourseId <= 0) {
    return { ok: false, config: null, message: 'courseId không hợp lệ.' };
  }

  const result = await chapterQuizConfigService.getCourseQuizConfig(safeCourseId);
  if (!result.ok) {
    return { ok: false, config: null, message: result.message };
  }

  if (!result.config) {
    return { ok: false, config: null, message: 'Mentor chưa cấu hình bài kiểm tra toàn khóa.' };
  }

  // Mentor có thể tắt bài test (enabled = false) mà chưa xóa config
  if (!result.config.enabled) {
    return { ok: false, config: null, message: 'Bài kiểm tra toàn khóa chưa được bật.' };
  }

  return { ok: true, config: result.config };
}

// =============================================================================
// PHẦN 2: HÀM PHỤ TRỢ ĐỌC CONFIG MENTOR (không truy vấn DB)
// =============================================================================

/**
 * Tìm entry cấu hình của một part trong mảng questionConfigs.
 *
 * Mỗi part = một kỹ năng: LISTENING, READING, hoặc VOCABULARY.
 *
 * @param {object} config - Config mentor đầy đủ
 * @param {string} part   - 'LISTENING' | 'READING' | 'VOCABULARY'
 * @returns {object} Entry config của part đó, hoặc {} nếu không tìm thấy
 */
function getPartConfig(config, part) {
  return (config?.questionConfigs ?? []).find((entry) => entry.part === part) ?? {};
}

/**
 * Lấy số section mentor cấu hình cho Nghe hoặc Đọc.
 *
 * Theo docx RULE Nghe/Đọc: tổng section sau đề xuất <= mentor sectionCount.
 *
 * Ví dụ docx: mentor config 5 section Nghe → allocateByWeight phân bổ tối đa 5
 * (có thể ít hơn nếu question bank không đủ sau rebalance).
 *
 * @param {object} config - Config mentor
 * @param {string} part   - 'LISTENING' hoặc 'READING'
 * @returns {number} Số section (>= 0)
 */
function getSectionCount(config, part) {
  return Math.max(0, Number(getPartConfig(config, part).sectionCount ?? 0) || 0);
}

/**
 * Lấy danh sách section Từ vựng mentor đã chọn kèm số câu mỗi section.
 *
 * Dữ liệu từ field sectionQuestionCounts trong config part VOCABULARY.
 * Chỉ giữ entry hợp lệ: có sectionTempId và questionCount > 0.
 *
 * @param {object} config - Config mentor
 * @returns {{ sectionTempId: string, questionCount: number }[]}
 */
function getVocabularyEntries(config) {
  return (getPartConfig(config, SKILL_VOCABULARY).sectionQuestionCounts ?? [])
    .map((entry) => ({
      sectionTempId: String(entry.sectionTempId ?? ''),
      questionCount: Math.max(0, Number(entry.questionCount ?? 0) || 0),
    }))
    .filter((entry) => entry.sectionTempId && entry.questionCount > 0);
}

/**
 * Phân tích chuỗi sectionTempId thành pathId (chương) và sectionId.
 *
 * Định dạng hỗ trợ:
 *   - "12::section_34" → { pathId: 12, sectionId: 34 }  (chuẩn bài test toàn khóa)
 *   - "section_34"     → { pathId: null, sectionId: 34 } (dự phòng)
 *
 * @param {string} sectionTempId - Chuỗi định danh section
 * @returns {{ pathId: number|null, sectionId: number|null }}
 */
function parseCourseSectionTempId(sectionTempId) {
  const raw = String(sectionTempId ?? '');

  const composite = raw.match(/^(\d+)::section_(\d+)$/);
  if (composite) {
    return { pathId: Number(composite[1]), sectionId: Number(composite[2]) };
  }

  const simple = raw.match(/^section_(\d+)$/);
  return { pathId: null, sectionId: simple ? Number(simple[1]) : null };
}

/**
 * Tạo sectionTempId chuẩn cho bài test toàn khóa.
 * Định dạng: "{pathId}::section_{sectionId}"
 *
 * @param {number} pathId    - ID chương
 * @param {number} sectionId - ID section
 * @returns {string}
 */
function buildCourseSectionTempId(pathId, sectionId) {
  return `${pathId}::section_${sectionId}`;
}

/**
 * Kiểm tra section có được dùng trong bài kiểm tra không.
 * Dựa cột IsUseForTest trong DB:
 *   - true hoặc không có giá trị → được dùng
 *   - false hoặc 0 → loại khỏi question bank
 *
 * @param {object} section - Object section từ DB
 * @returns {boolean}
 */
function isSectionUseForTest(section) {
  return section?.IsUseForTest !== false && section?.IsUseForTest !== 0;
}

// =============================================================================
// PHẦN 3: THUẬT TOÁN CỐT LÕI — TÍNH TỶ LỆ SAI (WEIGHT) VÀ PHÂN BỔ THEO CHƯƠNG
// =============================================================================

/**
 * Gom stat theo chương (pathId) và tính weight = tỷ lệ sai.
 *
 * CÔNG THỨC (docx — mục "Công thức tính", áp dụng cho cả Nghe/Đọc và Từ vựng):
 *   Tỷ lệ sai của chương = Tổng câu sai / Tổng câu hỏi trong chương
 *   (cùng skillType; gom nhiều section trong cùng chương)
 *
 * VÍ DỤ DOCX — Nghe, 5 section mentor config:
 *   Chương 1: sai 7/20 → weight = 0.35
 *   Chương 2: sai 7/10 → weight = 0.70
 *   Chương 3: sai 12/20 → weight = 0.60
 *
 * VÍ DỤ DOCX — Từ vựng:
 *   Chương 1: sai 7/13 → weight ≈ 0.54
 *   Chương 2: sai 8/17 → weight ≈ 0.47
 *   Chương 3: sai 10/19 → weight ≈ 0.53
 *
 * @param {object[]} sectionStats - Stat đã chuẩn hóa
 * @param {string}   skillType     - LISTENING | READING | VOCABULARY
 * @returns {{ pathId, weight, wrongCount, totalCount }[]} Sắp xếp theo pathId tăng dần
 */
function aggregateChapterWeights(sectionStats, skillType) {
  const chapters = new Map();

  for (const row of sectionStats) {
    if (row.skillType !== skillType) continue;

    const pathId = Number(row.pathId);
    if (!pathId) continue;

    const bucket = chapters.get(pathId) ?? { pathId, wrongCount: 0, totalCount: 0 };
    bucket.wrongCount += Number(row.wrongCount) || 0;
    bucket.totalCount += Number(row.totalCount) || 0;
    chapters.set(pathId, bucket);
  }

  return [...chapters.values()]
    .map((chapter) => ({
      pathId: chapter.pathId,
      weight: chapter.totalCount > 0 ? chapter.wrongCount / chapter.totalCount : 0,
      wrongCount: chapter.wrongCount,
      totalCount: chapter.totalCount,
    }))
    .sort((left, right) => left.pathId - right.pathId);
}

/**
 * Kiểm tra tất cả chương có weight gần bằng nhau không.
 *
 * DOCX — Trường hợp 1 (Nghe/Đọc):
 *   "Tất cả các chương có tỷ lệ sai = nhau → Giữ nguyên config ban đầu của Mentor"
 *
 * DOCX — Trường hợp Exception (Từ vựng/Nghe/Đọc):
 *   Khi chỉ còn 1 chương và weight = 0 → quay lại Trường hợp 1
 *
 * Dùng epsilon 1e-9 để so sánh số thực, tránh lỗi floating-point.
 *
 * @param {{ weight: number }[]} chapters
 * @returns {boolean} true nếu weight bằng nhau (hoặc chỉ có 0-1 chương)
 */
function allWeightsEqual(chapters) {
  if (chapters.length <= 1) return true;

  const first = chapters[0].weight;
  return chapters.every((chapter) => Math.abs(chapter.weight - first) < 1e-9);
}

/**
 * Phân bổ totalCount section cho các chương theo tỷ lệ weight.
 *
 * CÔNG THỨC (docx):
 *   Lượng section của chương =
 *     (Tỷ lệ sai chương / Tổng tỷ lệ sai tất cả chương) × Tổng section mentor config
 *   → Làm tròn XUỐNG (floor)
 *   → Phần thiếu bù vào chương có weight CAO NHẤT
 *
 * VÍ DỤ DOCX — Nghe, 5 section, weight C1=0.35, C2=0.7, C3=0.6, tổng weight=1.65:
 *   C1 = floor(0.35/1.65 × 5) = floor(1.06) = 1
 *   C2 = floor(0.70/1.65 × 5) = floor(2.12) = 2
 *   C3 = floor(0.60/1.65 × 5) = floor(1.81) = 1
 *   Tổng = 4 < 5 → bù 1 vào C2 (weight cao nhất) → Kết quả: C1=1, C2=3, C3=1
 *
 * VÍ DỤ DOCX — Từ vựng, 12 section, weight C1=0.54, C2=0.47, C3=0.53, tổng=1.54:
 *   C1 = floor(0.54/1.54 × 12) = 4
 *   C2 = floor(0.47/1.54 × 12) = 3
 *   C3 = floor(0.53/1.54 × 12) = 4
 *   Tổng = 11 < 12 → bù 1 vào C1 (weight cao nhất) → C1=5, C2=3, C3=4
 *
 * DOCX — Trường hợp Exception:
 *   Chỉ còn 1 chương có weight > 0 → toàn bộ section thuộc chương đó
 *
 * @param {{ pathId, weight }[]} chapters   - Chương có weight > 0
 * @param {number}              totalCount - Tổng section mentor config
 * @returns {Map<number, number>} Map<pathId, số section>
 */
function allocateByWeight(chapters, totalCount) {
  const positive = chapters.filter((chapter) => chapter.weight > 0);

  if (totalCount <= 0 || positive.length === 0) return new Map();

  // DOCX Trường hợp Exception: chỉ 1 chương weight > 0 → test chỉ chứa chương đó
  if (positive.length === 1) {
    return new Map([[positive[0].pathId, totalCount]]);
  }

  const weightTotal = positive.reduce((sum, chapter) => sum + chapter.weight, 0);

  // Bước 1 docx: làm tròn XUỐNG (floor) số section mỗi chương
  const quotas = positive.map((chapter) => ({
    pathId: chapter.pathId,
    weight: chapter.weight,
    count: Math.floor((chapter.weight / weightTotal) * totalCount),
  }));

  // Bước 2 docx: tính phần thiếu do floor
  let remaining = totalCount - quotas.reduce((sum, quota) => sum + quota.count, 0);

  // Bước 3 docx: bù phần thiếu vào chương weight cao nhất trước
  const byWeight = [...quotas].sort(
    (left, right) => right.weight - left.weight || left.pathId - right.pathId,
  );

  for (const quota of byWeight) {
    if (remaining <= 0) break;
    quota.count += 1;
    remaining -= 1;
  }

  const allocation = new Map();
  quotas.forEach((quota) => {
    if (quota.count > 0) allocation.set(quota.pathId, quota.count);
  });
  return allocation;
}

/**
 * Loại chương có số section phân bổ = 0 khỏi Map.
 *
 * Cần thiết sau rebalanceSectionAllocation khi bank rỗng hoặc deficit không bù được:
 * Map có thể còn entry pathId → 0; hàm này chỉ giữ các chương thực sự có section > 0.
 *
 * @param {Map<number, number>} allocation - Map<pathId, số section>
 * @returns {Map<number, number>}
 */
function sanitizeSectionAllocation(allocation) {
  const result = new Map();
  for (const [pathId, count] of allocation) {
    if (count > 0) result.set(pathId, count);
  }
  return result;
}

// =============================================================================
// PHẦN 4: ĐỀ XUẤT PHÂN BỔ SECTION CHO NGHE / ĐỌC
// =============================================================================
//
// DOCX — Nghe/Đọc:
//   "Chương sai nhiều được phân bổ nhiều section/bài nghe/bài đọc hơn"
//   "Không cần xác định mỗi section lấy bao nhiêu câu vì một section được lấy nguyên bài"
//
// Đọc dùng CHUNG quy tắc với Nghe (docx không tách riêng).
// =============================================================================

/**
 * Đề xuất phân bổ section Nghe hoặc Đọc theo chương.
 *
 * QUY TẮC DOCX:
 *   RULE: Tổng section sau đề xuất <= mentor; đối chiếu bank + bù weight cao → thấp
 *
 *   Trường hợp 1 — tỷ lệ sai bằng nhau:
 *     → trả null → giữ config mentor gốc
 *
 *   Trường hợp 2 — tỷ lệ sai khác nhau:
 *     → allocateByWeight → Map<pathId, sectionCount>
 *
 *   Trường hợp 3 — chương có weight = 0:
 *     → không xuất hiện trong lần làm tiếp theo (loại khỏi positive)
 *
 *   Trường hợp Exception — chỉ còn 1 chương weight > 0:
 *     → toàn bộ section thuộc chương đó (xử lý trong allocateByWeight)
 *
 * Kết quả ghi vào config.chapterSectionCounts[skillType],
 * testPaperRandomService dùng khi random chọn section từ question bank.
 *
 * @param {object[]} sectionStats
 * @param {object}   mentorConfig
 * @param {string}   skillType - 'LISTENING' hoặc 'READING'
 * @param {object[]} [sectionsData] - Question bank (đối chiếu + rebalance)
 * @returns {Map<number, number>|null}
 */
function recommendListeningReadingAllocation(
  sectionStats,
  mentorConfig,
  skillType,
  sectionsData = [],
) {
  const totalSections = getSectionCount(mentorConfig, skillType);
  if (totalSections <= 0) return null;

  const chapters = aggregateChapterWeights(sectionStats, skillType);

  // DOCX Trường hợp 1: weight bằng nhau → không đề xuất
  if (chapters.length === 0 || allWeightsEqual(chapters)) return null;

  // DOCX Trường hợp 3: chỉ lấy chương weight > 0
  const positive = chapters.filter((chapter) => chapter.weight > 0);
  if (positive.length === 0) return null;

  // Bước 1 docx Case 2: phân bổ floor + bù phần thiếu vào weight cao nhất
  let allocation = allocateByWeight(positive, totalSections);

  // Bước 2 docx RULE bank Nghe/Đọc: đối chiếu question bank, bù deficit theo weight
  const bankByChapter = groupSkillBankByChapter(sectionsData, skillType);
  if (bankByChapter.size > 0) {
    allocation = rebalanceSectionAllocation(allocation, bankByChapter, positive);
  }

  // Bước 3: loại chương count=0; nếu hết bank → tổng có thể < mentor (docx: <= mentor)
  allocation = sanitizeSectionAllocation(allocation);

  return allocation.size > 0 ? allocation : null;
}

// =============================================================================
// PHẦN 5: ĐỀ XUẤT KẾ HOẠCH TỪ VỰNG / NGỮ PHÁP
// =============================================================================
//
// DOCX — Từ vựng phức tạp hơn Nghe/Đọc vì cần:
//   1. Phân bổ SỐ SECTION theo chương (giống Nghe/Đọc)
//   2. Chọn SECTION CỤ THỂ từ question bank (random nếu đủ section)
//   3. Đối chiếu question bank — rebalance nếu chương thiếu section
//   4. Chia ĐỀU số câu mentor config cho các section đã chọn
//
// DOCX RULE Từ vựng:
//   - Tổng câu/section sau đề xuất <= mentor config
//   - weight = 0 → chương không xuất hiện
//   - Bank thiếu → lấy hết section chương, bù weight cao → thấp, hết bank → dừng bù
// =============================================================================

/**
 * Nhóm section trong question bank theo chương (pathId) cho một kỹ năng.
 *
 * Dùng chung cho:
 *   - Nghe/Đọc: rebalanceSectionAllocation (đếm số section usable mỗi chương)
 *   - Từ vựng: groupVocabularyBankByChapter bọc thêm metadata (sectionTempId, availableCount)
 *
 * Chỉ lấy section có SkillType khớp và IsUseForTest = true.
 *
 * @param {object[]} sectionsData - Toàn bộ section đã load từ selectedChapterIds
 * @param {string}   skillType - LISTENING | READING | VOCABULARY
 * @returns {Map<number, object[]>} Map<pathId, mảng section DB>
 */
function groupSkillBankByChapter(sectionsData = [], skillType) {
  const byChapter = new Map();

  for (const section of sectionsData) {
    if (section.SkillType !== skillType || !isSectionUseForTest(section)) continue;

    const pathId = Number(section.PathId ?? section.pathId);
    if (!pathId) continue;

    if (!byChapter.has(pathId)) {
      byChapter.set(pathId, []);
    }

    byChapter.get(pathId).push(section);
  }

  return byChapter;
}

/**
 * Nhóm section Từ vựng trong question bank theo chương (pathId).
 *
 * Chỉ lấy section:
 *   - SkillType = 'VOCABULARY'
 *   - IsUseForTest = true
 *
 * @param {object[]} sectionsData - Section load từ DB
 * @returns {Map<number, object[]>} Map<pathId, danh sách section>
 */
function groupVocabularyBankByChapter(sectionsData = []) {
  const byChapter = new Map();
  const rawByChapter = groupSkillBankByChapter(sectionsData, SKILL_VOCABULARY);

  for (const [pathId, pool] of rawByChapter) {
    byChapter.set(pathId, pool.map((item) => ({
      pathId,
      sectionId: Number(item.SectionId),
      sectionTempId: buildCourseSectionTempId(pathId, item.SectionId),
      availableCount: Number(item.QuestionCount ?? item.questionCount ?? 0) || 0,
    })));
  }

  return byChapter;
}

/**
 * Tổng hợp config Từ vựng mentor theo chương.
 *
 * Dùng để biết mỗi chương mentor chọn bao nhiêu section và tổng bao nhiêu câu.
 * Làm cơ sở giữ nguyên tổng khi đề xuất lại phân bổ (theo docx RULE).
 *
 * Ví dụ docx mentor config 12 section:
 *   Chương 1: 4 section, 13 câu
 *   Chương 2: 4 section, 17 câu
 *   Chương 3: 4 section, 19 câu
 *
 * @param {object} mentorConfig
 * @returns {{ totalSections: number, byChapter: Map }}
 */
function buildMentorVocabularyChapterSummary(mentorConfig) {
  const entries = getVocabularyEntries(mentorConfig);
  const byChapter = new Map();

  for (const entry of entries) {
    const parsed = parseCourseSectionTempId(entry.sectionTempId);
    const pathId = parsed.pathId;
    if (!pathId) continue;

    if (!byChapter.has(pathId)) {
      byChapter.set(pathId, { pathId, mentorSectionCount: 0, mentorQuestionCount: 0 });
    }

    const bucket = byChapter.get(pathId);
    bucket.mentorSectionCount += 1;
    bucket.mentorQuestionCount += entry.questionCount;
  }

  return {
    totalSections: entries.length,
    byChapter,
  };
}

/**
 * Cân bằng phân bổ section khi question bank không đủ section ở một chương.
 *
 * DOCX — áp dụng cho CẢ Nghe/Đọc VÀ Từ vựng (RULE bank giống nhau):
 *   "Nếu lượng section hiện tại của chương > lượng section trong question bank
 *    → Lấy toàn bộ section của chương đó
 *    → Phần section còn thiếu bù vào chương khác theo weight từ cao xuống thấp"
 *
 * DOCX — khi hết bank:
 *   "Dừng bù, chấp nhận tổng section hiện tại (<= mentor)"
 *   → deficit còn lại sau vòng bù KHÔNG được phân thêm (hàm return, không throw)
 *
 * Ví dụ Nghe: allocate C2=3 nhưng bank C2 chỉ có 1 section
 *   → C2=1, deficit=2 → bù sang C3 (weight tiếp theo) nếu C3 còn chỗ trong bank
 *
 * @param {Map<number, number>} allocation - Phân bổ ban đầu từ allocateByWeight
 * @param {Map<number, object[]>} bankByChapter - Bank nhóm theo chương (mảng section)
 * @param {{ pathId, weight }[]} chaptersByWeight - Chương weight > 0 (đã loại Case 3)
 * @returns {Map<number, number>} Phân bổ sau rebalance (tổng có thể < mentor)
 */
function rebalanceSectionAllocation(allocation, bankByChapter, chaptersByWeight) {
  const result = new Map(allocation);
  let deficit = 0;

  // Bước 1 docx: cắt allocation vượt quá số section thực có trong bank
  for (const [pathId, count] of result) {
    const available = (bankByChapter.get(pathId) ?? []).length;
    if (count > available) {
      result.set(pathId, available);
      deficit += count - available;
    }
  }

  if (deficit <= 0) return result;

  // Bước 2 docx: bù deficit sang chương khác — ưu tiên weight từ cao xuống thấp
  const priority = [...chaptersByWeight].sort(
    (left, right) => right.weight - left.weight || left.pathId - right.pathId,
  );

  for (const chapter of priority) {
    if (deficit <= 0) break;

    const pathId = chapter.pathId;
    const available = (bankByChapter.get(pathId) ?? []).length;
    const current = result.get(pathId) ?? 0;
    const canAdd = Math.max(0, available - current);

    if (canAdd <= 0) continue;

    const add = Math.min(canAdd, deficit);
    result.set(pathId, current + add);
    deficit -= add;
  }

  // deficit > 0 tại đây = hết bank, docx: dừng bù (không làm gì thêm)
  return result;
}

/**
 * Chọn ngẫu nhiên `count` section từ pool.
 *
 * DOCX — Từ vựng:
 *   "Lấy random nếu đủ section trong question bank"
 *
 * @param {object[]} pool  - Danh sách section có thể chọn
 * @param {number}   count - Số section cần chọn
 * @returns {object[]}
 */
function pickRandomSections(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Chia đều tổng câu mentor cho các section đã chọn.
 *
 * DOCX — Từ vựng, bước 4 "Random câu hỏi theo section":
 *   "Chia đều số câu hỏi cho các section"
 *   "Phần thiếu → lấy ở section có nhiều câu hỏi nhất trong question bank"
 *
 * Ví dụ docx — Chương 1: 13 câu, 5 section:
 *   base = floor(13/5) = 2 câu/section → còn thiếu 3 câu
 *   → bù 3 câu vào section có availableCount cao nhất
 *
 * Ví dụ docx — Chương 2: 17 câu, 3 section:
 *   base = 5 câu/section → còn thiếu 2 câu → bù 2 câu vào section nhiều câu nhất
 *
 * Ràng buộc bank (docx):
 *   - questionCount mỗi section <= availableCount
 *   - Nếu bank không đủ cho mentorQuestionCount → dừng bù, tổng câu chương < mentor
 *
 * @param {object[]} sections       - Section đã chọn (có sectionTempId, availableCount)
 * @param {number}   totalQuestions - Tổng câu mentor config cho chương này (mentorQuestionCount)
 * @returns {{ sectionTempId: string, questionCount: number }[]}
 */
function distributeQuestionsAcrossSections(sections, totalQuestions) {
  if (sections.length === 0 || totalQuestions <= 0) return [];

  const base = Math.floor(totalQuestions / sections.length);

  // Bước 1: chia đều floor, nhưng không vượt availableCount từng section
  const plan = sections.map((section) => ({
    sectionTempId: section.sectionTempId,
    questionCount: Math.min(base, section.availableCount),
    availableCount: section.availableCount,
  }));

  let remaining = totalQuestions - plan.reduce((sum, entry) => sum + entry.questionCount, 0);

  // Bước 2 docx: bù phần thiếu vào section có nhiều câu nhất trong bank
  const byAvailability = [...plan].sort(
    (left, right) => right.availableCount - left.availableCount
      || left.sectionTempId.localeCompare(right.sectionTempId),
  );

  for (const entry of byAvailability) {
    if (remaining <= 0) break;
    if (entry.questionCount >= entry.availableCount) continue;
    entry.questionCount += 1;
    remaining -= 1;
  }

  // remaining > 0 = bank không đủ → docx: chấp nhận tổng < mentorQuestionCount
  return plan
    .filter((entry) => entry.questionCount > 0)
    .map(({ sectionTempId, questionCount }) => ({ sectionTempId, questionCount }));
}

/**
 * Đề xuất kế hoạch Từ vựng đầy đủ: chọn section cụ thể + số câu mỗi section.
 *
 * LUỒNG THEO DOCX (4 bước):
 *   Bước 1: Tính tỷ lệ sai (weight) mỗi chương — aggregateChapterWeights
 *   Bước 2: Xếp hạng ưu tiên theo weight từ cao xuống thấp
 *   Bước 3: Quyết định số section mỗi chương — allocateByWeight + rebalanceSectionAllocation
 *   Bước 4: Chia đều câu hỏi theo section — distributeQuestionsAcrossSections
 *
 * RULE DOCX: tổng section/câu <= mentor; weight=0 loại chương; bank thiếu → dừng bù
 *
 * Output vocabularyPlan → testPaperRandomService dùng khi random câu hỏi.
 *
 * @param {object[]} sectionStats
 * @param {object}   mentorConfig
 * @param {object[]} sectionsData - Question bank
 * @returns {{ sectionTempId, questionCount }[]|null}
 */
function recommendVocabularyPlan(sectionStats, mentorConfig, sectionsData = []) {
  const mentorSummary = buildMentorVocabularyChapterSummary(mentorConfig);
  const { totalSections, byChapter: mentorByChapter } = mentorSummary;

  if (totalSections <= 0) return null;

  const chapters = aggregateChapterWeights(sectionStats, SKILL_VOCABULARY);

  // DOCX Trường hợp 1: weight bằng nhau → không đề xuất
  if (chapters.length === 0 || allWeightsEqual(chapters)) return null;

  // DOCX Case 3 / RULE: chỉ chương weight > 0 tham gia đề xuất
  // Ví dụ docx: C3 weight=0 → không có trong sectionAllocation → mất 19 câu C3
  const positive = chapters.filter((chapter) => chapter.weight > 0);
  if (positive.length === 0) return null;

  const bankByChapter = groupVocabularyBankByChapter(sectionsData);

  // DOCX bước 3: phân bổ section theo weight (ví dụ 12 section → 5,3,4)
  let sectionAllocation = allocateByWeight(positive, totalSections);

  // DOCX: đối chiếu question bank, bù section thiếu sang chương khác (weight cao → thấp)
  sectionAllocation = rebalanceSectionAllocation(sectionAllocation, bankByChapter, positive);
  sectionAllocation = sanitizeSectionAllocation(sectionAllocation);

  if (sectionAllocation.size === 0) return null;

  const vocabularyPlan = [];

  // DOCX bước 4: với mỗi chương còn lại → random section + chia câu đều
  for (const [pathId, sectionCount] of sectionAllocation) {
    if (sectionCount <= 0) continue;

    const mentorChapter = mentorByChapter.get(pathId);
    // Số câu mentor config cho chương này (vd C1=13). Chương weight=0 không vào vòng lặp.
    const mentorQuestionCount = mentorChapter?.mentorQuestionCount ?? 0;

    const pool = bankByChapter.get(pathId) ?? [];
    const picked = pickRandomSections(pool, sectionCount);

    const questionPlan = distributeQuestionsAcrossSections(picked, mentorQuestionCount);
    vocabularyPlan.push(...questionPlan);
  }

  return vocabularyPlan.length > 0 ? vocabularyPlan : null;
}

// =============================================================================
// PHẦN 6: HÀM TỔNG HỢP — ĐIỀU CHỈNH TOÀN BỘ CONFIG MENTOR
// =============================================================================

/**
 * Điều chỉnh config mentor dựa trên stat lần làm gần nhất.
 * HÀM TRUNG TÂM của thuật toán đề xuất.
 *
 * Đầu vào:
 *   - sectionStats  : stat từ getLatestCourseTestAttemptStats
 *   - mentorConfig  : config gốc mentor
 *   - sectionsData  : question bank (bắt buộc cho Từ vựng)
 *
 * Đầu ra — config đã điều chỉnh (hoặc giữ nguyên mentor nếu không đề xuất):
 *   {
 *     ...mentorConfig,
 *     chapterSectionCounts: {
 *       LISTENING: Map<pathId, sectionCount>,  // phân bổ Nghe theo chương
 *       READING:   Map<pathId, sectionCount>,  // phân bổ Đọc theo chương
 *     },
 *     vocabularyPlan: [                        // kế hoạch Từ vựng chi tiết
 *       { sectionTempId: "1::section_5", questionCount: 3 },
 *       ...
 *     ]
 *   }
 *
 * Deep clone config để không thay đổi object gốc của mentor.
 *
 * @param {object[]} sectionStats
 * @param {object}   mentorConfig
 * @param {object[]} sectionsData
 * @returns {object}
 */
function recommendCourseTestFromStats(sectionStats, mentorConfig, sectionsData = []) {
  if (!Array.isArray(sectionStats) || sectionStats.length === 0 || !mentorConfig) {
    return mentorConfig;
  }

  const nextConfig = JSON.parse(JSON.stringify(mentorConfig));
  const chapterSectionCounts = {};
  let hasRecommendation = false;

  // Đề xuất phân bổ section cho Nghe và Đọc (cùng quy tắc docx)
  for (const skillType of [SKILL_LISTENING, SKILL_READING]) {
    const allocation = recommendListeningReadingAllocation(
      sectionStats,
      mentorConfig,
      skillType,
      sectionsData,
    );
    if (allocation && allocation.size > 0) {
      chapterSectionCounts[skillType] = allocation;
      hasRecommendation = true;
    }
  }

  // Đề xuất kế hoạch Từ vựng (section cụ thể + số câu)
  const vocabularyPlan = recommendVocabularyPlan(sectionStats, mentorConfig, sectionsData);
  if (vocabularyPlan) {
    nextConfig.vocabularyPlan = vocabularyPlan;
    hasRecommendation = true;
  }

  if (Object.keys(chapterSectionCounts).length > 0) {
    nextConfig.chapterSectionCounts = chapterSectionCounts;
  }

  // Không có thay đổi → trả config mentor gốc (không trả bản clone)
  return hasRecommendation ? nextConfig : mentorConfig;
}

// =============================================================================
// PHẦN 7: ĐIỀU PHỐI LUỒNG — HÀM GỌI TỪ CONTROLLER
// =============================================================================

/**
 * Chuẩn bị metadata trước khi tạo đề final test.
 * KHÔNG chạy thuật toán đề xuất.
 *
 * Thực hiện:
 *   1. Lấy config mentor
 *   2. Xác định testId
 *   3. Kiểm tra học viên đã từng nộp bài chưa
 *
 * Controller phân nhánh theo hasSubmittedBefore:
 *   - false → studentTestPaperService.buildCourseTestPaper (random thuần)
 *   - true  → buildRecommendedCourseTestPaper (đề xuất + random)
 *
 * @param {object} thamSo
 * @returns {Promise<object>}
 */
async function resolveCourseTestPaperConfig({ userId, courseId, testId }) {
  const mentorResult = await getMentorCourseTestConfig(courseId);
  if (!mentorResult.ok) {
    return { ok: false, message: mentorResult.message };
  }

  const mentorConfig = mentorResult.config;
  const resolvedTestId = Number(testId) || Number(mentorConfig.id);

  if (!resolvedTestId) {
    return { ok: false, message: 'Giảng viên chưa tạo bài kiểm tra toàn khóa!' };
  }

  const submittedCount = await studentTestModel.getSubmittedAttemptCountByUserAndTest(
    userId,
    resolvedTestId,
  );

  return {
    ok: true,
    config: mentorConfig,
    testId: resolvedTestId,
    hasSubmittedBefore: submittedCount > 0,
  };
}

/**
 * Luồng end-to-end: đề xuất config + tạo đề final test.
 *
 * Chỉ dùng khi học viên ĐÃ TỪNG nộp bài (hasSubmittedBefore = true).
 * Lần đầu làm bài → controller gọi buildCourseTestPaper trực tiếp.
 *
 * Các bước:
 *   1. getLatestCourseTestAttemptStats  → stat lần làm gần nhất
 *   2. loadCourseTestSections           → question bank từ DB
 *   3. recommendCourseTestFromStats     → điều chỉnh config theo docx
 *   4. buildCourseTestPaperWithSections → random đề (studentTestPaperService)
 *
 * @param {object} thamSo
 * @returns {Promise<object>} Đề thi đã random (paper)
 */
async function buildRecommendedCourseTestPaper({ userId, courseId, mentorConfig, testId }) {
  // Lazy require tránh phụ thuộc vòng (circular dependency) với studentTestPaperService
  const studentTestPaperService = require('./studentTestPaperService');

  const { sectionStats } = await getLatestCourseTestAttemptStats({
    userId,
    courseId,
    testId,
  });

  const sectionsData = await studentTestPaperService.loadCourseTestSections(courseId, mentorConfig);

  const paperConfig = sectionStats.length > 0
    ? recommendCourseTestFromStats(sectionStats, mentorConfig, sectionsData)
    : mentorConfig;

  return studentTestPaperService.buildCourseTestPaperWithSections(paperConfig, sectionsData);
}

// =============================================================================
// XUẤT PUBLIC API
// =============================================================================
module.exports = {
  getLatestCourseTestAttemptStats,   // Đọc stat từ DB
  getMentorCourseTestConfig,         // Lấy config mentor
  recommendCourseTestFromStats,      // Thuật toán đề xuất thuần (test/debug)
  resolveCourseTestPaperConfig,      // Phân nhánh đã/chưa làm bài
  buildRecommendedCourseTestPaper,     // Đề xuất + tạo đề hoàn chỉnh
};
