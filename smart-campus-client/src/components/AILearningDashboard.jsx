// src/components/AILearningDashboard.jsx
import { useState, useEffect } from 'react';
import aiLearningService from '../services/aiLearningService';

export default function AILearningDashboard() {
    const [stats, setStats] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    
    useEffect(() => {
        loadStats();
        // Refresh stats every 10 seconds
        const interval = setInterval(loadStats, 10000);
        return () => clearInterval(interval);
    }, []);
    
    const loadStats = () => {
        const learningStats = aiLearningService.getLearningStats();
        setStats(learningStats);
    };
    
    const handleReset = () => {
        if (confirm('Reset all AI learning data? This will clear your personalized recommendations.')) {
            aiLearningService.resetLearning();
            loadStats();
        }
    };
    
    if (!stats) return null;
    
    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🧠</span>
                    <div>
                        <h3 className="text-white font-bold text-lg">AI Learning Dashboard</h3>
                        <p className="text-white/70 text-xs">See how AI is learning from you</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{stats.totalSuggestions}</div>
                    <div className="text-white/70 text-xs">Total Suggestions</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-300">{stats.acceptedSuggestions}</div>
                    <div className="text-white/70 text-xs">Accepted</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-300">{stats.rejectedSuggestions}</div>
                    <div className="text-white/70 text-xs">Rejected</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{stats.acceptanceRate}%</div>
                    <div className="text-white/70 text-xs">Acceptance Rate</div>
                </div>
            </div>
            
            {/* Learning Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>AI Learning Progress</span>
                    <span>{Math.min(100, stats.totalSuggestions)}/100 interactions</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                        className="bg-green-400 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${Math.min(100, stats.totalSuggestions)}%` }}
                    ></div>
                </div>
                <p className="text-white/50 text-xs mt-1">
                    {stats.totalSuggestions < 20 
                        ? "🤖 AI is still learning your preferences" 
                        : stats.totalSuggestions < 50 
                        ? "📈 AI is getting to know you better" 
                        : "🎯 AI is now personalized for you!"}
                </p>
            </div>
            
            {/* Detailed Stats (Expandable) */}
            {showDetails && (
                <div className="space-y-4 mt-4 pt-4 border-t border-white/20">
                    {/* Top Performing Resources */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-2">🏆 Top Performing Resources</h4>
                        <div className="space-y-2">
                            {stats.topResources.map((resource, i) => (
                                <div key={resource.id} className="bg-white/5 rounded p-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-white text-sm">
                                                {i === 0 && '🥇 '}
                                                {i === 1 && '🥈 '}
                                                {i === 2 && '🥉 '}
                                                {resource.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-green-300">{resource.acceptanceRate}%</span>
                                            <span className="text-white/50">{resource.acceptedCount}/{resource.suggestedCount}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                                        <div 
                                            className="bg-green-400 rounded-full h-1"
                                            style={{ width: `${resource.acceptanceRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* User Preferences */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded p-2">
                            <p className="text-white/70 text-xs mb-1">⭐ Favorite Type</p>
                            <p className="text-white font-semibold">
                                {stats.topPreferredType?.type || 'Not enough data'}
                            </p>
                            <p className="text-white/50 text-xs">
                                {stats.topPreferredType?.count || 0} selections
                            </p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                            <p className="text-white/70 text-xs mb-1">📍 Favorite Building</p>
                            <p className="text-white font-semibold">
                                {stats.topPreferredBuilding?.building || 'Not enough data'}
                            </p>
                            <p className="text-white/50 text-xs">
                                {stats.topPreferredBuilding?.count || 0} selections
                            </p>
                        </div>
                    </div>
                    
                    {/* Learning Insight */}
                    <div className="bg-purple-900/30 rounded p-3">
                        <p className="text-purple-200 text-xs flex items-center gap-1">
                            <span>💡</span>
                            <span>
                                {stats.acceptanceRate > 70 
                                    ? "AI is working great! Keep giving feedback to maintain accuracy."
                                    : stats.acceptanceRate > 40
                                    ? "AI is improving! The more you interact, the better it gets."
                                    : "AI needs more feedback. Use thumbs up/down to train the system."}
                            </span>
                        </p>
                    </div>
                    
                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg text-sm transition-colors"
                    >
                        Reset AI Learning Data
                    </button>
                    <button
                        onClick={() => {
                            aiLearningService.addDemoData();
                            loadStats();
                            toast.success('Demo data loaded!');
                        }}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 rounded-lg text-sm transition-colors"
                    >
                        📊 Load Demo Data (Testing)
                    </button>   
                    <button
                        onClick={() => {
                            localStorage.removeItem('ai_learning_data');
                            toast.success('Demo data cleared! Start using the system for REAL data');
                            setTimeout(() => window.location.reload(), 1000);
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg text-sm transition-colors w-full mt-2"
                    >
                        🗑️ Clear Demo Data & Start Fresh
                    </button>   
                </div>
            )}
        </div>
    );
}