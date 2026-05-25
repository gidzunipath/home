"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  FaGraduationCap,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaFileUpload,
  FaCertificate,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaMoneyBillWave,
} from "react-icons/fa";

const StudentApplicationForm = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});
  const subjectsList = [
    "Biology",
    "Physics",
    "Chemistry",
    "Combined Mathematics (Pure Mathematics and Applied Mathematics)",
    "Agricultural Science",
    "Economics",
    "Business Studies",
    "Accounting",
    "Political Science",
    "Geography",
    "History",
    "Logic and Scientific Method",
    "Literature (Sinhala, Tamil, English)",
    "Drama and Theatre",
    "Media Studies",
    "Information Technology",
    "Engineering Technology",
    "Biosystems Technology",
    "Science for Technology",
  ];

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  const [formData, setFormData] = useState({
    PersonalInformation: {
      FirstName: "",
      LastName: "",
      Gender: "",
      DateOfBirth: "",
      UniversityType: [],
    },
    ContactInformation: {
      Email: "",
      MobileNo: "",
      Address: "",
      Country: "",
    },
    EducationalQualification: {
      ALevel: {
        SubjectResults: [
          { Subject: "", Result: "" },
          { Subject: "", Result: "" },
          { Subject: "", Result: "" },
        ],
        GPA: {
          RequiredForMasters: false,
          Value: "",
          DegreeName: "",
        },
      },
      TranscriptOrAdditionalDocument: null,
    },
    IELTSResults: {
      ScoreOption: "",
      Reading: "",
      Writing: "",
      Listening: "",
      Speaking: "",
      OverallScore: "",
      Certificate: null,
    },
    CVUpload: {
      File: null,
    },
    WhenApplyingMaster: {
      BachelorsCertificate: null,
      Transcript: null,
    },
    AdditionalInformation: {
      ReferenceCode: "",
      Course: "",
      AcademicYear: "",
      AcademicTerm: "",
      CoursePreferences: [""],
      UniversityPreferences: [""],
      PersonalStatement: "",
    },
    FinancialProof: {
      CanEarnLivingInGermany: "",
      FinancialMeansType: "",
      BlockedAccountAmount: "",
      DeclarationOfCommitment: "",
      SponsorDetails: "",
      OtherFinancialMeans: "",
      FinancialDocuments: null,
    },
  });

  useEffect(() => {
    const ref =
      searchParams.get("ref") ||
      searchParams.get("referral") ||
      searchParams.get("referral_code");
    if (!ref) return;

    setFormData((prev) => ({
      ...prev,
      AdditionalInformation: {
        ...prev.AdditionalInformation,
        ReferenceCode: ref,
      },
    }));
  }, [searchParams]);

  // Define form steps
  const steps = [
    {
      id: 0,
      title: "Personal Information",
      description: "Basic personal details",
      icon: FaUser,
      fields: ["PersonalInformation"],
    },
    {
      id: 1,
      title: "Contact Details",
      description: "How we can reach you",
      icon: FaPhone,
      fields: ["ContactInformation"],
    },
    {
      id: 2,
      title: "Academic & Language Qualifications",
      description: "Educational background and English proficiency",
      icon: FaGraduationCap,
      fields: ["EducationalQualification", "IELTSResults"],
    },
    {
      id: 3,
      title: "Documents & Financial Proof",
      description: "Upload required documents and financial evidence",
      icon: FaFileUpload,
      fields: ["CVUpload", "WhenApplyingMaster", "FinancialProof"],
    },
    {
      id: 4,
      title: "Preferences",
      description: "Course and university choices",
      icon: FaBookOpen,
      fields: ["AdditionalInformation"],
    },
  ];

  // Handle input changes
  const handleInputChange = (section, field, value, index = null) => {
    setFormData((prevData) => {
      const newData = { ...prevData };

      if (index !== null) {
        // Handle array fields
        if (!newData[section][field]) {
          newData[section][field] = [];
        }
        newData[section][field][index] = value;
      } else if (field.includes(".")) {
        // Handle nested fields
        const fieldParts = field.split(".");
        let current = newData[section];
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        current[fieldParts[fieldParts.length - 1]] = value;
      } else {
        // Handle regular fields
        newData[section][field] = value;
      }

      return newData;
    });

    // Clear error for this field
    const errorKey = section + "." + field;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Navigate between steps
  const nextStep = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of the form section smoothly
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of the form section smoothly
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    // Scroll to top of the form section smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  // Validation function for mandatory fields
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Personal Information - Mandatory
        if (!formData.PersonalInformation.FirstName.trim()) {
          newErrors["PersonalInformation.FirstName"] = "First name is required";
        }
        if (!formData.PersonalInformation.LastName.trim()) {
          newErrors["PersonalInformation.LastName"] = "Last name is required";
        }
        if (!formData.PersonalInformation.Gender) {
          newErrors["PersonalInformation.Gender"] = "Gender is required";
        }
        if (!formData.PersonalInformation.DateOfBirth) {
          newErrors["PersonalInformation.DateOfBirth"] =
            "Date of birth is required";
        }
        break;

      case 1: // Contact Information - Mandatory
        if (!formData.ContactInformation.Email.trim()) {
          newErrors["ContactInformation.Email"] = "Email is required";
        }
        if (!formData.ContactInformation.MobileNo.trim()) {
          newErrors["ContactInformation.MobileNo"] =
            "Mobile number is required";
        }
        if (!formData.ContactInformation.Address.trim()) {
          newErrors["ContactInformation.Address"] = "Address is required";
        }
        if (!formData.ContactInformation.Country) {
          newErrors["ContactInformation.Country"] = "Country is required";
        }
        break;

      case 2: // Academic & Language Qualifications - IELTS Mandatory
        if (!formData.IELTSResults.ScoreOption) {
          newErrors["IELTSResults.ScoreOption"] =
            "IELTS information is required";
        }
        // If they have IELTS scores, validate the scores
        if (formData.IELTSResults.ScoreOption === "Yes") {
          if (
            !formData.IELTSResults.Reading ||
            formData.IELTSResults.Reading === ""
          ) {
            newErrors["IELTSResults.Reading"] = "Reading score is required";
          }
          if (
            !formData.IELTSResults.Writing ||
            formData.IELTSResults.Writing === ""
          ) {
            newErrors["IELTSResults.Writing"] = "Writing score is required";
          }
          if (
            !formData.IELTSResults.Listening ||
            formData.IELTSResults.Listening === ""
          ) {
            newErrors["IELTSResults.Listening"] = "Listening score is required";
          }
          if (
            !formData.IELTSResults.Speaking ||
            formData.IELTSResults.Speaking === ""
          ) {
            newErrors["IELTSResults.Speaking"] = "Speaking score is required";
          }
          if (
            !formData.IELTSResults.OverallScore ||
            formData.IELTSResults.OverallScore === ""
          ) {
            newErrors["IELTSResults.OverallScore"] =
              "Overall score is required";
          }
        }
        break;

      case 3: // Documents & Financial Proof - Both Mandatory
        // CV is mandatory
        // if (!formData.CVUpload.File) {
        //   newErrors["CVUpload.File"] = "CV/Resume is required";
        // }
        // Financial proof is mandatory
        // if (!formData.FinancialProof.CanEarnLivingInGermany) {
        //   newErrors["FinancialProof.CanEarnLivingInGermany"] =
        //     "Financial information is required";
        // }
        break;

      case 4: // Preferences - Course Preference Mandatory
        if (!formData.AdditionalInformation.Course.trim()) {
          newErrors["AdditionalInformation.Course"] =
            "Preferred course level is required";
        }
        if (!formData.AdditionalInformation.AcademicYear.trim()) {
          newErrors["AdditionalInformation.AcademicYear"] =
            "Academic year is required";
        }
        if (!formData.AdditionalInformation.AcademicTerm.trim()) {
          newErrors["AdditionalInformation.AcademicTerm"] =
            "Academic term is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload file to storage bucket
  const uploadFile = async (file, folder) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("student_visa_files")
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("student_visa_files").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading file to ${folder}:`, error);
      throw error;
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all mandatory fields before submission
    const finalErrors = {};

    // Personal Information - Mandatory
    if (!formData.PersonalInformation.FirstName.trim()) {
      finalErrors["PersonalInformation.FirstName"] = "First name is required";
    }
    if (!formData.PersonalInformation.LastName.trim()) {
      finalErrors["PersonalInformation.LastName"] = "Last name is required";
    }
    if (!formData.PersonalInformation.Gender) {
      finalErrors["PersonalInformation.Gender"] = "Gender is required";
    }
    if (!formData.PersonalInformation.DateOfBirth) {
      finalErrors["PersonalInformation.DateOfBirth"] =
        "Date of birth is required";
    }

    // Contact Information - Mandatory
    if (!formData.ContactInformation.Email.trim()) {
      finalErrors["ContactInformation.Email"] = "Email is required";
    }
    if (!formData.ContactInformation.MobileNo.trim()) {
      finalErrors["ContactInformation.MobileNo"] = "Mobile number is required";
    }
    if (!formData.ContactInformation.Address.trim()) {
      finalErrors["ContactInformation.Address"] = "Address is required";
    }
    if (!formData.ContactInformation.Country) {
      finalErrors["ContactInformation.Country"] = "Country is required";
    }

    // IELTS - Mandatory
    if (!formData.IELTSResults.ScoreOption) {
      finalErrors["IELTSResults.ScoreOption"] = "IELTS information is required";
    }

    // // Financial Proof - Mandatory
    // if (!formData.FinancialProof.CanEarnLivingInGermany) {
    //   finalErrors["FinancialProof.CanEarnLivingInGermany"] =
    //     "Financial information is required";
    // }

    // Course Preferences - Mandatory
    if (!formData.AdditionalInformation.Course.trim()) {
      finalErrors["AdditionalInformation.Course"] =
        "Preferred course level is required";
    }
    if (!formData.AdditionalInformation.AcademicYear.trim()) {
      finalErrors["AdditionalInformation.AcademicYear"] =
        "Academic year is required";
    }
    if (!formData.AdditionalInformation.AcademicTerm.trim()) {
      finalErrors["AdditionalInformation.AcademicTerm"] =
        "Academic term is required";
    }

    // CV/Resume - Mandatory
    // if (!formData.CVUpload.File) {
    //   finalErrors["CVUpload.File"] = "CV/Resume is required";
    // }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setModalMessage("Please fill in all required fields before submitting.");
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Create a copy of form data for processing
      const processedData = JSON.parse(JSON.stringify(formData));

      // Upload files and replace with URLs
      if (formData.EducationalQualification.TranscriptOrAdditionalDocument) {
        processedData.EducationalQualification.TranscriptOrAdditionalDocument =
          await uploadFile(
            formData.EducationalQualification.TranscriptOrAdditionalDocument,
            "transcript"
          );
      }

      if (formData.IELTSResults.Certificate) {
        processedData.IELTSResults.Certificate = await uploadFile(
          formData.IELTSResults.Certificate,
          "ielts"
        );
      }

      if (formData.CVUpload.File) {
        processedData.CVUpload.File = await uploadFile(
          formData.CVUpload.File,
          "cv"
        );
      }

      if (formData.WhenApplyingMaster.BachelorsCertificate) {
        processedData.WhenApplyingMaster.BachelorsCertificate =
          await uploadFile(
            formData.WhenApplyingMaster.BachelorsCertificate,
            "bachelors"
          );
      }

      if (formData.WhenApplyingMaster.Transcript) {
        processedData.WhenApplyingMaster.Transcript = await uploadFile(
          formData.WhenApplyingMaster.Transcript,
          "transcript"
        );
      }

      if (formData.FinancialProof.FinancialDocuments) {
        processedData.FinancialProof.FinancialDocuments = await uploadFile(
          formData.FinancialProof.FinancialDocuments,
          "financial"
        );
      }

      // Add metadata
      processedData.ApplicationDate = new Date().toISOString();
      processedData.MarkasRead = false;

      // Ensure all array fields are properly formatted
      const sanitizedData = {
        ...processedData,
        PersonalInformation: {
          ...processedData.PersonalInformation,
          UniversityType: Array.isArray(
            processedData.PersonalInformation.UniversityType
          )
            ? processedData.PersonalInformation.UniversityType
            : [],
        },
        AdditionalInformation: {
          ...processedData.AdditionalInformation,
          CoursePreferences: Array.isArray(
            processedData.AdditionalInformation.CoursePreferences
          )
            ? processedData.AdditionalInformation.CoursePreferences.filter(
                (item) => item && item.trim() !== ""
              )
            : [],
          UniversityPreferences: Array.isArray(
            processedData.AdditionalInformation.UniversityPreferences
          )
            ? processedData.AdditionalInformation.UniversityPreferences.filter(
                (item) => item && item.trim() !== ""
              )
            : [],
        },
      };

      // Insert into student_visa table - handle text[] column type correctly
      // The database expects an array with a single JSON string element
      const dataToInsert = JSON.stringify(sanitizedData);

      const insertResult = await supabase
        .from("student_visa")
        .insert([{ data: [dataToInsert] }]); // Wrap in array for text[] column

      const { data, error } = insertResult;
      if (error) throw error;

      setModalMessage(
        "Application submitted successfully! We will contact you soon."
      );
      setIsModalOpen(true);
      // Reset form or redirect
      setFormData({
        PersonalInformation: {
          FirstName: "",
          LastName: "",
          Gender: "",
          DateOfBirth: "",
          UniversityType: [],
        },
        ContactInformation: {
          Email: "",
          MobileNo: "",
          Address: "",
          Country: "",
        },
        EducationalQualification: {
          ALevel: {
            SubjectResults: [
              { Subject: "", Result: "" },
              { Subject: "", Result: "" },
              { Subject: "", Result: "" },
            ],
            GPA: {
              RequiredForMasters: false,
              Value: "",
              DegreeName: "",
            },
          },
          TranscriptOrAdditionalDocument: null,
        },
        IELTSResults: {
          ScoreOption: "",
          Reading: "",
          Writing: "",
          Listening: "",
          Speaking: "",
          OverallScore: "",
          Certificate: null,
        },
        CVUpload: {
          File: null,
        },
        WhenApplyingMaster: {
          BachelorsCertificate: null,
          Transcript: null,
        },
        AdditionalInformation: {
          ReferenceCode: "",
          Course: "",
          AcademicYear: "",
          AcademicTerm: "",
          CoursePreferences: [""],
          UniversityPreferences: [""],
          PersonalStatement: "",
        },
        FinancialProof: {
          CanEarnLivingInGermany: "",
          FinancialMeansType: "",
          BlockedAccountAmount: "",
          DeclarationOfCommitment: "",
          SponsorDetails: "",
          OtherFinancialMeans: "",
          FinancialDocuments: null,
        },
      });
      setCurrentStep(0);
    } catch (error) {
      // Enhanced error logging with detailed error information
      const errorDetails = {
        message: error?.message || "Unknown error",
        code: error?.code || "",
        details: error?.details || "",
        hint: error?.hint || "",
        statusCode: error?.statusCode || error?.status || "",
        stack: error?.stack || "",
      };

      console.error("Error submitting application:", {
        error: errorDetails,
        timestamp: new Date().toISOString(),
        formDataSnapshot: {
          hasPersonalInfo: !!formData.PersonalInformation?.FirstName,
          hasContactInfo: !!formData.ContactInformation?.Email,
          hasALevelData:
            formData.EducationalQualification?.ALevel?.SubjectResults?.length >
            0,
          hasIELTSData: !!formData.IELTSResults?.ScoreOption,
          step: currentStep,
        },
      });

      // User-friendly error message
      let userMessage = "Error submitting application. Please try again.";
      if (
        error?.message?.includes("network") ||
        error?.message?.includes("fetch")
      ) {
        userMessage =
          "Network error. Please check your connection and try again.";
      } else if (
        error?.message?.includes("validation") ||
        error?.code === "VALIDATION_ERROR"
      ) {
        userMessage = "Please check all required fields and try again.";
      } else if (
        error?.message?.includes("file") ||
        error?.message?.includes("upload")
      ) {
        userMessage =
          "File upload error. Please check your files and try again.";
      } else if (
        error?.message?.includes("malformed array literal") ||
        error?.message?.includes("invalid input syntax") ||
        error?.code === "22P02"
      ) {
        userMessage =
          "Data format error. Please check your selections and try again.";
        console.error(
          "Database format error - this may require developer attention"
        );
      } else if (
        error?.message?.includes("duplicate key") ||
        error?.code === "23505"
      ) {
        userMessage =
          "This application may already exist. Please contact support if you continue to have issues.";
      }

      setModalMessage(userMessage);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-appleGray-50 relative overflow-hidden">
      {/* Floating Background Elements - Hidden on mobile */}
      <div className="hidden sm:block absolute top-32 left-10 w-20 h-20 bg-sky-400/10 rounded-full animate-float"></div>
      <div
        className="hidden sm:block absolute top-64 right-16 w-16 h-16 bg-sky-500/15 rounded-2xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="hidden lg:block absolute top-96 left-20 w-12 h-12 bg-sky-600/20 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="hidden lg:block absolute top-80 right-32 w-8 h-8 bg-sky-400/25 rounded-full animate-float"
        style={{ animationDelay: "3s" }}
      ></div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-appleGray-50 via-white to-appleGray-100 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5"></div>

        <div className="container-apple text-center relative z-10 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-soft">
            <FaGraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-appleGray-900 mb-4 sm:mb-6">
            Student Visa
            <span className="block text-gradient bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
              Application
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-appleGray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Start your journey to study abroad. Complete your application in
            simple steps.
          </p>{" "}
          {/* Progress indicator */}
          <div className="max-w-4xl mx-auto mb-2 px-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      index <= currentStep
                        ? "bg-sky-500 text-white shadow-lg"
                        : "bg-appleGray-200 text-appleGray-400"
                    }`}
                    onClick={() => goToStep(index)}
                    title={step.title}
                  >
                    {index < currentStep ? (
                      <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <step.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-6 sm:w-12 lg:w-16 xl:w-24 mx-1 sm:mx-2 transition-all duration-300 ${
                        index < currentStep ? "bg-sky-500" : "bg-appleGray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Form Section */}
      <section className="py-6 sm:py-8 relative">
        <div className="container-apple px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-large p-6 sm:p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-sky-600/10 rounded-full -translate-y-16 translate-x-16"></div>

              <form onSubmit={handleSubmit}>
                {/* Step Content */}
                <div className="min-h-[400px] sm:min-h-[500px]">
                  {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-appleGray-100 gap-4 sm:gap-0">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 w-full sm:w-auto order-2 sm:order-1 ${
                      currentStep === 0
                        ? "bg-appleGray-100 text-appleGray-400 cursor-not-allowed"
                        : "bg-appleGray-200 text-appleGray-700 hover:bg-appleGray-300 btn-apple-hover"
                    }`}
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-sm text-appleGray-500 order-1 sm:order-2">
                    Step {currentStep + 1} of {steps.length}
                  </div>

                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all duration-300 btn-apple-hover shadow-soft w-full sm:w-auto order-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <FaCheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all duration-300 btn-apple-hover shadow-soft w-full sm:w-auto order-3"
                    >
                      <span>Next</span>
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Help Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-sky-500/5 to-sky-600/5 relative">
        <div className="container-apple text-center px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-appleGray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-appleGray-600 mb-6 sm:mb-8">
              Our team is here to assist you with your application process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+94701234567"
                className="flex items-center justify-center space-x-2 bg-white text-sky-600 px-6 py-3 rounded-2xl font-semibold hover:bg-appleGray-50 transition-all duration-300 btn-apple-hover shadow-soft w-full sm:w-auto"
              >
                <FaPhone className="w-4 h-4" />
                <span>Call Us</span>
              </a>
              <a
                href="mailto:info@gidzunipath.com"
                className="flex items-center justify-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-sky-600 transition-all duration-300 btn-apple-hover shadow-soft w-full sm:w-auto"
              >
                <FaEnvelope className="w-4 h-4" />
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-large">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-sky-500" />
              </div>
              <p className="text-appleGray-800 mb-6">{modalMessage}</p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render step content based on current step
  function renderStepContent() {
    switch (currentStep) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderContactInformation();
      case 2:
        return renderAcademicAndLanguageQualifications();
      case 3:
        return renderDocumentsAndFinancialProof();
      case 4:
        return renderAdditionalInformation();
      default:
        return null;
    }
  }

  function renderPersonalInformation() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <FaUser className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sky-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-appleGray-900 mb-2">
            Personal Information
          </h3>
          <p className="text-appleGray-600 text-sm sm:text-base">
            Tell us about yourself
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.PersonalInformation.FirstName}
              onChange={(e) =>
                handleInputChange(
                  "PersonalInformation",
                  "FirstName",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["PersonalInformation.FirstName"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              placeholder="Enter your first name"
              required
            />
            {errors["PersonalInformation.FirstName"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["PersonalInformation.FirstName"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.PersonalInformation.LastName}
              onChange={(e) =>
                handleInputChange(
                  "PersonalInformation",
                  "LastName",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["PersonalInformation.LastName"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              placeholder="Enter your last name"
              required
            />
            {errors["PersonalInformation.LastName"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["PersonalInformation.LastName"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.PersonalInformation.Gender}
              onChange={(e) =>
                handleInputChange(
                  "PersonalInformation",
                  "Gender",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["PersonalInformation.Gender"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors["PersonalInformation.Gender"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["PersonalInformation.Gender"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.PersonalInformation.DateOfBirth}
              onChange={(e) =>
                handleInputChange(
                  "PersonalInformation",
                  "DateOfBirth",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["PersonalInformation.DateOfBirth"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            />
            {errors["PersonalInformation.DateOfBirth"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["PersonalInformation.DateOfBirth"]}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-appleGray-700 mb-2">
            University Type Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Public Universities",
              "Private Universities",
              "Research Universities",
              "Technical Universities",
            ].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-3 p-4 border border-appleGray-200 rounded-2xl hover:bg-appleGray-50 cursor-pointer transition-all duration-200"
              >
                <input
                  type="checkbox"
                  checked={formData.PersonalInformation.UniversityType.includes(
                    type
                  )}
                  onChange={(e) => {
                    const currentTypes =
                      formData.PersonalInformation.UniversityType;
                    if (e.target.checked) {
                      handleInputChange(
                        "PersonalInformation",
                        "UniversityType",
                        [...currentTypes, type]
                      );
                    } else {
                      handleInputChange(
                        "PersonalInformation",
                        "UniversityType",
                        currentTypes.filter((t) => t !== type)
                      );
                    }
                  }}
                  className="w-4 h-4 text-sky-500 border-appleGray-300 rounded focus:ring-sky-500"
                />
                <span className="text-appleGray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderContactInformation() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <FaPhone className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sky-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-appleGray-900 mb-2">
            Contact Information
          </h3>
          <p className="text-appleGray-600 text-sm sm:text-base">
            How can we reach you?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.ContactInformation.Email}
              onChange={(e) =>
                handleInputChange("ContactInformation", "Email", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["ContactInformation.Email"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              placeholder="Enter your email address"
              required
            />
            {errors["ContactInformation.Email"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["ContactInformation.Email"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.ContactInformation.MobileNo}
              onChange={(e) =>
                handleInputChange(
                  "ContactInformation",
                  "MobileNo",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["ContactInformation.MobileNo"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              placeholder="Enter your mobile number"
              required
            />
            {errors["ContactInformation.MobileNo"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["ContactInformation.MobileNo"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Country *
            </label>
            <select
              value={formData.ContactInformation.Country}
              onChange={(e) =>
                handleInputChange(
                  "ContactInformation",
                  "Country",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["ContactInformation.Country"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors["ContactInformation.Country"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["ContactInformation.Country"]}
              </p>
            )}
            {/* </select> */}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.ContactInformation.Address}
              onChange={(e) =>
                handleInputChange(
                  "ContactInformation",
                  "Address",
                  e.target.value
                )
              }
              rows={3}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["ContactInformation.Address"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              placeholder="Enter your full address"
              required
            />
            {errors["ContactInformation.Address"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["ContactInformation.Address"]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  function renderAcademicAndLanguageQualifications() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-6 sm:mb-8">
          <FaGraduationCap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sky-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-appleGray-900 mb-2">
            Academic & Language Qualifications
          </h3>
          <p className="text-appleGray-600 text-sm sm:text-base">
            Your educational background and English proficiency
          </p>
        </div>

        {/* Educational Qualification Section */}
        <div className="space-y-6">
          <div className="text-left">
            <h4 className="text-xl font-semibold text-appleGray-800 mb-2 flex items-center">
              <FaGraduationCap className="w-5 h-5 mr-2 text-sky-500" />
              Educational Background
            </h4>
            <p className="text-appleGray-600 text-sm">
              Your academic qualifications
            </p>
          </div>

          {/* A-Level Results Section */}
          <div className="bg-appleGray-50 p-6 rounded-2xl">
            <h5 className="text-lg font-semibold text-appleGray-800 mb-4">
              G.C.E. Advanced Level (A/L) Results
            </h5>

            {formData.EducationalQualification.ALevel.SubjectResults.map(
              (subject, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                      Subject {index + 1}
                    </label>
                    <select
                      value={subject.Subject}
                      onChange={(e) => {
                        const newSubjects = [
                          ...formData.EducationalQualification.ALevel
                            .SubjectResults,
                        ];
                        newSubjects[index].Subject = e.target.value;
                        handleInputChange(
                          "EducationalQualification",
                          "ALevel.SubjectResults",
                          newSubjects
                        );
                      }}
                      className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                        errors[
                          `EducationalQualification.ALevel.SubjectResults.${index}.Subject`
                        ]
                          ? "border-red-300 bg-red-50"
                          : "border-appleGray-200"
                      }`}
                    >
                      <option value="">Select subject</option>
                      {subjectsList.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                    {errors[
                      `EducationalQualification.ALevel.SubjectResults.${index}.Subject`
                    ] && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors[
                            `EducationalQualification.ALevel.SubjectResults.${index}.Subject`
                          ]
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                      Grade
                    </label>
                    <select
                      value={subject.Result}
                      onChange={(e) => {
                        const newSubjects = [
                          ...formData.EducationalQualification.ALevel
                            .SubjectResults,
                        ];
                        newSubjects[index].Result = e.target.value;
                        handleInputChange(
                          "EducationalQualification",
                          "ALevel.SubjectResults",
                          newSubjects
                        );
                      }}
                      className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                        errors[
                          `EducationalQualification.ALevel.SubjectResults.${index}.Result`
                        ]
                          ? "border-red-300 bg-red-50"
                          : "border-appleGray-200"
                      }`}
                    >
                      <option value="">Select grade</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="S">S</option>
                      <option value="W">W</option>
                    </select>
                    {errors[
                      `EducationalQualification.ALevel.SubjectResults.${index}.Result`
                    ] && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors[
                            `EducationalQualification.ALevel.SubjectResults.${index}.Result`
                          ]
                        }
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="bg-appleGray-50 p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="gpaRequired"
                checked={
                  formData.EducationalQualification.ALevel.GPA
                    .RequiredForMasters
                }
                onChange={(e) =>
                  handleInputChange(
                    "EducationalQualification",
                    "ALevel.GPA.RequiredForMasters",
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-sky-500 border-appleGray-300 rounded focus:ring-sky-500"
              />
              <label
                htmlFor="gpaRequired"
                className="text-sm font-semibold text-appleGray-700"
              >
                Applying for Master&apos;s Degree (GPA Required)
              </label>
            </div>

            {formData.EducationalQualification.ALevel.GPA
              .RequiredForMasters && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    GPA Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={formData.EducationalQualification.ALevel.GPA.Value}
                    onChange={(e) =>
                      handleInputChange(
                        "EducationalQualification",
                        "ALevel.GPA.Value",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your GPA (e.g., 3.75)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Name of your degree (optional)
                  </label>
                  <input
                    type="text"
                    value={
                      formData.EducationalQualification.ALevel.GPA.DegreeName
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "EducationalQualification",
                        "ALevel.GPA.DegreeName",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your degree name (e.g., Bachelor of Science in Computer Science)"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Additional Documents
            </label>
            <div className="border-2 border-dashed border-appleGray-300 rounded-2xl p-6 sm:p-8 text-center hover:border-sky-500 transition-all duration-200">
              <FaFileUpload className="w-6 h-6 sm:w-8 sm:h-8 text-appleGray-400 mx-auto mb-3 sm:mb-4" />
              <input
                type="file"
                onChange={(e) =>
                  handleInputChange(
                    "EducationalQualification",
                    "TranscriptOrAdditionalDocument",
                    e.target.files[0]
                  )
                }
                className="hidden"
                id="transcript-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="transcript-upload"
                className="cursor-pointer text-sky-500 hover:text-sky-600 font-semibold"
              >
                Click to upload additional documents
              </label>
              <p className="text-sm text-appleGray-500 mt-2">
                PDF, JPG, PNG up to 10MB
              </p>
              {formData.EducationalQualification
                .TranscriptOrAdditionalDocument && (
                <p className="text-sm text-green-600 mt-2">
                  ✓{" "}
                  {
                    formData.EducationalQualification
                      .TranscriptOrAdditionalDocument.name
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* English Proficiency Section */}
        <div className="space-y-6">
          <div className="text-left border-t border-appleGray-200 pt-8">
            <h4 className="text-xl font-semibold text-appleGray-800 mb-2 flex items-center">
              <FaCertificate className="w-5 h-5 mr-2 text-sky-500" />
              English Proficiency
            </h4>
            <p className="text-appleGray-600 text-sm">
              IELTS scores and certificates
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Do you have IELTS scores? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Yes", "No", "Planning to take"].map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-4 border border-appleGray-200 rounded-2xl hover:bg-appleGray-50 cursor-pointer transition-all duration-200"
                >
                  <input
                    type="radio"
                    name="ieltsOption"
                    value={option}
                    checked={formData.IELTSResults.ScoreOption === option}
                    onChange={(e) =>
                      handleInputChange(
                        "IELTSResults",
                        "ScoreOption",
                        e.target.value
                      )
                    }
                    className="w-4 h-4 text-sky-500 border-appleGray-300 focus:ring-sky-500"
                  />
                  <span className="text-appleGray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["IELTSResults.ScoreOption"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["IELTSResults.ScoreOption"]}
              </p>
            )}
          </div>

          {formData.IELTSResults.ScoreOption === "Yes" && (
            <div className="bg-appleGray-50 p-6 rounded-2xl">
              <h5 className="text-lg font-semibold text-appleGray-800 mb-4">
                IELTS Scores
              </h5>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {["Reading", "Writing", "Listening", "Speaking"].map(
                  (skill) => (
                    <div key={skill}>
                      <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                        {skill}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={formData.IELTSResults[skill]}
                        onChange={(e) =>
                          handleInputChange(
                            "IELTSResults",
                            skill,
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                          errors[`IELTSResults.${skill}`]
                            ? "border-red-300 bg-red-50"
                            : "border-appleGray-200"
                        }`}
                        placeholder="0.0"
                      />
                      {errors[`IELTSResults.${skill}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`IELTSResults.${skill}`]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Overall Score */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                  Overall Score
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={formData.IELTSResults.OverallScore}
                  onChange={(e) =>
                    handleInputChange(
                      "IELTSResults",
                      "OverallScore",
                      e.target.value
                    )
                  }
                  className={`w-full md:w-48 px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                    errors["IELTSResults.OverallScore"]
                      ? "border-red-300 bg-red-50"
                      : "border-appleGray-200"
                  }`}
                  placeholder="0.0"
                />
                {errors["IELTSResults.OverallScore"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["IELTSResults.OverallScore"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                  IELTS Certificate
                </label>
                <div className="border-2 border-dashed border-appleGray-300 rounded-2xl p-6 sm:p-8 text-center hover:border-sky-500 transition-all duration-200">
                  <FaFileUpload className="w-6 h-6 sm:w-8 sm:h-8 text-appleGray-400 mx-auto mb-3 sm:mb-4" />
                  <input
                    type="file"
                    onChange={(e) =>
                      handleInputChange(
                        "IELTSResults",
                        "Certificate",
                        e.target.files[0]
                      )
                    }
                    className="hidden"
                    id="ielts-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="ielts-upload"
                    className="cursor-pointer text-sky-500 hover:text-sky-600 font-semibold"
                  >
                    Upload IELTS certificate
                  </label>
                  <p className="text-sm text-appleGray-500 mt-2">
                    PDF, JPG, PNG up to 10MB
                  </p>
                  {formData.IELTSResults.Certificate && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.IELTSResults.Certificate.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderDocumentsAndFinancialProof() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-6 sm:mb-8">
          <FaFileUpload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sky-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-appleGray-900 mb-2">
            Documents & Financial Proof
          </h3>
          <p className="text-appleGray-600 text-sm sm:text-base">
            Upload required documents and financial evidence
          </p>
        </div>

        {/* Documents Section */}
        <div className="space-y-6">
          <div className="text-left">
            <h4 className="text-xl font-semibold text-appleGray-800 mb-2 flex items-center">
              <FaFileUpload className="w-5 h-5 mr-2 text-sky-500" />
              Required Documents
            </h4>
            <p className="text-appleGray-600 text-sm">
              Upload your essential documents
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-appleGray-50 p-6 rounded-2xl">
              <h5 className="text-lg font-semibold text-appleGray-800 mb-4">
                CV/Resume
              </h5>
              <div className="border-2 border-dashed border-appleGray-300 rounded-2xl p-6 sm:p-8 text-center hover:border-sky-500 transition-all duration-200">
                <FaFileUpload className="w-6 h-6 sm:w-8 sm:h-8 text-appleGray-400 mx-auto mb-3 sm:mb-4" />
                <input
                  type="file"
                  onChange={(e) =>
                    handleInputChange("CVUpload", "File", e.target.files[0])
                  }
                  className="hidden"
                  id="cv-upload"
                  accept=".pdf,.doc,.docx"
                  required
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer text-sky-500 hover:text-sky-600 font-semibold"
                >
                  Upload your CV/Resume
                </label>
                <p className="text-sm text-appleGray-500 mt-2">
                  PDF, DOC, DOCX up to 10MB
                </p>
                {formData.CVUpload.File && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.CVUpload.File.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Proof Section */}
        <div className="space-y-6">
          <div className="text-left border-t border-appleGray-200 pt-8">
            <h4 className="text-xl font-semibold text-appleGray-800 mb-2 flex items-center">
              <FaMoneyBillWave className="w-5 h-5 mr-2 text-sky-500" />
              Financial Proof
            </h4>
            <p className="text-appleGray-600 text-sm">
              Prove your financial independence for studying in Germany
            </p>
          </div>

          {/* Do You Know About Blocked Account */}
          <div className="bg-appleGray-50 p-6 rounded-2xl">
            <h5 className="text-lg font-semibold text-appleGray-800 mb-4">
              Do you know about Blocked Account?
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-4 border border-appleGray-200 rounded-2xl hover:bg-appleGray-50 cursor-pointer transition-all duration-200"
                >
                  <input
                    type="radio"
                    name="canEarnLiving"
                    value={option}
                    checked={
                      formData.FinancialProof.CanEarnLivingInGermany === option
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "FinancialProof",
                        "CanEarnLivingInGermany",
                        e.target.value
                      )
                    }
                    className="w-4 h-4 text-sky-500 border-appleGray-300 focus:ring-sky-500"
                  />
                  <span className="text-appleGray-700 font-medium">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAdditionalInformation() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <FaBookOpen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sky-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-appleGray-900 mb-2">
            Course Preferences
          </h3>
          <p className="text-appleGray-600 text-sm sm:text-base">
            Tell us about your study preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Preferred Course Level *
            </label>
            <select
              value={formData.AdditionalInformation.Course}
              onChange={(e) =>
                handleInputChange(
                  "AdditionalInformation",
                  "Course",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["AdditionalInformation.Course"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            >
              <option value="">Select course level</option>
              <option value="Bachelors">Bachelor&apos;s Degree</option>
              <option value="Masters">Master&apos;s Degree</option>
              <option value="PHD">PhD (Doctorate)</option>
            </select>
            {errors["AdditionalInformation.Course"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["AdditionalInformation.Course"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Academic Year *
            </label>
            <select
              value={formData.AdditionalInformation.AcademicYear}
              onChange={(e) =>
                handleInputChange(
                  "AdditionalInformation",
                  "AcademicYear",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["AdditionalInformation.AcademicYear"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            >
              <option value="">Select academic year</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            {errors["AdditionalInformation.AcademicYear"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["AdditionalInformation.AcademicYear"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Academic Term *
            </label>
            <select
              value={formData.AdditionalInformation.AcademicTerm}
              onChange={(e) =>
                handleInputChange(
                  "AdditionalInformation",
                  "AcademicTerm",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ${
                errors["AdditionalInformation.AcademicTerm"]
                  ? "border-red-300 bg-red-50"
                  : "border-appleGray-200"
              }`}
              required
            >
              <option value="">Select academic term</option>
              {(() => {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1; // 0-indexed, so add 1
                const selectedYear =
                  parseInt(formData.AdditionalInformation.AcademicYear) ||
                  currentYear;

                // Summer term typically starts around April-May, Winter around October-November
                const summerAvailable =
                  selectedYear > currentYear ||
                  (selectedYear === currentYear && currentMonth <= 4);
                const winterAvailable =
                  selectedYear > currentYear ||
                  (selectedYear === currentYear && currentMonth <= 10);

                return (
                  <>
                    <option value="Summer" disabled={!summerAvailable}>
                      Summer{" "}
                      {summerAvailable
                        ? ""
                        : "(Not available for " + selectedYear + ")"}
                    </option>
                    <option value="Winter" disabled={!winterAvailable}>
                      Winter{" "}
                      {winterAvailable
                        ? ""
                        : "(Not available for " + selectedYear + ")"}
                    </option>
                  </>
                );
              })()}
            </select>
            {errors["AdditionalInformation.AcademicTerm"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["AdditionalInformation.AcademicTerm"]}
              </p>
            )}
          </div>
          <p className="lg:col-span-3 text-sm text-appleGray-500 mt-2">
            Terms may not be available if application deadlines have passed
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-appleGray-700 mb-2">
            Course Preferences (Top 3)
          </label>
          {formData.AdditionalInformation.CoursePreferences.map(
            (course, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={course}
                  onChange={(e) => {
                    const newCourses = [
                      ...formData.AdditionalInformation.CoursePreferences,
                    ];
                    newCourses[index] = e.target.value;
                    handleInputChange(
                      "AdditionalInformation",
                      "CoursePreferences",
                      newCourses
                    );
                  }}
                  className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder={`Course preference ${index + 1}`}
                />
              </div>
            )
          )}
          <button
            type="button"
            onClick={() => {
              if (formData.AdditionalInformation.CoursePreferences.length < 3) {
                handleInputChange(
                  "AdditionalInformation",
                  "CoursePreferences",
                  [...formData.AdditionalInformation.CoursePreferences, ""]
                );
              }
            }}
            className="text-sky-500 hover:text-sky-600 font-semibold text-sm"
          >
            + Add another course preference
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-appleGray-700 mb-2">
            University Preferences (Top 3)
          </label>
          {formData.AdditionalInformation.UniversityPreferences.map(
            (university, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={university}
                  onChange={(e) => {
                    const newUniversities = [
                      ...formData.AdditionalInformation.UniversityPreferences,
                    ];
                    newUniversities[index] = e.target.value;
                    handleInputChange(
                      "AdditionalInformation",
                      "UniversityPreferences",
                      newUniversities
                    );
                  }}
                  className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder={`University preference ${index + 1}`}
                />
              </div>
            )
          )}
          <button
            type="button"
            onClick={() => {
              if (
                formData.AdditionalInformation.UniversityPreferences.length < 3
              ) {
                handleInputChange(
                  "AdditionalInformation",
                  "UniversityPreferences",
                  [...formData.AdditionalInformation.UniversityPreferences, ""]
                );
              }
            }}
            className="text-sky-500 hover:text-sky-600 font-semibold text-sm"
          >
            + Add another university preference
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-appleGray-700 mb-2">
            Personal Statement
          </label>
          <textarea
            value={formData.AdditionalInformation.PersonalStatement}
            onChange={(e) =>
              handleInputChange(
                "AdditionalInformation",
                "PersonalStatement",
                e.target.value
              )
            }
            rows={6}
            className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            placeholder="Tell us why you want to study abroad and what makes you a good candidate..."
          />
          <p className="text-sm text-appleGray-500 mt-2">
            Optional but recommended - helps us understand your motivation
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-appleGray-700 mb-2">
            Reference Code (Optional)
          </label>
          <input
            type="text"
            value={formData.AdditionalInformation.ReferenceCode}
            onChange={(e) =>
              handleInputChange(
                "AdditionalInformation",
                "ReferenceCode",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border border-appleGray-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter reference code if you have one from our consultation"
          />
          <p className="text-sm text-appleGray-500 mt-2">
            If you received a reference code during consultation, enter it here
          </p>
        </div>
      </div>
    );
  }
};

export default StudentApplicationForm;
