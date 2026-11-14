export type EventCard = { title: string; featured?: boolean };

// Each row scrolls in alternating directions (right, left, right, left).
export const marqueeRows: { direction: "right" | "left"; cards: EventCard[] }[] = [
  {
    direction: "right",
    cards: [
      { title: "LITS General Assembly" },
      { title: "Mister & Miss University of the East" },
      { title: "Recognition for Awardees" },
      { title: "Alumni Homecoming Gala Night" },
    ],
  },
  {
    direction: "left",
    cards: [
      { title: "LITS Figma Competition" },
      { title: "LITS Techtris Competition" },
      { title: "Contained & Connected: Art…" },
      { title: "A Special Blessing Mass for the" },
    ],
  },
  {
    direction: "right",
    cards: [
      { title: "MINDSET MATTERS: NAVIGATING" },
      { title: "SIDLAK: A Mental Health Walk" },
      { title: "Guard. Safe. Keep.: Safeguarding the" },
      { title: "Research? Bakit May Research?:" },
    ],
  },
  {
    direction: "left",
    cards: [
      { title: "LITS General Assembly" },
      { title: "LITS Figma Competition" },
      { title: "SIDLAK: A Mental Health Walk" },
      { title: "Research? Bakit May Research?:" },
    ],
  },
];

