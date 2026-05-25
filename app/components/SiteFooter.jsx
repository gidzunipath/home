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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-soft">
                <FaGraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">GIDZ UniPath</h3>
                <p className="text-appleGray-400 text-sm">
                  Your Gateway to German Excellence
                </p>
              </div>
            </div>
            <p className="text-appleGray-300 mb-8 leading-relaxed max-w-md text-lg">
              We are Sri Lanka&apos;s premier education consultancy, specializing
              in German university admissions and visa processing. Our expert
              team has helped over {STUDENTS_COUNT} students achieve their academic dreams in
              Germany.
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-4 bg-sky-600 rounded-sm"></div>
              <div className="w-6 h-4 bg-sky-500 rounded-sm"></div>
              <div className="w-6 h-4 bg-sky-400 rounded-sm"></div>
              <span className="text-appleGray-400 text-sm ml-2">
                Excellence. Precision. Success.
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/programs"
                  className="text-appleGray-300 hover:text-sky-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span>Programs</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-now"
                  className="text-appleGray-300 hover:text-sky-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span>Apply Now</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-appleGray-300 hover:text-sky-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span>Contact Us</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Contact Info</h4>
            <div className="space-y-6">
              {OFFICE_BRANCHES.map((branch) => (
                <div key={branch.id} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                    <FaMapMarkerAlt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-appleGray-300 font-medium">{branch.name}</p>
                    {branch.addressLines.map((line) => (
                      <p key={line} className="text-appleGray-400">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <FaPhone className="w-5 h-5 text-white" />
                </div>
                <a
                  href="tel:+94741166235"
                  className="text-appleGray-300 hover:text-white transition-colors duration-300"
                >
                  +94 74 116 6235
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-appleGray-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <FaEnvelope className="w-5 h-5 text-white" />
                </div>
                <a
                  href="mailto:gidzunipath@gmail.com"
                  className="text-appleGray-300 hover:text-white transition-colors duration-300"
                >
                  gidzunipath@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <FaClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-appleGray-300 font-medium">
                    Mon - Fri: 8:30 AM - 6:00 PM
                  </p>
                  <p className="text-appleGray-400">Sat: 8:30 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-appleGray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-appleGray-400">
              <p>
                &copy; 2025 GIDZ UniPath. All rights reserved. Crafted with German
                precision.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-appleGray-400">
              <span>Developed by</span>
              <a
                href="https://lizristech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sky-400 hover:text-white transition-colors duration-300 font-bold"
              >
                <FaCode className="w-4 h-4" />
                <span>Lizris</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
