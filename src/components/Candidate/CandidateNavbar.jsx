import React from "react";
import { LogOut, FileText, User, Briefcase, CheckCircle, Video } from "lucide-react";

function CandidateNavbar() {
  const handleLogout = () => {
    localStorage.removeItem("candidateId");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
    alert("Candidate logged out successfully");
  };

  const handleHome = () => {
    window.location.href = "/candidate-dashboard";
  }

  const navItems = [
    { name: "Upload Resume", icon: FileText, href: "/upload-resume" },
    { name: "Manage Profile", icon: User, href: "/profile" },
    { name: "Applied Jobs", icon: Briefcase, href: "/applied-jobs" },
    { name: "Interviews", icon: Video, href: "/candidate/interview" },
    { name: "Profile", icon: CheckCircle, href: "/candidate-profile" },
    
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>

            <span onClick={() => handleHome()} className="ml-3 text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SmartHire
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900 hover:text-white transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-700">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-900 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default CandidateNavbar;
