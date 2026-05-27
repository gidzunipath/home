"use client";

import VerticalStepper from "../VerticalStepper";
import {
  FaPassport,
  FaCheckCircle,
  FaComments,
  FaCalendarAlt,
  FaFileAlt,
  FaUserEdit,
  FaEnvelope,
  FaPhone,
  FaCertificate,
  FaUniversity,
  FaQuestionCircle,
  FaLightbulb,
  FaExclamationTriangle,
} from "react-icons/fa";

const INTERVIEW_QUESTIONS = [
  { q: "Q1: What is your name?", a: "My name is [Your Full Name]." },
  {
    q: "Q2: What do your parents do?",
    a: 'My father is a [father\'s occupation], and my mother is a [mother\'s occupation or "homemaker"].',
  },
  {
    q: "Q3: Why do you want to study in Germany?",
    a: "Germany offers world-class education with affordable or no tuition fees, modern facilities, and globally recognized degrees. It's also known for research and innovation, especially in fields like engineering, business, and sciences.",
  },
  {
    q: "Q4: What did you study previously?",
    a: 'For my [A-levels / Bachelor\'s], I studied [subjects] and obtained [grades or degree].\n\nExample for Bachelor\'s applicant: "I studied Mathematics, Physics, and Chemistry in A-levels and received [your grades]."\n\nExample for Master\'s applicant: "I completed my Bachelor\'s in [Your Program] with a GPA of [X.XX]."',
  },
  {
    q: "Q5: Which university are you going to in Germany?",
    a: "I have been admitted to [University Name] in [City].",
  },
  {
    q: "Q6: What is the duration of your program?",
    a: "My program lasts for [3.5 years for Bachelor's / 1.5 or 2 years for Master's], depending on the course structure.",
  },
  {
    q: "Q7: What are your plans after graduation?",
    a: "I intend to return to my home country and apply the skills and knowledge I gain in Germany to contribute to its development, especially in my field of study.",
  },
  {
    q: "Q8: Who is financing your education in Germany?",
    a: "My [father/parents/sponsor] is supporting my education. I also have a blocked account as financial proof.",
  },
  {
    q: "Q9: Where will you stay in Germany?",
    a: "I have applied for student accommodation near the university. If unavailable, I will arrange for private housing nearby.",
  },
  {
    q: "Q10: How did you find and apply to the university?",
    a: "I researched universities online and applied directly through the university website or Uni-Assist (if applicable).",
  },
  {
    q: "Q11: Do you have any work experience?",
    a: "• If no experience: I do not have professional experience yet.\n• If yes: Yes, I worked as a [position] at [company] for [duration].",
  },
  {
    q: "Q12: What is the address of your university?",
    a: "[University Name], [Street Address], [Postal Code] [City], Germany.",
  },
  {
    q: "Q13: Where is your family based?",
    a: "My family lives in [City], [Sri Lanka].",
  },
  {
    q: "Q14: Do you plan to return to your country after your studies?",
    a: "Yes, I plan to return and contribute to my country's development through my expertise.",
  },
  {
    q: "Q15: Do you have any relatives in Germany?",
    a: "• If no: No, I don't have any relatives in Germany.",
  },
  {
    q: "Q16: What do you know about German culture?",
    a: "Germany values punctuality, discipline, and efficiency. It's also rich in history, art, and technology, with a strong emphasis on education and environmental consciousness.",
  },
  {
    q: "Q17: Why did you choose this specific course?",
    a: "The course aligns with my interests and career goals. It combines theoretical knowledge with practical training, which will prepare me well for future challenges.",
  },
  {
    q: "Q18: What are your career goals?",
    a: "I aim to build a strong professional career in [field], gain industry experience, and eventually contribute to innovation and development in my home country.",
  },
  {
    q: "Q19: Do you speak German?",
    a: "I am currently learning basic German. However, my program is in English.",
  },
  {
    q: "Q20: What challenges do you anticipate in Germany?",
    a: "Initially, I might face language and cultural differences, as well as adapting to the weather. But I am motivated to overcome these by engaging with local communities and continuing language studies.",
  },
  {
    q: "Q21: How will you manage your living expenses?",
    a: "I have opened a blocked account as required and will manage my finances carefully.",
  },
  {
    q: "Q22: What is a blocked account, and how much is required?",
    a: "A blocked account is a German bank account for international students, where a fixed amount (currently €11,208 per year) is deposited to cover living expenses.",
  },
  {
    q: "Q23: How will this course support your career?",
    a: "The course provides up-to-date academic knowledge and practical experience, equipping me with the necessary skills to succeed in the global job market.",
  },
  {
    q: "Q24: Can you explain the course modules?",
    a: "• For Bachelor's: Check your modules on the university website\n• For Master's: Check your modules on the university website",
  },
  {
    q: "Q25: Why did you choose Germany over countries like the UK or USA?",
    a: "Germany offers excellent education quality with low or no tuition fees. It has strong industry-academia connections, a high standard of living, and opportunities for international students.",
  },
];

