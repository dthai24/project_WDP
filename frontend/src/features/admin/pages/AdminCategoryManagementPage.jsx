import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/shared/ui/Toast';
import AppButton from '@/shared/ui/AppButton';
import AppPagination from '@/shared/ui/AppPagination';
import AdminCatalogToolbar from '@/features/admin/components/AdminCatalogToolbar';
import AdminCategoryList from '@/features/admin/components/AdminCategoryList';
import AdminCategoryCreateDialog from '@/features/admin/components/AdminCategoryCreateDialog';
import AdminCategoryEditDialog from '@/features/admin/components/AdminCategoryEditDialog';
import {
  ADMIN_CATALOG_STATUS_FILTER_OPTIONS,
  ADMIN_CATEGORY_SORT_OPTIONS,
} from '@/features/admin/data/adminCatalogConstants';
import {
  createCategory,
  getCategories,
  updateCategory,
} from '@/features/admin/services/adminCategoryService';
import { filterAndSortCategories } from '@/features/admin/utils/adminCategoryUtils';
import {
  ADMIN_CATEGORY_LIST_DEFAULTS,
  ADMIN_CATEGORY_LIST_PAGE_SIZE,
  buildAdminCategoryActiveChips,
  buildAdminCategoryListSearchParams,
  hasActiveAdminCategoryFilters,
  paginateCategories,
  parseAdminCategoryListParams,
  resetAdminCategoryListParams,
} from '@/features/admin/utils/adminCategoryUtils';
import { TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const PAGE_SIZE = ADMIN_CATEGORY_LIST_PAGE_SIZE;

export default function AdminCategoryManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const queryState = useMemo(
    () => parseAdminCategoryListParams(searchParams),
    [searchParams],
  );

  const showReset = hasActiveAdminCategoryFilters(queryState);

  const activeFilterChips = useMemo(
    () =>
      buildAdminCategoryActiveChips(queryState, ADMIN_CATALOG_STATUS_FILTER_OPTIONS),
    [queryState],
  );

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getCategories();
      if (res.ok) {
        setCategories(res.categories ?? []);
      } else {
        setCategories([]);
        setLoadError(true);
      }
    } catch {
      setCategories([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateQuery = (patch) => {
    setSearchParams(
      buildAdminCategoryListSearchParams({ ...queryState, ...patch }, searchParams),
      { replace: true },
    );
  };

  const filteredCategories = useMemo(
    () => filterAndSortCategories(categories, queryState),
    [categories, queryState],
  );

  const pagination = useMemo(
    () => paginateCategories(filteredCategories, queryState.page, PAGE_SIZE),
    [filteredCategories, queryState.page],
  );

  useEffect(() => {
    if (!loading && queryState.page !== pagination.page) {
      updateQuery({ page: pagination.page });
    }
  }, [loading, queryState.page, pagination.page]);

  const existingNames = useMemo(
    () =>
      categories
        .filter((item) => item.id !== editingCategory?.id)
        .map((item) => item.displayName.trim().toLowerCase()),
    [categories, editingCategory],
  );

  const handleStatusChange = (value) => updateQuery({ status: value, page: 1 });
  const handleSortChange = (value) => updateQuery({ sort: value, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () =>
    setSearchParams(resetAdminCategoryListParams(searchParams), { replace: true });
  const handleRemoveChip = ({ type }) => {
    const defaults = {
      q: '',
      status: ADMIN_CATEGORY_LIST_DEFAULTS.status,
    };
    if (type in defaults) updateQuery({ [type]: defaults[type], page: 1 });
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setEditOpen(true);
  };

  const handleCreateSubmit = async (values) => {
    setCreating(true);
    try {
      const res = await createCategory(values);
      if (!res.ok) {
        toast.error(res.message ?? 'Khong the tao danh muc');
        return;
      }
      toast.success('Da tao danh muc moi');
      setCreateOpen(false);
      await loadCategories();
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (values) => {
    if (!editingCategory) return;

    setSaving(true);
    try {
      const res = await updateCategory(editingCategory.id, values);
      if (!res.ok) {
        toast.error(res.message ?? 'Khong the cap nhat danh muc');
        return;
      }
      toast.success('Da cap nhat danh muc');
      setEditOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
            Quan ly danh muc
          </h1>
          <p className="text-[14px] mt-1 leading-[1.55] max-w-[560px]" style={{ color: MUTED }}>
            Them, chinh sua va sap xep danh muc khoa hoc (IELTS, Giao tiep, Phat am...).
          </p>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Box sx={{ border: '1px solid rgba(15,23,42,0.08)', borderRadius: '999px', p: 0.5, display: 'inline-flex', bgcolor: 'rgba(15,23,42,0.02)' }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                color: viewMode === 'list' ? '#0891B2' : '#94A3B8',
                bgcolor: viewMode === 'list' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                '&:hover': { bgcolor: viewMode === 'list' ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              <ViewListRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{
                color: viewMode === 'grid' ? '#0891B2' : '#94A3B8',
                bgcolor: viewMode === 'grid' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                '&:hover': { bgcolor: viewMode === 'grid' ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              <ViewModuleRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <AppButton
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              height: 44,
              px: 2.5,
              fontSize: 14,
              fontWeight: 700,
              borderRadius: '999px',
              bgcolor: '#0891B2',
              color: '#fff',
              flexShrink: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
            }}
          >
            Tao danh muc
          </AppButton>
        </Box>
      </div>

      <AdminCatalogToolbar
        statusFilter={queryState.status}
        onStatusChange={handleStatusChange}
        sortBy={queryState.sort}
        onSortChange={handleSortChange}
        showReset={showReset}
        onReset={handleReset}
        totalCount={filteredCategories.length}
        countLabel="danh muc"
        CountIcon={CategoryOutlinedIcon}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveChip}
        sortOptions={ADMIN_CATEGORY_SORT_OPTIONS}
      />

      <AdminCategoryList
        categories={pagination.items}
        loading={loading}
        error={loadError}
        hasAnyCategories={categories.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
        onClearFilters={handleReset}
        viewMode={viewMode}
        sortBy={queryState.sort}
        statusFilter={queryState.status}
        onSortChange={handleSortChange}
        onStatusChange={handleStatusChange}
      />

      <AppPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <AdminCategoryCreateDialog
        open={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
        }}
        onSubmit={handleCreateSubmit}
        saving={creating}
        existingNames={categories.map((item) => item.displayName.trim().toLowerCase())}
      />

      <AdminCategoryEditDialog
        open={editOpen}
        onClose={() => {
          if (saving) return;
          setEditOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleEditSubmit}
        saving={saving}
        existingNames={existingNames}
      />
    </div>
  );
}
