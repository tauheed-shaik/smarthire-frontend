// src/pages/RecruiterDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FileText,
  Briefcase,
  Clock,
  Award,
  Loader2,
  Calendar,
  CheckCircle,
  Trophy,
} from "lucide-react";
import RecruiterNavbar from "../Recruiter/RecruiterNavbar";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api`;

function RecruiterDashboard() {
  const recruiterId = localStorage.getItem("recruiterId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recruiter, setRecruiter] = useState(null);
  const [stats, setStats] = useState({
    resumes: 0,
    applied: 0,
    selected: 0,
    interviews: 0,
    evaluations: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); // Leaderboard data

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!recruiterId) {
        setError("Please login as recruiter");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Recruiter info
        const email = localStorage.getItem("userEmail");
        setRecruiter({
          name: "Recruiter",
          email: email || "recruiter@example.com",
        });

        // 1. Total resumes (all candidates with resume)
        const candidatesRes = await axios.get(`${API_BASE}/candidate/get-all-candidates`);
        const candidates = candidatesRes.data.candidates || [];
        const resumeCount = candidates.filter(c => c.resumePath && c.resumePath.trim() !== "").length;

        // 2. Applied & selected
        const resumesRes = await axios.get(`${API_BASE}/recruiter/resumes/${recruiterId}`);
        const applications = resumesRes.data.resumes || [];
        const appliedCount = applications.length;
        const selectedCount = applications.filter(app => app.status?.toUpperCase() === "SELECTED").length;

        setStats({
          resumes: resumeCount,
          applied: appliedCount,
          selected: selectedCount,
          interviews: 0,
          evaluations: 0,
        });

        // Recent Activity
        const activities = applications.map(app => ({
          type: app.status?.toLowerCase() || "applied",
          title: `Candidate #${app.candidateId} - ${app.status || "Applied"}`,
          date: app.appliedAt,
          status: app.status,
        }));
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(activities.slice(0, 5));

        // Leaderboard - average score per candidate
        const board = [];
        for (const app of applications) {
          try {
            const res = await axios.get(`${API_BASE}/results/candidate/${app.candidateId}`);
            const results = res.data.interviewResults || [];

            if (results.length === 0) continue;

            const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
            const avgScore = totalScore / results.length;

            board.push({
              candidateId: app.candidateId,
              name: `Candidate ${app.candidateId}`, // fallback - can enrich later
              averageScore: avgScore,
              attempts: results.length,
            });
          } catch (err) {
            console.warn(`No results for candidate ${app.candidateId}`);
          }
        }

        // Sort by average score descending
        board.sort((a, b) => b.averageScore - a.averageScore);
        setLeaderboard(board.slice(0, 10)); // top 10

      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [recruiterId]);

  const getActivityColor = (status) => {
    const s = status?.toUpperCase();
    if (s === "SELECTED") return "text-emerald-400";
    if (s === "SHORTLISTED") return "text-blue-400";
    if (s === "REJECTED") return "text-red-400";
    return "text-yellow-400";
  };

  const getScoreColor = (score) => {
    const s = Math.round(score || 0);
    if (s >= 90) return "text-emerald-400";
    if (s >= 70) return "text-yellow-400";
    if (s >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
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
        <RecruiterNavbar onLogout={() => {}} />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-red-400">{error}</h2>
          <p className="text-gray-400 mt-4">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {recruiter?.name || recruiter?.email?.split("@")[0] || "Recruiter"}!
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Here's your hiring pipeline at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resumes</p>
                <p className="text-3xl font-bold mt-1">{stats.resumes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applied</p>
                <p className="text-3xl font-bold mt-1">{stats.applied}</p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interviews</p>
                <p className="text-3xl font-bold mt-1">{stats.interviews}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Evaluations</p>
                <p className="text-3xl font-bold mt-1">{stats.evaluations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selected</p>
                <p className="text-3xl font-bold mt-1">{stats.selected}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mb-10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Candidate Leaderboard (Top Performers)
          </h3>

          {leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-4 font-semibold text-gray-300">Rank</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Candidate</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">ID</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Attempts</th>
                    <th className="py-4 px-4 font-semibold text-gray-300 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const color = getScoreColor(entry.averageScore);

                    return (
                      <tr
                        key={entry.candidateId}
                        className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {rank <= 3 ? (
                              <Trophy className={`w-5 h-5 ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : "text-amber-700"}`} />
                            ) : (
                              <span className="text-gray-500 w-5 text-center">{rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {entry.name}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          #{entry.candidateId}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {entry.attempts}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-bold ${color}`}>
                            {Math.round(entry.averageScore)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No evaluation data yet. Candidates need to complete assessments first.
            </div>
          )}
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
                const colorClass = getActivityColor(activity.status);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        {activity.type === "applied" ? (
                          <Briefcase className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
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
              No recent activity yet. Candidates will appear once they apply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;