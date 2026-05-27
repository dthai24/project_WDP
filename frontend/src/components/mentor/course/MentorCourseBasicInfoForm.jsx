import { Box, InputBase, Typography } from '@mui/material';
import { underlineFieldSx } from '../../common/UnderlineFieldPopup';
import { MENTOR_COURSE_DESCRIPTION_MAX } from '../../../utils/mentorCourseFormUtils';
import { MUTED, PRIMARY, SECTION_TITLE_SX, TEXT } from './mentorCourseCreateStyles';

function FormField({
  label,
  name,
  value,
  error,
  onChange,
  placeholder,
  disabled,
  multiline = false,
  rows = 4,
  type = 'text',
  selectOptions = [],
  maxLength,
  showCharCount = false,
}) {
  const isSelect = type === 'select';
  const charCount = String(value ?? '').length;

  return (
    <Box sx={{ mb: 2.25, '&:last-of-type': { mb: 0 } }}>
      <Typography sx={{ fontSize: 11, color: MUTED, fontWeight: 500, mb: 0.4, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Box
        sx={{
          ...underlineFieldSx,
          borderBottomColor: error ? '#DC2626' : 'rgba(8,145,178,0.18)',
          '&:focus-within': { borderBottomColor: error ? '#DC2626' : PRIMARY },
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <InputBase
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          fullWidth
          multiline={multiline}
          minRows={multiline ? rows : undefined}
          inputProps={maxLength ? { maxLength } : undefined}
          {...(isSelect ? { component: 'select' } : {})}
          sx={{
            fontSize: 13.5,
            fontWeight: 600,
            color: TEXT,
            lineHeight: multiline ? 1.55 : 1.4,
            alignItems: multiline ? 'flex-start' : 'center',
            '& .MuiInputBase-input': {
              p: 0,
              height: multiline ? 'auto' : 'auto',
            },
            '& .MuiInputBase-input::placeholder': {
              color: MUTED,
              opacity: 0.7,
              fontWeight: 500,
            },
            ...(isSelect && {
              '& select': {
                p: 0,
                font: 'inherit',
                color: 'inherit',
                background: 'transparent',
                width: '100%',
              },
            }),
          }}
        >
          {isSelect && (
            <>
              <option value="">{placeholder || 'Chọn...'}</option>
              {selectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </InputBase>
      </Box>
      {showCharCount && maxLength && (
        <Typography
          sx={{
            fontSize: 11,
            color: charCount >= maxLength ? '#DC2626' : MUTED,
            mt: 0.5,
            lineHeight: 1.3,
            textAlign: 'right',
          }}
        >
          {charCount}/{maxLength}
        </Typography>
      )}
      {error && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.5, lineHeight: 1.3 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function MentorCourseBasicInfoForm({
  form,
  errors = {},
  onChange,
  disabled = false,
  categoryOptions = [],
  levelOptions = [],
  optionsLoading = false,
}) {
  return (
    <Box>
      <Typography sx={SECTION_TITLE_SX}>Thông tin cơ bản</Typography>

      <FormField
        label="Tên khóa học"
        name="CourseName"
        value={form.CourseName}
        error={errors.CourseName}
        onChange={onChange}
        disabled={disabled}
        placeholder="Ví dụ: Tiếng Anh Giao Tiếp Đời Sống Hàng Ngày"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 0, sm: 2 },
        }}
      >
        <FormField
          label="Danh mục"
          name="CategoryId"
          value={form.CategoryId}
          error={errors.CategoryId}
          onChange={onChange}
          disabled={disabled || optionsLoading}
          type="select"
          selectOptions={categoryOptions}
          placeholder={optionsLoading ? 'Đang tải...' : 'Chọn danh mục'}
        />
        <FormField
          label="Trình độ"
          name="LevelId"
          value={form.LevelId}
          error={errors.LevelId}
          onChange={onChange}
          disabled={disabled || optionsLoading}
          type="select"
          selectOptions={levelOptions}
          placeholder={optionsLoading ? 'Đang tải...' : 'Chọn trình độ'}
        />
      </Box>

      <FormField
        label="Mô tả khóa học"
        name="Description"
        value={form.Description}
        error={errors.Description}
        onChange={onChange}
        disabled={disabled}
        multiline
        rows={4}
        maxLength={MENTOR_COURSE_DESCRIPTION_MAX}
        showCharCount
        placeholder="Mô tả ngắn gọn nội dung, mục tiêu và đối tượng phù hợp của khóa học."
      />
    </Box>
  );
}
