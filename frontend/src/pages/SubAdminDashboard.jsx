// SubadminDashboard.js
import React, { useState } from "react";
import SubAdminPanel from "../components/SubAdminPanel";
import PlotManager from "../components/PlotManager";
//import FloorPlan from "../components/FloorPlan"; // You'll need to create these
import Approvals from "../components/Approvals"; // You'll need to create these

const SubadminDashboard = () => {
  const [activeTab, setActiveTab] = useState('plotManagement'); // Default to plotManagement

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar - fixed width with no spacing */}
      <div className="w-[256px] h-full">
        <SubAdminPanel 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          className="h-full" 
        />
      </div>

      {/* Main Content - fills remaining space */}
      <div className="flex-1 h-full overflow-auto bg-white">
        {activeTab === 'plotManagement' && <PlotManager />}
        {activeTab === 'floorPlan' && <FloorPlan />}
        {activeTab === 'approvals' && <Approvals />}
      </div>
    </div>
  );
};

export default SubadminDashboard;