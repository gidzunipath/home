"use client";

import {
  FaLifeRing,
  FaComments,
  FaCalendarAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import SmartRecommendations from "../SmartRecommendations";
import { OFFICE_BRANCHES } from "@/lib/officeBranches";

export default function SupportTab({ onMessageOpen, onAppointmentOpen }) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Gidz Buddy Checklist */}
      <SmartRecommendations />

      {/* Support & Communication */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
          <FaLifeRing className="w-5 h-5 text-sky-500 mr-3" />
          Support & Communication
        </h3>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={onMessageOpen}
            className="group bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-3xl border border-sky-200 hover:shadow-medium transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center">
                <FaComments className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-appleGray-800">
                  Message Counselor
                </h4>
                <p className="text-sm text-appleGray-600">
                  Get instant help and guidance
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onAppointmentOpen}
            className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200 hover:shadow-medium transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-appleGray-800">
                  Book Appointment
                </h4>
                <p className="text-sm text-appleGray-600">
                  Schedule a consultation call
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-soft border border-appleGray-100 hover:shadow-medium transition-all duration-300 text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <FaPhoneAlt className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-xl font-bold text-appleGray-900 mb-1">
              Call Us
            </h4>
            <p className="text-sm text-appleGray-500 mb-4">
              Mon – Fri, 9:30 AM – 5:00 PM
            </p>
            <a
              href="tel:+94741166235"
              className="block text-base font-semibold text-sky-600 hover:text-sky-700 transition-colors mb-2"
            >
              +94741166235
            </a>
            <div className="flex items-center justify-center space-x-2 text-appleGray-400">
              <FaClock className="w-3.5 h-3.5" />
              <span className="text-xs">Response within 1 hour</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-soft border border-appleGray-100 hover:shadow-medium transition-all duration-300 text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <FaMapMarkerAlt className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-xl font-bold text-appleGray-900 mb-1">
              Visit Us
            </h4>
            <p className="text-sm text-appleGray-500 mb-4">
              Mon – Fri, 9:30 AM – 5:00 PM
            </p>
            <div className="space-y-3 mb-2">
              {OFFICE_BRANCHES.map((branch) => (
                <div key={branch.id}>
                  <p className="text-sm font-semibold text-sky-600 mb-0.5">
                    {branch.name}
                  </p>
                  {branch.addressLines.map((line, index) => (
                    <p
                      key={line}
                      className={
                        index === 0
                          ? "text-base font-semibold text-appleGray-800"
                          : "text-sm text-appleGray-500"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-2 text-appleGray-400">
              <FaMapMarkerAlt className="w-3.5 h-3.5" />
              <span className="text-xs">By appointment</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-soft border border-appleGray-100 hover:shadow-medium transition-all duration-300 text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <FaEnvelope className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-xl font-bold text-appleGray-900 mb-1">
              Email Us
            </h4>
            <p className="text-sm text-appleGray-500 mb-4">
              General or business inquiries
            </p>
            <a
              href="mailto:gidzunipath@gmail.com"
              className="block text-base font-semibold text-sky-600 hover:text-sky-700 transition-colors mb-2"
            >
              gidzunipath@gmail.com
            </a>
            <div className="flex items-center justify-center space-x-2 text-appleGray-400">
              <FaPaperPlane className="w-3.5 h-3.5" />
              <span className="text-xs">Response within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
