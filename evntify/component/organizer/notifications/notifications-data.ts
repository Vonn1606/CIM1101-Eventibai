export type AvatarIcon = "shield" | "users";
export type BadgeIcon = "alert" | "warning" | "swap";
export type ActionIcon = "upload" | "plus";

export interface NotificationAction {
  label: string;
  kind: "primary" | "accent" | "secondary";
  icon?: ActionIcon;
}

export interface OrgNotificationData {
  id: string;
  unread: boolean;
  avatar:
    | { type: "icon"; icon: AvatarIcon; bg: string; fg: string }
    | { type: "initials"; text: string; bg: string; fg: string };
  badge: { icon: BadgeIcon; bg: string };
  /** message text; `highlight` is rendered in the burgundy accent colour */
  message: string;
  highlight?: string;
  time: string;
  detail?: string;
  actions: NotificationAction[];
}

export const INITIAL_FRESH: OrgNotificationData[] = [
  {
    id: "sao-clearance",
    unread: true,
    avatar: { type: "icon", icon: "shield", bg: "#FFDADA", fg: "#4D0011" },
    badge: { icon: "alert", bg: "#4D0011" },
    message:
      "Student Affairs Office (SAO) marked LITS Organization with conditional approval. Missing Faculty Endorsement notary stamp.",
    time: "Just now",
    actions: [{ label: "Resubmit Form", kind: "primary", icon: "upload" }],
  },
  {
    id: "capacity-alert",
    unread: true,
    avatar: { type: "icon", icon: "users", bg: "#FFD9DD", fg: "#8C4B56" },
    badge: { icon: "warning", bg: "#8C4B56" },
    message: "LITS General Assembly registration reached 90% capacity (450 of 500 spots registered).",
    time: "12m ago",
    detail: "LCT Multipurpose Hall 5th Floor",
    actions: [
      { label: "Increase Capacity", kind: "accent", icon: "plus" },
      { label: "View Details", kind: "secondary" },
    ],
  },
  {
    id: "attendee-transfer",
    unread: true,
    avatar: { type: "initials", text: "SA", bg: "#EEE7E3", fg: "#1E1B19" },
    badge: { icon: "swap", bg: "#083F31" },
    message: "Sean Ayala requested ticket tier escalation from General Spectator to",
    highlight: "VIP Pass",
    time: "1h ago",
    detail: "Request #4429 • Verified Student ID",
    actions: [
      { label: "Approve Request", kind: "primary" },
      { label: "Deny", kind: "secondary" },
    ],
  },
];

export const INITIAL_EARLIER: OrgNotificationData[] = [];
