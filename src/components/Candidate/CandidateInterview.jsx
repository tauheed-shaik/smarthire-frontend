// src/components/Candidate/CandidateInterview.jsx
import React, { useState, useEffect } from "react";
import {
  Trophy,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Code,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api`;

function CandidateInterview() {
  const candidateId = localStorage.getItem("candidateId");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/results/candidate/${candidateId}`);
        setResults(res.data);
      } catch (err) {
        setError("Failed to load results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [candidateId]);

  const getScoreColor = (score) => {
    const s = Math.round(score);
    if (s >= 90) return "from-emerald-500 to-teal-500";
    if (s >= 70) return "from-yellow-500 to-amber-500";
    if (s >= 50) return "from-orange-500 to-red-500";
    return "from-red-600 to-rose-600";
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
        return { color: "bg-emerald-900/80 text-emerald-300 border-emerald-600", icon: CheckCircle, label: "Hired" };
      case "SHORTLISTED":
        return { color: "bg-blue-900/80 text-blue-300 border-blue-600", icon: CheckCircle, label: "Shortlisted" };
      case "REJECTED":
        return { color: "bg-red-900/80 text-red-300 border-red-600", icon: XCircle, label: "Not Selected" };
      case "APPLIED":
        return { color: "bg-yellow-900/80 text-yellow-300 border-yellow-600", icon: Clock, label: "Under Review" };
      default:
        return { color: "bg-gray-700 text-gray-400 border-gray-600", icon: Clock, label: "Applied" };
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
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

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <CandidateNavbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-8">
            <Trophy className="w-16 h-16 text-gray-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-400">No Results Available</h2>
          <p className="text-xl text-gray-500 mt-4">
            Complete your assessments to see results here
          </p>
        </div>
      </div>
    );
  }

  const mcqResults = results.interviewResults?.filter(r => r.type === "MCQ") || [];
  const codingResults = results.interviewResults?.filter(r => r.type === "CODING") || [];
  const application = results.applicationStatus?.[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <CandidateNavbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            My Assessment Results
          </h1>
          <p className="text-xl text-gray-400 mt-4">
            Track your MCQ & Coding performance and application status
          </p>
        </div>

        {/* Application Status */}
        {application && (
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <div className={`p-8 rounded-3xl border-2 text-center shadow-2xl ${getStatusBadge(application.status).color}`}>
                {React.createElement(getStatusBadge(application.status).icon, {
                  className: "w-16 h-16 mx-auto mb-4"
                })}
                <h2 className="text-3xl font-bold mb-2">
                  {getStatusBadge(application.status).label}
                </h2>
                <p className="text-lg opacity-90">
                  Applied on {formatDate(application.appliedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MCQ Results */}
        {mcqResults.length > 0 ? (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-300">
              MCQ Test Attempts ({mcqResults.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mcqResults.map((result, index) => {
                const score = Math.round(result.score);
                const gradient = getScoreColor(result.score);
                return (
                  <div
                    key={result.id}
                    className="relative group bg-gray-800/70 rounded-3xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all hover:shadow-2xl"
                  >
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="relative z-10 text-center">
                      <Trophy className="w-14 h-14 mx-auto mb-4 text-white opacity-90" />
                      <div className="text-5xl font-black text-white mb-2">
                        {score}<span className="text-2xl">%</span>
                      </div>
                      <p className="text-gray-300 font-medium mb-3">
                        Attempt #{mcqResults.length - index}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(result.submittedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 mb-12 bg-gray-800/50 rounded-3xl border border-gray-700">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-2xl font-bold text-gray-400">No MCQ Attempts Yet</h3>
            <p className="text-gray-500 mt-2">Complete an MCQ test to see results here</p>
          </div>
        )}

        {/* Coding Results */}
        {codingResults.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-emerald-300">
              Coding Test Attempts ({codingResults.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {codingResults.map((result, index) => {
                const score = Math.round(result.score);
                const gradient = getScoreColor(result.score);
                const shortCode = result.code?.length > 100 
                  ? result.code.substring(0, 100) + "..." 
                  : result.code || "No code submitted";

                return (
                  <div
                    key={result.id}
                    className="relative group bg-gray-800/70 rounded-3xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all hover:shadow-2xl"
                  >
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Code className="w-10 h-10 text-emerald-400" />
                        <div className="text-right">
                          <div className="text-4xl font-black text-white">
                            {score}<span className="text-xl">%</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            Attempt #{codingResults.length - index}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        Submitted on {formatDate(result.submittedAt)}
                      </p>

                      {result.code && (
                        <div className="bg-gray-900/70 p-4 rounded-xl text-sm font-mono text-gray-300 overflow-x-auto max-h-32">
                          {shortCode}
                        </div>
                      )}

                      {score >= 90 && (
                        <div className="mt-4 text-emerald-400 font-bold text-center">
                          Excellent!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-3xl border border-gray-700">
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-2xl font-bold text-gray-400">No Coding Attempts Yet</h3>
            <p className="text-gray-500 mt-2">Complete a coding test to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateInterview;