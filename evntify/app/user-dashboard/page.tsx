import type { Metadata } from "next";
import TopNavbar from "@/component/dashboard/layout-dashboard/topnavbar";
import FeaturedCarousel from "@/component/dashboard/featuredeventhero";
import EventSection from "@/component/dashboard/eventsection";
import Footer from "@/component/dashboard/layout-dashboard/footer";
import { featuredEvents, tanYanKeeEvents, tanYanKeeSection } from "@/lib/events";

export const metadata: Metadata = { title: "Eventify - Dashboard" };

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-canvas pb-12">
            <TopNavbar />
            <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-7 px-6 pt-4">
                <FeaturedCarousel events={featuredEvents} />
                <EventSection
                    title={tanYanKeeSection.title}
                    href={tanYanKeeSection.href}
                    events={tanYanKeeEvents}
                />
            </main>

        </div>
    );
}