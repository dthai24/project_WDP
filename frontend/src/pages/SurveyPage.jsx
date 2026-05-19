import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTagsApi, savePreferencesApi } from '../services/authService';
import Logo from '../components/common/Logo';
import '../styles/SurveyPage.css';

// Emoji map theo TagName slug
const TAG_EMOJI = {
  'the-thao-esports':          '⚽',
  'lap-trinh-cong-nghe':       '💻',
  'thoi-trang-phong-cach':     '👗',
  'du-lich-kham-pha':          '✈️',
  'phim-anh-giai-tri':         '🎬',
  'am-nhac-nghe-thuat':        '🎵',
  'am-thuc-nau-an':            '🍜',
  'sach-phat-trien-ban-than':  '📚',
  'tieng-anh-hoc-thuat':       '🎓',
  'kinh-doanh-khoi-nghiep':    '🚀',
  'tro-choi-dien-tu':          '🎮',
  'anime-manga':               '⛩️',
};

const MIN_SELECT = 3;
const MAX_SELECT = 5;

export default function SurveyPage() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

  const [tags, setTags]           = useState([]);
  const [selected, setSelected]   = useState(new Set());
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [saving, setSaving]       = useState(false);
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

  const count       = selected.size;
  const isMaxed     = count >= MAX_SELECT;
  const canSubmit   = count >= MIN_SELECT && count <= MAX_SELECT;
  const progressPct = Math.min((count / MIN_SELECT) * 100, 100);

  // ---- Loading skeleton ----
  if (loadState === 'loading') {
    return (
      <div className="survey-page">
        <div className="survey-container">
          <div className="survey-header">
            <div className="survey-logo">
              <Logo height={48} link={false} />
            </div>
            <p style={{ color: '#8885a0', fontSize: '14px' }}>Đang tải danh sách chủ đề...</p>
          </div>
          <div className="survey-loading">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Error state ----
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

  // ---- Main ----
  return (
    <div className="survey-page">
      <div className="survey-container">

        {/* Header */}
        <div className="survey-header">
          <div className="survey-logo">
            <Logo height={48} link={false} />
          </div>
          <div className="survey-step-badge">🎯 Bước Cá Nhân Hoá</div>
          <h1 className="survey-title">
            Bạn quan tâm đến<br />chủ đề nào nhất?
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
            Đã chọn: <span>{count}</span>
          </span>
          <div className="survey-progress-track">
            <div className="survey-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className={`survey-progress-hint ${canSubmit ? 'ok' : ''}`}>
            {canSubmit
              ? (isMaxed ? '✅ Tối đa 5' : '✅ Sẵn sàng!')
              : `Tối thiểu ${MIN_SELECT}`
            }
          </span>
        </div>

        {/* Tag grid */}
        <div className="survey-grid">
          {tags.map((tag) => {
            const isSelected = selected.has(tag.TagId);
            const isLocked   = isMaxed && !isSelected;
            return (
              <div
                key={tag.TagId}
                className={[
                  'tag-card',
                  isSelected ? 'tag-card--selected' : '',
                  isLocked   ? 'tag-card--locked'   : '',
                ].join(' ')}
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
                {isSelected && (
                  <div className="tag-card__check" aria-hidden="true">✓</div>
                )}
                <span className="tag-card__emoji" aria-hidden="true">
                  {TAG_EMOJI[tag.TagName] || '🌟'}
                </span>
                <span className="tag-card__name">{tag.DisplayName}</span>
              </div>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="survey-action">
          {isMaxed && (
            <p className="survey-hint ok">🎯 Bạn đã chọn đủ 5 chủ đề — không thể chọn thêm</p>
          )}
          {!canSubmit && !isMaxed && (
            <p className="survey-hint">
              ⚠️ Vui lòng chọn ít nhất {MIN_SELECT} chủ đề ({MIN_SELECT - count} còn lại)
            </p>
          )}
          {saveError && <p className="survey-hint">{saveError}</p>}

          <button
            id="btn-start-journey"
            className="survey-btn-submit"
            disabled={!canSubmit || saving}
            onClick={handleSubmit}
          >
            {saving ? (
              <><span className="spin" />Đang lưu...</>
            ) : (
              <>🚀 Bắt đầu trải nghiệm</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
