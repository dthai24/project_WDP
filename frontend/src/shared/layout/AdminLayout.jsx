import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { HEADER_HEIGHT } from "./MainLayout";
import { AdminLayoutGuard } from "@/shared/routing/RoleShellRedirects";

export default function AdminLayout() {
  return (
    <AdminLayoutGuard>
      <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 antialiased">
        <Header
          logoTo="/admin/accounts"
          profilePath="/admin/profile"
          showMyCoursesButton={false}
        />
        <Sidebar variant="admin" />

        <main
          className="flex-1 transition-all duration-200"
          style={{
            marginLeft: `${SIDEBAR_WIDTH}px`,
            minHeight: `calc(100dvh - ${HEADER_HEIGHT}px)`,
          }}
        >
          <div className="w-full box-border py-4 sm:py-5 md:py-6 px-4 sm:px-5 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </AdminLayoutGuard>
  );
}
