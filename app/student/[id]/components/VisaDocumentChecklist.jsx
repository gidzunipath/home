"use client";

import {
  FaPassport,
  FaCheckCircle,
  FaFileAlt,
  FaUserEdit,
  FaCertificate,
  FaUniversity,
} from "react-icons/fa";

const CHECKLIST_ITEMS = [
  {
    icon: FaUniversity,
    title: "1. Block Account Confirmation",
    content: (
      <ul className="text-xs text-appleGray-600 space-y-0.5">
        <li>
          • We will create a block account and please transfer the fund in 1
          week after getting the admission letter.
        </li>
      </ul>
    ),
  },
  {
    icon: FaFileAlt,
    title: "2. Motivation Letter (for the Embassy)",
    content: (
      <>
        <p className="text-xs text-appleGray-500 mb-2">
          This is required along with your Admission Letter.
        </p>
        <p className="text-xs font-medium text-appleGray-700 mb-1">
          Your motivation letter should clearly include:
        </p>
        <ul className="text-xs text-appleGray-600 space-y-0.5">
          <li>• Why you want to study in Germany</li>
          <li>• Why you chose this specific degree and university</li>
          <li>• Your academic background</li>
          <li>• Your family background</li>
          <li>
            • Your goals after graduation and how you plan to contribute to
            Sri Lanka after returning
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: FaPassport,
    title: "3. Passport Copy",
    content: (
      <ul className="text-xs text-appleGray-600 space-y-0.5">
        <li>
          • Include all passport pages with stamps, and especially pages 2 to 9
        </li>
      </ul>
    ),
  },
  {
    icon: FaUserEdit,
    title: "4. Biometric Photo",
    content: (
      <ul className="text-xs text-appleGray-600 space-y-0.5">
        <li>• Must be a recent photo with a white background</li>
        <li>
          • Follows German visa photo specifications (35mm × 45mm)
        </li>
      </ul>
    ),
  },
  {
    icon: FaCertificate,
    title: "5. Work Experience / Courses",
    content: (
      <ul className="text-xs text-appleGray-600 space-y-0.5">
        <li>
          • Include any job experience letters, internships, or extra courses
          you have completed (if applicable)
        </li>
      </ul>
    ),
  },
];

export default function VisaDocumentChecklist() {
  return (
    <div>
      <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
        <FaPassport className="w-5 h-5 text-sky-500 mr-3" />
        Visa Application – Document Checklist
      </h3>

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-4 md:p-6">
        <p className="text-appleGray-700 mb-6 text-sm">
          To apply for your German student visa, please follow these steps and
          submit all required documents via <strong>WhatsApp</strong> or{" "}
          <strong>Email</strong>.
        </p>

        <div className="mb-6">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <FaCheckCircle className="w-3 h-3 text-white" />
            </div>
            <h4 className="text-base font-semibold text-appleGray-800">
              STEP 1: Create a New Email Address
            </h4>
          </div>
          <p className="text-appleGray-600 ml-9 text-sm">
            For a secure and organized visa process, please create a new Gmail
            account and password exclusively for visa communications.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <FaCheckCircle className="w-3 h-3 text-white" />
            </div>
            <h4 className="text-base font-semibold text-appleGray-800">
              STEP 2: Submit the Following Documents
            </h4>
          </div>
          <p className="text-appleGray-600 ml-9 mb-5 text-sm">
            Please send clear scanned copies of the following documents:
          </p>

          <div className="ml-9 space-y-4">
            {CHECKLIST_ITEMS.map(({ icon: Icon, title, content }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-4 border border-orange-200"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <Icon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0 hidden md:inline" />
                  <h5 className="text-sm font-semibold text-appleGray-800">
                    {title}
                  </h5>
                </div>
                <div className="md:ml-8">{content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
