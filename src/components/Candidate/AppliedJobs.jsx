// src/components/Candidate/AppliedJobs.jsx
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  IndianRupee,
  ExternalLink,
  Loader2,
  FileText,
  Code,
  X,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";

function AppliedJobs() {
  const [activeTab, setActiveTab] = useState("available");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const candidateId = localStorage.getItem("candidateId");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080/api";

  // FETCH AVAILABLE JOBS
  const fetchAvailableJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/all`);
      setAvailableJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch available jobs:", err);
    }
  };

  // FETCH MY APPLICATIONS + CHECK FOR MCQ & CODING
  const fetchAppliedJobs = async () => {
    if (!candidateId) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Get applications
      const appRes = await axios.get(
        `${API_BASE}/applications/my-applications/${candidateId}`
      );
      const applications = appRes.data.applications || [];

      if (applications.length === 0) {
        setAppliedJobs([]);
        setLoading(false);
        return;
      }

      // 2. Get job details
      const jobPromises = applications.map((app) =>
        axios.get(`${API_BASE}/jobs/${app.jobId}`)
      );
      const jobResponses = await Promise.all(jobPromises);

      // 3. Check MCQ status
      let hasMCQ = false;
      let mcqJobId = null;
      try {
        const mcqRes = await axios.get(
          `${API_BASE}/interviews/candidate/mcq/${candidateId}`
        );
        hasMCQ = mcqRes.data.hasMCQ || false;
        mcqJobId = mcqRes.data.jobId;
        console.log("MCQ status:", mcqRes.data);
      } catch (mcqErr) {
        console.error("MCQ check failed:", mcqErr);
      }

      // 4. Check CODING status
      let hasCoding = false;
      let codingJobId = null;
      let codingSessionId = null;
      try {
        const codingRes = await axios.get(
          `${API_BASE}/interviews/candidate/coding/${candidateId}`
        );
        hasCoding = codingRes.data.hasCoding || false;
        codingJobId = codingRes.data.jobId;
        codingSessionId = codingRes.data.sessionId;
        console.log("CODING status:", codingRes.data);
      } catch (codingErr) {
        console.error("CODING check failed:", codingErr);
      }

      // 5. Enrich applications
      const enriched = applications.map((app, i) => {
        const job = jobResponses[i].data.job;
        return {
          id: app.id,
          jobId: app.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          status: app.status,
          appliedDate: app.appliedAt,
          description: job.description,
          type: job.type,
          requirements: job.requirements,
          salaryRange: job.salaryRange,
          hasMCQTest: hasMCQ && mcqJobId == app.jobId,
          hasCodingTest: hasCoding && codingJobId == app.jobId,
          codingSessionId:
            hasCoding && codingJobId == app.jobId ? codingSessionId : null,
        };
      });

      setAppliedJobs(enriched);
    } catch (err) {
      setError("Failed to load your applications.");
      console.error("Main fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // APPLY TO JOB
  const handleApply = async (jobId) => {
    if (!candidateId) {
      setError("Please log in to apply.");
      return;
    }

    setApplying((prev) => ({ ...prev, [jobId]: true }));
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${API_BASE}/applications/apply?candidateId=${candidateId}&jobId=${jobId}`
      );
      setSuccess("Applied successfully!");
      await Promise.all([fetchAvailableJobs(), fetchAppliedJobs()]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.Error || "Failed to apply.";
      setError(msg);
    } finally {
      setApplying((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const isApplied = (jobId) => {
    return appliedJobs.some((j) => j.jobId === jobId);
  };

  const openJobDetails = async (jobId) => {
    setModalLoading(true);
    setModalError("");
    setSelectedJob(null);

    try {
      const res = await axios.get(`${API_BASE}/jobs/${jobId}`);
      setSelectedJob(res.data.job);
    } catch (err) {
      setModalError("Failed to load job details.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalError("");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAvailableJobs(), fetchAppliedJobs()]);
      setLoading(false);
    };
    load();
  }, [candidateId]);

  const StatusBadge = ({ status }) => {
    const config = {
      APPLIED: { color: "bg-blue-900 text-blue-300", icon: Clock },
      INTERVIEW: { color: "bg-yellow-900 text-yellow-300", icon: AlertCircle },
      REJECTED: { color: "bg-red-900 text-red-300", icon: XCircle },
      OFFER: { color: "bg-green-900 text-green-300", icon: CheckCircle },
    };
    const { color, icon: Icon } = config[status] || config.APPLIED;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <CandidateNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-gray-400 mt-2">
            Browse jobs and track your applications
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === "available"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Available Jobs
          </button>
          <button
            onClick={() => setActiveTab("applied")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === "applied"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Applications ({appliedJobs.length})
          </button>
        </div>

        {/* AVAILABLE JOBS */}
        {activeTab === "available" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJobs.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-10">
                No jobs available.
              </p>
            ) : (
              availableJobs.map((job) => {
                const applied = isApplied(job.id);
                return (
                  <div
                    key={job.id}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-600 transition group"
                  >
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        {job.company}
                      </p>
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </p>
                      <p className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        {job.salaryRange}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {job.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openJobDetails(job.id)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applied || applying[job.id]}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center ${
                          applied
                            ? "bg-green-900 text-green-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                        } ${applying[job.id] ? "opacity-70" : ""}`}
                      >
                        {applying[job.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : applied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Applied
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MY APPLICATIONS */}
        {activeTab === "applied" && (
          <div className="space-y-6">
            {appliedJobs.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-xl font-semibold text-gray-400">
                  No applications yet
                </p>
                <p className="text-gray-500 mt-2">
                  Go to "Available Jobs" and apply!
                </p>
              </div>
            ) : (
              appliedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-600 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={job.status} />
                      <p className="text-xs text-gray-500 mt-1">
                        Applied on:{" "}
                        {new Date(job.appliedDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => openJobDetails(job.jobId)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      View Details
                    </button>

                    {/* MCQ BUTTON */}
                    {job.hasMCQTest && (
                      <button
                        onClick={() =>
                          navigate(`/candidate/mcq-test?jobId=${job.jobId}`)
                        }
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition text-sm font-medium flex items-center shadow-lg"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Start MCQ Test
                      </button>
                    )}

                    {/* CODING BUTTON */}
                    {job.hasCodingTest && job.codingSessionId && (
                      <button
                        onClick={() =>
                          navigate(
                            `/candidate/coding-test?sessionId=${job.codingSessionId}`
                          )
                        }
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition text-sm font-medium flex items-center shadow-lg"
                      >
                        <Code className="w-5 h-5 mr-2" />
                        Start Coding Test
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            {modalLoading ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-500" />
              </div>
            ) : modalError ? (
              <div className="text-red-400 text-center py-10">{modalError}</div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  Job Title: {selectedJob.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {selectedJob.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedJob.location}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-300">{selectedJob.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">
                      Requirements
                    </h3>
                    <p className="text-gray-300">{selectedJob.requirements}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Briefcase className="w-4 h-4 mr-1" />
                        Job Type
                      </div>
                      <p className="font-medium">{selectedJob.type}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        Salary Range
                      </div>
                      <p className="font-medium">{selectedJob.salaryRange}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppliedJobs;
