// src/components/Recruiter/RecruiterScheduleInterview.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Mail,
  User,
  Briefcase,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  Users,
  Link as LinkIcon,
  Code,
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";

const API_BASE = "http://localhost:8080/api";

export default function RecruiterScheduleInterview() {
  const [jobs, setJobs] = useState([]);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [interviewType, setInterviewType] = useState("MCQ");
  const [selectedQuestions, setSelectedQuestions] = useState([]); // MCQ
  const [selectedCodingQuestions, setSelectedCodingQuestions] = useState([]); // CODING
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const navigate = useNavigate();
  const recruiterId = localStorage.getItem("recruiterId");

  // FETCH JOBS
  const fetchJobs = async () => {
    if (!recruiterId) return;
    try {
      const res = await axios.get(`${API_BASE}/recruiter/jobs`, {
        params: { recruiterId },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs:", err.response?.data || err);
    }
  };

  // FETCH APPLIED CANDIDATES
  const fetchAppliedCandidates = async (jobId) => {
    if (!jobId) {
      setAppliedCandidates([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/recruiter/resumes/${jobId}`);
      setAppliedCandidates(res.data.resumes || []);
    } catch (err) {
      setAppliedCandidates([]);
    }
  };

  // FETCH MCQs
  const fetchMCQs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recruiter/mcq/all`, {
        params: { recruiterId },
      });
      setMcqs(res.data.questions || []);
    } catch (err) {
      console.error("Failed to load MCQs");
    }
  };

  const fetchCodingQuestions = async () => {
    if (!recruiterId) return;
    try {
      const res = await axios.get(`${API_BASE}/coding`, {
        params: { recruiterId },
      });
  
      // Safely extract array — adjust based on your actual backend response structure
      const data = res.data;
  
      // Common patterns — pick the one that matches your backend
      const questionsArray =
        Array.isArray(data) ? data :                // direct array
        Array.isArray(data?.questions) ? data.questions :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.codingQuestions) ? data.codingQuestions :
        [];  // fallback to empty array
  
      setCodingQuestions(questionsArray);
      console.log("Loaded coding questions:", questionsArray); // debug
    } catch (err) {
      console.error("Failed to load coding questions", err);
      setCodingQuestions([]);
    }
  };

  useEffect(() => {
    if (!recruiterId) {
      navigate("/recruiter-login");
    } else {
      fetchJobs();
      fetchMCQs();
      fetchCodingQuestions();
    }
  }, [recruiterId]);

  useEffect(() => {
    if (selectedJob) fetchAppliedCandidates(selectedJob);
  }, [selectedJob]);

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const toggleCodingQuestion = (id) => {
    setSelectedCodingQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedJob || !selectedCandidate) {
      setError("Please select job and candidate");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    // Common payload
    const payload = {
      jobId: selectedJob,
      candidateId: selectedCandidate,
      type: interviewType,
      scheduledAt: new Date().toISOString(), // or use a date picker later
      meetingLink: meetingLink.trim() || null,
    };

    // Type-specific payload
    if (interviewType === "MCQ") {
      if (selectedQuestions.length === 0) {
        setError("Please select at least one MCQ question");
        setLoading(false);
        return;
      }
      payload.questionIds = selectedQuestions;
    } else if (interviewType === "CODING") {
      if (selectedCodingQuestions.length === 0) {
        setError("Please select at least one coding question");
        setLoading(false);
        return;
      }
      // We allow multiple, but you can enforce 1 if you want
      payload.questionIds = selectedCodingQuestions; // backend expects questionIds for coding too
    }

    try {
      let res;

      if (interviewType === "CODING") {
        // Dedicated coding endpoint
        res = await axios.post(
          `${API_BASE}/interviews/coding/schedule`,
          payload,
          { params: { recruiterId } }
        );
      } else {
        // MCQ / HR → old unified endpoint
        res = await axios.post(
          `${API_BASE}/recruiter/interviews`,
          payload,
          { params: { recruiterId } }
        );
      }

      const link = res.data.inviteLink ||
        `${window.location.origin}/candidate/interview?session=${res.data.sessionId}`;

      setInviteLink(link);
      setShowSuccessCard(true);
      setSuccess(`Interview scheduled & Email sent to candidate!`);

      // Reset form
      setTimeout(() => {
        setShowSuccessCard(false);
        setSelectedCandidate("");
        setSelectedQuestions([]);
        setSelectedCodingQuestions([]);
        setMeetingLink("");
        setInterviewType("MCQ");
        setSelectedJob("");
      }, 8000);

    } catch (err) {
      const msg = err.response?.data?.error ||
                  err.response?.data?.Error ||
                  "Failed to schedule interview";
      setError(msg);
      console.error("Scheduling error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />
      <div className="p-6 pt-24 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Schedule Interview
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">
          Send MCQ test, coding round, or HR interview instantly
        </p>

        {/* SUCCESS CARD */}
        {showSuccessCard && (
          <div className="mb-6 p-5 bg-green-900/60 border border-green-600 rounded-xl text-center">
            <Mail className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">Email Sent Successfully!</h2>
            <p className="text-sm text-gray-300 mb-4">
              Candidate has received the interview invitation
            </p>
            <div className="flex items-center justify-center gap-3 max-w-sm mx-auto bg-gray-800 rounded-lg p-3">
              <LinkIcon className="w-5 h-5 text-indigo-400" />
              <input
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-xs text-indigo-300 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert("Copied!");
                }}
                className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/60 border border-red-500 rounded-xl text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Briefcase className="w-4 h-4" /> Job Posting
              </label>
              <select
                value={selectedJob}
                onChange={(e) => {
                  setSelectedJob(e.target.value);
                  setSelectedCandidate("");
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Users className="w-4 h-4" /> Candidate
              </label>
              <select
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                disabled={!selectedJob}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedJob ? "Choose candidate" : "Select job first"}
                </option>
                {appliedCandidates.map((app) => (
                  <option key={app.candidateId} value={app.candidateId}>
                    {app.candidateName} (ID: {app.candidateId}) — {formatDate(app.appliedAt)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Interview Type</label>
              <div className="grid grid-cols-3 gap-3">
                {["MCQ", "CODING", "HR"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setInterviewType(type);
                      if (type !== "MCQ") setSelectedQuestions([]);
                      if (type !== "CODING") setSelectedCodingQuestions([]);
                    }}
                    className={`py-3 rounded-lg font-medium text-sm transition-all ${
                      interviewType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <LinkIcon className="w-4 h-4" /> Meeting Link (Optional – for HR/CODING)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* MCQ Questions Selection */}
          {interviewType === "MCQ" && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <FileText className="w-4 h-4" />
                Select MCQ Questions ({selectedQuestions.length} selected)
              </label>
              <div className="max-h-64 overflow-y-auto bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                {mcqs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    No MCQ questions available — create some first
                  </p>
                ) : (
                  mcqs.map((q) => (
                    <label
                      key={q.id}
                      className="flex items-center gap-3 p-3 mb-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(q.id)}
                        onChange={() => toggleQuestion(q.id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div className="flex-1">
                        <p>{q.question}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {q.id}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CODING Questions Selection */}
          {interviewType === "CODING" && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                <Code className="w-4 h-4" />
                Select Coding Question(s)
                <span className="text-xs text-gray-400 ml-2">(can select multiple)</span>
              </label>
              <div className="max-h-64 overflow-y-auto bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                {codingQuestions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    No coding questions available — create some first
                  </p>
                ) : (
                  codingQuestions.map((q) => (
                    <label
                      key={q.id}
                      className="flex items-center gap-3 p-3 mb-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCodingQuestions.includes(q.id)}
                        onChange={() => toggleCodingQuestion(q.id)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{q.title || "Untitled Coding Problem"}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {q.description?.substring(0, 120) || "No description"}...
                        </p>
                        {q.functionSignature && (
                          <p className="text-xs font-mono text-emerald-400 mt-1">
                            {q.functionSignature}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">ID: {q.id}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="text-right">
            <button
              type="submit"
              disabled={loading || !selectedCandidate || !selectedJob}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2 justify-center mx-auto md:mx-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Schedule & Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}