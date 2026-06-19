import { pricingPlans } from '../../data/mockData';
import shared from '../shared.module.css';
import styles from './Pricing.module.css';

export default function Pricing() {
  return (
    <div>
      <h1 className={shared.pageTitle}>Bảng giá</h1>
      <p className={shared.pageDesc}>Chọn gói phù hợp để mở khóa toàn bộ tính năng học từ vựng.</p>

      <div className={styles.plans}>
        {pricingPlans.map((plan) => (
          <div key={plan.id} className={`${styles.plan} ${plan.popular ? styles.popular : ''}`}>
            {plan.popular && <span className={styles.popularBadge}>Phổ biến nhất</span>}
            <div className={styles.planName} style={{ color: plan.color }}>{plan.name}</div>
            <div className={styles.planPrice}>
              {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString()}đ`}
            </div>
            <div className={styles.planPeriod}>{plan.period}</div>
            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f}><span className={styles.check}>✓</span> {f}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`${styles.selectBtn} ${plan.popular ? styles.selectBtnPrimary : styles.selectBtnOutline}`}
            >
              {plan.price === 0 ? 'Đang dùng' : 'Nâng cấp ngay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
