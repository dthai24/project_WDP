import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CREATE_CARD_SX, MUTED, TEXT } from './mentorCourseCreateStyles';
import MentorCourseStudentsSummary from './MentorCourseStudentsSummary';
import MentorCourseStudentsToolbar from './MentorCourseStudentsToolbar';
import MentorCourseStudentsList from './MentorCourseStudentsList';
import MentorCourseStudentsPagination from './MentorCourseStudentsPagination';
import {
  fetchCourseStudents,
  fetchCourseStudentStats,
} from '../../../services/mentorCourseService';
import {
  filterAndSortCourseStudents,
  hasActiveCourseStudentFilters,
  paginateCourseStudents,
} from '../../../utils/mentorCourseStudentsUtils';

const DEFAULT_FILTERS = {
  q: '',
  status: 'all',
  sort: 'progress_desc',
};

export default function MentorCourseStudentsTab({ courseId }) {
  const [allStudents, setAllStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    learningCount: 0,
    completedCount: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const updateFilters = useCallback((updater) => {
    setPage(1);
    setFilters(updater);
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);

    const [studentsRes, statsRes] = await Promise.all([
      fetchCourseStudents(courseId),
      fetchCourseStudentStats(courseId),
    ]);

    if (studentsRes.ok) setAllStudents(studentsRes.students);
    if (statsRes.ok) setStats(statsRes.stats);

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(
    () => filterAndSortCourseStudents(allStudents, filters),
    [allStudents, filters]
  );

  const pagination = useMemo(
    () => paginateCourseStudents(filteredStudents, page),
    [filteredStudents, page]
  );

  useEffect(() => {
    if (pagination.page !== page) {
      setPage(pagination.page);
    }
  }, [pagination.page, page]);

  const showReset = hasActiveCourseStudentFilters(filters);

  const handleViewDetail = (student) => {
    // TODO: open student progress detail drawer/dialog
    void student;
  };

  return (
    <Box sx={CREATE_CARD_SX}>
      

      <MentorCourseStudentsSummary stats={stats} loading={loading} />

      <MentorCourseStudentsToolbar
        search={filters.q}
        onSearchChange={(q) => updateFilters((prev) => ({ ...prev, q }))}
        statusFilter={filters.status}
        onStatusChange={(status) => updateFilters((prev) => ({ ...prev, status }))}
        sortBy={filters.sort}
        onSortChange={(sort) => updateFilters((prev) => ({ ...prev, sort }))}
        showReset={showReset}
        onReset={() => {
          setPage(1);
          setFilters(DEFAULT_FILTERS);
        }}
        resultCount={loading ? '—' : pagination.totalItems}
      />

      <MentorCourseStudentsList
        students={pagination.items}
        loading={loading}
        hasAnyStudents={allStudents.length > 0}
        isFiltered={showReset}
        onViewDetail={handleViewDetail}
        onClearFilters={() => {
          setPage(1);
          setFilters(DEFAULT_FILTERS);
        }}
      />

      {!loading && pagination.totalItems > 0 && pagination.totalPages > 1 && (
        <>
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: MUTED, mt: 2.5, fontSize: 12 }}
          >
            Hiển thị {pagination.rangeStart}–{pagination.rangeEnd} trong tổng số{' '}
            {pagination.totalItems} học viên
          </Typography>
          <MentorCourseStudentsPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </Box>
  );
}
