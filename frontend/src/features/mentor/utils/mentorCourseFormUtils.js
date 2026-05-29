import { isValidThumbnailValue } from './mentorCourseImageUtils';

export const MENTOR_COURSE_DESCRIPTION_MAX = 250;

export const MENTOR_COURSE_FORM_INITIAL = {
  CourseName: '',
  Description: '',
  CategoryId: '',
  LevelId: '',
  Thumbnail: '',
  IsPublished: false,
};

export function isMentorCourseFormDirty(form) {
  return (
    String(form.CourseName ?? '').trim() !== '' ||
    String(form.Description ?? '').trim() !== '' ||
    form.CategoryId !== '' ||
    form.LevelId !== '' ||
    String(form.Thumbnail ?? '').trim() !== ''
  );
}

export function validateMentorCourseForm(form) {
  const errors = {};
  const courseName = String(form.CourseName ?? '').trim();
  const description = String(form.Description ?? '').trim();
  const thumbnail = String(form.Thumbnail ?? '').trim();

  if (courseName && courseName.length < 3) {
    errors.CourseName = 'Tên khóa học phải có ít nhất 3 ký tự nếu bạn nhập.';
  }

  if (description.length > MENTOR_COURSE_DESCRIPTION_MAX) {
    errors.Description = `Mô tả không được vượt quá ${MENTOR_COURSE_DESCRIPTION_MAX} ký tự.`;
  }

  if (thumbnail && !isValidThumbnailValue(thumbnail)) {
    errors.Thumbnail = 'Ảnh đại diện không hợp lệ.';
  }

  return errors;
}

export function buildCreateCourseStep1Payload(form, instructorId) {
  const thumbnail = String(form.Thumbnail ?? '').trim();
  const description = String(form.Description ?? '').trim();

  return {
    CourseName: String(form.CourseName ?? '').trim(),
    Description: description || null,
    Thumbnail: thumbnail || null,
    CategoryId: form.CategoryId ? Number(form.CategoryId) : null,
    LevelId: form.LevelId ? Number(form.LevelId) : null,
    InstructorId: instructorId,
    IsPublished: Boolean(form.IsPublished),
  };
}

/** @deprecated Use buildCreateCourseStep1Payload for create flow */
export function buildCreateCoursePayload(form, instructorId) {
  return {
    ...buildCreateCourseStep1Payload(form, instructorId),
    TotalLessons: 0,
    Rating: 0,
  };
}
