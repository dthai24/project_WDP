import { isValidThumbnailValue } from './mentorCourseImageUtils';

//Max char user can input in course's description
export const MENTOR_COURSE_DESCRIPTION_MAX = 250;
export const MENTOR_COURSE_NAME_MAX = 250;


// FORM INITTIAL
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

// VALID mentor course's form when create new course
export function validateMentorCourseForm(form) {
  const errors = {};

  const courseName = String(form.CourseName ?? '').trim();
  const description = String(form.Description ?? '').trim();
  const thumbnail = String(form.Thumbnail ?? '').trim();

  // Course's Name 
  //(Not empty and have at least 3 chars, max: is setting 250 <depend on type of course name in database (nvarchar250)>)
  if (!courseName) {
    errors.CourseName = 'Đéo đặt tên thì ai biết mà học??';
  } else if (courseName.length < 3) {
    errors.CourseName = 'Địt mẹ khóa học lozn gì đéo đủ 3 ký tự???';
  } else if (courseName.length > 250) {
    errors.CourseName = 'Tên dài như này cho chó học à?????';
  }

  // Course's Description
  if (!description) {
    errors.Description = '(Description)-Mô tả khóa học không được để trống.';
  } else if (description.length > MENTOR_COURSE_DESCRIPTION_MAX) {
    // must be < 250 chars
    errors.Description = `(Description)-Mô tả khóa học không được vượt quá ${MENTOR_COURSE_DESCRIPTION_MAX} ký tự.`;
  } else if (description.length < 3) {
    errors.Description = '(Description)-Mô tả khóa học không được nhỏ hơn 3 ký tự'
  }

  // Danh mục
  if (form.CategoryId === '' || form.CategoryId === null || form.CategoryId === undefined) {
    errors.CategoryId = 'Mày cố tình không chọn danh mục à??? hay là mày đéo biết phân loại??';
  }

  // Level
  if (form.LevelId === '' || form.LevelId === null || form.LevelId === undefined) {
    errors.LevelId = 'Không chọn Level thì ai biết mà học????';
  }

  // Thumbnail
  if (!thumbnail) {
    errors.Thumbnail = 'Thằng loz hỏng face id à???.';
  } else if (!isValidThumbnailValue(thumbnail)) {
    errors.Thumbnail = 'Ngu à mà đăng ảnh không hợp lệ? Tao báo công an.';
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
