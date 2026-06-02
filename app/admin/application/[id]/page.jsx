"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { supabase } from "../../../../lib/supabase";
import UniversitiesTable from "../../components/UniversitiesTable";
import DocumentsTable from "../../components/DocumentsTable";
import DcoumentsFromUs from "../../components/DocumentsFromUs";
import ApplicationOptions from "../../components/ApplicationOptoins";
import ProfilePic from "../../components/ProfilePic";
import SpecialNotesEditor from "../../components/SpecialNotesEditor";
import {
  ChangeStatusModal,
  getStatusLabel,
  getStatusBadgeClass,
} from "../../components/ApplicationStatusModal";
import axios from "axios";
import Image from "next/image";
import { emailAssetUrl } from "../../../../lib/emailAssets";

const EDUCATIONAL_BACKGROUNDS = [
  "Bachelors",
  "Masters",
  "Language Course",
  "Foundation Course",
];

// ----------------------
// Yes/No Button Group
// ----------------------
const YesNoButtonGroup = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2">
      <button
        type="button"
        className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 min-w-[80px] ${
          value
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
        }`}
        onClick={() => onChange(true)}
      >
        <Icon icon="mdi:check" className="inline mr-1.5 text-sm" />
        Yes
      </button>
      <button
        type="button"
        className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 min-w-[80px] ${
          !value
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
        }`}
        onClick={() => onChange(false)}
      >
        <Icon icon="mdi:close" className="inline mr-1.5 text-sm" />
        No
      </button>
    </div>
  );
};

