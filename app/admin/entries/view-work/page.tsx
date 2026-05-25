"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Icon } from "@iconify/react";

const ModalBackdrop = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    onClick={onClick}
  />
);

const WorkDetails = () => {
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvUrl, setCvUrl] = useState(null);
  const [transcriptUrl, setTranscriptUrl] = useState(null);
  const [bachelorsUrl, setBachelorsUrl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [assignedAt, setAssignedAt] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/admin-auth/validate");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentUser(data.admin);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role === "staff") return;

    const fetchStaffMembers = async () => {
      try {
        const response = await fetch("/api/admin/staff");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStaffMembers(data.staff);
          }
        }
      } catch (error) {
        console.error("Error fetching staff members:", error);
      }
    };

    fetchStaffMembers();
  }, [currentUser]);

  const fetchAssignedStaff = async (staffId) => {
    if (!staffId) {
      setAssignedStaff(null);
      setAssignedAt(null);
      return;
    }

    try {
      const response = await fetch("/api/admin/staff/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffIds: [staffId] }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.staff.length > 0) {
          setAssignedStaff(result.staff[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching assigned staff:", error);
    }
  };

  const assignWork = async () => {
    if (!work || !selectedStaffId) return;

    try {
      const response = await fetch("/api/admin/assign-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: work.id,
          staffId: selectedStaffId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignedStaff(data.assignedStaff);
          setAssignedAt(new Date().toISOString());
          setIsAssignModalOpen(false);
          setSelectedStaffId("");
        }
      }
    } catch (error) {
      console.error("Error assigning work:", error);
    }
  };

  const unassignWork = async () => {
    if (!work) return;

    try {
      const response = await fetch("/api/admin/assign-work", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId: work.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignedStaff(null);
          setAssignedAt(null);
        }
      }
    } catch (error) {
      console.error("Error unassigning work:", error);
    }
  };

  useEffect(() => {
    const fetchWorkDetails = async () => {
      const workId = sessionStorage.getItem("selectedWorkId");

      if (!workId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("work_visa")
        .select("*")
        .eq("id", workId)
        .single();

      if (error) {
        console.error("Error fetching work details:", error.message);
      } else {
        const parsedData = data.data ? JSON.parse(data.data) : {};
        setWork({ id: data.id, ...parsedData });
        setAssignedAt(data.assigned_at || null);
        setSelectedStaffId(data.assigned_to || "");
        await fetchAssignedStaff(data.assigned_to);

        // Fetch file URL from Supabase Storage
        const fetchFileUrls = async (fileName) => {
          if (!fileName) return null;

          // Extract the relative path if the fileName contains the full URL
          const baseUrl =
            "https://cpzkzyokznbrayxnyfin.supabase.co/storage/v1/object/public/work_visa_files/";
          let relativePath = fileName;

          if (fileName.startsWith(baseUrl)) {
            relativePath = fileName.replace(baseUrl, "");
          }

          // Ensure that filePath is correctly formatted
          const filePath = `${relativePath.split("/").pop()}`;

          // Get public URL from Supabase storage
          const { data } = supabase.storage
            .from("work_visa_files")
            .getPublicUrl(filePath);

          if (!data || !data.publicUrl) {
            console.error(`Error fetching public URL for: ${filePath}`);
            return null;
          }

          console.log(`Fetched file URL from`, data);
          return data.publicUrl;
        };

        const [cvUrl, transcriptUrl, bachelorUrl] = await Promise.all([
          fetchFileUrls(parsedData.bachelorOrMasterDegreeCertificate),
          fetchFileUrls(parsedData.vocationalTrainingCertificates),
          fetchFileUrls(parsedData.cv),
        ]);

        setCvUrl(cvUrl);
        setTranscriptUrl(transcriptUrl);
        setBachelorsUrl(bachelorUrl);
        setLoading(false);
      }
    };

    fetchWorkDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-appleGray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Work Details
            </h3>
            <p className="text-appleGray-600">
              Please wait while we fetch the information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-appleGray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="material-symbols:error"
              className="text-2xl text-red-600"
            />
          </div>
          <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
            No Work Data Found
          </h3>
          <p className="text-appleGray-600 mb-6">
            The requested work visa information could not be found or has been
            removed.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors duration-200"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  const openFileInNewTab = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      console.error("No file URL provided");
    }
  };

  return (
    <div className="min-h-screen bg-appleGray-50">
      {/* Header Section with navbar gap */}
      <div className="relative pt-20 admin-header-separator">
        {/* Subtle divider line for navbar separation */}
        <div className="absolute top-[80px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent z-10"></div>

        {/* Additional visual separation with subtle shadow */}
        <div className="absolute top-[81px] left-0 right-0 h-2 bg-gradient-to-b from-white/20 to-transparent z-10"></div>

        <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white shadow-lg relative admin-dashboard-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Work Visa Details</h1>
                <p className="text-purple-100">
                  Detailed view of work visa application
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="material-symbols:work"
                    className="text-2xl text-white"
                  />
                </div>
                <div>
                  <div className="font-semibold">
                    {work.firstName} {work.lastName}
                  </div>
                  <div className="text-purple-100 text-sm">ID: {work.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Assignment */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:assignment-ind"
                  className="text-xl text-purple-500"
                />
                <span>Assignment</span>
              </h2>
            </div>
            <div className="p-6">
              {assignedStaff ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="material-symbols:person-check"
                        className="text-white text-lg"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-appleGray-900">
                        {assignedStaff.first_name} {assignedStaff.last_name}
                      </div>
                      <div className="text-sm text-appleGray-500">
                        {assignedStaff.role}
                        {assignedStaff.department &&
                          ` • ${assignedStaff.department}`}
                      </div>
                      {assignedAt && (
                        <div className="text-xs text-appleGray-400 mt-1">
                          Assigned on{" "}
                          {new Date(assignedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {currentUser?.role !== "staff" && (
                    <button
                      onClick={unassignWork}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors duration-200"
                    >
                      <Icon icon="material-symbols:person-remove" className="text-base" />
                      <span>Unassign</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-appleGray-500">
                    No staff member assigned to this application yet.
                  </p>
                  {currentUser?.role !== "staff" && (
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 transition-colors duration-200"
                    >
                      <Icon icon="material-symbols:person-add" className="text-base" />
                      <span>Assign Staff</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:person"
                  className="text-xl text-purple-500"
                />
                <span>Personal Information</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "firstName",
                    label: "First Name",
                    icon: "material-symbols:badge",
                  },
                  {
                    name: "lastName",
                    label: "Last Name",
                    icon: "material-symbols:badge",
                  },
                  {
                    name: "dateOfBirth",
                    label: "Date of Birth",
                    icon: "material-symbols:calendar-today",
                  },
                  {
                    name: "mobileNumber",
                    label: "Mobile Number",
                    icon: "material-symbols:phone",
                  },
                  {
                    name: "email",
                    label: "Email",
                    icon: "material-symbols:mail",
                  },
                ].map(({ name, label, icon }) => (
                  <div key={name}>
                    <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                      <Icon
                        icon={icon}
                        className="text-lg text-appleGray-500"
                      />
                      <span>{label}</span>
                    </label>
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                      {work[name] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:workspace-premium"
                  className="text-xl text-purple-500"
                />
                <span>Qualifications</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:school"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Bachelor&apos;s Degree Certificate</span>
                </label>
                {bachelorsUrl ? (
                  <button
                    onClick={() => openFileInNewTab(bachelorsUrl)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View Certificate</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No certificate uploaded</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:work"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Vocational Training Certificate</span>
                </label>
                {transcriptUrl ? (
                  <button
                    onClick={() => openFileInNewTab(transcriptUrl)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View Certificate</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No certificate uploaded</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:description"
                    className="text-lg text-appleGray-500"
                  />
                  <span>CV</span>
                </label>
                {cvUrl ? (
                  <button
                    onClick={() => openFileInNewTab(cvUrl)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View CV</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No CV uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:info"
                  className="text-xl text-purple-500"
                />
                <span>Additional Details</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "germanLanguageLevel",
                    label: "German Language Level",
                    icon: "material-symbols:language",
                  },
                  {
                    name: "englishLanguageLevel",
                    label: "English Language Level",
                    icon: "material-symbols:language",
                  },
                  {
                    name: "yearsOfProfessionalExperience",
                    label: "Years of Experience",
                    icon: "material-symbols:work-history",
                  },
                  {
                    name: "previousStayInGermany",
                    label: "Previous Stay in Germany",
                    icon: "material-symbols:location-on",
                  },
                  {
                    name: "applyingWithSpouse",
                    label: "Applying with Spouse",
                    icon: "material-symbols:people",
                  },
                  {
                    name: "blockedAccount",
                    label: "Blocked Account",
                    icon: "material-symbols:account-balance",
                  },
                ].map(({ name, label, icon }) => (
                  <div key={name}>
                    <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                      <Icon
                        icon={icon}
                        className="text-lg text-appleGray-500"
                      />
                      <span>{label}</span>
                    </label>
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                      {work[name] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>

              {/* About You and Your Needs - Full Width */}
              <div className="mt-6">
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:person-book"
                    className="text-lg text-appleGray-500"
                  />
                  <span>About You and Your Needs</span>
                </label>
                <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800 min-h-[100px]">
                  {work.aboutYouAndYourNeeds || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => window.close()}
              className="bg-appleGray-600 hover:bg-appleGray-700 text-white px-8 py-4 rounded-2xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Icon icon="material-symbols:close" className="text-lg" />
              <span>Close Tab</span>
            </button>
          </div>
        </div>
      </div>

      {isAssignModalOpen && (
        <>
          <ModalBackdrop onClick={() => setIsAssignModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-white rounded-2xl border border-appleGray-200 shadow-medium w-full max-w-md">
              <div className="border-b border-appleGray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-appleGray-900">
                  Assign Staff Member
                </h2>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="w-8 h-8 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <Icon icon="material-symbols:close" className="text-lg text-appleGray-500" />
                </button>
              </div>

              <div className="p-6">
                <label className="block text-xs font-semibold text-appleGray-500 uppercase tracking-wider mb-2">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm mb-5"
                >
                  <option value="">Choose staff member...</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name} - {staff.role}
                      {staff.department && ` (${staff.department})`}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2.5">
                  <button
                    onClick={assignWork}
                    disabled={!selectedStaffId}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-appleGray-200 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Assign Work
                  </button>
                  <button
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkDetails;
