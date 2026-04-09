// src/services/aiLearningService.js

// Local storage keys
const STORAGE_KEYS = {
    FEEDBACK_HISTORY: 'ai_feedback_history',
    USER_PREFERENCES: 'ai_user_preferences',
    SUGGESTION_PERFORMANCE: 'ai_suggestion_performance',
    LEARNING_DATA: 'ai_learning_data'
};

class AILearningService {
    constructor() {
        this.initializeLearningData();
    }

    // Add this method to aiLearningService.js
addDemoData() {
    const demoData = {
        totalSuggestions: 24,
        acceptedSuggestions: 18,
        rejectedSuggestions: 6,
        userPreferences: {
            favoriteTypes: {
                'LAB': 12,
                'LECTURE_HALL': 6,
                'MEETING_ROOM': 4,
                'EQUIPMENT': 2
            },
            favoriteTimes: {
                'morning': 8,
                'afternoon': 10,
                'evening': 6
            },
            favoriteBuildings: {
                'Science Tower': 10,
                'Engineering Block': 6,
                'Library': 4
            },
            preferredCapacity: 30
        },
        resourcePerformance: {
            1: {
                name: 'Computer Lab 401',
                type: 'LAB',
                suggestedCount: 8,
                acceptedCount: 7,
                rejectedCount: 1,
                lastSuggested: new Date().toISOString()
            },
            2: {
                name: 'Lecture Hall A',
                type: 'LECTURE_HALL',
                suggestedCount: 6,
                acceptedCount: 5,
                rejectedCount: 1,
                lastSuggested: new Date().toISOString()
            },
            3: {
                name: 'Meeting Room 101',
                type: 'MEETING_ROOM',
                suggestedCount: 5,
                acceptedCount: 3,
                rejectedCount: 2,
                lastSuggested: new Date().toISOString()
            }
        },
        learningHistory: [
            {
                timestamp: new Date().toISOString(),
                suggestionId: 1,
                suggestionName: 'Computer Lab 401',
                action: 'accepted',
                reason: 'Afternoon lab suggestion'
            }
        ]
    };
    
    localStorage.setItem(STORAGE_KEYS.LEARNING_DATA, JSON.stringify(demoData));
}

    // Initialize learning data structure
    initializeLearningData() {
        if (!localStorage.getItem(STORAGE_KEYS.LEARNING_DATA)) {
            const initialData = {
                totalSuggestions: 0,
                acceptedSuggestions: 0,
                rejectedSuggestions: 0,
                userPreferences: {
                    favoriteTypes: {},
                    favoriteTimes: {},
                    favoriteBuildings: {},
                    preferredCapacity: null
                },
                resourcePerformance: {},
                learningHistory: []
            };
            localStorage.setItem(STORAGE_KEYS.LEARNING_DATA, JSON.stringify(initialData));
        }
    }

    // Record user interaction with a suggestion
    recordInteraction(suggestion, action, metadata = {}) {
        const learningData = this.getLearningData();
        
        // Update counts
        learningData.totalSuggestions++;
        if (action === 'accepted') {
            learningData.acceptedSuggestions++;
        } else if (action === 'rejected') {
            learningData.rejectedSuggestions++;
        }
        
        // Update resource performance
        if (!learningData.resourcePerformance[suggestion.id]) {
            learningData.resourcePerformance[suggestion.id] = {
                name: suggestion.name,
                type: suggestion.type,
                suggestedCount: 0,
                acceptedCount: 0,
                rejectedCount: 0,
                lastSuggested: null
            };
        }
        
        learningData.resourcePerformance[suggestion.id].suggestedCount++;
        if (action === 'accepted') {
            learningData.resourcePerformance[suggestion.id].acceptedCount++;
        } else if (action === 'rejected') {
            learningData.resourcePerformance[suggestion.id].rejectedCount++;
        }
        learningData.resourcePerformance[suggestion.id].lastSuggested = new Date().toISOString();
        
        // Update user preferences based on accepted suggestions
        if (action === 'accepted') {
            this.updateUserPreferences(suggestion);
        }
        
        // Add to learning history
        learningData.learningHistory.unshift({
            timestamp: new Date().toISOString(),
            suggestionId: suggestion.id,
            suggestionName: suggestion.name,
            action: action,
            reason: suggestion.suggestionReason,
            metadata: metadata
        });
        
        // Keep only last 100 history items
        if (learningData.learningHistory.length > 100) {
            learningData.learningHistory = learningData.learningHistory.slice(0, 100);
        }
        
        localStorage.setItem(STORAGE_KEYS.LEARNING_DATA, JSON.stringify(learningData));
        
        // Send to backend if available
        this.syncToBackend(suggestion, action, metadata);
        
        return this.getPersonalizedScore(suggestion);
    }
    
