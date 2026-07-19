import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  useBeforeUnload,
  useBlocker,
} from 'react-router-dom';

/**
 * Cảnh báo khi học viên rời trang đang làm bài kiểm tra.
 * Sử dụng hook useBlocker chuẩn của react-router-dom v6.4+ / v7 để chặn điều hướng SPA.
 */
export function useTestLeaveGuard(enabled) {
  const allowLeaveRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allowLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  const blocker = useBlocker(
    useCallback(
      () => {
        if (!enabled || allowLeaveRef.current) return false;
        return true; // Chặn chuyển trang
      },
      [enabled]
    )
  );

  useEffect(() => {
    if (enabled) {
      allowLeaveRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [blocker.state]);

  const confirmLeave = useCallback(() => {
    allowLeaveRef.current = true;
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker.state]);

  const cancelLeave = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker.state]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!enabled || allowLeaveRef.current) return;
        event.preventDefault();
        event.returnValue = TEST_LEAVE_DIALOG.beforeUnloadMessage;
        return TEST_LEAVE_DIALOG.beforeUnloadMessage;
      },
      [enabled],
    ),
  );

  return {
    dialogOpen,
    confirmLeave,
    cancelLeave,
    allowLeave,
  };
}

export const TEST_LEAVE_DIALOG = {
  title: 'Lưu ý',
  message:
    'Bạn đang làm bài kiểm tra. Nếu thoát trang bây giờ, bạn sẽ mất 1 lượt làm bài và tiến trình hiện tại sẽ không được lưu. Bạn có chắc muốn thoát không?',
  confirmLabel: 'Thoát và mất lượt',
  cancelLabel: 'Tiếp tục làm bài',
  /** Dùng cho beforeunload — trình duyệt có thể vẫn hiện câu mặc định của hệ thống. */
  beforeUnloadMessage:
    'Bạn sẽ mất 1 lượt làm bài nếu rời trang. Tiến trình làm bài sẽ không được lưu.',
};
