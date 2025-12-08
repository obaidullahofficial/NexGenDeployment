import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getSocietyCompliances,
  createCompliance,
  updateCompliance,
  deleteCompliance
} from '../../services/complianceAPI';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ComplianceManagement = () => {
  const { user } = useAuth();
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Get society ID - for society users, their user ID is their society ID
  const getSocietyId = () => {
    return user?.societyId || user?.id || user?._id;
  };
  const [formData, setFormData] = useState({
    marla_size: '',
    max_ground_coverage: 60,
    max_floors: 2,
    front_setback: 10,
    rear_setback: 10,
    side_setback_left: 5,
    side_setback_right: 5,
    min_room_height: 10,
    min_bathroom_size: 36,
    min_kitchen_size: 100,
    min_bedroom_size: 100,
    parking_spaces_required: 1,
    min_open_space: 20,
    max_building_height: 30,
    staircase_width_min: 4,
    corridor_width_min: 4,
    building_type_allowed: 'Residential',
    additional_rules: [],
    notes: ''
  });
  const [newRule, setNewRule] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const marlaOptions = ['5 Marla', '7 Marla', '10 Marla', '1 Kanal', '2 Kanal'];

  useEffect(() => {
    const societyId = getSocietyId();
    if (societyId) {
      fetchCompliances();
    } else {
      // No societyId, stop loading and show empty state
      setLoading(false);
      console.log('[Compliance] User data:', user);
      console.log('[Compliance] No society ID found in user object');
    }
  }, [user]);

  const fetchCompliances = async () => {
    try {
      setLoading(true);
      const societyId = getSocietyId();
      console.log('[Compliance] Fetching compliances for society:', societyId);
      const response = await getSocietyCompliances(societyId);
      console.log('[Compliance] Response:', response);
      console.log('[Compliance] Data array:', response.data);
      console.log('[Compliance] Array length:', response.data?.length);
      setCompliances(response.data || []);
      console.log('[Compliance] State updated with', response.data?.length || 0, 'items');
    } catch (error) {
      console.error('[Compliance] Error:', error);
      showAlert(error.message || 'Failed to load compliance rules', 'error');
      setCompliances([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const response = await updateCompliance(editingId, formData);
        console.log('[Compliance] Update response:', response);
        showAlert('Compliance rules updated successfully!', 'success');
      } else {
        const response = await createCompliance(formData);
        console.log('[Compliance] Create response:', response);
        showAlert('Compliance rules created successfully!', 'success');
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      
      // Refresh the list
      await fetchCompliances();
    } catch (error) {
      console.error('[Compliance] Submit error:', error);
      showAlert(error.message || 'Failed to save compliance rules', 'error');
    }
  };

  const handleEdit = (compliance) => {
    setFormData({
      marla_size: compliance.marla_size,
      max_ground_coverage: compliance.max_ground_coverage,
      max_floors: compliance.max_floors,
      front_setback: compliance.front_setback,
      rear_setback: compliance.rear_setback,
      side_setback_left: compliance.side_setback_left,
      side_setback_right: compliance.side_setback_right,
      min_room_height: compliance.min_room_height,
      min_bathroom_size: compliance.min_bathroom_size,
      min_kitchen_size: compliance.min_kitchen_size,
      min_bedroom_size: compliance.min_bedroom_size,
      parking_spaces_required: compliance.parking_spaces_required,
      min_open_space: compliance.min_open_space,
      max_building_height: compliance.max_building_height,
      staircase_width_min: compliance.staircase_width_min,
      corridor_width_min: compliance.corridor_width_min,
      building_type_allowed: compliance.building_type_allowed,
      additional_rules: compliance.additional_rules || [],
      notes: compliance.notes || ''
    });
    setEditingId(compliance._id);
    setShowForm(true);
  };

  const handleDelete = async (complianceId) => {
    if (!window.confirm('Are you sure you want to delete this compliance rule?')) return;
    
    try {
      await deleteCompliance(complianceId);
      showAlert('Compliance rules deleted successfully!', 'success');
      fetchCompliances();
    } catch (error) {
      showAlert('Failed to delete compliance rules', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      marla_size: '',
      max_ground_coverage: 60,
      max_floors: 2,
      front_setback: 10,
      rear_setback: 10,
      side_setback_left: 5,
      side_setback_right: 5,
      min_room_height: 10,
      min_bathroom_size: 36,
      min_kitchen_size: 100,
      min_bedroom_size: 100,
      parking_spaces_required: 1,
      min_open_space: 20,
      max_building_height: 30,
      staircase_width_min: 4,
      corridor_width_min: 4,
      building_type_allowed: 'Residential',
      additional_rules: [],
      notes: ''
    });
    setNewRule('');
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['max_ground_coverage', 'max_floors', 'front_setback', 'rear_setback', 
               'side_setback_left', 'side_setback_right', 'min_room_height', 
               'min_bathroom_size', 'min_kitchen_size', 'min_bedroom_size',
               'parking_spaces_required', 'min_open_space', 'max_building_height',
               'staircase_width_min', 'corridor_width_min'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        additional_rules: [...prev.additional_rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_rules: prev.additional_rules.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {alert.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Compliance Management</h1>
          <p className="text-gray-600 mt-2">Manage Pakistan building regulations for different plot sizes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            <FiPlus /> Add Compliance Rules
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? 'Edit' : 'Add'} Compliance Rules
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plot Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Size *
              </label>
              <select
                name="marla_size"
                value={formData.marla_size}
                onChange={handleChange}
                required
                disabled={editingId}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select plot size</option>
                {marlaOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Building Coverage & Floors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Ground Coverage (%)
                </label>
                <input
                  type="number"
                  name="max_ground_coverage"
                  value={formData.max_ground_coverage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Floors
                </label>
                <input
                  type="number"
                  name="max_floors"
                  value={formData.max_floors}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Building Height (ft)
                </label>
                <input
                  type="number"
                  name="max_building_height"
                  value={formData.max_building_height}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Setbacks */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Setback Requirements (feet)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Front</label>
                  <input
                    type="number"
                    name="front_setback"
                    value={formData.front_setback}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rear</label>
                  <input
                    type="number"
                    name="rear_setback"
                    value={formData.rear_setback}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Side</label>
                  <input
                    type="number"
                    name="side_setback_left"
                    value={formData.side_setback_left}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Right Side</label>
                  <input
                    type="number"
                    name="side_setback_right"
                    value={formData.side_setback_right}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Room Sizes */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Minimum Room Sizes (sq ft)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedroom</label>
                  <input
                    type="number"
                    name="min_bedroom_size"
                    value={formData.min_bedroom_size}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kitchen</label>
                  <input
                    type="number"
                    name="min_kitchen_size"
                    value={formData.min_kitchen_size}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom</label>
                  <input
                    type="number"
                    name="min_bathroom_size"
                    value={formData.min_bathroom_size}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Height (ft)</label>
                  <input
                    type="number"
                    name="min_room_height"
                    value={formData.min_room_height}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Other Requirements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parking Spaces</label>
                <input
                  type="number"
                  name="parking_spaces_required"
                  value={formData.parking_spaces_required}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Open Space (%)</label>
                <input
                  type="number"
                  name="min_open_space"
                  value={formData.min_open_space}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staircase Width (ft)</label>
                <input
                  type="number"
                  name="staircase_width_min"
                  value={formData.staircase_width_min}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corridor Width (ft)</label>
                <input
                  type="number"
                  name="corridor_width_min"
                  value={formData.corridor_width_min}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Building Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Type Allowed
              </label>
              <select
                name="building_type_allowed"
                value={formData.building_type_allowed}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed Use</option>
              </select>
            </div>

            {/* Additional Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Rules
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a custom rule..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.additional_rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Any additional notes or clarifications..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                <FiSave /> {editingId ? 'Update' : 'Create'} Compliance Rules
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compliance List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compliances.map((compliance) => (
          <div key={compliance._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{compliance.marla_size}</h3>
                <span className="text-sm text-gray-500">{compliance.building_type_allowed}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(compliance)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(compliance._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ground Coverage:</span>
                <span className="font-medium">{compliance.max_ground_coverage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Floors:</span>
                <span className="font-medium">{compliance.max_floors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Front Setback:</span>
                <span className="font-medium">{compliance.front_setback} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parking Spaces:</span>
                <span className="font-medium">{compliance.parking_spaces_required}</span>
              </div>
              {compliance.additional_rules && compliance.additional_rules.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-gray-600 text-xs">
                    +{compliance.additional_rules.length} additional rules
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {compliances.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No compliance rules found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Create your first compliance rule
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceManagement;
