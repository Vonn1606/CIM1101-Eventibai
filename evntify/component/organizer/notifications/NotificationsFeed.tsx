"use client";

import { useState } from "react";
import type { OrgNotificationData } from "./notifications-data";
import OrgNotificationsHeader from "./NotificationsHeader";
import OrgNotificationItem from "./NotificationItem";

interface NotificationsFeedProps {
  initialFresh: OrgNotificationData[];
  initialEarlier: OrgNotificationData[];
}

export default function OrgNotificationsFeed({
  initialFresh,
  initialEarlier,
}: NotificationsFeedProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<OrgNotificationData[]>([
    ...initialFresh,
    ...initialEarlier,
  ]);

  const unreadCount = items.filter((n) => n.unread).length;

  const visible = filter === "unread" ? items.filter((n) => n.unread) : items;
  const freshItems = visible.filter((n) => n.unread);
  const earlierItems = visible.filter((n) => !n.unread);

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const toggleReadStatus = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
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
