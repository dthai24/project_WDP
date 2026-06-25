import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/admin-layout";
import Dashboard from "../pages/Admin/dashboard";
import CourseApproval from "../pages/Admin/course-approval";
import CategoryManagement from "../pages/Admin/category-management";
import UserControl from "../pages/Admin/user-control";
import CourseManagement from "../pages/Admin/course-management";
import Notifications from "../pages/Admin/notifications";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* /admin maps to Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* /admin/approvals maps to Course Approvals Queue */}
        <Route path="approvals" element={<CourseApproval />} />
        
        {/* /admin/categories maps to Category Management */}
        <Route path="categories" element={<CategoryManagement />} />
        
        {/* /admin/users maps to User Control */}
        <Route path="users" element={<UserControl />} />
        
        {/* /admin/courses maps to Course Management */}
        <Route path="courses" element={<CourseManagement />} />

        {/* /admin/notifications maps to Notifications */}
        <Route path="notifications" element={<Notifications />} />
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
