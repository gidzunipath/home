import React, { useState, useEffect, useCallback } from "react";
import {
  FaUserFriends,
  FaCheckCircle,
  FaStar,
  FaGlobe,
} from "react-icons/fa";

const SmartRecommendations = ({
  applicantData,
  applicationId,
  dashboardStats,
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch checklist items from the API
      const response = await fetch("/api/gidz-buddy-checklist");
      const result = await response.json();

      if (result.success && result.data) {
        setRecommendations(result.data);
      } else {
        console.error("Failed to fetch checklist:", result.error);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
      setRecommendations([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleWatchVideo = (youtubeLink) => {
    if (youtubeLink) {
      window.open(youtubeLink, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 sm:h-36 bg-gray-200 rounded-xl sm:rounded-2xl"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
            <FaUserFriends className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-appleGray-800">
            Gidz Buddy Checklist
          </h3>
        </div>
        <span className="text-sm text-appleGray-600 sm:ml-auto">
          Essential steps for your journey
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl sm:rounded-3xl border border-green-200 mx-4 sm:mx-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-2 px-4">
            Checklist Complete!
          </h4>
          <p className="text-sm sm:text-base text-green-600 px-4">
            You&apos;ve completed all essential steps. Great job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 hover:shadow-medium bg-white border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-sky-500 flex-shrink-0">
                  <FaCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-appleGray-800 break-words mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-appleGray-600 break-words">
                    {rec.description}
                  </p>
                </div>
              </div>

              {rec.youtube_link && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleWatchVideo(rec.youtube_link)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaGlobe className="w-3 h-3" />
                    <span>Visit</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
