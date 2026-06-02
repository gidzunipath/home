import React from "react";
import {
  FaCheck,
  FaFileAlt,
  FaUniversity,
  FaPassport,
  FaTrophy,
  FaCalendarAlt,
  FaGraduationCap,
  FaComments,
} from "react-icons/fa";

const DEFAULT_STEPS = [
    {
      id: 1,
      title: "University Documents",
      subtitle: "Upload academic documents",
      icon: FaGraduationCap,
    },
    {
      id: 2,
      title: "University",
      subtitle: "Apply to universities",
      icon: FaUniversity,
    },
    {
      id: 3,
      title: "Blocked Account",
      subtitle: "Open your blocked account",
      icon: FaFileAlt,
    },
    {
      id: 4,
      title: "Visa Documents",
      subtitle: "Upload visa documents",
      icon: FaPassport,
    },
    {
      id: 5,
      title: "Visa Appointment",
      subtitle: "Schedule appointment",
      icon: FaCalendarAlt,
    },
    {
      id: 6,
      title: "Interview",
      subtitle: "Prepare for your visa interview",
      icon: FaComments,
    },
    {
      id: 7,
      title: "Successful",
      subtitle: "Journey complete",
      icon: FaTrophy,
    },
];

export default function VerticalStepper({
  currentStep = 1,
  customSteps,
  maxStep,
}) {
  const allSteps = customSteps ?? DEFAULT_STEPS;
  const steps =
    maxStep != null
      ? allSteps.filter((step) => step.id <= maxStep)
      : allSteps;
  const resolvedCurrentStep = parseInt(currentStep, 10) || 1;

  const getStatus = (step) => {
    if (customSteps) return step.status;
    const stepId = step.id;
    if (stepId < resolvedCurrentStep) return "completed";
    if (stepId === resolvedCurrentStep) return "inProgress";
    return "pending";
  };

  // Render the icon depending on status
  const renderIcon = (status, StepIcon) => {
    if (status === "completed") {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500 shadow-soft">
          <FaCheck className="text-white text-lg" />
        </div>
      );
    }

    if (status === "inProgress") {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500 shadow-soft">
          <StepIcon className="text-white text-lg" />
        </div>
      );
    }

    // "pending"
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-appleGray-200 shadow-soft">
        <StepIcon className="text-appleGray-400 text-lg" />
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Mobile Layout - Vertical */}
      <ol className="flex flex-col space-y-4 md:hidden">
        {steps.map((step, index) => {
          const status = getStatus(step);
          const isLastStep = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex items-start space-x-4">
              {/* Step Icon */}
              <div className="flex-shrink-0">
                {renderIcon(status, step.icon)}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-base ${
                    status === "completed"
                      ? "text-green-600"
                      : status === "inProgress"
                      ? "text-sky-600"
                      : "text-appleGray-500"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-appleGray-500 mt-1">
                  {step.subtitle}
                </p>
                <span className="text-xs text-appleGray-400 mt-1 block">
                  Step {step.id}
                </span>
              </div>

              {/* Vertical connecting line for mobile */}
              {!isLastStep && (
                <div
                  className={`absolute left-2 top-12 w-0.5 h-8 ${
                    status === "completed"
                      ? "bg-green-500"
                      : status === "inProgress"
                      ? "bg-sky-500"
                      : "bg-appleGray-300"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Desktop Layout - Horizontal */}
      <ol className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const status = getStatus(step);
          const isLastStep = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className="relative flex flex-col items-center flex-1"
            >
              {/* Step Icon */}
              <div className="flex flex-col items-center">
                {renderIcon(status, step.icon)}

                {/* Step Details */}
                <div className="mt-3 text-center">
                  <h3
                    className={`font-semibold text-sm ${
                      status === "completed"
                        ? "text-green-600"
                        : status === "inProgress"
                        ? "text-sky-600"
                        : "text-appleGray-500"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-appleGray-500 mt-1">
                    {step.subtitle}
                  </p>
                  <span className="text-xs text-appleGray-400 mt-1 block">
                    Step {step.id}
                  </span>
                </div>
              </div>

              {/* Horizontal connecting line for desktop */}
              {!isLastStep && (
                <div
                  className={`absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 translate-x-6 ${
                    status === "completed"
                      ? "bg-green-500"
                      : status === "inProgress"
                      ? "bg-sky-500"
                      : "bg-appleGray-300"
                  }`}
                  style={{ zIndex: -1 }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
