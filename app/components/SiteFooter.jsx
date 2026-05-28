import Link from "next/link";
import { STUDENTS_COUNT } from "@/lib/marketing-stats";
import { OFFICE_BRANCHES } from "@/lib/officeBranches";
import {
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaCode,
} from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer className="bg-appleGray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaGraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">GIDZ UniPath</p>
                <p className="text-xs text-appleGray-400">Your Gateway to German Excellence</p>
              </div>
            </div>
            <p className="text-xs text-appleGray-400 leading-relaxed">
              Sri Lanka&apos;s education consultancy for German university admissions.
              Helped over {STUDENTS_COUNT} students achieve their academic dreams.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-appleGray-500 mb-4">
              Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/programs" className="text-sm text-appleGray-300 hover:text-sky-400 transition-colors duration-200">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/apply-now" className="text-sm text-appleGray-300 hover:text-sky-400 transition-colors duration-200">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-appleGray-300 hover:text-sky-400 transition-colors duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-appleGray-300 hover:text-sky-400 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-appleGray-500 mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              {OFFICE_BRANCHES.map((branch) => (
                <div key={branch.id} className="flex items-start gap-2">
                  <FaMapMarkerAlt className="w-3 h-3 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-appleGray-300">{branch.name}</p>
                    {branch.addressLines.map((line) => (
                      <p key={line} className="text-xs text-appleGray-500">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <FaPhone className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <a href="tel:+94741166235" className="text-xs text-appleGray-300 hover:text-white transition-colors duration-200">
                  +94741166235
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <a href="mailto:gidzunipath@gmail.com" className="text-xs text-appleGray-300 hover:text-white transition-colors duration-200">
                  gidzunipath@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <FaClock className="w-3 h-3 text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-appleGray-400">Mon – Fri: 8:30 AM – 6:00 PM</p>
                  <p className="text-xs text-appleGray-500">Sat: 8:30 AM – 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-appleGray-700/50 mt-8 pt-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-appleGray-500">
            &copy; {new Date().getFullYear()} GIDZ UniPath. All rights reserved.
          </p>
          <p className="text-xs text-appleGray-500">
            Built by{" "}
            <a
              href="https://lizristech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors duration-200"
            >
              Lizris
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
