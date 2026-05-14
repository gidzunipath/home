"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaPassport,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaCreditCard,
  FaUniversity,
  FaUpload,
  FaComments,
  FaCheckCircle,
  FaTimes,
  FaUserGraduate,
  FaExclamationTriangle,
  FaTasks,
  FaLifeRing,
  FaChartLine,
  FaClock,
  FaSearch,
  FaUserEdit, // Add logout icon
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaBook,
  FaCertificate,
  FaIdCard,
  FaCopy,
  FaQuestionCircle,
  FaLightbulb,
  FaGlobe,
} from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthSystem, AUTH_TYPES } from "../../../hooks/useAuthSystem";
import Universities from "./components/Universities";
import DocumentsToDownload from "./components/DocumentsToDownload";
import DocumentsToUpload from "./components/DocumentsToUpload";
import VerticalStepper from "./components/VerticalStepper";
import ApplicationOptions from "./components/ApplicationOptions";
import Message from "./components/Message";
import AppointmentModal from "./components/AppointmentModal";
import NotificationSystem from "./components/NotificationSystem";
import TimelineView from "./components/TimelineView";
import SmartRecommendations from "./components/SmartRecommendations";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import FeedbackDialog from "./components/FeedbackDialog";
import Image from "next/image";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

/** Tab ids accepted in `?tab=` so refresh and shared links restore the same view. */
const VALID_CLIENT_TAB_IDS = new Set([
  "overview",
  "documents",
  "universities",
  "tasks",
  "support",
  "profile",
  "german-life",
  "timeline",
]);

