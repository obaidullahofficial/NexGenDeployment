import React, { useState, useEffect } from "react";
import advertisementAPI from "../../services/advertisementAPI";
import { getSocietyProfile } from "../../services/apiService";

const plotSizeOptions = ["5 Marla", "10 Marla", "1 Kanal", "2 Kanal", "5 Kanal", "1 Acre"];
const possessionOptions = ["ready", "under_construction", "planning"];

const Advertisement = () => {
  const [societyName, setSocietyName] = useState("");

  const [formData, setFormData] = useState({
    location: "",
    plot_sizes: [],
    price_start: "",
    price_end: "",
    contact_number: "",
    description: "",
    facilities: "",
    installments_available: false,
    possession_status: "ready",
  });

  const [loading, setLoading] = useState(false);
  const [societyLoading, setSocietyLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadSociety = async () => {
      try {
        const result = await getSocietyProfile();
        const profile = result?.profile || result?.data || result;
        const name = profile?.name || "";
        setSocietyName(name);
      } catch (e) {
        console.error("Failed to load society profile for advertisement:", e);
        setError(e.message || "Failed to load society information. Please ensure your society profile is set up.");
      } finally {
        setSocietyLoading(false);
      }
    };

    loadSociety();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlotSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      plot_sizes: prev.plot_sizes.includes(size)
        ? prev.plot_sizes.filter((s) => s !== size)
        : [...prev.plot_sizes, size],
    }));
  };

  const resetForm = () => {
    setFormData({
      location: "",
      plot_sizes: [],
      price_start: "",
      price_end: "",
      contact_number: "",
      description: "",
      facilities: "",
      installments_available: false,
      possession_status: "ready",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        society_name: societyName,
        price_start: parseFloat(formData.price_start),
        price_end: formData.price_end ? parseFloat(formData.price_end) : undefined,
        status: "pending", // so admin can review and approve
      };

      const result = await advertisementAPI.createAdvertisement(payload);

      if (result.success) {
        setSuccess("Advertisement request submitted successfully. Admin can now review it.");
        resetForm();
      } else {
        setError(result.error || "Failed to submit advertisement request.");
      }
    } catch (err) {
      console.error("Error creating advertisement:", err);
      setError(err.message || "Failed to submit advertisement request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-[#e5e7eb] py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-[#2F3D57] tracking-tight flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F3D57] text-white text-xl font-semibold shadow-md">
              Ad
            </span>
            <span>Create Advertisement</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
            Fill in the details below to request an advertisement for your society. The admin will be able
            to review, approve and feature your advertisement on the platform.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50/80 text-red-700 border border-red-200 text-sm shadow-sm flex items-start gap-2">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50/80 text-green-700 border border-green-200 text-sm shadow-sm flex items-start gap-2">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6"
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="City / Area"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Plot Sizes <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3 mt-1">
            {plotSizeOptions.map((size) => (
              <label key={size} className="inline-flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.plot_sizes.includes(size)}
                  onChange={() => handlePlotSizeToggle(size)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                />
                {size}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Starting Price (PKR) <span className="text-red-500">*</span>
              </label>
            <input
              type="number"
              name="price_start"
              value={formData.price_start}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="e.g. 5000000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ending Price (PKR)</label>
            <input
              type="number"
              name="price_end"
              value={formData.price_end}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="e.g. +92 300 1234567"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="Short description of the advertised plots / society"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Facilities</label>
          <textarea
            name="facilities"
            value={formData.facilities}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="e.g. Gated community, electricity, gas, water, parks, schools, 24/7 security"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Possession Status</label>
            <select
              name="possession_status"
              value={formData.possession_status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {possessionOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex items-center">
            <label className="inline-flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="installments_available"
                checked={formData.installments_available}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              Installments available
            </label>
          </div>
        </div>


        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Advertisement Request"}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default Advertisement;
