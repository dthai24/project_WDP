import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import { MentorLayoutGuard } from "@/shared/routing/RoleShellRedirects";

export default function MentorLayout() {
  return (
    <MentorLayoutGuard>
      <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 antialiased">
        <Header
          logoTo="/mentor/courses"
          profilePath="/mentor/courses"
          showMyCoursesButton={false}
        />
        <Sidebar variant="mentor" />

        <main
          className="flex-1 transition-all duration-200"
          style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}
        >
          <div className="w-full box-border py-4 sm:py-5 md:py-6 px-4 sm:px-5 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </MentorLayoutGuard>
  );
}
