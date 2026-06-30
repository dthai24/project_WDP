/**

 * MentorQuestionBankListPage — UI + mock data, không gọi API.

 */

import { useMemo, useState } from 'react';

import { Box, Breadcrumbs, Link as MuiLink, Typography, alpha } from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AppButton from '@/shared/ui/AppButton';

import AppPagination from '@/shared/ui/AppPagination';

import EmptyState from '@/shared/ui/EmptyState';
import MentorQuestionBankRow from '@/features/mentor/components/questionBank/MentorQuestionBankRow';

import MentorQuestionBankToolbar from '@/features/mentor/components/questionBank/MentorQuestionBankToolbar';

import MentorSelectCourseForQBDialog from '@/features/mentor/components/questionBank/MentorSelectCourseForQBDialog';

import {

  mapQuestionBankMockToListItems,

  mentorQuestionBankFilterOptionsMock,

  mentorQuestionBankMock,

} from '@/features/mentor/data/mentorQuestionBankMock';

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



const PAGE_SIZE = 8;



export default function MentorQuestionBankListPage() {

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectDialogOpen, setSelectDialogOpen] = useState(false);



  const listQuestionBank = useMemo(() => mapQuestionBankMockToListItems(), []);

  const coursesWithoutQB = useMemo(

    () =>

      mentorQuestionBankMock.map((course) => ({

        CourseId: course.courseId,

        CourseName: course.courseName,

      })),

    [],

  );



  const queryState = useMemo(() => parseQBListParams(searchParams), [searchParams]);

  const showReset = hasActiveQBFilters(queryState);

  const activeFilterChips = useMemo(

    () => buildQBActiveChips(queryState, mentorQuestionBankFilterOptionsMock),

    [queryState],

  );



  const updateQuery = (patch) => {

    setSearchParams(

      buildQBListSearchParams({ ...queryState, ...patch }, searchParams),

      { replace: true },

    );

  };



  const filteredItems = useMemo(

    () => filterAndSortQBItems(listQuestionBank, queryState),

    [listQuestionBank, queryState],

  );



  const pagination = useMemo(

    () => paginateQBItems(filteredItems, queryState.page, PAGE_SIZE),

    [filteredItems, queryState.page],

  );



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



  const renderList = () => {

    if (pagination.listQuestionBank.length === 0) {

      return (

        <Box

          sx={{

            borderRadius: '20px',

            bgcolor: '#FFFFFF',

            border: `1px solid ${alpha('#0F172A', 0.08)}`,

          }}

        >

          <EmptyState

            embedded

            icon={QuizOutlinedIcon}

            title={

              listQuestionBank.length > 0

                ? 'Không tìm thấy khóa học phù hợp'

                : 'Chưa có khóa học nào trong ngân hàng câu hỏi'

            }

            description={

              listQuestionBank.length > 0

                ? 'Thử thay đổi từ khóa hoặc bộ lọc.'

                : 'Tạo khóa học trước, sau đó quay lại để quản lý câu hỏi.'

            }

            actionLabel={listQuestionBank.length > 0 && showReset ? 'Xóa bộ lọc' : undefined}

            onAction={listQuestionBank.length > 0 && showReset ? handleReset : undefined}

          />

        </Box>

      );

    }



    return (

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

        {pagination.listQuestionBank.map((bank) => (

          <MentorQuestionBankRow key={bank.CourseId} bankItem={bank} />

        ))}

      </Box>

    );

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



      {renderList()}



      {pagination.totalPages > 1 && (

        <>

          <Typography

            variant="caption"

            sx={{ display: 'block', textAlign: 'center', color: '#64748B', mt: 3, fontSize: 12 }}

          >

            Hiển thị {pagination.rangeStart}–{pagination.rangeEnd} trong tổng số{' '}

            {pagination.totalItems} khóa học

          </Typography>

          <AppPagination

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

          navigate(`/mentor/question-banks/manage?courseId=${course.CourseId}`)

        }

      />

    </Box>

  );

}

