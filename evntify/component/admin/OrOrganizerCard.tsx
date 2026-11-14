import { Users, Mail, MessageSquare, Clock, CalendarDays, Building2 } from "lucide-react";
import type { OrganizerItem } from "@/lib/db/stats";

// Deterministic colour from a string (college name)
function collegeColour(name: string): { bg: string; fg: string } {
    const palettes = [
        { bg: "#DBE1FF", fg: "#00174B" },
        { bg: "#DAE2FD", fg: "#131B2E" },
        { bg: "#DDE9FF", fg: "#0D1C2F" },
        { bg: "#FFDADA", fg: "#40000C" },
        { bg: "#D9F5E3", fg: "#0A3320" },
        { bg: "#FFF3DA", fg: "#3B2300" },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return palettes[Math.abs(hash) % palettes.length];
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function OrOrganizerCard({
    organizer,
    showCollege,
    onMessage,
}: {
    organizer: OrganizerItem;
    showCollege: boolean;
    onMessage: (o: OrganizerItem) => void;
}) {
    const o = organizer;
    const tone = collegeColour(o.college);
    const hasPending = o.pendingProposals > 0;

    return (
        <article className="or-card">
            <div className="or-card-top">
                <div className="or-who">
                    <div className="or-avatar" style={{ background: tone.bg, color: tone.fg }}>
                        {initials(o.name)}
                        <i className="or-presence" aria-label="Offline" />
                    </div>
                    <div className="or-who-text">
                        <div className="or-name-row">
                            <h2 className="or-name">{o.name}</h2>
                            {showCollege && (
                                <span className="or-college" style={{ background: tone.bg, color: tone.fg }}>
                                    {o.college}
                                </span>
                            )}
                        </div>
                        <span className="or-role">{o.role}</span>
                        <p className="or-org">{o.org}</p>
                        <p className="or-meta">
                            <Building2 size={11} />
                            {o.activeEvents} active event{o.activeEvents === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>

                <div className={`or-counter ${hasPending ? "alert" : "calm"}`}>
                    {hasPending ? <Clock size={13} /> : <CalendarDays size={13} />}
                    <span>
                        {hasPending
                            ? `${o.pendingProposals} pending proposal${o.pendingProposals === 1 ? "" : "s"}`
                            : "All clear"}
                    </span>
                </div>
            </div>

            <div className="or-next">
                <div className="or-next-text">
                    <Users size={13} color="#0050D4" />
                    <span>{o.org}</span>
                </div>
                <div className="or-actions">
                    <a href={`mailto:${o.email}`} aria-label={`Email ${o.name}`} title={o.email}>
                        <Mail size={15} />
                    </a>
                    <button type="button" aria-label={`Message ${o.name}`} onClick={() => onMessage(o)}>
                        <MessageSquare size={14} />
                    </button>
                </div>
            </div>
        </article>
    );
}
