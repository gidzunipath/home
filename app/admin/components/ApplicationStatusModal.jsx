"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

export const APPLICATION_STATUS_OPTIONS = [
  { value: "Step1", label: "University Documents", color: "bg-blue-100 text-blue-700", icon: "material-symbols:school" },
  { value: "Step2", label: "University", color: "bg-purple-100 text-purple-700", icon: "material-symbols:account-balance" },
  { value: "Step3", label: "Blocked Account", color: "bg-orange-100 text-orange-700", icon: "material-symbols:description" },
  { value: "Step4", label: "Visa", color: "bg-red-100 text-red-700", icon: "material-symbols:passport" },
  { value: "Step5", label: "Visa Appointment", color: "bg-yellow-100 text-yellow-700", icon: "material-symbols:event" },
  { value: "Step6", label: "Interview", color: "bg-indigo-100 text-indigo-700", icon: "material-symbols:record-voice-over" },
  { value: "Step7", label: "Successful", color: "bg-green-100 text-green-700", icon: "material-symbols:check-circle" },
];

export const getStatusLabel = (status) => {
  const option = APPLICATION_STATUS_OPTIONS.find((o) => o.value === status);
  return option?.label || status;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    Step7: "bg-emerald-100 text-emerald-700",
    Step6: "bg-indigo-100 text-indigo-700",
    Step5: "bg-amber-100 text-amber-700",
    Step4: "bg-red-100 text-red-700",
    Step3: "bg-orange-100 text-orange-700",
    Step2: "bg-purple-100 text-purple-700",
    Step1: "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const ModalBackdrop = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    onClick={onClick}
  />
);

export const ChangeStatusModal = ({ application, onClose, onChangeStatus }) => {
  const [newStatus, setNewStatus] = useState(application.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeStatus(newStatus);
    onClose();
  };

  const getCurrentStatus = () =>
    APPLICATION_STATUS_OPTIONS.find((o) => o.value === application.status);

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 w-full max-w-md">
          <div className="border-b border-gray-200 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Change Status</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors duration-200"
              >
                <Icon icon="material-symbols:close" className="text-xl text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Current Status</label>
              <div className={`flex items-center space-x-3 p-4 rounded-2xl ${getCurrentStatus()?.color}`}>
                <Icon icon={getCurrentStatus()?.icon} className="text-xl" />
                <span className="font-medium">{getCurrentStatus()?.label}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Change to</label>
                <div className="space-y-3">
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        newStatus === option.value
                          ? "border-sky-500 bg-sky-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={newStatus === option.value}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="sr-only"
                      />
                      <Icon icon={option.icon} className="text-xl text-gray-600 shrink-0" />
                      <span className="font-medium text-gray-800 flex-1">{option.label}</span>
                      {newStatus === option.value && (
                        <Icon icon="material-symbols:check-circle" className="text-xl text-sky-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all duration-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Icon icon="material-symbols:sync" className="text-lg" />
                  <span>Update Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
