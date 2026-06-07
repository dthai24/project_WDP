/**
 * Normalize raw course records from API (PascalCase) or mock (camelCase).
 */
export function normalizeMentorCourse(raw = {}) {
  const isPublished = raw.isPublished ?? raw.IsPublished;
  let status = raw.status;
  if (!status) {
    status = isPublished === true || isPublished === 1 ? 'published' : 'draft';
  }

  return {
    courseId: raw.courseId ?? raw.CourseId,
    courseName: raw.courseName ?? raw.CourseName ?? '',
    description: raw.description ?? raw.Description ?? '',
    thumbnail: raw.thumbnail ?? raw.Thumbnail ?? null,
    categoryId: raw.categoryId ?? raw.CategoryId ?? null,
    categoryName: raw.categoryName ?? raw.category ?? raw.CategoryName ?? '',
    levelId: raw.levelId ?? raw.LevelId ?? null,
    levelName: raw.levelName ?? raw.level ?? raw.LevelName ?? '',
    instructorId: raw.instructorId ?? raw.InstructorId ?? null,
    instructorName: raw.instructorName ?? raw.instructor ?? raw.InstructorName ?? '',
    rating: raw.rating ?? raw.Rating ?? null,
    totalLessons: raw.totalLessons ?? raw.TotalLessons ?? 0,
    totalNodes: raw.totalNodes ?? raw.TotalNodes ?? 0,
    totalMaterials: raw.totalMaterials ?? raw.TotalMaterials ?? 0,
    studentCount: raw.studentCount ?? raw.StudentCount ?? 0,
    status,
    createdAt: raw.createdAt ?? raw.CreatedAt ?? null,
    updatedAt: raw.updatedAt ?? raw.UpdatedAt ?? raw.createdAt ?? raw.CreatedAt ?? null,
  };
}

export function isMentorCoursePublished(course) {
  if (!course) return false;
  return normalizeMentorCourse(course).status === 'published';
}

export function computeCourseStats(courses = []) {
  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.filter((c) => c.status === 'draft').length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);

  return {
    totalCourses: courses.length,
    publishedCount,
    draftCount,
    totalStudents,
  };
}

export function filterAndSortMentorCourses(courses, query = {}) {
  const {
    q = '',
    status = 'all',
    category = 'all',
    level = 'all',
    sort = 'updated_desc',
  } = query;
  const keyword = q.trim().toLowerCase();

  // return true => course is retained
  // return false => course is removed 
  let result = courses.filter((course) => {
    if (status === 'published' && !course.IsPublished) return false;
    if (status === 'draft' && course.IsPublished) return false;
    if (category !== 'all') {
      const categoryMatch =
        String(course.CategoryId) === String(category) ||
        course.CategoryName === category;
      if (!categoryMatch) return false;
    }

    if (level !== 'all') {
      const levelMatch =
        String(course.LevelId) === String(level) || course.levelName === level;
      if (!levelMatch) return false;
    }

    if (keyword) {
      const haystack = [
        course.courseName,
        course.description,
        course.categoryName,
        course.levelName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    if (sort === 'created_desc') {
      return (
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    }
    if (sort === 'students_desc') {
      return (b.studentCount ?? 0) - (a.studentCount ?? 0);
    }
    if (sort === 'rating_desc') {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    if (sort === 'name_asc') {
      return (a.courseName ?? '').localeCompare(b.courseName ?? '', 'vi');
    }
    return (
      new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
      new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    );
  });

  return result;
}

export function paginateMentorCourses(courses, page, pageSize) {
  const totalItems = courses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = courses.slice(start, start + pageSize);

  return {
    items,
    totalItems,
    totalPages,
    page: safePage,
    pageSize,
    rangeStart: totalItems === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, totalItems),
  };
}

export function formatMentorCourseDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function truncateText(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
