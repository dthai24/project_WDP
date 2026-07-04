import { useCallback, useRef } from 'react';
import { toast } from '@/shared/ui/Toast';

/**
 * Flush editor section đang active + chặn navigation khi section chưa cập nhật / đang upload.
 */
export default function useQuestionBankSectionCommit() {
  const controlsRef = useRef(null);

  const bindSectionControls = useCallback((controls) => {
    controlsRef.current = controls;
  }, []);

  const flushActiveSection = useCallback(() => {
    controlsRef.current?.flush?.();
  }, []);

  const isActiveSectionBusy = useCallback((activeSection) => {
    if (controlsRef.current?.isBusy?.()) return true;
    return Boolean(activeSection?.File);
  }, []);

  const prepareSectionNavigation = useCallback((activeSection) => {
    flushActiveSection();

    if (isActiveSectionBusy(activeSection)) {
      toast.warning('Đang tải file lên, vui lòng đợi hoàn tất.');
      return false;
    }

    return true;
  }, [flushActiveSection, isActiveSectionBusy]);

  return {
    bindSectionControls,
    flushActiveSection,
    isActiveSectionBusy,
    prepareSectionNavigation,
  };
};
