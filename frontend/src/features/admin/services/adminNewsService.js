/**
 * Admin News Service — gọi backend thật qua newsApiClient.
 */
import {
  apiGetNewsList,
  apiGetNewsById,
  apiCreateNews,
  apiUpdateNews,
  apiDeleteNews,
} from '@/features/news/services/newsApiClient';

function normalizeArticle(raw = {}) {
  return {
    id: raw.newsId,
    title: raw.title ?? '',
    category: raw.categoryName ?? raw.category ?? '',
    categoryId: raw.categoryId ?? null,
    status: raw.status ?? 'DRAFT',
    author: raw.author ?? '',
    excerpt: raw.excerpt ?? '',
    content: raw.content ?? '',
    thumbnail: raw.thumbnail ?? null,
    publishedAt: raw.publishedAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    createdByName: raw.createdByName ?? '',
  };
}

export async function getNewsArticles({ status, categoryId, search, page, pageSize, sort } = {}) {
  const result = await apiGetNewsList({ status, categoryId, search, page, pageSize, sort });

  if (!result.ok) {
    return { ok: false, articles: [], total: 0, message: result.message ?? 'Không tải được tin tức.' };
  }

  return {
    ok: true,
    articles: (result.data || []).map(normalizeArticle),
    total: result.total ?? 0,
    page: result.page ?? page ?? 1,
    pageSize: result.pageSize ?? pageSize ?? 10,
  };
}

export async function getNewsArticleById(id) {
  const result = await apiGetNewsById(id);
  if (!result.ok) {
    return { ok: false, article: null, message: result.message ?? 'Không tìm thấy tin tức.' };
  }
  return { ok: true, article: normalizeArticle(result.data) };
}

export async function createNewsArticle(payload = {}) {
  const title = String(payload.title ?? '').trim();
  const categoryId = payload.categoryId;

  if (!title) {
    return { ok: false, message: 'Tiêu đề không được để trống' };
  }
  if (!categoryId) {
    return { ok: false, message: 'Vui lòng chọn danh mục' };
  }

  const result = await apiCreateNews({
    title,
    categoryId: Number(categoryId),
    status: payload.status ?? 'DRAFT',
    author: payload.author || undefined,
    excerpt: payload.excerpt || undefined,
    content: payload.content || undefined,
    thumbnail: payload.thumbnail || undefined,
    publishedAt: payload.status === 'PUBLISHED' ? new Date().toISOString() : null,
  });

  if (!result.ok) {
    return { ok: false, message: result.message ?? 'Không thể tạo bài viết.' };
  }

  // Fetch lại bài viết vừa tạo để có đầy đủ thông tin
  const articleResult = await getNewsArticleById(result.data?.newsId);
  return {
    ok: true,
    article: articleResult.ok ? articleResult.article : normalizeArticle({ newsId: result.data?.newsId, title, categoryId }),
  };
}

export async function updateNewsArticle(id, payload = {}) {
  const existingResult = await getNewsArticleById(id);
  if (!existingResult.ok) {
    return { ok: false, message: 'Không tìm thấy tin tức' };
  }

  const title = String(payload.title ?? existingResult.article.title ?? '').trim();
  const categoryId = payload.categoryId ?? existingResult.article.categoryId;

  if (!title) {
    return { ok: false, message: 'Tiêu đề không được để trống' };
  }
  if (!categoryId) {
    return { ok: false, message: 'Vui lòng chọn danh mục' };
  }

  const result = await apiUpdateNews(id, {
    title,
    categoryId: Number(categoryId),
    status: payload.status ?? existingResult.article.status,
    author: payload.author !== undefined ? payload.author : existingResult.article.author,
    excerpt: payload.excerpt !== undefined ? payload.excerpt : existingResult.article.excerpt,
    content: payload.content !== undefined ? payload.content : existingResult.article.content,
    thumbnail: payload.thumbnail !== undefined ? payload.thumbnail : existingResult.article.thumbnail,
    publishedAt: payload.status === 'PUBLISHED'
      ? (existingResult.article.publishedAt || new Date().toISOString())
      : null,
  });

  if (!result.ok) {
    return { ok: false, message: result.message ?? 'Không thể cập nhật bài viết.' };
  }

  const articleResult = await getNewsArticleById(id);
  return {
    ok: true,
    article: articleResult.ok ? articleResult.article : normalizeArticle({ ...existingResult.article, ...payload, id }),
  };
}

export async function updateNewsArticleBasicInfo(id, payload = {}) {
  const existingResult = await getNewsArticleById(id);
  if (!existingResult.ok) {
    return { ok: false, message: 'Không tìm thấy tin tức' };
  }

  const title = String(payload.title ?? '').trim();
  const categoryId = payload.categoryId;

  if (!title) {
    return { ok: false, message: 'Tiêu đề không được để trống' };
  }
  if (!categoryId) {
    return { ok: false, message: 'Vui lòng chọn danh mục' };
  }

  const result = await apiUpdateNews(id, {
    title,
    categoryId: Number(categoryId),
    status: payload.status ?? existingResult.article.status,
    author: payload.author !== undefined ? payload.author : existingResult.article.author,
    excerpt: payload.excerpt !== undefined ? payload.excerpt : existingResult.article.excerpt,
    thumbnail: payload.thumbnail !== undefined ? payload.thumbnail : existingResult.article.thumbnail,
    publishedAt: payload.status === 'PUBLISHED'
      ? (existingResult.article.publishedAt || new Date().toISOString())
      : null,
  });

  if (!result.ok) {
    return { ok: false, message: result.message ?? 'Không thể cập nhật bài viết.' };
  }

  const articleResult = await getNewsArticleById(id);
  return {
    ok: true,
    article: articleResult.ok ? articleResult.article : normalizeArticle({ ...existingResult.article, ...payload, id }),
  };
}

export async function updateNewsArticleContent(id, content = '') {
  const existingResult = await getNewsArticleById(id);
  if (!existingResult.ok) {
    return { ok: false, message: 'Không tìm thấy tin tức' };
  }

  const result = await apiUpdateNews(id, {
    content: String(content ?? '').trim(),
    status: existingResult.article.status,
  });

  if (!result.ok) {
    return { ok: false, message: result.message ?? 'Không thể cập nhật nội dung.' };
  }

  const articleResult = await getNewsArticleById(id);
  return {
    ok: true,
    article: articleResult.ok ? articleResult.article : normalizeArticle({ ...existingResult.article, content, id }),
  };
}

export async function deleteNewsArticle(id) {
  if (id == null || id === '') {
    return { ok: false, message: 'ID bài viết không hợp lệ' };
  }

  const result = await apiDeleteNews(id);
  if (!result.ok) {
    return { ok: false, message: result.message ?? 'Không thể xóa bài viết.' };
  }
  return { ok: true, message: result.message ?? 'Đã xóa bài viết.' };
}
