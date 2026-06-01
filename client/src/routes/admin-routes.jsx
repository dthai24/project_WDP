import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/admin-layout";
import Dashboard from "../pages/Admin/dashboard";
import UserManagement from "../pages/Admin/user-management";
import CategoryManagement from "../pages/Admin/category-management";
import CourseManagement from "../pages/Admin/course-management";
import UpdateHistory from "../pages/Admin/update-history";


const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Redirect from /admin to /admin/ (renders index) */}
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="history" element={<UpdateHistory />} />
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
