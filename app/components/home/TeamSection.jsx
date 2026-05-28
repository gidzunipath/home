"use client";

import Image from "next/image";
import { FaUser } from "react-icons/fa";

const TEAM_MEMBERS = [
  {
    name: "Mr. Ganeshamoorthey Gideon",
    role: "Founder & Managing Director",
    image: "/team/GIDEON.png",
    description:
      "Visa expert with ten years experience, founder of Gidz Uni Path providing trusted worldwide visa guidance.",
  },
  {
    name: "Mr. Ganeshamoorthey Kalep",
    role: "Student Recruitment Manager",
    image: "/team/KALEP.png",
    description:
      "Years of hands-on visa experience, guiding you clearly at every step for a stress-free process.",
  },
  {
    name: "Ms. Yogarasa Mithusha",
    role: "Operational Manager",
    image: "/team/MITHUSHA.png",
    description:
      "Focuses on getting details right, helping you move forward with confidence and a smooth visa journey.",
  },
];

function TeamPhoto({ member }) {
  if (member.image) {
    return (
      <div className="relative aspect-[5/6] w-full overflow-hidden rounded-2xl bg-appleGray-100 shadow-soft">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-appleGray-200 shadow-soft"
      aria-label={`${member.name} — placeholder photo`}
    >
      <FaUser className="absolute inset-0 h-full w-full p-6 text-appleGray-300" />
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div
        className="absolute right-10 top-16 h-28 w-28 animate-float rounded-full bg-sky-400/8"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-20 left-8 h-20 w-20 animate-float rounded-2xl bg-sky-500/10"
        style={{ animationDelay: "3.8s" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 animate-fade-in-up text-center">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-appleGray-800 lg:text-5xl">
            Meet Our <span className="text-gradient">Team</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-sky-500 to-sky-600" />
         
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.name}
              className="card-apple-hover flex flex-col rounded-3xl border border-appleGray-200 bg-appleGray-50 p-6 sm:p-8"
            >
              <TeamPhoto member={member} />
              <div className="mt-6 flex flex-1 flex-col text-center">
                <h3 className="text-xl font-bold text-appleGray-800">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-sky-600">
                  {member.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-appleGray-600">
                  {member.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
