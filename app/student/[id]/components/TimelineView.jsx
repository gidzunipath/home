import React, { useState, useEffect, useCallback } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaFileAlt,
  FaUniversity,
  FaPassport,
  FaTrophy,
  FaChevronRight,
  FaEdit,
  FaPlus,
} from "react-icons/fa";

const TimelineView = ({ applicantData, applicationId }) => {
  const [timelineData, setTimelineData] = useState({
    past: [],
    present: [],
    future: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userNotes, setUserNotes] = useState({});

  const generateTimelineData = useCallback(() => {
    const currentStep = parseInt(applicantData?.status?.slice(-1)) || 1;
    const currentDate = new Date();

    // Past Events (Completed)
    const pastEvents = [];
    if (currentStep >= 1) {
      pastEvents.push({
        id: "registration",
        title: "Account Created",
        description: "Successfully registered with GIDZ Uni Path",
        date: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        type: "completed",
        icon: FaCheckCircle,
        color: "green",
      });
    }

    if (currentStep >= 2) {
      pastEvents.push({
        id: "documents-start",
        title: "Document Collection Started",
        description: "Began uploading required documents",
        date: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        type: "completed",
        icon: FaFileAlt,
        color: "blue",
      });
    }

    if (currentStep >= 3) {
      pastEvents.push({
        id: "university-applications",
        title: "University Applications Submitted",
        description: "Applications sent to selected universities",
        date: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        type: "completed",
        icon: FaUniversity,
        color: "purple",
      });
    }

    // Present Events (In Progress)
    const presentEvents = [];
    if (currentStep === 1) {
      presentEvents.push({
        id: "current-documents",
        title: "Document Collection",
        description: "Upload and organize your academic and personal documents",
        date: currentDate,
        type: "in-progress",
        icon: FaFileAlt,
        color: "blue",
      });
    } else if (currentStep === 2) {
      presentEvents.push({
        id: "current-universities",
        title: "University Selection & Application",
        description: "Choose universities and submit applications",
        date: currentDate,
        type: "in-progress",
        icon: FaUniversity,
        color: "purple",
      });
    } else if (currentStep === 3) {
      presentEvents.push({
        id: "current-visa",
        title: "Visa Application Process",
        description: "Prepare and submit visa application documents",
        date: currentDate,
        type: "in-progress",
        icon: FaPassport,
        color: "orange",
      });
    }

    // Future Events (Upcoming)
    const futureEvents = [];
    if (currentStep < 2) {
      futureEvents.push({
        id: "future-universities",
        title: "University Applications",
        description: "Submit applications to selected universities",
        date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        type: "upcoming",
        icon: FaUniversity,
        color: "purple",
      });
    }

    if (currentStep < 3) {
      futureEvents.push({
        id: "future-visa",
        title: "Visa Application",
        description: "Apply for student visa",
        date: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        type: "upcoming",
        icon: FaPassport,
        color: "orange",
      });
    }

    if (currentStep < 4) {
      futureEvents.push({
        id: "completion",
        title: "Journey Complete",
        description: "Ready to start your studies in Germany!",
        date: new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        type: "upcoming",
        icon: FaTrophy,
        color: "gold",
      });
    }
    setTimelineData({
      past: pastEvents,
      present: presentEvents,
      future: futureEvents,
    });
  }, [applicantData]);

  useEffect(() => {
    generateTimelineData();
  }, [generateTimelineData]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const addNote = (eventId, note) => {
    setUserNotes((prev) => ({
      ...prev,
      [eventId]: note,
    }));
  };

  const TimelineEvent = ({ event, section }) => {
    const IconComponent = event.icon;
    const isSelected = selectedEvent?.id === event.id;

    return (
      <div
        className={`relative flex items-start space-x-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
          isSelected
            ? "bg-sky-50 border border-sky-200"
            : "hover:bg-appleGray-50"
        }`}
        onClick={() => setSelectedEvent(isSelected ? null : event)}
      >
        {/* Timeline Line */}
        {section !== "last" && (
          <div className="absolute left-6 top-16 w-0.5 h-8 bg-appleGray-200"></div>
        )}

        {/* Event Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            event.type === "completed"
              ? "bg-green-100"
              : event.type === "in-progress"
              ? "bg-blue-100"
              : "bg-appleGray-100"
          }`}
        >
          <IconComponent
            className={`w-6 h-6 ${
              event.type === "completed"
                ? "text-green-600"
                : event.type === "in-progress"
                ? "text-blue-600"
                : "text-appleGray-600"
            }`}
          />
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-appleGray-800">
              {event.title}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-appleGray-600">
                {formatDate(event.date)}
              </span>
              <FaChevronRight
                className={`w-3 h-3 text-appleGray-400 transition-transform duration-200 ${
                  isSelected ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>

          <p className="text-sm text-appleGray-600 mb-3">{event.description}</p>

          {/* Status Badge */}
          <div className="flex items-center space-x-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.type === "completed"
                  ? "bg-green-100 text-green-700"
                  : event.type === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-appleGray-100 text-appleGray-700"
              }`}
            >
              {event.type === "completed"
                ? "Completed"
                : event.type === "in-progress"
                ? "In Progress"
                : "Upcoming"}
            </span>
          </div>

          {/* Expanded Details */}
          {isSelected && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-appleGray-200 animate-fade-in-up">
              <div className="space-y-4">
                {/* User Notes */}
                <div>
                  <label className="block text-sm font-medium text-appleGray-700 mb-2">
                    Personal Notes
                  </label>
                  <textarea
                    value={userNotes[event.id] || ""}
                    onChange={(e) => addNote(event.id, e.target.value)}
                    placeholder="Add your notes about this milestone..."
                    className="w-full p-3 border border-appleGray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {event.type === "upcoming" && (
                    <button className="flex items-center space-x-2 px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors duration-200">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>Set Reminder</span>
                    </button>
                  )}
                  <button className="flex items-center space-x-2 px-3 py-2 bg-appleGray-100 text-appleGray-700 rounded-lg text-sm font-medium hover:bg-appleGray-200 transition-colors duration-200">
                    <FaEdit className="w-3 h-3" />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-appleGray-800">
          Your Journey Timeline
        </h3>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-appleGray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-appleGray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-appleGray-400 rounded-full"></div>
            <span className="text-appleGray-600">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Timeline Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Past Events */}
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-green-700 mb-2">
              ✓ Past
            </h4>
            <p className="text-sm text-appleGray-600">Completed milestones</p>
          </div>
          <div className="space-y-4">
            {timelineData.past.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                section={
                  index === timelineData.past.length - 1 ? "last" : "middle"
                }
              />
            ))}
          </div>
        </div>

        {/* Present Events */}
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">
              → Present
            </h4>
            <p className="text-sm text-appleGray-600">Current focus</p>
          </div>
          <div className="space-y-4">
            {timelineData.present.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                section={
                  index === timelineData.present.length - 1 ? "last" : "middle"
                }
              />
            ))}
          </div>
        </div>

        {/* Future Events */}
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-appleGray-700 mb-2">
              ⏰ Future
            </h4>
            <p className="text-sm text-appleGray-600">Upcoming tasks</p>
          </div>
          <div className="space-y-4">
            {timelineData.future.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                section={
                  index === timelineData.future.length - 1 ? "last" : "middle"
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Milestone */}
      <div className="text-center pt-8 border-t border-appleGray-200">
        <button className="flex items-center space-x-2 mx-auto px-4 py-2 bg-sky-100 text-sky-700 rounded-xl text-sm font-medium hover:bg-sky-200 transition-colors duration-200">
          <FaPlus className="w-4 h-4" />
          <span>Add Personal Milestone</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineView;
