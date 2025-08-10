import {
  FiUser,
  FiCheckSquare,
  FiClock,
  FiClipboard, 
  FiSettings,
  FiSend,
  FiLogOut
} from 'react-icons/fi';

const UserProfile = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
      <aside className="w-64 bg-[#2F3D57] text-white flex flex-col z-10">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        User Profile
      </div>
      <nav className="flex flex-col mt-6 space-y-1 flex-grow">
        {/* Your navigation buttons */}
        <button
          onClick={() => handleTabClick('personalInfo')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'personalInfo' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiUser className="mr-3 text-lg" />
          Personal Information
        </button>

                {/* Activity Button */}

        <button
          onClick={() => handleTabClick('approvalRequests')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'approvalRequests' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiCheckSquare className="mr-3 text-lg" />
          Activity    
        </button>

               {/*  My Progress Button  */}
               
        <button
          onClick={() => handleTabClick('progress')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'progress' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiClipboard className="mr-3 text-lg" />
          My Progress
        </button>

        {/*  Approval Request Button */}
        <button

          onClick={() => handleTabClick('approvalRequest')}
          className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
            activeTab === 'approvalRequest' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
          }`}
        >
          <FiSend className="mr-3 text-lg" />
          Approval Request
        </button>

        {/* Bottom-aligned items */}
        <div className="mt-auto">
          <div className="border-t border-gray-700"></div>
          <button
            onClick={() => handleTabClick('settings')}
            className={`flex items-center px-6 py-3 text-left w-full hover:bg-[#ED7600] hover:text-white transition-colors ${
              activeTab === 'settings' ? 'bg-[#ED7600] text-white font-semibold' : 'text-gray-300'
            }`}
          >
            <FiSettings className="mr-3 text-lg" />
            Settings
          </button>
          <button
            onClick={() => console.log('Logout')}
            className="flex items-center px-6 py-3 text-left w-full text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <FiLogOut className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default UserProfile;