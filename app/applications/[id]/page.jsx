"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSystem, AUTH_TYPES } from "../../../hooks/useAuthSystem";
import { Icon } from "@iconify/react";

export default function ApplicationDetails() {
  const router = useRouter();
  const { type, isAuthenticated, loading: authLoading } = useAuthSystem();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingPassword, setCreatingPassword] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (!authLoading) {
      if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) {
        console.log(
          "Unauthorized access to /applications/[id]. Redirecting to /application"
        );
        router.push("/application");
        return;
      }
    }
  }, [authLoading, isAuthenticated, type, router]);

  useEffect(() => {
    const queryId = window.location.pathname.split("/").pop();

    if (isAuthenticated && type === AUTH_TYPES.ADMIN && queryId) {
      fetchData(queryId);
    }
  }, [isAuthenticated, type, router]);

  const fetchData = (id) => {
    setLoading(true);
    setError("");

    // Enhanced mock data for better showcase
    setApplication({
      _id: {
        $oid: "67616af473a09e3efa6424aa",
      },
      id: id,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1999-05-15",
      mobileNumber: "+1234567890",
      email: "john.doe@example.com",
      address: "123 Main Street, Berlin, Germany",
      nationality: "American",
      status: "Step2",
      submittedAt: "2024-01-15",
      type: "Student Visa",
      bachelorOrMasterDegreeCertificate: "bachelor_degree.pdf",
      vocationalTrainingCertificates: "vocational_certificates.pdf",
      regulatedProfessionAuthorization: "regulated_profession.pdf",
      cv: "john_doe_cv.pdf",
      germanLanguageLevel: "B1",
      englishLanguageLevel: "C1 or higher/Native",
      yearsOfProfessionalExperience: "2-5 years",
      experienceTimeline: "In last 5 years",
      previousStayInGermany: "6+ months in last 5 years",
      applyingWithSpouse: true,
      aboutYouAndYourNeeds:
        "I am seeking opportunities to work in Germany as a skilled professional in the healthcare field. I require assistance in understanding the visa and relocation process.",
      password: "qwnzcenm",
    });
    setLoading(false);
  };
  const handleAddPassword = async () => {
    setCreatingPassword(true);
    setError("");

    try {
      const queryId = window.location.pathname.split("/").pop();
      fetchData(queryId); // Refresh the data
    } catch (err) {
      setError("An error occurred: " + err.message);
    } finally {
      setCreatingPassword(false);
    }
  };

  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Step1":
        return "bg-orange-100 text-orange-700";
      case "Step2":
        return "bg-purple-100 text-purple-700";
      case "Step3":
        return "bg-blue-100 text-blue-700";
      case "Step4":
        return "bg-green-100 text-green-700";
      default:
        return "bg-appleGray-100 text-appleGray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Step1":
        return "Documents";
      case "Step2":
        return "University";
      case "Step3":
        return "Blocked Account";
      case "Step4":
        return "Successful";
      default:
        return status;
    }
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-appleGray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Application Details
            </h3>
            <p className="text-appleGray-600">
              Please wait while we fetch the information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated as admin, don't render anything (redirect is happening)
  if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-appleGray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-8 mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-purple-200 rounded-full -ml-12 -mb-12 opacity-30"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-2 text-appleGray-600 mb-3">
                <button
                  onClick={() => router.push("/applications")}
                  className="hover:text-sky-500 transition-colors duration-200 flex items-center space-x-1"
                >
                  <Icon
                    icon="material-symbols:arrow-back"
                    className="text-sm"
                  />
                  <span>Applications</span>
                </button>
                <Icon
                  icon="material-symbols:chevron-right"
                  className="text-lg"
                />
                <span className="font-medium">Application Details</span>
              </div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="material-symbols:person"
                    className="text-2xl text-white"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-appleGray-800">
                    {application?.firstName} {application?.lastName}
                  </h1>
                  <p className="text-appleGray-600 flex items-center space-x-2">
                    <Icon icon="material-symbols:tag" className="text-sm" />
                    <span>Application #{application?.id}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application?.status
                  )}`}
                >
                  <Icon
                    icon={
                      application?.status === "Step4"
                        ? "material-symbols:check-circle"
                        : application?.status === "Step3"
                        ? "material-symbols:passport"
                        : application?.status === "Step2"
                        ? "material-symbols:school"
                        : "material-symbols:description"
                    }
                    className="text-sm mr-2"
                  />
                  {getStatusLabel(application?.status)}
                </span>
                <span className="text-sm text-appleGray-600">
                  {application?.type}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/applications")}
                className="px-6 py-3 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 btn-apple-hover"
              >
                <Icon icon="material-symbols:arrow-back" className="text-lg" />
                <span>Back to List</span>
              </button>
              <button
                onClick={() =>
                  router.push(`/admin/application/${application?.id}`)
                }
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 btn-apple-hover"
              >
                <Icon icon="material-symbols:edit" className="text-lg" />
                <span>Edit Application</span>
              </button>
              <button
                onClick={() =>
                  console.log(`Download PDF for application ${application?.id}`)
                }
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 btn-apple-hover"
              >
                <Icon icon="material-symbols:download" className="text-lg" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Icon
                icon="material-symbols:error"
                className="text-xl text-red-500"
              />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}{" "}
        {application && (
          <>
            {/* Application Status & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Status Card */}
              <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-appleGray-800">
                    Current Status
                  </h3>
                  <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center">
                    <Icon
                      icon="material-symbols:info"
                      className="text-lg text-sky-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    <Icon
                      icon={
                        application.status === "Step4"
                          ? "material-symbols:check-circle"
                          : application.status === "Step3"
                          ? "material-symbols:passport"
                          : application.status === "Step2"
                          ? "material-symbols:school"
                          : "material-symbols:description"
                      }
                      className="text-sm mr-2"
                    />
                    {getStatusLabel(application.status)}
                  </span>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <p className="text-sm font-medium text-appleGray-600 mb-1">
                      Application Type
                    </p>
                    <div className="flex items-center space-x-2">
                      <Icon
                        icon={
                          application.type === "Student Visa"
                            ? "material-symbols:school"
                            : "material-symbols:work"
                        }
                        className="text-lg text-appleGray-500"
                      />
                      <span className="font-medium text-appleGray-800">
                        {application.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <p className="text-sm font-medium text-appleGray-600 mb-1">
                      Submission Date
                    </p>
                    <div className="flex items-center space-x-2">
                      <Icon
                        icon="material-symbols:calendar-today"
                        className="text-lg text-appleGray-500"
                      />
                      <span className="font-medium text-appleGray-800">
                        {new Date(application.submittedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-appleGray-800">
                    Contact Information
                  </h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Icon
                      icon="material-symbols:contact-phone"
                      className="text-lg text-purple-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="material-symbols:mail"
                        className="text-lg text-sky-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          Email Address
                        </p>
                        <p className="text-appleGray-800 font-medium">
                          {application.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="material-symbols:phone"
                        className="text-lg text-green-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          Mobile Number
                        </p>
                        <p className="text-appleGray-800 font-medium">
                          {application.mobileNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <Icon
                        icon="material-symbols:location-on"
                        className="text-lg text-red-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          Address
                        </p>
                        <p className="text-appleGray-800 font-medium">
                          {application.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-appleGray-800">
                    Personal Details
                  </h3>
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Icon
                      icon="material-symbols:person"
                      className="text-lg text-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="material-symbols:cake"
                        className="text-lg text-pink-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          Date of Birth
                        </p>
                        <p className="text-appleGray-800 font-medium">
                          {new Date(
                            application.dateOfBirth
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="material-symbols:flag"
                        className="text-lg text-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          Nationality
                        </p>
                        <p className="text-appleGray-800 font-medium">
                          {application.nationality}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-appleGray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon="material-symbols:group"
                        className="text-lg text-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-appleGray-600">
                          With Spouse
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              application.applyingWithSpouse
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {application.applyingWithSpouse ? (
                              <Icon
                                icon="material-symbols:check"
                                className="text-xs mr-1"
                              />
                            ) : (
                              <Icon
                                icon="material-symbols:close"
                                className="text-xs mr-1"
                              />
                            )}
                            {application.applyingWithSpouse ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Detailed Information */}
            <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-appleGray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-appleGray-800">
                      Detailed Information
                    </h2>
                    <p className="text-appleGray-600 mt-1">
                      Complete application data and submitted documents
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center">
                    <Icon
                      icon="material-symbols:description"
                      className="text-lg text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Language & Experience */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon="material-symbols:language"
                          className="text-lg text-blue-500"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-appleGray-800">
                        Language & Experience
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon
                            icon="material-symbols:translate"
                            className="text-lg text-blue-600"
                          />
                          <p className="text-sm font-semibold text-blue-800">
                            German Language Level
                          </p>
                        </div>
                        <p className="text-blue-900 font-medium text-lg">
                          {application.germanLanguageLevel}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon
                            icon="material-symbols:translate"
                            className="text-lg text-green-600"
                          />
                          <p className="text-sm font-semibold text-green-800">
                            English Language Level
                          </p>
                        </div>
                        <p className="text-green-900 font-medium text-lg">
                          {application.englishLanguageLevel}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon
                            icon="material-symbols:work"
                            className="text-lg text-purple-600"
                          />
                          <p className="text-sm font-semibold text-purple-800">
                            Professional Experience
                          </p>
                        </div>
                        <p className="text-purple-900 font-medium text-lg">
                          {application.yearsOfProfessionalExperience}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon
                            icon="material-symbols:schedule"
                            className="text-lg text-orange-600"
                          />
                          <p className="text-sm font-semibold text-orange-800">
                            Experience Timeline
                          </p>
                        </div>
                        <p className="text-orange-900 font-medium text-lg">
                          {application.experienceTimeline}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border border-pink-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon
                            icon="material-symbols:travel-explore"
                            className="text-lg text-pink-600"
                          />
                          <p className="text-sm font-semibold text-pink-800">
                            Previous Stay in Germany
                          </p>
                        </div>
                        <p className="text-pink-900 font-medium text-lg">
                          {application.previousStayInGermany}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon="material-symbols:folder"
                          className="text-lg text-green-500"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-appleGray-800">
                        Submitted Documents
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          key: "bachelorOrMasterDegreeCertificate",
                          label: "Degree Certificate",
                          icon: "material-symbols:school",
                          color: "bg-blue-500",
                        },
                        {
                          key: "vocationalTrainingCertificates",
                          label: "Vocational Training",
                          icon: "material-symbols:engineering",
                          color: "bg-purple-500",
                        },
                        {
                          key: "regulatedProfessionAuthorization",
                          label: "Professional Authorization",
                          icon: "material-symbols:verified",
                          color: "bg-green-500",
                        },
                        {
                          key: "cv",
                          label: "Curriculum Vitae",
                          icon: "material-symbols:description",
                          color: "bg-orange-500",
                        },
                      ].map(
                        ({ key, label, icon, color }) =>
                          application[key] && (
                            <div
                              key={key}
                              className="flex items-center justify-between p-6 bg-white border border-appleGray-200 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}
                                >
                                  <Icon
                                    icon={icon}
                                    className="text-lg text-white"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-appleGray-800">
                                    {label}
                                  </p>
                                  <p className="text-sm text-appleGray-600">
                                    {application[key]}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all duration-200 hover:scale-105">
                                  <Icon
                                    icon="material-symbols:visibility"
                                    className="text-sm"
                                  />
                                </button>
                                <button className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 hover:scale-105">
                                  <Icon
                                    icon="material-symbols:download"
                                    className="text-sm"
                                  />
                                </button>
                              </div>
                            </div>
                          )
                      )}
                      {!application.bachelorOrMasterDegreeCertificate &&
                        !application.vocationalTrainingCertificates &&
                        !application.regulatedProfessionAuthorization &&
                        !application.cv && (
                          <div className="p-8 bg-appleGray-50 rounded-2xl text-center">
                            <Icon
                              icon="material-symbols:folder-off"
                              className="text-3xl text-appleGray-400 mx-auto mb-3"
                            />
                            <p className="text-appleGray-600">
                              No documents have been submitted yet
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>{" "}
                {/* About Section */}
                {application.aboutYouAndYourNeeds && (
                  <div className="mt-8 pt-8 border-t border-appleGray-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon="material-symbols:person-book"
                          className="text-lg text-indigo-500"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-appleGray-800">
                        About Applicant & Needs
                      </h3>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-3xl border border-indigo-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Icon
                            icon="material-symbols:format-quote"
                            className="text-sm text-white"
                          />
                        </div>
                        <p className="text-indigo-900 leading-relaxed text-lg italic">
                          &quot;{application.aboutYouAndYourNeeds}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Password Section */}
                {application.password ? (
                  <div className="mt-8 pt-8 border-t border-appleGray-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon="material-symbols:verified-user"
                          className="text-lg text-green-500"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-appleGray-800">
                        Client Access
                      </h3>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon
                            icon="material-symbols:check-circle"
                            className="text-xl text-green-600"
                          />
                          <div>
                            <p className="font-semibold text-green-800">
                              Password Active
                            </p>
                            <p className="text-sm text-green-700">
                              Client can access their portal with password:{" "}
                              <code className="bg-green-200 px-2 py-1 rounded text-green-800 font-mono">
                                {application.password}
                              </code>
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2">
                          <Icon
                            icon="material-symbols:content-copy"
                            className="text-sm"
                          />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 pt-8 border-t border-appleGray-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                        <Icon
                          icon="material-symbols:warning"
                          className="text-lg text-yellow-600"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-appleGray-800">
                        Client Access Required
                      </h3>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon
                            icon="material-symbols:key-off"
                            className="text-xl text-yellow-600"
                          />
                          <div>
                            <p className="font-semibold text-yellow-800">
                              Password Required
                            </p>
                            <p className="text-sm text-yellow-700">
                              This application needs a password for client
                              portal access.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleAddPassword}
                          disabled={creatingPassword}
                          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          {creatingPassword ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <Icon
                                icon="material-symbols:key"
                                className="text-lg"
                              />
                              <span>Generate Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
