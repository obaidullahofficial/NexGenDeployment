import React, { useState } from "react";
import { Search, Filter, Edit2, Trash2, CheckCircle } from "lucide-react";

const societyData = [
  {
    id: 1,
    name: "Green Valley Housing Society",
    type: "Private",
    regNumber: "GV-2023-0098",
    established: "2020-05-10",
    authority: "LDA",
    address: "123 Main Road, Lahore",
    contact: "+92-300-1234567",
    website: "https://greenvalley.com",
    plots: "5 Marla, 10 Marla, 1 Kanal",
    status: "Approved",
  },
  {
    id: 2,
    name: "Skyline Residency",
    type: "Public",
    regNumber: "SK-2021-0034",
    established: "2018-03-15",
    authority: "CDA",
    address: "Sector G-11, Islamabad",
    contact: "+92-345-9876543",
    website: "https://skylineresidency.pk",
    plots: "7 Marla, 1 Kanal",
    status: "Pending",
  },
  {
    id: 3,
    name: "Sunset Villas",
    type: "Private",
    regNumber: "SV-2020-0142",
    established: "2015-09-20",
    authority: "Bahria Group",
    address: "Phase 7, Bahria Town, Rawalpindi",
    contact: "+92-312-6549871",
    website: "https://sunsetvillas.com",
    plots: "10 Marla, 1 Kanal, 2 Kanal",
    status: "Suspended",
  },
];

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Suspended: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-semibold ${statusColors[status]}`}
      style={{ fontFamily: "Segoe UI, sans-serif", fontSize: "14px" }}
    >
      {status}
    </span>
  );
}

function SocietyRow({ society }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-semibold">{society.name}</td>
      <td className="py-3 px-4">{society.type}</td>
      <td className="py-3 px-4">{society.regNumber}</td>
      <td className="py-3 px-4">{society.established}</td>
      <td className="py-3 px-4">{society.authority}</td>
      <td className="py-3 px-4">{society.contact}</td>
      <td className="py-3 px-4">
        <a
          href={society.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Visit
        </a>
      </td>
      <td className="py-3 px-4">{society.plots}</td>
      <td className="py-3 px-4">
        <StatusBadge status={society.status} />
      </td>
      <td className="px-4 py-3 flex space-x-4 text-gray-600">
        <button className="hover:text-blue-600" title="Edit">
          <Edit2 size={18} />
        </button>
        <button className="hover:text-red-600" title="Delete">
          <Trash2 size={18} />
        </button>
        <button className="hover:text-green-600" title="Approve">
          <CheckCircle size={18} />
        </button>
      </td>
    </tr>
  );
}

function SearchAndFilter({ search, setSearch }) {
  return (
    <div className="flex items-center space-x-3 mb-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search societies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
      <button className="p-2 border rounded-md hover:bg-gray-100" title="Filter">
        <Filter size={20} />
      </button>
    </div>
  );
}

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-t">
      <div className="text-gray-600 text-sm">
        Showing {(currentPage - 1) * 6 + 1} to{" "}
        {Math.min(currentPage * 6, societyData.length)} of {societyData.length} societies
      </div>
      <div className="space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          &lt;
        </button>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 border rounded ${
              currentPage === num
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SocietyVerificationDashboard() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSocieties = societyData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.authority.toLowerCase().includes(search.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(search.toLowerCase())
  );

  const societiesPerPage = 6;
  const totalPages = Math.ceil(filteredSocieties.length / societiesPerPage);
  const displayedSocieties = filteredSocieties.slice(
    (currentPage - 1) * societiesPerPage,
    currentPage * societiesPerPage
  );

  return (
    <div className="w-full min-h-screen p-6 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Society Verification</h1>
          <p className="text-gray-600">
            Manage and verify registered housing societies.
          </p>
        </div>
        <button
          style={{ backgroundColor: "#2f3d57" }}
          className="text-white px-4 py-2 rounded hover:opacity-90"
        >
          + Add Society
        </button>
      </div>

      <SearchAndFilter search={search} setSearch={setSearch} />

      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Reg. No</th>
              <th className="py-3 px-4">Established</th>
              <th className="py-3 px-4">Authority</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Website</th>
              <th className="py-3 px-4">Plots</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedSocieties.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  No societies found.
                </td>
              </tr>
            ) : (
              displayedSocieties.map((society) => (
                <SocietyRow key={society.id} society={society} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
