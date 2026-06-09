"use client";

import { useEffect, useState } from "react";

export default function CustomizationPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto relative max-w-lg w-full rounded-[2rem] border border-teal-100 bg-white/95 p-5 sm:p-6 shadow-2xl shadow-teal-200/30 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600 focus:outline-none"
          aria-label="Close popup"
        >
          ✕
        </button>

        <div className="flex gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-600 text-white text-2xl">
            ✨
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">Customization Available</p>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">Make your product uniquely yours.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose custom colors, designs, packaging, and sizing for sarees, dresses, accessories, and gifts. Tap customize now or close with the red X.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#contact"
            className="inline-flex justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Customize Now
          </a>
        </div>
      </div>
    </div>
  );
}
