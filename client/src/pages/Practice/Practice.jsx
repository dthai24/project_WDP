import { useState } from 'react';
import { Link } from 'react-router-dom';
import { practiceModes, flashcardDeck } from '../../data/mockData';
import shared from '../shared.module.css';
import styles from './Practice.module.css';

export default function Practice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = flashcardDeck[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i + 1) % flashcardDeck.length);
  };

  return (
    <div>
      <h1 className={shared.pageTitle}>Luyện tập</h1>
      <p className={shared.pageDesc}>Học từ vựng với Flashcard thông minh và Spaced Repetition (SRS).</p>

      <div className={styles.flashcardArea}>
        <div className={styles.progress}>
          Thẻ {currentIndex + 1} / {flashcardDeck.length} · {flashcardDeck.length} từ đến hạn
        </div>

        <div
          className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
          onClick={() => setFlipped(!flipped)}
          role="presentation"
        >
          <div className={styles.flashcardInner}>
            <div className={styles.flashcardFront}>
              <div className={styles.word}>{current.word}</div>
              <div className={styles.phonetic}>{current.phonetic}</div>
              <div className={styles.hint}>Nhấn để lật thẻ</div>
            </div>
            <div className={styles.flashcardBack}>
              <div className={styles.meaning}>{current.meaning}</div>
              <div className={styles.example}>&ldquo;{current.example}&rdquo;</div>
            </div>
          </div>
        </div>

        {flipped && (
          <div className={styles.controls}>
            <button type="button" className={`${styles.controlBtn} ${styles.hard}`} onClick={nextCard}>
              Khó 😰
            </button>
            <button type="button" className={`${styles.controlBtn} ${styles.good}`} onClick={nextCard}>
              Tốt 👍
            </button>
            <button type="button" className={`${styles.controlBtn} ${styles.easy}`} onClick={nextCard}>
              Dễ 🎉
            </button>
          </div>
        )}
      </div>

      <h2 className={shared.pageTitle} style={{ fontSize: '1.25rem' }}>Chế độ luyện tập</h2>
      <div className={styles.modesGrid}>
        {practiceModes.map((mode) => (
          <Link key={mode.id} to={mode.id === 'quiz' ? '/quiz' : '/practice'} className={styles.modeCard}>
            <div className={styles.modeIcon}>{mode.icon}</div>
            <div className={styles.modeName} style={{ color: mode.color }}>{mode.name}</div>
            <div className={styles.modeDesc}>{mode.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
