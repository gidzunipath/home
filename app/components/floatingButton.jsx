"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaChevronUp, FaPhone, FaEnvelope } from "react-icons/fa";

export default function FloatingButtons() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200); // Show button after scrolling 200px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/94741166235", "_blank");
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+94741166235";
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:info@gidzunipath.com";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col space-y-4 items-end">
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={handleBackToTop}
            className="w-14 h-14 bg-appleGray-800 hover:bg-sky-500 text-white rounded-2xl shadow-large flex items-center justify-center transition-all duration-300 btn-apple-hover animate-fade-in"
            aria-label="Back to top"
          >
            <FaChevronUp className="w-5 h-5" />
          </button>
        )}

        {/* Contact Menu */}
        <div className="relative">
          {/* Main WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
            className="w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white rounded-2xl shadow-large flex items-center justify-center transition-all duration-300 btn-apple-hover group relative"
            aria-label="Contact us on WhatsApp"
          >
            <FaWhatsapp className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-2xl bg-[#25D366] opacity-75 animate-ping"></div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-appleGray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Chat with us
              <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-appleGray-800"></div>
            </div>
          </button>

          {/* Menu Toggle Indicator */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
