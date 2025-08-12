import { useEffect, useState } from 'react';
import { FaBuilding, FaCube, FaClipboardCheck, FaShieldAlt, FaMapMarkerAlt, FaComments, FaBullhorn } from 'react-icons/fa';
import homepagePic1 from '../../assets/homepage-pic1.png';
import homepagePic3 from '../../assets/homepage-pic3.png';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [advertisement, setAdvertisement] = useState(null); // Holds ad content
  const [showPopup, setShowPopup] = useState(false);

  const slides = [
    { image: homepagePic1, alt: "Modern architectural design 1" },
    { image: homepagePic3, alt: "Modern architectural design 3" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Simulate receiving an advertisement from admin
  useEffect(() => {
    setTimeout(() => {
      setAdvertisement({
        title: "Special Offer!",
        message: "Get 20% off on your first 3D plan conversion.",
      });
      setShowPopup(true);
    }, 3000); // Show ad 3 seconds after load
  }, []);

  const features = [
    { icon: FaBuilding, title: "Society Selection", description: "Explore various societies and their guidelines to find your perfect match" },
    { icon: FaCube, title: "2D to 3D Modelling", description: "Convert your 2D floor plans into impressive 3D models" },
    { icon: FaClipboardCheck, title: "Building Guidelines", description: "Access detailed building codes and requirements for each society" },
    { icon: FaShieldAlt, title: "Compliance Check", description: "Verify your design against society guidelines for approval" },
    { icon: FaMapMarkerAlt, title: "Plot Selection", description: "Choose the perfect plot size and location for your dream project" },
    { icon: FaComments, title: "Feedback System", description: "Provide your valuable feedback to help us improve" }
  ];

  return (
    <div className="min-h-screen bg-[#2F3D57] text-white flex flex-col relative">
      {/* Navbar */}
      <div className="fixed w-full top-0 z-50">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-35 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0 pl-12 md:pl-20 lg:pl-28 xl:pl-36">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              <div className="block">You Dream It.</div>
              <div className="block text-[#ED7600]">We Design It.</div>
              <div className="block">You Own It.</div>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              NextGenArchitect: Your AI-Powered Gateway to<br />
              Custom Floor Plans & Seamless Plot Purchasing
            </p>
            <button className="px-8 py-3 bg-[#ED7600] text-white rounded-lg text-lg font-semibold hover:bg-[#D56900] transition-colors">
              Generate Now
            </button>
          </div>

          {/* Slideshow */}
          <div className="md:w-1/2">
            <div className="relative w-full max-w-md mx-auto h-[400px] overflow-hidden rounded-lg">
              <div className="relative h-full w-full">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <img src={slide.image} alt={slide.alt} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center mt-4 space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-[#ED7600] w-6' : 'bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#2F3D57] leading-tight">
                Platform Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Everything you need to design, validate, and approve your architectural project
              </p>
              <div className="w-24 h-1 bg-[#ED7600] mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="w-16 h-16 bg-[#ED7600] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-[#2F3D57]">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Advertisement Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        {showPopup && advertisement && (
          <div className="bg-white text-[#2F3D57] p-4 rounded-lg shadow-lg w-72 mb-3 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h3 className="font-bold text-lg mb-2">{advertisement.title}</h3>
            <p className="text-gray-700">{advertisement.message}</p>
          </div>
        )}

        {/* Always visible message icon */}
        <button
          onClick={() => setShowPopup(true)}
          className="bg-[#ED7600] p-4 rounded-full shadow-lg hover:bg-[#D56900] transition-colors"
        >
          <FaBullhorn className="text-white text-2xl" />
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
