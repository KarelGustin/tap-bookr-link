export const Testimonials = () => {
  const testimonials = [
    {
      quote: "TapBookr maakte het zo makkelijk om een website voor mijn bedrijf te hebben. Mijn boekingen zijn flink gestegen!",
      name: "Riley Lemon",
      role: "Nagelstylist",
      initials: "RL",
    },
    {
      quote: "Eindelijk een professionele pagina zonder dat ik een webdesigner nodig had. Klanten zeggen dat het er geweldig uitziet.",
      name: "Sophie de Vries",
      role: "Kapster & Colorist",
      initials: "SV",
    },
    {
      quote: "Mijn klanten boeken nu direct via de link in mijn Instagram bio. Geen DM's meer heen en weer.",
      name: "Liam Bakker",
      role: "Tattoo Artist",
      initials: "LB",
    },
  ];

  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-amber-50/30 pointer-events-none" />
      
      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-wide uppercase mb-4">
            Reviews
          </p>
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-gray-950 leading-[1.1] tracking-[-0.03em]">
            Geliefd door
            <br />
            <span className="text-gradient-purple">beauty professionals.</span>
          </h2>
        </div>

        {/* Testimonial grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col justify-between"
            >
              {/* Stars */}
              <div>
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-[15px] text-gray-700 leading-relaxed mb-6">
                  "{t.quote}"
                </blockquote>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-bold text-white">{t.initials}</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-950">{t.name}</p>
                  <p className="text-[12px] text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-extrabold text-gray-950 tracking-[-0.03em]">500+</p>
            <p className="text-[12px] text-gray-500 mt-1">Actieve gebruikers</p>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-extrabold text-gray-950 tracking-[-0.03em]">4.9</p>
            <p className="text-[12px] text-gray-500 mt-1">Gemiddelde score</p>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-extrabold text-gray-950 tracking-[-0.03em]">2 min</p>
            <p className="text-[12px] text-gray-500 mt-1">Gemiddelde setup</p>
          </div>
        </div>
      </div>
    </section>
  );
};
