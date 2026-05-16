"use client";

import { useState } from "react";
import {
  FaLifeRing,
  FaComments,
  FaCalendarAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";

const FAQ_ITEMS = [
  {
    q: "Why should Sri Lankan students choose Germany for higher education with GIDZ UniPath?",
    a: "Germany offers a world-class education system with little to no tuition fees at public universities. It has a strong economy, excellent post-graduation job opportunities, and over 2,000 degree programs taught entirely in English.",
  },
  {
    q: "Are public universities in Germany really free?",
    a: "Yes, most public universities in Germany do not charge tuition fees for Bachelor's and Master's programs. Students only need to pay a small semester contribution fee, usually between €150–€350, which often includes free public transportation.",
  },
  {
    q: "Can I stay and work in Germany after completing my degree?",
    a: "Yes. After graduating, students can apply for an 18-month post-study job seeker visa to search for employment related to their field. Once employed, they can convert their visa into an EU Blue Card or work residence permit.",
  },
  {
    q: "Do I need to speak German to study there?",
    a: "Not necessarily. Many universities offer English-taught programs. However, learning basic German is highly recommended for daily life, part-time jobs, and easier social integration.",
  },
  {
    q: "What are the basic academic requirements for a Bachelor's degree?",
    a: "Students generally need strong GCE A-Level qualifications, O-Level English results (minimum C), and an IELTS (B2) certificate to prove English proficiency. Requirements may vary depending on the university and program.",
  },
  {
    q: "What are the academic requirements for a Master's degree?",
    a: "Applicants must hold a recognized Bachelor's degree related to the chosen Master's program, along with strong academic transcripts with a GPA above 3.0 and an IELTS score of 6.5.",
  },
  {
    q: "How long do degree programs take in Germany?",
    a: "A Bachelor's degree usually takes 3–4 years (6–8 semesters), while a Master's degree generally takes 1.5–2 years (3–4 semesters).",
  },
  {
    q: "What is a Blocked Account (Sperrkonto)?",
    a: "A blocked account is a special bank account required for the German student visa. It proves that the student has enough financial resources to support themselves during their first year in Germany.",
  },
  {
    q: "What is the Blocked Account amount required for 2026?",
    a: "For 2026, students must deposit €11,904 into a blocked account. They can withdraw up to €992 per month for living expenses.",
  },
  {
    q: "Can I use a sponsor letter instead of a Blocked Account?",
    a: "Yes. Instead of a blocked account, students may use a formal sponsorship declaration if they have a sponsor legally living and working in Germany who agrees to cover their expenses.",
  },
  {
    q: "When are the university intakes in Germany?",
    a: "Germany has two main intakes: the Winter Semester starting in September/October and the Summer Semester starting in March/April. The Winter intake offers more programs.",
  },
  {
    q: "Can I apply to multiple universities at once?",
    a: "Yes, and it is highly recommended. Applying to around 3 carefully shortlisted universities increases your chances of admission.",
  },
  {
    q: "How long will it take to get an admission letter after applying?",
    a: "Usually, universities take about 4–6 weeks to issue an admission letter after receiving a complete application.",
  },
  {
    q: "How long does visa processing take in Colombo?",
    a: "Student visa processing generally takes 4–8 weeks, but during peak periods it may take up to 12 weeks.",
  },
  {
    q: "Am I allowed to work part-time as an international student?",
    a: "Yes. International students can legally work up to 140 full days or 280 half days per year in Germany.",
  },
  {
    q: "Do I need health insurance to study in Germany?",
    a: "Yes. Health insurance is mandatory for both the visa application and university enrollment. Public student insurance typically costs around €120–€140 per month.",
  },
  {
    q: "What is the average cost of living in Germany for a student?",
    a: "Students usually spend between €600 and €700 per month on rent, groceries, transport, and insurance, depending on the city.",
  },
  {
    q: "Do I need German language skills?",
    a: "German language skills are not required for English-taught programs, but learning basic German is strongly recommended for daily communication and adjusting to life in Germany.",
  }
];

export default function SupportTab({ onMessageOpen, onAppointmentOpen }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="p-6 sm:p-8 space-y-8">
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
              href="tel:+4915566389194"
              className="block text-base font-semibold text-sky-600 hover:text-sky-700 transition-colors mb-2"
            >
              +49 155 6638 9194
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
            <p className="text-base font-semibold text-appleGray-800 mb-1">
              Ponnalai Road,
            </p>
            <p className="text-sm text-appleGray-500 mb-2">
              Sandilipay, 40000, Sri Lanka
            </p>
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

      {/* FAQ Accordion */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
          <FaQuestionCircle className="w-5 h-5 text-sky-500 mr-3" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-appleGray-50 rounded-2xl overflow-hidden border border-appleGray-100"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-appleGray-800">
                    {item.q}
                  </span>
                </span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <svg
                    className={`w-3 h-3 text-sky-600 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-appleGray-600 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
