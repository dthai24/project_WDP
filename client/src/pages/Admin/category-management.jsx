import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { Plus, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const PREDEFINED_CODES = [
  { value: "EWP", label: "EWP - English for Working Professionals" },
  { value: "EFK", label: "EFK - English for Kids" },
  { value: "GHSE", label: "GHSE - General High School English" },
  { value: "IELTS", label: "IELTS - IELTS Exam Preparation" },
  { value: "TOEIC", label: "TOEIC - TOEIC Exam Preparation" },
  { value: "APTIS", label: "APTIS - APTIS Exam Preparation" },
  { value: "CUSTOM", label: "Other / Custom Code..." }
];

const CategoryManagement = () => {
  const [activeTab, setActiveTab] = useState("list"); // "list" or "history"
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 6, pages: 1 });
  const [search, setSearch] = useState("");
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Form Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteCatData, setDeleteCatData] = useState(null);

  const fetchCategories = async (pageNum = 1, searchQuery = "") => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getCategories({ page: pageNum, limit: 6, search: searchQuery });
      if (res && res.success) {
        setCategories(res.data || []);
        setPagination(res.pagination || { total: 0, page: pageNum, limit: 6, pages: 0 });
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (pageNum = 1) => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getCategoryHistory({ page: pageNum, limit: 10 });
      if (res && res.success) {
        setHistoryLogs(res.data || []);
        setHistoryPagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 0 });
      } else {
        setHistoryLogs([]);
      }
    } catch (err) {
      console.error("Error fetching category history:", err);
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchCategories(1, search);
    } else {
      fetchHistory(1);
    }
  }, [activeTab]);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: "", code: "", description: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditMode(true);
    setEditingId(cat._id?.$oid || cat._id);
    setFormData({
      name: cat.name || cat.title || "",
      code: cat.code || "",
      description: cat.description || ""
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError("Category Name and Level Code cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await adminApi.updateCategory(editingId, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories(pagination.page, search);
    } catch (err) {
      console.error("Error saving category:", err);
      setFormError(err.response?.data?.message || "Failed to save category. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerCategoryDelete = (cat) => {
    setDeleteCatData(cat);
    setConfirmOpen(true);
  };

  const handleCategoryDelete = async () => {
    if (!deleteCatData) return;
    const catId = deleteCatData._id?.$oid || deleteCatData._id;
    setConfirmOpen(false);
    try {
      const res = await adminApi.deleteCategory(catId);
      if (res && res.success) {
        fetchCategories(pagination.page, search);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeleteCatData(null);
    }
  };

  const categoryColumns = [
    {
      key: "code",
      label: "Level Code",
      render: (cat) => (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-xs">
          {cat.code}
        </span>
      )
    },
    {
      key: "name",
      label: "Category Name",
      render: (cat) => <span className="font-bold text-slate-800">{cat.name || cat.title}</span>
    },
    {
      key: "description",
      label: "Description",
      render: (cat) => <span className="text-slate-500 text-xs line-clamp-2">{cat.description || "No description provided."}</span>
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (cat) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openEditModal(cat)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-350 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => triggerCategoryDelete(cat)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 hover:border-red-300 rounded-xl hover:bg-red-50 text-xs font-semibold text-red-600 transition-all shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete</span>
          </button>
        </div>
      )
    }
  ];

  const historyColumns = [
    {
      key: "action",
      label: "Action",
      render: (log) => {
        const isCreate = log.action === "CREATE" || log.action === "CREATED";
        const isDelete = log.action === "DELETE" || log.action === "DELETED";
        let colorClass = "bg-amber-50 text-amber-700 border-amber-100";
        let label = "UPDATE";
        if (isCreate) {
          colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
          label = "CREATE";
        } else if (isDelete) {
          colorClass = "bg-rose-50 text-rose-700 border-rose-100";
          label = "DELETE";
        }
        return (
          <span className={`px-2.5 py-0.5 border rounded-lg text-xs font-bold ${colorClass}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: "categoryName",
      label: "Target Category",
      render: (log) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{log.categoryName}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono font-bold">{log.target}</span>
        </div>
      )
    },
    {
      key: "actorName",
      label: "Actor",
      render: (log) => (
        <div>
          <div className="font-semibold text-slate-700">{log.actorName || "System"}</div>
          <div className="text-[10px] text-slate-400 font-medium">{log.actor || ""}</div>
        </div>
      )
    },
    {
      key: "timestamp",
      label: "Timestamp",
      className: "text-right",
      render: (log) => <span className="text-slate-500 text-xs font-medium">{log.timestamp}</span>
    }
  ];

  return (
    <div className="space-y-6 text-slate-850 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage English levels and tracks. View configuration update log history.
          </p>
        </div>
        {activeTab === "list" && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm shadow-md shadow-blue-600/10 hover:shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          English Levels
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Category History
        </button>
      </div>

      {/* Tab Contents */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify the backend service or database status.</div>
        </div>
      ) : activeTab === "list" ? (
        <DataTable
          columns={categoryColumns}
          data={categories}
          pagination={pagination}
          onPageChange={(page) => fetchCategories(page, search)}
          searchPlaceholder="Search by level code or category name..."
          onSearch={(val) => {
            setSearch(val);
            fetchCategories(1, val);
          }}
          loading={loading}
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyLogs}
          pagination={historyPagination}
          onPageChange={(page) => fetchHistory(page)}
          searchPlaceholder="Search not available in history"
          loading={loading}
        />
      )}

      {/* CEFR Level Reference Guide */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">CEFR Level Reference Guide</h3>
          <span className="text-xs text-slate-400 font-semibold font-mono">A1 - C2 Levels Decoding</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">A1</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Beginners</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand and use familiar everyday expressions and very basic phrases. Can introduce themselves and others and answer simple personal questions.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">A2</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Elementary</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand sentences and frequently used expressions related to immediate areas of relevance (e.g. personal, family, shopping, work info).
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">B1</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Intermediate</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. Can describe experiences and ambitions.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">B2</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Upper Intermediate</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization. Can interact fluently.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">C1</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Advanced</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express ideas fluently and spontaneously without much obvious searching.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-extrabold font-mono">C2</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Proficient / Mastery</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Can understand with ease virtually everything heard or read. Can summarize information from different spoken and written sources, reconstructing arguments.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 border border-red-100 bg-red-50 text-xs font-semibold text-red-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">English Level Code *</label>
                {(() => {
                  const isPredefined = PREDEFINED_CODES.some(opt => opt.value === formData.code && opt.value !== "CUSTOM");
                  const selectValue = isPredefined ? formData.code : (formData.code ? "CUSTOM" : "");
                  return (
                    <div className="space-y-3">
                      <select
                        value={selectValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "CUSTOM") {
                            setFormData((prev) => ({ ...prev, code: "" }));
                          } else {
                            setFormData((prev) => {
                              const selectedOpt = PREDEFINED_CODES.find(opt => opt.value === val);
                              const newName = prev.name.trim() === "" && selectedOpt 
                                ? selectedOpt.label.split(" - ")[1] 
                                : prev.name;
                              return { ...prev, code: val, name: newName };
                            });
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                      >
                        <option value="" disabled>Select Level Code...</option>
                        {PREDEFINED_CODES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {(selectValue === "CUSTOM" || !isPredefined) && (
                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-100">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Custom Level Code *</label>
                          <input
                            type="text"
                            placeholder="e.g. TOEFL, IELTS, SAT..."
                            value={formData.code}
                            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Beginner A1, Intermediate B1..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Detailed Description</label>
                <textarea
                  rows="3"
                  placeholder="Introduction about this english level..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-xl font-bold text-xs shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Category Deletion"
        message={`Are you sure you want to delete the category "${deleteCatData?.name || deleteCatData?.title || ""}" (${deleteCatData?.code || ""})?`}
        onConfirm={handleCategoryDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default CategoryManagement;
