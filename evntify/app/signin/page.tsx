import type { Metadata } from "next";
import Header from "@/component/login/layout-login/header";
import Footer from "@/component/login/layout-login/footer";
import SignInCard from "@/component/login/signin/signincard";

export const metadata: Metadata = {
  title: "Eventify - Sign In",
  description:
    "Join the campus event community. Discover and reserve tickets for upcoming talks, concerts, and hackathons.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col justify-between">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <SignInCard />
      </main>
      <Footer />
    </div>
  );
}
