export const COURSE_LIST_DEFAULTS = {
  categories: [],
  levels: [],
  statuses: [],
  sort: "newest",
  page: 1,
  keyword: "",
};

export const COURSE_LIST_PARAM_KEYS = [
  "keyword",
  "category",
  "level",
  "status",
  "sort",
  "page",
];

/** Query param lưu URL đầy đủ trang danh sách khóa học (pathname + search) */
export const COURSE_FROM_PARAM = "from";

function isCourseListPath(path) {
  return path === "/courses";
}

function resolveFromUrl(searchParams) {
  const from = searchParams.get(COURSE_FROM_PARAM);
  if (!from || !from.startsWith("/courses")) return null;
  const pathOnly = from.split("?")[0];
  if (pathOnly !== "/courses") return null;
  return from;
}

function appendListParamsToDetail(params, searchParams) {
  const filters = parseCourseListParams(searchParams);
  const listParams = buildCourseListSearchParams(filters, new URLSearchParams());
  listParams.forEach((value, key) => {
    params.append(key, value);
  });
}

/** Đường dẫn /courses — ưu tiên param `from` nếu có */
export function buildCourseListPath(searchParams) {
  const from = resolveFromUrl(searchParams);
  if (from) return from;

  const filters = parseCourseListParams(searchParams);
  const params = buildCourseListSearchParams(filters, new URLSearchParams());
  const qs = params.toString();
  return qs ? `/courses?${qs}` : "/courses";
}

/**
 * Đường dẫn /courses/:id
 * - Giữ bộ lọc list trong query
 * - Thêm `from` = URL đầy đủ trang list nếu truyền fromUrl
 */
export function buildCourseDetailPath(courseId, searchParams, fromUrl) {
  const params = new URLSearchParams();

  appendListParamsToDetail(params, searchParams);

  const resolvedFrom =
    fromUrl && isCourseListPath(fromUrl.split("?")[0])
      ? fromUrl
      : resolveFromUrl(searchParams);

  if (resolvedFrom) {
    params.set(COURSE_FROM_PARAM, resolvedFrom);
  }

  const qs = params.toString();
  const base = `/courses/${courseId}`;
  return qs ? `${base}?${qs}` : base;
}

const VALID_CATEGORIES = new Set([
  "Giao tiếp",
  "IELTS",
  "TOEIC",
  "Ngữ pháp",
  "Phát âm",
]);

const VALID_LEVELS = new Set(["Cơ bản", "Trung cấp", "Nâng cao"]);
const VALID_STATUSES = new Set(["enrolled", "not_enrolled"]);
const VALID_SORT = new Set(["newest", "popular", "progress"]);

function parsePage(value) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseMultiValues(searchParams, key, validSet) {
  const fromAll = searchParams
    .getAll(key)
    .map((value) => value.trim())
    .filter((value) => validSet.has(value));

  if (fromAll.length > 0) {
    return [...new Set(fromAll)];
  }

  const single = searchParams.get(key);
  if (single && single !== "all" && validSet.has(single)) {
    return [single];
  }

  return [];
}

export function parseCourseListParams(searchParams) {
  const sort = searchParams.get("sort");
  return {
    categories: parseMultiValues(searchParams, "category", VALID_CATEGORIES),
    levels: parseMultiValues(searchParams, "level", VALID_LEVELS),
    statuses: parseMultiValues(searchParams, "status", VALID_STATUSES),
    sort: VALID_SORT.has(sort) ? sort : COURSE_LIST_DEFAULTS.sort,
    page: parsePage(searchParams.get("page")),
    keyword: (searchParams.get("keyword") ?? "").trim(),
  };
}

export function hasActiveCourseFilters(filters) {
  return (
    Boolean(filters.keyword) ||
    filters.categories.length > 0 ||
    filters.levels.length > 0 ||
    filters.statuses.length > 0 ||
    filters.sort !== COURSE_LIST_DEFAULTS.sort ||
    filters.page !== COURSE_LIST_DEFAULTS.page
  );
}

export function buildCourseListSearchParams(filters, currentSearchParams) {
  const params = new URLSearchParams(currentSearchParams);
  COURSE_LIST_PARAM_KEYS.forEach((key) => params.delete(key));

  const normalized = {
    ...COURSE_LIST_DEFAULTS,
    ...filters,
    categories: [...new Set(filters.categories ?? [])].filter((value) =>
      VALID_CATEGORIES.has(value)
    ),
    levels: [...new Set(filters.levels ?? [])].filter((value) => VALID_LEVELS.has(value)),
    statuses: [...new Set(filters.statuses ?? [])].filter((value) =>
      VALID_STATUSES.has(value)
    ),
    keyword: (filters.keyword ?? "").trim(),
    page: parsePage(String(filters.page ?? 1)),
    sort: VALID_SORT.has(filters.sort) ? filters.sort : COURSE_LIST_DEFAULTS.sort,
  };

  if (normalized.keyword) params.set("keyword", normalized.keyword);
  normalized.categories.forEach((value) => params.append("category", value));
  normalized.levels.forEach((value) => params.append("level", value));
  normalized.statuses.forEach((value) => params.append("status", value));
  if (normalized.sort !== COURSE_LIST_DEFAULTS.sort) {
    params.set("sort", normalized.sort);
  }
  if (normalized.page !== COURSE_LIST_DEFAULTS.page) {
    params.set("page", String(normalized.page));
  }

  return params;
}

export function resetCourseListParams(currentSearchParams) {
  const params = new URLSearchParams(currentSearchParams);
  COURSE_LIST_PARAM_KEYS.forEach((key) => params.delete(key));
  return params;
}

export const STATUS_FILTER_LABELS = {
  enrolled: "Đã đăng ký",
  not_enrolled: "Chưa đăng ký",
};

export function buildActiveFilterChips(filters) {
  const chips = [];

  if (filters.keyword) {
    chips.push({
      key: `keyword:${filters.keyword}`,
      type: "keyword",
      value: filters.keyword,
      label: filters.keyword,
    });
  }

  filters.categories.forEach((value) => {
    chips.push({
      key: `category:${value}`,
      type: "category",
      value,
      label: value,
    });
  });

  filters.levels.forEach((value) => {
    chips.push({
      key: `level:${value}`,
      type: "level",
      value,
      label: value,
    });
  });

  filters.statuses.forEach((value) => {
    chips.push({
      key: `status:${value}`,
      type: "status",
      value,
      label: STATUS_FILTER_LABELS[value] ?? value,
    });
  });

  return chips;
}
