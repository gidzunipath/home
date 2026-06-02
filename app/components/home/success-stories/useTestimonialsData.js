"use client";

import { useEffect, useState } from "react";

export const TESTIMONIAL_LOGO_PLACEHOLDER = "/gidz-transperant.png";

export const defaultTestimonialsData = [
  {
    id: 5,
    text: "I applied for my visa through GIDZ UniPath, and their consultants made my journey to Germany seamless. The entire process was quick and efficient, allowing me to focus on my goals without unnecessary stress.",
    name: "Sri Skandarajah Dilrukshan",
    avatar: "/stu1.jpg",
    program: "Computer Science",
    university: "Technical University of Munich",
    rating: 5,
    location: "Munich, Germany",
    image: "/stu1.jpg",
  },
  {
    id: 6,
    text: "I had an excellent experience with GIDZ UniPath during my student visa process to Germany. They guided me step by step, starting from scratch, and made the entire process much smoother.",
    name: "Gracian Christ",
    avatar: "/stu2.jpg",
    program: "Business Administration",
    university: "University of Cologne",
    rating: 5,
    location: "Cologne, Germany",
    image: "/stu2.jpg",
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
    image: null,
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
    image: null,
  },
];

function enrichTestimonial(item) {
  const hasPhoto = Boolean(item.image || item.avatar);

  return {
    ...item,
    image: item.image || item.avatar || TESTIMONIAL_LOGO_PLACEHOLDER,
    isPlaceholder: !hasPhoto,
  };
}

function mapFeedbackToTestimonial(feedback) {
  return {
    id: `feedback_${feedback.id}`,
    text: feedback.message,
    name: feedback.allow_display_name
      ? feedback.client_name
      : "Anonymous Student",
    avatar: feedback.image_url || null,
    program: feedback.program_type || "Student",
    university: feedback.university || "Germany",
    rating: feedback.rating,
    location: feedback.university
      ? `${feedback.university}, Germany`
      : "Germany",
    image: feedback.image_url || null,
    isFromFeedback: true,
  };
}

const LAST_FIRST_STORY_KEY = "gidz-success-stories-first-id";

function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Random order; avoid repeating the same story as first on back-to-back visits. */
function shuffleWithVariedFirst(stories) {
  if (stories.length <= 1) return stories;

  let shuffled = shuffleArray(stories);

  try {
    const lastFirstId = sessionStorage.getItem(LAST_FIRST_STORY_KEY);
    if (lastFirstId) {
      let attempts = 0;
      while (String(shuffled[0]?.id) === lastFirstId && attempts < 12) {
        shuffled = shuffleArray(stories);
        attempts++;
      }
    }
    if (shuffled[0]?.id != null) {
      sessionStorage.setItem(LAST_FIRST_STORY_KEY, String(shuffled[0].id));
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.)
  }

  return shuffled;
}

export function useTestimonialsData() {
  const [testimonialsData, setTestimonialsData] = useState(
    defaultTestimonialsData.map(enrichTestimonial)
  );

  useEffect(() => {
    let cancelled = false;

    const applyStories = (items) => {
      if (cancelled) return;
      setTestimonialsData(
        shuffleWithVariedFirst(items.map(enrichTestimonial))
      );
    };

    const fetchApprovedFeedbacks = async () => {
      try {
        const response = await fetch("/api/feedbacks?status=approved");
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const feedbackTestimonials = result.data.map(mapFeedbackToTestimonial);
          applyStories([...defaultTestimonialsData, ...feedbackTestimonials]);
          return;
        }
      } catch (error) {
        console.error("Error fetching approved feedbacks:", error);
      }

      applyStories(defaultTestimonialsData);
    };

    fetchApprovedFeedbacks();

    return () => {
      cancelled = true;
    };
  }, []);

  return testimonialsData;
}
