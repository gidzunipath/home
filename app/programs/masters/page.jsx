import Image from "next/image";
import { FaGraduationCap, FaImage } from "react-icons/fa";

/** Portrait ratio for category images (1536 × 2752) */
const IMAGE_ASPECT = "aspect-[1536/2752]";

const CATEGORIES = [
  {
    title: "Engineering & Technology",
    description:
      "Pursue advanced master's programs in Mechanical Engineering, Automotive Engineering, Electrical Engineering, Robotics, Renewable Energy, Industrial Engineering, and Aerospace Engineering. Germany is a global leader in engineering education with excellent research facilities and strong industry partnerships.",
    image: "/programs/masters/Engineering.png",
    imageAlt: "Engineering & Technology",
  },
  {
    title: "Computer Science & IT",
    description:
      "Study specialized master's programs in Artificial Intelligence, Data Science, Cybersecurity, Software Engineering, Cloud Computing, and Information Technology. Germany offers cutting-edge tech education with strong career opportunities in Europe's growing digital sector.",
    image: "/programs/masters/Gemini_Generated_Image_a79aeka79aeka79a.png",
    imageAlt: "Computer Science & IT",
  },
  {
    title: "Business, Management & Economics",
    description:
      "Explore master's degrees in MBA, International Business, Finance, Marketing, Supply Chain Management, Business Analytics, and Economics. German universities combine academic excellence with practical business knowledge and global networking opportunities.",
    image: "/programs/masters/Economics.png",
    imageAlt: "Business, Management & Economics",
  },
  {
    title: "Natural Sciences & Mathematics",
    description:
      "Advance your expertise in Physics, Chemistry, Mathematics, Nanotechnology, Environmental Science, and Materials Science. Germany provides world-class research opportunities and innovative scientific education for international students.",
    image: "/programs/masters/math.png",
    imageAlt: "Natural Sciences & Mathematics",
  },
  {
    title: "Biotechnology, Biology & Life Sciences",
    description:
      "Choose from master's programs in Biotechnology, Molecular Biology, Genetics, Bioinformatics, Neuroscience, Biomedical Sciences, and Microbiology. Germany is one of Europe's top destinations for life science research and innovation.",
    image: "/programs/masters/Biotechnology.png",
    imageAlt: "Biotechnology, Biology & Life Sciences",
  },
  {
    title: "Medical & Health Sciences",
    description:
      "Study Public Health, Healthcare Management, Clinical Research, Nutrition Science, Pharmacy, and Medical Biotechnology in Germany. These programs prepare students for international healthcare careers with strong practical and research components.",
    image: "/programs/masters/HealthScience.png",
    imageAlt: "Medical & Health Sciences",
  },
  {
    title: "Agriculture, Food & Environmental Studies",
    description:
      "Explore master's programs in Sustainable Agriculture, Food Technology, Environmental Management, Forestry, Climate Studies, and Nutrition Science. Germany focuses heavily on sustainability, environmental innovation, and modern agricultural technologies.",
    image: "/programs/masters/env.png",
    imageAlt: "Agriculture, Food & Environmental Studies",
  },
  {
    title: "Social Sciences & Humanities",
    description:
      "Study advanced programs in Psychology, Sociology, International Relations, Political Science, Media Studies, and Cultural Studies. German universities offer internationally recognized education focused on research, society, and global development.",
    image: "/programs/masters/socialScience.png",
    imageAlt: "Social Sciences & Humanities",
  },
  {
    title: "Language, Culture & Education",
    description:
      "Pursue programs in Linguistics, German Studies, Cultural Studies, Translation Studies, Education, and International Teaching. Germany provides excellent academic environments for students interested in language, communication, and education careers.",
    image: "/programs/masters/Gemini_Generated_Image_87h93487h93487h9.png",
    imageAlt: "Language, Culture & Education",
  },
  {
    title: "Law & Public Administration",
    description:
      "Study International Law, European Law, Public Policy, Governance, Human Rights, and Public Administration. German universities offer high-quality legal education with strong international and European perspectives.",
    image: "/programs/masters/Law.png",
    imageAlt: "Law & Public Administration",
  },
];

function CardImage({ image, imageAlt }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-appleGray-100 sm:rounded-l-2xl ${IMAGE_ASPECT}`}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center transition-colors duration-300 group-hover:bg-sky-50"
          aria-label={`${imageAlt} — image placeholder`}
        >
          <FaImage
            className="h-10 w-10 text-appleGray-300 transition-colors duration-300 group-hover:text-sky-400"
            aria-hidden
          />
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-sky-900/0 transition-colors duration-300 group-hover:bg-sky-900/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end p-3 sm:p-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-sky-500 group-hover:shadow-lg sm:h-10 sm:w-10"
          aria-hidden
        >
          <FaGraduationCap className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 sm:h-4 sm:w-4" />
        </span>
      </div>
    </div>
  );
}

function CategoryCard({ title, description, image, imageAlt }) {
  return (
    <article className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-appleGray-200/80 bg-white shadow-soft card-apple-hover transition-colors duration-300 hover:border-sky-300">
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-sky-500 to-sky-600 transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden
      />
      <div className="flex h-full min-h-[200px] flex-col sm:flex-row">
        <div className="w-full shrink-0 sm:w-[42%] sm:max-w-[200px]">
          <CardImage image={image} imageAlt={imageAlt} />
        </div>
        <div className="relative flex flex-1 flex-col justify-center px-5 py-6 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold tracking-tight text-appleGray-900 transition-colors duration-300 group-hover:text-sky-600 lg:text-xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-appleGray-600 transition-colors duration-300 group-hover:text-appleGray-700">
            {description}
          </p>
          <div
            className="mt-4 h-0.5 w-12 origin-left scale-x-0 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 transition-transform duration-300 group-hover:scale-x-100"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

export default function MastersPage() {
  return (
    <div className="min-h-screen bg-appleGray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-appleGray-50 via-white to-appleGray-100 pt-24 pb-12 border-b border-appleGray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5" />
        <div
          className="absolute top-24 right-10 h-28 w-28 animate-float rounded-full bg-sky-400/10 pointer-events-none"
          style={{ animationDelay: "1s" }}
          aria-hidden
        />
        <div
          className="absolute bottom-6 left-10 h-20 w-20 animate-float rounded-2xl bg-sky-500/10 pointer-events-none"
          style={{ animationDelay: "2.5s" }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <FaGraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-appleGray-800 leading-tight">
            Master&apos;s Programs in{" "}
            <span className="text-gradient">Germany</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto my-6" />
          
        </div>
      </section>

      <section className="relative py-12 sm:py-16">
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(14 165 233 / 0.12) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.title} {...cat} />
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
}
