import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTagsApi, savePreferencesApi } from '../services/authService';
import Logo from '../components/common/Logo';
import '../styles/SurveyPage.css';

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
  const [loadState, setLoadState] = useState('loading');
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
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        if (next.size >= MAX_SELECT) return prev;
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
        navigate('/home');
      } else {
        setSaveError(data.message || 'Lưu sở thích thất bại. Vui lòng thử lại.');
      }
    } catch {
      setSaveError('Không thể kết nối server. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  const count     = selected.size;
  const isMaxed   = count >= MAX_SELECT;
  const canSubmit = count >= MIN_SELECT && count <= MAX_SELECT;

  if (loadState === 'loading') {
    return (
      <div className="survey-page">
        <div className="survey-card">
          <header className="survey-header">
            <Logo height={48} link={false} className="survey-logo" />
            <p className="survey-loading-text">Đang tải danh sách chủ đề...</p>
          </header>
          <ul className="survey-list survey-list--skeleton" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="survey-skeleton-row" />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="survey-page">
        <div className="survey-card survey-card--narrow">
          <div className="survey-error">
            <p>Không thể tải danh sách chủ đề. Vui lòng thử lại.</p>
            <button type="button" className="survey-btn" onClick={fetchTags}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <div className="survey-card">
        <header className="survey-header">
          <Logo height={48} link={false} className="survey-logo" />
          <p className="survey-eyebrow">Cá nhân hóa</p>
          <h1 className="survey-title">Bạn quan tâm đến chủ đề nào?</h1>
          <p className="survey-subtitle">
            Chào {user.fullName || 'bạn'}, chọn từ {MIN_SELECT} đến {MAX_SELECT} chủ đề để S.T.A.R
            gợi ý lộ trình phù hợp.
          </p>
        </header>

        <p className="survey-counter" aria-live="polite">
          Đã chọn <strong>{count}</strong> / {MAX_SELECT}
          {!canSubmit && (
            <span className="survey-counter__hint">
              {' '}(cần thêm {MIN_SELECT - count})
            </span>
          )}
        </p>

        <ul className="survey-list">
          {tags.map((tag) => {
            const isSelected = selected.has(tag.TagId);
            const isLocked   = isMaxed && !isSelected;

            return (
              <li key={tag.TagId}>
                <label
                  className={[
                    'survey-option',
                    isSelected ? 'survey-option--checked' : '',
                    isLocked ? 'survey-option--locked' : '',
                  ].filter(Boolean).join(' ')}
                  title={isLocked ? 'Đã chọn đủ 5 chủ đề' : undefined}
                >
                  <input
                    type="checkbox"
                    className="survey-option__input"
                    checked={isSelected}
                    disabled={isLocked}
                    onChange={() => toggleTag(tag.TagId)}
                  />
                  <span className="survey-option__label">{tag.DisplayName}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <footer className="survey-footer">
          {isMaxed && (
            <p className="survey-message survey-message--info">
              Bạn đã chọn đủ {MAX_SELECT} chủ đề.
            </p>
          )}
          {!canSubmit && !isMaxed && count > 0 && (
            <p className="survey-message survey-message--warn">
              Vui lòng chọn ít nhất {MIN_SELECT} chủ đề.
            </p>
          )}
          {saveError && (
            <p className="survey-message survey-message--error">{saveError}</p>
          )}

          <button
            type="button"
            id="btn-start-journey"
            className="survey-btn"
            disabled={!canSubmit || saving}
            onClick={handleSubmit}
          >
            {saving && <span className="survey-btn__spinner" aria-hidden="true" />}
            {saving ? 'Đang lưu...' : 'Bắt đầu trải nghiệm'}
          </button>
        </footer>
      </div>
    </div>
  );
}
