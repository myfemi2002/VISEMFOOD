import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <main className="section-gap">
      <div className="page-shell grid gap-6 lg:grid-cols-[280px,1fr]">
        <AdminSidebar />
        <Outlet />
      </div>
    </main>
  );
}
