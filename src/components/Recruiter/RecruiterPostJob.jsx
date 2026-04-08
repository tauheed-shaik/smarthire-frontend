// src/pages/recruiter/PostJob.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  PlusCircle,
  List,
  Building,
  Users,
  IndianRupee,
  Globe,
  BadgeCheck,
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/recruiter`;

export default function PostJob() {
  const navigate = useNavigate();

  const [view, setView] = useState("post"); // "post" or "list"
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "FULL_TIME",
    salaryRange: "",
    description: "",
    requirements: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch all posted jobs
  const fetchJobs = async () => {
    const recruiterId = localStorage.getItem("recruiterId"); // READ HERE every time
    if (!recruiterId) return;

    setLoadingJobs(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs`, {
        params: { recruiterId },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    const recruiterId = localStorage.getItem("recruiterId"); // READ HERE on mount

    if (!recruiterId) {
      navigate("/recruiter-login");
    } else {
      fetchJobs();
    }
  }, [navigate]); // Removed recruiterId from deps — we read it fresh

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  // Validate form
  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Job title is required";
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.requirements.trim())
      errors.requirements = "Requirements are required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const recruiterId = localStorage.getItem("recruiterId");
    if (!recruiterId) return navigate("/recruiter-login");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE}/jobs`, formData, {
        params: { recruiterId },
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.msg?.includes("posted")) {
        setSuccess("Job posted successfully!");
        setTimeout(() => {
          setFormData({
            title: "",
            company: "",
            location: "",
            type: "FULL_TIME",
            salaryRange: "",
            description: "",
            requirements: "",
          });
          fetchJobs(); // Refresh job list
        }, 1500);
      }
    } catch (err) {
      const msg =
        err.response?.data?.Error ||
        err.response?.data?.error ||
        "Failed to post job. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />

      <div className="p-6 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header + Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Job Management
              </h1>
              <p className="text-gray-400 mt-2">
                Post new openings or view your current job listings
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex bg-gray-800 rounded-full p-1.5 border border-gray-700">
              <button
                onClick={() => setView("post")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  view === "post"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                Post New Job
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  view === "list"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
                All Posted Jobs
              </button>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-8 p-5 bg-green-900/60 border-2 border-green-500 rounded-xl text-center text-xl font-medium flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-8 p-5 bg-red-900/60 border-2 border-red-500 rounded-xl text-center text-xl font-medium text-red-300 flex items-center justify-center gap-3">
              <AlertCircle className="w-6 h-6" />
              {error}
            </div>
          )}

          {/* Content based on view */}
          {view === "post" ? (
            /* Post Job Form */
            <form
              onSubmit={handleSubmit}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Developer"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.title
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.company
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {validationErrors.company && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.company}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.location
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.location}
                    </p>
                  )}
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Job Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    placeholder="e.g. 12-18 LPA"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition resize-none ${
                      validationErrors.description
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="4"
                    placeholder="List required skills and qualifications (one per line)..."
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition resize-none ${
                      validationErrors.requirements
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {validationErrors.requirements && (
                    <p className="mt-1 text-xs text-red-400">
                      {validationErrors.requirements}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-6 h-6" />
                      Post Job
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* All Posted Jobs - Cards View */
            <div>
              <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <List className="w-8 h-8 text-indigo-400" />
                Your Posted Jobs ({jobs.length})
              </h2>

              {loadingJobs ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-400 mb-3">
                    No Jobs Posted Yet
                  </h3>
                  <p className="text-gray-500">
                    Click "Post New Job" to create your first opening.
                  </p>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Job Title & Company */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-indigo-300 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {job.company}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-medium ${
                              job.active
                                ? "bg-green-900/70 text-green-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {job.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            {job.type.replace("_", " ")}
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-indigo-400" />
                            {job.salaryRange || "Not disclosed"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            Full Time
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                          <p className="text-gray-300 text-sm line-clamp-3">
                            {job.description}
                          </p>
                        </div>

                        {/* Requirements Tags */}
                        {job.requirements && (
                          <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-2">
                              Requirements
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.split(",").map((req, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-indigo-900/40 text-indigo-300 text-xs rounded-full"
                                >
                                  {req.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
