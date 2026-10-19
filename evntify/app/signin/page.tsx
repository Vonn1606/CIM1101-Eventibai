import type { Metadata } from "next";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/footer";
import AmbientBackdrop from "@/component/layout/AmbientBackdrop";
import SignInCard from "@/component/signin/signincard";


export const metadata: Metadata = {
    title: "Eventify - Sign In",
    description:
        "Join the campus event community. Discover and reserve tickets for upcoming talks, concerts, and hackathons.",
};
export default function SignInPage() {
    return (
        <>
            <AmbientBackdrop />
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
                <SignInCard />
            </main>
            <Footer />
        </>
    );
}