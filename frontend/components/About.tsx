const PILLARS = [
  { icon: "✦", title: "Premium Handloom Fabrics", desc: "Curated sarees and dresses crafted from silk, cotton, and artisanal handwoven textiles." },
  { icon: "◈", title: "Personalized Styling", desc: "Custom fitting, color matching, and finishing tailored to your style and size." },
  { icon: "◎", title: "Women-First Craft", desc: "Every piece is made with care by women artisans, designed for modern elegance." },
];

export default function About() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 shadow-sm p-8 md:p-12 text-center">
      <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-widest uppercase mb-4 border border-teal-200">
        Our Story
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-5 leading-tight">
        Styled with love,<br />made for you.
      </h2>
      <p className="text-teal-700/80 mb-3 max-w-2xl mx-auto leading-relaxed">
        Sree Mahi is a celebration of timeless Indian fashion, crafted with care by women-led artisan
        communities across the country. We work shoulder-to-shoulder with makers in Khurja, Bagru,
        Moradabad, Madhubani and beyond to bring sarees, dresses, accessories and gift pieces that
        carry a story in every stitch.
      </p>
      <p className="text-teal-700/80 mb-8 max-w-2xl mx-auto leading-relaxed">
        Every purchase supports artisans directly, preserves traditional craft, and brings home a
        handcrafted piece made to last.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {PILLARS.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left"
          >
            <span className="text-2xl mb-3 block text-teal-600">{icon}</span>
            <p className="font-bold text-teal-800 text-sm mb-1">{title}</p>
            <p className="text-teal-600/80 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}