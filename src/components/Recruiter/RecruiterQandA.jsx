// src/pages/recruiter/RecruiterQandA.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Code,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Sparkles,
  Save,
  X,
} from "lucide-react";
import RecruiterNavbar from "./RecruiterNavbar";

// ────────────────────────────────────────────────
// IMPORTANT: Base URL without /recruiter
// ────────────────────────────────────────────────
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

export default function RecruiterQandA() {
  const [activeTab, setActiveTab] = useState("mcq"); // "mcq" or "coding"
  // MCQ states
  const [mcqs, setMcqs] = useState([]);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [generateLoading, setGenerateLoading] = useState(false);
  // Coding states
  const [codingQuestions, setCodingQuestions] = useState([]);
  // Shared states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formType, setFormType] = useState("mcq"); // "mcq" or "coding"
  // MCQ form
  const [mcqFormData, setMcqFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
  });
  // Coding form
  const [codingFormData, setCodingFormData] = useState({
    title: "",
    description: "",
    functionSignature: "",
    starterCode: "",
    testCases: [{ input: "", expectedOutput: "", hidden: false }],
  });

  const navigate = useNavigate();
  const recruiterId = localStorage.getItem("recruiterId");

  // ────────────────────────────────────────────────
  // Fetch functions – FIXED PATHS
  // ────────────────────────────────────────────────
  const fetchMCQs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recruiter/mcq/all`, {
        params: { recruiterId },
      });
      setMcqs(res.data.questions || []);
    } catch (err) {
      console.error("Failed to load MCQs", err);
    }
  };

  const fetchCodingQuestions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coding`, {
        params: { recruiterId },
      });
      const data = res.data;
      // Safely extract array
      const questions = Array.isArray(data)
        ? data
        : data.questions || data.data || data.codingQuestions || [];
      setCodingQuestions(questions);
      console.log("Loaded coding questions:", questions); // debug
    } catch (err) {
      console.error("Failed to load coding questions", err);
      setCodingQuestions([]);
    }
  };

  useEffect(() => {
    if (!recruiterId) {
      navigate("/recruiter-login");
      return;
    }
    setLoading(true);
    Promise.all([fetchMCQs(), fetchCodingQuestions()]).finally(() =>
      setLoading(false)
    );
  }, [recruiterId]);

  // ────────────────────────────────────────────────
  // MCQ Generation
  // ────────────────────────────────────────────────
  const generateQuestions = async () => {
    if (!topic.trim() || count < 1 || count > 10) {
      setError("Enter topic and count (1-10)");
      return;
    }
    setGenerateLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API_BASE}/recruiter/questions/generate`,
        null,
        { params: { topic, count } }
      );
      const newQuestions = res.data.questions || [];
      if (newQuestions.length > 0) {
        setMcqs((prev) => [
          ...prev,
          ...newQuestions.map((q) => ({ ...q, isNew: true })),
        ]);
        setSuccess(
          `Generated ${newQuestions.length} questions! Click "Save All Generated" below.`
        );
      } else {
        setError("No valid questions returned. Check console.");
      }
      setTopic("");
      setCount(3);
    } catch (err) {
      setError(err.response?.data?.Error || "Generation failed");
      console.error(err);
    } finally {
      setGenerateLoading(false);
    }
  };

  const saveGenerated = async () => {
    const newOnes = mcqs.filter((q) => q.isNew);
    if (!newOnes.length) return;
    try {
      await Promise.all(
        newOnes.map((q) =>
          axios.post(`${API_BASE}/recruiter/mcq/save`, q, {
            params: { recruiterId },
          })
        )
      );
      setSuccess("Generated questions saved successfully!");
      fetchMCQs(); // refresh list
    } catch (err) {
      setError("Save failed: " + (err.response?.data?.Error || err.message));
      console.error(err);
    }
  };

  // ────────────────────────────────────────────────
  // MCQ Form Handlers
  // ────────────────────────────────────────────────
  const openMcqForm = (question = null) => {
    setFormType("mcq");
    if (question) {
      setEditingId(question.id);
      setMcqFormData({
        question: question.question,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        answer: question.answer,
      });
    } else {
      setEditingId(null);
      setMcqFormData({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        answer: "A",
      });
    }
    setShowForm(true);
  };

  const handleMcqSubmit = async (e) => {
    e.preventDefault();
    const { question, optionA, optionB, optionC, optionD } = mcqFormData;
    if (!question || !optionA || !optionB || !optionC || !optionD) {
      setError("All fields are required");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/recruiter/mcq/${editingId}`, mcqFormData, {
          params: { recruiterId },
        });
        setSuccess("MCQ updated!");
      } else {
        await axios.post(`${API_BASE}/recruiter/mcq/save`, mcqFormData, {
          params: { recruiterId },
        });
        setSuccess("MCQ added!");
      }
      setShowForm(false);
      fetchMCQs();
    } catch (err) {
      setError("Save failed");
    }
  };

  // ────────────────────────────────────────────────
  // Coding Form Handlers (unchanged)
  // ────────────────────────────────────────────────
  const openCodingForm = (question = null) => {
    setFormType("coding");
    if (question) {
      setEditingId(question.id);
      setCodingFormData({
        title: question.title || "",
        description: question.description || "",
        functionSignature: question.functionSignature || "",
        starterCode: question.starterCode || "",
        testCases:
          question.testCases?.length > 0
            ? question.testCases
            : [{ input: "", expectedOutput: "", hidden: false }],
      });
    } else {
      setEditingId(null);
      setCodingFormData({
        title: "",
        description: "",
        functionSignature: "",
        starterCode: "",
        testCases: [{ input: "", expectedOutput: "", hidden: false }],
      });
    }
    setShowForm(true);
  };

  const addTestCase = () => {
    setCodingFormData({
      ...codingFormData,
      testCases: [
        ...codingFormData.testCases,
        { input: "", expectedOutput: "", hidden: false },
      ],
    });
  };

  const removeTestCase = (index) => {
    if (codingFormData.testCases.length <= 1) return;
    const updated = codingFormData.testCases.filter((_, i) => i !== index);
    setCodingFormData({ ...codingFormData, testCases: updated });
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...codingFormData.testCases];
    updated[index][field] = value;
    setCodingFormData({ ...codingFormData, testCases: updated });
  };

  const handleCodingSubmit = async (e) => {
    e.preventDefault();
    const { title, description, functionSignature } = codingFormData;
    if (!title.trim() || !description.trim() || !functionSignature.trim()) {
      setError("Title, description and function signature are required");
      return;
    }
    const validTestCases = codingFormData.testCases.filter(
      (tc) => tc.input.trim() && tc.expectedOutput.trim()
    );
    if (validTestCases.length === 0) {
      setError("At least one valid test case is required");
      return;
    }
    const payload = {
      ...codingFormData,
      testCases: validTestCases,
    };
    try {
      const baseUrl = `${API_BASE}/coding`;
      let res;
      if (editingId) {
        res = await axios.put(`${baseUrl}/${editingId}`, payload, {
          params: { recruiterId },
          headers: { "Content-Type": "application/json" },
        });
        setSuccess("Coding question updated!");
      } else {
        res = await axios.post(baseUrl, payload, {
          params: { recruiterId },
          headers: { "Content-Type": "application/json" },
        });
        setSuccess("Coding question created!");
      }
      setShowForm(false);
      fetchCodingQuestions();
    } catch (err) {
      console.error("Coding submit error:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Save failed"
      );
    }
  };

  // ────────────────────────────────────────────────
  // Delete
  // ────────────────────────────────────────────────
  const deleteQuestion = async (type, id) => {
    if (!window.confirm(`Delete this ${type} question?`)) return;
    try {
      let endpoint;
      if (type === "mcq") {
        endpoint = `/recruiter/mcq/${id}`;
      } else {
        endpoint = `/coding/${id}`;
      }
      await axios.delete(`${API_BASE}${endpoint}`, {
        params: { recruiterId },
      });
      setSuccess(`${type.toUpperCase()} question deleted`);
      if (type === "mcq") fetchMCQs();
      else fetchCodingQuestions();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/recruiter-login");
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <RecruiterNavbar onLogout={handleLogout} />
      <div className="p-6 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header + Add Button */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Manage Questions
              </h1>
              <p className="text-gray-400 mt-1">
                Create, edit and manage MCQs and Coding problems
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openMcqForm()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> Add MCQ
              </button>
              <button
                onClick={() => openCodingForm()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
              >
                <Code size={18} /> Add Coding
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("mcq")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "mcq"
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              MCQ Questions
            </button>
            <button
              onClick={() => setActiveTab("coding")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "coding"
                  ? "border-b-2 border-emerald-500 text-emerald-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Coding Questions
            </button>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/40 border border-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-400" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" />
              {error}
            </div>
          )}

          {/* AI Generation - only for MCQ */}
          {activeTab === "mcq" && (
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 mb-8 border border-indigo-800/40">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400 mr-3" />
                <h2 className="text-xl font-semibold">Generate MCQs with AI</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Java Collections, React Hooks, SQL Joins"
                  className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.max(1, Math.min(10, Number(e.target.value) || 1))
                    )
                  }
                  className="w-24 px-4 py-3 bg-gray-800 rounded-lg text-center focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  onClick={generateQuestions}
                  disabled={generateLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {generateLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} /> Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          ) : activeTab === "mcq" ? (
            <>
              {/* Generated (unsaved) MCQs section */}
              {mcqs.some((q) => q.isNew) && (
                <div className="mb-10 p-6 bg-yellow-900/30 border border-yellow-600/50 rounded-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-yellow-400">
                      Generated Questions (Not Saved Yet)
                    </h2>
                    <button
                      onClick={saveGenerated}
                      className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium flex items-center gap-2 shadow-md"
                    >
                      <Save size={18} />
                      Save All Generated
                    </button>
                  </div>

                  <div className="grid gap-5">
                    {mcqs
                      .filter((q) => q.isNew)
                      .map((q) => (
                        <div
                          key={q.id || Math.random()}
                          className="bg-gray-800/70 p-5 rounded-xl border border-yellow-600/40 hover:border-yellow-500/50 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-medium">{q.question}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-700/40 text-yellow-300 text-xs rounded">
                                New – not saved
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                            {["A", "B", "C", "D"].map((opt) => (
                              <p
                                key={opt}
                                className={
                                  q.answer === opt
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }
                              >
                                {opt}) {q[`option${opt}`]}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-indigo-400 mt-3">
                            Correct answer: <strong>{q.answer}</strong>
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Saved MCQs */}
              {mcqs.filter((q) => !q.isNew).length === 0 &&
              !mcqs.some((q) => q.isNew) ? (
                <div className="text-center py-20 text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  No MCQ questions yet
                </div>
              ) : (
                <div className="grid gap-5">
                  {mcqs
                    .filter((q) => !q.isNew)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 hover:border-indigo-600/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium">{q.question}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openMcqForm(q)}
                              className="p-2 hover:bg-gray-700 rounded"
                            >
                              <Edit2 size={18} className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => deleteQuestion("mcq", q.id)}
                              className="p-2 hover:bg-red-900/30 rounded"
                            >
                              <Trash2 size={18} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                          {["A", "B", "C", "D"].map((opt) => (
                            <p
                              key={opt}
                              className={
                                q.answer === opt
                                  ? "text-green-400"
                                  : "text-gray-400"
                              }
                            >
                              {opt}) {q[`option${opt}`]}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-indigo-400 mt-3">
                          Correct answer: <strong>{q.answer}</strong>
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : codingQuestions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-60" />
              No coding questions yet
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.isArray(codingQuestions) ? (
                codingQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-emerald-600/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-emerald-400">
                        {q.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCodingForm(q)}
                          className="p-2 hover:bg-gray-700 rounded"
                        >
                          <Edit2 size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteQuestion("coding", q.id)}
                          className="p-2 hover:bg-red-900/30 rounded"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {q.description}
                    </p>
                    {q.functionSignature && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">
                          Signature
                        </div>
                        <code className="bg-gray-900 px-3 py-2 rounded font-mono text-emerald-300 block overflow-x-auto">
                          {q.functionSignature}
                        </code>
                      </div>
                    )}
                    {q.testCases?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">
                          Test Cases ({q.testCases.length})
                        </div>
                        <div className="space-y-3">
                          {q.testCases.map((tc, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-900 p-3 rounded text-sm"
                            >
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Case {idx + 1}</span>
                                {tc.hidden && (
                                  <span className="text-amber-400">hidden</span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-gray-400 text-xs mb-1">
                                    Input
                                  </div>
                                  <pre className="text-emerald-300 font-mono whitespace-pre-wrap">
                                    {tc.input}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-gray-400 text-xs mb-1">
                                    Expected
                                  </div>
                                  <pre className="text-emerald-300 font-mono whitespace-pre-wrap">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-red-400 py-8 text-sm col-span-2">
                  Error loading coding questions — data is not an array
                </p>
              )}
            </div>
          )}

          {/* ── MODAL ── */}
          {showForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {editingId ? "Edit" : "Add"}{" "}
                      {formType === "mcq" ? "MCQ" : "Coding Problem"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  {formType === "mcq" ? (
                    // MCQ FORM
                    <form onSubmit={handleMcqSubmit} className="space-y-5">
                      <textarea
                        value={mcqFormData.question}
                        onChange={(e) =>
                          setMcqFormData({
                            ...mcqFormData,
                            question: e.target.value,
                          })
                        }
                        placeholder="Enter question..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["A", "B", "C", "D"].map((opt) => (
                          <input
                            key={opt}
                            type="text"
                            placeholder={`Option ${opt}`}
                            value={mcqFormData[`option${opt}`]}
                            onChange={(e) =>
                              setMcqFormData({
                                ...mcqFormData,
                                [`option${opt}`]: e.target.value,
                              })
                            }
                            className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600"
                            required
                          />
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Correct Answer
                        </label>
                        <select
                          value={mcqFormData.answer}
                          onChange={(e) =>
                            setMcqFormData({
                              ...mcqFormData,
                              answer: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
                        >
                          <Save size={18} />
                          {editingId ? "Update MCQ" : "Save MCQ"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // CODING FORM (unchanged)
                    <form onSubmit={handleCodingSubmit} className="space-y-6">
                      <input
                        type="text"
                        placeholder="Problem Title *"
                        value={codingFormData.title}
                        onChange={(e) =>
                          setCodingFormData({
                            ...codingFormData,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <textarea
                        placeholder="Problem Description *"
                        value={codingFormData.description}
                        onChange={(e) =>
                          setCodingFormData({
                            ...codingFormData,
                            description: e.target.value,
                          })
                        }
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Function Signature *  e.g. int[] twoSum(int[] nums, int target)"
                        value={codingFormData.functionSignature}
                        onChange={(e) =>
                          setCodingFormData({
                            ...codingFormData,
                            functionSignature: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <textarea
                        placeholder="Starter Code (optional)"
                        value={codingFormData.starterCode}
                        onChange={(e) =>
                          setCodingFormData({
                            ...codingFormData,
                            starterCode: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600"
                      />
                      {/* Test Cases */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-lg font-medium">
                            Test Cases *
                          </label>
                          <button
                            type="button"
                            onClick={addTestCase}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-2 text-sm"
                          >
                            <Plus size={16} /> Add Test Case
                          </button>
                        </div>
                        <div className="space-y-5">
                          {codingFormData.testCases.map((tc, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-900 p-5 rounded-lg border border-gray-700"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-emerald-400">
                                  Test Case {idx + 1}
                                </h4>
                                {codingFormData.testCases.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTestCase(idx)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-sm text-gray-400 mb-2">
                                    Input
                                  </label>
                                  <textarea
                                    value={tc.input}
                                    onChange={(e) =>
                                      updateTestCase(
                                        idx,
                                        "input",
                                        e.target.value
                                      )
                                    }
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 rounded font-mono text-sm focus:ring-2 focus:ring-emerald-600"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-400 mb-2">
                                    Expected Output
                                  </label>
                                  <textarea
                                    value={tc.expectedOutput}
                                    onChange={(e) =>
                                      updateTestCase(
                                        idx,
                                        "expectedOutput",
                                        e.target.value
                                      )
                                    }
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 rounded font-mono text-sm focus:ring-2 focus:ring-emerald-600"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="mt-4 flex items-center">
                                <input
                                  type="checkbox"
                                  checked={tc.hidden}
                                  onChange={(e) =>
                                    updateTestCase(
                                      idx,
                                      "hidden",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-400">
                                  Hidden test case (not shown to candidate)
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
                        >
                          <Save size={18} />
                          {editingId
                            ? "Update Coding Problem"
                            : "Create Coding Problem"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
