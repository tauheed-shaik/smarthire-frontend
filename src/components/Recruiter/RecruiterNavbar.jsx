// src/components/RecruiterNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  CheckSquare,
  Users,
  LogOut,
  Briefcase,
  Calendar,
  Send,
  PlusCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Post Job",
    icon: PlusCircle,
    path: "/recruiter/post-job",
    desc: "Create new job",
  },
  {
    label: "Resumes",
    icon: FileText,
    path: "/recruiter/resumes",
    desc: "Review applications",
  },
  {
    label: "Interview",
    icon: Calendar,
    path: "/recruiter/schedule",
    desc: "Set up interviews",
  },
  {
    label: "Manage Q/A",
    icon: MessageSquare,
    path: "/recruiter/questions",
    desc: "Add & generate MCQs",
  },
  {
    label: "Evaluate Result",
    icon: CheckSquare,
    path: "/recruiter/evaluate",
    desc: "Check candidate scores",
  },
  {
    label: "Selection Status",
    icon: Users,
    path: "/recruiter/status",
    desc: "Update hiring decision",
  },
];

export default function RecruiterNavbar({ onLogout }) {
  const navigate = useNavigate();

  const handleHome = () => {
    window.location.href = "/recruiter-dashboard";
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white" onClick={() => handleHome()}>SmartHire</h1>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="group px-4 py-2 rounded-lg font-medium flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                  title={item.desc}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.desc}
                  </span>
                </button>
              );
            })}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="ml-4 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-600/30 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                const menu = document.getElementById("mobile-menu");
                menu.classList.toggle("hidden");
              }}
              className="text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  document.getElementById("mobile-menu").classList.add("hidden");
                }}
                className="w-full px-4 py-2 rounded-lg font-medium flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 transition"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-600/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}