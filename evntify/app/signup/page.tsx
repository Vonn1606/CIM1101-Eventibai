import type { Metadata } from "next";
import Header from "@/component/login/layout-login/header";
import Footer from "@/component/login/layout-login/footer";
import AmbientBackdrop from "@/component/login/layout-login/AmbientBackdrop";
import SignUpCard from "@/component/login/signup/signupcard";

export const metadata: Metadata = {
  title: "Eventify - Sign Up",
  description:
    "Join the campus event community. Discover and reserve tickets for upcoming talks, concerts, and hackathons.",
};

export default function SignUpPage() {
  return (
    <>
      <AmbientBackdrop />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <SignUpCard />
      </main>
      <Footer />
    </>
  );
}
