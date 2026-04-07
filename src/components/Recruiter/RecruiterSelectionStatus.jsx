// src/pages/recruiter/RecruiterSelectionStatus.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Trophy, FileText, Mail, Phone, Calendar, Star,
  CheckCircle, XCircle, Loader2, AlertCircle, Download
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs"; // SheetJS CDN

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

export default function RecruiterSelectionStatus() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();
  const recruiterId = localStorage.getItem("recruiterId");

  const fetchCandidates = async () => {
    if (!recruiterId) return navigate("/recruiter-login");
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/candidate/get-all-candidates`);
      const rawCandidates = data.candidates || [];

      const enriched = await Promise.all(
        rawCandidates.map(async (cand) => {
          try {
            const res = await axios.get(`${API_BASE}/results/candidate/${cand.id}`);
            const { interviewResults = [], applicationStatus = [] } = res.data;
            const mcqResults = interviewResults.filter(r => r.type === "MCQ");
            const latest = mcqResults.length > 0
              ? mcqResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
              : null;
            const appStatus = applicationStatus.length > 0 ? applicationStatus[0].status : "NO_APPLICATION";
            const appId = applicationStatus.length > 0 ? applicationStatus[0].id : null;
            return {
              ...cand,
              latestScore: latest ? Math.round(latest.score) : null,
              totalAttempts: mcqResults.length,
              applicationStatus: appStatus,
              applicationId: appId,
              latestSubmittedAt: latest?.submittedAt
            };
          } catch {
            return {
              ...cand,
              latestScore: null,
              totalAttempts: 0,
              applicationStatus: "NO_APPLICATION",
              applicationId: null
            };
          }
        })
      );

      const filtered = filter === "ALL" ? enriched : enriched.filter(c => c.applicationStatus === filter);
      setCandidates(filtered);
    } catch (err) {
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [recruiterId, filter]);

  const updateStatus = async (appId, status) => {
    if (!appId) return setError("No application to update");
    try {
      await axios.put(`${API_BASE}/recruiter/applications/${appId}/status`, null, { params: { status } });
      setSuccess(`Candidate ${status.toLowerCase()}!`);
      fetchCandidates();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to update status");
    }
  };

  const getScoreClass = (score) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getStatusBadge = (status) => {
    const map = {
      SELECTED: "bg-green-900/80 text-green-300 border-green-600",
      SHORTLISTED: "bg-blue-900/80 text-blue-300 border-blue-600",
      REJECTED: "bg-red-900/80 text-red-300 border-red-600",
      APPLIED: "bg-yellow-900/80 text-yellow-300 border-yellow-600",
      NO_APPLICATION: "bg-gray-700 text-gray-400 border-gray-600"
    };
    return map[status] || map.NO_APPLICATION;
  };

  // NEW: Export filtered candidates to Excel
  const exportToExcel = () => {
    if (candidates.length === 0) {
      alert("No candidates to export");
      return;
    }

    const data = candidates.map(c => ({
      ID: c.id,
      Name: c.name || "Unknown",
      Email: c.email || "-",
      Phone: c.phone || "-",
      Experience: c.experience || "-",
      Skills: c.skills ? JSON.parse(c.skills).join(", ") : "-",
      "Latest MCQ Score": c.latestScore !== null ? `${c.latestScore}%` : "No Test",
      "Attempts": c.totalAttempts,
      "Application Status": c.applicationStatus.replace("_", " "),
      "Applied At": c.latestSubmittedAt ? new Date(c.latestSubmittedAt).toLocaleString() : "-"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, `Recruiter_Candidates_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />

      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Header + Export Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Candidate Talent Pool
            </h1>
            <p className="text-xl text-gray-400 mt-3">
              Review profiles, MCQ performance & manage hiring decisions
            </p>
          </div>

          <button
            onClick={exportToExcel}
            disabled={candidates.length === 0 || loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              candidates.length === 0 || loading
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
            }`}
          >
            <Download className="w-5 h-5" />
            Download Excel
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {["ALL", "APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-7 py-3.5 rounded-xl font-bold text-lg transition-all ${
                filter === s
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl scale-105"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-8 p-5 bg-green-900/60 border-2 border-green-500 rounded-xl text-center text-xl font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-8 p-5 bg-red-900/60 border-2 border-red-500 rounded-xl text-center text-xl font-medium text-red-300">
            {error}
          </div>
        )}

        {/* Loading / Empty */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-8">
              <Trophy className="w-16 h-16 text-gray-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-400">No Candidates Found</h2>
            <p className="text-xl text-gray-500 mt-4">Candidates will appear after taking assessments</p>
          </div>
        ) : (
          /* Candidate Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <div className="p-7">
                  {/* Name + Score */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{c.name}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" /> {c.email}
                      </p>
                    </div>
                    {c.latestScore !== null ? (
                      <div className="text-right">
                        <div className={`text-5xl font-black ${getScoreClass(c.latestScore)}`}>
                          {c.latestScore}%
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-400">{c.totalAttempts} attempt{c.totalAttempts > 1 && "s"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-right">
                        <Trophy className="w-10 h-10 mx-auto opacity-40" />
                        <p className="text-xs mt-1">No Test</p>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-gray-300 mb-6 text-sm">
                    {c.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-indigo-400" />
                        {c.phone}
                      </p>
                    )}
                    {c.skills && JSON.parse(c.skills).length > 0 && (
                      <p>
                        <span className="text-indigo-400 font-medium">Skills:</span>{" "}
                        {JSON.parse(c.skills).join(" • ")}
                      </p>
                    )}
                    {c.experience && (
                      <p>
                        <span className="text-indigo-400 font-medium">Exp:</span> {c.experience} years
                      </p>
                    )}
                  </div>

                  {/* Resume */}
                  {c.resumePath && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/${c.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 mb-5 bg-indigo-600/20 border border-indigo-500 rounded-xl font-bold text-indigo-300 hover:bg-indigo-600/30 transition"
                    >
                      <FileText className="inline w-5 h-5 mr-2" />
                      View Resume
                    </a>
                  )}

                  {/* Status */}
                  <div className={`text-center py-2.5 rounded-xl font-bold text-lg mb-5 border-2 ${getStatusBadge(c.applicationStatus)}`}>
                    {c.applicationStatus.replace("_", " ")}
                  </div>

                  {/* Action Buttons */}
                  {c.applicationStatus !== "SELECTED" && c.applicationStatus !== "REJECTED" && c.applicationStatus !== "NO_APPLICATION" && (
                    <div className="grid grid-cols-2 gap-3">
                      {c.applicationStatus !== "SHORTLISTED" && (
                        <button
                          onClick={() => updateStatus(c.applicationId, "SHORTLISTED")}
                          className="py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition"
                        >
                          Shortlist
                        </button>
                      )}
                      {c.applicationStatus === "SHORTLISTED" && (
                        <button
                          onClick={() => updateStatus(c.applicationId, "SELECTED")}
                          className="py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition"
                        >
                          Hire
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(c.applicationId, "REJECTED")}
                        className="py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition col-span-2"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}