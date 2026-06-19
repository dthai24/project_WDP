import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const { sidebarCollapsed } = useApp();

  return (
    <div className={styles.container}>
      <Header />
      <Sidebar />
      <div className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
