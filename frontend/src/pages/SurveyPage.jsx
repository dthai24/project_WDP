import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTagsApi, savePreferencesApi } from '../services/authService';
import Logo from '../components/common/Logo';

// MUI Icons
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ComputerIcon from '@mui/icons-material/Computer';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import FlightIcon from '@mui/icons-material/Flight';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import '../styles/SurveyPage.css';

// Accent color mapping for each topic (icon, border, hover, and selection backgrounds)
const TAG_COLOR = {
  'the-thao-esports': { color: '#16a34a', bg: '#f0fdf4' }, // Green
  'lap-trinh-cong-nghe': { color: '#2563eb', bg: '#eff6ff' }, // Blue
  'thoi-trang-phong-cach': { color: '#db2777', bg: '#fdf2f8' }, // Pink
  'du-lich-kham-pha': { color: '#0891b2', bg: '#ecfeff' }, // Teal
  'phim-anh-giai-tri': { color: '#7c3aed', bg: '#f5f3ff' }, // Purple/Violet
  'am-nhac-nghe-thuat': { color: '#ea580c', bg: '#fff7ed' }, // Orange
  'am-thuc-nau-an': { color: '#dc2626', bg: '#fef2f2' }, // Red
  'sach-phat-trien-ban-than': { color: '#059669', bg: '#ecfdf5' }, // Emerald
  'tieng-anh-hoc-thuat': { color: '#0284c7', bg: '#f0f9ff' }, // Ocean/Sky
  'kinh-doanh-khoi-nghiep': { color: '#4f46e5', bg: '#eef2ff' }, // Indigo
  'tro-choi-dien-tu': { color: '#0d9488', bg: '#f0fdfa' }, // Teal-Green
  'anime-manga': { color: '#c026d3', bg: '#fdf4ff' }, // Fuchsia/Magenta
};

// MUI Icon map by slug
const TAG_ICON = {
  'the-thao-esports': <SportsSoccerIcon className="tag-icon-svg" />,
  'lap-trinh-cong-nghe': <ComputerIcon className="tag-icon-svg" />,
  'thoi-trang-phong-cach': <CheckroomIcon className="tag-icon-svg" />,
  'du-lich-kham-pha': <FlightIcon className="tag-icon-svg" />,
  'phim-anh-giai-tri': <MovieIcon className="tag-icon-svg" />,
  'am-nhac-nghe-thuat': <MusicNoteIcon className="tag-icon-svg" />,
  'am-thuc-nau-an': <RestaurantIcon className="tag-icon-svg" />,
  'sach-phat-trien-ban-than': <MenuBookIcon className="tag-icon-svg" />,
  'tieng-anh-hoc-thuat': <SchoolIcon className="tag-icon-svg" />,
  'kinh-doanh-khoi-nghiep': <RocketLaunchIcon className="tag-icon-svg" />,
  'tro-choi-dien-tu': <SportsEsportsIcon className="tag-icon-svg" />,
  'anime-manga': <AutoAwesomeIcon className="tag-icon-svg" />,
};

const MIN_SELECT = 3;
const MAX_SELECT = 5;

