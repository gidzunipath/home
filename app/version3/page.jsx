"use client";

import { useState } from "react";
import Link from "next/link";
import AppointmentModal from "../student/[id]/components/AppointmentModal";
import {
  FaUserShield,
  FaCheckCircle,
  FaCrown,
  FaArrowRight,
  FaPlay,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

export default function Version3Page() {
  const [showCreateApointement, setShowCreateApointement] = useState(false);

  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-8 rounded-3xl shadow-large border border-appleGray-200 w-11/12 sm:w-10/12 md:w-8/12 lg:w-6/12 max-w-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200"
        >
          <FaTimes className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-appleGray-50">
      <section className="relative min-h-screen flex flex-col overflow-x-hidden bg-appleGray-50">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/90 via-white to-appleGray-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(14,165,233,0.12) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(56,189,248,0.08) 0%, transparent 40%)",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pb-12">
            <div className="text-center max-w-5xl mx-auto space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white text-sky-700 px-5 py-2.5 rounded-full text-sm font-semibold border border-sky-100 shadow-soft">
                <FaCrown className="w-3.5 h-3.5 text-sky-500" />
                <span>Premium Education Consultancy</span>
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-appleGray-800 leading-none tracking-tight">
                  Your Gateway to
                  <span className="block mt-2 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                    German Excellence
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-appleGray-500 max-w-3xl mx-auto leading-relaxed font-light">
                  Empowering Sri Lankan students with seamless pathways to
                  world-class German education. Experience excellence, precision,
                  and success.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                <Link
                  href="/apply-now"
                  className="group bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-2.5 shadow-lg transition-all duration-300 hover:shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Start Your Journey</span>
                  <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => setShowCreateApointement(true)}
                  className="group bg-white hover:bg-appleGray-50 text-appleGray-700 px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-2.5 border border-appleGray-200 hover:border-appleGray-300 shadow-soft transition-all duration-300 hover:-translate-y-0.5"
                >
                  <FaPlay className="w-3.5 h-3.5 text-sky-500" />
                  <span>Schedule a Call</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-8 min-h-0">
            <div className="relative w-full max-w-6xl mx-auto animate-scale-in overflow-visible px-2 sm:px-4">
              <div className="relative rounded-3xl overflow-hidden shadow-large border border-appleGray-200 bg-black">
                <div
                  className="relative w-full min-h-[200px] sm:min-h-[280px] md:min-h-[360px] lg:min-h-[420px]"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <video
                    className="w-full h-full object-cover"
                    src="/german-education-promo.mov"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              <div
                className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-medium border border-appleGray-200 px-4 py-3 flex items-center gap-3 animate-float"
                style={{ animationDelay: "0s" }}
              >
                <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <FaUserShield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-appleGray-800 leading-tight">
                    Expert Legal Team
                  </div>
                  <div className="text-xs text-appleGray-400 leading-tight mt-0.5">
                    Based in Germany
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-medium border border-appleGray-200 px-4 py-3 flex items-center gap-3 animate-float"
                style={{ animationDelay: "1.4s" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft"
                  style={{ background: "rgba(52,199,89,0.12)" }}
                >
                  <FaCheckCircle className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-xs font-bold text-appleGray-800 leading-tight">
                    99% Success Rate
                  </div>
                  <div className="text-xs text-appleGray-400 leading-tight mt-0.5">
                    Proven track record
                  </div>
                </div>
              </div>

              <div
                className="absolute top-1/2 -right-7 -translate-y-1/2 bg-white rounded-2xl shadow-medium border border-appleGray-200 px-4 py-3 text-center animate-float hidden xl:block"
                style={{ animationDelay: "0.7s" }}
              >
                <div className="text-2xl font-bold text-appleGray-800">50+</div>
                <div className="text-xs text-appleGray-400 font-medium tracking-wide uppercase mt-0.5">
                  Partner<br />Unis
                </div>
              </div>

              <div className="absolute -inset-4 rounded-[2.5rem] border border-dashed border-sky-200/60 pointer-events-none" />
            </div>
          </div>

          <div className="relative z-10 border-t border-appleGray-200 bg-white/70 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 divide-x divide-appleGray-200">
              {[
                { number: "100+", label: "Students Placed" },
                { number: "50+", label: "Partner Universities" },
                { number: "99%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-center px-6">
                  <div className="text-2xl md:text-3xl font-bold text-appleGray-800">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm text-appleGray-400 mt-0.5 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-appleGray-400 animate-bounce pointer-events-none">
            <FaChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {showCreateApointement && (
        <Modal onClose={() => setShowCreateApointement(false)}>
          <AppointmentModal onClose={() => setShowCreateApointement(false)} />
        </Modal>
      )}
    </div>
  );
}
