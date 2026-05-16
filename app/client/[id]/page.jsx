"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FaUserGraduate,
  FaTimes,
  FaFileAlt,
  FaClock,
  FaSearch,
  FaComments,
  FaCalendarAlt,
} from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthSystem, AUTH_TYPES } from "../../../hooks/useAuthSystem";

import Message from "./components/Message";
import AppointmentModal from "./components/AppointmentModal";
import NotificationSystem from "./components/NotificationSystem";
import FeedbackDialog from "./components/FeedbackDialog";

import ClientHeader from "./components/ClientHeader";
import DashboardStats from "./components/DashboardStats";
import TabNav from "./components/TabNav";
import CropModal from "./components/CropModal";

import OverviewTab from "./components/tabs/OverviewTab";
import DocumentsTab from "./components/tabs/DocumentsTab";
import UniversitiesTab from "./components/tabs/UniversitiesTab";
import TasksTab from "./components/tabs/TasksTab";
import SupportTab from "./components/tabs/SupportTab";
import ProfileTab from "./components/tabs/ProfileTab";
import GermanLifeTab from "./components/tabs/GermanLifeTab";
import TimelineTab from "./components/tabs/TimelineTab";

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
    description: "Embassy is conducting preliminary review of your application",
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

const ApplicantDetail = () => {
  const [applicant, setApplicant] = useState(null);
  const [id, setId] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { type: authType, user, isAuthenticated, loading: authLoading } =
    useAuthSystem();

  // Sync tab from URL
  const tabFromUrl = searchParams.get("tab");
  useEffect(() => {
    if (tabFromUrl && VALID_CLIENT_TAB_IDS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("overview");
    }
  }, [tabFromUrl]);

  const navigateToTab = useCallback(
    (tabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      const urlId = window.location.pathname.split("/").pop();
      if (!isAuthenticated || authType !== AUTH_TYPES.CLIENT) {
        router.push("/login");
        return;
      }
      if (user?.id !== urlId) {
        router.push("/login");
        return;
      }
      setId(urlId);
    }
  }, [authLoading, isAuthenticated, authType, user, router]);

  // Visa steps
  const fetchVisaStepsStatus = useCallback(async (applicationId) => {
    if (!applicationId) return [];
    try {
      const steps = getVisaSteps();
      const stepsWithStatus = await Promise.all(
        steps.map(async (step) => {
          const { data, error } = await supabase
            .from("options")
            .select("option")
            .eq("application_id", applicationId)
            .eq("name", step.dbOptionName);
          if (error) return { ...step, status: "pending" };
          return {
            ...step,
            status:
              data && data.length > 0 && data[0].option
                ? "completed"
                : "pending",
          };
        })
      );

      let currentFound = false;
      const final = stepsWithStatus.map((step) => {
        if (step.status === "pending" && !currentFound) {
          currentFound = true;
          return { ...step, status: "current" };
        }
        return step;
      });

      if (!currentFound && final.length > 0) {
        final[final.length - 1] = {
          ...final[final.length - 1],
          status: "current",
        };
      }

      setVisaStepsStatus(final);
      return final;
    } catch {
      const steps = getVisaSteps();
      const defaultSteps = steps.map((step, i) => ({
        ...step,
        status: i === 0 ? "current" : "pending",
      }));
      setVisaStepsStatus(defaultSteps);
      return defaultSteps;
    }
  }, []);

  // Dashboard stats
  const calculateDashboardStats = useCallback(
    async (applicantData) => {
      try {
        const { data: universities } = await supabase
          .from("universities")
          .select("*")
          .eq("application_id", id);

        const statusToProgress = {
          1: 16.67,
          2: 33.33,
          3: 50,
          4: 66.67,
          5: 83.33,
          6: 100,
        };
        const currentStep = applicantData.status?.slice(-1) || "1";
        const progressPercentage = statusToProgress[currentStep] || 0;
        const documents = applicantData.documents || [];

        setDashboardStats({
          progressPercentage,
          universityDocumentsUploaded: documents.filter(
            (d) => d.type === "university" && d.url?.trim()
          ).length,
          universityDocumentsTotal: documents.filter(
            (d) => d.type === "university"
          ).length,
          visaDocumentsUploaded: documents.filter(
            (d) => d.type === "visa" && d.url?.trim()
          ).length,
          visaDocumentsTotal: documents.filter((d) => d.type === "visa")
            .length,
          universitiesApplied: universities?.length || 0,
          nextDeadline: universities?.[0]?.deadline || null,
        });
      } catch (error) {
        console.error("Error calculating dashboard stats:", error);
      }
    },
    [id]
  );

  // Notifications
  const generateNotifications = (applicantData) => {
    const now = Date.now();
    const notifs = [];

    if (!applicantData.payment1)
      notifs.push({
        id: `payment1-${now}`,
        type: "warning",
        title: "Payment Required",
        message: "Payment 1 is still pending. Please complete to proceed.",
        timestamp: now,
      });

    if (!applicantData.payment2)
      notifs.push({
        id: `payment2-${now}`,
        type: "warning",
        title: "Payment Required",
        message: "Payment 2 is still pending. Please complete to proceed.",
        timestamp: now,
      });

    const uploaded = (applicantData.documents || []).filter(
      (d) => d.url?.trim()
    );
    if (uploaded.length < 5)
      notifs.push({
        id: `documents-${now}`,
        type: "info",
        title: "Documents Needed",
        message: `You have uploaded ${uploaded.length} documents. Upload more to complete your application.`,
        timestamp: now,
      });

    const step = parseInt(applicantData.status?.slice(-1)) || 1;
    if (step >= 2)
      notifs.push({
        id: `progress-${now}`,
        type: "success",
        title: "Great Progress!",
        message: `You've completed step ${step - 1} of your application journey.`,
        timestamp: now,
      });

    setNotifications(notifs);
  };

  const dismissNotification = (notificationId) =>
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

  // Fetch applicant
  const fetchApplicant = useCallback(
    async (applicantId) => {
      if (!applicantId) return;
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*, documents(*)")
          .eq("id", applicantId)
          .single();

        if (error) throw error;
        if (data) {
          setApplicant(data);
          const profileDoc = data.documents?.find(
            (d) => d.name === "Profile Picture"
          );
          if (profileDoc) setProfilePicUrl(profileDoc.url);
          calculateDashboardStats(data);
          fetchVisaStepsStatus(applicantId).catch(console.error);
          generateNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching applicant:", error);
      }
    },
    [calculateDashboardStats, fetchVisaStepsStatus]
  );

  useEffect(() => {
    if (id) fetchApplicant(id);
  }, [id, fetchApplicant]);

  // Profile photo upload — opens crop modal
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({ file, url: reader.result, name: file.name });
      setShowCropModal(true);
    };
    reader.onerror = () => {
      alert("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // --- Loading / auth states ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-appleGray-800">
            Authenticating...
          </h2>
          <p className="text-appleGray-500">
            Please wait while we verify your access
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
          <p className="text-appleGray-500">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 relative overflow-hidden pt-16 sm:pt-20">
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-sky-400/10 rounded-full animate-float pointer-events-none" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-sky-500/20 rounded-2xl animate-float pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-sky-600/15 rounded-full animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <ClientHeader applicant={applicant} />

        <DashboardStats applicant={applicant} dashboardStats={dashboardStats} />

        {/* Tabbed Card */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-100 overflow-hidden">
            <TabNav
              activeTab={activeTab}
              applicant={applicant}
              dashboardStats={dashboardStats}
              onTabChange={navigateToTab}
            />

            <div className="min-h-[400px] sm:min-h-[600px]">
              {activeTab === "overview" && (
                <OverviewTab
                  applicant={applicant}
                  applicationId={id}
                  dashboardStats={dashboardStats}
                  profilePicUrl={profilePicUrl}
                  onProfileUpload={handleProfileUpload}
                />
              )}
              {activeTab === "documents" && (
                <DocumentsTab applicationId={id} />
              )}
              {activeTab === "universities" && (
                <UniversitiesTab applicationId={id} />
              )}
              {activeTab === "tasks" && (
                <TasksTab
                  applicant={applicant}
                  visaStepsStatus={visaStepsStatus}
                  onMessageOpen={() => setShowMessageModal(true)}
                />
              )}
              {activeTab === "support" && (
                <SupportTab
                  onMessageOpen={() => setShowMessageModal(true)}
                  onAppointmentOpen={() => setShowAppointmentModal(true)}
                />
              )}
              {activeTab === "profile" && (
                <ProfileTab
                  applicant={applicant}
                  applicationId={id}
                  onFeedbackOpen={() => setShowFeedbackDialog(true)}
                />
              )}
              {activeTab === "german-life" && <GermanLifeTab />}
              {activeTab === "timeline" && (
                <TimelineTab applicant={applicant} applicationId={id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowMessageModal(false)}
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

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAppointmentModal(false)}
        >
          <div
            className="relative bg-white p-6 rounded-2xl shadow-large border border-appleGray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <AppointmentModal onClose={() => setShowAppointmentModal(false)} />
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && selectedImage && (
        <CropModal
          selectedImage={selectedImage}
          applicationId={id}
          uploading={uploading}
          setUploading={setUploading}
          progress={progress}
          setProgress={setProgress}
          onUploadSuccess={(url) => setProfilePicUrl(url)}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImage(null);
          }}
        />
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        applicationId={id}
        clientData={applicant}
      />
    </div>
  );
};

export default ApplicantDetail;
