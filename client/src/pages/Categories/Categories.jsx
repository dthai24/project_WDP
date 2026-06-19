import { useState } from 'react';
import { categories } from '../../data/mockData';
import shared from '../shared.module.css';

export default function Categories() {
  const [search, setSearch] = useState('');

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h1 className={shared.pageTitle}>Bộ từ vựng</h1>
      <p className={shared.pageDesc}>Quản lý và học các bộ từ vựng theo chủ đề, kỳ thi hoặc mục tiêu riêng.</p>

      <div className={shared.toolbar}>
        <input
          type="search"
          className={shared.searchInput}
          placeholder="Tìm bộ từ vựng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`}>
          + Tạo bộ từ mới
        </button>
      </div>

      <div className={shared.grid}>
        {filtered.map((cat) => (
          <div key={cat.id} className={shared.card}>
            <div className={shared.cardHeader}>
              <div className={shared.cardIcon} style={{ background: `${cat.color}20`, color: cat.color }}>
                📚
              </div>
              {cat.isPublic && <span className={shared.tag}>Công khai</span>}
            </div>
            <h3 className={shared.cardTitle}>{cat.name}</h3>
            <p className={shared.cardDesc}>{cat.description}</p>
            <div className={shared.tags}>
              {cat.tags.map((tag) => (
                <span key={tag} className={shared.tag}>{tag}</span>
              ))}
            </div>
            <div className={shared.progressBar}>
              <div className={shared.progressFill} style={{ width: `${cat.progress}%`, background: cat.color }} />
            </div>
            <div className={shared.meta}>
              <span>{cat.wordCount} từ</span>
              <span>{cat.progress}% hoàn thành</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
