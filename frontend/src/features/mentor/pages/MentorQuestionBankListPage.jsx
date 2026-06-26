/**
 * MentorQuestionBankListPage
 * Route: /mentor/question-banks
 * Search: Header SearchBox (param q) — không nằm trong toolbar.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import MentorQuestionBankToolbar from '@/features/mentor/components/questionBank/MentorQuestionBankToolbar';
import MentorQuestionBankList from '@/features/mentor/components/questionBank/MentorQuestionBankList';
import MentorQuestionBankListPagination, {
  QB_LIST_PAGE_SIZE,
} from '@/features/mentor/components/questionBank/MentorQuestionBankListPagination';
import MentorSelectCourseForQBDialog from '@/features/mentor/components/questionBank/MentorSelectCourseForQBDialog';
import { mentorQuestionBankFilterOptionsMock } from '@/features/mentor/data/mentorQuestionBankMock';
import {
  fetchCoursesForQB,
  getQuestionBankListSummaries,
} from '@/features/mentor/services/questionBankService';
import {
  parseQBListParams,
  hasActiveQBFilters,
  buildQBListSearchParams,
  resetQBListParams,
  buildQBActiveChips,
  filterAndSortQBItems,
  paginateQBItems,
  QB_LIST_DEFAULTS,
} from '@/features/mentor/utils/mentorQuestionBankListParams';
import axios from 'axios';

const PAGE_SIZE = QB_LIST_PAGE_SIZE;

export default function MentorQuestionBankListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listQuestionBank, setListQuestionBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [coursesWithoutQB, setCoursesWithoutQB] = useState([]);

  const queryState = useMemo(() => parseQBListParams(searchParams), [searchParams]);
  const showReset = hasActiveQBFilters(queryState);

  const activeFilterChips = useMemo(
    () => buildQBActiveChips(queryState, mentorQuestionBankFilterOptionsMock),
    [queryState]
  );


  // ________Fetch List Courses'summaries has question bank_______________
  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        const userRaw = localStorage.getItem('user') //user is stored in localStorage with type is JSON string 
        // // const userId = JSON.parse(user)
        // console.log(typeof user)
        const user = JSON.parse(userRaw)
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/question-bank/getAllBankOfMentor", {
          params: {
            userId: user.userId
          }
        })
        setListQuestionBank(res.data.questionBanks)
        console.log(res)
      } catch (err) {
        console.error(err.message)
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems();
    return () => {
      isMounted = false;
    };
  }, []);

  //_____________________Fetch Data_______________________
  // useEffect(async () => {
  //   // console.log(localStorage.getItem('user'))
  //   const user = localStorage.getItem('user').json()
  //   if (!selectDialogOpen) return;

  //   const res = await fetchCoursesForQB((user.userId))

  //   if(res.success) {
  //     setCoursesWithoutQB
  //   }

  //   // .then((res) => {
  //   //   if (res.ok) setCoursesWithoutQB(res.courses);
  //   // });
  // }, [selectDialogOpen]);

  const updateQuery = (patch) => {
    setSearchParams(
      buildQBListSearchParams({ ...queryState, ...patch }, searchParams),
      { replace: true }
    );
  };

  //__________Filter List Question Bank
  const filteredItems = useMemo(
    () => filterAndSortQBItems(listQuestionBank, queryState),
    [listQuestionBank, queryState]
  );

  //___________After filter -> pagination
  const pagination = useMemo(
    () => paginateQBItems(filteredItems, queryState.page, PAGE_SIZE),
    [filteredItems, queryState.page]
  );

  useEffect(() => {
    if (!loading && queryState.page !== pagination.page) {
      updateQuery({ page: pagination.page });
    }
  }, [loading, queryState.page, pagination.page]);

  const handleStatusChange = (v) => updateQuery({ status: v, page: 1 });
  const handleQuestionStatusChange = (v) => updateQuery({ questionStatus: v, page: 1 });
  const handleSortChange = (v) => updateQuery({ sort: v, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () => setSearchParams(resetQBListParams(searchParams), { replace: true });
  const handleRemoveChip = ({ type }) => {
    const defaults = {
      q: '',
      status: QB_LIST_DEFAULTS.status,
      questionStatus: QB_LIST_DEFAULTS.questionStatus,
    };
    if (type in defaults) updateQuery({ [type]: defaults[type], page: 1 });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          mb: 2.5,
        }}
      >
        <Breadcrumbs
          separator="/"
          sx={{ '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}
        >
          <MuiLink
            component={Link}
            to="/home"
            underline="hover"
            sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
          >
            Trang chủ
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
            Ngân hàng câu hỏi
          </Typography>
        </Breadcrumbs>

        <AppButton
          startIcon={<AddRoundedIcon />}
          onClick={() => setSelectDialogOpen(true)}
          sx={{
            height: 44,
            px: 2.5,
            fontSize: 14,
            fontWeight: 700,
            borderRadius: '999px',
            bgcolor: '#0891B2',
            color: '#fff',
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
          }}
        >
          Tạo bộ câu hỏi
        </AppButton>
      </Box>

      <MentorQuestionBankToolbar
        statusFilter={queryState.status}
        onStatusChange={handleStatusChange}
        questionStatusFilter={queryState.questionStatus}
        onQuestionStatusChange={handleQuestionStatusChange}
        sortBy={queryState.sort}
        onSortChange={handleSortChange}
        totalCount={filteredItems.length}
        showReset={showReset}
        onReset={handleReset}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveChip}
      />

      <MentorQuestionBankList
        listQuestionBank={pagination.listQuestionBank}
        loading={loading}
        hasAnyItems={listQuestionBank.length > 0}
        showReset={showReset}
        onReset={handleReset}
      />

      {!loading && pagination.totalPages > 1 && (
        <>
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: '#64748B', mt: 3, fontSize: 12 }}
          >
            Hiển thị {pagination.rangeStart}–{pagination.rangeEnd} trong tổng số{' '}
            {pagination.totalItems} khóa học
          </Typography>
          <MentorQuestionBankListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <MentorSelectCourseForQBDialog
        open={selectDialogOpen}
        onClose={() => setSelectDialogOpen(false)}
        courses={coursesWithoutQB}
        onSelect={(course) =>
          navigate(`/mentor/question-banks/create?courseId=${course.courseId}`)
        }
      />
    </Box>
  );
}
