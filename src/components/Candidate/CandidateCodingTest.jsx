import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AceEditor from "react-ace";
import { useSearchParams, useNavigate } from "react-router-dom";

// FIX ACE WARNING
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

import {
  Timer,
  Play,
  Send,
  AlertTriangle,
  Camera,
  Code,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const languages = [
  {
    name: "Java",
    mode: "java",
    pistonLang: "java",
    version: "*",
    starter:
      "// Java solution\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}",
  },
  {
    name: "C++",
    mode: "c_cpp",
    pistonLang: "c++",
    version: "*",
    starter:
      "// C++ solution\n#include <iostream>\nusing namespace std;\nint main() {\n    // your code\n    return 0;\n}",
  },
  {
    name: "C",
    mode: "c_cpp",
    pistonLang: "c",
    version: "*",
    starter:
      "// C solution\n#include <stdio.h>\nint main() {\n    // your code\n    return 0;\n}",
  },
  {
    name: "Python",
    mode: "python",
    pistonLang: "python",
    version: "*",
    starter:
      "# Python solution\ndef your_function_name(param):\n    # your code\n    pass",
  },
  {
    name: "JavaScript",
    mode: "javascript",
    pistonLang: "javascript",
    version: "*",
    starter:
      "// JavaScript solution\nfunction yourFunctionName(param) {\n  // your code\n}",
  },
];

export default function CandidateCodingTest() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const candidateId = localStorage.getItem("candidateId");
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]); // array of questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState(languages[0].starter);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showCornerWarning, setShowCornerWarning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fullscreen + Camera + Corner Warning
  useEffect(() => {
    const goFull = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {}
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {}
    };
    goFull();

    const warningZone = 60;
    const handleMouseMove = (e) => {
      const x = e.clientX,
        y = e.clientY,
        w = window.innerWidth,
        h = window.innerHeight;
      if (
        x < warningZone ||
        x > w - warningZone ||
        y < warningZone ||
        y > h - warningZone
      ) {
        setShowCornerWarning(true);
        setTimeout(() => setShowCornerWarning(false), 5000);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Load session data
  useEffect(() => {
    if (!sessionId || !candidateId) {
      setError("Invalid session or not logged in");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/interviews/candidate/coding/${candidateId}`
        );
        const data = res.data;
        console.log("FULL CODING SESSION RESPONSE:", data);

        setSession(data);

        if (
          data.hasCoding &&
          data.codingQuestions &&
          data.codingQuestions.length > 0
        ) {
          setQuestions(data.codingQuestions);
          setCurrentQuestionIndex(0);
          const firstQ = data.codingQuestions[0];
          setCode(firstQ.starterCode || languages[0].starter);
          console.log("Loaded questions:", data.codingQuestions.length);
        } else {
          console.log("No coding questions found → Practice Mode");
          setError("No question assigned — Practice Mode");
          setCode(languages[0].starter);
        }

        setTimeLeft(3600);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError(
          "Failed to load session: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, candidateId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || questions.length === 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Change language
  const changeLanguage = (lang) => {
    setSelectedLang(lang);
    setCode(lang.starter);
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Run code with language-specific wrapper
  const runCode = async () => {
    if (running || !currentQuestion) return;
    setRunning(true);
    setOutput("Running...");

    let wrappedCode = code.trim();
    const lang = selectedLang.pistonLang.toLowerCase();

    // Check if this is a function-based question
    const hasFunction =
      currentQuestion?.functionSignature &&
      currentQuestion.functionSignature.trim() !== "" &&
      !currentQuestion.functionSignature.includes("console.log") &&
      !currentQuestion.functionSignature.includes("print");

    if (hasFunction) {
      // Extract function name
      let funcName = "solution"; // fallback
      const match = currentQuestion.functionSignature.match(/(\w+)\s*\(/);
      if (match) funcName = match[1].trim();

      // Use first visible test case input
      const testInput =
        currentQuestion?.testCases?.find((tc) => !tc.hidden)?.input || "test";

      // Wrap with function call + print
      if (lang === "python") {
        wrappedCode += `\n\n# Auto-test call\nprint(${funcName}("${testInput.replace(
          /"/g,
          '\\"'
        )}"))`;
      } else if (lang === "javascript") {
        wrappedCode += `\n\n// Auto-test call\nconsole.log(${funcName}("${testInput.replace(
          /"/g,
          '\\"'
        )}"));`;
      } else if (lang === "java") {
        wrappedCode =
          `public class Main {\n` +
          `    ${wrappedCode}\n` +
          `    public static void main(String[] args) {\n` +
          `        System.out.println(${funcName}("${testInput.replace(
            /"/g,
            '\\"'
          )}"));\n` +
          `    }\n` +
          `}`;
      } else if (lang === "c" || lang === "c++") {
        wrappedCode =
          `#include <stdio.h>\n` +
          `#include <string.h>\n` +
          (lang === "c++"
            ? "#include <iostream>\n#include <string>\nusing namespace std;\n"
            : "") +
          `${wrappedCode}\n\n` +
          `int main() {\n` +
          `    char input[] = "${testInput.replace(/"/g, '\\"')}";\n` +
          `    printf("%s\\n", ${funcName}(input));\n` +
          `    return 0;\n` +
          `}`;
      }
    }
    // If no function signature → just run raw code (perfect for print-only questions)

    try {
      const fileExt =
        {
          java: ".java",
          "c++": ".cpp",
          c: ".c",
          python: ".py",
          javascript: ".js",
        }[lang] || ".txt";

      const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: selectedLang.pistonLang,
        version: selectedLang.version,
        files: [{ name: `main${fileExt}`, content: wrappedCode }],
      });

      const run = res.data.run;
      let display = "";

      if (run.code === 0) {
        display =
          run.stdout.trim() ||
          run.output.trim() ||
          "Code ran successfully (no output printed)";
      } else {
        display = `Error:\n${
          run.stderr.trim() || run.output.trim() || "Execution failed"
        }`;
      }

      setOutput(display);
    } catch (err) {
      setOutput("Run failed: " + (err.response?.data?.message || err.message));
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting || !sessionId || !currentQuestion) {
      alert(
        !currentQuestion
          ? "No question assigned to submit"
          : "Cannot submit: no active session"
      );
      return;
    }
    if (!window.confirm("Submit your code?")) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/interviews/coding/submit/${sessionId}`,
        {
          code,
          language: selectedLang.name.toLowerCase(),
        }
      );
      setTestResults(res.data.result);
      alert(`Submitted! Score: ${res.data.result?.score || "N/A"}%`);
      navigate("/applied-jobs");
    } catch (err) {
      alert("Submit failed: " + (err.response?.data?.Error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Next/Prev question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCode(
        questions[currentQuestionIndex + 1].starterCode || languages[0].starter
      );
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setCode(
        questions[currentQuestionIndex - 1].starterCode || languages[0].starter
      );
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Corner Warning */}
      {showCornerWarning && (
        <div className="fixed inset-0 bg-red-900/90 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center">
            <AlertTriangle className="w-32 h-32 mx-auto text-yellow-400 mb-8 animate-pulse" />
            <h1 className="text-6xl font-bold text-yellow-300 mb-6">WARNING</h1>
            <p className="text-4xl">Do NOT move cursor to corners</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Code className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">
              {currentQuestion ? currentQuestion.title : "Code Playground"}
            </h1>
            <p className="text-sm text-gray-400">
              {currentQuestion ? "Time Remaining" : "No time limit"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {currentQuestion && (
            <div className="text-3xl font-mono text-red-400 flex items-center gap-3">
              <Timer className="w-8 h-8" />
              {formatTime(timeLeft)}
            </div>
          )}
          {/* Language Selector */}
          <select
            value={selectedLang.name}
            onChange={(e) =>
              changeLanguage(languages.find((l) => l.name === e.target.value))
            }
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {languages.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="bg-black rounded-lg overflow-hidden border-2 border-purple-600">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-48 h-36 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel – Question Info */}
        <div className="w-1/3 bg-gray-850 p-6 overflow-y-auto border-r border-gray-700">
          {currentQuestion ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-400">
                  {currentQuestion.title}
                </h2>
                <div className="text-sm text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <p className="text-gray-300 mb-6 whitespace-pre-wrap">
                {currentQuestion.description}
              </p>

              {currentQuestion.functionSignature && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Signature</h3>
                  <pre className="bg-gray-900 p-4 rounded font-mono text-emerald-300 overflow-x-auto">
                    {currentQuestion.functionSignature}
                  </pre>
                </div>
              )}

              {currentQuestion.starterCode && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Starter Code</h3>
                  <pre className="bg-gray-900 p-4 rounded font-mono text-gray-300 overflow-x-auto">
                    {currentQuestion.starterCode}
                  </pre>
                </div>
              )}

              {currentQuestion.testCases?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Sample Test Cases
                  </h3>
                  {currentQuestion.testCases
                    .filter((tc) => !tc.hidden)
                    .map((tc, i) => (
                      <div key={i} className="bg-gray-900 p-4 rounded mb-4">
                        <div className="text-sm text-gray-400 mb-2">
                          Test {i + 1}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Input</div>
                            <pre className="text-emerald-300">{tc.input}</pre>
                          </div>
                          <div>
                            <div className="text-gray-500">Expected</div>
                            <pre className="text-emerald-300">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {questions.length > 1 && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Code className="w-20 h-20 mx-auto text-gray-500 mb-6" />
              <h2 className="text-3xl font-bold text-gray-400 mb-4">
                Code Playground
              </h2>
              <p className="text-lg text-gray-500 max-w-md mx-auto">
                No question assigned for this session.
                <br />
                Choose a language and start coding!
              </p>
            </div>
          )}
        </div>

        {/* Right Panel – Editor + Output */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <AceEditor
              mode={selectedLang.mode}
              theme="monokai"
              value={code}
              onChange={setCode}
              fontSize={16}
              width="100%"
              height="100%"
              showPrintMargin={false}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={runCode}
                disabled={running || !currentQuestion}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {running ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Run Code
              </button>
              {sessionId && currentQuestion && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Submit Solution
                </button>
              )}
            </div>
            {currentQuestion && (
              <div className="text-2xl font-mono text-red-400">
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="h-64 bg-gray-900 border-t border-gray-700 p-4 overflow-y-auto font-mono text-sm">
            {output || "Click 'Run Code' to execute your code..."}
            {testResults && (
              <div className="mt-4">
                <h4 className="text-lg font-bold text-emerald-400">
                  Submission Results
                </h4>
                <p>Score: {testResults.score}%</p>
                <p>
                  Passed: {testResults.passed} / {testResults.total}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
