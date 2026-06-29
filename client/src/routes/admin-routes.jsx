import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/admin-layout";
import Dashboard from "../pages/Admin/dashboard";
import CategoryManagement from "../pages/Admin/category-management";
import UserControl from "../pages/Admin/user-control";
import CourseManagement from "../pages/Admin/course-management";
import Notifications from "../pages/Admin/notifications";
import MentorApprovalList from "../pages/Admin/MentorApprovalList";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* /admin maps to Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* /admin/categories maps to Category Management */}
        <Route path="categories" element={<CategoryManagement />} />
        
        {/* /admin/users maps to User Control */}
        <Route path="users" element={<UserControl />} />
        
        {/* /admin/courses maps to Course Management */}
        <Route path="courses" element={<CourseManagement />} />

        {/* /admin/mentor-approval-list maps to Mentor Approval List */}
        <Route path="mentor-approval-list" element={<MentorApprovalList />} />

        {/* /admin/notifications maps to Notifications */}
        <Route path="notifications" element={<Notifications />} />
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
