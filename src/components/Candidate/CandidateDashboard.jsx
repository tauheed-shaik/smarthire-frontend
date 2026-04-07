// src/components/Candidate/CandidateDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FileText,
  Briefcase,
  CheckCircle,
  User,
  ArrowRight,
  Calendar,
  Code,
  Loader2,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

function CandidateDashboard() {
  const candidateId = localStorage.getItem("candidateId");
  const userEmail = localStorage.getItem("userEmail") || "Candidate";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    interviews: 0,
    offers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!candidateId) {
        setError("Please login to view dashboard");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch applied jobs
        const appsRes = await axios.get(`${API_BASE}/applications/my-applications/${candidateId}`);
        const applications = appsRes.data.applications || [];
        const appliedCount = applications.length;

        // 2. Fetch results (interviews + offers)
        const resultsRes = await axios.get(`${API_BASE}/results/candidate/${candidateId}`);
        const resultsData = resultsRes.data;

        const interviewCount = resultsData.interviewResults?.length || 0;
        const offerCount = resultsData.applicationStatus?.filter(
          app => app.status?.toUpperCase() === "SELECTED"
        )?.length || 0;

        setStats({
          appliedJobs: appliedCount,
          interviews: interviewCount,
          offers: offerCount,
        });

        // 3. Build recent activity (combine applications + interviews)
        const activities = [];

        // Applied jobs
        applications.forEach(app => {
          activities.push({
            type: "applied",
            title: `Applied to Job #${app.jobId}`,
            date: app.appliedAt,
            status: app.status,
          });
        });

        // Interview submissions
        resultsData.interviewResults?.forEach(res => {
          activities.push({
            type: res.type.toLowerCase(),
            title: `${res.type} Round Submitted (Session ${res.sessionId})`,
            date: res.submittedAt,
            score: res.score,
          });
        });

        // Sort newest first, take last 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(activities.slice(0, 5));

      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [candidateId]);

  const quickActions = [
    { title: "Upload Resume", icon: FileText, href: "/upload-resume", color: "from-blue-500 to-cyan-600" },
    { title: "Manage Profile", icon: User, href: "/profile", color: "from-purple-500 to-pink-600" },
    { title: "View Applied Jobs", icon: Briefcase, href: "/applied-jobs", color: "from-green-500 to-teal-600" },
    { title: "Check Status", icon: CheckCircle, href: "/status", color: "from-orange-500 to-red-600" },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "applied": return Briefcase;
      case "mcq": return FileText;
      case "coding": return Code;
      default: return Clock;
    }
  };

  const getActivityColor = (type, status, score) => {
    if (type === "applied") {
      if (status?.toUpperCase() === "SELECTED") return "text-emerald-400";
      if (status?.toUpperCase() === "SHORTLISTED") return "text-blue-400";
      if (status?.toUpperCase() === "REJECTED") return "text-red-400";
      return "text-yellow-400";
    }
    if (type === "coding" || type === "mcq") {
      if (score >= 90) return "text-emerald-400";
      if (score >= 70) return "text-yellow-400";
      return "text-red-400";
    }
    return "text-gray-400";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <CandidateNavbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-8">
            <Trophy className="w-16 h-16 text-gray-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-400">{error}</h2>
          <p className="text-xl text-gray-500 mt-4">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
      <CandidateNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {candidate?.name || userEmail.split("@")[0] || "Candidate"}
            </span>
            !
          </h1>
          <p className="text-gray-400 mt-1">Here's your hiring journey at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applied Jobs</p>
                <p className="text-3xl font-bold mt-1">{stats.appliedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interviews</p>
                <p className="text-3xl font-bold mt-1">{stats.interviews}</p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Offers</p>
                <p className="text-3xl font-bold mt-1">{stats.offers}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className="group bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm flex items-center group-hover:text-white">
                  Go to page <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </p>
              </a>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Recent Activity
          </h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type, activity.status, activity.score);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        {activity.score !== undefined && (
                          <p className={`text-sm ${colorClass}`}>
                            Score: {Math.round(activity.score)}%
                          </p>
                        )}
                        {activity.status && (
                          <p className={`text-sm ${colorClass}`}>
                            Status: {activity.status}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity yet. Apply to jobs or complete assessments!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;