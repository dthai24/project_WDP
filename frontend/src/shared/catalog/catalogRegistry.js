import { adminCategoriesSeed } from '@/features/admin/data/adminCategoriesMock';
import { adminLevelsSeed } from '@/features/admin/data/adminLevelsMock';
import {
  DEFAULT_CATALOG_CHIP_SX,
  LEGACY_CATEGORY_COLOR_BY_DISPLAY_NAME,
  LEGACY_LEVEL_COLOR_BY_DISPLAY_NAME,
  getCatalogColorChipSx,
  normalizeCatalogLabel,
  resolveSeedColorCode,
} from '@/shared/catalog/catalogColorPalette';

const CATEGORY_STORAGE_KEY = 'admin_categories_v1';
const LEVEL_STORAGE_KEY = 'admin_levels_v1';

function normalizeCategory(raw = {}) {
  const id = raw.id;
  return {
    id,
    categoryName: raw.categoryName ?? '',
    displayName: raw.displayName ?? '',
    colorCode: raw.colorCode ?? resolveSeedColorCode('category', id) ?? null,
    status: raw.status ?? 'ACTIVE',
    createdAt: raw.createdAt ?? null,
  };
}

function normalizeLevel(raw = {}) {
  const id = raw.id;
  return {
    id,
    levelName: raw.levelName ?? '',
    displayName: raw.displayName ?? '',
    sortOrder: Number(raw.sortOrder) || 0,
    colorCode: raw.colorCode ?? resolveSeedColorCode('level', id) ?? null,
    status: raw.status ?? 'ACTIVE',
    createdAt: raw.createdAt ?? null,
  };
}

function loadStoredCategories() {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeCategory) : null;
  } catch {
    return null;
  }
}

function loadStoredLevels() {
  try {
    const raw = localStorage.getItem(LEVEL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeLevel) : null;
  } catch {
    return null;
  }
}

export function getCatalogCategories() {
  return loadStoredCategories() ?? adminCategoriesSeed.map(normalizeCategory);
}

export function getCatalogLevels() {
  return loadStoredLevels() ?? adminLevelsSeed.map(normalizeLevel);
}

function findCategory({ id, displayName, colorCode } = {}) {
  const categories = getCatalogCategories();
  if (colorCode) {
    const match = categories.find((item) => item.colorCode === colorCode);
    if (match) return match;
  }
  if (id != null && id !== '') {
    const match = categories.find((item) => String(item.id) === String(id));
    if (match) return match;
  }
  if (displayName) {
    const key = normalizeCatalogLabel(displayName);
    return categories.find((item) => normalizeCatalogLabel(item.displayName) === key) ?? null;
  }
  return null;
}

function findLevel({ id, displayName, colorCode } = {}) {
  const levels = getCatalogLevels();
  if (colorCode) {
    const match = levels.find((item) => item.colorCode === colorCode);
    if (match) return match;
  }
  if (id != null && id !== '') {
    const match = levels.find((item) => String(item.id) === String(id));
    if (match) return match;
  }
  if (displayName) {
    const key = normalizeCatalogLabel(displayName);
    return levels.find((item) => normalizeCatalogLabel(item.displayName) === key) ?? null;
  }
  return null;
}

function resolveLegacyCategoryColor(displayName) {
  if (!displayName) return null;
  return LEGACY_CATEGORY_COLOR_BY_DISPLAY_NAME[normalizeCatalogLabel(displayName)] ?? null;
}

function resolveLegacyLevelColor(displayName) {
  if (!displayName) return null;
  const key = normalizeCatalogLabel(displayName);
  if (LEGACY_LEVEL_COLOR_BY_DISPLAY_NAME[key]) {
    return LEGACY_LEVEL_COLOR_BY_DISPLAY_NAME[key];
  }
  if (key.includes('cơ bản') || key.includes('sơ cấp')) return 'sky';
  if (key.includes('trung cấp')) return 'amber';
  if (key.includes('nâng cao')) return 'orange';
  return null;
}

export function resolveCategoryColorCode({ id, displayName, colorCode } = {}) {
  if (colorCode) return colorCode;
  const item = findCategory({ id, displayName, colorCode });
  if (item?.colorCode) return item.colorCode;
  return resolveLegacyCategoryColor(displayName);
}

export function resolveLevelColorCode({ id, displayName, colorCode } = {}) {
  if (colorCode) return colorCode;
  const item = findLevel({ id, displayName, colorCode });
  if (item?.colorCode) return item.colorCode;
  return resolveLegacyLevelColor(displayName);
}

export function resolveCategoryChipSx(input = {}, options = {}) {
  const code = resolveCategoryColorCode(input);
  return code ? getCatalogColorChipSx(code, options) : { ...DEFAULT_CATALOG_CHIP_SX };
}

export function resolveLevelChipSx(input = {}, options = {}) {
  const code = resolveLevelColorCode(input);
  return code ? getCatalogColorChipSx(code, options) : { ...DEFAULT_CATALOG_CHIP_SX };
}

export function getCategoryColorMeta(input = {}) {
  const item = findCategory(input);
  const colorCode = resolveCategoryColorCode(input);
  return {
    item,
    colorCode,
    chipSx: resolveCategoryChipSx(input),
  };
}

export function getLevelColorMeta(input = {}) {
  const item = findLevel(input);
  const colorCode = resolveLevelColorCode(input);
  return {
    item,
    colorCode,
    chipSx: resolveLevelChipSx(input),
  };
}
