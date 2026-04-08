// src/components/Recruiter/RecruiterResumes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  Mail,
  Phone,
  Code,
  Briefcase,
  Loader2,
  AlertCircle,
  User,
  Search,
  X,
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";

const CANDIDATE_API = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/candidate/get-all-candidates`;

export default function RecruiterResumes() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const navigate = useNavigate();
  const recruiterId = localStorage.getItem("recruiterId");

  // Fetch all candidates
  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(CANDIDATE_API);
      const data = res.data.candidates || [];

      // Parse skills JSON string to array
      const parsed = data.map((c) => ({
        ...c,
        skills: Array.isArray(c.skills)
          ? c.skills
          : JSON.parse(c.skills || "[]"),
      }));

      setCandidates(parsed);
      setFilteredCandidates(parsed); // initially show all
    } catch (err) {
      setError("Failed to load candidates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recruiterId) {
      fetchCandidates();
    } else {
      navigate("/recruiter-login");
    }
  }, [recruiterId]);

  // Filter candidates by skill
  useEffect(() => {
    if (!skillFilter.trim()) {
      setFilteredCandidates(candidates);
      return;
    }

    const filter = skillFilter.toLowerCase().trim();
    const filtered = candidates.filter((c) =>
      c.skills.some((skill) => skill.toLowerCase().includes(filter))
    );

    setFilteredCandidates(filtered);
  }, [skillFilter, candidates]);

  const downloadResume = (path) => {
    if (path) {
      const fullUrl = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/${path}`;
      window.open(fullUrl, "_blank");
    } else {
      alert("Resume not uploaded");
    }
  };

  const clearFilter = () => {
    setSkillFilter("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />

      <div className="p-6 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                All Candidate Resumes
              </h1>
              <p className="text-gray-400 mt-1">
                Browse all registered candidates and download their resumes
              </p>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter by skill (e.g. Java, Javascript, React)"
                className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              {skillFilter && (
                <button
                  onClick={clearFilter}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {skillFilter && (
              <p className="text-sm text-gray-400 mt-2">
                Showing {filteredCandidates.length} candidate(s) matching "
                {skillFilter}"
              </p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">
                {skillFilter
                  ? `No candidates match skill "${skillFilter}"`
                  : "No candidates found"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-600 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {candidate.name || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ID: {candidate.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    {candidate.email && (
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {candidate.email}
                      </p>
                    )}
                    {candidate.phone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {candidate.phone}
                      </p>
                    )}
                    {candidate.experience && (
                      <p className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {candidate.experience} years
                      </p>
                    )}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex items-start">
                        <Code className="w-4 h-4 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => downloadResume(candidate.resumePath)}
                    disabled={!candidate.resumePath}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition ${
                      candidate.resumePath
                        ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {candidate.resumePath ? "Download Resume" : "No Resume"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
