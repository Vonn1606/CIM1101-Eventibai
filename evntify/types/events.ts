export type FeaturedEvent = {
    id: string;
    org: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    summary: string;
    seatsLeft: number;
    href: string;
};

export type CampusEvent = {
    id: string;
    code: string; // big faded label on the banner, e.g. "TYK•11"
    org: string;
    title: string;
    date: string;
    venue: string;
    seatsLeft: number;
    bannerColor: string; // any CSS colour; swap for an <img> later
    href: string;
};
