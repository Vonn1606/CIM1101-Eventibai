import Header from "@/component/landingpage/header";
import Hero from "@/component/landingpage/hero";
import Showcase from "@/component/landingpage/showcase";
import Footer from "@/component/landingpage/footer";

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
        </div>
      </main>
      <Footer />
    </>
  );

}
