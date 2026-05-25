import Link from "next/link";
import { FaArrowLeft, FaGraduationCap } from "react-icons/fa";

export default function ProgramComingSoon({ title }) {
  return (
    <div className="min-h-screen bg-appleGray-50 flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-soft mb-8">
            <FaGraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-appleGray-800 mb-4">
            {title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto mb-6" />
          <p className="text-2xl sm:text-3xl font-semibold text-sky-600 mb-8">
            Coming Soon
          </p>
          <p className="text-lg text-appleGray-600 mb-10 leading-relaxed">
            We&apos;re preparing detailed program information. Check back
            shortly.
          </p>
         
        </div>
      </section>
    </div>
  );
}
