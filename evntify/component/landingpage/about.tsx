export default function About() {
  return (
    <section id="about" className="bg-white px-6 py-20 lg:py-24 border-t border-neutral-100 scroll-mt-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <h2 className="font-newsreader text-4xl sm:text-5xl font-semibold text-wine tracking-tight">
          About Eventify
        </h2>
        <p className="max-w-[620px] font-crimson text-xl sm:text-2xl leading-relaxed text-landing-body">
          Eventify is a campus event management platform in{" "}
          <strong className="font-bold text-[#6b1724]">
            University of the East - Caloocan Campus
          </strong>{" "}
          that connects university students, event organizers, and departments in one place. It helps students to discover various events, register in a few clicks, and keep track of their attendance to various events, while organizers can create events, manage event participants, and monitor live attendance of their own event.
        </p>
        <div className="mt-8 grid w-full gap-12 md:grid-cols-2">
          {[
            ["Mission", "Connecting university life and student culture through simple, accessible event management."],
            ["Vision", "A university community where every event is easy to find, easy to join, and easy to manage."],
          ].map(([h, t]) => (
            <div key={h} className="flex flex-col items-center gap-4">
              <h3 className="font-newsreader text-4xl sm:text-5xl font-semibold text-wine tracking-tight">{h}</h3>
              <p className="max-w-[360px] font-crimson text-lg sm:text-xl italic leading-relaxed text-landing-body">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