export default function SurveyPage() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchTags = useCallback(async () => {
    setLoadState('loading');
    try {
      const { ok, data } = await getTagsApi();
      if (ok && data.success) {
        setTags(data.tags);
        setLoadState('ready');
      } else {
        setLoadState('error');
      }
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const toggleTag = (tagId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        if (next.size >= MAX_SELECT) return prev; // blocked
        next.add(tagId);
      }
      return next;
    });
    setSaveError('');
  };

  const handleSubmit = async () => {
    if (selected.size < MIN_SELECT) return;

    setSaving(true);
    setSaveError('');
    try {
      const { ok, data } = await savePreferencesApi(user.userId, Array.from(selected));
      if (ok && data.success) {
        const updatedUser = { ...user, isFirstLogin: false };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/');
      } else {
        setSaveError(data.message || 'Lưu sở thích thất bại. Vui lòng thử lại.');
      }
    } catch {
      setSaveError('Không thể kết nối server. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  const count = selected.size;
  const isMaxed = count >= MAX_SELECT;
  const canSubmit = count >= MIN_SELECT && count <= MAX_SELECT;
  const progressPct = Math.min((count / MIN_SELECT) * 100, 100);

  // ── Loading skeleton ──────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="survey-page">
        <div className="survey-container">
          <div className="survey-header">
            <div className="survey-logo">
              <Logo height={40} link={false} className="survey-logo-img" />
            </div>
            <p className="survey-loading-text">Đang tải danh sách chủ đề...</p>
          </div>
          <div className="survey-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (loadState === 'error') {
    return (
      <div className="survey-page">
        <div className="survey-container">
          <div className="survey-error">
            <p>😓 Không thể tải danh sách chủ đề. Vui lòng thử lại.</p>
            <button className="survey-btn-submit" onClick={fetchTags}>
              🔄 Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────
  return (
    <div className="survey-page">
      <div className="survey-container">

        {/* Header */}
        <div className="survey-header">
          <div className="survey-logo">
            <Logo height={44} link={false} className="survey-logo-img" />
          </div>
          <h1 className="survey-title">
            Bạn quan tâm đến chủ đề nào nhất?
          </h1>
          <p className="survey-subtitle">
            Chào mừng <strong>{user.fullName || 'bạn'}</strong>! Hãy chọn từ{' '}
            <strong>{MIN_SELECT}–{MAX_SELECT} chủ đề</strong> yêu thích để S.T.A.R
            cá nhân hoá lộ trình học tập cho bạn.
          </p>
        </div>

        {/* Progress bar */}
        <div className="survey-progress-wrap">
          <span className="survey-progress-label">
            Đã chọn: <span>{count}</span>/{MAX_SELECT}
          </span>
          <div className="survey-progress-track">
            <div className="survey-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className={`survey-progress-hint ${canSubmit ? 'ok' : ''}`}>
            {canSubmit
              ? (isMaxed ? 'Tối đa 5' : 'Sẵn sàng!')
              : `Tối thiểu ${MIN_SELECT}`}
          </span>
        </div>

        {/* Tag grid */}
        <div className="survey-grid">
          {tags.map((tag) => {
            const isSelected = selected.has(tag.TagId);
            const isLocked = isMaxed && !isSelected;

            // Get category-specific colors or fallback
            const themeColors = TAG_COLOR[tag.TagName] || { color: '#0891b2', bg: '#ecfeff' };

            return (
              <div
                key={tag.TagId}
                className={[
                  'tag-card',
                  isSelected ? 'tag-card--selected' : '',
                  isLocked ? 'tag-card--locked' : '',
                ].join(' ')}
                style={{
                  '--topic-color': themeColors.color,
                  '--topic-bg': themeColors.bg,
                }}
                onClick={() => !isLocked && toggleTag(tag.TagId)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={isLocked ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
                    e.preventDefault();
                    toggleTag(tag.TagId);
                  }
                }}
                title={isLocked ? 'Chỉ được chọn tối đa 5 chủ đề' : tag.DisplayName}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="tag-card__check" aria-hidden="true">
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </div>
                )}

                {/* MUI Icon */}
                <span className="tag-card__icon" aria-hidden="true">
                  {TAG_ICON[tag.TagName] || <AutoAwesomeIcon className="tag-icon-svg" />}
                </span>

                <span className="tag-card__name">{tag.DisplayName}</span>
              </div>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="survey-action">
          {isMaxed && (
            <p className="survey-hint ok">Bạn đã chọn đủ 5 chủ đề — không thể chọn thêm</p>
          )}
          {!canSubmit && !isMaxed && (
            <p className="survey-hint">
              Vui lòng chọn ít nhất {MIN_SELECT} chủ đề ({MIN_SELECT - count} còn lại)
            </p>
          )}
          {saveError && <p className="survey-hint error">{saveError}</p>}

          <button
            id="btn-start-journey"
            className="survey-btn-submit"
            disabled={!canSubmit || saving}
            onClick={handleSubmit}
          >
            {saving ? (
              <><span className="spin" />Đang lưu...</>
            ) : (
              'Bắt đầu trải nghiệm'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}