import { MUTED, TEXT } from './mentorCourseCreateStyles';

export const CHAPTER_THEME = {
  color: '#0891B2',
  bg: 'rgba(8,145,178,0.12)',
  border: 'rgba(8,145,178,0.22)',
  focus: 'rgba(8,145,178,0.35)',
};

export const LESSON_THEME = {
  color: '#6366F1',
  bg: 'rgba(99,102,241,0.12)',
  border: 'rgba(99,102,241,0.22)',
  focus: 'rgba(99,102,241,0.35)',
};

export const MATERIAL_SECTION_THEME = {
  color: '#D97706',
  bg: 'rgba(217,119,6,0.12)',
  border: 'rgba(217,119,6,0.22)',
  focus: 'rgba(217,119,6,0.35)',
};

export const MATERIAL_TYPE_THEME = {
  VIDEO: {
    color: '#E11D48',
    soft: 'rgba(225,29,72,0.1)',
    border: 'rgba(225,29,72,0.16)',
    bg: '#FFFFFF',
  },
  TEXT: {
    color: '#0891B2',
    soft: 'rgba(8,145,178,0.1)',
    border: 'rgba(8,145,178,0.16)',
    bg: '#FFFFFF',
  },
  DOC: {
    color: '#2563EB',
    soft: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.16)',
    bg: '#FFFFFF',
  },
  TEST: {
    color: '#7C3AED',
    soft: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.16)',
    bg: '#FFFFFF',
  },
};

export const CONTENT_FIELD_LABEL_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: MUTED,
  mb: 0.5,
  lineHeight: 1.35,
};

export const CONTENT_CARD_META_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: MUTED,
  lineHeight: 1.35,
};

export const CONTENT_CARD_TITLE_SX = {
  fontSize: 15,
  fontWeight: 700,
  color: TEXT,
  lineHeight: 1.35,
};

export function contentFieldSx(hasError, theme = CHAPTER_THEME) {
  return {
    borderBottom: `1px solid ${hasError ? '#DC2626' : theme.border}`,
    pb: 0.45,
    '&:focus-within': { borderBottomColor: hasError ? '#DC2626' : theme.color },
  };
}

export function contentAddButtonSx(theme = CHAPTER_THEME) {
  return {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: 13,
    fontWeight: 700,
    color: theme.color,
    p: 0,
  };
}

export const CONTENT_DIVIDER_SX = {
  borderBottom: '1px solid rgba(15,23,42,0.08)',
};

export function contentNestedSx(theme = LESSON_THEME) {
  return {
    pl: { xs: 1.25, sm: 2 },
    ml: { xs: 0.5, sm: 0.75 },
    borderLeft: `2px solid ${theme.border}`,
  };
}

export const BUILDER_PANEL_SX = {
  bgcolor: '#fff',
  borderRadius: '20px',
  border: '1px solid rgba(15,23,42,0.08)',
  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
};

export const CHAPTER_HEADER_BG = 'rgba(8,145,178,0.04)';

export function chapterCardSx(expanded) {
  return {
    ...BUILDER_PANEL_SX,
    borderRadius: '20px',
    overflow: 'hidden',
    borderColor: expanded ? 'rgba(8,145,178,0.28)' : 'rgba(15,23,42,0.08)',
    boxShadow: expanded ? '0 2px 8px rgba(8,145,178,0.06)' : '0 1px 3px rgba(15,23,42,0.04)',
  };
}

export function lessonBlockSx() {
  return {
    ml: { xs: 0.5, sm: 1 },
    pl: { xs: 1.25, sm: 1.75 },
    borderLeft: `2px solid ${LESSON_THEME.border}`,
    borderRadius: '12px',
    bgcolor: 'rgba(99,102,241,0.03)',
    mb: 1.75,
  };
}
