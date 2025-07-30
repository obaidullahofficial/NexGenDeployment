// components/Societies.js
import React from 'react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

import societiesImg from '../assets/societies.png';
import ghauri from '../assets/Ghauri.png';
import bahria from '../assets/bahria.png';
import cda from '../assets/CDA.png';

const societies = [
  {
    name: 'Bahria Town',
    description:
      'Bahria Town develops to be the greatest practical real estate developer of all times, with pioneer interest for aviation and engineering, at major business with small-scale amenities.',
    image: bahria,
  },
  {
    name: 'CDA',
    description:
      'Capital Development Authority: A cornerstone of modern business culture, offering prime locations, advanced operations, and catering to diverse needs with excellence.',
    image: cda,
  },
  {
    name: 'Ghauri Town',
    description:
      'Ghauri Town offers affordable housing with easy accessibility, continuous innovation in infrastructure, and essential amenities for residents.',
    image: ghauri,
  },
];

const Societies = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2F3D57] text-white">
      <div className="sticky top-0 z-50">
        <NavBar className="w-full" />
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-5xl font-bold text-[#ED7600]">Societies</h1>
              <p className="text-2xl font-semibold leading-relaxed">
                "Empowering dreams by<br />
                offering the perfect plot to<br />
                build your ideal home."
              </p>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img
                src={societiesImg}
                alt="Societies"
                className="rounded-2xl shadow-2xl w-full max-h-[400px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Societies Cards */}
        <section className="container mx-auto px-6 pb-20 space-y-10">
          {societies.map((society, index) => (
            <div
              key={index}
              className="group rounded-3xl overflow-hidden bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl transition-transform transform hover:scale-[1.02] hover:shadow-2xl flex flex-col md:flex-row h-[400px]"
            >
              <div className="md:w-2/5 p-6 flex items-center justify-center bg-white/10">
                <img
                  src={society.image}
                  alt={society.name}
                  className="w-full h-full max-h-72 object-contain rounded-xl"
                />
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {society.name}
                  </h2>
                  <p className="text-white/90 text-base leading-relaxed">
                    {society.description}
                  </p>
                </div>
                <div className="mt-6">
                  <button className="px-6 py-2 bg-[#ED7600] hover:bg-[#d96b00] text-white font-semibold rounded-lg shadow-md transition-all">
                    View Plots
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Societies;
