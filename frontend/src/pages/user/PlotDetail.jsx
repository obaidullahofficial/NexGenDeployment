import { FiPhone } from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineTemplate } from 'react-icons/hi';
import { MdOutlineArchitecture } from 'react-icons/md';
import plotImage from '../../assets/plot.png';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';

const ExactPlotCard = () => {
  return (
    <div className="bg-white min-h-screen text-[#2F3D57] font-sans">
      <div className="sticky top-0 z-50">
        <Navbar className="w-full" />
      </div>

      {/* Container */}
      <div className="w-full max-w-[1500px] mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="md:col-span-2 bg-[#F9FAFB] rounded-xl shadow-md p-6 space-y-6">
            {/* Image */}
            <div className="h-[280px] rounded-md overflow-hidden bg-gray-200">
              <img
                src={plotImage}
                alt="Plot FD234"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x220?text=Plot+Image";
                }}
              />
            </div>

            {/* Plot Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[#ED7600] font-semibold text-sm">Plot ID: FD234</p>
                <h2 className="text-2xl font-bold">PKR 50 Lakh</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-4">
                <div>
                  <p className="uppercase text-xs font-medium">Status</p>
                  <p className="font-semibold text-base text-green-600">Available</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-medium">Type</p>
                  <p className="font-semibold text-base text-[#2F3D57]">Residential Plot</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-medium">Area</p>
                  <p className="font-semibold text-base text-[#2F3D57]">10 Marla</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-medium">Dimensions</p>
                  <p className="font-semibold text-base text-[#2F3D57]">50 ft x 90 ft</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-medium">Location</p>
                  <p className="font-semibold text-base text-[#2F3D57]">Bahria Town, Islamabad</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-5 text-[#2F3D57]">
              <h3 className="text-[#ED7600] text-xl font-semibold mb-2">Description</h3>
              <ul className="text-sm space-y-2 list-disc list-inside leading-6">
                <li>Located in Bahria Enclave Sector P</li>
                <li>10 Marla Residential Plot – Street 13</li>
                <li>Possession & Utility Charges Paid</li>
                <li>Beautiful View & Prime Location</li>
                <li>Reasonable Price & Investment Opportunity</li>
                <li>
                  Ideal for those seeking a secure and peaceful environment to turn dreams into reality.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Seller Contact */}
            <div className="bg-[#F1F3F7] p-5 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-[#ED7600] mb-3">Contact Seller</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">Name</p>
                  <p className="font-medium">Ali Khan</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-[#ED7600]" />
                    <p className="font-medium">+92 300 1234567</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Available</p>
                  <p className="font-medium">9:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-[#F1F3F7] p-5 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-[#ED7600] mb-3">Amenities</h3>
              <ul className="list-disc list-inside text-sm text-[#2F3D57] space-y-1">
                <li>Gated Community</li>
                <li>24/7 Security</li>
                <li>Underground Electricity</li>
                <li>Water Supply</li>
                <li>Green Parks</li>
                <li>Mosque Nearby</li>
              </ul>
            </div>

            {/* Buttons Section */}
            <div className="space-y-4">
              <button className="w-full flex items-center gap-2 justify-center bg-[#ED7600] hover:bg-[#d46000] text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                <MdOutlineArchitecture className="text-lg" />
                Generate Floor Plan
              </button>
              <button className="w-full flex items-center gap-2 justify-center bg-[#2F3D57] hover:bg-[#1f2c42] text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                <HiOutlineDocumentText className="text-lg" />
                Compliance Rules & Regulations
              </button>
              <button className="w-full flex items-center gap-2 justify-center bg-[#ED7600] hover:bg-[#d46000] text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                <HiOutlineTemplate className="text-lg" />
                Approved Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExactPlotCard;