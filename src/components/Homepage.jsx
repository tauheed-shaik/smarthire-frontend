// src/pages/Homepage.jsx
import React, { useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Users,
  Briefcase,
  Brain,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Code,
  FileSearch,
  Video,
  BarChart3,
  Zap,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 backdrop-blur-md bg-gray-900/70 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SmartHire
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-indigo-400 transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-indigo-400 transition"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-indigo-400 transition"
              >
                Testimonials
              </a>
              <button
                onClick={() => navigate("/candidate-login")}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2"
            >
              {mobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-gray-300">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-300">
                How It Works
              </a>
              <a href="#testimonials" className="block text-gray-300">
                Testimonials
              </a>
              <button
                onClick={() => navigate("/candidate-login")}
                className="w-full px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-indigo-900 text-indigo-300 rounded-full text-sm font-semibold">
              AI-Powered Hiring Platform
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Hire Smarter, Faster
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Revolutionize your recruitment with AI-driven interviews, resume
            parsing, and real-time evaluation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/candidate-login")}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center space-x-2"
            >
              <span>For Candidates</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => navigate("/recruiter-login")}
              className="px-8 py-4 bg-gray-800 text-indigo-400 border-2 border-indigo-400 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
            >
              For Recruiters
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose SmartHire?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12" />,
                title: "AI Interviews",
                desc: "MCQ, Coding & HR rounds with auto-evaluation",
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Fair Screening",
                desc: "Tab lock, webcam proctoring, no cheating",
              },
              {
                icon: <Briefcase className="w-12 h-12" />,
                title: "Instant Results",
                desc: "Real-time scoring & feedback",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl hover:shadow-2xl transform hover:-translate-y-2 transition"
              >
                <div className="text-indigo-400 mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How SmartHire Works
          </h2>

          <div className="space-y-12">
            {[
              {
                number: "1",
                icon: <Briefcase className="w-12 h-12" />,
                title: "Browse & Apply",
                desc: "Find jobs that match your skills and apply in seconds with your resume.",
              },
              {
                number: "2",
                icon: <Code className="w-12 h-12" />,
                title: "Take Skill Test",
                desc: "Complete MCQ or coding assessments designed for the role.",
              },
              {
                number: "3",
                icon: <CheckCircle className="w-12 h-12" />,
                title: "Get Results Fast",
                desc: "Receive instant scores and feedback on your performance.",
              },
              {
                number: "4",
                icon: <BarChart3 className="w-12 h-12" />,
                title: "Track Your Progress",
                desc: "Monitor application status and stay updated every step.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row items-start gap-8 bg-gray-800/80 rounded-2xl p-8 border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl"
              >
                {/* Number + Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-indigo-400">{step.icon}</div>
                    <h3 className="text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join candidates and recruiters building better careers together.
          </p>
          <button
            onClick={() => navigate("/candidate-login")}
            className="px-10 py-4 bg-white text-indigo-600 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition"
          >
            Start Now
          </button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-white">SmartHire</span>
            </div>
            <p className="text-sm">AI-Powered Recruitment Platform</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" /> hello@smarthire.ai
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" /> +91 98765 43210
              </p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Bangalore, India
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center mt-8 pt-8 border-t border-gray-800 text-xs">
          © 2025 SmartHire. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
