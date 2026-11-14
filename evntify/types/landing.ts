export type EventCard = { title: string; featured?: boolean };

// Each row scrolls in alternating directions (right, left, right, left).
export const marqueeRows: { direction: "right" | "left"; cards: EventCard[] }[] = [
  {
    direction: "right",
    cards: [
      { title: "University General Assembly" },
      { title: "Mister & Miss University of the East" },
      { title: "Recognition for Academic Awardees" },
      { title: "Alumni Homecoming Gala Night" },
    ],
  },
  {
    direction: "left",
    cards: [
      { title: "Campus UI/UX Design Sprint" },
      { title: "Inter-College Robotics & Tech Showcase" },
      { title: "Contained & Connected: Fine Arts Exhibition" },
      { title: "University Convocation & Blessing" },
    ],
  },
  {
    direction: "right",
    cards: [
      { title: "Mindset Matters: Navigating Student Life" },
      { title: "Sidlak: Campus Wellness Walk" },
      { title: "Cybersecurity & Data Privacy Forum" },
      { title: "Undergraduate Research Colloquium" },
    ],
  },
  {
    direction: "left",
    cards: [
      { title: "University General Assembly" },
      { title: "Campus UI/UX Design Sprint" },
      { title: "Sidlak: Campus Wellness Walk" },
      { title: "Undergraduate Research Colloquium" },
    ],
  },
];

