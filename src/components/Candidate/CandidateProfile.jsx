import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Code,
  GraduationCap,
  Download,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const candidateId = localStorage.getItem("candidateId");

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!candidateId) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/candidate/profile/${candidateId}`
        );

        const candidate = res.data["Candidate profile"];
        let skillsArray = [];
        try {
          if (candidate.skills) {
            skillsArray = JSON.parse(candidate.skills.replace(/\\"/g, '"'));
          }
        } catch (e) {
          console.warn("Failed to parse skills:", candidate.skills);
        }

        const profileData = {
          ...candidate,
          skillsArray,
          skillsString: skillsArray.join(", "),
        };

        setProfile(profileData);
        setFormData({
          name: candidate.name || "",
          email: candidate.email || "",
          phone: candidate.phone || "",
          experience: candidate.experience || "",
          skills: skillsArray.join(", "),
        });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [candidateId]);

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.email?.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email";
    if (!formData.phone?.trim()) errors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      errors.phone = "Enter valid 10-digit phone";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experience: formData.experience,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/candidate/update/${candidateId}`,
        payload
      );
      setMessage("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);

      // Refresh profile
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/candidate/profile/${candidateId}`
      );
      const candidate = res.data["Candidate profile"];
      const skillsArray = JSON.parse(candidate.skills.replace(/\\"/g, '"'));
      setProfile({
        ...candidate,
        skillsArray,
        skillsString: skillsArray.join(", "),
      });
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

  // Cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      experience: profile.experience || "",
      skills: profile.skillsString || "",
    });
    setValidationErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Profile not found.</div>
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-400 mt-2">
            View and manage your candidate profile
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-gray-400">Candidate ID: {profile.id}</p>
              </div>
            </div>
            {/* {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )} */}
          </div>

          {/* Profile Content */}
          {editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="inline w-4 h-4 mr-1" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.name ? "border-red-500" : "border-gray-600"
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-xs text-red-400">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.email ? "border-red-500" : "border-gray-600"
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" /> Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 transition ${
                      validationErrors.phone ? "border-red-500" : "border-gray-600"
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-xs text-red-400">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Briefcase className="inline w-4 h-4 mr-1" /> Experience (Years)
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Code className="inline w-4 h-4 mr-1" /> Skills
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                  placeholder="React, Node.js, Java"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelEdit}
                  className="px-5 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  <X className="w-4 h-4 inline mr-1" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-1" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="flex items-center text-lg">
                    <Mail className="w-5 h-5 mr-2 text-indigo-400" />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <p className="flex items-center text-lg">
                    <Phone className="w-5 h-5 mr-2 text-indigo-400" />
                    {profile.phone}
                  </p>
                </div>
              </div>

              {/* Experience & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Experience</p>
                  <p className="flex items-center text-lg">
                    <Briefcase className="w-5 h-5 mr-2 text-indigo-400" />
                    {profile.experience} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsArray.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Education */}
              {profile.education && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Education</p>
                  <p className="flex items-center text-lg">
                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-400" />
                    {profile.education}
                  </p>
                </div>
              )}

              {/* Resume */}
              {profile.resumePath && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Resume</p>
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/${profile.resumePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-900 text-green-300 rounded-lg hover:bg-green-800 transition text-sm font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;