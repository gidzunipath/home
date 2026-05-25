"use client";

import Image from "next/image";

const PARTNER_LOGOS = [
  "fintiba_logo_colour.png",
  "fintiba_logo_colour_symbol.png",
  "Expatrio Logo (1).png",
  "Expatrio Logo GreenX (1).png",
  "download.png",
  "logo.png",
];

function partnerSrc(filename) {
  return `/partners/${encodeURIComponent(filename)}`;
}

function PartnerLogo({ filename }) {
  const alt = filename.replace(/\.[^.]+$/, "").replace(/[_()]/g, " ").trim();

  return (
    <div className="partner-logo-item mx-10 flex h-20 w-44 shrink-0 items-center justify-center sm:mx-14 sm:h-24 sm:w-52">
      <Image
        src={partnerSrc(filename)}
        alt={alt}
        width={208}
        height={96}
        className="max-h-16 w-auto max-w-full object-contain grayscale opacity-70 transition-opacity duration-300 hover:opacity-90 sm:max-h-20"
      />
    </div>
  );
}

export default function PartnersSection() {
  const track = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="relative overflow-hidden bg-appleGray-50 py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 animate-fade-in-up text-center">
          <h2 className="mx-auto max-w-4xl text-3xl font-bold leading-tight text-appleGray-800 sm:text-4xl lg:text-5xl">
            Countless Benefit One Objective -{" "}
            <span className="text-gradient">Immegration for All</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-sky-500 to-sky-600" />
        </div>
      </div>

      <div className="partner-marquee-mask relative">
        <div className="flex w-max animate-partner-scroll">
          {track.map((filename, index) => (
            <PartnerLogo key={`${filename}-${index}`} filename={filename} />
          ))}
        </div>
      </div>
    </section>
  );
}
