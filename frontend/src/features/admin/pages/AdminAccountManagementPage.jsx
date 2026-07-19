import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { toast } from '@/shared/ui/Toast';
import AppButton from '@/shared/ui/AppButton';
import AppPagination from '@/shared/ui/AppPagination';
import AdminAccountsToolbar from '@/features/admin/components/AdminAccountsToolbar';
import AdminAccountList from '@/features/admin/components/AdminAccountList';
import AdminAccountFormDialog from '@/features/admin/components/AdminAccountFormDialog';
import AdminAccountCreateDialog from '@/features/admin/components/AdminAccountCreateDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { createAccount, getAccounts, updateAccount, toggleAccountStatus } from '@/features/admin/services/adminAccountService';
import {
  ADMIN_ACCOUNT_ROLE_OPTIONS,
  ADMIN_ACCOUNT_STATUS_OPTIONS,
} from '@/features/admin/data/adminAccountsMock';
import { filterAndSortAccounts } from '@/features/admin/utils/adminAccountUtils';
import {
  ADMIN_ACCOUNT_LIST_DEFAULTS,
  ADMIN_ACCOUNT_LIST_PAGE_SIZE,
  buildAdminAccountActiveChips,
  buildAdminAccountListSearchParams,
  hasActiveAdminAccountFilters,
  paginateAccounts,
  parseAdminAccountListParams,
  resetAdminAccountListParams,
} from '@/features/admin/utils/adminAccountListParams';
import { useSearchParams } from 'react-router-dom';
import { TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const PAGE_SIZE = ADMIN_ACCOUNT_LIST_PAGE_SIZE;

export default function AdminAccountManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [accountToToggle, setAccountToToggle] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const queryState = useMemo(
    () => parseAdminAccountListParams(searchParams),
    [searchParams],
  );

  const showReset = hasActiveAdminAccountFilters(queryState);

  const activeFilterChips = useMemo(
    () =>
      buildAdminAccountActiveChips(queryState, {
        roleOptions: ADMIN_ACCOUNT_ROLE_OPTIONS,
        statusOptions: ADMIN_ACCOUNT_STATUS_OPTIONS,
      }),
    [queryState],
  );

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getAccounts();
      if (res.ok) {
        setAccounts(res.accounts ?? []);
      } else {
        setAccounts([]);
        setLoadError(true);
      }
    } catch {
      setAccounts([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const updateQuery = (patch) => {
    setSearchParams(
      buildAdminAccountListSearchParams({ ...queryState, ...patch }, searchParams),
      { replace: true },
    );
  };

  const filteredAccounts = useMemo(
    () => filterAndSortAccounts(accounts, queryState),
    [accounts, queryState],
  );

  const pagination = useMemo(
    () => paginateAccounts(filteredAccounts, queryState.page, PAGE_SIZE),
    [filteredAccounts, queryState.page],
  );

  useEffect(() => {
    if (!loading && queryState.page !== pagination.page) {
      updateQuery({ page: pagination.page });
    }
  }, [loading, queryState.page, pagination.page]);

  const handleRoleChange = (value) => updateQuery({ role: value, page: 1 });
  const handleStatusChange = (value) => updateQuery({ status: value, page: 1 });
  const handleSortChange = (value) => updateQuery({ sort: value, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () => setSearchParams(resetAdminAccountListParams(searchParams), { replace: true });
  const handleRemoveChip = ({ type }) => {
    const defaults = {
      q: '',
      role: ADMIN_ACCOUNT_LIST_DEFAULTS.role,
      status: ADMIN_ACCOUNT_LIST_DEFAULTS.status,
    };
    if (type in defaults) updateQuery({ [type]: defaults[type], page: 1 });
  };

  const [dialogMode, setDialogMode] = useState('edit');

  const openEditDialog = (account) => {
    setEditingAccount(account);
    setDialogMode('edit');
    setFormOpen(true);
  };

  const openViewDialog = (account) => {
    setEditingAccount(account);
    setDialogMode('view');
    setFormOpen(true);
  };

  const handleFormSubmit = async (values) => {
    if (!editingAccount) return;

    setSaving(true);
    try {
      const res = await updateAccount(editingAccount.id, values);

      if (!res.ok) {
        toast.error(res.message ?? 'Khong the cap nhat tai khoan');
        return;
      }

      toast.success('Da cap nhat vai tro va trang thai tai khoan');
      setFormOpen(false);
      setEditingAccount(null);
      await loadAccounts();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubmit = async (values) => {
    setCreating(true);
    try {
      const res = await createAccount(values);

      if (!res.ok) {
        toast.error(res.message ?? 'Khong the tao tai khoan');
        return;
      }

      toast.success('Da tao tai khoan moi');
      setCreateOpen(false);
      await loadAccounts();
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatusClick = (account) => {
    setAccountToToggle(account);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!accountToToggle) return;
    setToggleLoading(true);
    try {
      const actionText = accountToToggle.status === 'ACTIVE' ? 'khóa' : 'kích hoạt';
      const res = await toggleAccountStatus(accountToToggle.id, accountToToggle.status);
      if (res.ok) {
        toast.success(`Đã thực hiện ${actionText} tài khoản thành công`);
        setToggleConfirmOpen(false);
        setAccountToToggle(null);
        await loadAccounts();
      } else {
        toast.error(res.message || 'Không thể thay đổi trạng thái tài khoản');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi thay đổi trạng thái');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
            Quan ly tai khoan
          </h1>
          <p className="text-[14px] mt-1 leading-[1.55] max-w-[560px]" style={{ color: MUTED }}>
            Theo doi va quan ly tai khoan Admin, Mentor va Hoc vien trong he thong.
          </p>
        </div>

      </div>

      <AdminAccountsToolbar
        roleFilter={queryState.role}
        onRoleChange={handleRoleChange}
        statusFilter={queryState.status}
        onStatusChange={handleStatusChange}
        sortBy={queryState.sort}
        onSortChange={handleSortChange}
        showReset={showReset}
        onReset={handleReset}
        totalCount={filteredAccounts.length}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveChip}
        keyword={queryState.q || ''}
        onKeywordChange={(val) => updateQuery({ q: val, page: 1 })}
        onCreateClick={() => setCreateOpen(true)}
      />

      <AdminAccountList
        accounts={pagination.items}
        loading={loading}
        error={loadError}
        hasAnyAccounts={accounts.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
        onView={openViewDialog}
        onToggleStatus={handleToggleStatusClick}
        onClearFilters={handleReset}
      />

      <AppPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <AdminAccountFormDialog
        open={formOpen}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSubmit={handleFormSubmit}
        saving={saving}
        mode={dialogMode}
      />

      <AdminAccountCreateDialog
        open={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
        }}
        onSubmit={handleCreateSubmit}
        saving={creating}
      />

      <ConfirmDialog
        open={toggleConfirmOpen}
        onClose={() => !toggleLoading && setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        loading={toggleLoading}
        title="Xác nhận thay đổi trạng thái?"
        message={`Bạn có chắc muốn thực hiện ${accountToToggle?.status === 'ACTIVE' ? 'khóa' : 'kích hoạt'} tài khoản này chứ?`}
        confirmLabel="Đồng ý"
        cancelLabel="Hủy"
        destructive={accountToToggle?.status === 'ACTIVE'}
      />


    </div>
  );
}
