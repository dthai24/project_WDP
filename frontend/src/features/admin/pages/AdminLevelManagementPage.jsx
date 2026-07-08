import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { toast } from '@/shared/ui/Toast';
import AppPagination from '@/shared/ui/AppPagination';
import AdminCatalogToolbar from '@/features/admin/components/AdminCatalogToolbar';
import AdminLevelList from '@/features/admin/components/AdminLevelList';
import AdminLevelCreateDialog from '@/features/admin/components/AdminLevelCreateDialog';
import AdminLevelEditDialog from '@/features/admin/components/AdminLevelEditDialog';
import { useSearchParams } from 'react-router-dom';
import {
  ADMIN_CATALOG_STATUS_FILTER_OPTIONS,
  ADMIN_LEVEL_SORT_OPTIONS,
} from '@/features/admin/data/adminCatalogConstants';
import {
  createLevel,
  getLevels,
  updateLevel,
  deleteLevel,
} from '@/features/admin/services/adminLevelService';
import { filterAndSortLevels } from '@/features/admin/utils/adminLevelUtils';
import {
  ADMIN_LEVEL_LIST_DEFAULTS,
  ADMIN_LEVEL_LIST_PAGE_SIZE,
  buildAdminLevelActiveChips,
  buildAdminLevelListSearchParams,
  hasActiveAdminLevelFilters,
  parseAdminLevelListParams,
  resetAdminLevelListParams,
} from '@/features/admin/utils/adminLevelUtils';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const PAGE_SIZE = ADMIN_LEVEL_LIST_PAGE_SIZE;

export default function AdminLevelManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [levels, setLevels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [saving, setSaving] = useState(false);

  const queryState = useMemo(
    () => parseAdminLevelListParams(searchParams),
    [searchParams],
  );

  const showReset = hasActiveAdminLevelFilters(queryState);

  const activeFilterChips = useMemo(
    () =>
      buildAdminLevelActiveChips(queryState, {
        statusOptions: ADMIN_CATALOG_STATUS_FILTER_OPTIONS,
      }),
    [queryState],
  );

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getLevels({
        page: queryState.page,
        limit: PAGE_SIZE,
        q: queryState.q,
        status: queryState.status,
        sort: queryState.sort,
      });

      if (res.ok) {
        setLevels(res.levels ?? []);
        setTotalPages(res.totalPages ?? 1);
      } else {
        setLevels([]);
        setLoadError(true);
      }
    } catch (err) {
      console.error(err);
      setLevels([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [queryState.page, queryState.q, queryState.status, queryState.sort]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  const updateQuery = (patch) => {
    setSearchParams(
      buildAdminLevelListSearchParams({ ...queryState, ...patch }, searchParams),
      { replace: true },
    );
  };

  const handleStatusChange = (value) => updateQuery({ status: value, page: 1 });
  const handleSortChange = (value) => updateQuery({ sort: value, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () => setSearchParams(resetAdminLevelListParams(searchParams), { replace: true });
  const handleRemoveChip = ({ type }) => {
    const defaults = {
      q: '',
      status: ADMIN_LEVEL_LIST_DEFAULTS.status,
    };
    if (type in defaults) updateQuery({ [type]: defaults[type], page: 1 });
  };

  const openEditDialog = (level) => {
    setEditingLevel(level);
    setEditOpen(true);
  };

  const handleDeleteLevel = async (level) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa trình độ "${level.displayName}" không?`)) {
      setSaving(true);
      try {
        const res = await deleteLevel(level.id);
        if (!res.ok) {
          toast.error(res.message ?? 'Không thể xóa trình độ');
          return;
        }
        toast.success('Đã xóa trình độ thành công');
        await loadLevels();
      } catch (err) {
        console.error(err);
        toast.error('Lỗi kết nối khi xóa trình độ');
      } finally {
        setSaving(false);
      }
    }
  };

  const existingNames = useMemo(() => {
    if (!editingLevel) return [];
    return levels
      .filter((item) => item.id !== editingLevel.id)
      .map((item) => item.displayName.trim().toLowerCase());
  }, [levels, editingLevel]);

  const handleCreateSubmit = async (values) => {
    setCreating(true);
    try {
      const res = await createLevel(values);
      if (!res.ok) {
        toast.error(res.message ?? 'Không thể tạo trình độ');
        return;
      }
      toast.success('Đã tạo trình độ mới');
      setCreateOpen(false);
      await loadLevels();
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (values) => {
    if (!editingLevel) return;

    setSaving(true);
    try {
      const res = await updateLevel(editingLevel.id, values);
      if (!res.ok) {
        toast.error(res.message ?? 'Không thể cập nhật trình độ');
        return;
      }
      toast.success('Đã cập nhật trình độ');
      setEditOpen(false);
      setEditingLevel(null);
      await loadLevels();
    } finally {
      setSaving(false);
    }
  };

  const filteredLevels = levels;

  return (
    <div className="w-full max-w-7xl mx-auto px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight" style={{ color: TEXT }}>
            Quản lý trình độ
          </h1>
          <p className="text-[14px] mt-1 text-slate-500 max-w-2xl leading-relaxed">
            Thêm, chỉnh sửa và cấu hình trình độ (IELTS 5.0, CEFR A1, CEFR B2...).
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white rounded-lg transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-95"
          style={{ backgroundColor: PRIMARY }}
        >
          Thêm trình độ
        </button>
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
        totalCount={filteredLevels.length}
        countLabel="trình độ"
        CountIcon={LayersOutlinedIcon}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveChip}
        sortOptions={ADMIN_LEVEL_SORT_OPTIONS}
      />

      <AdminLevelList
        levels={filteredLevels}
        loading={loading}
        error={loadError}
        hasAnyLevels={levels.length > 0}
        isFiltered={showReset || Boolean(queryState.q?.trim())}
        onEdit={openEditDialog}
        onDelete={handleDeleteLevel}
        onClearFilters={handleReset}
      />

      <AppPagination
        page={queryState.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AdminLevelCreateDialog
        open={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
        }}
        onSubmit={handleCreateSubmit}
        saving={creating}
        existingNames={levels.map((item) => item.displayName.trim().toLowerCase())}
      />

      <AdminLevelEditDialog
        open={editOpen}
        onClose={() => {
          if (saving) return;
          setEditOpen(false);
          setEditingLevel(null);
        }}
        level={editingLevel}
        onSubmit={handleEditSubmit}
        saving={saving}
        existingNames={existingNames}
      />
    </div>
  );
}
