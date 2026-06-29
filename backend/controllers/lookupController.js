const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');

const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('_id displayName')
      .sort({ displayName: 1 })
      .lean();

    const data = categories.map(c => ({
      categoryId: c._id.toString(),
      displayName: c.displayName,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[GetCategories Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách danh mục.',
    });
  }
};

const getLevels = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = { isActive: true };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }

    const levels = await Level.find(filter)
      .select('_id displayName categoryId')
      .sort({ sortOrder: 1 })
      .lean();

    const data = levels.map(l => ({
      levelId: l._id.toString(),
      displayName: l.displayName,
      categoryId: l.categoryId ? l.categoryId.toString() : null,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[GetLevels Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách trình độ.',
    });
  }
};

module.exports = { getCategories, getLevels };
