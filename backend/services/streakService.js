const UserNode = require("../models/MongoDB/UserNode");

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeStreak(dateStrings) {
  if (!dateStrings.length) return { streak: 0, hasStudiedToday: false };
  const set = new Set(dateStrings);
  const cursor = new Date();
  
  const todayStr = ymd(cursor);
  const hasStudiedToday = set.has(todayStr);
  
  if (!hasStudiedToday) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(ymd(cursor))) return { streak: 0, hasStudiedToday };
  }
  let streak = 0;
  while (set.has(ymd(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, hasStudiedToday };
}

async function getStreak(userId) {
  // Get all completed nodes for this user from MongoDB
  const completedNodes = await UserNode.find({
    userId,
    isCompleted: true,
    completedAt: { $ne: null }
  }).select('completedAt').lean();

  // Extract unique completion dates (YYYY-MM-DD)
  const dateStrings = [...new Set(
    completedNodes.map(n => ymd(new Date(n.completedAt)))
  )];

  return computeStreak(dateStrings);
}

module.exports = { getStreak };