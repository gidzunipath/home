"use client";

import Link from "next/link";
import {
  FaIdCard,
  FaCopy,
  FaComments,
  FaCheckCircle,
  FaLightbulb,
  FaUserPlus,
  FaExternalLinkAlt,
  FaLink,
} from "react-icons/fa";
import { useAppModal } from "../../../../../hooks/useAppModal";

export default function ProfileTab({ applicant, applicationId, onFeedbackOpen }) {
  const { showSuccess } = useAppModal();
  const referralCode =
    applicant?.referral_code ||
    applicationId?.slice(-8).toUpperCase() ||
    "GIDZ2024";

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      showSuccess("Referral code copied to clipboard!");
    });
  };

  const applyForFriendPath = `/apply-now/student?ref=${encodeURIComponent(referralCode)}`;

  const copyApplyLink = () => {
    const url = `${window.location.origin}${applyForFriendPath}`;
    navigator.clipboard.writeText(url).then(() => {
      showSuccess("Application link copied to clipboard!");
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Referral Code */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaIdCard className="w-5 h-5 text-sky-500 mr-3" />
          Referral Code
        </h3>
        <div className="bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto">
              <FaIdCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-appleGray-800 mb-2">
                Share Your Referral Code
              </h4>
              <p className="text-sm text-appleGray-600">
                Refer friends and family to earn rewards when they complete
                their application!
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-sky-300">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <span className="text-xs font-medium text-appleGray-600 uppercase tracking-wide">
                    Your Referral Code
                  </span>
                  <div className="text-2xl font-bold text-sky-600 font-mono tracking-wider">
                    {referralCode}
                  </div>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 whitespace-nowrap touch-manipulation min-h-[44px]"
                >
                  <FaCopy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-green-800 mb-1">
                    How it works:
                  </h6>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Share your referral code with friends</li>
                    <li>• They use it during their application</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply for a Friend */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaUserPlus className="w-5 h-5 text-violet-500 mr-3" />
          Apply for a Friend
        </h3>
        <div className="bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200 rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto">
              <FaUserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-appleGray-800 mb-2">
                Help a Friend Start Their Journey
              </h4>
              <p className="text-sm text-appleGray-600">
              Fill out this application for your friends at Gidz Uni Path using your referral code and earn €100 once their visa is successfully approved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={applyForFriendPath}
                className="flex items-center justify-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-soft hover:shadow-medium touch-manipulation min-h-[48px]"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                <span>Open Application Form</span>
              </Link>
              <button
                type="button"
                onClick={copyApplyLink}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-violet-50 text-violet-600 border border-violet-300 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 touch-manipulation min-h-[48px]"
              >
                <FaLink className="w-4 h-4" />
                <span>Copy Application Link</span>
              </button>
            </div>

            
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaComments className="w-5 h-5 text-sky-500 mr-3" />
          Share Your Experience
        </h3>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
              <FaComments className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-appleGray-800 mb-2">
                Help Others with Your Journey
              </h4>
              <p className="text-sm text-appleGray-600">
                Share your experience with GIDZ UniPath to help future
                students. Your feedback might be featured in our testimonials!
              </p>
            </div>

            <button
              onClick={onFeedbackOpen}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 inline-flex items-center space-x-2 shadow-soft hover:shadow-medium touch-manipulation min-h-[48px] w-full sm:w-auto justify-center"
            >
              <FaComments className="w-5 h-5" />
              <span>Write Feedback</span>
            </button>

            <div className="bg-white rounded-2xl p-4 border border-orange-200 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaLightbulb className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-orange-800 mb-1">
                    Your feedback helps us:
                  </h6>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Improve our services for future students</li>
                    <li>• Build trust with prospective applicants</li>
                    <li>• Showcase success stories from Germany</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
