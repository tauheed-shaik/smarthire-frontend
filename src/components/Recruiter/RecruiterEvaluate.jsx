// src/pages/recruiter/RecruiterEvaluate.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Clock,
  User,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  Trophy,
  ChevronDown,
  Mail,
  FileText,
  Briefcase,
  Code,
  Users,
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api`;

export default function RecruiterEvaluate() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [applications, setApplications] = useState([]); // NEW: applied candidates
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState("all");
  const navigate = useNavigate();
  const recruiterId = localStorage.getItem("recruiterId");

  // Fetch Jobs
  const fetchJobs = async () => {
    if (!recruiterId) return;
    try {
      const res = await axios.get(`${API_BASE}/recruiter/jobs`, {
        params: { recruiterId },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch Applications (applied candidates)
  const fetchApplications = async () => {
    if (!recruiterId) return;
    try {
      const res = await axios.get(`${API_BASE}/recruiter/resumes/${recruiterId}`);
      setApplications(res.data.resumes || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  // Fetch Interview Results (if exists)
  const fetchResults = async () => {
    if (!recruiterId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/recruiter/interviews`, {
        params: { recruiterId },
      });
      let data = res.data.interviews || [];

      // Enrich with job title
      data = data.map((r) => {
        const job = jobs.find((j) => j.id === r.jobId);
        return {
          ...r,
          jobTitle: job?.title || `Job #${r.jobId}`,
          candidateName: r.candidateName || `Candidate ${r.candidateId}`,
        };
      });

      setResults(data);
      setFilteredResults(data);
    } catch (err) {
      setError("Failed to load interview results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!recruiterId) {
      navigate("/recruiter-login");
    } else {
      fetchJobs();
      fetchApplications();
      fetchResults();
    }
  }, [recruiterId, navigate]);

  useEffect(() => {
    let filtered = results;

    if (selectedJob !== "all") {
      filtered = filtered.filter((r) => r.jobId === parseInt(selectedJob));
    }

    if (filter !== "ALL") {
      filtered = filtered.filter((r) => r.status === filter);
    }

    setFilteredResults(filtered);
  }, [filter, selectedJob, results]);

  const getScoreColor = (score) => {
    const s = Math.round(score || 0);
    if (s >= 80) return "text-emerald-400";
    if (s >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const downloadCode = (code, sessionId) => {
    if (!code) return alert("No code available");
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code_session_${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />

      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Evaluate Candidates
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Review assessments, scores, and candidate applications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 flex-wrap">
            {["ALL", "PENDING", "COMPLETED", "EXPIRED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                  filter === status
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-6 bg-red-900/50 border border-red-600 rounded-2xl flex items-center">
            <AlertCircle className="w-8 h-8 mr-4 text-red-400" />
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading || loadingJobs ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
          </div>
        ) : filteredResults.length === 0 && applications.length === 0 ? (
          <div className="text-center py-32">
            <div className="max-w-md mx-auto">
              <FileText className="w-32 h-32 mx-auto text-gray-700 mb-8" />
              <h2 className="text-4xl font-bold text-gray-400 mb-4">
                No Evaluations or Applications Yet
              </h2>
              <p className="text-xl text-gray-500">
                Candidates haven't submitted assessments or applied to your jobs.
              </p>
              {jobs.length > 0 && (
                <div className="mt-12 p-8 bg-gray-800 rounded-2xl border border-gray-700">
                  <h3 className="text-2xl font-bold text-indigo-300 mb-6">
                    Your Active Jobs ({jobs.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-6 bg-gray-900 rounded-xl border border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-white text-lg">{job.title}</p>
                            <p className="text-gray-400 mt-1">{job.company} • {job.location}</p>
                          </div>
                          <span className="px-4 py-2 bg-green-900/70 text-green-300 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show Interview Results if any */}
            {filteredResults.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-indigo-300 mb-6">
                  Interview Submissions ({filteredResults.length})
                </h2>
                <div className="space-y-6">
                  {filteredResults.map((result) => {
                    const score = Math.round(result.score || 0);
                    const scoreColor =
                      score >= 80 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400";

                    return (
                      <div
                        key={result.id}
                        className="bg-gray-800/90 rounded-2xl border border-indigo-500/30 p-8 shadow-xl hover:shadow-2xl transition-all"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-5 mb-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  {result.candidateName || `Candidate ${result.candidateId}`}
                                </h3>
                                <div className="flex items-center gap-4 text-gray-300 mt-2">
                                  <Briefcase className="w-5 h-5 text-indigo-400" />
                                  <span>{result.jobTitle || `Job #${result.jobId}`}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                <span>{new Date(result.submittedAt).toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <CheckSquare className="w-5 h-5 text-indigo-400" />
                                <span className="font-medium">{result.type} Assessment</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center md:text-right min-w-[180px]">
                            <div className={`text-6xl font-black ${scoreColor}`}>
                              {score}
                              <span className="text-3xl">%</span>
                            </div>
                            <p className="text-gray-400 mt-2 mb-6">Score</p>

                            <div className="flex flex-col gap-3">
                              {result.type === "CODING" && result.code && (
                                <button
                                  onClick={() => downloadCode(result.code, result.sessionId)}
                                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                  <Download className="w-5 h-5" />
                                  Download Code
                                </button>
                              )}

                              <button
                                onClick={() => alert(`Detailed report for session ${result.sessionId} (coming soon)`)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-2 transition"
                              >
                                <FileText className="w-5 h-5" />
                                View Report
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Applied Candidates Section (always show if exists) */}
            {applications.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-indigo-300 mb-6">
                  Applied Candidates ({applications.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {applications.map((app) => (
                    <div
                      key={app.applicationId}
                      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-indigo-600 transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Candidate #{app.candidateId}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Applied: {new Date(app.appliedAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            app.status === "SELECTED"
                              ? "bg-emerald-900/70 text-emerald-300"
                              : app.status === "SHORTLISTED"
                              ? "bg-blue-900/70 text-blue-300"
                              : app.status === "REJECTED"
                              ? "bg-red-900/70 text-red-300"
                              : "bg-yellow-900/70 text-yellow-300"
                          }`}
                        >
                          {app.status || "Applied"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}