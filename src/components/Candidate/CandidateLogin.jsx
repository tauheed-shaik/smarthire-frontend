import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Brain,
  X,
} from "lucide-react";
import axios from "axios";

function CandidateLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [forgotErrors, setForgotErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // === VALIDATION ===
  const validateLogin = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email";

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgot = () => {
    const newErrors = {};
    if (!forgotForm.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.email))
      newErrors.email = "Invalid email";

    if (!forgotForm.newPassword)
      newErrors.newPassword = "New password required";
    else if (forgotForm.newPassword.length < 6)
      newErrors.newPassword = "Min 6 characters";

    setForgotErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === LOGIN: POST with form-urlencoded (matches @PostMapping + @RequestParam) ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!validateLogin()) {
      setLoading(false);
      return;
    }

    const formData = new URLSearchParams();
    formData.append("email", form.email);
    formData.append("password", form.password);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/candidate/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("candidateId", res.data.candidateId);
      localStorage.setItem("userEmail", form.email);
      setMessage("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/candidate-dashboard";
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.Error || "Invalid email or password";
      setMessage(errorMsg);
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // === FORGOT PASSWORD: PUT with query params (if needed) ===
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");

    if (!validateForgot()) {
      setForgotLoading(false);
      return;
    }

    try {
      await axios.put(
        "http://localhost:8080/api/candidate/forgot-password",
        null,
        {
          params: {
            email: forgotForm.email,
            password: forgotForm.newPassword,
          },
        }
      );

      setForgotMessage("Password updated successfully!");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotForm({ email: "", newPassword: "" });
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.Error || "Failed to update password";
      setForgotMessage(errorMsg);
      setForgotErrors({ general: errorMsg });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "login") {
      setForm({ ...form, [name]: value });
      if (errors[name]) setErrors({ ...errors, [name]: "" });
    } else {
      setForgotForm({ ...forgotForm, [name]: value });
      if (forgotErrors[name]) setForgotErrors({ ...forgotErrors, [name]: "" });
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-white relative overflow-hidden"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Back Button */}
      <div className="pt-8 px-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Login */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SmartHire
            </h2>
            <p className="text-gray-400">Candidate Login</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => handleInputChange(e, "login")}
                  className={`w-full pl-10 pr-3 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600"
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={(e) => handleInputChange(e, "login")}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-600 transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div
              className={`p-4 rounded-lg mt-4 border ${
                message.includes("successful")
                  ? "bg-green-900 border-green-600"
                  : "bg-red-900 border-red-600"
              }`}
            >
              <div className="flex items-center">
                {message.includes("successful") && (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex justify-between items-center pt-6 text-sm">
            <button
              onClick={() => setShowForgotModal(true)}
              className="text-indigo-400 hover:text-indigo-300 transition"
            >
              Forgot password?
            </button>
            <a
              href="/candidate-register"
              className="text-indigo-400 hover:text-indigo-300 transition"
            >
              Don't have an account? Register
            </a>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotErrors({});
                setForgotMessage("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">Reset Password</h3>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={forgotForm.email}
                    onChange={(e) => handleInputChange(e, "forgot")}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 ${
                      forgotErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {forgotErrors.email && (
                  <p className="mt-1 text-xs text-red-400">
                    {forgotErrors.email}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    name="newPassword"
                    value={forgotForm.newPassword}
                    onChange={(e) => handleInputChange(e, "forgot")}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-indigo-600 ${
                      forgotErrors.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {forgotErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    {forgotErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {forgotLoading ? "Updating..." : "Update Password"}
              </button>
            </form>

            {/* Forgot Message */}
            {forgotMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm border ${
                  forgotMessage.includes("successfully")
                    ? "bg-green-900 border-green-600"
                    : "bg-red-900 border-red-600"
                }`}
              >
                {forgotMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 blur-3xl"></div>
        </div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

export default CandidateLogin;
