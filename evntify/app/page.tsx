import Header from "@/component/landingpage/header";
import Hero from "@/component/landingpage/hero";
import Showcase from "@/component/landingpage/showcase";
import About from "@/component/landingpage/about";
import Footer from "@/component/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="main">
        <div className="container-box">
          <div className="topbar">
            <div className="topbar-pill" />
          </div>
          <Hero />
          <Showcase />
          <About />
        </div>
      </main>
      <Footer />
    </>
  );
}