const ApplicantDetail = () => {
  const [applicant, setApplicant] = useState(null);
  const [id, setId] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCreateApointemen, setShowCreateApointement] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);

  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 200,
    height: 200,
    x: 50,
    y: 50,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [dashboardStats, setDashboardStats] = useState({
    progressPercentage: 0,
    universityDocumentsUploaded: 0,
    universityDocumentsTotal: 10,
    visaDocumentsUploaded: 0,
    visaDocumentsTotal: 8,
    universitiesApplied: 0,
    nextDeadline: null,
  });

  const [visaStepsStatus, setVisaStepsStatus] = useState([]);

  // Define visa steps with their mapping to database options
  const getVisaSteps = () => [
    {
      step: 1,
      title: "Application Document",
      description: "Complete and submit your visa application documents",
      dbOptionName: "Application Document",
      icon: FaFileAlt,
    },
    {
      step: 2,
      title: "Document Submitted on waiting list",
      description: "Your documents are submitted and in the processing queue",
      dbOptionName: "Submit Documents",
      icon: FaClock,
    },
    {
      step: 3,
      title: "Under Preliminary Review",
      description:
        "Embassy is conducting preliminary review of your application",
      dbOptionName: "Client Review",
      icon: FaSearch,
    },
    {
      step: 4,
      title: "Interview Preparation",
      description: "Prepare for your visa interview if required",
      dbOptionName: "Interview Preparation",
      icon: FaComments,
    },
    {
      step: 5,
      title: "Appointment Date",
      description: "Schedule and attend your visa appointment",
      dbOptionName: "Appointment Date",
      icon: FaCalendarAlt,
    },
  ];

  // Function to fetch visa steps status from database
  const fetchVisaStepsStatus = useCallback(async (applicationId) => {
    try {
      // Check if applicationId is valid
      if (!applicationId) {
        console.warn("No applicationId provided to fetchVisaStepsStatus");
        return [];
      }

      console.log(
        "Starting fetchVisaStepsStatus for applicationId:",
        applicationId
      );

      const steps = getVisaSteps();
      console.log(
        "Visa steps to check:",
        steps.map((s) => s.dbOptionName)
      );

      const stepsWithStatus = await Promise.all(
        steps.map(async (step) => {
          try {
            console.log(`Querying database for step: ${step.dbOptionName}`);

            const { data, error } = await supabase
              .from("options")
              .select("option")
              .eq("application_id", applicationId)
              .eq("name", step.dbOptionName);

            if (error) {
              console.error(`Error fetching status for ${step.dbOptionName}:`, {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error,
              });
              return { ...step, status: "pending" };
            }

            console.log(`Fetched status for ${step.dbOptionName}:`, data);

            // If the option exists in database, it's completed
            const status =
              data && data.length > 0 && data[0].option
                ? "completed"
                : "pending";
            return { ...step, status };
          } catch (stepError) {
            console.error(
              `Exception while fetching status for ${step.dbOptionName}:`,
              {
                message: stepError.message,
                stack: stepError.stack,
                fullError: stepError,
              }
            );
            return { ...step, status: "pending" };
          }
        })
      );

      console.log("All steps processed:", stepsWithStatus);

      // Determine current step: first step that is not completed
      let currentStepFound = false;
      const finalSteps = stepsWithStatus.map((step) => {
        if (step.status === "pending" && !currentStepFound) {
          currentStepFound = true;
          return { ...step, status: "current" };
        }
        return step;
      });

      // If all steps are completed, make the last step current (for any final actions)
      if (!currentStepFound) {
        const lastIndex = finalSteps.length - 1;
        if (lastIndex >= 0) {
          finalSteps[lastIndex] = {
            ...finalSteps[lastIndex],
            status: "current",
          };
        }
      }

      console.log("Final steps with status:", finalSteps);
      setVisaStepsStatus(finalSteps);
      return finalSteps;
    } catch (error) {
      console.error("Error fetching visa steps status:", {
        message: error.message,
        stack: error.stack,
        fullError: error,
      });
      // Set default visa steps with pending status on error
      const steps = getVisaSteps();
      const defaultSteps = steps.map((step, index) => ({
        ...step,
        status: index === 0 ? "current" : "pending",
      }));
      setVisaStepsStatus(defaultSteps);
      return defaultSteps;
    }
  }, []); // Empty dependency array since the function doesn't depend on any external variables

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToTab = useCallback(
    (tabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const tabFromUrl = searchParams.get("tab");
  useEffect(() => {
    if (tabFromUrl && VALID_CLIENT_TAB_IDS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("overview");
    }
  }, [tabFromUrl]);

  const {
    type: authType,
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuthSystem();
  // Authentication check - ensure user can only access their own data
  useEffect(() => {
    console.log("Client portal auth check:", {
      authLoading,
      isAuthenticated,
      authType,
      user,
    });

    if (!authLoading) {
      const urlId = window.location.pathname.split("/").pop();
      console.log("URL ID:", urlId, "User ID:", user?.id);

      if (!isAuthenticated || authType !== AUTH_TYPES.CLIENT) {
        console.log("Not authenticated or wrong type, redirecting to login");
        router.push("/login");
        return;
      }

      if (user?.id !== urlId) {
        console.log("User ID mismatch, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("Authentication check passed, setting ID");
      setId(urlId);
    }
  }, [authLoading, isAuthenticated, authType, user, router]);

  const calculateDashboardStats = useCallback(
    async (applicantData) => {
      try {
        // Get universities data
        const { data: universities, error: uniError } = await supabase
          .from("universities")
          .select("*")
          .eq("application_id", id);

        if (uniError) console.error("Error fetching universities:", uniError);

        // Calculate progress based on current status
        const statusToProgress = {
          1: 16.67, // Step 1: University Documents
          2: 33.33, // Step 2: University
          3: 50, // Step 3: Visa Documents
          4: 66.67, // Step 4: Visa
          5: 83.33, // Step 5: Visa Appointment
          6: 100, // Step 6: Successful
        };

        const currentStep = applicantData.status?.slice(-1) || "1";
        const progressPercentage = statusToProgress[currentStep] || 0;

        // Calculate document statistics using the type column
        const documents = applicantData.documents || [];

        // Count university documents that have URLs (uploaded)
        const universityDocumentsUploaded = documents.filter(
          (doc) => doc.type === "university" && doc.url && doc.url.trim() !== ""
        ).length;

        // Count visa documents that have URLs (uploaded)
        const visaDocumentsUploaded = documents.filter(
          (doc) => doc.type === "visa" && doc.url && doc.url.trim() !== ""
        ).length;

        // Count total documents by type (including those without URLs)
        const universityDocumentsTotal = documents.filter(
          (doc) => doc.type === "university"
        ).length;

        const visaDocumentsTotal = documents.filter(
          (doc) => doc.type === "visa"
        ).length;

        // Calculate next deadline (mock for now - you can enhance this with real deadlines)
        const nextDeadline =
          universities && universities.length > 0
            ? universities[0].deadline
            : null;

        // Set default totals if no documents exist yet
        const finalUniversityTotal =
          universityDocumentsTotal > 0 ? universityDocumentsTotal : 0;
        const finalVisaTotal = visaDocumentsTotal > 0 ? visaDocumentsTotal : 0;

        setDashboardStats({
          progressPercentage,
          universityDocumentsUploaded,
          universityDocumentsTotal: finalUniversityTotal,
          visaDocumentsUploaded,
          visaDocumentsTotal: finalVisaTotal,
          universitiesApplied: universities?.length || 0,
          nextDeadline,
        });
      } catch (error) {
        console.error("Error calculating dashboard stats:", error);
      }
    },
    [id]
  );

  const fetchApplicant = useCallback(
    async (applicantId) => {
      try {
        // Validate applicantId
        if (!applicantId) {
          console.warn("No applicantId provided to fetchApplicant");
          return;
        }

        const { data, error } = await supabase
          .from("applications")
          .select("*, documents(*)")
          .eq("id", applicantId)
          .single();

        if (error) throw error;
        if (data) {
          setApplicant(data);

          // Find and set profile picture if available
          const profileDoc = data.documents?.find(
            (doc) => doc.name === "Profile Picture"
          );
          if (profileDoc) {
            setProfilePicUrl(profileDoc.url);
          } // Calculate dashboard statistics
          calculateDashboardStats(data);

          // Fetch visa steps status from database
          try {
            await fetchVisaStepsStatus(applicantId);
          } catch (visaStepsError) {
            console.error(
              "Error fetching visa steps:",
              visaStepsError.message || visaStepsError
            );
          }

          // Generate notifications based on application status
          try {
            generateNotifications(data);
          } catch (notificationError) {
            console.error(
              "Error generating notifications:",
              notificationError.message || notificationError
            );
          }
        }
      } catch (error) {
        console.error("Error fetching applicant:", error.message || error);
      }
    },
    [calculateDashboardStats, fetchVisaStepsStatus]
  );

  useEffect(() => {
    if (id) {
      fetchApplicant(id);
    }
  }, [id, fetchApplicant]);

  // Reset crop state when modal opens
  useEffect(() => {
    if (showCropModal && selectedImage) {
      console.log("Crop modal opened, initializing crop state");
      setCrop({
        unit: "px",
        width: 200,
        height: 200,
        x: 50,
        y: 50,
      });
      setCompletedCrop(null);
    }
  }, [showCropModal, selectedImage]);

  const generateNotifications = (applicantData) => {
    const newNotifications = [];
    const now = Date.now();

    // Check for urgent payments
    if (!applicantData.payment1) {
      newNotifications.push({
        id: `payment1-${now}`,
        type: "warning",
        title: "Payment Required",
        message: "Payment 1 is still pending. Please complete to proceed.",
        timestamp: now,
      });
    }

    if (!applicantData.payment2) {
      newNotifications.push({
        id: `payment2-${now}`,
        type: "warning",
        title: "Payment Required",
        message: "Payment 2 is still pending. Please complete to proceed.",
        timestamp: now,
      });
    }

    // Check document status using type column
    const documents = applicantData.documents || [];
    const uploadedDocuments = documents.filter(
      (doc) => doc.url && doc.url.trim() !== ""
    );

    if (uploadedDocuments.length < 5) {
      newNotifications.push({
        id: `documents-${now}`,
        type: "info",
        title: "Documents Needed",
        message: `You have uploaded ${uploadedDocuments.length} documents. Upload more to complete your application.`,
        timestamp: now,
      });
    }

    // Progress milestone notifications
    const currentStep = parseInt(applicantData.status?.slice(-1)) || 1;
    if (currentStep >= 2) {
      newNotifications.push({
        id: `progress-${now}`,
        type: "success",
        title: "Great Progress!",
        message: `You've completed step ${
          currentStep - 1
        } of your application journey.`,
        timestamp: now,
      });
    }

    setNotifications(newNotifications);
  };
  const dismissNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = ""; // Clear the input
      return;
    }

    console.log("Image selected:", file.name);

    // Create a URL for the selected file and show cropping modal
    const reader = new FileReader();
    reader.onload = () => {
      console.log("Image loaded for cropping");
      setSelectedImage({
        file: file,
        url: reader.result,
        name: file.name,
      });
      setShowCropModal(true);
    };
    reader.onerror = () => {
      console.error("Failed to read image file");
      alert("Failed to read the image file. Please try again.");
      e.target.value = ""; // Clear the input
    };
    reader.readAsDataURL(file);

    // Clear the input value so the same file can be selected again if needed
    e.target.value = "";
  };

  // Function to create a cropped image blob
  const getCroppedImg = (image, crop) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  // Function to handle cropped image upload
  const handleCroppedUpload = async () => {
    console.log("Upload attempted", {
      completedCrop,
      hasImgRef: !!imgRef.current,
      selectedImage: !!selectedImage,
    });

    if (!completedCrop || !imgRef.current || !selectedImage) {
      console.log("Upload blocked - missing requirements");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log("Starting crop and upload process");
      // Get the cropped image blob
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );

      // Create a file from the blob
      const croppedFile = new File(
        [croppedImageBlob],
        `cropped-${selectedImage.name}`,
        { type: "image/jpeg" }
      );

      const filePath = `profile/${id}-${Date.now()}-${croppedFile.name}`;

      // Upload the cropped file with a progress callback
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, croppedFile, {
          cacheControl: "3600",
          upsert: true,
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data: imageDetails } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      if (imageDetails.publicUrl) {
        setProfilePicUrl(imageDetails.publicUrl);
      }

      // Check if a profile picture already exists for this application
      const { data: existingPic, error: checkError } = await supabase
        .from("documents")
        .select("id")
        .eq("application_id", id)
        .eq("name", "Profile Picture")
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // Error other than "not found"
        throw checkError;
      }

      if (existingPic) {
        // Update existing profile picture record
        const { error: docUpdateError } = await supabase
          .from("documents")
          .update({
            url: imageDetails.publicUrl,
            upload_by: "Client",
          })
          .eq("id", existingPic.id);

        if (docUpdateError) throw docUpdateError;
      } else {
        // Insert new profile picture record
        const { error: docInsertError } = await supabase
          .from("documents")
          .insert([
            {
              application_id: id,
              name: "Profile Picture",
              upload_by: "Client",
              url: imageDetails.publicUrl,
            },
          ]);

        if (docInsertError) throw docInsertError;
      }

      // Close modal and reset states
      setShowCropModal(false);
      setSelectedImage(null);
      setUploading(false);
      setProgress(0);
      setCompletedCrop(null);
      setCrop();
      // Note: No need to reset imgRef as it's now a useRef
    } catch (error) {
      console.error("Error uploading cropped profile picture:", error);
      alert("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };

  // Function to cancel cropping
  const handleCropCancel = () => {
    console.log("Crop cancelled");
    setShowCropModal(false);
    setSelectedImage(null);
    setCompletedCrop(null);
    setCrop({
      unit: "px",
      width: 200,
      height: 200,
      x: 50,
      y: 50,
    });
    // Clear any file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => (input.value = ""));
  };
  // Define the Modal component inside the same file.
  const Modal = ({ children, onClose }) => {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        onClick={(e) => {
          // Only close if clicking the backdrop, not the modal content
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-large border border-appleGray-200 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200 touch-manipulation"
          >
            <FaTimes className="w-4 h-4" />
          </button>
          {children}
        </div>
      </div>
    );
  };
  // Show loading or redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold text-appleGray-800">
            Authenticating...
          </h2>
          <p className="text-appleGray-600">
            Please wait while we verify your access
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <FaUserGraduate className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-semibold text-appleGray-800">
            Loading your portal...
          </h2>
          <p className="text-appleGray-600">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 relative overflow-hidden pt-16 sm:pt-20">
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5"></div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sky-400/10 rounded-full animate-float"></div>
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-sky-500/20 rounded-2xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-40 left-20 w-20 h-20 bg-sky-600/15 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-60 right-40 w-16 h-16 bg-sky-400/25 rounded-full animate-float"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          <div className="relative">
            {" "}
            {/* Logout Button */}
            {/* <div className="absolute top-0 right-0 z-10">
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-appleGray-300 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 hover:border-red-300 group"
              >
                <FaSignOutAlt className="w-4 h-4 text-appleGray-600 group-hover:text-red-600 transition-colors duration-300" />
                <span className="text-sm font-medium text-appleGray-700 group-hover:text-red-600 transition-colors duration-300">
                  Logout
                </span>
              </button>
            </div> */}
            <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up">
              {/* Student Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-soft">
                <FaUserGraduate className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-appleGray-800 mb-2 px-4">
                  Student Portal
                </h1>
                <p className="text-lg sm:text-xl text-appleGray-600 px-4">
                  Welcome back, {applicant.first_name} {applicant.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Overview */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          {" "}
          {/* Progress Banner */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white shadow-large progress-banner">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                  Your Journey Progress
                </h2>
                <p className="text-sm sm:text-base text-sky-100">
                  {dashboardStats.progressPercentage}% Complete
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold stats-counter">
                  {dashboardStats.progressPercentage}%
                </div>
                <div className="text-xs sm:text-sm text-sky-100">Complete</div>
              </div>
            </div>
            <div className="w-full bg-sky-400/30 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
              <div
                className="bg-white h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out progress-bar-animated"
                style={{
                  width: `${dashboardStats.progressPercentage}%`,
                  "--progress-width": `${dashboardStats.progressPercentage}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-sky-100">
              <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span>
                Next:{" "}
                {dashboardStats.progressPercentage < 20
                  ? "Upload university documents"
                  : dashboardStats.progressPercentage < 40
                  ? "Apply to universities"
                  : dashboardStats.progressPercentage < 60
                  ? "Upload visa documents"
                  : dashboardStats.progressPercentage < 80
                  ? "Complete visa application"
                  : dashboardStats.progressPercentage < 100
                  ? "Schedule visa appointment"
                  : "Journey complete!"}
              </span>
            </div>
          </div>{" "}
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 quick-stats-grid">
            {/* University Documents Status */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 dashboard-card">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FaUniversity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    dashboardStats.universityDocumentsUploaded >=
                    Math.floor(dashboardStats.universityDocumentsTotal * 0.8)
                      ? "bg-green-100 text-green-700"
                      : dashboardStats.universityDocumentsUploaded >=
                        Math.floor(
                          dashboardStats.universityDocumentsTotal * 0.5
                        )
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {dashboardStats.universityDocumentsUploaded >=
                  Math.floor(dashboardStats.universityDocumentsTotal * 0.8)
                    ? "On Track"
                    : dashboardStats.universityDocumentsUploaded >=
                      Math.floor(dashboardStats.universityDocumentsTotal * 0.5)
                    ? "In Progress"
                    : "Action Needed"}
                </span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-appleGray-800 mb-1 stats-counter">
                {dashboardStats.universityDocumentsUploaded}/
                {dashboardStats.universityDocumentsTotal}
              </div>
              <div className="text-xs sm:text-sm text-appleGray-600">
                University Documents
              </div>
            </div>

            {/* Visa Documents Status */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 dashboard-card">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FaPassport className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    dashboardStats.visaDocumentsUploaded >=
                    Math.floor(dashboardStats.visaDocumentsTotal * 0.75)
                      ? "bg-green-100 text-green-700"
                      : dashboardStats.visaDocumentsUploaded >=
                        Math.floor(dashboardStats.visaDocumentsTotal * 0.4)
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {dashboardStats.visaDocumentsUploaded >=
                  Math.floor(dashboardStats.visaDocumentsTotal * 0.75)
                    ? "On Track"
                    : dashboardStats.visaDocumentsUploaded >=
                      Math.floor(dashboardStats.visaDocumentsTotal * 0.4)
                    ? "In Progress"
                    : "Action Needed"}
                </span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-appleGray-800 mb-1 stats-counter">
                {dashboardStats.visaDocumentsUploaded}/
                {dashboardStats.visaDocumentsTotal}
              </div>
              <div className="text-xs sm:text-sm text-appleGray-600">
                Visa Documents
              </div>
            </div>

            {/* Universities Applied */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 dashboard-card">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FaGraduationCap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    dashboardStats.universitiesApplied > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {dashboardStats.universitiesApplied > 0
                    ? "Applied"
                    : "Pending"}
                </span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-appleGray-800 mb-1 stats-counter">
                {dashboardStats.universitiesApplied}
              </div>
              <div className="text-xs sm:text-sm text-appleGray-600">
                Universities Applied
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 dashboard-card">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FaCreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    applicant?.payment1 && applicant?.payment2
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {applicant?.payment1 && applicant?.payment2
                    ? "Complete"
                    : "Pending"}
                </span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-appleGray-800 mb-1 stats-counter">
                {(applicant?.payment1 ? 1 : 0) + (applicant?.payment2 ? 1 : 0)}
                /2
              </div>
              <div className="text-xs sm:text-sm text-appleGray-600">
                Payments Complete
              </div>
            </div>
          </div>{" "}
          {/* Critical Alerts */}
          {(dashboardStats.visaDocumentsUploaded <
            Math.floor(dashboardStats.visaDocumentsTotal * 0.4) ||
            dashboardStats.universityDocumentsUploaded <
              Math.floor(dashboardStats.universityDocumentsTotal * 0.5) ||
            !applicant?.payment1 ||
            !applicant?.payment2) && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
                    Action Required
                  </h3>
                  <div className="space-y-2">
                    {!applicant?.payment1 && (
                      <div className="flex items-center text-xs sm:text-sm text-red-700">
                        <FaCreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span>Complete Payment 1</span>
                      </div>
                    )}
                    {!applicant?.payment2 && (
                      <div className="flex items-center text-xs sm:text-sm text-red-700">
                        <FaCreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span>Complete Payment 2</span>
                      </div>
                    )}
                    {dashboardStats.visaDocumentsUploaded <
                      Math.floor(dashboardStats.visaDocumentsTotal * 0.4) && (
                      <div className="flex items-center text-xs sm:text-sm text-red-700">
                        <FaPassport className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span>
                          Upload more visa documents (
                          {dashboardStats.visaDocumentsUploaded}/
                          {dashboardStats.visaDocumentsTotal})
                        </span>
                      </div>
                    )}
                    {dashboardStats.universityDocumentsUploaded <
                      Math.floor(
                        dashboardStats.universityDocumentsTotal * 0.5
                      ) && (
                      <div className="flex items-center text-xs sm:text-sm text-red-700">
                        <FaUniversity className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span>
                          Upload more university documents (
                          {dashboardStats.universityDocumentsUploaded}/
                          {dashboardStats.universityDocumentsTotal})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-appleGray-800 mb-3 sm:mb-4 px-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 dashboard-grid">
            <button
              onClick={() => setShowMessageModal(true)}
              className="group bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 hover:shadow-medium transition-all duration-300 card-apple-hover relative dashboard-card min-h-[80px] sm:min-h-[auto]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-sky-200 transition-colors duration-300 flex-shrink-0">
                  <FaComments className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-appleGray-800 truncate">
                    Messages
                  </h4>
                  <p className="text-xs sm:text-sm text-appleGray-600 truncate">
                    Chat with counselor
                  </p>
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-3 h-3 bg-green-500 rounded-full"></div>
            </button>

            <button
              onClick={() => setShowCreateApointement(true)}
              className="group bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 hover:shadow-medium transition-all duration-300 card-apple-hover relative dashboard-card min-h-[80px] sm:min-h-[auto]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300 flex-shrink-0">
                  <FaCalendarAlt className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-appleGray-800 truncate">
                    Appointments
                  </h4>
                  <p className="text-xs sm:text-sm text-appleGray-600 truncate">
                    Schedule meeting
                  </p>
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-3 h-3 bg-yellow-500 rounded-full"></div>
            </button>
          </div>
        </div>
        {/* Tabbed Navigation */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-200 overflow-hidden">
            {" "}
            {/* Tab Headers */}
            <div className="border-b border-appleGray-200">
              {/* Mobile Tab Headers - Grid Layout */}
              <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2 md:hidden">
                {[
                  { id: "overview", label: "Overview", icon: FaChartLine },
                  // { id: "timeline", label: "Timeline", icon: FaCalendarAlt },
                  { id: "support", label: "Support", icon: FaLifeRing },
                  { id: "documents", label: "Documents", icon: FaFileAlt },
                  {
                    id: "universities",
                    label: "Universities",
                    icon: FaUniversity,
                  },
                  { id: "tasks", label: "Visa", icon: FaPassport },
                  { id: "profile", label: "Profile", icon: FaUserEdit },
                  {
                    id: "german-life",
                    label: "German life",
                    icon: FaGlobe,
                  },
                ].map((tab) => {
                  const isVisaTabLocked =
                    tab.id === "tasks" && applicant?.lock_1;

                  return (
                    <button
                      key={`mobile-${tab.id}`}
                      onClick={() => {
                        if (!isVisaTabLocked) {
                          navigateToTab(tab.id);
                        }
                      }}
                      disabled={isVisaTabLocked}
                      className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl text-xs font-medium transition-all duration-200 touch-manipulation ${
                        isVisaTabLocked
                          ? "text-appleGray-400 cursor-not-allowed opacity-50 bg-appleGray-50"
                          : activeTab === tab.id
                          ? "text-sky-600 bg-sky-100 border border-sky-200"
                          : "text-appleGray-600 hover:text-appleGray-800 hover:bg-appleGray-50 cursor-pointer"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                      <span className="text-center leading-tight text-xs">
                        {tab.label}
                      </span>
                      {/* Mobile Tab badges */}
                      {tab.id === "tasks" &&
                        (dashboardStats.visaDocumentsUploaded <
                          Math.floor(dashboardStats.visaDocumentsTotal * 0.4) ||
                          !applicant?.payment1 ||
                          !applicant?.payment2) && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            !
                          </span>
                        )}
                      {tab.id === "documents" &&
                        (dashboardStats.universityDocumentsUploaded <
                          Math.floor(
                            dashboardStats.universityDocumentsTotal * 0.5
                          ) ||
                          dashboardStats.visaDocumentsUploaded <
                            Math.floor(
                              dashboardStats.visaDocumentsTotal * 0.4
                            )) && (
                          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            !
                          </span>
                        )}
                    </button>
                  );
                })}
              </nav>

              {/* Desktop Tab Headers - Horizontal Layout */}
              <nav className="hidden md:flex overflow-x-auto tab-navigation">
                {[
                  { id: "overview", label: "Overview", icon: FaChartLine },
                  // { id: "timeline", label: "Timeline", icon: FaCalendarAlt },
                  { id: "documents", label: "Documents", icon: FaFileAlt },
                  {
                    id: "universities",
                    label: "Universities",
                    icon: FaUniversity,
                  },
                  { id: "tasks", label: "Visa", icon: FaPassport },
                  { id: "support", label: "Support", icon: FaLifeRing },
                  {
                    id: "german-life",
                    label: "German life",
                    icon: FaGlobe,
                  },
                  { id: "profile", label: "Profile", icon: FaUserEdit },
                ].map((tab) => {
                  const isVisaTabLocked =
                    tab.id === "tasks" && applicant?.lock_1;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (!isVisaTabLocked) {
                          navigateToTab(tab.id);
                        }
                      }}
                      disabled={isVisaTabLocked}
                      className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap touch-manipulation ${
                        isVisaTabLocked
                          ? "border-transparent text-appleGray-400 cursor-not-allowed opacity-50"
                          : activeTab === tab.id
                          ? "border-sky-500 text-sky-600 bg-sky-50"
                          : "border-transparent text-appleGray-600 hover:text-appleGray-800 hover:border-appleGray-300 cursor-pointer"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {/* Desktop Tab badges */}
                      {tab.id === "tasks" &&
                        (dashboardStats.visaDocumentsUploaded <
                          Math.floor(dashboardStats.visaDocumentsTotal * 0.4) ||
                          !applicant?.payment1 ||
                          !applicant?.payment2) && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center tab-badge-urgent">
                            !
                          </span>
                        )}
                      {tab.id === "documents" &&
                        (dashboardStats.universityDocumentsUploaded <
                          Math.floor(
                            dashboardStats.universityDocumentsTotal * 0.5
                          ) ||
                          dashboardStats.visaDocumentsUploaded <
                            Math.floor(
                              dashboardStats.visaDocumentsTotal * 0.4
                            )) && (
                          <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            !
                          </span>
                        )}
                      {tab.id === "visa" && applicant?.lock_1 ? (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          !
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>
            {/* Tab Content */}
            <div className="min-h-[400px] sm:min-h-[600px] tab-content">
              {/* Visa Tab Locked Message */}
              {activeTab === "tasks" && applicant?.lock_1 && (
                <div className="p-6 sm:p-8 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
                      Visa Section Locked
                    </h3>
                    <p className="text-appleGray-600 mb-4">
                      The visa section is currently locked. Please contact your
                      counselor for assistance or complete the required previous
                      steps.
                    </p>
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                    >
                      Contact Counselor
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "overview" && (
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Application Progress */}
                  <div>
                    <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
                      <FaCheckCircle className="w-5 h-5 text-sky-500 mr-3" />
                      Application Progress
                    </h3>
                    <div className="bg-gradient-to-r from-sky-500/10 to-sky-600/10 p-6 rounded-2xl">
                      <VerticalStepper
                        currentStep={applicant.status.slice(-1)}
                      />
                    </div>
                  </div>

                  {/* Quick Stats Summary */}
                  <div>
                    <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
                      <FaChartLine className="w-5 h-5 text-sky-500 mr-3" />
                      Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-appleGray-50 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-appleGray-600">
                            Progress
                          </span>
                          <span className="text-lg font-bold text-appleGray-800">
                            {dashboardStats.progressPercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-appleGray-50 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-appleGray-600">
                            Next Step
                          </span>
                          <span className="text-sm font-bold text-sky-600">
                            {dashboardStats.progressPercentage < 20
                              ? "University Documents"
                              : dashboardStats.progressPercentage < 40
                              ? "Universities"
                              : dashboardStats.progressPercentage < 60
                              ? "Visa Documents"
                              : dashboardStats.progressPercentage < 80
                              ? "Visa Application"
                              : dashboardStats.progressPercentage < 100
                              ? "Visa Appointment"
                              : "Complete"}
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* University Application Guidelines */}
                  <div>
                    <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
                      <FaUniversity className="w-5 h-5 text-sky-500 mr-3" />
                      University Application Guidelines
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-4 md:p-6">
                      <div className="mb-4 md:mb-6">
                        <p className="text-appleGray-700 mb-4 text-sm md:text-base">
                          To begin your university application process, please
                          carefully follow the steps below. Once complete, send
                          all required documents via WhatsApp or Email.
                        </p>
                      </div>

                      {/* Step 1 */}
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-start space-x-3 mb-2 md:mb-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaCheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="text-base md:text-lg font-semibold text-appleGray-800">
                            STEP 1: Create a New Email Address
                          </h4>
                        </div>
                        <p className="text-appleGray-600 ml-9 text-sm md:text-base">
                          Specifically for university applications. This will
                          help keep tracking all the process.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-start space-x-3 mb-3 md:mb-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaCheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="text-base md:text-lg font-semibold text-appleGray-800">
                            STEP 2: Submit the Required Documents
                          </h4>
                        </div>
                        <p className="text-appleGray-600 ml-9 mb-3 md:mb-4 text-sm md:text-base">
                          Please prepare and submit clear scanned copies (PDF
                          format recommended) of the following documents based
                          on the program you are applying for:
                        </p>

                        {/* Bachelor's Degree Requirements */}
                        <div className="ml-6 md:ml-9 mb-4 md:mb-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <FaBook className="w-4 h-4 text-blue-600 hidden md:inline" />
                            <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                              For Bachelor&apos;s Degree Applicants
                            </h5>
                          </div>
                          <div className="bg-white rounded-2xl p-3 md:p-4 space-y-2">
                            {[
                              "Proof of Language Proficiency (IELTS – Academic)",
                              "G.C.E. O-Level Certificate (Must be certified by the Ministry of Foreign Affairs)",
                              "G.C.E. A-Level Certificate (Must be certified by the Ministry of Foreign Affairs)",
                              "Curriculum Vitae (CV) - (Updated in tabular format)",
                              "School Leaving Certificate (Must be translated into English)",
                              "Copy of Valid Passport",
                              "Birth Certificate (English translation required)",
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-2 text-xs md:text-sm text-appleGray-700 py-1"
                              >
                                <span className="text-blue-600 font-medium mt-0.5 min-w-[16px]">
                                  {index + 1}.
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Master's Degree Requirements */}
                        <div className="ml-6 md:ml-9 mb-4 md:mb-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <FaGraduationCap className="w-4 h-4 text-purple-600 hidden md:inline" />
                            <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                              For Master&apos;s Degree Applicants
                            </h5>
                          </div>
                          <p className="text-xs md:text-sm text-appleGray-600 mb-3">
                            (Include all of the above Bachelor&apos;s
                            requirements, plus the following:)
                          </p>
                          <div className="bg-white rounded-2xl p-3 md:p-4 space-y-2">
                            {[
                              "Bachelor's Degree Certificate",
                              "Bachelor's Transcript",
                              "Two Letters of Recommendation",
                              "Medium of Instruction Certificate",
                              "Internship or Work Experience Letters (if applicable)",
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-2 text-xs md:text-sm text-appleGray-700 py-1"
                              >
                                <span className="text-purple-600 font-medium mt-0.5 min-w-[16px]">
                                  {index + 1}.
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Submit Documents */}
                        <div className="ml-6 md:ml-9">
                          <div className="flex items-center space-x-2 mb-3">
                            <FaEnvelope className="w-4 h-4 text-green-600 hidden md:inline" />
                            <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                              Submit Documents To: WhatsApp or Email
                            </h5>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                              <a
                                href="https://wa.me/4915566389194"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                              >
                                <FaPhone className="w-4 h-4 hidden md:inline" />
                                <span>WhatsApp: +49 155 6638 9194</span>
                              </a>
                              <a
                                href="mailto:gidzunipath@gmail.com"
                                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                              >
                                <FaEnvelope className="w-4 h-4 hidden md:inline" />
                                <span>Email: gidzunipath@gmail.com</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart Recommendations */}
                  <div>
                    <SmartRecommendations
                      applicantData={applicant}
                      applicationId={id}
                      dashboardStats={dashboardStats}
                    />
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="p-6 sm:p-8 space-y-8">
                  <DocumentsToUpload applicationId={id} />
                  {/* <DocumentsToDownload applicationId={id} /> */}
                </div>
              )}

              {activeTab === "universities" && (
                <div className="p-6 sm:p-8 space-y-8">
                  <Universities applicationId={id} />
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="p-6 sm:p-8">
                  <TimelineView applicantData={applicant} applicationId={id} />
                </div>
              )}

              {activeTab === "tasks" && !applicant?.lock_1 && (
                <div className="p-6 sm:p-8 space-y-8">
                  <div>
                    {/* Visa Application Tracker */}
                    <div className="mb-6 md:mb-8">
                      <h3 className="text-lg md:text-xl font-bold text-appleGray-800 mb-4 md:mb-6 flex items-center">
                        <FaTasks className="w-5 h-5 text-sky-500 mr-3 hidden md:inline" />
                        Visa Application Tracker
                      </h3>

                      <div className="bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
                        <h4 className="text-base md:text-lg font-semibold text-sky-800 mb-4 md:mb-6 flex items-center">
                          <FaPassport className="w-5 h-5 text-sky-600 mr-3 hidden md:inline" />
                          Visa Application Progress
                        </h4>

                        <div className="space-y-3 md:space-y-4">
                          {visaStepsStatus.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-white rounded-xl shadow-sm"
                            >
                              <div
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  item.status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : item.status === "current"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {item.status === "completed" ? (
                                  <FaCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                ) : (
                                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <h5 className="text-xs md:text-sm font-semibold text-appleGray-800">
                                    Step {item.step}: {item.title}
                                  </h5>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full w-fit ${
                                      item.status === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : item.status === "current"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {item.status === "completed"
                                      ? "Completed"
                                      : item.status === "current"
                                      ? "In Progress"
                                      : "Pending"}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-appleGray-600 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interview Questions Section - Show when step 4 is current */}
                      {visaStepsStatus.find((step) => step.step === 4)
                        ?.status === "current" && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
                          <h4 className="text-lg md:text-xl font-semibold text-blue-800 mb-4 md:mb-6 flex items-center">
                            <FaComments className="w-5 h-5 text-blue-600 mr-3 hidden md:inline" />
                            German Student Visa Interview: General Questions &
                            Sample Answers
                          </h4>

                          <div className="space-y-4 md:space-y-6">
                            {[
                              {
                                question: "Q1: What is your name?",
                                answer: "My name is [Your Full Name].",
                              },
                              {
                                question: "Q2: What do your parents do?",
                                answer:
                                  "My father is a [father's occupation], and my mother is a [mother's occupation or \"homemaker\"].",
                              },
                              {
                                question:
                                  "Q3: Why do you want to study in Germany?",
                                answer:
                                  "Germany offers world-class education with affordable or no tuition fees, modern facilities, and globally recognized degrees. It's also known for research and innovation, especially in fields like engineering, business, and sciences.",
                              },
                              {
                                question: "Q4: What did you study previously?",
                                answer:
                                  "For my [A-levels / Bachelor's], I studied [subjects] and obtained [grades or degree].\n\nExample for Bachelor's applicant: \"I studied Mathematics, Physics, and Chemistry in A-levels and received [your grades].\"\n\nExample for Master's applicant: \"I completed my Bachelor's in [Your Program] with a GPA of [X.XX].\"",
                              },
                              {
                                question:
                                  "Q5: Which university are you going to in Germany?",
                                answer:
                                  "I have been admitted to [University Name] in [City].",
                              },
                              {
                                question:
                                  "Q6: What is the duration of your program?",
                                answer:
                                  "My program lasts for [3.5 years for Bachelor's / 1.5 or 2 years for Master's], depending on the course structure.",
                              },
                              {
                                question:
                                  "Q7: What are your plans after graduation?",
                                answer:
                                  "I intend to return to my home country and apply the skills and knowledge I gain in Germany to contribute to its development, especially in my field of study.",
                              },
                              {
                                question:
                                  "Q8: Who is financing your education in Germany?",
                                answer:
                                  "My [father/parents/sponsor] is supporting my education. I also have a blocked account as financial proof.",
                              },
                              {
                                question: "Q9: Where will you stay in Germany?",
                                answer:
                                  "I have applied for student accommodation near the university. If unavailable, I will arrange for private housing nearby.",
                              },
                              {
                                question:
                                  "Q10: How did you find and apply to the university?",
                                answer:
                                  "I researched universities online and applied directly through the university website or Uni-Assist (if applicable).",
                              },
                              {
                                question:
                                  "Q11: Do you have any work experience?",
                                answer:
                                  "• If no experience: I do not have professional experience yet.\n• If yes: Yes, I worked as a [position] at [company] for [duration].",
                              },
                              {
                                question:
                                  "Q12: What is the address of your university?",
                                answer:
                                  "[University Name], [Street Address], [Postal Code] [City], Germany.",
                              },
                              {
                                question: "Q13: Where is your family based?",
                                answer:
                                  "My family lives in [City], [Sri Lanka].",
                              },
                              {
                                question:
                                  "Q14: Do you plan to return to your country after your studies?",
                                answer:
                                  "Yes, I plan to return and contribute to my country's development through my expertise.",
                              },
                              {
                                question:
                                  "Q15: Do you have any relatives in Germany?",
                                answer:
                                  "• If no: No, I don't have any relatives in Germany.",
                              },
                              {
                                question:
                                  "Q16: What do you know about German culture?",
                                answer:
                                  "Germany values punctuality, discipline, and efficiency. It's also rich in history, art, and technology, with a strong emphasis on education and environmental consciousness.",
                              },
                              {
                                question:
                                  "Q17: Why did you choose this specific course?",
                                answer:
                                  "The course aligns with my interests and career goals. It combines theoretical knowledge with practical training, which will prepare me well for future challenges.",
                              },
                              {
                                question: "Q18: What are your career goals?",
                                answer:
                                  "I aim to build a strong professional career in [field], gain industry experience, and eventually contribute to innovation and development in my home country.",
                              },
                              {
                                question: "Q19: Do you speak German?",
                                answer:
                                  "I am currently learning basic German. However, my program is in English.",
                              },
                              {
                                question:
                                  "Q20: What challenges do you anticipate in Germany?",
                                answer:
                                  "Initially, I might face language and cultural differences, as well as adapting to the weather. But I am motivated to overcome these by engaging with local communities and continuing language studies.",
                              },
                              {
                                question:
                                  "Q21: How will you manage your living expenses?",
                                answer:
                                  "I have opened a blocked account as required and will manage my finances carefully.",
                              },
                              {
                                question:
                                  "Q22: What is a blocked account, and how much is required?",
                                answer:
                                  "A blocked account is a German bank account for international students, where a fixed amount (currently €11,208 per year) is deposited to cover living expenses.",
                              },
                              {
                                question:
                                  "Q23: How will this course support your career?",
                                answer:
                                  "The course provides up-to-date academic knowledge and practical experience, equipping me with the necessary skills to succeed in the global job market.",
                              },
                              {
                                question:
                                  "Q24: Can you explain the course modules?",
                                answer:
                                  "• For Bachelor's: Check your modules on the university website\n• For Master's: Check your modules on the university website",
                              },
                              {
                                question:
                                  "Q25: Why did you choose Germany over countries like the UK or USA?",
                                answer:
                                  "Germany offers excellent education quality with low or no tuition fees. It has strong industry-academia connections, a high standard of living, and opportunities for international students.",
                              },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-2xl p-3 md:p-5 border border-blue-200"
                              >
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800 mb-3 flex items-start">
                                  <FaQuestionCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hidden md:inline" />
                                  {item.question}
                                </h5>
                                <div className="ml-0 md:ml-6">
                                  <div className="bg-blue-50 rounded-xl p-3 md:p-4">
                                    <div className="flex items-start space-x-2">
                                      <FaLightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 hidden md:inline" />
                                      <div className="text-xs md:text-sm text-appleGray-700 whitespace-pre-line leading-relaxed">
                                        {item.answer}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 md:p-6 border border-green-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaCheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                              </div>
                              <div>
                                <h5 className="text-base md:text-lg font-semibold text-green-800 mb-2">
                                  Interview Tips:
                                </h5>
                                <ul className="text-xs md:text-sm text-green-700 space-y-1">
                                  <li>• Be confident and speak clearly</li>
                                  <li>• Dress professionally</li>
                                  <li>• Arrive early for your appointment</li>
                                  <li>
                                    • Bring all required documents organized
                                  </li>
                                  <li>• Practice these questions beforehand</li>
                                  <li>
                                    • Be honest and consistent in your answers
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Appointment Scheduling Section - Show when step 5 is current */}
                      {visaStepsStatus.find((step) => step.step === 5)
                        ?.status === "current" && (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
                          <h4 className="text-lg md:text-xl font-semibold text-purple-800 mb-4 md:mb-6 flex items-center">
                            <FaCalendarAlt className="w-5 h-5 text-purple-600 mr-3 hidden md:inline" />
                            Visa Appointment Scheduling
                          </h4>
                        </div>
                      )}
                    </div>

                    {/* Visa Application Submission Document Checklist */}
                    <div className="mb-6 md:mb-8">
                      <h3 className="text-lg md:text-xl font-bold text-appleGray-800 mb-4 md:mb-6 flex items-center">
                        <FaPassport className="w-5 h-5 text-sky-500 mr-3 hidden md:inline" />
                        Visa Application Submission – Document Checklist
                      </h3>

                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-4 md:p-6">
                        <div className="mb-4 md:mb-6">
                          <p className="text-appleGray-700 mb-4 text-sm md:text-base">
                            To apply for your German student visa, please follow
                            these steps and submit all required documents via
                            <b> WhatsApp</b> or <b>Email</b>.
                          </p>
                        </div>
                        {/* Step 1 */}
                        <div className="mb-4 md:mb-6">
                          <div className="flex items-start space-x-3 mb-2 md:mb-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FaCheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <h4 className="text-base md:text-lg font-semibold text-appleGray-800">
                              STEP 1: Create a Blocked Account
                            </h4>
                          </div>
                          <p className="text-appleGray-600 ml-9 mb-6">
                            To show proof of Secure Livelihood for student visa
                            application, you need to initiate the process of
                            opening a blocked account through Expatrio, a
                            recognized provider in Germany. This is part of
                            Expatrio’s Value Package, which includes:
                          </p>

                          <div className="ml-9 space-y-6">
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <ul className="list-disc ml-4 md:ml-6 text-xs md:text-sm text-appleGray-700 space-y-2">
                                <li>
                                  <span className="font-medium">
                                    Blocked Account
                                  </span>{" "}
                                  (required proof of financial means)
                                </li>
                                <li>
                                  <span className="font-medium">
                                    Health Insurance
                                  </span>{" "}
                                  (public or private, depending on eligibility)
                                </li>
                                <li>
                                  <span className="font-medium">
                                    Travel Insurance
                                  </span>{" "}
                                  (valid for the visa duration before enrollment
                                  in public health insurance)
                                </li>
                              </ul>
                              <div className="mt-3 md:mt-4">
                                <a
                                  href="https://www.expatrio.com?f=gideong1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 w-full sm:w-auto min-h-[44px]"
                                >
                                  <FaUniversity className="w-4 h-4 hidden md:inline" />
                                  <span>Open with Expatrio</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Step 2 */}
                        <div className="mb-4 md:mb-6">
                          <div className="flex items-start space-x-3 mb-2 md:mb-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FaCheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <h4 className="text-base md:text-lg font-semibold text-appleGray-800">
                              STEP 2: Create a New Email Address
                            </h4>
                          </div>
                          <p className="text-appleGray-600 ml-9 text-sm md:text-base">
                            For a secure and organized visa process, please
                            create a new Gmail account and password exclusively
                            for visa communications.
                          </p>
                        </div>
                        {/* Step 3 */}
                        <div className="mb-4 md:mb-6">
                          <div className="flex items-start space-x-3 mb-3 md:mb-4">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FaCheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <h4 className="text-base md:text-lg font-semibold text-appleGray-800">
                              STEP 3: Submit the Following Documents
                            </h4>
                          </div>
                          <p className="text-appleGray-600 ml-9 mb-4 md:mb-6 text-sm md:text-base">
                            Please send clear scanned copies of the following
                            documents:
                          </p>

                          {/* Document Requirements */}
                          <div className="ml-6 md:ml-9 space-y-4 md:space-y-6">
                            {/* Motivation Letter */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaFileAlt className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  1. Motivation Letter (for the Embassy)
                                </h5>
                              </div>
                              <p className="text-xs md:text-sm text-appleGray-600 mb-3 ml-0 md:ml-8">
                                This is required along with your Admission
                                Letter.
                              </p>
                              <div className="ml-0 md:ml-8">
                                <p className="text-xs md:text-sm font-medium text-appleGray-700 mb-2">
                                  Your motivation letter should clearly include:
                                </p>
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>• Why you want to study in Germany</li>
                                  <li>
                                    • Why you chose this specific degree and
                                    university
                                  </li>
                                  <li>• Your academic background</li>
                                  <li>• Your family background</li>
                                  <li>
                                    • Your goals after graduation and how you
                                    plan to contribute to Sri Lanka after
                                    returning
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Updated CV */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaIdCard className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  2. Updated CV (Curriculum Vitae)
                                </h5>
                              </div>
                              <div className="ml-0 md:ml-8">
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>• Preferably in tabular format</li>
                                  <li>
                                    • Include educational background, skills,
                                    and any professional experience
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Passport Copy */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaPassport className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  3. Passport Copy
                                </h5>
                              </div>
                              <div className="ml-0 md:ml-8">
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>
                                    • Include all passport pages with stamps,
                                    and especially pages 2 to 9
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Biometric Photo */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaUserEdit className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  4. Biometric Photo
                                </h5>
                              </div>
                              <div className="ml-0 md:ml-8">
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>
                                    • Must be a recent photo with a white
                                    background
                                  </li>
                                  <li>
                                    • Follows German visa photo specifications
                                    (35mm x 45mm)
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Work Experience */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaCertificate className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  5. Work Experience / Courses
                                </h5>
                              </div>
                              <div className="ml-0 md:ml-8">
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>
                                    • Include any job experience letters,
                                    internships, or extra courses you have
                                    completed (if applicable)
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Birth Certificate */}
                            <div className="bg-white rounded-2xl p-3 md:p-5 border border-orange-200">
                              <div className="flex items-start space-x-3 mb-3">
                                <FaFileAlt className="w-5 h-5 text-orange-600 mt-0.5 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  6. Birth Certificate (English Translation)
                                </h5>
                              </div>
                              <div className="ml-0 md:ml-8">
                                <ul className="text-xs md:text-sm text-appleGray-600 space-y-1">
                                  <li>
                                    • Must be officially translated into English
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Submit Documents */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-3 md:p-4 border border-green-200">
                              <div className="flex items-center space-x-2 mb-3">
                                <FaEnvelope className="w-4 h-4 text-green-600 hidden md:inline" />
                                <h5 className="text-sm md:text-base font-semibold text-appleGray-800">
                                  Submit Documents To: WhatsApp or Email
                                </h5>
                              </div>
                              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                <a
                                  href="https://wa.me/4915566389194"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                                >
                                  <FaPhone className="w-4 h-4 hidden md:inline" />
                                  <span>WhatsApp: +49 155 6638 9194</span>
                                </a>
                                <a
                                  href="mailto:gidzunipath@gmail.com"
                                  className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                                >
                                  <FaEnvelope className="w-4 h-4 hidden md:inline" />
                                  <span>Email: gidzunipath@gmail.com</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All Application Options */}
                    {/* <div className="space-y-8">
                      <ApplicationOptions
                        applicationId={id}
                        optionsToCheck={[
                          { name: "CREATED UA ACCOUNT", option: false },
                          { name: "VISA APPOINTMENT", option: false },
                          { name: "APPLIED UNIVERSITY", option: false },
                          { name: "DORMS (OPTIONAL)", option: false },
                        ]}
                        title="📋 Application Requirements"
                      />

                      <ApplicationOptions
                        applicationId={id}
                        optionsToCheck={[{ name: "ADMISSION/OFFER LETTER" }]}
                        title="🎓 Admission Process"
                      />

                      <ApplicationOptions
                        applicationId={id}
                        optionsToCheck={[
                          { name: "ENROLMENT LETTER", option: false },
                        ]}
                        title="🏛️ University Enrollment"
                      />
                    </div> */}
                  </div>
                </div>
              )}

              {activeTab === "support" && (
                <div className="p-6 sm:p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
                      <FaLifeRing className="w-5 h-5 text-sky-500 mr-3" />
                      Support & Communication
                    </h3>{" "}
                    {/* Communication Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <button
                        onClick={() => setShowMessageModal(true)}
                        className="group bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-3xl border border-sky-200 hover:shadow-medium transition-all duration-300 support-action-card"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center">
                            <FaComments className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-semibold text-appleGray-800">
                              Message Counselor
                            </h4>
                            <p className="text-sm text-appleGray-600">
                              Get instant help and guidance
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowCreateApointement(true)}
                        className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200 hover:shadow-medium transition-all duration-300 support-action-card"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                            <FaCalendarAlt className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-semibold text-appleGray-800">
                              Book Appointment
                            </h4>
                            <p className="text-sm text-appleGray-600">
                              Schedule a consultation call
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Call Us Card */}
                      <div className="bg-white rounded-3xl p-8 shadow-large hover:shadow-xl transition-all duration-300 text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <FaPhoneAlt className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-appleGray-900 mb-2">
                          Call Us
                        </h3>
                        <p className="text-appleGray-600 mb-4">
                          Monday to Friday, 9:30 AM to 5:00 PM
                        </p>
                        <div className="space-y-2">
                          <a
                            href="tel:+4915566389194"
                            className="block text-lg font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                          >
                            +49 155 6638 9194
                          </a>
                          <div className="flex items-center justify-center space-x-2 text-appleGray-500">
                            <FaClock className="w-4 h-4" />
                            <span className="text-sm">
                              Response within 1 hour
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visit Us Card */}
                      <div className="bg-white rounded-3xl p-8 shadow-large hover:shadow-xl transition-all duration-300 text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <FaMapMarkerAlt className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-appleGray-900 mb-2">
                          Visit Us
                        </h3>
                        <p className="text-appleGray-600 mb-4">
                          Monday to Friday, 9:30 AM to 5:00 PM
                        </p>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-appleGray-800">
                            Ponnalai Road,
                          </p>
                          <p className="text-appleGray-600">
                            Sandilipay, 40000, Sri Lanka
                          </p>
                          <div className="flex items-center justify-center space-x-2 text-appleGray-500">
                            <FaMapMarkerAlt className="w-4 h-4" />
                            <span className="text-sm">By appointment</span>
                          </div>
                        </div>
                      </div>

                      {/* Email Us Card */}
                      <div className="bg-white rounded-3xl p-8 shadow-large hover:shadow-xl transition-all duration-300 text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <FaEnvelope className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-appleGray-900 mb-2">
                          Email Us
                        </h3>
                        <p className="text-appleGray-600 mb-4">
                          For general or business inquiries
                        </p>
                        <div className="space-y-2">
                          <a
                            href="mailto:gidzunipath@gmail.com"
                            className="block text-lg font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                          >
                            gidzunipath@gmail.com
                          </a>
                          <div className="flex items-center justify-center space-x-2 text-appleGray-500">
                            <FaPaperPlane className="w-4 h-4" />
                            <span className="text-sm">
                              Response within 24 hours
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "german-life" && (
                <div className="p-6 sm:p-8 flex items-center justify-center min-h-[320px] sm:min-h-[400px]">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaGlobe className="w-8 h-8 text-sky-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
                      German life
                    </h3>
                    <p className="text-appleGray-600 text-lg">Coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-appleGray-800 mb-4">
                      👤 Personal Information
                    </h4>
                    <div className="bg-appleGray-50 p-6 rounded-3xl">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Details */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <FaUserEdit className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                First Name
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.first_name || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <FaUserEdit className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                Last Name
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.last_name || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <FaCalendarAlt className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                Date of Birth
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.date_of_birth || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <FaPassport className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                Passport Number
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.passport_number || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <FaPhone className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                Telephone
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.telephone || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <FaEnvelope className="w-5 h-5 text-appleGray-400" />
                            <div>
                              <span className="text-sm font-medium text-appleGray-600">
                                Email
                              </span>
                              <p className="text-appleGray-800">
                                {applicant.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Profile Picture */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-soft border-4 border-white">
                              <Image
                                width={128}
                                height={128}
                                src={profilePicUrl || "/logo.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Always show replace/upload button as overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 rounded-3xl transition-all duration-200 flex items-center justify-center group cursor-pointer">
                              <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white bg-opacity-90 hover:bg-opacity-100 text-appleGray-800 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center space-x-2 shadow-soft">
                                  <FaUpload className="w-4 h-4" />
                                  <span>
                                    {profilePicUrl ? "Replace" : "Upload"}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          {!profilePicUrl && (
                            <div className="text-center">
                              <label className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-2xl text-sm font-medium transition-colors duration-200 inline-flex items-center space-x-2 touch-manipulation min-h-[44px] justify-center">
                                <FaUpload className="w-4 h-4" />
                                <span>Upload Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-appleGray-800 mb-4">
                      🔗 Referral Code
                    </h4>
                    <div className="bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 rounded-3xl p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto">
                          <FaIdCard className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h5 className="text-xl font-semibold text-appleGray-800 mb-2">
                            Share Your Referral Code
                          </h5>
                          <p className="text-sm text-appleGray-600 mb-4">
                            Refer friends and family to earn rewards when they
                            complete their application!
                          </p>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-sky-300">
                          <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1">
                              <span className="text-xs font-medium text-appleGray-600 uppercase tracking-wide">
                                Your Referral Code
                              </span>
                              <div className="text-2xl font-bold text-sky-600 font-mono tracking-wider">
                                {applicant?.referral_code ||
                                  id?.slice(-8).toUpperCase() ||
                                  "GIDZ2024"}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const referralCode =
                                  applicant?.referral_code ||
                                  id?.slice(-8).toUpperCase() ||
                                  "GIDZ2024";
                                navigator.clipboard
                                  .writeText(referralCode)
                                  .then(() => {
                                    // You could add a toast notification here
                                    alert("Referral code copied to clipboard!");
                                  });
                              }}
                              className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition-colors duration-200 whitespace-nowrap touch-manipulation min-h-[44px]"
                            >
                              <FaCopy className="w-4 h-4" />
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FaCheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <div className="text-left">
                              <h6 className="text-sm font-semibold text-green-800 mb-1">
                                How it works:
                              </h6>
                              <ul className="text-xs text-green-700 space-y-1">
                                <li>• Share your referral code with friends</li>
                                <li>• They use it during their application</li>
                                <li>
                                  • You both get rewards when they complete!
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-appleGray-800 mb-4">
                      💬 Share Your Experience
                    </h4>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                          <FaComments className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h5 className="text-xl font-semibold text-appleGray-800 mb-2">
                            Help Others with Your Journey
                          </h5>
                          <p className="text-sm text-appleGray-600 mb-4">
                            Share your experience with GIDZ UniPath to help
                            future students. Your feedback might be featured in
                            our testimonials!
                          </p>
                        </div>

                        <button
                          onClick={() => setShowFeedbackDialog(true)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-semibold transition-all duration-200 inline-flex items-center space-x-2 shadow-soft hover:shadow-medium touch-manipulation min-h-[48px] w-full sm:w-auto justify-center"
                        >
                          <FaComments className="w-5 h-5" />
                          <span>Write Feedback</span>
                        </button>

                        <div className="bg-white rounded-2xl p-4 border border-orange-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FaLightbulb className="w-3 h-3 text-white" />
                            </div>
                            <div className="text-left">
                              <h6 className="text-sm font-semibold text-orange-800 mb-1">
                                Your feedback helps us:
                              </h6>
                              <ul className="text-xs text-orange-700 space-y-1">
                                <li>
                                  • Improve our services for future students
                                </li>
                                <li>
                                  • Build trust with prospective applicants
                                </li>
                                <li>• Showcase success stories from Germany</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>{" "}
        {/* Modal with Message component */}
        {showMessageModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMessageModal(false);
              }
            }}
          >
            <div
              className="relative bg-white p-6 rounded-2xl shadow-large border border-appleGray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMessageModal(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200"
              >
                <FaTimes className="w-4 h-4" />
              </button>
              <Message />
            </div>
          </div>
        )}
        {showCreateApointemen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateApointement(false);
              }
            }}
          >
            <div
              className="relative bg-white p-6 rounded-2xl shadow-large border border-appleGray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCreateApointement(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200"
              >
                <FaTimes className="w-4 h-4" />
              </button>
              <AppointmentModal
                onClose={() => setShowCreateApointement(false)}
              />
            </div>
          </div>
        )}
        {/* Image Crop Modal */}
        {showCropModal && selectedImage && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={(e) => {
              // Only close if clicking the backdrop
              if (e.target === e.currentTarget) {
                handleCropCancel();
              }
            }}
          >
            <div
              className="relative bg-white p-6 rounded-2xl shadow-large border border-appleGray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCropCancel}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200 z-10"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
                    Crop Your Profile Picture
                  </h3>
                  <p className="text-sm text-appleGray-600">
                    Adjust the crop area to select the part of your image you
                    want to use
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <ReactCrop
                      crop={crop}
                      onChange={(c, percentCrop) => {
                        console.log("Crop changed:", c);
                        setCrop(c);
                      }}
                      onComplete={(c, percentCrop) => {
                        console.log("Crop completed:", c);
                        setCompletedCrop(c);
                      }}
                      aspect={1} // Square aspect ratio
                      minWidth={50}
                      minHeight={50}
                      keepSelection={true}
                      style={{ maxWidth: "100%", height: "auto" }}
                    >
                      <Image
                        ref={imgRef}
                        alt="Crop me"
                        src={selectedImage.url}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                          maxHeight: "400px",
                        }}
                        onLoad={(e) => {
                          console.log("Image loaded for cropping");
                          // Set initial crop when image loads with a delay to ensure proper rendering
                          setTimeout(() => {
                            const {
                              naturalWidth,
                              naturalHeight,
                              width,
                              height,
                            } = e.target;
                            console.log("Image dimensions:", {
                              naturalWidth,
                              naturalHeight,
                              width,
                              height,
                            });

                            // Calculate crop area (60% of the smaller dimension for better visibility)
                            const cropSize = Math.min(width, height) * 0.6;
                            const newCrop = {
                              unit: "px",
                              width: cropSize,
                              height: cropSize,
                              x: (width - cropSize) / 2,
                              y: (height - cropSize) / 2,
                            };
                            console.log("Setting initial crop:", newCrop);
                            setCrop(newCrop);
                            setCompletedCrop(newCrop);
                          }, 100);
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-appleGray-200 rounded-full h-2">
                      <div
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-appleGray-600">
                      Uploading... {progress}%
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Cancel button clicked");
                      handleCropCancel();
                    }}
                    disabled={uploading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-appleGray-300 text-appleGray-700 rounded-xl hover:bg-appleGray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Upload button clicked");
                      handleCroppedUpload();
                    }}
                    disabled={!completedCrop || uploading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 touch-manipulation"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FaUpload className="w-4 h-4" />
                        <span>Upload Cropped Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Feedback Dialog */}
        <FeedbackDialog
          isOpen={showFeedbackDialog}
          onClose={() => setShowFeedbackDialog(false)}
          applicationId={id}
          clientData={applicant}
        />
      </div>
    </div>
  );
};

export default ApplicantDetail;
