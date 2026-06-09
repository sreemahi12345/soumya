"use client";

import { FormEvent, useState } from "react";
import { getApiBaseUrl } from "../lib/api";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setIsSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/reachout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || "Failed to submit form");

      setIsSuccess(true);
      setStatusMessage(data?.message || "Message sent successfully");
      form.reset();
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "border border-teal-200 rounded-xl px-4 py-2.5 bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 text-sm";

  return (
    <div className="rounded-3xl bg-white border border-teal-100 shadow-lg p-5 sm:p-8 md:p-10 animate-fade-in-up">
      <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-widest uppercase mb-4 border border-teal-200">
        Get in Touch
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2">Tell us what you&apos;re looking for.</h2>
      <p className="text-sm text-teal-600/70 mb-6">We reply within 48 hours, always personally.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Your Name</label>
            <input id="name" name="name" type="text" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</label>
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Address</label>
            <input id="address" name="address" type="text" className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Message</label>
          <textarea id="message" name="message" rows={4} required className={inputClass + " resize-none"} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full sm:w-auto px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-teal-200 self-start"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : "Send Message →"}
        </button>

        {statusMessage && (
          <div className={`rounded-xl px-4 py-3 text-sm animate-fade-in ${isSuccess ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
}