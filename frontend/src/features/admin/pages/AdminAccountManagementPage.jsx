import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from '@/shared/ui/Toast';
import AppPagination from '@/shared/ui/AppPagination';
import AdminAccountsToolbar from '@/features/admin/components/AdminAccountsToolbar';
import AdminAccountList from '@/features/admin/components/AdminAccountList';
import AdminAccountFormDialog from '@/features/admin/components/AdminAccountFormDialog';
import { getAccounts, updateAccount } from '@/features/admin/services/adminAccountService';
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

  const openEditDialog = (account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values) => {
    if (!editingAccount) return;

    setSaving(true);
    try {
      const res = await updateAccount(editingAccount.id, values);

      if (!res.ok) {
        toast.error(res.message ?? 'Không thể cập nhật tài khoản');
        return;
      }

      toast.success('Đã cập nhật vai trò và trạng thái tài khoản');
      setFormOpen(false);
      setEditingAccount(null);
      await loadAccounts();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: { xs: 22, sm: 24 }, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
          Quản lý tài khoản
        </Typography>
        <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.5, lineHeight: 1.55, maxWidth: 560 }}>
          Theo dõi và quản lý tài khoản Admin, Mentor và Học viên trong hệ thống.
        </Typography>
      </Box>

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
      />

      <AdminAccountList
        accounts={pagination.items}
        loading={loading}
        error={loadError}
        hasAnyAccounts={accounts.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
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
      />
    </Box>
  );
}
