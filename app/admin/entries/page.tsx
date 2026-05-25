"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../../../lib/supabase";
import StudentQuery from "./student/page";
import WorkQuery from "./work/page";

const EntriesPage = () => {
  const [currentStep, setCurrentStep] = useState("Student");
  const [applicationStats, setApplicationStats] = useState({
    student: { total: 0, read: 0, unread: 0 },
    work: { total: 0, read: 0, unread: 0 },
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const Steps = [
    {
      value: "Student",
      label: "Student Visa",
      icon: "material-symbols:school",
      color: "from-sky-400 to-blue-600",
      stats: applicationStats.student,
    },
    {
      value: "Work",
      label: "Work Visa",
      icon: "material-symbols:work",
      color: "from-purple-400 to-purple-600",
      stats: applicationStats.work,
    },
  ];

  // Get current user information
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/admin-auth/validate");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentUser(data.admin);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
      setIsLoading(false);
    };

    getCurrentUser();
  }, []);

  // Fetch application statistics
  useEffect(() => {
    if (!currentUser) return;

    const fetchApplicationStats = async () => {
      try {
        // Fetch student visa data
        let studentQuery = supabase.from("student_visa").select("*");
        if (currentUser.role === "staff") {
          studentQuery = studentQuery.eq("assigned_to", currentUser.id);
        }
        const { data: studentData, error: studentError } = await studentQuery;

        // Fetch work visa data
        let workQuery = supabase.from("work_visa").select("*");
        if (currentUser.role === "staff") {
          workQuery = workQuery.eq("assigned_to", currentUser.id);
        }
        const { data: workData, error: workError } = await workQuery;

        if (!studentError && !workError) {
          // Process student data
          const studentProcessed = studentData.map((row) => {
            const parsedData = JSON.parse(row.data);
            return {
              ...parsedData,
              MarkasRead: parsedData.MarkasRead ?? false,
            };
          });

          // Process work data
          const workProcessed = workData.map((row) => {
            const parsedData = JSON.parse(row.data);
            return {
              ...parsedData,
              MarkasRead: parsedData.MarkasRead ?? false,
            };
          });

          // Calculate stats
          const studentStats = {
            total: studentProcessed.length,
            read: studentProcessed.filter((s) => s.MarkasRead).length,
            unread: studentProcessed.filter((s) => !s.MarkasRead).length,
          };

          const workStats = {
            total: workProcessed.length,
            read: workProcessed.filter((w) => w.MarkasRead).length,
            unread: workProcessed.filter((w) => !w.MarkasRead).length,
          };

          setApplicationStats({
            student: studentStats,
            work: workStats,
          });
        }
      } catch (error) {
        console.error("Error fetching application stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationStats();
  }, [currentUser]);

  return (
    <div className="bg-appleGray-100 p-5 sm:p-6">
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-appleGray-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-appleGray-400 mr-1">
                  Type
                </p>
                {Steps.map((step) => (
                  <button
                    key={step.value}
                    onClick={() => setCurrentStep(step.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      currentStep === step.value
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-appleGray-100 text-appleGray-600 hover:bg-appleGray-200"
                    }`}
                  >
                    <Icon icon={step.icon} className="text-base" />
                    <span>{step.label}</span>
                    {currentStep === step.value && (
                      <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Statistics Panel */}
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-appleGray-50 border border-appleGray-200 rounded-xl px-4 py-2.5 text-center min-w-[80px] animate-pulse"
                      >
                        <div className="h-6 w-8 bg-appleGray-200 rounded mx-auto mb-1" />
                        <div className="h-3 w-10 bg-appleGray-200 rounded mx-auto" />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="bg-appleGray-50 border border-appleGray-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                      <div className="text-lg font-bold text-appleGray-900">
                        {Steps.find((s) => s.value === currentStep)?.stats.total || 0}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">Total</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                      <div className="text-lg font-bold text-emerald-700">
                        {Steps.find((s) => s.value === currentStep)?.stats.read || 0}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Read</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                      <div className="text-lg font-bold text-amber-700">
                        {Steps.find((s) => s.value === currentStep)?.stats.unread || 0}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">Unread</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="transition-all duration-300 ease-in-out">
            {currentStep === "Student" ? <StudentQuery /> : <WorkQuery />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntriesPage;
