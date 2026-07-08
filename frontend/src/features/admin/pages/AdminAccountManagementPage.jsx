import React, { useState, useEffect } from 'react';
import { useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { toast } from '@/shared/ui/Toast';
import AppPagination from '@/shared/ui/AppPagination';
import AdminAccountsToolbar from '@/features/admin/components/AdminAccountsToolbar';
import AdminAccountList from '@/features/admin/components/AdminAccountList';
import AdminAccountFormDialog from '@/features/admin/components/AdminAccountFormDialog';
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
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);

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
      const response = await getAccounts();
      console.log("=== MINH CHECK ATLAS DATA ===", response.data);
      if (response.ok) {
        setAccounts(response.accounts ?? []);
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
        toast.error(res.message ?? 'Không thể cập nhật thiết lập tài khoản');
        return;
      }

      toast.success('Đã cập nhật trạng thái tài khoản thành công');
      setFormOpen(false);
      setEditingAccount(null);
      await loadAccounts();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (account) => {
    try {
      const res = await toggleAccountStatus(account.id, account.status);
      if (res.ok) {
        toast.success(res.message);
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === account.id ? res.account : acc))
        );
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi thay đổi trạng thái tài khoản');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-1">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight flex items-center gap-2" style={{ color: TEXT }}>
            Quản lý tài khoản
          </h1>
          <p className="text-[14px] mt-1 text-slate-500 max-w-2xl leading-relaxed">
            Theo dõi và quản lý phân quyền vai trò, trạng thái chặn khóa và thông tin chi tiết của Admin, Mentor và Student.
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
      />

      <AdminAccountList
        accounts={pagination.items}
        loading={loading}
        error={loadError}
        hasAnyAccounts={accounts.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
        onView={openViewDialog}
        onToggleStatus={handleToggleStatus}
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
    </div>
  );
}
