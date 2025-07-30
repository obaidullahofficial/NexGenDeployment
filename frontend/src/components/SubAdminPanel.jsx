// components/SubAdminPanel.jsx
import {
  FiHome,
  FiLayers,
  FiCheckSquare
} from 'react-icons/fi';

const SidePanel = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#2F3D57] text-white flex flex-col z-10">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Societies Dashboard
      </div>
      <nav className="flex flex-col mt-6 space-y-1">
        <button
          onClick={() => setActiveTab('plotManagement')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'plotManagement' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiHome className="mr-3 text-lg" />
          Plot Management
        </button>
        <button
          onClick={() => setActiveTab('floorPlan')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'floorPlan' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiLayers className="mr-3 text-lg" />
          Generate Floor Plan
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'approvals' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiCheckSquare className="mr-3 text-lg" />
          Approvals Requests
        </button>
      </nav>
    </aside>
  );
};

export default SidePanel;