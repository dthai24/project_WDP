import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { toast } from '@/shared/ui/Toast';
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
  deleteCategory,
} from '@/features/admin/services/adminCategoryService';
import { filterAndSortCategories } from '@/features/admin/utils/adminCategoryUtils';
import {
  ADMIN_CATEGORY_LIST_DEFAULTS,
  ADMIN_CATEGORY_LIST_PAGE_SIZE,
  buildAdminCategoryActiveChips,
  buildAdminCategoryListSearchParams,
  hasActiveAdminCategoryFilters,
  parseAdminCategoryListParams,
  resetAdminCategoryListParams,
} from '@/features/admin/utils/adminCategoryUtils';
import { useSearchParams } from 'react-router-dom';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const PAGE_SIZE = ADMIN_CATEGORY_LIST_PAGE_SIZE;

export default function AdminCategoryManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // View state: 'list' | 'grid'
  const [viewMode, setViewMode] = useState('list');

  const queryState = useMemo(
    () => parseAdminCategoryListParams(searchParams),
    [searchParams],
  );

  const showReset = hasActiveAdminCategoryFilters(queryState);

  const activeFilterChips = useMemo(
    () =>
      buildAdminCategoryActiveChips(queryState, {
        statusOptions: ADMIN_CATALOG_STATUS_FILTER_OPTIONS,
      }),
    [queryState],
  );

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getCategories({
        page: queryState.page,
        limit: PAGE_SIZE,
        q: queryState.q,
        status: queryState.status,
        sort: queryState.sort,
      });

      if (res.ok) {
        setCategories(res.categories ?? []);
        setTotalPages(res.totalPages ?? 1);
      } else {
        setCategories([]);
        setLoadError(true);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [queryState.page, queryState.q, queryState.status, queryState.sort]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateQuery = (patch) => {
    setSearchParams(
      buildAdminCategoryListSearchParams({ ...queryState, ...patch }, searchParams),
      { replace: true },
    );
  };

  const handleStatusChange = (value) => updateQuery({ status: value, page: 1 });
  const handleSortChange = (value) => updateQuery({ sort: value, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () => setSearchParams(resetAdminCategoryListParams(searchParams), { replace: true });
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

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.displayName}" không?`)) {
      setSaving(true);
      try {
        const res = await deleteCategory(category.id);
        if (!res.ok) {
          toast.error(res.message ?? 'Không thể xóa danh mục');
          return;
        }
        toast.success('Đã xóa danh mục thành công');
        await loadCategories();
      } catch (err) {
        console.error(err);
        toast.error('Lỗi kết nối khi xóa danh mục');
      } finally {
        setSaving(false);
      }
    }
  };

  const existingNames = useMemo(() => {
    if (!editingCategory) return [];
    return categories
      .filter((item) => item.id !== editingCategory.id)
      .map((item) => item.displayName.trim().toLowerCase());
  }, [categories, editingCategory]);

  const handleCreateSubmit = async (values) => {
    setCreating(true);
    try {
      const res = await createCategory(values);
      if (!res.ok) {
        toast.error(res.message ?? 'Không thể tạo danh mục');
        return;
      }
      toast.success('Đã tạo danh mục mới');
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
        toast.error(res.message ?? 'Không thể cập nhật danh mục');
        return;
      }
      toast.success('Đã cập nhật danh mục');
      setEditOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories;

  return (
    <div className="w-full max-w-7xl mx-auto px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight" style={{ color: TEXT }}>
            Quản lý danh mục
          </h1>
          <p className="text-[14px] mt-1 text-slate-500 max-w-2xl leading-relaxed">
            Thêm, chỉnh sửa và sắp xếp danh mục khóa học (IELTS, Giao tiếp, Phát âm...).
          </p>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Box sx={{ border: '1px solid rgba(15,23,42,0.08)', borderRadius: '999px', p: 0.5, display: 'inline-flex', bgcolor: 'rgba(15,23,42,0.02)' }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                color: viewMode === 'list' ? PRIMARY : MUTED,
                bgcolor: viewMode === 'list' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                '&:hover': { bgcolor: viewMode === 'list' ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              <ViewListIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{
                color: viewMode === 'grid' ? PRIMARY : MUTED,
                bgcolor: viewMode === 'grid' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                '&:hover': { bgcolor: viewMode === 'grid' ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              <ViewModuleIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white rounded-lg transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-95"
            style={{ backgroundColor: PRIMARY }}
          >
            Thêm danh mục
          </button>
        </Box>
      </div>

      <AdminCatalogToolbar
        keyword={queryState.q || ''}
        onKeywordChange={(val) => updateQuery({ q: val, page: 1 })}
        statusFilter={queryState.status}
        onStatusChange={handleStatusChange}
        sortBy={queryState.sort}
        onSortChange={handleSortChange}
        showReset={showReset}
        onReset={handleReset}
        totalCount={filteredCategories.length}
        countLabel="danh mục"
        CountIcon={CategoryOutlinedIcon}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveChip}
        sortOptions={ADMIN_CATEGORY_SORT_OPTIONS}
      />

      <AdminCategoryList
        categories={filteredCategories}
        loading={loading}
        error={loadError}
        hasAnyCategories={categories.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
        onDelete={handleDeleteCategory}
        onClearFilters={handleReset}
        viewMode={viewMode}
        sortBy={queryState.sort}
        statusFilter={queryState.status}
        onSortChange={handleSortChange}
        onStatusChange={handleStatusChange}
      />

      <AppPagination
        page={queryState.page}
        totalPages={totalPages}
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
