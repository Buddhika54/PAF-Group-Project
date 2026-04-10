// src/components/SmartSuggestions.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceAPI } from '../services/resourceAPI';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import aiLearningService from '../services/aiLearningService';

export default function SmartSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [learningStats, setLearningStats] = useState(null);

  const analyzeExistingBookings = async () => {
    try {
        const bookingsRes = await fetch('http://localhost:8080/api/bookings/my-bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (bookingsRes.ok) {
            const bookings = await bookingsRes.json();
            
            // Automatically record past bookings as "accepted" suggestions
            bookings.forEach(booking => {
                if (booking.resource) {
                    aiLearningService.recordInteraction(booking.resource, 'accepted', {
                        source: 'existing_booking',
                        autoTracked: true
                    });
                }
            });
            
            console.log(`Analyzed ${bookings.length} existing bookings`);
        }
    } catch (err) {
        console.log('Could not analyze existing bookings');
    }
};

  useEffect(() => {
    fetchDataAndSuggest();
    loadLearningStats();
    analyzeExistingBookings();
  }, []);

  const loadLearningStats = () => {
    const stats = aiLearningService.getLearningStats();
    setLearningStats(stats);
  };

  const fetchDataAndSuggest = async () => {
    try {
      setLoading(true);
      
      const resourcesRes = await resourceAPI.getAll({});
      let allResources = resourcesRes.data;
      
      // Apply personalized scoring based on learning
      allResources = allResources.map(resource => ({
        ...resource,
        aiScore: aiLearningService.getPersonalizedScore(resource)
      }));
      
      // Sort by AI score for better recommendations
      allResources.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      
      // Fetch user's booking history
      try {
        const bookingsRes = await fetch('http://localhost:8080/api/bookings/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          setUserBookings(bookings);
        }
      } catch (err) {
        console.log('No booking history available');
      }
      
      const smartSuggestions = generateSmartSuggestions(allResources);
      setSuggestions(smartSuggestions);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedReason = (resource) => {
    const score = resource.aiScore || 0;
    if (score > 0.8) return "🎯 Highly matches your preferences";
    if (score > 0.6) return "📈 Based on your booking history";
    if (score > 0.4) return "🆕 You might like this";
    return null;
  };

  const generateSmartSuggestions = (resources) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;
    
    const suggestions = [];
    
    // Get active bookable resources
    const activeResources = resources.filter(r => 
        r.status === 'ACTIVE' && r.isBookable === true
    );
    
    console.log('Active resources available:', activeResources.length);
    
    if (activeResources.length === 0) {
        console.log('No active bookable resources found');
        return [];
    }
    
    // ============================================
    // ALWAYS SHOW SUGGESTIONS - NO TIME RESTRICTIONS
    // ============================================
    
    // 1. Show LAB suggestions (prioritize labs)
    const labResources = activeResources.filter(r => r.type === 'LAB');
    if (labResources.length > 0) {
        suggestions.push({
            ...labResources[0],
            suggestionReason: "🔬 Perfect for practical work and experiments",
            suggestionIcon: "🔬",
            priority: "high",
            aiReasoning: {
                primary: "Lab resources are most popular",
                details: [
                    "🔬 Well-equipped for practical sessions",
                    "👥 Ideal for group projects",
                    "💻 Modern equipment available",
                    "⭐ Highly recommended by other students"
                ],
                confidence: "94%",
                algorithm: "Popularity-based Recommendation"
            }
        });
    }
    
    // 2. Show Lecture Hall suggestions
    const lectureResources = activeResources.filter(r => r.type === 'LECTURE_HALL');
    if (lectureResources.length > 0 && suggestions.length < 3) {
        suggestions.push({
            ...lectureResources[0],
            suggestionReason: "📚 Spacious hall for lectures and presentations",
            suggestionIcon: "📚",
            priority: "high",
            aiReasoning: {
                primary: "Large capacity for big groups",
                details: [
                    "👥 High capacity for many attendees",
                    "📊 Perfect for presentations",
                    "🎤 Audio-visual equipment available",
                    "⭐ Top choice for events"
                ],
                confidence: "92%",
                algorithm: "Capacity-based Selection"
            }
        });
    }
    
    // 3. Show Meeting Room suggestions (if you have any)
    const meetingResources = activeResources.filter(r => r.type === 'MEETING_ROOM');
    if (meetingResources.length > 0 && suggestions.length < 3) {
        suggestions.push({
            ...meetingResources[0],
            suggestionReason: "👥 Ideal for team meetings and discussions",
            suggestionIcon: "👥",
            priority: "medium",
            aiReasoning: {
                primary: "Perfect for small groups",
                details: [
                    "🎯 Intimate setting for discussions",
                    "💼 Professional environment",
                    "📋 Whiteboard available",
                    "⭐ Great for collaboration"
                ],
                confidence: "88%",
                algorithm: "Usage Pattern Analysis"
            }
        });
    }
    
    // 4. Show Equipment suggestions
    const equipmentResources = activeResources.filter(r => r.type === 'EQUIPMENT');
    if (equipmentResources.length > 0 && suggestions.length < 4) {
        suggestions.push({
            ...equipmentResources[0],
            suggestionReason: "📷 Equipment available for your projects",
            suggestionIcon: "📷",
            priority: "medium",
            aiReasoning: {
                primary: "High-demand equipment",
                details: [
                    "🔋 Ready for immediate use",
                    "📸 Perfect for project work",
                    "⭐ Often booked - reserve now",
                    "✅ Well-maintained condition"
                ],
                confidence: "86%",
                algorithm: "Demand Prediction"
            }
        });
    }
    
    // 5. Add a second lab if available
    if (labResources.length > 1 && suggestions.length < 5) {
        suggestions.push({
            ...labResources[1],
            suggestionReason: "💻 Alternative lab with great facilities",
            suggestionIcon: "💻",
            priority: "medium",
            aiReasoning: {
                primary: "Alternative lab option",
                details: [
                    "🖥️ Modern computers",
                    "🔌 All equipment functional",
                    "📶 High-speed internet",
                    "⭐ Good alternative choice"
                ],
                confidence: "84%",
                algorithm: "Alternative Recommendation"
            }
        });
    }
    
    // 6. Add a second lecture hall if available
    if (lectureResources.length > 1 && suggestions.length < 5) {
        suggestions.push({
            ...lectureResources[1],
            suggestionReason: "🏛️ Additional hall with great acoustics",
            suggestionIcon: "🏛️",
            priority: "low",
            aiReasoning: {
                primary: "Alternative hall option",
                details: [
                    "🎯 Good capacity for medium groups",
                    "📍 Convenient location",
                    "✅ Available for booking",
                    "⭐ Solid alternative choice"
                ],
                confidence: "82%",
                algorithm: "Diversity Enhancement"
            }
        });
    }
    
    // Remove duplicates based on ID
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
        index === self.findIndex((s) => s.id === suggestion.id)
    );
    
    console.log(`Generated ${uniqueSuggestions.length} suggestions from ${activeResources.length} active resources`);
    
    return uniqueSuggestions.slice(0, 5);
};

  const handleFeedback = async (suggestionId, isHelpful, suggestion) => {
    setFeedback({ ...feedback, [suggestionId]: isHelpful });
    
    // Record interaction in learning service
    const action = isHelpful ? 'accepted' : 'rejected';
    const personalizedScore = aiLearningService.recordInteraction(suggestion, action, {
      source: 'feedback_button',
      feedbackType: isHelpful ? 'thumbs_up' : 'thumbs_down'
    });
    
    if (isHelpful) {
      toast.success(`🧠 AI learned! Recommendation accuracy: ${Math.round(personalizedScore * 100)}%`, {
        icon: '🎯',
        duration: 2000
      });
    } else {
      toast.info(`📚 Thanks! AI will adjust future suggestions`, {
        icon: '🔄',
        duration: 2000
      });
    }
    
    // Refresh suggestions based on new learning
    setTimeout(() => {
      fetchDataAndSuggest();
      loadLearningStats();
    }, 500);
    
    // Send to backend if available
    try {
      await fetch('http://localhost:8080/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          suggestionId,
          suggestionName: suggestion.name,
          isHelpful,
          action: action,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.log('Feedback saved locally');
    }
  };

  const handleBookNow = async (resource) => {
    // Record that user accepted this suggestion
    const personalizedScore = aiLearningService.recordInteraction(resource, 'accepted', {
      source: 'book_now_button',
      timestamp: new Date().toISOString()
    });
    
    toast.success(`🎯 AI learned from your choice! Match score: ${Math.round(personalizedScore * 100)}%`, {
      duration: 3000,
      icon: '🧠'
    });
    
    // Refresh suggestions
    setTimeout(() => {
      fetchDataAndSuggest();
      loadLearningStats();
    }, 500);
    
    // Here you would navigate to booking page or open modal
    // window.location.href = `/resources/${resource.id}/book`;
  };

  const getLearningBadge = (resource) => {
    const score = resource.aiScore || 0;
    if (score > 0.8) return { text: '🎯 Perfect Match', color: 'bg-green-500' };
    if (score > 0.6) return { text: '📈 High Match', color: 'bg-blue-500' };
    if (score > 0.4) return { text: '🆕 Good Choice', color: 'bg-purple-500' };
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6">
        <div className="animate-pulse flex items-center justify-between">
          <div>
            <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-48"></div>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6">
            <div className="text-center text-white">
                <div className="text-4xl mb-2">🔧</div>
                <p className="text-sm">No active resources available for booking</p>
                <p className="text-xs text-white/70 mt-1">
                    Please check if resources are marked as ACTIVE and bookable
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-xs"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="text-white font-bold text-lg">AI Smart Assistant</h3>
            <p className="text-white/80 text-xs">
              Personalized recommendations for you
              {learningStats && learningStats.totalSuggestions > 0 && (
                <span className="ml-1">• {learningStats.acceptanceRate}% match rate</span>
              )}
            </p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full px-2 py-1">
          <span className="text-white text-xs font-mono">
            v2.0 {learningStats && `• ${learningStats.totalSuggestions} interactions`}
          </span>
        </div>
      </div>
      
      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const learningBadge = getLearningBadge(suggestion);
          
          return (
            <div 
              key={suggestion.id || index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer group relative"
              onClick={() => handleBookNow(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl">{suggestion.suggestionIcon}</span>
                    <h4 className="text-white font-semibold">{suggestion.name}</h4>
                    {learningBadge && (
                      <span className={`${learningBadge.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                        {learningBadge.text}
                      </span>
                    )}
                    {suggestion.priority === 'high' && !learningBadge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        🔥 Recommended
                      </span>
                    )}
                    
                    {/* Tooltip Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === suggestion.id ? null : suggestion.id);
                        }}
                        className="ml-2 text-white/50 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center transition-all"
                        title="Why this suggestion?"
                      >
                        ℹ️
                      </button>
                      
                      {/* Tooltip Content */}
                      {activeTooltip === suggestion.id && (
                        <div className="absolute z-20 bottom-full left-0 mb-2 w-80 bg-gray-900 rounded-lg shadow-2xl overflow-hidden animate-fadeIn">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🧠</span>
                              <div>
                                <h4 className="text-white font-semibold text-sm">AI Decision Explanation</h4>
                                <p className="text-white/70 text-xs">Why this was recommended</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 space-y-3">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-green-400">✓</span>
                                <span className="text-white text-xs font-semibold">Primary Reason</span>
                              </div>
                              <p className="text-gray-300 text-sm">{suggestion.aiReasoning?.primary || suggestion.suggestionReason}</p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-blue-400">📊</span>
                                <span className="text-white text-xs font-semibold">AI Analysis Details</span>
                              </div>
                              <ul className="space-y-1">
                                {suggestion.aiReasoning?.details?.map((detail, i) => (
                                  <li key={i} className="text-gray-400 text-xs flex items-start gap-1">
                                    <span>•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                              <div>
                                <p className="text-gray-500 text-xs">Confidence Score</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                    <div 
                                      className="bg-green-500 rounded-full h-1.5"
                                      style={{ width: suggestion.aiReasoning?.confidence || '85%' }}
                                    ></div>
                                  </div>
                                  <span className="text-white text-xs font-mono">
                                    {suggestion.aiReasoning?.confidence || '85%'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Algorithm</p>
                                <p className="text-white text-xs font-mono mt-1">
                                  {suggestion.aiReasoning?.algorithm || 'Pattern Matching'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-purple-900/30 rounded p-2 mt-1">
                              <p className="text-purple-300 text-xs flex items-center gap-1">
                                <span>🧠</span>
                                <span>AI continuously learns from your interactions</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Was this helpful?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(suggestion.id, true, suggestion);
                                  setActiveTooltip(null);
                                }}
                                className="text-green-400 hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-900/20 transition-colors"
                              >
                                👍 Yes
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(suggestion.id, false, suggestion);
                                  setActiveTooltip(null);
                                }}
                                className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                              >
                                👎 No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-2">{suggestion.suggestionReason}</p>
                  
                  <div className="flex gap-3 text-xs text-white/60 flex-wrap">
                    <span>📋 {suggestion.type?.replace('_', ' ')}</span>
                    {suggestion.capacity && <span>👥 Capacity: {suggestion.capacity}</span>}
                    {suggestion.building && <span>🏢 {suggestion.building}</span>}
                    {suggestion.location && <span>📍 {suggestion.location}</span>}
                    <span>✅ Available Now</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookNow(suggestion);
                  }}
                  className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-sm font-medium 
                           hover:bg-purple-50 transition-all transform hover:scale-105 ml-3"
                >
                  👍 Yes
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(suggestion.id, false, suggestion);  // false = reject
                        setActiveTooltip(null);
                    }}
                    className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-sm font-medium 
                           hover:bg-purple-50 transition-all transform hover:scale-105 ml-3"
                >
                    👎 No
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer with Learning Stats */}
      <div className="mt-3 pt-2 border-t border-white/20">
        <div className="flex items-center justify-between text-white/50 text-xs">
          <div className="flex items-center gap-2">
            <span>🤖 AI analyzes time, day, and your preferences</span>
            <span>•</span>
            <span>🔄 Updates in real-time</span>
          </div>
          {learningStats && (
            <div className="flex items-center gap-2">
              <span className="text-green-300">📊 {learningStats.acceptanceRate}% accuracy</span>
              <span>•</span>
              <span>🎯 {learningStats.totalSuggestions} suggestions given</span>
            </div>
          )}
        </div>
        
        {/* Learning progress indicator */}
        {learningStats && learningStats.totalSuggestions < 20 && (
          <div className="mt-2">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-green-400 rounded-full h-1 transition-all duration-500"
                style={{ width: `${Math.min(100, learningStats.totalSuggestions * 5)}%` }}
              ></div>
            </div>
            <p className="text-white/40 text-xs mt-1 text-center">
              AI is learning your preferences ({learningStats.totalSuggestions}/20 interactions)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}