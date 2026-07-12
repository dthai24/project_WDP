const NewsModel = require('../Models/newsModel');
const { saveNewsThumbnailFromDataUrl } = require('../middlewares/newsThumbnailMiddleware');

const newsController = {
  /**
   * GET /api/news
   * Lấy danh sách bài viết (public — chỉ lấy PUBLISHED)
   * Query: ?status=&categoryId=&search=&page=&pageSize=
   */
  getNewsList: async (req, res) => {
    try {
      const { status, categoryId, search, page, pageSize } = req.query;

      // Nếu status = 'all' thì không filter, nếu không có status thì mặc định PUBLISHED
      const filterStatus = status === 'all' ? null : (status || 'PUBLISHED');

      const result = await NewsModel.getNewsList({
        status: filterStatus,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        search: search || '',
        page: parseInt(page, 10) || 1,
        pageSize: Math.min(parseInt(pageSize, 10) || 10, 50),
      });

      return res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: parseInt(page, 10) || 1,
        pageSize: Math.min(parseInt(pageSize, 10) || 10, 50),
      });
    } catch (err) {
      console.error('[GetNewsList Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách bài viết.',
      });
    }
  },

  /**
   * GET /api/news/:id
   * Lấy chi tiết bài viết
   */
  getNewsById: async (req, res) => {
    try {
      const newsId = parseInt(req.params.id, 10);
      if (isNaN(newsId)) {
        return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
      }

      const news = await NewsModel.getNewsById(newsId);
      if (!news) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
      }

      return res.json({ success: true, data: news });
    } catch (err) {
      console.error('[GetNewsById Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy chi tiết bài viết.',
      });
    }
  },

  /**
   * POST /api/news
   * Tạo bài viết mới (cần auth)
   */
  createNews: async (req, res) => {
    try {
      const { title, categoryId, status, author, excerpt, content, thumbnail, publishedAt } = req.body;
      const createdBy = req.user?.userId || null;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Tiêu đề bài viết không được để trống.' });
      }

      // Tạo bài viết trước để có newsId
      const newsId = await NewsModel.createNews({
        title: title.trim(),
        categoryId: categoryId || null,
        status: status || 'DRAFT',
        author: author || null,
        excerpt: excerpt || null,
        content: content || null,
        thumbnail: null, // sẽ cập nhật sau nếu có thumbnail
        publishedAt: publishedAt || null,
        createdBy,
      });

      // Xử lý thumbnail: nếu là data URL thì lưu xuống disk
      let thumbnailPath = thumbnail || null;
      if (thumbnail) {
        try {
          const saved = saveNewsThumbnailFromDataUrl(thumbnail, newsId);
          if (saved) thumbnailPath = saved;
        } catch (thumbErr) {
          // Không throw lỗi, chỉ log — bài viết đã được tạo
          console.error('[CreateNews Thumbnail Error]', thumbErr.message);
        }
      }

      // Cập nhật thumbnail nếu có
      if (thumbnailPath !== null) {
        await NewsModel.updateNews(newsId, {
          thumbnail: thumbnailPath,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Tạo bài viết thành công.',
        data: { newsId },
      });
    } catch (err) {
      console.error('[CreateNews Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo bài viết.',
      });
    }
  },

  /**
   * PUT /api/news/:id
   * Cập nhật bài viết (cần auth)
   */
  updateNews: async (req, res) => {
    try {
      const newsId = parseInt(req.params.id, 10);
      if (isNaN(newsId)) {
        return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
      }

      const existing = await NewsModel.getNewsById(newsId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
      }

      const { title, categoryId, status, author, excerpt, content, thumbnail, publishedAt } = req.body;

      if (title !== undefined && !title.trim()) {
        return res.status(400).json({ success: false, message: 'Tiêu đề bài viết không được để trống.' });
      }

      // Xử lý thumbnail: nếu là data URL thì lưu xuống disk
      let thumbnailPath = thumbnail !== undefined ? thumbnail : existing.thumbnail;
      if (thumbnail !== undefined) {
        try {
          const saved = saveNewsThumbnailFromDataUrl(thumbnail, newsId, { replaceExisting: true });
          if (saved) thumbnailPath = saved;
        } catch (thumbErr) {
          return res.status(400).json({
            success: false,
            message: thumbErr.message || 'Thumbnail không hợp lệ.',
          });
        }
      }

      await NewsModel.updateNews(newsId, {
        title: title !== undefined ? title.trim() : existing.title,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        status: status !== undefined ? status : existing.status,
        author: author !== undefined ? author : existing.author,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        thumbnail: thumbnailPath,
        publishedAt: publishedAt !== undefined ? publishedAt : existing.publishedAt,
      });

      return res.json({ success: true, message: 'Cập nhật bài viết thành công.' });
    } catch (err) {
      console.error('[UpdateNews Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật bài viết.',
      });
    }
  },

  /**
   * DELETE /api/news/:id
   * Xóa bài viết (cần auth)
   */
  deleteNews: async (req, res) => {
    try {
      const newsId = parseInt(req.params.id, 10);
      if (isNaN(newsId)) {
        return res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
      }

      const existing = await NewsModel.getNewsById(newsId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
      }

      await NewsModel.deleteNews(newsId);

      return res.json({ success: true, message: 'Xóa bài viết thành công.' });
    } catch (err) {
      console.error('[DeleteNews Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Không thể xóa bài viết.',
      });
    }
  },
};

module.exports = newsController;
