import React, { useState } from "react";
import { FiPhone } from "react-icons/fi";

const AddPlotForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    plotId: "",
    price: "",
    status: "Available",
    type: "Residential",
    area: "",
    dimensions: "",
    location: "",
    description: [""],
    contactName: "",
    contactPhone: "",
    contactAvailability: "9:00 AM - 7:00 PM",
    amenities: {
      gatedCommunity: false,
      security: false,
      electricity: false,
      waterSupply: false,
      parks: false,
      mosque: false
    }
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (index, value) => {
    const newDescription = [...form.description];
    newDescription[index] = value;
    setForm({ ...form, description: newDescription });
  };

  const addDescriptionItem = () => {
    setForm({ ...form, description: [...form.description, ""] });
  };

  const removeDescriptionItem = (index) => {
    const newDescription = form.description.filter((_, i) => i !== index);
    setForm({ ...form, description: newDescription });
  };

  const handleAmenityChange = (amenity) => {
    setForm({
      ...form,
      amenities: {
        ...form.amenities,
        [amenity]: !form.amenities[amenity]
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-white p-10 rounded-lg shadow-lg max-w-6xl mx-auto min-h-95vh">
      <h2 className="text-2xl font-bold text-[#2F3D57] mb-6">Add New Plot</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot ID</label>
              <input
                type="text"
                name="plotId"
                value={form.plotId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="space-y-2">
                {form.description.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeDescriptionItem(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDescriptionItem}
                  className="mt-2 text-[#ED7600] hover:text-[#D56900] text-sm flex items-center"
                >
                  + Add another description point
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <div className="flex items-center">
                <FiPhone className="text-[#ED7600] mr-2" />
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Availability</label>
              <input
                type="text"
                name="contactAvailability"
                value={form.contactAvailability}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#ED7600] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Amenities Section moved here */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "gatedCommunity", label: "Gated Community" },
              { id: "security", label: "24/7 Security" },
              { id: "electricity", label: "Underground Electricity" },
              { id: "waterSupply", label: "Water Supply" },
              { id: "parks", label: "Green Parks" },
              { id: "mosque", label: "Mosque Nearby" }
            ].map((amenity) => (
              <label key={amenity.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.amenities[amenity.id]}
                  onChange={() => handleAmenityChange(amenity.id)}
                  className="mr-2 text-[#ED7600] focus:ring-[#ED7600]"
                />
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500" />
          <div className="space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ED7600] text-white rounded-md hover:bg-[#D56900]"
            >
              Add Plot
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPlotForm;
