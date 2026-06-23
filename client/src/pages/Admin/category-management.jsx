import React, { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, X, Check } from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([
    { id: "cat_001", name: "Frontend Development", count: 8, status: "Active" },
    { id: "cat_002", name: "Backend Development", count: 12, status: "Active" },
    { id: "cat_003", name: "DevOps & Cloud", count: 4, status: "Inactive" }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCategory = {
      id: `cat_00${categories.length + 1}`,
      name: newCatName.trim(),
      count: 0,
      status: "Active"
    };
    setCategories([...categories, newCategory]);
    setNewCatName("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Quản lý Danh mục (Categories)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tạo, cập nhật và quản lý các danh mục chủ đề học tập chính của hệ thống.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Add New Category Modal Form */}
      {showAddForm && (
        <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-3">
            <FolderTree className="w-4 h-4 text-indigo-600" /> Thêm Danh mục Mới
          </h3>
          <form onSubmit={handleAddCategory} className="flex gap-3 max-w-lg">
            <input
              type="text"
              placeholder="Nhập tên danh mục (ví dụ: Mobile Development)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-4 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewCatName("");
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Category List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                <FolderTree className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  cat.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat.status}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-slate-800 text-base">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{cat.count} Learning Paths đang hoạt động</p>
              <p className="text-[10px] text-slate-300 font-mono mt-0.5">{cat.id}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-end gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
