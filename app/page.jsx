"use client";
import { useState } from "react";
import Testimonials from "./components/home/testimonials-apple";
import SuccessCarousel from "./components/home/SuccessCarousel";
import TeamSection from "./components/home/TeamSection";
import PartnersSection from "./components/home/PartnersSection";
import AppointmentModal from "./student/[id]/components/AppointmentModal";
import {
  FaUserShield,
  FaHandshake,
  FaCheckCircle,
  FaGlobe,
  FaHeart,
  FaShieldAlt,
  FaCrown,
  FaUniversity,
  FaPassport,
  FaHome,
  FaArrowRight,
  FaPlay,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";
import { STUDENTS_COUNT } from "@/lib/marketing-stats";

export default function Home() {
  const [showCreateApointement, setShowCreateApointement] = useState(false);

  const Modal = ({ children, onClose }) => {
    return (
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
  };

  return (
    <div className="min-h-screen bg-appleGray-50">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/german-education-promo.mov"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Layered Overlay — deep gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/75" />
        {/* Subtle color tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Main hero content — vertically centered */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <div className="text-center max-w-5xl mx-auto space-y-8 animate-fade-in-up">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-5 py-2.5 rounded-full text-sm font-medium border border-white/20 shadow-sm">
                <FaCrown className="w-3.5 h-3.5 text-sky-300" />
                <span>Premium Education Consultancy</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                  Your Gateway to
                  <span className="block mt-2 bg-gradient-to-r from-sky-300 via-sky-400 to-blue-300 bg-clip-text text-transparent">
                    German Excellence
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-white/75 max-w-3xl mx-auto leading-relaxed font-light pt-2">
                  Empowering Sri Lankan students with seamless pathways to
                  world-class German education. Experience excellence, precision,
                  and success.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  href="/apply-now"
                  className="group bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-2.5 shadow-lg transition-all duration-300 hover:shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Start Your Journey</span>
                  <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={() => setShowCreateApointement(true)}
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-2.5 border border-white/25 hover:border-white/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <FaPlay className="w-3.5 h-3.5" />
                  <span>Schedule a Call</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats strip at the bottom of the hero */}
          <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 divide-x divide-white/10">
              {[
                { number: "100+", label: "Students Placed" },
                { number: "50+", label: "Partner Universities" },
                { number: "99%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-center px-6">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm text-white/60 mt-0.5 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
            <FaChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Trust Indicators - Apple-style with German colors */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Floating elements for this section */}
        <div
          className="absolute top-16 right-10 w-28 h-28 bg-sky-400/8 rounded-full animate-float"
          style={{ animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-8 w-20 h-20 bg-sky-500/10 rounded-2xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-32 left-1/3 w-16 h-16 bg-sky-600/12 rounded-full animate-float"
          style={{ animationDelay: "3.5s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}{" "}
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6 leading-tight">
              Why Choose Our <span className="text-gradient">Excellence</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto mb-6"></div>
            <p className="text-xl text-appleGray-600 max-w-3xl mx-auto leading-relaxed">
              Experience unmatched quality, transparency, and success with
              German precision
            </p>
          </div>
          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: FaUserShield,
                title: "Expert Legal Team",
                description:
                  "Immigration lawyers in Germany handle your applications with precision and care.",
                color: "bg-sky-500",
              },
              {
                icon: FaShieldAlt,
                title: "Money-Back Guarantee",
                description:
                  "Complete refund within 14 days if we can't secure your admission.",
                color: "bg-sky-400",
              },
              {
                icon: FaHandshake,
                title: "Transparent Process",
                description:
                  "Clear agreements, no hidden fees, and complete transparency throughout.",
                color: "bg-appleGray-700",
              },
              {
                icon: FaCheckCircle,
                title: "Proven Success",
                description:
                  `Proven track record with over ${STUDENTS_COUNT} successful university placements.`,
                color: "bg-sky-500",
              },
              {
                icon: FaGlobe,
                title: "Global Network",
                description:
                  "Partnerships with 50+ top German universities and institutions.",
                color: "bg-sky-400",
              },
              {
                icon: FaHeart,
                title: "Personalized Care",
                description:
                  "Dedicated support tailored to your unique goals and circumstances.",
                color: "bg-appleGray-700",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group text-center card-apple-hover bg-appleGray-50 p-8 rounded-3xl border border-appleGray-200"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 mx-auto mb-6 ${feature.color} rounded-2xl flex items-center justify-center shadow-soft`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-appleGray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-appleGray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          {/* Stats */}
          {/* <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "100+", label: "Students Placed" },
              { number: "99%", label: "Success Rate" },
              { number: "50+", label: "Partner Universities" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-appleGray-50 rounded-3xl border border-appleGray-200"
              >
                <div className="text-5xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-appleGray-600 text-lg">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </section>
      
      <SuccessCarousel />
      {/* Services Section - Apple-style cards */}
      <section className="py-24 bg-appleGray-50 relative overflow-hidden">
        {/* Floating elements for services section */}
        <div
          className="absolute top-12 left-12 w-24 h-24 bg-sky-500/8 rounded-2xl animate-float"
          style={{ animationDelay: "1.8s" }}
        ></div>
        <div
          className="absolute bottom-16 right-14 w-32 h-32 bg-sky-400/6 rounded-full animate-float"
          style={{ animationDelay: "3.2s" }}
        ></div>
        <div
          className="absolute top-40 right-1/4 w-14 h-14 bg-sky-600/15 rounded-full animate-float"
          style={{ animationDelay: "2.8s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-18 h-18 bg-sky-500/12 rounded-2xl animate-float"
          style={{ animationDelay: "4.5s" }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6 leading-tight">
              Complete Education
              <span className="block text-gradient">Solutions</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto mb-6"></div>
            <p className="text-xl text-appleGray-600 max-w-3xl mx-auto leading-relaxed">
              From application to settlement, we provide comprehensive support
              for your entire educational journey to Germany
            </p>
          </div>
          {/* Service Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaUniversity,
                title: "University Applications",
                description:
                  "Expert guidance for applications to Germany's top universities with high acceptance rates.",
                features: [
                  "Document preparation",
                  "Application strategy",
                  "Interview coaching",
                  "Deadline management",
                ],
                color: "bg-sky-500",
              },
              {
                icon: FaPassport,
                title: "Visa & Immigration",
                description:
                  "Complete visa processing with legal experts ensuring smooth immigration procedures.",
                features: [
                  "Student visa processing",
                  "Document verification",
                  "Embassy appointments",
                  "Legal compliance",
                ],
                color: "bg-sky-400",
              },
              {
                icon: FaHome,
                title: "Settlement Support",
                description:
                  "Comprehensive assistance for your transition and successful integration in Germany.",
                features: [
                  "Accommodation assistance",
                  "Bank account setup",
                  "Cultural orientation",
                  "Ongoing support",
                ],
                color: "bg-appleGray-700",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-soft card-apple-hover border border-appleGray-200"
              >
                <div
                  className={`w-16 h-16 mb-6 ${service.color} rounded-2xl flex items-center justify-center shadow-soft`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-appleGray-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-appleGray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <FaCheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-appleGray-700 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>{" "}
          {/* CTA */}
          <div className="text-center mt-20">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-12 text-white shadow-large">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
                Join over {STUDENTS_COUNT} successful students who have achieved their
                German education dreams with our comprehensive support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-sky-500 px-8 py-4 rounded-2xl font-semibold text-lg btn-apple-hover shadow-soft hover:bg-sky-50">
                  Start Application
                </button>
                <button
                  onClick={() => setShowCreateApointement(true)}
                  className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg btn-apple-hover hover:bg-white/10"
                >
                  Free Consultation
                </button>
              </div>
            </div>
          </div>
        </div>{" "}
      </section>

      <TeamSection />

      <PartnersSection />

      {/* Testimonials Section */}
      <Testimonials /> {/* Contact Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Floating elements for contact section */}
        <div
          className="absolute top-8 right-8 w-30 h-30 bg-sky-400/7 rounded-full animate-float"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute bottom-12 left-10 w-20 h-20 bg-sky-500/12 rounded-2xl animate-float"
          style={{ animationDelay: "3.5s" }}
        ></div>
        <div
          className="absolute top-32 left-1/3 w-16 h-16 bg-sky-600/10 rounded-full animate-float"
          style={{ animationDelay: "2.7s" }}
        ></div>
        <div
          className="absolute bottom-28 right-1/4 w-14 h-14 bg-sky-400/15 rounded-2xl animate-float"
          style={{ animationDelay: "4.2s" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6">
              Ready to Begin Your{" "}
              <span className="text-gradient">German Journey?</span>
            </h2>
            <p className="text-xl text-appleGray-600 max-w-3xl mx-auto">
              Get started with a free consultation and take the first step
              towards your German education dream.
            </p>
          </div>

          <div className="flex justify-center items-center">
            {/* CTA Card */}
            <div className="bg-appleGray-50 w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border border-appleGray-200">
              <h3 className="text-xl sm:text-2xl font-bold text-appleGray-800 mb-4 text-center sm:text-left">
                Free Consultation
              </h3>
              <p className="text-appleGray-600 mb-6 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                Schedule a complimentary consultation to discuss your German
                education goals and get personalized guidance.
              </p>
              <button
                onClick={() => setShowCreateApointement(true)}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg btn-apple-hover shadow-soft hover:from-sky-600 hover:to-sky-700 transition-all duration-200"
              >
                Book Your Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Appointment Modal */}
      {showCreateApointement && (
        <Modal onClose={() => setShowCreateApointement(false)}>
          <AppointmentModal onClose={() => setShowCreateApointement(false)} />
        </Modal>
      )}
    </div>
  );
}
