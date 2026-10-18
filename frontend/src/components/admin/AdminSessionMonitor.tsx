import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { isAdminSessionExpiredError } from "@/lib/api";
import { fetchAdminSessionStatus, renewAdminSession } from "@/lib/visemfood-api";
import { useAdminAuth } from "@/contexts/admin-auth-context";

const WARNING_SECONDS = 120;
const ACTIVITY_THROTTLE_MS = 30_000;
const CHANNEL_NAME = "visemfood-admin-session";

type SessionMessage =
  | { type: "renewed"; userId: number; deadline: number }
  | { type: "expired"; userId: number };

export function AdminSessionMonitor() {
  const { user, isAuthenticated, markSessionExpired, logout } = useAdminAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const lastActivityAt = useRef(0);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isAdmin = pathname.startsWith("/admin");

  const expireLocally = useCallback((notify = true) => {
    markSessionExpired();
    setDeadline(null);
    setRemaining(null);
    if (notify) {
      toast.error("Your session expired after 15 minutes of inactivity. Please sign in again.");
    }
    if (typeof window !== "undefined") {
      window.location.assign("/login?redirect=%2Fadmin&session=expired");
    }
  }, [markSessionExpired]);

  const reconcile = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    try {
      const status = await fetchAdminSessionStatus();
      const nextDeadline = status.inactivity_expires_at;
      if (!nextDeadline || nextDeadline <= Math.floor(Date.now() / 1000)) {
        expireLocally();
        return;
      }
      setDeadline(nextDeadline);
      setRemaining(Math.max(0, nextDeadline - Math.floor(Date.now() / 1000)));
    } catch (error) {
      if (isAdminSessionExpiredError(error)) expireLocally();
    }
  }, [expireLocally, isAdmin, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !user) return;
    void reconcile();
  }, [isAuthenticated, isAdmin, reconcile, user]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !user || typeof window === "undefined") return;
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
    channelRef.current = channel;
    const onMessage = (event: MessageEvent<SessionMessage>) => {
      if (event.data.userId !== user.id) return;
      if (event.data.type === "expired") expireLocally(false);
      if (event.data.type === "renewed") {
        setDeadline(event.data.deadline);
        setRemaining(Math.max(0, event.data.deadline - Math.floor(Date.now() / 1000)));
      }
    };
    channel?.addEventListener("message", onMessage);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void reconcile();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      channelRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [expireLocally, isAdmin, isAuthenticated, reconcile, user]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !user) return;
    const onActivity = () => {
      if (remaining !== null && remaining <= WARNING_SECONDS) return;
      const now = Date.now();
      if (now - lastActivityAt.current < ACTIVITY_THROTTLE_MS) return;
      lastActivityAt.current = now;
      void renewAdminSession().then((status) => {
        if (status.inactivity_expires_at) {
          setDeadline(status.inactivity_expires_at);
          setRemaining(Math.max(0, status.inactivity_expires_at - Math.floor(Date.now() / 1000)));
          channelRef.current?.postMessage({ type: "renewed", userId: user.id, deadline: status.inactivity_expires_at } satisfies SessionMessage);
        }
      }).catch((error) => {
        if (isAdminSessionExpiredError(error)) expireLocally();
      });
    };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    return () => events.forEach((event) => window.removeEventListener(event, onActivity));
  }, [expireLocally, isAdmin, isAuthenticated, remaining, user]);

  useEffect(() => {
    if (!deadline || !isAuthenticated || !isAdmin) return;
    const tick = () => {
      const next = Math.max(0, deadline - Math.floor(Date.now() / 1000));
      setRemaining(next);
      if (next === 0) {
        channelRef.current?.postMessage({ type: "expired", userId: user?.id ?? 0 } satisfies SessionMessage);
        void logout().finally(() => expireLocally());
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, expireLocally, isAdmin, isAuthenticated, logout, user]);

  if (!isAuthenticated || !isAdmin || remaining === null || remaining > WARNING_SECONDS) return null;
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="session-warning-title" className="w-full max-w-md rounded-[var(--vf-radius-lg)] bg-[var(--vf-surface)] p-7 shadow-[var(--vf-shadow-float)]">
        <h2 id="session-warning-title" className="heading-display text-3xl font-bold text-[var(--vf-primary)]">Your session is about to expire</h2>
        <p className="mt-4 text-sm leading-7 text-soft">You have been inactive for a while. For your security, you will be automatically logged out unless you choose to stay signed in.</p>
        <p className="mt-6 text-center text-4xl font-bold tabular-nums text-[var(--vf-text)]">{minutes}:{seconds}</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary rounded-full px-5" onClick={() => void logout().finally(() => expireLocally())}>Log Out Now</button>
          <button type="button" className="btn-primary rounded-full px-5" disabled={isRenewing} onClick={() => { setIsRenewing(true); void renewAdminSession().then((status) => { if (status.inactivity_expires_at) { setDeadline(status.inactivity_expires_at); setRemaining(status.inactivity_expires_at - Math.floor(Date.now() / 1000)); channelRef.current?.postMessage({ type: "renewed", userId: user?.id ?? 0, deadline: status.inactivity_expires_at } satisfies SessionMessage); } }).catch((error) => { if (isAdminSessionExpiredError(error)) expireLocally(); }).finally(() => setIsRenewing(false)); }}>{isRenewing ? "Renewing..." : "Stay Logged In"}</button>
        </div>
      </section>
    </div>
  );
}
