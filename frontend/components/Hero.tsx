export default function Hero() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-14 sm:py-16 md:py-24 bg-gradient-to-b from-teal-50 via-white to-white text-center overflow-hidden">
      <div className="animate-fade-in-down delay-100">
        <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-5 sm:mb-6 border border-teal-200">
          STYLE • ELEGANCE • HANDCRAFTED
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-teal-800 mb-4 sm:mb-5 leading-tight tracking-tight animate-fade-in-up delay-200 px-1">
        Every outfit tells
        <br />
        <span className="text-teal-600 italic">a beautiful story.</span>
      </h1>

      <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl text-teal-700/80 mb-8 sm:mb-10 leading-relaxed animate-fade-in-up delay-300 px-1">
        Explore exclusive sarees, trendy dresses, charming gift items, handcrafted accessories, and unique fashion collections curated for women and girls.
      </p>

      <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up delay-400 px-4 sm:px-0">
        <a
          href="#collection"
          className="px-6 sm:px-7 py-3.5 rounded-full bg-teal-600 text-white font-semibold shadow-lg shadow-teal-200 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 !no-underline"
        >
          Explore the Collection
        </a>
        <a
          href="#contact"
          className="px-6 sm:px-7 py-3.5 rounded-full border-2 border-teal-600 text-teal-600 font-semibold hover:bg-teal-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 !no-underline"
        >
          Reach the Studio
        </a>
      </div>

      <div className="mt-10 sm:mt-14 flex justify-center animate-fade-in-up delay-500">
        <img
          src="/sowmyafounder.jpeg"
          alt="Sowmya - Founder"
          className="rounded-2xl shadow-xl w-36 h-36 sm:w-52 sm:h-52 object-cover ring-4 ring-white animate-float"
        />
      </div>

      <div className="mt-8 sm:mt-10 flex flex-wrap gap-x-4 gap-y-2 sm:gap-8 justify-center text-[11px] sm:text-xs text-teal-600 font-semibold tracking-widest uppercase animate-fade-in delay-600 px-3">
        <span>120+ Artisans</span>
        <span className="text-teal-300">·</span>
        <span>8 Craft Regions</span>
        <span className="text-teal-300">·</span>
        <span>100% Handmade</span>
      </div>
    </section>
  );
}
