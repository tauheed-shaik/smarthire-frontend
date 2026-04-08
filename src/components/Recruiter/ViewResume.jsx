// src/components/Recruiter/ViewResume.jsx
import React, { useState, useEffect } from "react";
import { Download, Search, Filter, FileText, Mail, Phone, MapPin, Calendar, Star, X, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`}/api/resumes`;

export default function ViewResume() {
  const [resumes, setResumes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setResumes(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const f = resumes.filter(r =>
      (r.name?.toLowerCase().includes(search.toLowerCase()) ||
       r.email?.toLowerCase().includes(search.toLowerCase()) ||
       r.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
      (role === "all" || r.appliedRole === role)
    );
    setFiltered(f);
  }, [search, role, resumes]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FileText className="w-8 h-8 text-indigo-400" />
        Candidate Resumes ({filtered.length})
      </h1>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <option value="all">All Roles</option>
          {[...new Set(resumes.map(r => r.appliedRole))].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => (
          <div key={r.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-indigo-600 cursor-pointer" onClick={() => setSelected(r)}>
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {r.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-indigo-400">{r.appliedRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{r.rating || "N/A"}</span>
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-1">
              <div className="flex gap-2"><Mail className="w-4 h-4" /> {r.email}</div>
              <div className="flex gap-2"><Phone className="w-4 h-4" /> {r.phone}</div>
              <div className="flex gap-2"><MapPin className="w-4 h-4" /> {r.location}</div>
              <div className="flex gap-2"><Calendar className="w-4 h-4" /> {new Date(r.appliedDate).toLocaleDateString()}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(r.skills || []).slice(0, 3).map(s => (
                <span key={s} className="px-2 py-1 bg-gray-700 text-xs rounded-full">{s}</span>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between opacity-0 group-hover:opacity-100 transition">
              <button onClick={e => { e.stopPropagation(); setSelected(r); }} className="text-indigo-400 text-sm">View</button>
              <PDFDownloadLink document={<ResumePDF resume={r} />} fileName={`${r.name}_Resume.pdf`}>
                {({ loading }) => (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {loading ? "..." : "Download"}
                  </span>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold">{selected.name}'s Resume</h3>
              <button onClick={() => setSelected(null)}><X className="w-6 h-6" /></button>
            </div>
            <iframe src={selected.resumeUrl} className="w-full h-full min-h-96" title="PDF" />
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <PDFDownloadLink document={<ResumePDF resume={selected} />} fileName={`${selected.name}_Resume.pdf`}>
                <button className="px-4 py-2 bg-green-600 rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
              </PDFDownloadLink>
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-700 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}