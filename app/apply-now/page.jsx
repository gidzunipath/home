"use client";
import React from "react";
import {
  FaUserGraduate,
  FaBriefcase,
  FaArrowRight,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaUsers,
  FaGlobe,
  FaRocket,
  FaUniversity,
  FaStar,
  FaCloudUploadAlt,
  FaFileAlt,
  FaEnvelope,
} from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { STUDENTS_COUNT } from "@/lib/marketing-stats";

export default function VisaOptionsPage() {
  const router = useRouter();

  const benefits = [
    {
      icon: FaCheckCircle,
      title: "100% Success Rate",
      description: "Proven track record with all student applications",
      color: "bg-sky-500",
    },
    {
      icon: FaClock,
      title: "Fast Processing",
      description: "Get your visa approved in record time",
      color: "bg-sky-400",
    },
    {
      icon: FaShieldAlt,
      title: "Secure Process",
      description: "Your documents are safe with our encrypted system",
      color: "bg-sky-600",
    },
    {
      icon: FaUsers,
      title: "Expert Support",
      description: "Dedicated consultants guide you every step",
      color: "bg-sky-500",
    },
  ];

  const stats = [
    { number: STUDENTS_COUNT, label: "Students Placed", icon: FaGraduationCap },
    { number: "50+", label: "Universities", icon: FaUniversity },
    { number: "15+", label: "Years Experience", icon: FaStar },
    { number: "99%", label: "Success Rate", icon: FaRocket },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5"></div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sky-400/10 rounded-full animate-float"></div>
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-sky-500/20 rounded-2xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-40 left-20 w-20 h-20 bg-sky-600/15 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-700 px-6 py-3 rounded-full text-sm font-medium border border-sky-500/20">
                <FaGraduationCap className="w-4 h-4" />
                <span>Your Gateway to International Education</span>
              </div>
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-appleGray-800 leading-tight">
                Choose Your Path to
                <span className="block text-gradient mt-2">Global Success</span>
              </h1>
              {/* Subtitle */}{" "}
              <p className="text-xl lg:text-2xl text-appleGray-600 max-w-4xl mx-auto leading-relaxed">
                Whether you&apos;re pursuing higher education or advancing your
                career, we make your international dreams a reality with expert
                guidance and proven results.
              </p>
            </div>
          </div>
        </section>

        {/* Visa Options Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Student Visa Option */}
              <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-large border border-appleGray-200 hover:shadow-xl transition-all duration-500 card-apple-hover overflow-hidden">
                {/* Gradient Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>

                {/* Floating Icon */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Icon & Image */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-soft">
                        <Image
                          src="/student-visa.png"
                          alt="Student Visa"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center shadow-soft">
                        <FaUserGraduate className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-appleGray-800">
                      Student Visa Application
                    </h2>

                    <p className="text-lg text-appleGray-600 leading-relaxed">
                      Unlock world-class education opportunities. From
                      university selection to visa approval, we handle
                      everything for your academic success.
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {[
                        "University selection & admission",
                        "Scholarship opportunities",
                        "Visa documentation & filing",
                        "Pre-departure guidance",
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 text-appleGray-600"
                        >
                          <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => router.push("apply-now/student")}
                      className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-4 rounded-2xl font-semibold btn-apple-hover shadow-soft flex items-center justify-center space-x-3 group"
                    >
                      <span>Start Student Application</span>
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Work Visa Option */}
              <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-large border border-appleGray-200 hover:shadow-xl transition-all duration-500 card-apple-hover overflow-hidden">
                {/* Gradient Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-600 to-sky-500"></div>

                {/* Floating Icon */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Icon & Image */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-soft">
                        <Image
                          src="/work-visa.png"
                          alt="Work Visa"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center shadow-soft">
                        <FaBriefcase className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-appleGray-800">
                      Work Visa Application
                    </h2>

                    <p className="text-lg text-appleGray-600 leading-relaxed">
                      Advance your career globally. We connect you with
                      international employers and handle all visa formalities
                      for seamless migration.
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {[
                        "Job placement assistance",
                        "Employer sponsorship support",
                        "Work permit processing",
                        "Settlement services",
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 text-appleGray-600"
                        >
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => router.push("apply-now/work")}
                      className="w-full bg-gradient-to-r from-sky-600 to-sky-700 text-white px-8 py-4 rounded-2xl font-semibold btn-apple-hover shadow-soft flex items-center justify-center space-x-3 group"
                    >
                      <span>Start Work Application</span>
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-sky-500/5 to-sky-600/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6">
                Why Choose <span className="text-gradient">GIDZ UniPath</span>?
              </h2>
              <p className="text-xl text-appleGray-600 max-w-3xl mx-auto">
                Experience the difference with our premium consultation services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group text-center p-6 bg-white rounded-2xl border border-appleGray-200 shadow-soft hover:shadow-large transition-all duration-300 card-apple-hover"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-6 ${benefit.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-appleGray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-appleGray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6">
                Simple <span className="text-gradient">3-Step Process</span>
              </h2>
              <p className="text-xl text-appleGray-600 max-w-3xl mx-auto">
                Get started with your application in just three easy steps
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-400 mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="group relative text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-soft z-10">
                  1
                </div>{" "}
                <div className="bg-white rounded-3xl p-8 pt-12 shadow-large border border-appleGray-200 hover:shadow-xl transition-all duration-300 card-apple-hover min-h-full flex flex-col">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300">
                        <FaCloudUploadAlt className="w-24 h-24 text-sky-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-400 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-appleGray-800 mb-4">
                      Submit Required Documents
                    </h3>
                    <p className="text-appleGray-600 leading-relaxed flex-1">
                      Upload your documents through our secure online portal.
                      Our system guides you through each required document with
                      clear instructions.
                    </p>
                  </div>
                </div>
                {/* <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-sky-400 to-sky-500"></div> */}
              </div>

              {/* Step 2 */}
              <div className="group relative text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-soft z-10">
                  2
                </div>{" "}
                <div className="bg-white rounded-3xl p-8 pt-12 shadow-large border border-appleGray-200 hover:shadow-xl transition-all duration-300 card-apple-hover min-h-full flex flex-col">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300">
                        <FaFileAlt className="w-24 h-24 text-sky-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-400 rounded-full flex items-center justify-center">
                        <FaClock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-appleGray-800 mb-4">
                      Expert Document Review
                    </h3>
                    <p className="text-appleGray-600 leading-relaxed flex-1">
                      Our experienced consultants thoroughly review your
                      documents for completeness and accuracy to ensure maximum
                      approval chances.
                    </p>
                  </div>
                </div>
                {/* <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-sky-400 to-sky-500"></div> */}
              </div>

              {/* Step 3 */}
              <div className="group relative text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-soft z-10">
                  3
                </div>{" "}
                <div className="bg-white rounded-3xl p-8 pt-12 shadow-large border border-appleGray-200 hover:shadow-xl transition-all duration-300 card-apple-hover min-h-full flex flex-col">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300">
                        <FaEnvelope className="w-24 h-24 text-sky-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-400 rounded-full flex items-center justify-center">
                        <FaRocket className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-appleGray-800 mb-4">
                      Get Your Approval
                    </h3>
                    <p className="text-appleGray-600 leading-relaxed flex-1">
                      Receive instant notifications as soon as your review is
                      completed. We&apos;ll guide you through the next steps for
                      your successful application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-sky-500 to-sky-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-full w-1 h-1 animate-pulse-slow"
                ></div>
              ))}
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Our Track Record Speaks
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Join thousands of successful students and professionals who
                achieved their dreams with us
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <stat.icon className="w-10 h-10" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">
                    {stat.number}
                  </div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Start Your Journey?
                </h2>{" "}
                <p className="text-xl mb-8 opacity-90">
                  Don&apos;t wait any longer. Your international education or
                  career opportunity is just one click away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("apply-now/student")}
                    className="px-8 py-4 bg-white text-sky-600 rounded-2xl font-semibold hover:bg-appleGray-100 transition-colors duration-300 btn-apple-hover shadow-soft"
                  >
                    Apply for Student Visa
                  </button>
                  <button
                    onClick={() => router.push("apply-now/work")}
                    className="px-8 py-4 bg-white/20 text-white border-2 border-white rounded-2xl font-semibold hover:bg-white hover:text-sky-600 transition-all duration-300 btn-apple-hover"
                  >
                    Apply for Work Visa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
