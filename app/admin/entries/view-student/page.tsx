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

const StudentDetails = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ieltsDocumentUrl, setIeltsDocumentUrl] = useState(null);
  const [transcriptUrl, setTranscriptUrl] = useState(null);
  const [bachelorsUrl, setBachelorsUrl] = useState(null);
  const [transUrl, setTransUrl] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [financialDocUrl, setFinancialDocUrl] = useState(null);
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

  const assignStudent = async () => {
    if (!student || !selectedStaffId) return;

    try {
      const response = await fetch("/api/admin/assign-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
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
      console.error("Error assigning student:", error);
    }
  };

  const unassignStudent = async () => {
    if (!student) return;

    try {
      const response = await fetch("/api/admin/assign-student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignedStaff(null);
          setAssignedAt(null);
        }
      }
    } catch (error) {
      console.error("Error unassigning student:", error);
    }
  };

  useEffect(() => {
    const fetchWorkDetails = async () => {
      setLoading(true);
      const Id = sessionStorage.getItem("selectedStudentId");

      if (!Id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("student_visa")
          .select("*")
          .eq("id", Id)
          .single();

        if (error) throw new Error(error.message);

        // Parse JSON data column
        const parsedData = data.data ? JSON.parse(data.data) : {};
        setStudent({ id: data.id, ...parsedData });
        setAssignedAt(data.assigned_at || null);
        setSelectedStaffId(data.assigned_to || "");
        await fetchAssignedStaff(data.assigned_to);

        const fetchFileUrls = async (folder, fileName) => {
          if (!fileName) return null;

          // Extract the relative path if the fileName contains the full URL
          const baseUrl =
            "https://cpzkzyokznbrayxnyfin.supabase.co/storage/v1/object/public/student_visa_files/";
          let relativePath = fileName;

          if (fileName.startsWith(baseUrl)) {
            relativePath = fileName.replace(baseUrl, "");
          }

          // Ensure that filePath is correctly formatted
          const decodedFileName = decodeURIComponent(
            relativePath.split("/").pop()
          );
          const filePath = `${folder}/${decodedFileName}`;

          // Get public URL from Supabase storage
          const { data } = supabase.storage
            .from("student_visa_files")
            .getPublicUrl(filePath);

          if (!data || !data.publicUrl) {
            console.error(`Error fetching public URL for: ${filePath}`);
            return null;
          }

          console.log(`Fetched file URL from`, data);
          return data.publicUrl;
        };
        // Fetch file URLs
        const [
          ieltsUrl,
          transcriptUrl,
          cvUrl,
          bachelorsUrl,
          transUrl,
          financialUrl,
        ] = await Promise.all([
          fetchFileUrls("ielts", parsedData.IELTSResults?.Certificate),
          fetchFileUrls(
            "transcript",
            parsedData.EducationalQualification?.TranscriptOrAdditionalDocument
          ),
          fetchFileUrls("cv", parsedData.CVUpload?.File),
          fetchFileUrls(
            "bachelors",
            parsedData.WhenApplyingMaster?.BachelorsCertificate
          ),
          fetchFileUrls("bachelors", parsedData.WhenApplyingMaster?.Transcript),
          fetchFileUrls(
            "financial",
            parsedData.FinancialProof?.FinancialDocuments
          ),
        ]);
        console.log("Ielts Url", ieltsUrl);

        setIeltsDocumentUrl(ieltsUrl);
        setTranscriptUrl(transcriptUrl);
        setCvUrl(cvUrl);
        setBachelorsUrl(bachelorsUrl);
        setTransUrl(transUrl);
        setFinancialDocUrl(financialUrl);
      } catch (err) {
        console.error("Error fetching work details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkDetails();
  }, []);

  // Function to open file in a new tab
  const openFileInNewTab = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      console.error("No file URL provided");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-appleGray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Student Details
            </h3>
            <p className="text-appleGray-600">
              Please wait while we fetch the information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
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
            No Student Data Found
          </h3>
          <p className="text-appleGray-600 mb-6">
            The requested student information could not be found or has been
            removed.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors duration-200"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-appleGray-50">
      {/* Header Section with navbar gap */}
      <div className="relative pt-20 admin-header-separator">
        {/* Subtle divider line for navbar separation */}
        <div className="absolute top-[80px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent z-10"></div>

        {/* Additional visual separation with subtle shadow */}
        <div className="absolute top-[81px] left-0 right-0 h-2 bg-gradient-to-b from-white/20 to-transparent z-10"></div>

        <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-lg relative admin-dashboard-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Student Details</h1>
                <p className="text-sky-100">
                  Detailed view of student visa application
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="material-symbols:person"
                    className="text-2xl text-white"
                  />
                </div>
                <div>
                  <div className="font-semibold">
                    {student.PersonalInformation?.FirstName}{" "}
                    {student.PersonalInformation?.LastName}
                  </div>
                  <div className="text-sky-100 text-sm">ID: {student.id}</div>
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
                  className="text-xl text-sky-500"
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
                      onClick={unassignStudent}
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors duration-200"
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
                  className="text-xl text-sky-500"
                />
                <span>Personal Information</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "FirstName",
                    label: "First Name",
                    icon: "material-symbols:badge",
                  },
                  {
                    name: "LastName",
                    label: "Last Name",
                    icon: "material-symbols:badge",
                  },
                  {
                    name: "Gender",
                    label: "Gender",
                    icon: "material-symbols:person",
                  },
                  {
                    name: "DateOfBirth",
                    label: "Date of Birth",
                    icon: "material-symbols:calendar-today",
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
                      {student.PersonalInformation?.[name] || "Not provided"}
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:school"
                      className="text-lg text-appleGray-500"
                    />
                    <span>University Type</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {student.PersonalInformation?.UniversityType?.map(
                      (option, index) => (
                        <div
                          key={index}
                          className="bg-sky-100 text-sky-700 px-4 py-2 rounded-2xl flex items-center space-x-2"
                        >
                          <Icon
                            icon="material-symbols:check-circle"
                            className="text-lg"
                          />
                          <span className="font-medium">{option}</span>
                        </div>
                      )
                    ) || (
                      <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600">
                        No university type specified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:contact-mail"
                  className="text-xl text-sky-500"
                />
                <span>Contact Information</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "Email",
                    label: "Email",
                    icon: "material-symbols:mail",
                  },
                  {
                    name: "MobileNo",
                    label: "Mobile No",
                    icon: "material-symbols:phone",
                  },
                  {
                    name: "Address",
                    label: "Address",
                    icon: "material-symbols:location-on",
                  },
                  {
                    name: "Country",
                    label: "Country",
                    icon: "material-symbols:public",
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
                      {student.ContactInformation?.[name] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Qualification */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:school"
                  className="text-xl text-sky-500"
                />
                <span>Educational Qualification</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* A-Level Subjects */}
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:grade"
                    className="text-lg text-appleGray-500"
                  />
                  <span>A-Level Subjects</span>
                </label>
                <div className="space-y-3">
                  {student.EducationalQualification?.ALevel?.SubjectResults?.map(
                    (subject, index) => (
                      <div
                        key={index}
                        className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800 flex justify-between items-center"
                      >
                        <span className="font-medium">{subject.Subject}</span>
                        <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-xl font-semibold">
                          {subject.Result}
                        </span>
                      </div>
                    )
                  ) || (
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600">
                      No A-Level subjects provided
                    </div>
                  )}
                </div>
              </div>

              {/* GPA Section */}
              {student.EducationalQualification?.ALevel?.GPA && (
                <div>
                  <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:trending-up"
                      className="text-lg text-appleGray-500"
                    />
                    <span>GPA Information</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-appleGray-600 mb-1 block">
                        Required for Masters
                      </label>
                      <div
                        className={`px-4 py-3 rounded-2xl flex items-center space-x-2 ${
                          student.EducationalQualification.ALevel.GPA
                            .RequiredForMasters
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <Icon
                          icon={
                            student.EducationalQualification.ALevel.GPA
                              .RequiredForMasters
                              ? "material-symbols:check-circle"
                              : "material-symbols:cancel"
                          }
                          className="text-lg"
                        />
                        <span className="font-medium">
                          {student.EducationalQualification.ALevel.GPA
                            .RequiredForMasters
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-appleGray-600 mb-1 block">
                        GPA Value
                      </label>
                      <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                        {student.EducationalQualification.ALevel.GPA.Value ||
                          "Not provided"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-appleGray-600 mb-1 block">
                        Degree Name
                      </label>
                      <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                        {student.EducationalQualification.ALevel.GPA
                          .DegreeName || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transcript Section */}
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:description"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Transcript/Additional Document</span>
                </label>
                {transcriptUrl ? (
                  <button
                    onClick={() => openFileInNewTab(transcriptUrl)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View Transcript</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No transcript uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IELTS Results */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:language"
                  className="text-xl text-sky-500"
                />
                <span>IELTS Results</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:quiz"
                      className="text-lg text-appleGray-500"
                    />
                    <span>Score Option</span>
                  </label>
                  <div
                    className={`px-4 py-3 rounded-2xl flex items-center space-x-2 ${
                      student.IELTSResults?.ScoreOption === "Yes"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <Icon
                      icon={
                        student.IELTSResults?.ScoreOption === "Yes"
                          ? "material-symbols:check-circle"
                          : "material-symbols:cancel"
                      }
                      className="text-lg"
                    />
                    <span className="font-medium">
                      {student.IELTSResults?.ScoreOption || "Not provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:stars"
                      className="text-lg text-appleGray-500"
                    />
                    <span>Overall Score</span>
                  </label>
                  <div className="bg-sky-100 border border-sky-200 rounded-2xl px-4 py-3 text-sky-800 font-semibold text-center">
                    {student.IELTSResults?.OverallScore || "Not provided"}
                  </div>
                </div>
                {[
                  {
                    name: "Reading",
                    label: "Reading",
                    icon: "material-symbols:menu-book",
                  },
                  {
                    name: "Writing",
                    label: "Writing",
                    icon: "material-symbols:edit",
                  },
                  {
                    name: "Listening",
                    label: "Listening",
                    icon: "material-symbols:hearing",
                  },
                  {
                    name: "Speaking",
                    label: "Speaking",
                    icon: "material-symbols:record-voice-over",
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
                      {student.IELTSResults?.[name] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:workspace-premium"
                    className="text-lg text-appleGray-500"
                  />
                  <span>IELTS Certificate</span>
                </label>
                {ieltsDocumentUrl ? (
                  <button
                    onClick={() => openFileInNewTab(ieltsDocumentUrl)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View IELTS Certificate</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No IELTS certificate uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:description"
                  className="text-xl text-sky-500"
                />
                <span>CV Upload</span>
              </h2>
            </div>
            <div className="p-6">
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:file-present"
                    className="text-lg text-appleGray-500"
                  />
                  <span>CV File</span>
                </label>
                {cvUrl ? (
                  <button
                    onClick={() => openFileInNewTab(cvUrl)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
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

          {/* When Applying Master */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:school"
                  className="text-xl text-sky-500"
                />
                <span>When Applying Master</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:workspace-premium"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Bachelors Certificate</span>
                </label>
                {bachelorsUrl ? (
                  <button
                    onClick={() => openFileInNewTab(bachelorsUrl)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
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
                    <span>No Certificate uploaded</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:description"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Transcript</span>
                </label>
                {transUrl ? (
                  <button
                    onClick={() => openFileInNewTab(transUrl)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      className="text-lg"
                    />
                    <span>View Transcript</span>
                  </button>
                ) : (
                  <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:description-off"
                      className="text-lg"
                    />
                    <span>No Transcript uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:info"
                  className="text-xl text-sky-500"
                />
                <span>Additional Information</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  {
                    name: "ReferenceCode",
                    label: "Reference Code",
                    icon: "material-symbols:confirmation-number",
                  },
                  {
                    name: "Course",
                    label: "Course",
                    icon: "material-symbols:menu-book",
                  },
                  {
                    name: "AcademicYear",
                    label: "Academic Year",
                    icon: "material-symbols:calendar-today",
                  },
                  {
                    name: "AcademicTerm",
                    label: "Academic Term",
                    icon: "material-symbols:schedule",
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
                      {student.AdditionalInformation?.[name] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Preferences */}
              <div className="mb-6">
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:favorite"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Course Preferences</span>
                </label>
                <div className="space-y-3">
                  {Array.isArray(
                    student.AdditionalInformation?.CoursePreferences
                  ) ? (
                    student.AdditionalInformation.CoursePreferences.map(
                      (preference, index) => (
                        <div
                          key={index}
                          className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800"
                        >
                          {preference}
                        </div>
                      )
                    )
                  ) : (
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                      {student.AdditionalInformation?.CoursePreferences ||
                        "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* University Preferences */}
              <div className="mb-6">
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:account-balance"
                    className="text-lg text-appleGray-500"
                  />
                  <span>University Preferences</span>
                </label>
                <div className="space-y-3">
                  {Array.isArray(
                    student.AdditionalInformation?.UniversityPreferences
                  ) ? (
                    student.AdditionalInformation.UniversityPreferences.map(
                      (preference, index) => (
                        <div
                          key={index}
                          className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800"
                        >
                          {preference}
                        </div>
                      )
                    )
                  ) : (
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                      {student.AdditionalInformation?.UniversityPreferences ||
                        "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Statement */}
              <div>
                <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                  <Icon
                    icon="material-symbols:article"
                    className="text-lg text-appleGray-500"
                  />
                  <span>Personal Statement</span>
                </label>
                <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-4 text-appleGray-800 min-h-[100px] whitespace-pre-wrap">
                  {student.AdditionalInformation?.PersonalStatement ||
                    "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Proof */}
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 overflow-hidden">
            <div className="bg-appleGray-50 px-6 py-4 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800 flex items-center space-x-2">
                <Icon
                  icon="material-symbols:account-balance-wallet"
                  className="text-xl text-sky-500"
                />
                <span>Financial Proof</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Can Earn Living in Germany */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:work"
                      className="text-lg text-appleGray-500"
                    />
                    <span>Can Earn Living in Germany</span>
                  </label>
                  <div
                    className={`px-4 py-3 rounded-2xl flex items-center space-x-2 ${
                      student.FinancialProof?.CanEarnLivingInGermany === "Yes"
                        ? "bg-green-100 text-green-700"
                        : student.FinancialProof?.CanEarnLivingInGermany ===
                          "No"
                        ? "bg-red-100 text-red-700"
                        : "bg-appleGray-100 text-appleGray-600"
                    }`}
                  >
                    <Icon
                      icon={
                        student.FinancialProof?.CanEarnLivingInGermany === "Yes"
                          ? "material-symbols:check-circle"
                          : student.FinancialProof?.CanEarnLivingInGermany ===
                            "No"
                          ? "material-symbols:cancel"
                          : "material-symbols:help"
                      }
                      className="text-lg"
                    />
                    <span className="font-medium">
                      {student.FinancialProof?.CanEarnLivingInGermany ||
                        "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Financial Information Fields */}
                {[
                  {
                    name: "FinancialMeansType",
                    label: "Financial Means Type",
                    icon: "material-symbols:payments",
                  },
                  {
                    name: "BlockedAccountAmount",
                    label: "Blocked Account Amount",
                    icon: "material-symbols:savings",
                  },
                  {
                    name: "DeclarationOfCommitment",
                    label: "Declaration of Commitment",
                    icon: "material-symbols:gavel",
                  },
                  {
                    name: "SponsorDetails",
                    label: "Sponsor Details",
                    icon: "material-symbols:person-add",
                  },
                  {
                    name: "OtherFinancialMeans",
                    label: "Other Financial Means",
                    icon: "material-symbols:account-balance",
                  },
                ].map(({ name, label, icon }) => (
                  <div key={name} className="md:col-span-1">
                    <label className="text-sm font-medium text-appleGray-700 mb-2 flex items-center space-x-2">
                      <Icon
                        icon={icon}
                        className="text-lg text-appleGray-500"
                      />
                      <span>{label}</span>
                    </label>
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-800">
                      {student.FinancialProof?.[name] || "Not provided"}
                    </div>
                  </div>
                ))}

                {/* Financial Documents */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-appleGray-700 mb-3 flex items-center space-x-2">
                    <Icon
                      icon="material-symbols:attach-file"
                      className="text-lg text-appleGray-500"
                    />
                    <span>Financial Documents</span>
                  </label>
                  {financialDocUrl ? (
                    <button
                      onClick={() => openFileInNewTab(financialDocUrl)}
                      className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <Icon
                        icon="material-symbols:visibility"
                        className="text-lg"
                      />
                      <span>View Financial Documents</span>
                    </button>
                  ) : (
                    <div className="bg-appleGray-100 border border-appleGray-200 rounded-2xl px-4 py-3 text-appleGray-600 flex items-center space-x-2">
                      <Icon
                        icon="material-symbols:description-off"
                        className="text-lg"
                      />
                      <span>No financial documents uploaded</span>
                    </div>
                  )}
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
                  className="w-full px-3 py-2.5 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm mb-5"
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
                    onClick={assignStudent}
                    disabled={!selectedStaffId}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-appleGray-200 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Assign Student
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

export default StudentDetails;
