import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { landingStats, landingFeatures, testimonials, faqs } from '../../data/mockData';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { isAuthenticated } = useApp();

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <img src="/logo.svg" alt="Luyện Từ" />
          <span className={styles.brandText}>Luyện Từ</span>
        </Link>
        <ul className={styles.navLinks}>
          <li><a href="#features">Tính năng</a></li>
          <li><a href="#how-it-works">Cách học</a></li>
          <li><a href="#testimonials">Đánh giá</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <Link to="/home" className={styles.btnPrimary}>Vào học</Link>
          ) : (
            <>
              <Link to="/login" className={styles.btnOutline}>Đăng nhập</Link>
              <Link to="/register" className={styles.btnPrimary}>Đăng ký miễn phí</Link>
            </>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1>Học từ vựng tiếng Anh hiệu quả với Flashcard thông minh</h1>
            <p>
              Luyện Từ giúp bạn ghi nhớ từ vựng lâu hơn gấp 3 lần nhờ Spaced Repetition,
              lộ trình TOEIC/IELTS và 6 game luyện tập tương tác.
            </p>

            <div className={styles.heroStats}>
              {landingStats.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.heroFeatures}>
              {['Flashcard thông minh', 'Roadmap TOEIC / IELTS', 'Game luyện tập + SRS'].map((f) => (
                <div key={f} className={styles.heroFeature}>
                  <span style={{ color: '#10b981' }}>✓</span> {f}
                </div>
              ))}
            </div>

            <div className={styles.heroCta}>
              <Link to={isAuthenticated ? '/home' : '/register'} className={styles.btnPrimary} style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Bắt đầu miễn phí →
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className={styles.btnOutline} style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  Tôi đã có tài khoản
                </Link>
              )}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroMockup}>
              <div className={styles.mockupInner}>
                <div className={styles.mockupHeader}>
                  <div className={styles.mockupLogo} />
                  <span className={styles.mockupBrand}>Luyện Từ</span>
                </div>
                <div className={styles.mockupBody}>
                  <div className={styles.mockupSidebar}>
                    {['Trang chủ', 'Bộ từ vựng', 'Luyện tập', 'Game', 'Lộ trình'].map((item, i) => (
                      <div key={item} className={`${styles.mockupNavItem} ${i === 2 ? styles.mockupNavActive : ''}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className={styles.mockupContent}>
                    <div className={styles.mockupFlashcard}>
                      <div className={styles.mockupWord}>accomplish</div>
                      <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: 8 }}>/əˈkʌmplɪʃ/</div>
                      <div style={{ opacity: 0.5, fontSize: '0.75rem', marginTop: 16 }}>Nhấn để lật thẻ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>Tính năng chính</div>
            <h2 className={styles.sectionTitle}>Tạo deck, học flashcard, luyện game, ôn SRS — tất cả trong một</h2>
            <p className={styles.sectionDesc}>Dưới đây là những gì bạn thực sự dùng mỗi ngày khi học trên Luyện Từ.</p>
          </div>
          <div className={styles.featuresGrid}>
            {landingFeatures.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureEyebrow} style={{ color: f.color }}>{f.eyebrow}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
                <div className={styles.chips}>
                  {f.chips.map((c) => <span key={c} className={styles.chip}>{c}</span>)}
                </div>
                <ul className={styles.bullets}>
                  {f.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>3 bước mỗi ngày</div>
            <h2 className={styles.sectionTitle}>Chọn bộ từ → Luyện tập → SRS nhắc ôn</h2>
            <p className={styles.sectionDesc}>Không cần lên kế hoạch phức tạp. Chọn bộ từ, luyện qua flashcard hoặc game, rồi hệ thống tự nhắc bạn ôn lại.</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>Người học nói gì</div>
            <h2 className={styles.sectionTitle}>Hơn 100.000 người đang dùng mỗi ngày</h2>
          </div>
          <div className={styles.testimonials}>
            {testimonials.map((t) => (
              <div key={t.author} className={styles.testimonial}>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                <div className={styles.testimonialAuthor}>{t.author}</div>
                <div className={styles.testimonialRole}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>FAQ</div>
            <h2 className={styles.sectionTitle}>Câu hỏi thường gặp</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div key={faq.q} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.q}</h3>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Bắt đầu miễn phí, không cần cài app</h2>
          <p className={styles.ctaDesc}>Mở web, đăng ký trong 10 giây, chọn bộ từ đầu tiên và bắt đầu học ngay.</p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={styles.ctaBtnWhite}>Đăng ký miễn phí →</Link>
            <Link to="/login" className={styles.ctaBtnGhost}>Tôi đã có tài khoản</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <Link to="/" className={styles.brand}>
                <img src="/logo.svg" alt="Luyện Từ" />
                <span className={styles.brandText}>Luyện Từ</span>
              </Link>
              <p>Flashcard, lộ trình TOEIC/IELTS, 6 game luyện tập, SRS nhắc ôn và cửa hàng coin — tất cả miễn phí trên một trang web.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Học tiếng Anh</h4>
              <Link to="/register">Từ vựng TOEIC</Link>
              <Link to="/register">Từ vựng IELTS</Link>
              <Link to="/register">Oxford 3000</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Tính năng</h4>
              <Link to="/register">Flashcard thông minh</Link>
              <Link to="/register">Spaced Repetition</Link>
              <Link to="/register">Game luyện tập</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Liên kết</h4>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký miễn phí</Link>
              <Link to="/pricing">Bảng giá</Link>
              <Link to="/policy">Điều khoản</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} Luyện Từ. Học từ vựng hiệu quả trên web, laptop và điện thoại.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
