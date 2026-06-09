export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-teal-800 to-teal-900 text-teal-100 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-bold text-white mb-2">Sree Mahi</p>
          <p className="text-sm text-teal-300/80 leading-relaxed">
            Handcrafted fashion and artisan accents curated for women and girls,
            made with love by India’s finest craft communities.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-400 mb-3">Explore</p>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              { href: "#collection", label: "Catalog" },
              { href: "#about",      label: "Our Story" },
              { href: "#contact",    label: "Reach Us" },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-teal-200/80 hover:text-white transition-colors duration-200 !no-underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-400 mb-3">Featured Collections</p>
          <p className="text-sm text-teal-200/70 leading-relaxed">
            Sarees · Dresses · Accessories · Gift Items · Handloom Textiles · Artisanal Jewelry
          </p>
        </div>
      </div>

      <div className="border-t border-teal-700 px-6 py-4 text-center text-xs text-teal-500">
        © 2026 Sree Mahi. Crafted with care. Made by hand, in India.
      </div>
    </footer>
  );
}