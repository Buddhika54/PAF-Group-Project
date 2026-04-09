import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import { resourceAPI } from '../../services/resourceAPI';

export default function MaintenanceTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    fetchMaintenanceTasks();
  }, []);

  const fetchMaintenanceTasks = async () => {
    try {
      setLoading(true);
      // Get all resources using your existing API
      const response = await resourceAPI.getAll({});
      const allResources = response.data;
      // Filter for UNDER_MAINTENANCE status
      const maintenanceResources = allResources.filter(
        r => r.status === 'UNDER_MAINTENANCE'
      );
      setTasks(maintenanceResources);
    } catch (err) {
      toast.error('Failed to load maintenance tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (resourceId, note) => {
    try {
      const resource = tasks.find(t => t.id === resourceId);
      if (!resource) {
        toast.error('Resource not found');
        return;
      }

      // Create completion note
      let updatedNote = resource.maintenanceNote || '';
      if (note && note.trim()) {
        updatedNote = `${updatedNote}\n\n[COMPLETED ON ${new Date().toLocaleString()}]: ${note}`;
      } else {
        updatedNote = `${updatedNote}\n\n[COMPLETED ON ${new Date().toLocaleString()}]: Task completed`;
      }
      
      // Create FormData object with all resource data including status change
      const formData = new FormData();
      formData.append('name', resource.name);
      formData.append('type', resource.type);
      formData.append('status', 'ACTIVE'); // Set status to ACTIVE
      formData.append('isBookable', resource.isBookable);
      formData.append('maintenanceNote', updatedNote);
      
      if (resource.capacity) formData.append('capacity', resource.capacity);
      if (resource.building) formData.append('building', resource.building);
      if (resource.location) formData.append('location', resource.location);
      if (resource.specialNotes) formData.append('specialNotes', resource.specialNotes);
      
      // Parse availability windows if exists
      if (resource.availabilityWindows) {
        const times = resource.availabilityWindows.split(' - ');
        if (times.length === 2) {
          formData.append('availabilityStart', times[0]);
          formData.append('availabilityEnd', times[1]);
        }
      }
      
      await resourceAPI.update(resourceId, formData);
      
      toast.success('Maintenance task completed successfully!');
      fetchMaintenanceTasks(); // Refresh the list
      setShowDetailsModal(false);
      setCompletionNote('');
      setSelectedTask(null);
    } catch (err) {
      toast.error('Failed to complete task');
      console.error(err);
    }
  };

  const getPriorityColor = (maintenanceNote) => {
    const note = maintenanceNote?.toLowerCase() || '';
    if (note.includes('urgent') || note.includes('emergency') || note.includes('critical')) {
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', priority: 'High' };
    } else if (note.includes('important') || note.includes('repair')) {
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', priority: 'Medium' };
    } else {
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', priority: 'Normal' };
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'LECTURE_HALL': 'Lecture Hall',
      'LAB': 'Lab',
      'MEETING_ROOM': 'Meeting Room',
      'EQUIPMENT': 'Equipment'
    };
    return types[type] || type;
  };

  const getDaysInMaintenance = (updatedAt) => {
    if (!updatedAt) return 'Unknown';
    const startDate = new Date(updatedAt);
    const now = new Date();
    const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    if (filter === 'HIGH') {
      const priority = getPriorityColor(task.maintenanceNote).priority;
      return priority === 'High';
    }
    if (filter === 'MEDIUM') {
      const priority = getPriorityColor(task.maintenanceNote).priority;
      return priority === 'Medium';
    }
    if (filter === 'NORMAL') {
      const priority = getPriorityColor(task.maintenanceNote).priority;
      return priority === 'Normal';
    }
    return true;
  });

  const stats = {
    total: tasks.length,
    high: tasks.filter(t => getPriorityColor(t.maintenanceNote).priority === 'High').length,
    medium: tasks.filter(t => getPriorityColor(t.maintenanceNote).priority === 'Medium').length,
    normal: tasks.filter(t => getPriorityColor(t.maintenanceNote).priority === 'Normal').length
  };

  return (
    <Navbar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Maintenance Tasks</h1>
          <p className="text-gray-500">Manage and track ongoing maintenance tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Medium Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.medium}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Normal Priority</p>
                <p className="text-2xl font-bold text-blue-600">{stats.normal}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ALL' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tasks ({stats.total})
            </button>
            <button
              onClick={() => setFilter('HIGH')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'HIGH' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High Priority ({stats.high})
            </button>
            <button
              onClick={() => setFilter('MEDIUM')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'MEDIUM' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medium Priority ({stats.medium})
            </button>
            <button
              onClick={() => setFilter('NORMAL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'NORMAL' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Normal Priority ({stats.normal})
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Maintenance Tasks</h3>
            <p className="text-gray-500">All resources are currently active and healthy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => {
              const priority = getPriorityColor(task.maintenanceNote);
              const daysInMaintenance = getDaysInMaintenance(task.updatedAt);
              
              return (
                <div key={task.id} className={`bg-white rounded-xl border ${priority.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
                  <div className={`p-4 ${priority.bg} border-b ${priority.border}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{getTypeLabel(task.type)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
                        {priority.priority} Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Maintenance Note</p>
                      <p className="text-sm text-gray-700">{task.maintenanceNote || 'No details provided'}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">In maintenance since</p>
                        <p className="text-sm font-medium text-gray-700">{daysInMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resource ID</p>
                        <p className="text-sm font-mono text-gray-600">{task.id}</p>
                      </div>
                    </div>
                    
                    {task.building && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="text-sm text-gray-700">{task.building} {task.location ? `- ${task.location}` : ''}</p>
                      </div>
                    )}
                    
                    {task.type === 'EQUIPMENT' && task.specialNotes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Equipment Details</p>
                        <p className="text-sm text-gray-700">{task.specialNotes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Complete Task
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Task Details Modal */}
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Maintenance Task</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedTask(null);
                      setCompletionNote('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Resource</p>
                    <p className="text-xl font-semibold text-gray-800">{selectedTask.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{getTypeLabel(selectedTask.type)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Maintenance Note</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedTask.maintenanceNote || 'No maintenance notes provided'}
                    </p>
                  </div>
                  
                  {selectedTask.specialNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions</p>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedTask.specialNotes}
                      </p>
                    </div>
                  )}
                  
                  {selectedTask.building && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                      <p className="text-gray-600">{selectedTask.building} {selectedTask.location ? `, ${selectedTask.location}` : ''}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Notes
                    </label>
                    <textarea
                      rows={4}
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Describe what maintenance was performed..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedTask(null);
                        setCompletionNote('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => completeTask(selectedTask.id, completionNote)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Complete Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
}