// ----------------------
// Editable Field Component
// ----------------------
const EditableField = ({
  label,
  value,
  type = "text",
  onSave,
  options, // For select inputs
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  // Check if this is a textarea field (for special notes)
  const isTextarea = label === "Special Notes";

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            {label}
          </label>
          {!isEditing ? (
            <div
              className={`${
                isTextarea ? "min-h-[80px]" : "min-h-[40px]"
              } flex items-start`}
            >
              <span
                className={`text-gray-900 font-medium text-base ${
                  isTextarea ? "whitespace-pre-wrap" : ""
                }`}
              >
                {value || "Not provided"}
              </span>
            </div>
          ) : type === "select" ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            >
              <option value="" disabled>
                Select {label}
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : type === "date" ? (
            <input
              type="date"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
          ) : isTextarea ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white min-h-[120px] resize-y"
              placeholder="Add special notes about this application..."
            />
          ) : (
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="Edit field"
            >
              <Icon icon="mdi:pencil" className="text-lg" />
            </button>
          ) : (
            <div className="flex space-x-1">
              <button
                onClick={handleSave}
                className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Save changes"
              >
                <Icon icon="mdi:check" className="text-lg" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Cancel editing"
              >
                <Icon icon="mdi:close" className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------
// Applicant Detail Component
// ----------------------
const TABS = [
  { id: "overview", label: "Overview", icon: "mdi:account" },
  { id: "payments", label: "Payments", icon: "mdi:credit-card" },
  { id: "documents", label: "Documents", icon: "mdi:file-document-multiple" },
  { id: "universities", label: "Universities", icon: "mdi:university" },
  { id: "uni-progress", label: "Uni Progress", icon: "mdi:school" },
  { id: "visa-progress", label: "Visa Progress", icon: "mdi:passport" },
  { id: "notes", label: "Notes", icon: "mdi:note-text" },
];

const VALID_TAB_IDS = new Set(TABS.map((t) => t.id));
const DEFAULT_TAB = "overview";

const ApplicantDetail = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [applicant, setApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  // For toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // For the "Create New Password" modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [lockstate, setlockstate] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notification Modal State
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success", // or 'error'
  });

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Sync tab from URL (?tab=...)
  const tabFromUrl = searchParams.get("tab");
  useEffect(() => {
    if (tabFromUrl && VALID_TAB_IDS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab(DEFAULT_TAB);
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

  // --------------------------------
  //  Grab the applicant ID (from URL)
  // --------------------------------
  const [id, setId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      setId(lastPart);
    }
  }, []);

  // --------------------------------
  //  Fetch applicant data
  // --------------------------------
  useEffect(() => {
    if (id) {
      fetchApplicant(id);
    }
  }, [id]);

  const fetchApplicant = async (applicantId) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*, documents(*)")
        .eq("id", applicantId)
        .single();

      if (error) throw error;
      if (data) {
        setApplicant(data);
        setlockstate(data.lock_1);
        // Hide password by default
        setShowPassword(false);
      }
    } catch (error) {
      console.error("Error fetching applicant:", error.message);
      setNotification({
        isOpen: true,
        title: "Error",
        message: error.message,
        type: "error",
      });
    }
  };

  // -------------------------------------------------
  //  Show/Hide Modal for "Create New Password"
  // -------------------------------------------------
  const handleOpenPasswordModal = () => {
    // Clear any previously typed password
    setTempPassword("");
    setShowPasswordModal(true);
  };
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // -------------------------------------------------
  //  Generate a random password (simple example)
  // -------------------------------------------------
  const generateRandomPassword = () => {
    // In reality, you'd want a better generation strategy
    const randomStr = Math.random().toString(36).slice(-8); // e.g. 8 random chars
    setTempPassword(`${randomStr}`);
  };

  // -------------------------------------------------
  //  Confirm creation of new password
  //    1) Save to 'applications.password'
  //    2) (Optional) create user in Supabase Auth
  // -------------------------------------------------
  const handleConfirmNewPassword = () => {
    if (!applicant?.email) {
      setShowPasswordModal(false);
      setNotification({
        isOpen: true,
        title: "Error",
        message:
          "Cannot create a new password: no email found for this applicant.",
        type: "error",
      });
      return;
    }
    if (!tempPassword) {
      setShowPasswordModal(false);
      setNotification({
        isOpen: true,
        title: "Error",
        message: "Please enter or generate a password.",
        type: "error",
      });
      return;
    }

    // Confirmation before proceeding
    setConfirmation({
      isOpen: true,
      title: "Confirm Password Creation",
      message:
        "Are you sure you want to create a new password for this applicant?",
      onConfirm: async () => {
        try {
          // 1) Update the 'applications' table with the new password
          const { data: updatedData, error: updateError } = await supabase
            .from("applications")
            .update({ password: tempPassword })
            .eq("id", applicant.id)
            .single();

          if (updateError) throw updateError;

          // 2) (Optional) Create or update user in Supabase Auth
          // Uncomment and modify the following if you want to create/update the user in Auth
          /*
          const { user, error: authError } = await supabase.auth.admin.createUser({
            email: applicant.email,
            password: tempPassword,
            // Add other user details if needed
          });

          if (authError) throw authError;
          */
          const emailTemp = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Gidz Uni Path</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #1f2937; background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e6f3ff 100%); min-height: 100vh;">
                <div style="max-width: 650px; margin: 0 auto; padding: 24px;">
                    <!-- Main Container with Glass Effect -->
                    <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.2); overflow: hidden;">
                        
                        <!-- Header with Modern Gradient -->
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 32px 32px 40px 32px; position: relative;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                                <div style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                                    <img src="${emailAssetUrl("/gidz-transperant.png")}" style="height: 48px; width: auto;" alt="Gidz Uni Path Logo" />
                                </div>
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Gidz Uni Path</h1>
                            </div>
                            <!-- Decorative Elements -->
                            <div style="position: absolute; top: -50%; right: -20%; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                            <div style="position: absolute; bottom: -30%; left: -10%; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.05); border-radius: 50%;"></div>
                        </div>

                        <!-- Main Content with Modern Styling -->
                        <div style="padding: 40px 32px;">
                            <!-- Welcome Section -->
                            <div style="margin-bottom: 32px;">
                                <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome, ${applicant.first_name}! 👋</h2>
                                <p style="font-size: 16px; color: #6b7280; margin: 0; line-height: 1.7;">We're thrilled to support you in achieving your dream of studying in Germany. Your journey to academic excellence starts here!</p>
                            </div>

                            <!-- Login Details Card with Modern Design -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%); border-radius: 20px; padding: 28px; margin-bottom: 32px; border: 1px solid #e5e7eb; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 50%; opacity: 0.1;"></div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: white; font-size: 18px;">🔑</span>
                                    </div>
                                    <h3 style="color: #1f2937; margin: 0; font-size: 20px; font-weight: 600;">Your Login Credentials</h3>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(8px);">
                                    <div style="margin-bottom: 12px;">
                                        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Username</span>
                                        <p style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace; font-size: 15px;">${applicant.email}</p>
                                    </div>
                                    <div>
                                        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Password</span>
                                        <p style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace; font-size: 15px;">${tempPassword}</p>
                                    </div>
                                </div>
                                <a href="https://www.gidzunipath.com/login" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1e40af); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                                    <span>🚀</span> Access Your Portal
                                </a>
                            </div>

                            <!-- Contact Information with Modern Cards -->
                            <div style="margin-bottom: 32px;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: white; font-size: 18px;">💬</span>
                                    </div>
                                    <h3 style="color: #1f2937; margin: 0; font-size: 20px; font-weight: 600;">Need Assistance?</h3>
                                </div>
                                <p style="margin-bottom: 20px; color: #6b7280; font-size: 16px;">Our dedicated team is here to help you every step of the way!</p>
                                
                                <!-- Contact Cards -->
                                <div style="display: grid; gap: 16px;">
                                    <div style="background: rgba(255, 255, 255, 0.8); border-radius: 16px; padding: 20px; border: 1px solid #e5e7eb;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <span style="color: white; font-size: 14px;">📞</span>
                                            </div>
                                            <div>
                                                <p style="margin: 0; color: #1f2937; font-weight: 600;">+94741166235</p>
                                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Monday to Friday, 9:30 AM - 5:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="background: rgba(255, 255, 255, 0.8); border-radius: 16px; padding: 20px; border: 1px solid #e5e7eb;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <span style="color: white; font-size: 14px;">✉️</span>
                                            </div>
                                            <div>
                                                <a href="mailto:gidzunipath@gmail.com" style="margin: 0; color: #3b82f6; font-weight: 600; text-decoration: none;">gidzunipath@gmail.com</a>
                                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">24/7 Email Support</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Journey Message -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 500; text-align: center;">
                                    🎓 We're excited to be part of your educational journey and look forward to assisting you every step of the way!
                                </p>
                            </div>
                        </div>

                        <!-- Modern Footer -->
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                            <div style="text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600; font-size: 16px;">Best regards,</p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">The Gidz Uni Path Team</p>
                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 Gidz Uni Path. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
          `;
          await axios.post("/api/send_email", {
            senderEmail: "gidzunipath@gmail.com",
            recipientEmail: applicant.email,
            subject: "Greetings from Gidz Uni Path",
            template: emailTemp,
          });

          // Update local state with the newly updated applicant
          setApplicant(updatedData);
          setShowPasswordModal(false);
          await fetchApplicant(applicant.id);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Success",
            message: "User created with a new password!",
            type: "success",
          });
        } catch (error) {
          console.error(error);

          setNotification({
            isOpen: true,
            title: "Error",
            message: "Error creating user in Supabase Auth or saving to DB.",
            type: "error",
          });
        }
      },
    });
  };

  // -------------------------------------------
  //  Save special notes (CRUD — no confirm dialog)
  // -------------------------------------------
  const handleSpecialNotesSave = async (value) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ special_notes: value })
        .eq("id", applicant.id);

      if (error) throw error;

      await fetchApplicant(applicant.id);
      setNotification({
        isOpen: true,
        title: "Success",
        message: "Notes saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        isOpen: true,
        title: "Error",
        message: "Error saving notes.",
        type: "error",
      });
      throw error;
    }
  };

  // -------------------------------------------
  //  Save individual field changes
  // -------------------------------------------
  const handleFieldSave = async (field, value) => {
    // Confirmation before saving
    setConfirmation({
      isOpen: true,
      title: `Confirm Update`,
      message: `Are you sure you want to update ${field.replace(/_/g, " ")}?`,
      onConfirm: async () => {
        try {
          const updateData = { [field]: value };
          const { data: updatedData, error } = await supabase
            .from("applications")
            .update(updateData)
            .eq("id", applicant.id)
            .single();

          if (error) throw error;

          await fetchApplicant(applicant.id);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Success",
            message: `${field.replace(/_/g, " ")} updated successfully!`,
            type: "success",
          });
        } catch (error) {
          console.error(error);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Error",
            message: `Error updating ${field.replace(/_/g, " ")}.`,
            type: "error",
          });
        }
      },
    });
  };

  // -------------------------------------------
  //  Handle Lock
  // -------------------------------------------

  const handleChangeStatus = async (newStatus) => {
    if (!applicant || newStatus === applicant.status) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicant.id);

      if (error) throw error;

      await fetchApplicant(applicant.id);
      setNotification({
        isOpen: true,
        title: "Success",
        message: `Status updated to ${getStatusLabel(newStatus)}.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error.message);
      setNotification({
        isOpen: true,
        title: "Error",
        message: "Failed to update status. Please try again.",
        type: "error",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLock = async () => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ lock_1: !lockstate })
        .eq("id", applicant.id);

      if (error) throw error;
      setlockstate(!lockstate);
    } catch (error) {
      console.error("Error updating lock status:", error.message);
      setNotification({
        isOpen: true,
        title: "Error",
        message: error.message,
        type: "error",
      });
    }
  };
  // -------------------------------------------
  //  Applicant Payments Handlers
  // -------------------------------------------

  const handlePaymentSave = (paymentNumber, value) => {
    // Determine the correct field based on payment number
    const field = paymentNumber === 1 ? "payment1" : `payment${paymentNumber}`;

    // Confirmation before saving
    setConfirmation({
      isOpen: true,
      title: `Confirm Update`,
      message: `Are you sure you want to update Payment ${paymentNumber} Status?`,
      onConfirm: async () => {
        try {
          const updateData = { [field]: value };

          const { data: updatedData, error } = await supabase
            .from("applications")
            .update(updateData)
            .eq("id", applicant.id)
            .single();

          if (error) throw error;

          setApplicant(updatedData);
          await fetchApplicant(applicant.id);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Success",
            message: `Payment ${paymentNumber} Status updated successfully!`,
            type: "success",
          });
        } catch (error) {
          console.error(error);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Error",
            message: `Error updating Payment ${paymentNumber} Status.`,
            type: "error",
          });
        }
      },
    });
  };

  // -------------------------------------------
  //  Handle Refund Save
  // -------------------------------------------
  const handleRefundSave = (value) => {
    // Confirmation before saving
    setConfirmation({
      isOpen: true,
      title: `Confirm Update`,
      message: `Are you sure you want to update Refund Status?`,
      onConfirm: async () => {
        try {
          const updateData = { is_refunded: value };

          const { data: updatedData, error } = await supabase
            .from("applications")
            .update(updateData)
            .eq("id", applicant.id)
            .single();

          if (error) throw error;

          setApplicant(updatedData);
          await fetchApplicant(applicant.id);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Success",
            message: `Refund Status updated successfully!`,
            type: "success",
          });
        } catch (error) {
          console.error(error);
          setConfirmation({ ...confirmation, isOpen: false });
          setNotification({
            isOpen: true,
            title: "Error",
            message: `Error updating Refund Status.`,
            type: "error",
          });
        }
      },
    });
  };

  // -------------------------------------------
  //  Helper function to get document URL
  // -------------------------------------------
  function getDocumentUrl(documents, documentName) {
    // Find the document with the matching name
    const document = documents.find((doc) => doc.name === documentName);

    // Return the URL if the document is found, otherwise return the default image URL
    return document?.url || "/logo.png"; // Replace with your default image path
  }

  // -------------------------------------------
  //  Return early if data is not loaded
  // -------------------------------------------
  if (!applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="p-6 pb-12 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading applicant data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------
  //  RENDER
  // -------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Top spacing for navbar */}
      <div className="p-6 pb-12 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 lg:p-8">
            <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="mdi:account-details"
                      className="text-2xl text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {applicant.first_name} {applicant.last_name}
                    </h1>
                    <p className="text-gray-600 text-sm mb-3">
                      Application ID: {applicant.id}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeClass(applicant.status)}`}
                      >
                        <Icon icon="mdi:progress-check" className="inline mr-1.5" />
                        {getStatusLabel(applicant.status)}
                      </span>
                      <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Icon icon="mdi:email" className="inline mr-1.5" />
                        {applicant.email}
                      </div>
                      <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Icon icon="mdi:phone" className="inline mr-1.5" />
                        {applicant.telephone || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                <button
                  type="button"
                  className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60"
                  onClick={() => setShowChangeStatusModal(true)}
                  disabled={updatingStatus}
                >
                  <Icon icon="material-symbols:sync" className="text-lg" />
                  Change Status
                </button>
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-semibold"
                  onClick={handleOpenPasswordModal}
                >
                  <Icon icon="mdi:key-plus" className="text-lg" />
                  Create Password
                </button>
                <button
                  className={`px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-semibold ${
                    lockstate
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  }`}
                  onClick={handleLock}
                >
                  <Icon
                    icon={
                      lockstate ? "solar:lock-bold" : "solar:lock-unlocked-bold"
                    }
                    className="text-lg"
                  />
                  {lockstate ? "Visa Locked" : "Visa Unlocked"}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-2">
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateToTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon icon={tab.icon} className="text-base" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information Section */}
          {activeTab === "overview" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:account" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="First Name"
                    value={applicant.first_name}
                    onSave={(value) => handleFieldSave("first_name", value)}
                  />
                  <EditableField
                    label="Last Name"
                    value={applicant.last_name}
                    onSave={(value) => handleFieldSave("last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Date of Birth"
                    value={applicant.date_of_birth}
                    type="date"
                    onSave={(value) => handleFieldSave("date_of_birth", value)}
                  />
                  <EditableField
                    label="Passport Number"
                    value={applicant.passport_number}
                    onSave={(value) =>
                      handleFieldSave("passport_number", value)
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Telephone"
                    value={applicant.telephone}
                    onSave={(value) => handleFieldSave("telephone", value)}
                  />
                  <EditableField
                    label="Email"
                    value={applicant.email}
                    type="email"
                    onSave={(value) => handleFieldSave("email", value)}
                  />
                </div>
                <EditableField
                  label="Address"
                  value={applicant.address}
                  onSave={(value) => handleFieldSave("address", value)}
                />
                <EditableField
                  label="Educational Background"
                  value={applicant.educational_background}
                  type="select"
                  options={EDUCATIONAL_BACKGROUNDS}
                  onSave={(value) =>
                    handleFieldSave("educational_background", value)
                  }
                />
                {applicant.password && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200 group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Password
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="min-h-[40px] flex items-center">
                          <span className="text-gray-900 font-medium text-base font-mono">
                            {showPassword ? applicant.password : "••••••••"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <Icon
                          icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                          className="text-lg"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Icon icon="mdi:camera" className="text-lg text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Profile Picture
                  </h3>
                </div>
                <div className="relative">
                  <Image
                    src={getDocumentUrl(applicant.documents, "Profile Picture")}
                    alt="profile"
                    width={140}
                    height={140}
                    className="w-35 h-35 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <ProfilePic applicationId={id} />
              </div>
            </div>
          </div>

          )}

          {/* Payments Section */}
          {activeTab === "payments" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:credit-card" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Payment 1
                    </h3>
                    <p className="text-sm text-gray-600">
                      Initial application payment
                    </p>
                  </div>
                  {applicant.payment1 ? (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-lg" />
                      Paid
                    </div>
                  ) : (
                    <YesNoButtonGroup
                      value={applicant.payment1}
                      onChange={(value) => handlePaymentSave(1, value)}
                    />
                  )}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Payment 2
                    </h3>
                    <p className="text-sm text-gray-600">
                      Visa application payment
                    </p>
                  </div>
                  {applicant.payment2 ? (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-lg" />
                      Paid
                    </div>
                  ) : (
                    <YesNoButtonGroup
                      value={applicant.payment2}
                      onChange={(value) => handlePaymentSave(2, value)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Refunded Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:cash-refund" className="text-lg text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Refunded
                </h3>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Refund Status
                    </h4>
                    <p className="text-sm text-gray-600">
                      Payment refund processing status
                    </p>
                  </div>
                  {applicant.is_refunded ? (
                    <div className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center gap-2">
                      <Icon icon="mdi:cash-refund" className="text-lg" />
                      Refunded
                    </div>
                  ) : (
                    <YesNoButtonGroup
                      value={applicant.is_refunded}
                      onChange={(value) => handleRefundSave(value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          )}

          {/* Documents Section */}
          {activeTab === "documents" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Icon
                  icon="mdi:file-document-multiple"
                  className="text-xl text-white"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            </div>
            <div className="space-y-6">
              <DocumentsTable applicationId={id} />
              <div className="border-t border-gray-200 pt-6">
                <DcoumentsFromUs applicationId={id} />
              </div>
            </div>
          </div>

          )}

          {/* Universities Section */}
          {activeTab === "universities" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:university" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Universities</h2>
            </div>
            <UniversitiesTable applicationId={id} />
          </div>
          )}

          {/* Uni Progress Section */}
          {activeTab === "uni-progress" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:school" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">University Progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm space-y-4 rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Create Gmail", option: false },
                    { name: "Passport", option: false },
                    { name: "IELTS", option: false },
                    { name: "OL", option: false },
                    { name: "AL", option: false },
                    { name: "CV", option: false },
                    { name: "School L. C", option: false },
                    { name: "Birth C", option: false },
                  ]}
                  title="Application Setup"
                />
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Bachelor D&T", option: false },
                    { name: "Recommendation", option: false },
                    { name: "Work", option: false },
                    { name: "MOI", option: false },
                  ]}
                  title="Master"
                />
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Create UA ACCOUNT", option: false },
                    { name: "UNI 1 APPLY", option: false },
                    { name: "UNI 2 APPLY", option: false },
                    { name: "UNI 3 APPLY", option: false },
                  ]}
                  title="Admin"
                />
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Admission Latter 1", option: false },
                    { name: "Admission Latter 2", option: false },
                    { name: "Admission Latter 3", option: false },
                    { name: "Enrolled", option: false },
                  ]}
                  title="Admission"
                />
              </div>
            </div>
          </div>
          )}

          {/* Visa Progress Section */}
          {activeTab === "visa-progress" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:passport" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Visa Progress</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Create Gmail", option: false },
                    { name: "Motivation Letter", option: false },
                    { name: "CV", option: false },
                    { name: "Passport", option: false },
                    { name: "Biometric Photo", option: false },
                    { name: "Blocked Account", option: false },
                    { name: "Health Insurance ", option: false },
                  ]}
                  title="Essential Documents"
                />
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Create GP Account", option: false },
                    { name: "Application Form", option: false },
                    { name: "Documents Uploaded", option: false },
                    { name: "Submitted", option: false },
                    { name: "Appointment Date", option: false },
                    { name: "Interview", option: false },
                    { name: "Dorms", option: false },
                  ]}
                  title="Admin"
                />
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <ApplicationOptions
                  applicationId={id}
                  optionsToCheck={[
                    { name: "Travel Insurance", option: false },
                    { name: "Flight Ticket (Dummy)", option: false },
                  ]}
                  title="Admission"
                />
              </div>
            </div>
          </div>
          )}

          {/* Special Notes Section */}
          {activeTab === "notes" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:note-text" className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Special Notes
              </h2>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <SpecialNotesEditor
                rawNotes={applicant.special_notes}
                onSave={handleSpecialNotesSave}
              />
            </div>
          </div>
          )}
        </div>
      </div>

      {showChangeStatusModal && applicant && (
        <ChangeStatusModal
          application={applicant}
          onClose={() => setShowChangeStatusModal(false)}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {/* Password Creation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon icon="mdi:key-plus" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Create New Password</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter or Generate Password
                </label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Type a password or generate one"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={generateRandomPassword}
                >
                  <Icon icon="mdi:auto-fix" className="inline mr-2" />
                  Generate
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                  onClick={handleConfirmNewPassword}
                >
                  <Icon icon="mdi:check" className="inline mr-2" />
                  Confirm
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                  onClick={handleClosePasswordModal}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div
              className={`p-6 text-white ${
                notification.type === "success"
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon
                    icon={
                      notification.type === "success"
                        ? "mdi:check-circle"
                        : "mdi:alert-circle"
                    }
                    className="text-xl"
                  />
                </div>
                <h2 className="text-xl font-semibold">{notification.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">{notification.message}</p>
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                onClick={() => {
                  fetchApplicant(applicant.id);
                  setNotification({ ...notification, isOpen: false });
                }}
              >
                <Icon icon="mdi:close" className="inline mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon icon="mdi:help-circle" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">{confirmation.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">{confirmation.message}</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() =>
                    setConfirmation({ ...confirmation, isOpen: false })
                  }
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                  onClick={confirmation.onConfirm}
                >
                  <Icon icon="mdi:check" className="inline mr-2" />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetail;
