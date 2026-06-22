import { adminLevelsSeed } from '@/features/admin/data/adminLevelsMock';
import { normalizeLevel } from '@/features/admin/utils/adminLevelUtils';
import { pickNextColorCode } from '@/shared/catalog/catalogColorPalette';

const STORAGE_KEY = 'admin_levels_v1';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeLevel) : null;
  } catch {
    return null;
  }
}

function saveStored(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getAll() {
  const stored = loadStored();
  if (stored) return stored;
  return adminLevelsSeed.map(normalizeLevel);
}

function nextId(items) {
  return items.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1;
}

function nextSortOrder(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.sortOrder ?? 0)) + 1;
}

function normalizeDisplayName(value = '') {
  return String(value).trim().toLowerCase();
}

function slugifyDisplayName(value = '') {
  return (
    String(value)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `level-${Date.now()}`
  );
}

function uniqueLevelSlug(items, displayName, excludeId = null) {
  let base = slugifyDisplayName(displayName);
  let slug = base;
  let counter = 2;
  while (
    items.some(
      (item) =>
        item.levelName === slug &&
        (excludeId == null || String(item.id) !== String(excludeId)),
    )
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function simulateDelay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLevels() {
  await simulateDelay();
  return { ok: true, levels: getAll() };
}

export async function createLevel(payload) {
  await simulateDelay();
  const items = getAll();
  const displayName = String(payload.displayName ?? '').trim();

  if (items.some((item) => normalizeDisplayName(item.displayName) === normalizeDisplayName(displayName))) {
    return { ok: false, message: 'Tên trình độ đã tồn tại' };
  }

  const created = normalizeLevel({
    id: nextId(items),
    levelName: uniqueLevelSlug(items, displayName),
    displayName,
    sortOrder: nextSortOrder(items),
    colorCode: pickNextColorCode(items),
    status: payload.status ?? 'ACTIVE',
    createdAt: new Date().toISOString(),
  });

  saveStored([...items, created]);
  return { ok: true, level: created };
}

export async function updateLevel(id, payload) {
  await simulateDelay();
  const items = getAll();
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index < 0) return { ok: false, message: 'Không tìm thấy trình độ' };

  const displayName = String(payload.displayName ?? items[index].displayName).trim();
  if (
    items.some(
      (item, i) =>
        i !== index && normalizeDisplayName(item.displayName) === normalizeDisplayName(displayName),
    )
  ) {
    return { ok: false, message: 'Tên trình độ đã tồn tại' };
  }

  const updated = normalizeLevel({
    ...items[index],
    displayName,
    levelName: uniqueLevelSlug(items, displayName, id),
    colorCode: items[index].colorCode ?? pickNextColorCode(items),
    status: payload.status ?? items[index].status,
  });

  const next = [...items];
  next[index] = updated;
  saveStored(next);
  return { ok: true, level: updated };
}
