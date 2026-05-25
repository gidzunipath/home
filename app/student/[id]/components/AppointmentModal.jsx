import Image from "next/image";
import { FaCalendarAlt, FaClock, FaExternalLinkAlt } from "react-icons/fa";

export default function AppointmentModal({ onClose }) {
  return (
    <div className="text-center relative">
      {/* Header */}
      <div className="mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-soft">
          <FaCalendarAlt className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-appleGray-800 mb-2">
          Book an Appointment
        </h2>
        <p className="text-appleGray-600">
          Schedule a convenient time for a personalized consultation with our
          team
        </p>
      </div>

      {/* Appointment Image */}
      <div className="mb-6">
        <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden shadow-soft border-4 border-white">
          <Image
            src="/app.webp"
            alt="Appointment"
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Features */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-center space-x-3 text-appleGray-600">
          <FaClock className="w-4 h-4 text-green-500" />
          <span className="text-sm">30-minute consultation</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-appleGray-600">
          <FaCalendarAlt className="w-4 h-4 text-green-500" />
          <span className="text-sm">Choose your preferred time</span>
        </div>
      </div>

      {/* CTA Button */}
      <a
        href="https://calendly.com/gidzunipath/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-soft hover:shadow-medium transition-all duration-300"
      >
        <FaExternalLinkAlt className="w-4 h-4" />
        <span>Book Your Appointment</span>
      </a>
    </div>
  );
}
