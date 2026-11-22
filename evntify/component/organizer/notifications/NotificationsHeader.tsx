"use client";

import { DoneAllIcon, SettingsIcon } from "./Icons";

interface NotificationsHeaderProps {
  unreadCount: number;
  filter: "all" | "unread";
  onFilterChange: (f: "all" | "unread") => void;
  onMarkAllRead: () => void;
}

export default function OrgNotificationsHeader({
  unreadCount,
  filter,
  onFilterChange,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  return (
    <header className="on-head">
      <div className="on-head__left">
        <h1 className="on-head__title">Notifications</h1>
        <div className="on-tabs" role="tablist" aria-label="Filter notifications">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => onFilterChange("all")}
            className={`on-tab${filter === "all" ? " on-tab--active" : ""}`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            onClick={() => onFilterChange("unread")}
            className={`on-tab${filter === "unread" ? " on-tab--active" : ""}`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="on-tab__count">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>
      <div className="on-head__right">
        <button
          type="button"
          className="on-quick"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
        >
          <DoneAllIcon width={16} height={10} />
          Mark all as read
        </button>
        <button type="button" className="on-icon-btn" aria-label="Notification settings">
          <SettingsIcon width={18} height={18} />
        </button>
      </div>
    </header>
  );
}
