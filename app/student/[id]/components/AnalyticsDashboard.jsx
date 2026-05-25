import React, { useState, useEffect, useCallback } from "react";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaUniversity,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBolt,
  FaAward,
  FaUsers,
  FaGlobe,
} from "react-icons/fa";

const AnalyticsDashboard = ({
  applicantData,
  applicationId,
  dashboardStats,
}) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeframe, setTimeframe] = useState("30days");
  const [loading, setLoading] = useState(true);

  const generateAnalytics = useCallback(() => {
    setLoading(true);

    // Mock analytics data - in real app, this would come from backend
    const currentStep = parseInt(applicantData?.status?.slice(-1)) || 1;
    const startDate = new Date(
      applicantData?.created_at || Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    const daysSinceStart = Math.floor(
      (new Date() - startDate) / (1000 * 60 * 60 * 24)
    );

    const analytics = {
      overview: {
        totalTime: daysSinceStart,
        efficiency: Math.min(95, 60 + dashboardStats.progressPercentage * 0.4),
        completion: dashboardStats.progressPercentage,
        benchmark: 73, // Average completion rate for similar applications
      },
      progress: {
        weeklyProgress: [
          { week: "Week 1", progress: 15, benchmark: 20 },
          { week: "Week 2", progress: 35, benchmark: 40 },
          { week: "Week 3", progress: 55, benchmark: 60 },
          {
            week: "Week 4",
            progress: dashboardStats.progressPercentage,
            benchmark: 73,
          },
        ],
        milestones: [
          {
            name: "Registration",
            completed: true,
            date: startDate,
            duration: 1,
          },
          {
            name: "Documents",
            completed: currentStep >= 2,
            date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            duration: 7,
          },
          {
            name: "Universities",
            completed: currentStep >= 3,
            date: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
            duration: 10,
          },
          {
            name: "Visa Process",
            completed: currentStep >= 4,
            date: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000),
            duration: 14,
          },
        ],
      },
      predictions: {
        estimatedCompletion: new Date(
          Date.now() +
            (100 - dashboardStats.progressPercentage) * 2 * 24 * 60 * 60 * 1000
        ),
        successProbability: Math.min(
          95,
          65 + dashboardStats.progressPercentage * 0.3
        ),
        riskFactors: [
          {
            factor: "Document Delays",
            risk: dashboardStats.documentsUploaded < 5 ? "High" : "Low",
          },
          {
            factor: "Payment Issues",
            risk:
              !applicantData?.payment1 || !applicantData?.payment2
                ? "High"
                : "Low",
          },
          {
            factor: "University Deadlines",
            risk: dashboardStats.universitiesApplied < 2 ? "Medium" : "Low",
          },
        ],
      },
      benchmarks: {
        avgCompletionTime: 28, // days
        avgDocumentUpload: 12, // days
        avgUniversityApplications: 3.2,
        successRate: 87, // percentage
      },
      activity: {
        loginFrequency: 4.2, // times per week
        avgSessionTime: 18, // minutes
        peakActivityTime: "14:00-16:00",
        documentsPerWeek: 2.1,
      },    };
    setAnalyticsData(analytics);
    setLoading(false);
  }, [applicantData, dashboardStats]);

  useEffect(() => {
    generateAnalytics();
  }, [generateAnalytics]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const ProgressChart = ({ data }) => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-appleGray-700">{item.week}</span>
            <span className="text-appleGray-600">{item.progress}%</span>
          </div>
          <div className="relative h-3 bg-appleGray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${item.progress}%` }}
            ></div>
            <div
              className="absolute left-0 top-0 h-full border-2 border-dashed border-appleGray-400 bg-transparent rounded-full"
              style={{ width: `${item.benchmark}%` }}
            ></div>
          </div>
          <div className="text-xs text-appleGray-500">
            Target: {item.benchmark}%
          </div>
        </div>
      ))}
    </div>
  );

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    color = "sky",
  }) => (
    <div
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-3xl border border-${color}-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 bg-${color}-500 rounded-2xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>{" "}
        {trend && (
          <div
            className={`flex items-center space-x-1 text-xs font-medium ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? (
              <FaArrowUp className="w-3 h-3" />
            ) : (
              <FaArrowDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className={`text-2xl font-bold text-${color}-800`}>{value}</div>
        <div className="text-sm font-medium text-appleGray-700">{title}</div>
        {subtitle && (
          <div className="text-xs text-appleGray-600">{subtitle}</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaChartLine className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-appleGray-800">
            Analytics Dashboard
          </h3>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-white border border-appleGray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaClock}
          title="Days Since Start"
          value={analyticsData.overview?.totalTime || 0}
          subtitle="Application duration"
          color="sky"
        />
        <StatCard
          icon={FaBolt}
          title="Efficiency Score"
          value={`${Math.round(analyticsData.overview?.efficiency || 0)}%`}
          subtitle="Above average performance"
          trend={5}
          color="green"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Completion Rate"
          value={`${analyticsData.overview?.completion || 0}%`}
          subtitle={`vs ${analyticsData.overview?.benchmark}% average`}
          trend={
            analyticsData.overview?.completion >
            analyticsData.overview?.benchmark
              ? 3
              : -2
          }
          color="purple"
        />
        <StatCard
          icon={FaAward}
          title="Success Probability"
          value={`${Math.round(
            analyticsData.predictions?.successProbability || 0
          )}%`}
          subtitle="Based on current progress"
          color="orange"
        />
      </div>

      {/* Progress Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-appleGray-200">
          <div className="flex items-center space-x-3 mb-6">
            <FaChartBar className="w-5 h-5 text-sky-500" />
            <h4 className="text-lg font-semibold text-appleGray-800">
              Progress Tracking
            </h4>
          </div>
          <ProgressChart data={analyticsData.progress?.weeklyProgress || []} />
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-appleGray-200">
          <div className="flex items-center space-x-3 mb-6">
            <FaCalendarAlt className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-semibold text-appleGray-800">
              Milestone Timeline
            </h4>
          </div>
          <div className="space-y-4">
            {analyticsData.progress?.milestones?.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.completed
                      ? "bg-green-500 text-white"
                      : "bg-appleGray-200 text-appleGray-500"
                  }`}
                >
                  {milestone.completed ? (
                    <FaCheckCircle className="w-4 h-4" />
                  ) : (
                    <FaClock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        milestone.completed
                          ? "text-appleGray-800"
                          : "text-appleGray-600"
                      }`}
                    >
                      {milestone.name}
                    </span>
                    <span className="text-sm text-appleGray-500">
                      {formatDate(milestone.date)}
                    </span>
                  </div>
                  <div className="text-xs text-appleGray-500">
                    {milestone.duration} days estimated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-appleGray-200">
          <div className="flex items-center space-x-3 mb-6">
            <FaExclamationTriangle className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-appleGray-800">
              Risk Assessment
            </h4>
          </div>
          <div className="space-y-4">
            {analyticsData.predictions?.riskFactors?.map((risk, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-appleGray-50 rounded-xl"
              >
                <span className="font-medium text-appleGray-800">
                  {risk.factor}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(
                    risk.risk
                  )}`}
                >
                  {risk.risk} Risk
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmarks Comparison */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-appleGray-200">
          <div className="flex items-center space-x-3 mb-6">
            <FaUsers className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-appleGray-800">
              Benchmarks
            </h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-appleGray-700">
                Avg. Completion Time
              </span>
              <span className="text-lg font-bold text-blue-600">
                {analyticsData.benchmarks?.avgCompletionTime} days
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-sm font-medium text-appleGray-700">
                Success Rate
              </span>
              <span className="text-lg font-bold text-green-600">
                {analyticsData.benchmarks?.successRate}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm font-medium text-appleGray-700">
                Avg. Universities
              </span>
              <span className="text-lg font-bold text-purple-600">
                {analyticsData.benchmarks?.avgUniversityApplications}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-8 rounded-3xl border border-sky-200">
        <div className="flex items-center space-x-3 mb-6">
          <FaGlobe className="w-6 h-6 text-sky-600" />
          <h4 className="text-xl font-semibold text-appleGray-800">
            AI Predictions
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h5 className="text-lg font-medium text-appleGray-800 mb-4">
              Estimated Completion
            </h5>
            <div className="text-3xl font-bold text-sky-600 mb-2">
              {formatDate(
                analyticsData.predictions?.estimatedCompletion || new Date()
              )}
            </div>
            <p className="text-sm text-appleGray-600">
              Based on your current progress and typical completion patterns
            </p>
          </div>

          <div>
            <h5 className="text-lg font-medium text-appleGray-800 mb-4">
              Success Probability
            </h5>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-white rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-green-500 transition-all duration-1000"
                  style={{
                    width: `${
                      analyticsData.predictions?.successProbability || 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-xl font-bold text-green-600">
                {Math.round(analyticsData.predictions?.successProbability || 0)}
                %
              </span>
            </div>
            <p className="text-sm text-appleGray-600 mt-2">
              Excellent chance of successful application completion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
