import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const candidateId = localStorage.getItem("candidateId");

  // Handle file selection
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF file only.");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setMessage("");
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // File Input Change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Upload to Backend
  const handleUpload = async () => {
    if (!file || !candidateId) return;

    setUploading(true);
    setProgress(0);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);           // FIXED: Use "file"
    formData.append("candidateId", candidateId);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/resume/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      setMessage("Resume uploaded successfully!");
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.Error ||
        "Failed to upload resume.";
      setError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setError("");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Navbar */}
      <CandidateNavbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Upload Your Resume
          </h1>
          <p className="text-gray-400 mt-2">PDF format only • Max 5MB</p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-900 bg-opacity-20"
              : "border-gray-600 bg-gray-800"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <Upload className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-lg font-medium">Drag & drop your resume here</p>
          <p className="text-sm text-gray-400 mt-2">or click to browse</p>
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition">
            Select File
          </button>
        </div>

        {/* Selected File Preview */}
        {file && (
          <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-10 h-10 text-indigo-400 mr-4" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-red-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                Upload Resume
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mt-6 p-4 bg-green-900 border border-green-600 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* PDF Preview */}
        {file && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <iframe
                src={URL.createObjectURL(file)}
                title="Resume Preview"
                className="w-full h-96 rounded-lg"
                style={{ border: "none" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadResume;