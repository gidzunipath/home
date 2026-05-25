"use client";

import { useState } from "react";
import Link from "next/link";
import AppointmentModal from "../student/[id]/components/AppointmentModal";
import {
  FaUserShield,
  FaHandshake,
  FaCheckCircle,
  FaShieldAlt,
  FaCrown,
  FaArrowRight,
  FaPlay,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

export default function Version2Page() {
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
    <div className="min-h-screen bg-white">
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
        <div className="absolute top-0 left-0 right-0 flex z-10" style={{ height: "4px" }}>
          <div className="flex-1 bg-appleGray-800" />
          <div className="flex-1" style={{ background: "#DD0000" }} />
          <div className="flex-1" style={{ background: "#FFCC02" }} />
        </div>

        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
            transform: "translate(30%, -20%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)",
            transform: "translate(-30%, 20%)",
          }}
        />

        <div className="relative z-10 flex flex-1 items-center">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid lg:grid-cols-5 gap-12 xl:gap-16 items-center">
              <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-5 py-2.5 rounded-full text-sm font-semibold border border-sky-100">
                  <FaCrown className="w-3.5 h-3.5 text-sky-500" />
                  <span>Premium Education Consultancy</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-appleGray-800 leading-none tracking-tight">
                    Your Gateway to
                    <span className="block mt-3 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                      German Excellence
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-appleGray-500 max-w-xl leading-relaxed font-light pt-3">
                    Empowering Sri Lankan students with seamless pathways to
                    world-class German education. Experience excellence,
                    precision, and success.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/apply-now"
                    className="group bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all duration-300 hover:shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span>Start Your Journey</span>
                    <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={() => setShowCreateApointement(true)}
                    className="group bg-appleGray-50 hover:bg-appleGray-100 text-appleGray-700 px-8 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 border border-appleGray-200 hover:border-appleGray-300 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <FaPlay className="w-3.5 h-3.5 text-sky-500" />
                    <span>Schedule a Call</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-8 pt-6 border-t border-appleGray-200">
                  {[
                    { number: "100+", label: "Students Placed" },
                    { number: "50+", label: "Partner Universities" },
                    { number: "99%", label: "Success Rate" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="text-2xl md:text-3xl font-bold text-appleGray-800">
                        {stat.number}
                      </div>
                      <div className="text-xs text-appleGray-400 font-medium tracking-wide uppercase mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { icon: FaShieldAlt, text: "Money-Back Guarantee" },
                    { icon: FaUserShield, text: "Legal Experts in Germany" },
                    { icon: FaHandshake, text: "No Hidden Fees" },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-appleGray-50 border border-appleGray-200 text-appleGray-600 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      <badge.icon className="w-3 h-3 text-sky-500" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative lg:col-span-3 w-full animate-slide-in-right">
                <div className="relative rounded-3xl overflow-hidden shadow-large border border-appleGray-200 bg-appleGray-800">
                  <div className="flex items-center gap-2 px-5 py-3 bg-appleGray-50 border-b border-appleGray-200">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#FF5F57" }} />
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#FFBD2E" }} />
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#28C840" }} />
                    <div className="flex-1 mx-3 bg-white rounded-full px-4 py-1 text-xs text-appleGray-400 text-center border border-appleGray-200 truncate">
                      gidz.de &mdash; Your Path to Germany
                    </div>
                  </div>
                  <div
                    className="relative min-h-[240px] sm:min-h-[320px] lg:min-h-[400px] xl:min-h-[460px]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-xs font-medium tracking-wide">
                        Preview
                      </span>
                    </div>
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
          </div>
        </div>

        <div className="flex justify-center pb-10 relative z-10">
          <div className="flex flex-col items-center gap-1 text-appleGray-400 animate-bounce">
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
