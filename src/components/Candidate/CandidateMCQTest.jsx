// src/components/Candidate/CandidateMCQTest.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Timer,
  ChevronRight,
  CheckCircle,
  Camera,
  AlertTriangle,
} from "lucide-react";

export default function CandidateMCQTest() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const candidateId = localStorage.getItem("candidateId");
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showCornerWarning, setShowCornerWarning] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // AUTO FULLSCREEN + CAMERA
  useEffect(() => {
    const goFull = async () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {
        console.log("Camera blocked");
      }
    };
    goFull();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // CORNER MOUSE WARNING DETECTION
  useEffect(() => {
    const warningZone = 60; // pixels from edge

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (
        x < warningZone ||
        x > w - warningZone ||
        y < warningZone ||
        y > h - warningZone
      ) {
        setShowCornerWarning(true);
        setTimeout(() => setShowCornerWarning(false), 4000);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // FETCH TEST (unchanged)
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/interviews/candidate/mcq/${candidateId}`
        );
        if (res.data.hasMCQ && res.data.jobId == jobId) {
          setData(res.data);
          setTimeLeft(res.data.timeLeft || 1800);
        } else {
          alert("No MCQ test scheduled for this job");
          navigate("/applied-jobs");
        }
      } catch (err) {
        alert("Failed to load test");
        navigate("/applied-jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [candidateId, jobId, navigate]);

  // TIMER
  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/interviews/${data.sessionId}/submit-mcq`,
        {
          answers: Object.entries(answers).map(([qid, ans]) => ({
            questionId: qid,
            answer: ans,
          })),
        }
      );

      alert(`Test Submitted! Score: ${res.data.score}%`);
      navigate("/applied-jobs");
    } catch (err) {
      alert("Submit failed");
      setSubmitted(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center text-white text-3xl">
        Entering Secure Test Mode...
      </div>
    );
  }

  if (!data) return null;

  const question = data.questions[currentQ];

  return (
    <div className="fixed inset-0 bg-gray-900 text-white overflow-hidden">
      {/* CORNER WARNING */}
      {showCornerWarning && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center z-50 pointer-events-none animate-pulse">
          <div className="text-center">
            <AlertTriangle className="w-24 h-24 mx-auto text-yellow-400 mb-6" />
            <h1 className="text-6xl font-bold text-yellow-300 mb-4">WARNING</h1>
            <p className="text-4xl font-bold">Do NOT move cursor to corners</p>
            <p className="text-3xl mt-4">This action is being monitored</p>
          </div>
        </div>
      )}

      {/* CAMERA FEED */}
      <div className="absolute top-6 right-6 z-40 bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-600">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 font-bold text-sm flex items-center gap-2">
          <Camera className="w-5 h-5" />
          LIVE PROCTORING
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-80 h-60 object-cover"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="p-8 pt-24 max-w-5xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-indigo-400">
                MCQ Assessment
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Question {currentQ + 1} / {data.questions.length}
              </p>
            </div>
            <div className="text-5xl font-bold text-red-400 flex items-center gap-4">
              <Timer className="w-12 h-12" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4 mb-10">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all"
              style={{
                width: `${((currentQ + 1) / data.questions.length) * 100}%`,
              }}
            />
          </div>

          <h2 className="text-3xl font-medium mb-10 text-indigo-300">
            {question.question}
          </h2>

          <div className="space-y-6">
            {["A", "B", "C", "D"].map((opt) => (
              <label
                key={opt}
                className={`flex items-center p-8 rounded-2xl cursor-pointer text-xl border-4 transition-all ${
                  answers[question.id] === opt
                    ? "bg-indigo-600 border-indigo-500 shadow-2xl scale-105"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  checked={answers[question.id] === opt}
                  onChange={() =>
                    setAnswers({ ...answers, [question.id]: opt })
                  }
                  className="w-7 h-7 text-indigo-600 mr-6"
                />
                <span className="font-medium">{question[`option${opt}`]}</span>
              </label>
            ))}
          </div>

          <div className="mt-16 flex justify-between items-center">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-10 py-5 bg-gray-700 rounded-xl text-xl font-bold disabled:opacity-50"
            >
              Previous
            </button>

            {currentQ === data.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className="px-16 py-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-2xl font-bold flex items-center gap-4 shadow-2xl hover:scale-105"
              >
                <CheckCircle className="w-10 h-10" />
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                className="px-16 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-2xl font-bold flex items-center gap-4 shadow-2xl hover:scale-105"
              >
                Next <ChevronRight className="w-10 h-10" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
