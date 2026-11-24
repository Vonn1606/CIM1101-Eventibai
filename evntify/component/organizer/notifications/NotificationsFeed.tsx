"use client";

// Bug Fix #1: OrgNotificationsFeed now fetches live data from Supabase when no
// initialFresh/initialEarlier props are passed. This keeps the client's auth
// session intact (the server page already validated it, so the client supabase
// call reuses the same session cookie without triggering a signout).

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrgNotificationData } from "./notifications-data";
import { INITIAL_FRESH, INITIAL_EARLIER } from "./notifications-data";
import OrgNotificationsHeader from "./NotificationsHeader";
import OrgNotificationItem from "./NotificationItem";

interface NotificationsFeedProps {
  /** Pre-fetched new/unread notifications. If omitted, the component fetches
   *  live data directly from the `notifications` table using the client session. */
  initialFresh?: OrgNotificationData[];
  /** Pre-fetched earlier/read notifications. If omitted, live fetch is used. */
  initialEarlier?: OrgNotificationData[];
}

/** Map a raw DB row to the OrgNotificationData shape the UI expects.
 *  Since DB rows don't store avatar/badge/actions metadata we use sensible
 *  defaults so the existing NotificationItem component renders correctly. */
function mapRow(row: {
  id: string;
  title: string | null;
  body: string | null;
  read_at: string | null;
  created_at: string;
  link: string | null;
}): OrgNotificationData {
  return {
    id: row.id,
    unread: row.read_at === null,
    // Default avatar: icon-based using the "shield" icon (generic system notice style)
    avatar: { type: "icon", icon: "shield", bg: "#FFDADA", fg: "#4D0011" },
    // Default badge: "alert" style badge
    badge: { icon: "alert", bg: "#4D0011" },
    // Map title + body into the `message` field (the display text)
    message: row.title ?? "Notification",
    // Map extra body text into `detail` if present
    detail: row.body ?? undefined,
    time: formatRelativeTime(row.created_at),
    // No inline actions for DB-sourced notifications
    actions: [],
  };
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diffSec) || diffSec < 0) return "Just now";
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function OrgNotificationsFeed({
  initialFresh,
  initialEarlier,
}: NotificationsFeedProps) {
  const useLiveData = !initialFresh && !initialEarlier;

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<OrgNotificationData[]>(() => {
    if (!useLiveData) {
      return [...(initialFresh ?? INITIAL_FRESH), ...(initialEarlier ?? INITIAL_EARLIER)];
    }
    return [];
  });

  // Fetch live data from Supabase when no seed props are provided.
  useEffect(() => {
    if (!useLiveData) return;
    let ignore = false;
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("id, title, body, read_at, created_at, link")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (!error && data) {
          setItems(data.map(mapRow));
        } else if (error) {
          console.error("[OrgNotificationsFeed] fetch error:", error.message);
        }
      });
    return () => { ignore = true; };
  }, [useLiveData]);

  const unreadCount = items.filter((n) => n.unread).length;

  const visible = filter === "unread" ? items.filter((n) => n.unread) : items;
  const freshItems = visible.filter((n) => n.unread);
  const earlierItems = visible.filter((n) => !n.unread);

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
    // Persist to DB only when using live data
    if (useLiveData) {
      const supabase = createClient();
      supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null)
        .then(({ error }) => {
          if (error) console.error("[OrgNotificationsFeed] markAllRead error:", error.message);
        });
    }
  };

  const toggleReadStatus = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
    if (useLiveData) {
      const item = items.find((n) => n.id === id);
      if (item) {
        const supabase = createClient();
        supabase
          .from("notifications")
          .update({ read_at: item.unread ? new Date().toISOString() : null })
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("[OrgNotificationsFeed] toggleRead error:", error.message);
          });
      }
    }
  };

  return (
    <div className="on-feed">
      <OrgNotificationsHeader
        unreadCount={unreadCount}
        filter={filter}
        onFilterChange={setFilter}
        onMarkAllRead={markAllRead}
      />

      <section className="on-section" aria-labelledby="new-heading">
        {freshItems.length > 0 && (
          <>
            <div className="on-section__head">
              <h2 id="new-heading" className="on-section__title">New</h2>
              <span className="on-section__count">{freshItems.length} UNREAD</span>
            </div>
            <div className="on-card">
              {freshItems.map((n) => (
                <OrgNotificationItem
                  key={n.id}
                  item={n}
                  onToggleRead={toggleReadStatus}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {earlierItems.length > 0 && (
        <section className="on-section on-section--earlier" aria-labelledby="earlier-heading">
          <div className="on-section__head">
            <h2 id="earlier-heading" className="on-section__title">Earlier</h2>
          </div>
          <div className="on-card">
            {earlierItems.map((n) => (
              <OrgNotificationItem
                key={n.id}
                item={n}
                onToggleRead={toggleReadStatus}
              />
            ))}
          </div>
        </section>
      )}

      {visible.length === 0 && (
        <div className="on-empty">
          You&apos;re all caught up. No organizer notifications found.
        </div>
      )}
    </div>
  );
}