export default function TasksTab({ applicant, visaStepsStatus, onMessageOpen }) {
  if (applicant?.lock_1) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
            Visa Section Locked
          </h3>
          <p className="text-appleGray-600 mb-6">
          You don’t have access to view this section at the moment
          Once your Admission University is completed, access will be granted.
          </p>
          <button
            onClick={onMessageOpen}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Contact Counselor
          </button>
        </div>
      </div>
    );
  }

  const step4IsCurrent =
    visaStepsStatus.find((s) => s.step === 4)?.status === "current";
  const step5IsCurrent =
    visaStepsStatus.find((s) => s.step === 5)?.status === "current";

  const visaStepperSteps = visaStepsStatus.map((item) => ({
    id: item.step,
    title: item.title,
    subtitle: item.description,
    icon: item.icon,
    status:
      item.status === "completed"
        ? "completed"
        : item.status === "current"
        ? "inProgress"
        : "pending",
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Visa Application Progress */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaPassport className="w-5 h-5 text-sky-500 mr-3" />
          Visa Application Progress
        </h3>
        <div className="bg-gradient-to-r from-sky-500/10 to-sky-600/10 p-6 rounded-2xl">
          <VerticalStepper customSteps={visaStepperSteps} />
        </div>
      </div>

      {/* Interview Prep — visible when step 4 is current */}
      {step4IsCurrent && (
        <div>
          <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
            <FaComments className="w-5 h-5 text-sky-500 mr-3" />
            German Student Visa Interview: General Questions & Sample Answers
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-4 md:p-6">
            <div className="space-y-4">
              {INTERVIEW_QUESTIONS.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-blue-200"
                >
                  <h5 className="text-sm font-semibold text-appleGray-800 mb-3 flex items-start">
                    <FaQuestionCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hidden md:inline" />
                    {item.q}
                  </h5>
                  <div className="md:ml-6 bg-blue-50 rounded-xl p-3 md:p-4">
                    <div className="flex items-start space-x-2">
                      <FaLightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 hidden md:inline" />
                      <p className="text-xs md:text-sm text-appleGray-700 whitespace-pre-line leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 md:p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="text-base font-semibold text-green-800 mb-2">
                    Interview Tips:
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Be confident and speak clearly</li>
                    <li>• Dress professionally</li>
                    <li>• Arrive early for your appointment</li>
                    <li>• Bring all required documents organized</li>
                    <li>• Practice these questions beforehand</li>
                    <li>• Be honest and consistent in your answers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Scheduling — visible when step 5 is current */}
      {step5IsCurrent && (
        <div>
          <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
            <FaCalendarAlt className="w-5 h-5 text-sky-500 mr-3" />
            Visa Appointment Scheduling
          </h3>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-3xl p-4 md:p-6">
            <p className="text-sm text-appleGray-600">
              Your counselor will guide you through scheduling your visa
              appointment. Please contact us for further assistance.
            </p>
          </div>
        </div>
      )}

      {/* Visa Document Checklist */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
          <FaPassport className="w-5 h-5 text-sky-500 mr-3" />
          Visa Application – Document Checklist
        </h3>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-4 md:p-6">
          <p className="text-appleGray-700 mb-6 text-sm">
            To apply for your German student visa, please follow these steps
            and submit all required documents via{" "}
            <strong>WhatsApp</strong> or <strong>Email</strong>.
          </p>

          {/* Step 1 */}
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
              For a secure and organized visa process, please create a new
              Gmail account and password exclusively for visa communications.
            </p>
          </div>

          {/* Step 2 */}
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
              {[
                {
                  icon: FaFileAlt,
                  title: "1. Motivation Letter (for the Embassy)",
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
                        <li>
                          • Why you chose this specific degree and university
                        </li>
                        <li>• Your academic background</li>
                        <li>• Your family background</li>
                        <li>
                          • Your goals after graduation and how you plan to
                          contribute to Sri Lanka after returning
                        </li>
                      </ul>
                    </>
                  ),
                },
                {
                  icon: FaPassport,
                  title: "2. Passport Copy",
                  content: (
                    <ul className="text-xs text-appleGray-600 space-y-0.5">
                      <li>
                        • Include all passport pages with stamps, and especially
                        pages 2 to 9
                      </li>
                    </ul>
                  ),
                },
                {
                  icon: FaUserEdit,
                  title: "3. Biometric Photo",
                  content: (
                    <ul className="text-xs text-appleGray-600 space-y-0.5">
                      <li>
                        • Must be a recent photo with a white background
                      </li>
                      <li>
                        • Follows German visa photo specifications (35mm × 45mm)
                      </li>
                    </ul>
                  ),
                },
                {
                  icon: FaCertificate,
                  title: "4. Work Experience / Courses",
                  content: (
                    <ul className="text-xs text-appleGray-600 space-y-0.5">
                      <li>
                        • Include any job experience letters, internships, or
                        extra courses you have completed (if applicable)
                      </li>
                    </ul>
                  ),
                },
              ].map(({ icon: Icon, title, content }) => (
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
    </div>
  );
}
