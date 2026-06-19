import { useState } from 'react';
import { words } from '../../data/mockData';
import shared from '../shared.module.css';

const quizWords = words.slice(0, 5);
const allMeanings = [...new Set(words.map((w) => w.meaning))];

function generateOptions(correct) {
  const others = allMeanings.filter((m) => m !== correct);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
  return options;
}

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [options] = useState(() => quizWords.map((w) => generateOptions(w.meaning)));

  const current = quizWords[index];

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    if (option === current.meaning) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= quizWords.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h1 className={shared.pageTitle}>Hoàn thành!</h1>
        <p className={shared.pageDesc}>
          Bạn trả lời đúng {score}/{quizWords.length} câu ({Math.round((score / quizWords.length) * 100)}%)
        </p>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => { setIndex(0); setScore(0); setSelected(null); setFinished(false); }}>
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className={shared.pageTitle}>Trắc nghiệm</h1>
      <p className={shared.pageDesc}>Câu {index + 1}/{quizWords.length} · Điểm: {score}</p>

      <div style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
          {current.word}
        </div>
        <div style={{ color: 'var(--muted)', marginBottom: 32 }}>{current.phonetic}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options[index].map((option) => {
            let bg = 'var(--surface)';
            let border = 'var(--sidebar-border)';
            if (selected) {
              if (option === current.meaning) { bg = 'rgba(35,172,56,0.15)'; border = '#23ac38'; }
              else if (option === selected) { bg = 'rgba(244,63,94,0.15)'; border = '#f43f5e'; }
            }
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: `2px solid ${border}`,
                  background: bg,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: selected ? 'default' : 'pointer',
                  textAlign: 'left',
                  color: 'var(--ink)',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected && (
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} style={{ marginTop: 24 }} onClick={next}>
            {index + 1 >= quizWords.length ? 'Xem kết quả' : 'Câu tiếp theo →'}
          </button>
        )}
      </div>
    </div>
  );
}
