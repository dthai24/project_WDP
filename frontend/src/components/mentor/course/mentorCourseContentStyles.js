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
  DOC: {
    color: '#3B82F6',
    soft: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.16)',
    bg: '#FFFFFF',
  },
  TEST: {
    color: '#8B5CF6',
    soft: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.16)',
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
