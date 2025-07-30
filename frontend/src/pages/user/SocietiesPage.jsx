// components/Societies.js
import React from 'react';
import NavBar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { FaMapMarkerAlt, FaHome, FaStar } from 'react-icons/fa';

import societiesImg from '../../assets/societies.png';
import ghauri from '../../assets/Ghauri.png';
import bahria from '../../assets/bahria.png';
import cda from '../../assets/CDA.png';

const societies = [
  {
    id: 1,
    name: 'Bahria Town',
    description:
      'Bahria Town develops to be the greatest practical real estate developer of all times, with pioneer interest for aviation and engineering, at major business with small-scale amenities.',
    image: bahria,
    rating: 4.8,
    totalPlots: 1250,
    availablePlots: 85,
    priceRange: '25L - 1.2Cr',
    location: 'Rawalpindi/Lahore',
    amenities: ['Shopping Mall', 'Schools', 'Hospital', 'Golf Course'],
    features: ['Gated Community', '24/7 Security', 'Developed Infrastructure']
  },
  {
    id: 2,
    name: 'CDA',
    description:
      'Capital Development Authority: A cornerstone of modern business culture, offering prime locations, advanced operations, and catering to diverse needs with excellence.',
    image: cda,
    rating: 4.6,
    totalPlots: 890,
    availablePlots: 45,
    priceRange: '35L - 2Cr',
    location: 'Islamabad',
    amenities: ['Metro Access', 'Universities', 'Parks', 'Commercial Areas'],
    features: ['Government Approved', 'Prime Location', 'Investment Potential']
  },
  {
    id: 3,
    name: 'Ghauri Town',
    description:
      'Ghauri Town offers affordable housing with easy accessibility, continuous innovation in infrastructure, and essential amenities for residents.',
    image: ghauri,
    rating: 4.3,
    totalPlots: 750,
    availablePlots: 120,
    priceRange: '15L - 75L',
    location: 'Islamabad',
    amenities: ['Community Center', 'Mosque', 'Parks', 'Market'],
    features: ['Affordable Housing', 'Easy Payment Plans', 'Growing Community']
  },
];

const Societies = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2F3D57] text-white">
      <div className="sticky top-0 z-50">
        <NavBar className="w-full" />
      </div>

      <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2 space-y-8">
                <div className="space-y-4">
                 
                  <h1 className="text-6xl md:text-7xl font-bold text-[#ED7600] leading-tight">
                    Societies
                  </h1>
                </div>
                <p className="text-5xl md:text-4xl font-bold text-white leading-tight">
                  Empowering dreams by offering the perfect plot to build your ideal home.
                </p>
                <div className="pt-4">
                  <button className="px-8 py-4 bg-[#ED7600] hover:bg-[#d96b00] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Explore All Societies
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="relative">
                  <img
                    src={societiesImg}
                    alt="Societies"
                    className="rounded-2xl shadow-2xl w-full max-h-[500px] object-cover border-2 border-white/20"
                  />
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#ED7600] rounded-xl opacity-20"></div>
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full opacity-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Societies Cards */}
        <section className="container mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Choose Your Perfect Society</h2>
            <div className="w-24 h-1 bg-[#ED7600] mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-12">
            {societies.map((society, index) => (
              <div
                key={society.id}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Image Section */}
                  <div className="lg:w-2/5 relative overflow-hidden">
                    <img
                      src={society.image}
                      alt={society.name}
                      className="w-full h-80 lg:h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                      <FaStar className="text-yellow-500" />
                      <span className="text-gray-800 font-bold">{society.rating}</span>
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute bottom-6 left-6 bg-[#ED7600]/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <span className="text-white font-bold">{society.priceRange}</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="lg:w-3/5 p-10">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="space-y-3">
                        <h3 className="text-3xl font-bold text-white hover:text-[#ED7600] transition-colors duration-300">
                          {society.name}
                        </h3>
                        <p className="text-gray-200 leading-relaxed text-lg">
                          {society.description}
                        </p>
                      </div>
                      
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <FaMapMarkerAlt className="text-[#ED7600] text-lg" />
                            <span className="text-gray-300 font-medium">Location</span>
                          </div>
                          <span className="text-white font-bold">{society.location}</span>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <FaHome className="text-[#ED7600] text-lg" />
                            <span className="text-gray-300 font-medium">Available</span>
                          </div>
                          <span className="text-white font-bold">{society.availablePlots} plots</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button className="flex-1 px-8 py-4 bg-[#ED7600] hover:bg-[#d96b00] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                          View Plots
                        </button>
                        <button className="px-8 py-4 border-2 border-white/30 hover:border-[#ED7600] hover:bg-[#ED7600]/10 text-white font-bold rounded-xl transition-all duration-300">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Call to Action Section */}
        <section className="py-20 bg-white/5 border-t border-white/20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Find Your Perfect Plot?
              </h2>
              <div className="w-24 h-1 bg-[#ED7600] mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-200 leading-relaxed">
                Join thousands of satisfied customers who found their dream home through our platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="px-10 py-4 bg-[#ED7600] hover:bg-[#d96b00] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Browse All Plots
                </button>
                <button className="px-10 py-4 border-2 border-white/30 hover:border-[#ED7600] hover:bg-[#ED7600]/10 text-white font-bold rounded-xl transition-all duration-300">
                  Contact Expert
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Societies;