    // Update user preferences based on accepted suggestions
    updateUserPreferences(suggestion) {
        const learningData = this.getLearningData();
        
        // Update favorite resource types
        if (suggestion.type) {
            learningData.userPreferences.favoriteTypes[suggestion.type] = 
                (learningData.userPreferences.favoriteTypes[suggestion.type] || 0) + 1;
        }
        
        // Update favorite times based on current hour
        const currentHour = new Date().getHours();
        const timeOfDay = this.getTimeOfDay(currentHour);
        learningData.userPreferences.favoriteTimes[timeOfDay] = 
            (learningData.userPreferences.favoriteTimes[timeOfDay] || 0) + 1;
        
        // Update favorite buildings
        if (suggestion.building) {
            learningData.userPreferences.favoriteBuildings[suggestion.building] = 
                (learningData.userPreferences.favoriteBuildings[suggestion.building] || 0) + 1;
        }
        
        // Update preferred capacity
        if (suggestion.capacity) {
            if (!learningData.userPreferences.preferredCapacity) {
                learningData.userPreferences.preferredCapacity = suggestion.capacity;
            } else {
                // Weighted average
                learningData.userPreferences.preferredCapacity = 
                    Math.round((learningData.userPreferences.preferredCapacity + suggestion.capacity) / 2);
            }
        }
        
        localStorage.setItem(STORAGE_KEYS.LEARNING_DATA, JSON.stringify(learningData));
    }
    
    // Get personalized score for a resource based on learning
    getPersonalizedScore(resource) {
        const learningData = this.getLearningData();
        let score = 0;
        
        // Factor 1: Resource popularity (40%)
        const resourcePerf = learningData.resourcePerformance[resource.id];
        if (resourcePerf && resourcePerf.suggestedCount > 0) {
            const acceptanceRate = resourcePerf.acceptedCount / resourcePerf.suggestedCount;
            score += acceptanceRate * 0.4;
        }
        
        // Factor 2: User type preference (30%)
        if (resource.type && learningData.userPreferences.favoriteTypes[resource.type]) {
            const maxTypeCount = Math.max(...Object.values(learningData.userPreferences.favoriteTypes), 0);
            const typeScore = learningData.userPreferences.favoriteTypes[resource.type] / (maxTypeCount || 1);
            score += typeScore * 0.3;
        }
        
        // Factor 3: Time preference (20%)
        const currentHour = new Date().getHours();
        const timeOfDay = this.getTimeOfDay(currentHour);
        if (learningData.userPreferences.favoriteTimes[timeOfDay]) {
            const maxTimeCount = Math.max(...Object.values(learningData.userPreferences.favoriteTimes), 0);
            const timeScore = learningData.userPreferences.favoriteTimes[timeOfDay] / (maxTimeCount || 1);
            score += timeScore * 0.2;
        }
        
        // Factor 4: Building preference (10%)
        if (resource.building && learningData.userPreferences.favoriteBuildings[resource.building]) {
            const maxBuildingCount = Math.max(...Object.values(learningData.userPreferences.favoriteBuildings), 0);
            const buildingScore = learningData.userPreferences.favoriteBuildings[resource.building] / (maxBuildingCount || 1);
            score += buildingScore * 0.1;
        }
        
        return Math.min(1, Math.max(0, score));
    }
    
    // Get time of day category
    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }
    
    // Get learning statistics
    getLearningStats() {
        const learningData = this.getLearningData();
        const acceptanceRate = learningData.totalSuggestions > 0 
            ? (learningData.acceptedSuggestions / learningData.totalSuggestions) * 100 
            : 0;
        
        // Get top performing resources
        const topResources = Object.entries(learningData.resourcePerformance)
            .map(([id, data]) => ({
                id,
                name: data.name,
                acceptanceRate: data.suggestedCount > 0 
                    ? (data.acceptedCount / data.suggestedCount) * 100 
                    : 0,
                suggestedCount: data.suggestedCount,
                acceptedCount: data.acceptedCount
            }))
            .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
            .slice(0, 5);
        
        // Get user's top preferences
        const topType = Object.entries(learningData.userPreferences.favoriteTypes)
            .sort((a, b) => b[1] - a[1])[0];
        
        const topBuilding = Object.entries(learningData.userPreferences.favoriteBuildings)
            .sort((a, b) => b[1] - a[1])[0];
        
        return {
            totalSuggestions: learningData.totalSuggestions,
            acceptedSuggestions: learningData.acceptedSuggestions,
            rejectedSuggestions: learningData.rejectedSuggestions,
            acceptanceRate: acceptanceRate.toFixed(1),
            topResources: topResources,
            topPreferredType: topType ? { type: topType[0], count: topType[1] } : null,
            topPreferredBuilding: topBuilding ? { building: topBuilding[0], count: topBuilding[1] } : null,
            learningHistoryCount: learningData.learningHistory.length
        };
    }
    
    // Get learning data from storage
    getLearningData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_DATA) || '{}');
    }
    
    // Sync to backend (optional)
    async syncToBackend(suggestion, action, metadata) {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:8080/api/ai/learning/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    suggestionId: suggestion.id,
                    suggestionName: suggestion.name,
                    action: action,
                    timestamp: new Date().toISOString(),
                    metadata: metadata
                })
            });
        } catch (err) {
            console.log('Backend sync failed, data saved locally');
        }
    }
    
    // Reset learning data (for testing)
    resetLearning() {
        localStorage.removeItem(STORAGE_KEYS.LEARNING_DATA);
        localStorage.removeItem(STORAGE_KEYS.FEEDBACK_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
        localStorage.removeItem(STORAGE_KEYS.SUGGESTION_PERFORMANCE);
        this.initializeLearningData();
    }
}

export default new AILearningService();