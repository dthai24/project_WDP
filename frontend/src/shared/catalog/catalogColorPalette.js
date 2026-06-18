export const CATALOG_COLOR_PALETTE = [
  {
    code: 'blue',
    bgcolor: 'rgba(37,99,235,0.10)',
    color: '#2563EB',
    border: '1px solid rgba(37,99,235,0.22)',
  },
  {
    code: 'violet',
    bgcolor: 'rgba(124,58,237,0.10)',
    color: '#7C3AED',
    border: '1px solid rgba(124,58,237,0.22)',
  },
  {
    code: 'cyan',
    bgcolor: 'rgba(14,116,144,0.10)',
    color: '#0E7490',
    border: '1px solid rgba(14,116,144,0.22)',
  },
  {
    code: 'slate',
    bgcolor: 'rgba(15,23,42,0.08)',
    color: '#334155',
    border: '1px solid rgba(15,23,42,0.16)',
  },
  {
    code: 'pink',
    bgcolor: 'rgba(236,72,153,0.10)',
    color: '#DB2777',
    border: '1px solid rgba(236,72,153,0.22)',
  },
  {
    code: 'sky',
    bgcolor: 'rgba(56,189,248,0.12)',
    color: '#0284C7',
    border: '1px solid rgba(56,189,248,0.22)',
  },
  {
    code: 'amber',
    bgcolor: 'rgba(245,158,11,0.12)',
    color: '#D97706',
    border: '1px solid rgba(245,158,11,0.22)',
  },
  {
    code: 'orange',
    bgcolor: 'rgba(234,88,12,0.12)',
    color: '#EA580C',
    border: '1px solid rgba(234,88,12,0.22)',
  },
  {
    code: 'emerald',
    bgcolor: 'rgba(4,120,87,0.12)',
    color: '#047857',
    border: '1px solid rgba(4,120,87,0.24)',
  },
  {
    code: 'indigo',
    bgcolor: 'rgba(79,70,229,0.10)',
    color: '#4F46E5',
    border: '1px solid rgba(79,70,229,0.22)',
  },
  {
    code: 'rose',
    bgcolor: 'rgba(225,29,72,0.10)',
    color: '#E11D48',
    border: '1px solid rgba(225,29,72,0.22)',
  },
  {
    code: 'lime',
    bgcolor: 'rgba(101,163,13,0.12)',
    color: '#65A30D',
    border: '1px solid rgba(101,163,13,0.22)',
  },
];

export const DEFAULT_CATALOG_CHIP_SX = {
  bgcolor: '#F1F5F9',
  color: '#64748B',
  border: '1px solid rgba(100,116,139,0.18)',
};

export const CATEGORY_SEED_COLOR_BY_ID = {
  1: 'violet',
  2: 'blue',
  3: 'pink',
  4: 'slate',
  5: 'cyan',
  6: 'indigo',
};

export const LEVEL_SEED_COLOR_BY_ID = {
  1: 'sky',
  2: 'amber',
  3: 'orange',
  4: 'violet',
};

/** Màu legacy cho tên chưa có trong catalog admin (home, mock cũ). */
export const LEGACY_CATEGORY_COLOR_BY_DISPLAY_NAME = {
  'giao tiếp': 'blue',
  ielts: 'violet',
  toeic: 'cyan',
  'ngữ pháp': 'slate',
  'phát âm': 'pink',
  'business english': 'indigo',
  'mẹo học tập': 'amber',
  'kỹ năng nghe': 'cyan',
};

export const LEGACY_LEVEL_COLOR_BY_DISPLAY_NAME = {
  'cơ bản': 'sky',
  'sơ cấp': 'sky',
  'trung cấp': 'amber',
  'nâng cao': 'orange',
  'chuyên sâu': 'violet',
};

export function normalizeCatalogLabel(value = '') {
  return String(value).trim().toLowerCase();
}

export function getCatalogColorChipSx(colorCode, { withBorder = true } = {}) {
  const entry = CATALOG_COLOR_PALETTE.find((item) => item.code === colorCode);
  if (!entry) {
    if (withBorder) return { ...DEFAULT_CATALOG_CHIP_SX };
    const { border, ...rest } = DEFAULT_CATALOG_CHIP_SX;
    return rest;
  }

  const { code: _code, ...sx } = entry;
  if (!withBorder) {
    const { border, ...rest } = sx;
    return rest;
  }
  return { ...sx };
}

export function pickNextColorCode(existingItems = []) {
  const used = new Set(existingItems.map((item) => item.colorCode).filter(Boolean));
  const next = CATALOG_COLOR_PALETTE.find((item) => !used.has(item.code));
  return (
    next?.code ??
    CATALOG_COLOR_PALETTE[existingItems.length % CATALOG_COLOR_PALETTE.length].code
  );
}

export function resolveSeedColorCode(type, id) {
  const map = type === 'category' ? CATEGORY_SEED_COLOR_BY_ID : LEVEL_SEED_COLOR_BY_ID;
  return map[id] ?? null;
}
