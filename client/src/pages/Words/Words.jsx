import { useState } from 'react';
import { words } from '../../data/mockData';
import shared from '../shared.module.css';

const levelColors = ['#F43F5E', '#F59E0B', '#2563EB', '#10B981', '#7C3AED'];

export default function Words() {
  const [search, setSearch] = useState('');

  const filtered = words.filter(
    (w) =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className={shared.pageTitle}>Từ vựng</h1>
      <p className={shared.pageDesc}>Danh sách từ vựng cá nhân với phát âm, nghĩa và ví dụ.</p>

      <div className={shared.toolbar}>
        <input
          type="search"
          className={shared.searchInput}
          placeholder="Tìm từ vựng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`}>
          + Thêm từ mới
        </button>
      </div>

      <table className={shared.table}>
        <thead>
          <tr>
            <th>Từ vựng</th>
            <th>Phiên âm</th>
            <th>Nghĩa</th>
            <th>Bộ từ</th>
            <th>Level SRS</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((w) => (
            <tr key={w.id}>
              <td>
                <div className={shared.wordCell}>{w.word}</div>
                <div className={shared.phonetic}>{w.example}</div>
              </td>
              <td className={shared.phonetic}>{w.phonetic}</td>
              <td>{w.meaning}</td>
              <td>{w.category}</td>
              <td>
                <span
                  className={shared.levelBadge}
                  style={{ background: `${levelColors[w.level]}20`, color: levelColors[w.level] }}
                >
                  Level {w.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
