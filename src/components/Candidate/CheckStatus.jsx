import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Building,
  MapPin,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import CandidateNavbar from "./CandidateNavbar";

function CheckStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);

  const candidateId = localStorage.getItem("candidateId");

  // Fetch applications + job details
  useEffect(() => {
    const fetchStatus = async () => {
      if (!candidateId) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Step 1: Get applications
        const appRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/applications/my-applications/${candidateId}`
        );

        const apps = appRes.data.applications || [];

        if (apps.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch job details
        const jobPromises = apps.map((app) =>
          axios.get(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/jobs/${app.jobId}`)
        );

        const jobResponses = await Promise.all(jobPromises);

        // Step 3: Merge
        const enriched = apps.map((app, index) => {
          const job = jobResponses[index].data.job;
          return {
            id: app.id,
            jobId: app.jobId,
            title: job.title || "Unknown Job",
            company: job.company || "Unknown Company",
            location: job.location || "Not specified",
            status: app.status,
            appliedAt: app.appliedAt,
            type: job.type || "",
            salaryRange: job.salaryRange || "",
          };
        });

        setApplications(enriched);
      } catch (err) {
        setError("Failed to load application status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [candidateId]);

  // Status Step Component
  const StatusStep = ({ status, label, isActive, isCompleted }) => {
    const config = {
      APPLIED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-900" },
      INTERVIEW: { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-900" },
      OFFER: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-900" },
      REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-900" },
    };

    const { icon: Icon, color, bg } = config[status] || config.APPLIED;
    const isCurrent = isActive && !isCompleted;

    return (
      <div className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCompleted ? "bg-green-900" : isCurrent ? bg : "bg-gray-700"
          }`}
        >
          <Icon className={`w-5 h-5 ${isCompleted ? "text-green-400" : isCurrent ? color : "text-gray-500"}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${isCurrent ? "text-white" : "text-gray-400"}`}>
            {label}
          </p>
        </div>
      </div>
    );
  };

  // Timeline Line
  const TimelineLine = ({ isActive }) => (
    <div className={`w-0.5 h-16 mx-auto ${isActive ? "bg-indigo-600" : "bg-gray-700"}`} />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Checking status...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <CandidateNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Check Application Status
          </h1>
          <p className="text-gray-400 mt-2">
            Track the progress of your job applications
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-xl font-semibold text-gray-400">
              No applications to track
            </p>
            <p className="text-gray-500 mt-2">
              Apply to jobs to see status updates here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {applications.map((app) => {
              const statusOrder = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
              const currentIndex = statusOrder.indexOf(app.status);
              const isRejected = app.status === "REJECTED";
              const isOffer = app.status === "OFFER";

              return (
                <div
                  key={app.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">{app.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {app.company}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {app.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied on</p>
                      <p className="text-sm font-medium">
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="relative">
                    <div className="flex justify-between items-center">
                      {statusOrder.map((status, index) => {
                        const isActive = index <= currentIndex && !isRejected;
                        const isCompleted = index < currentIndex && !isRejected;
                        const showStep = !isRejected || status === "REJECTED";

                        if (!showStep) return null;

                        return (
                          <div key={status} className="flex-1 flex flex-col items-center">
                            <StatusStep
                              status={status}
                              label={status}
                              isActive={isActive}
                              isCompleted={isCompleted}
                            />
                            {index < statusOrder.length - 1 && showStep && (
                              <TimelineLine isActive={isActive} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Status Message */}
                  {isRejected && (
                    <div className="mt-6 p-4 bg-red-900 border border-red-600 rounded-lg text-center">
                      <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-sm">Application was not selected</p>
                    </div>
                  )}

                  {isOffer && (
                    <div className="mt-6 p-4 bg-green-900 border border-green-600 rounded-lg text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        Congratulations! You have a job offer
                      </p>
                      <p className="text-xs text-green-300 mt-1">
                        Salary: {app.salaryRange}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckStatus;