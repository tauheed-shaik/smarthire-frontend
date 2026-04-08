import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import RecruiterLogin from "./components/Recruiter/RecruiterLogin";
import CandidateRegister from "./components/Candidate/CandidateRegister";
import CandidateLogin from "./components/Candidate/CandidateLogin";
import CandidateDashboard from "./components/Candidate/CandidateDashboard";
import UploadResume from "./components/Candidate/UploadResume";
import ManageProfile from "./components/Candidate/ManageProfile";
import AppliedJobs from "./components/Candidate/AppliedJobs";
import CheckStatus from "./components/Candidate/CheckStatus";
import CandidateProfile from "./components/Candidate/CandidateProfile";
import RecruiterDashboard from "./components/Recruiter/RecruiterDashboard";
import ViewResume from "./components/Recruiter/ViewResume";
import CandidateInterview from "./components/Candidate/CandidateInterview";
import RecruiterPostJob from "./components/Recruiter/RecruiterPostJob";
import RecruiterResumes from "./components/Recruiter/RecruiterResumes";
import RecruiterScheduleInterview from "./components/Recruiter/RecruiterScheduleInterview";
import RecruiterQandA from "./components/Recruiter/RecruiterQandA";
import RecruiterEvaluate from "./components/Recruiter/RecruiterEvaluate";
import RecruiterSelectionStatus from "./components/Recruiter/RecruiterSelectionStatus";
import CandidateMCQTest from "./components/Candidate/CandidateMCQTest";
import CandidateCodingTest from "./components/Candidate/CandidateCodingTest";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/candidate-login" element={<CandidateLogin />} />
          <Route path="/recruiter-login" element={<RecruiterLogin />} />
          <Route path="/candidate-register" element={<CandidateRegister />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/upload-resume" element={<UploadResume />} />
          <Route path="/profile" element={<ManageProfile />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/candidate-profile" element={<CandidateProfile />} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter-resume" element={<ViewResume />} />
          <Route path="/candidate/interview" element={<CandidateInterview />} />
          <Route path="/recruiter/post-job" element={<RecruiterPostJob />} />
          <Route path="/recruiter/resumes" element={<RecruiterResumes />} />
          <Route
            path="/recruiter/schedule"
            element={<RecruiterScheduleInterview />}
          />
          <Route path="/recruiter/questions" element={<RecruiterQandA />} />
          <Route path="/recruiter/evaluate" element={<RecruiterEvaluate />} />
          <Route
            path="/recruiter/status"
            element={<RecruiterSelectionStatus />}
          />
          <Route path="/candidate/mcq-test" element={<CandidateMCQTest />} />
          <Route path="/candidate/coding-test" element={<CandidateCodingTest />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
