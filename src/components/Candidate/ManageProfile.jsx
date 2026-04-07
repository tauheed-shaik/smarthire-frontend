// src/components/Candidate/ManageProfile.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Code,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

function ManageProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    resumePath: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const candidateId = localStorage.getItem("candidateId");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!candidateId) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8080/api/candidate/profile/${candidateId}`
        );

        const candidate = res.data["Candidate profile"];

        // Parse skills
        let skillsArray = [];
        try {
          if (candidate.skills) {
            skillsArray = JSON.parse(candidate.skills.replace(/\\"/g, '"'));
          }
        } catch (e) {
          console.warn("Failed to parse skills:", candidate.skills);
        }

        setProfile({
          name: candidate.name || "",
          email: candidate.email || "",
          phone: candidate.phone || "",
          experience: candidate.experience || "",
          skills: skillsArray.join(", "),
          resumePath: candidate.resumePath || "",
        });
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [candidateId]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = "Name is required";
    if (!profile.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      newErrors.email = "Invalid email";
    if (!profile.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(profile.phone.replace(/\D/g, "")))
      newErrors.phone = "Enter valid 10-digit phone";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Save profile
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      experience: profile.experience,
      skills: profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      await axios.put(
        `http://localhost:8080/api/candidate/update-profile?candidateId=${candidateId}`,
        payload
      );
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errMsg =
        err.response?.data?.Error ||
        err.response?.data?.message ||
        "Failed to update profile.";
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // DOWNLOAD RESUME
  const handleDownloadResume = async () => {
    if (!profile.resumePath) {
      setError("No resume found.");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const fileName = profile.resumePath.split("/").pop(); // Extract filename
      const response = await axios.get(
        `http://localhost:8080/${profile.resumePath}`,
        { responseType: "blob" }
      );

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Resume downloaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to download resume. File may be missing.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Manage Profile
          </h1>
          <p className="text-gray-400 mt-2">Keep your information up to date</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                  errors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Amit Sharma"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                  errors.email ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="amit@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                  errors.phone ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="7412589630"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Experience (Years)
              </label>
              <input
                type="text"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                placeholder="4"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Code className="inline w-4 h-4 mr-1" />
              Skills (comma separated)
            </label>
            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
              placeholder="React, Node.js, Java"
            />
            <p className="text-xs text-gray-400 mt-1">
              e.g., React, Node.js, AWS
            </p>
          </div>

          {/* RESUME SECTION */}
          <div className="mt-6 p-5 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium">Current Resume</p>
                  <p className="text-xs text-gray-400 truncate max-w-md">
                    {profile.resumePath ? profile.resumePath.split("/").pop() : "No resume uploaded"}
                  </p>
                </div>
              </div>

              {profile.resumePath && (
                <button
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-6 p-4 bg-green-900 border border-green-600 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProfile;