// components/Approvals.jsx
import React, { useState } from "react";
import { FaCheck, FaTimes, FaSearch, FaEye } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Approvals = () => {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      plotId: "PL-1001",
      plotDetails: "Commercial Plot A, 10 Marla",
      requestDate: "2023-08-15",
      status: "Pending",
      requestType: "Floor Plan Approval",
      designType: "3-Bedroom Modern",
      details: {
        architect: "John Doe Architects",
        area: "10 Marla",
        floors: 2,
        submittedDocuments: ["Site Plan", "Structural Drawings", "Elevations"],
        notes: "Additional parking space requested"
      }
    },
    {
      id: 2,
      plotId: "PL-1002",
      plotDetails: "Residential Plot X, 8 Marla",
      requestDate: "2023-08-16",
      status: "Approved",
      requestType: "Floor Plan Approval",
      designType: "2-Bedroom Apartment",
      details: {
        architect: "Jane Smith Designs",
        area: "8 Marla",
        floors: 1,
        submittedDocuments: ["Layout Plan", "Foundation Plan"],
        notes: "Approved with minor modifications"
      }
    },
    {
      id: 3,
      plotId: "PL-1003",
      plotDetails: "Farm House Plot, 2 Kanal",
      requestDate: "2023-08-17",
      status: "Pending",
      requestType: "Floor Plan Approval",
      designType: "Traditional Farmhouse",
      details: {
        architect: "Rural Designs Co.",
        area: "2 Kanal",
        floors: 1,
        submittedDocuments: ["Site Plan", "Landscape Design", "3D Renderings"],
        notes: "Pending environmental impact assessment"
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Chart data for approval status
  const approvalStats = {
    labels: ['Approved', 'Pending'],
    datasets: [{
      label: 'Floor Plan Approvals',
      data: [
        approvals.filter(a => a.status === "Approved").length,
        approvals.filter(a => a.status === "Pending").length
      ],
      backgroundColor: ['#2f3d57', '#ED7600'],
      borderColor: ['#2f3d57', '#ED7600'],
      borderWidth: 1
    }]
  };

  const handleApprove = (id) => {
    setApprovals(approvals.map(a => 
      a.id === id ? { ...a, status: "Approved" } : a
    ));
  };

  const handleReject = (id) => {
    setApprovals(approvals.map(a => 
      a.id === id ? { ...a, status: "Rejected" } : a
    ));
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowModal(true);
  };

  const filteredApprovals = approvals.filter(approval => {
    return approval.requestType === "Floor Plan Approval" && 
           Object.values(approval).some(
             value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e6e9f0] text-[#2F3D57]">
      {/* Modal for viewing details */}
      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#2F3D57]">
                  Floor Plan Approval Details
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Plot ID:</span> {selectedApproval.plotId}</p>
                    <p><span className="font-medium">Plot Details:</span> {selectedApproval.plotDetails}</p>
                    <p><span className="font-medium">Design Type:</span> {selectedApproval.designType}</p>
                    <p><span className="font-medium">Request Date:</span> {selectedApproval.requestDate}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedApproval.status === "Approved" 
                          ? "bg-green-100 text-green-800" 
                          : selectedApproval.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedApproval.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Architect:</span> {selectedApproval.details.architect}</p>
                    <p><span className="font-medium">Area:</span> {selectedApproval.details.area}</p>
                    <p><span className="font-medium">Floors:</span> {selectedApproval.details.floors}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Submitted Documents</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedApproval.details.submittedDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedApproval.details.notes}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#2F3D57] text-white rounded-lg hover:bg-[#1E2A3B]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2F3D57]">
          Floor Plan Approval Dashboard
        </h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
        <div className="h-64">
          <Bar 
            data={approvalStats}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.label}: ${ctx.raw} plans`
                  }
                }
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
              }
            }}
          />
        </div>
      </div>

      <div className="flex mb-6 p-4 bg-white rounded-xl shadow-md">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search floor plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F3D57] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2F3D57] text-white">
              <tr>
                <th className="px-6 py-4 text-left">Plot ID</th>
                <th className="px-6 py-4 text-left">Plot Details</th>
                <th className="px-6 py-4 text-left">Design Type</th>
                <th className="px-6 py-4 text-left">Request Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map(approval => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{approval.plotId}</td>
                    <td className="px-6 py-4">{approval.plotDetails}</td>
                    <td className="px-6 py-4">{approval.designType}</td>
                    <td className="px-6 py-4">{approval.requestDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        approval.status === "Approved" 
                          ? "bg-green-100 text-green-800" 
                          : approval.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewDetails(approval)}
                          className="bg-[#2F3D57] text-white px-3 py-1 rounded-lg hover:bg-[#1E2A3B] flex items-center gap-1"
                        >
                          <FaEye size={14} /> View
                        </button>
                        {approval.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 flex items-center gap-1"
                            >
                              <FaCheck size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(approval.id)}
                              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                            >
                              <FaTimes size={14} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No floor plan approvals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Approvals;