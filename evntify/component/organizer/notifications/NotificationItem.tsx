"use client";

import type { CSSProperties } from "react";
import type { OrgNotificationData } from "./notifications-data";
import {
  AlertIcon,
  MoreIcon,
  PlusIcon,
  ShieldIcon,
  SwapIcon,
  UploadIcon,
  UsersIcon,
  WarningIcon,
} from "./Icons";

const avatarIcons = { shield: ShieldIcon, users: UsersIcon };
const badgeIcons = { alert: AlertIcon, warning: WarningIcon, swap: SwapIcon };
const actionIcons = { upload: UploadIcon, plus: PlusIcon };

interface NotificationItemProps {
  item: OrgNotificationData;
  onToggleRead: (id: string) => void;
}

export default function OrgNotificationItem({ item, onToggleRead }: NotificationItemProps) {
  const { avatar, badge } = item;
  const Badge = badgeIcons[badge.icon];
  const style = {
    "--avatar-bg": avatar.bg,
    "--avatar-fg": avatar.fg,
    "--badge-bg": badge.bg,
  } as CSSProperties;

  return (
    <article className="on-notif" style={style} data-unread={item.unread}>
      <div className="on-notif__avatar-wrap">
        <div className="on-notif__avatar">
          {avatar.type === "icon" ? (
            (() => {
              const Icon = avatarIcons[avatar.icon];
              return <Icon width={20} height={20} />;
            })()
          ) : (
            <span className="on-notif__initials">{avatar.text}</span>
          )}
        </div>
        <span className="on-notif__badge"><Badge width={11} height={11} /></span>
      </div>

      <div className="on-notif__body">
        <p className="on-notif__message">
          {item.message}
          {item.highlight && <> <span className="is-accent">{item.highlight}</span></>}
        </p>

        <div className="on-notif__meta">
          <span className="on-notif__time">{item.time}</span>
          {item.detail && (
            <>
              <span className="on-notif__sep">•</span>
              <span className="on-notif__detail">{item.detail}</span>
            </>
          )}
        </div>

        {item.actions.length > 0 && (
          <div className="on-notif__actions">
            {item.actions.map((a) => {
              const Icon = a.icon ? actionIcons[a.icon] : null;
              return (
                <button key={a.label} type="button" className={`on-btn on-btn--${a.kind}`}>
                  {Icon && <Icon width={13} height={13} />}
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="on-notif__side">
        {item.unread ? <span className="on-notif__dot" aria-label="Unread" /> : <span />}
        <button
          type="button"
          className="on-notif__more"
          aria-label="Notification options"
          onClick={() => onToggleRead(item.id)}
          title={item.unread ? "Mark as read" : "Mark as unread"}
        >
          <MoreIcon width={12} height={3} />
        </button>
      </div>
    </article>
  );
}
