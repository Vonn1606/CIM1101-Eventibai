export type College = "CAS" | "CBA" | "FAAD" | "COE";
export type CollegeFilter = College | "ALL";

export interface Organizer {
    id: string;
    name: string;
    role: string;
    org: string;
    college: College;
    email: string;
    phone: string;
    online: boolean;
    pendingProposals: number;
    activeEvents: number;
    nextEvent: string;
}

export const COLLEGE_TABS: { key: CollegeFilter; label: string }[] = [
    { key: "ALL", label: "All Colleges" },
    { key: "CAS", label: "Arts & Sciences" },
    { key: "CBA", label: "Business Admin" },
    { key: "FAAD", label: "Architecture & Fine Arts" },
    { key: "COE", label: "Engineering" },
];

export const COLLEGE_TONE: Record<College, { bg: string; fg: string }> = {
    CAS: { bg: "#DBE1FF", fg: "#00174B" },
    CBA: { bg: "#DAE2FD", fg: "#131B2E" },
    FAAD: { bg: "#DDE9FF", fg: "#0D1C2F" },
    COE: { bg: "#FFDADA", fg: "#40000C" },
};

export const ORGANIZERS: Organizer[] = [
    { id: "o1", name: "Elena Rossi", role: "President", org: "Debate & Model UN Society", college: "CAS", email: "elena.rossi@ue.edu.ph", phone: "+63 917 000 0101", online: true, pendingProposals: 2, activeEvents: 1, nextEvent: "Inter-Collegiate Debate Open · Dec 12" },
    { id: "o2", name: "Marco Villanueva", role: "Treasurer", org: "Young Entrepreneurs & Financial Guild", college: "CBA", email: "marco.v@ue.edu.ph", phone: "+63 917 000 0102", online: true, pendingProposals: 1, activeEvents: 3, nextEvent: "Annual Business Case Challenge · Dec 05" },
    { id: "o3", name: "Isabel Navarro", role: "Lead", org: "Architectural Guild & Urban Design Lab", college: "FAAD", email: "isabel.n@ue.edu.ph", phone: "+63 917 000 0103", online: false, pendingProposals: 0, activeEvents: 2, nextEvent: "Heritage Sketchwalk · Dec 09" },
    { id: "o4", name: "Daniel Cruz", role: "President", org: "Robotics & Autonomous Systems League", college: "COE", email: "daniel.cruz@ue.edu.ph", phone: "+63 917 000 0104", online: false, pendingProposals: 3, activeEvents: 1, nextEvent: "Autonomous Vehicle Challenge · Jan 18" },
    { id: "o5", name: "Sofia Mendoza", role: "Vice President", org: "Department of Biological Sciences Council", college: "CAS", email: "sofia.m@ue.edu.ph", phone: "+63 917 000 0105", online: true, pendingProposals: 0, activeEvents: 2, nextEvent: "BioTech Research Showcase · Dec 03" },
    { id: "o6", name: "Paolo Reyes", role: "Secretary", org: "Management & Supply Chain Association", college: "CBA", email: "paolo.r@ue.edu.ph", phone: "+63 917 000 0106", online: true, pendingProposals: 1, activeEvents: 0, nextEvent: "Supply Chain Forum · Jan 10" },
    { id: "o7", name: "Hannah Lim", role: "Lead", org: "Fine Arts Guild & Contemporary Media", college: "FAAD", email: "hannah.lim@ue.edu.ph", phone: "+63 917 000 0107", online: false, pendingProposals: 0, activeEvents: 1, nextEvent: "Fine Arts Exhibition · Dec 08" },
    { id: "o8", name: "Gabriel Santos", role: "President", org: "Civil Engineering & Public Infrastructure", college: "COE", email: "gabriel.s@ue.edu.ph", phone: "+63 917 000 0108", online: true, pendingProposals: 2, activeEvents: 2, nextEvent: "Infrastructure Summit · Dec 15" },
];