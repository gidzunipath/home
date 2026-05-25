"use client";

import Image from "next/image";
import Link from "next/link";
import { FaGraduationCap, FaMapMarkedAlt } from "react-icons/fa";
import GermanyMap from "../components/home/GermanyMap";

const PROGRAM_LEVELS = [
  {
    title: "Bachelors",
    href: "/programs/bachelors",
    image: "/programs/Bachelor.png",
    imageAlt: "Graduate celebrating a Bachelors degree",
  },
  {
    title: "Masters",
    href: "/programs/masters",
    image: "/programs/Masters.png",
    imageAlt: "Graduate with Masters thesis and diploma",
  },
];

function ProgramLevelCard({ title, href, image, imageAlt }) {
  return (
    <Link
      href={href}
      aria-label={`Explore ${title} programs in Germany`}
      className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-appleGray-200 bg-white shadow-soft card-apple-hover transition-colors duration-300 hover:border-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    >
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-sky-500 to-sky-600 transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden
      />
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-appleGray-100">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-sky-900/0 transition-colors duration-300 group-hover:bg-sky-900/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end p-5 sm:p-6">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-sky-500 group-hover:shadow-lg"
            aria-hidden
          >
            <FaGraduationCap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-appleGray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-appleGray-50 via-white to-appleGray-100 pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5" />
        <div
          className="absolute top-24 right-10 w-32 h-32 rounded-full bg-sky-400/10 animate-float pointer-events-none"
          style={{ animationDelay: "1s" }}
          aria-hidden
        />
        <div
          className="absolute bottom-8 left-12 w-24 h-24 rounded-2xl bg-sky-500/10 animate-float pointer-events-none"
          style={{ animationDelay: "2.5s" }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-soft">
              <FaMapMarkedAlt className="w-10 h-10 text-white" />
            </div>
            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold text-appleGray-800 leading-tight">
              Study Programs in{" "}
              <span className="text-gradient">Germany</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto my-6" />
           
           
          </div>
        </div>
        <div className="relative z-10 mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:mt-12">
          <div className="grid gap-8 md:grid-cols-2">
            {PROGRAM_LEVELS.map((level) => (
              <ProgramLevelCard key={level.title} {...level} />
            ))}
          </div>
        </div>
      </section>

      <GermanyMap
        subtitle="Explore cities across Germany where GIDZ UniPath students study, live, and succeed"
        className="bg-appleGray-50"
      />
    </div>
  );
}
