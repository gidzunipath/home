"use client";

import { STUDENTS_COUNT } from "@/lib/marketing-stats";
import { useTestimonialsData } from "./useTestimonialsData";
import EditorialVariant from "./EditorialVariant";

export default function SuccessStoriesSection() {
  const testimonialsData = useTestimonialsData();

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-sky-400/5" />
      <div
        className="absolute right-12 top-20 h-32 w-32 animate-float rounded-full bg-sky-400/8"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-24 left-10 h-24 w-24 animate-float rounded-2xl bg-sky-500/10"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fade-in-up text-center lg:mb-16">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-appleGray-800 lg:text-5xl">
            Success Stories from{" "}
            <span className="text-gradient">Germany</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-sky-500 to-sky-400" />
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-appleGray-600">
            Real students, real journeys — see how GIDZ UniPath helped them
            reach their German education dreams
          </p>
        </div>

        <div className="animate-fade-in-up">
          <EditorialVariant stories={testimonialsData} />
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { value: STUDENTS_COUNT, label: "Students Placed" },
            { value: "50+", label: "Partner Universities" },
            { value: "99%", label: "Visa Success Rate" },
            { value: "5★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <div className="mb-2 text-3xl font-bold text-sky-500 transition-colors duration-300 group-hover:text-sky-400 lg:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm text-appleGray-600 lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
