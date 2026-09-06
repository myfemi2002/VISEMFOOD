import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/menu")({
  component: MenuLayout,
});

function MenuLayout() {
  return <Outlet />;
}
