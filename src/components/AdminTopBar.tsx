import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminAuth } from "@/contexts/admin-auth-context";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New bulk order received",
    description: "The Oak House needs confirmation on three large jollof party trays.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Catering inquiry submitted",
    description: "A wedding reception request for 250 guests needs a quote review.",
    time: "45m ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Stock alert: Signature Jollof Rice",
    description: "Flagged as a high-demand item for the upcoming weekend rush.",
    time: "2h ago",
  },
];

const dispatchMessages = [
  {
    id: "m1",
    sender: "Kitchen Lead",
    message: "Two prep stations are already working on Monday corporate orders.",
  },
  {
    id: "m2",
    sender: "Dispatch",
    message: "Executive cooler pack route is ready for afternoon drop-off.",
  },
];

export function AdminTopBar({
  isNavOpen,
  onOpenNav,
  onLogout,
}: {
  isNavOpen: boolean;
  onOpenNav: () => void;
  onLogout: () => void;
}) {
  const { user } = useAdminAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function closePanels() {
    setShowNotifications(false);
    setShowMessages(false);
    setShowProfileMenu(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <button
            type="button"
            aria-label={isNavOpen ? "Close admin navigation" : "Open admin navigation"}
            aria-expanded={isNavOpen}
            onClick={() => {
              closePanels();
              onOpenNav();
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-primary-light)] hover:text-[var(--vf-primary)] lg:hidden"
          >
            <span className="material-symbols-rounded">{isNavOpen ? "close" : "menu"}</span>
          </button>

          <label className="relative hidden sm:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]/70">
              <span className="material-symbols-rounded text-[20px]">search</span>
            </span>
            <input
              id="admin-top-search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders, customers, dishes..."
              className="field h-11 w-[18rem] pl-10 pr-10 text-sm md:w-[21rem]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-1 text-xs text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-text)]"
              >
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            ) : null}
          </label>
        </div>

        <div className="relative flex items-center gap-2 text-[var(--vf-text-soft)] sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowMessages(false);
                setShowProfileMenu(false);
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-primary)]"
              aria-label="Notifications"
            >
              <span className="material-symbols-rounded">notifications</span>
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--vf-danger)] ring-2 ring-[var(--vf-surface)]" />
            </button>

            {showNotifications ? (
              <div className="absolute right-0 mt-3 w-[20rem] rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 shadow-[var(--vf-shadow-float)]">
                <div className="mb-3 flex items-center justify-between border-b border-[var(--vf-border-soft)] pb-3">
                  <span className="text-sm font-semibold text-[var(--vf-text)]">Notifications</span>
                  <span className="rounded-full bg-[var(--vf-primary-light)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--vf-primary)]">
                    2 New
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={
                        item.unread
                          ? "rounded-xl bg-[var(--vf-primary-light)] p-3"
                          : "rounded-xl bg-[var(--vf-surface)] p-3"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-[var(--vf-text)]">{item.title}</p>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                          {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-soft">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMessages((current) => !current);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-primary)]"
              aria-label="Dispatch messages"
            >
              <span className="material-symbols-rounded">chat_bubble</span>
            </button>

            {showMessages ? (
              <div className="absolute right-0 mt-3 w-[19rem] rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 shadow-[var(--vf-shadow-float)]">
                <div className="mb-3 flex items-center justify-between border-b border-[var(--vf-border-soft)] pb-3">
                  <span className="text-sm font-semibold text-[var(--vf-text)]">Live Dispatch Comms</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--vf-tertiary)]">
                    3 Online
                  </span>
                </div>
                <div className="space-y-2.5">
                  {dispatchMessages.map((message) => (
                    <div key={message.id} className="rounded-xl bg-[var(--vf-surface)] p-3">
                      <p className="text-xs font-bold text-[var(--vf-text)]">{message.sender}</p>
                      <p className="mt-1 text-xs leading-5 text-soft">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden h-6 w-px bg-[var(--vf-border-soft)] sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((current) => !current);
                setShowNotifications(false);
                setShowMessages(false);
              }}
              className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-[var(--vf-surface-muted)] sm:gap-3 sm:pr-3"
              aria-label="Admin profile menu"
            >
              <img
                src={user?.avatar}
                alt="Administrator profile"
                className="h-9 w-9 rounded-full border border-[var(--vf-line)] object-cover"
              />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-[var(--vf-text)]">{user?.name ?? "Admin"}</span>
                <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                  {user?.role ?? "Operations"}
                </span>
              </span>
              <span className="material-symbols-rounded hidden text-[18px] sm:block">expand_more</span>
            </button>

            {showProfileMenu ? (
              <div className="absolute right-0 mt-3 w-60 rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-2 shadow-[var(--vf-shadow-float)]">
                <div className="mb-1 border-b border-[var(--vf-border-soft)] px-3 py-3">
                  <p className="text-sm font-bold text-[var(--vf-text)]">{user?.name ?? "Admin"}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                    {user?.role ?? "Operations"}
                  </p>
                </div>

                <Link
                  to="/admin/catalog"
                  onClick={closePanels}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--vf-text)] transition-colors hover:bg-[var(--vf-surface)]"
                >
                  <span className="material-symbols-rounded text-[18px] text-[var(--vf-primary)]">inventory_2</span>
                  Update Menu Stock
                </Link>
                <Link
                  to="/admin/bulk-orders"
                  onClick={closePanels}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--vf-text)] transition-colors hover:bg-[var(--vf-surface)]"
                >
                  <span className="material-symbols-rounded text-[18px] text-[var(--vf-primary)]">receipt_long</span>
                  View Kitchen Queue
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)]"
                >
                  <span className="material-symbols-rounded text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
