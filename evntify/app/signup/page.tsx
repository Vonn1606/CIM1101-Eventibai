import type { Metadata } from "next";
import Header from "@/component/login/layout-login/header";
import Footer from "@/component/login/layout-login/footer";
import SignUpCard from "@/component/login/signup/signupcard";

export const metadata: Metadata = {
  title: "Eventify - Sign Up",
  description:
    "Join the campus event community. Discover and reserve tickets for upcoming talks, concerts, and hackathons.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col justify-between">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <SignUpCard />
      </main>
      <Footer />
    </div>
  );
}
