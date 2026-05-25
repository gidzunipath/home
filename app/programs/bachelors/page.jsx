import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaGraduationCap, FaImage } from "react-icons/fa";

/** Portrait ratio for category images (1536 × 2752) */
const IMAGE_ASPECT = "aspect-[1536/2752]";

const CATEGORIES = [
  {
    title: "Engineering & Technology",
    description:
      "Study top engineering programs in Germany including Mechanical Engineering, Electrical Engineering, Civil Engineering, Automotive Engineering, Robotics, Mechatronics, Renewable Energy, and Industrial Engineering. Germany offers thousands of engineering-related bachelor's programs for international students with strong industry connections and practical learning opportunities.",
    image: "/programs/bachelors/engineering.png",
    imageAlt: "Engineering & Technology",
  },
  {
    title: "Computer Science & IT",
    description:
      "Explore bachelor's programs in Computer Science, Software Engineering, Artificial Intelligence, Data Science, Cybersecurity, Information Technology, and Business Informatics. Germany is one of Europe's leading destinations for tech education with a large number of English-taught IT programs for international students.",
    image: null,
    imageAlt: "Computer Science & IT",
  },
  {
    title: "Business, Management & Economics",
    description:
      "Choose from programs such as International Business, Business Administration, Finance, Marketing, Economics, Human Resource Management, and Entrepreneurship. German universities offer globally recognized business education with excellent career opportunities in international companies.",
    image: "/programs/bachelors/bussinessMangement.png",
    imageAlt: "Business, Management & Economics",
  },
  {
    title: "Natural Sciences & Mathematics",
    description:
      "Study subjects including Physics, Chemistry, Mathematics, Environmental Science, Statistics, and Materials Science. Germany provides research-focused bachelor's programs with advanced laboratories and strong academic foundations for future scientific careers.",
    image: "/programs/bachelors/naturalScienceAndMath.png",
    imageAlt: "Natural Sciences & Mathematics",
  },
  {
    title: "Biology, Chemistry & Life Sciences",
    description:
      "Discover programs in Biology, Biotechnology, Microbiology, Molecular Biology, Genetics, Biochemistry, and Biomedical Science. Germany is known for its innovation in life sciences and offers many practical and research-oriented study opportunities for international students.",
    image: null,
    imageAlt: "Biology, Chemistry & Life Sciences",
  },
  {
    title: "Agriculture, Forestry & Food Science",
    description:
      "Explore bachelor's programs in Agriculture Science, Forestry, Food Technology, Nutrition Science, Environmental Management, and Sustainable Agriculture. Germany offers modern education in sustainable farming, food production, and environmental protection.",
    image: "/programs/bachelors/agriculture.png",
    imageAlt: "Agriculture, Forestry & Food Science",
  },
  {
    title: "Social Sciences & Humanities",
    description:
      "Study Psychology, Sociology, Political Science, International Relations, Philosophy, Media Studies, and History at leading German universities. These programs help students build analytical, communication, and global understanding skills for international careers.",
    image: "/programs/bachelors/socialscience.png",
    imageAlt: "Social Sciences & Humanities",
  },
  {
    title: "Law & Public Administration",
    description:
      "Choose from programs in Law, European Studies, International Law, Public Administration, and Governance Studies. German universities provide strong legal and public policy education with international perspectives and modern academic environments.",
    image: "/programs/bachelors/law.png",
    imageAlt: "Law & Public Administration",
  },
  {
    title: "Hospitality, Tourism & Sports",
    description:
      "Study Hospitality Management, Tourism Management, Event Management, Sports Science, and International Hospitality Business. Germany offers practical and career-focused education in tourism, hotel management, and global hospitality industries.",
    image: null,
    imageAlt: "Hospitality, Tourism & Sports",
  },
];

function CardImage({ image, imageAlt }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-appleGray-100 ${IMAGE_ASPECT}`}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-900/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
    </div>
  );
}

function CategoryCard({ title, description, image, imageAlt }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-appleGray-200/80 bg-white shadow-soft card-apple-hover transition-colors duration-300 hover:border-sky-200">
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

export default function BachelorsPage() {
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
            Bachelor&apos;s Programs in{" "}
            <span className="text-gradient">Germany</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto my-6" />
          <p className="text-base sm:text-lg text-appleGray-600 max-w-2xl mx-auto leading-relaxed">
            Explore bachelor&apos;s degree fields offered at top German universities
            for international students.
          </p>
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
