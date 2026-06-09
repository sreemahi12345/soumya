import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import ProductList from "../components/ProductList";
import About from "../components/About";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import CustomizationPopup from "../components/CustomizationPopup";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navigation />
      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-5">
        <Hero />
        <CustomizationPopup />
        <section id="collection" className="w-full max-w-6xl mx-auto py-10 md:py-12">
          <ProductList />
        </section>
        <section id="about" className="w-full max-w-4xl mx-auto py-10 md:py-12">
          <About />
        </section>
        <section id="contact" className="w-full max-w-2xl mx-auto py-10 md:py-12">
          <ContactForm />
        </section>
      </main>

      <a
        href="#contact"
        aria-label="Reach out"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-teal-200 transition-all duration-200 hover:scale-105 hover:bg-teal-700 active:scale-95 animate-fade-in-up"
      >
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/90 animate-pulse" />
        Reach Out
      </a>

      <Footer />
    </div>
  );
}
