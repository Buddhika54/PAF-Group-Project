import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const typeLabel = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment'
};

const typeIcons = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '👥',
  EQUIPMENT: '📷'
};

export default function BrowseResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  useEffect(() => {
    fetchActiveResources();
  }, []);

  const fetchActiveResources = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getAll();
      const activeResources = res.data.filter(
        r => r.status === 'ACTIVE' && r.isBookable === true
      );
      setResources(activeResources);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (resource) => {
    setSelectedResource(resource);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      toast.error('Please fill in all booking details');
      return;
    }

    try {
      toast.success(`Successfully booked ${selectedResource.name}!`);
      setShowBookingModal(false);
      setBookingData({ date: '', startTime: '', endTime: '', purpose: '' });
      fetchActiveResources();
    } catch (err) {
      toast.error('Failed to book resource');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Navbar>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading available resources...</div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Resources</h1>
          <p className="text-gray-500">Find and book available resources for your needs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
            
            <div className="md:w-64">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Lecture Halls</option>
                <option value="LAB">Labs</option>
                <option value="MEETING_ROOM">Meeting Rooms</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-teal-600">{filteredResources.length}</span> available resources
          </p>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Image or Placeholder */}
                {resource.type === 'EQUIPMENT' && resource.imageUrl ? (
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.name}
                    className="w-full h-48 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-6xl">{typeIcons[resource.type]}</span>
                  </div>
                )}
                
                {/* Content Area - grows to fill space */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {typeLabel[resource.type]}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {resource.name}
                  </h3>
                  
                  {/* Details - takes remaining space */}
                  <div className="space-y-2 mb-4 flex-grow">
                    {resource.type !== 'EQUIPMENT' && (
                      <>
                        {resource.capacity && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-gray-400">👥</span> Capacity: {resource.capacity} people
                          </p>
                        )}
                        {resource.building && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-gray-400">🏢</span> {resource.building}
                          </p>
                        )}
                        {resource.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-gray-400">📍</span> {resource.location}
                          </p>
                        )}
                      </>
                    )}
                    
                    {/* Availability */}
                    {resource.availabilityWindows && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">⏰</span> {resource.availabilityWindows}
                      </p>
                    )}
                    
                    {/* Status */}
                    <p className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-green-600 font-medium">Available for booking</span>
                    </p>
                  </div>
                  
                  {/* Book Button - always at bottom */}
                  <button
                    onClick={() => handleBookNow(resource)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors mt-auto"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Book Resource</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-teal-600 font-medium">Selected Resource</p>
                <p className="text-lg font-semibold text-gray-800">{selectedResource.name}</p>
                <p className="text-sm text-gray-600">{typeLabel[selectedResource.type]}</p>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={bookingData.endTime}
                      onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <textarea
                    rows={3}
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Brief description of why you need this resource"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
}