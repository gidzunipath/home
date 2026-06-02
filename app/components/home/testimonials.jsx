"use client";
import { useEffect, useState } from "react";
import {
  FaStar,
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaGraduationCap,
} from "react-icons/fa";
import Image from "next/image";
import { STUDENTS_COUNT } from "@/lib/marketing-stats";

// Default testimonials data
const defaultTestimonialsData = [
  {
    id: 5,
    text: "I applied for my visa through GIDZ UniPath, and their consultants made my journey to Germany seamless. The entire process was quick and efficient, allowing me to focus on my goals without unnecessary stress. They guided me through every step with exceptional support and expertise. I highly recommend GIDZ UniPath to anyone looking to start their journey abroad with confidence.",
    name: "Sri Skandarajah ",
    avatar: "/stu1.jpg",
    program: "Computer Science",
    university: "Technical University of Munich",
    rating: 5,
    location: "Munich, Germany",
  },
  {
    id: 6,
    text: "I had an excellent experience with GIDZ UniPath during my student visa process to Germany. They guided me step by step, starting from scratch, and made the entire process much smoother. GIDZ UniPath provided reliable support in preparing me for the requirements. Their expertise helped me navigate everything with confidence. If you're looking to study in Germany, I highly recommend GIDZ UniPath for their clear guidance and trustworthy assistance!",
    name: "Gracian Christ",
    avatar: "/stu2.jpg",
    program: "Business Administration",
    university: "University of Cologne",
    rating: 5,
    location: "Cologne, Germany",
  },
  {
    id: 1,
    text: "Thank you very much, GIDZ UniPath, for handling my student visa for a tuition-free public university in Germany. I received my visa in a week with their exceptional guidance and support.",
    name: "JK Jey Kison",
    avatar: null,
    program: "Engineering",
    university: "RWTH Aachen University",
    rating: 5,
    location: "Aachen, Germany",
  },
  {
    id: 2,
    text: "I appreciate their commitment and quick responses. They were always reachable and responded to us very calmly with German precision and professionalism.",
    name: "TP Tharani Paramasivam",
    avatar: null,
    program: "Medicine",
    university: "Charité - Universitätsmedizin Berlin",
    rating: 5,
    location: "Berlin, Germany",
  },
];

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [testimonialsData, setTestimonialsData] = useState(
    defaultTestimonialsData
  );

  // Fetch approved feedbacks and merge with default testimonials
  useEffect(() => {
    const fetchApprovedFeedbacks = async () => {
      try {
        const response = await fetch("/api/feedbacks?status=approved");
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          // Transform feedback data to testimonial format
          const feedbackTestimonials = result.data.map((feedback) => ({
            id: `feedback_${feedback.id}`,
            text: feedback.message,
            name: feedback.allow_display_name
              ? feedback.client_name
              : "Anonymous Student",
            avatar: null, // No avatars for feedbacks for now
            program: feedback.program_type || "Student",
            university: feedback.university || "Germany",
            rating: feedback.rating,
            location: feedback.university
              ? `${feedback.university}, Germany`
              : "Germany",
            isFromFeedback: true, // Flag to identify feedback-based testimonials
          }));

          // Combine default testimonials with feedback testimonials
          // Limit total to a reasonable number (e.g., 8-10)
          const combinedTestimonials = [
            ...defaultTestimonialsData,
            ...feedbackTestimonials.slice(0, 6), // Add up to 6 feedback testimonials
          ];

          setTestimonialsData(combinedTestimonials);
        }
      } catch (error) {
        console.error("Error fetching approved feedbacks:", error);
        // If error, fallback to default testimonials
        setTestimonialsData(defaultTestimonialsData);
      }
    };

    fetchApprovedFeedbacks();
  }, []);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };
  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonialsData.length]);

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-sky-400/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-appleGray-800 mb-6 leading-tight">
            Success Stories from <span className="text-gradient">Germany</span> 
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-400 mx-auto mb-6"></div>
          <p className="text-xl text-appleGray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from our students who achieved their German education dreams
            with our premium guidance
          </p>
        </div>

        {/* Testimonials Container */}
        <div className="relative">
          {/* Main Testimonial Card */}
          <div className="relative bg-appleGray-50 rounded-3xl p-8 lg:p-12 shadow-large border border-appleGray-200 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-german-red to-german-gold"></div>

            <div className="relative z-10">
              {/* Quote Icon */}{" "}
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mb-8 shadow-soft">
                <FaQuoteLeft className="w-8 h-8 text-white" />
              </div>
              {/* Testimonial Content */}
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                {/* Text Content */}
                <div className="lg:col-span-2">
                  {/* Stars */}
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(testimonialsData[activeIndex].rating)].map(
                      (_, i) => (
                        <FaStar key={i} className="w-5 h-5 text-sky-400" />
                      )
                    )}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-lg lg:text-xl text-appleGray-700 leading-relaxed mb-8 italic">
                    {testimonialsData[activeIndex].text}
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-german-red to-german-gold rounded-full flex items-center justify-center shadow-soft">
                      {testimonialsData[activeIndex].avatar ? (
                        <Image
                          src={testimonialsData[activeIndex].avatar}
                          alt={testimonialsData[activeIndex].name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-appleGray-800 text-lg">
                        {testimonialsData[activeIndex].name}
                      </div>
                      <div className="text-appleGray-600 text-sm">
                        {testimonialsData[activeIndex].program}
                      </div>
                      <div className="text-german-red font-semibold text-sm">
                        {testimonialsData[activeIndex].university}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Element */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-64 h-64 bg-gradient-to-br from-german-black via-german-red to-german-gold rounded-3xl shadow-large flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 text-center text-white">
                      <FaGraduationCap className="w-16 h-16 mx-auto mb-4 animate-float" />
                      <div className="font-bold text-lg">
                        {testimonialsData[activeIndex].location}
                      </div>
                      <div className="text-sm opacity-90">Living the Dream</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12">
            {/* Previous Button */}{" "}
            <button
              onClick={handlePrev}
              className="group w-12 h-12 bg-appleGray-100 hover:bg-sky-500 rounded-2xl flex items-center justify-center transition-all duration-300 btn-apple-hover"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <FaChevronLeft className="w-5 h-5 text-appleGray-600 group-hover:text-white transition-colors duration-300" />
            </button>
            {/* Dots Indicator */}
            <div className="flex space-x-3">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "bg-sky-500 shadow-soft"
                      : "bg-appleGray-300 hover:bg-appleGray-400"
                  }`}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                />
              ))}
            </div>
            {/* Next Button */}{" "}
            <button
              onClick={handleNext}
              className="group w-12 h-12 bg-appleGray-100 hover:bg-sky-500 rounded-2xl flex items-center justify-center transition-all duration-300 btn-apple-hover"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <FaChevronRight className="w-5 h-5 text-appleGray-600 group-hover:text-white transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: STUDENTS_COUNT, label: "Students Placed" },
            { value: "50+", label: "Partner Universities" },
            { value: "99%", label: "Visa Success Rate" },
            { value: "5★", label: "Average Rating" },
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="text-3xl lg:text-4xl font-bold text-german-red mb-2 group-hover:text-german-gold transition-colors duration-300">
                {stat.value}
              </div>{" "}
              <div className="text-appleGray-600 text-sm lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}{" "}
        </div>
      </div>
    </section>
  );
}
