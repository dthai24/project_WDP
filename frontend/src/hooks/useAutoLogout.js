import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIME = 3 * 60 * 60 * 1000; // 3 tiếng 

export function useAutoLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        let timeoutId;

        // Hàm thực hiện đăng xuất khi hết giờ
        const logoutUser = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            alert('Đã hết phiên đăng nhập do bạn không hoạt động trong thời gian dài.');
            navigate('/login');
        };

        // Hàm reset lại đồng hồ đếm ngược
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(logoutUser, INACTIVITY_TIME);
        };

        // Danh sách các hành động để nhận biết user đang tương tác
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Gắn sự kiện lắng nghe vào toàn trang (window)
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });
        resetTimer();
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [navigate]);
}