import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Globe, History, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

interface DashboardStats {
  translations_today: number;
  languages_used: number;
  saved_phrases: number;
  learning_streak: number;
}

interface Translation {
  id: number;
  from: string;
  to: string;
  date: string;
}

const DashboardPage: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    translations_today: 0,
    languages_used: 0,
    saved_phrases: 0,
    learning_streak: 0
  });
  const [recentTranslations, setRecentTranslations] = useState<Translation[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Get the session token from Clerk
        const token = await getToken();
        console.log('Clerk token:', token); // Debug log

        if (!token) {
          console.log('No token available'); // Debug log
          setError('Not authenticated');
          navigate('/login');
          return;
        }

        // Fetch stats
        console.log('Fetching stats with token:', token); // Debug log
        const statsResponse = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Stats response status:', statsResponse.status); // Debug log
        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            console.log('Unauthorized - redirecting to login'); // Debug log
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch stats');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent translations
        console.log('Fetching translations with token:', token); // Debug log
        const translationsResponse = await fetch(`${API_URL}/api/dashboard/recent-translations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Translations response status:', translationsResponse.status); // Debug log
        if (!translationsResponse.ok) {
          if (translationsResponse.status === 401) {
            console.log('Unauthorized - redirecting to login'); // Debug log
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch translations');
        }
        const translationsData = await translationsResponse.json();
        setRecentTranslations(translationsData.translations);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (clerkUser) {
      console.log('Clerk user found:', clerkUser); // Debug log
      fetchDashboardData();
    } else {
      console.log('No Clerk user found'); // Debug log
    }
  }, [clerkUser, navigate, getToken]);

  const handleUpdatePreferences = async (primaryLang: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/dashboard/update-preferences`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          primary_language: primaryLang,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to update preferences');
      }
      
      // Refresh dashboard data
      const statsResponse = await fetch(`${API_URL}/api/dashboard/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch updated stats');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Welcome back, {clerkUser?.firstName || 'User'}!
            </h1>
            <p className="text-gray-400 mt-2">Here's what's happening with your translations</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <h3 className="text-gray-400 text-sm mb-2">Translations Today</h3>
            <p className="text-2xl font-bold">{stats.translations_today}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <h3 className="text-gray-400 text-sm mb-2">Languages Used</h3>
            <p className="text-2xl font-bold">{stats.languages_used}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <h3 className="text-gray-400 text-sm mb-2">Saved Phrases</h3>
            <p className="text-2xl font-bold">{stats.saved_phrases}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <h3 className="text-gray-400 text-sm mb-2">Learning Streak</h3>
            <p className="text-2xl font-bold">{stats.learning_streak} days</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Translations</h2>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentTranslations.map((translation) => (
                <div
                  key={translation.id}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-300">{translation.from}</p>
                      <p className="text-indigo-400">{translation.to}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(translation.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {recentTranslations.length === 0 && (
                <p className="text-gray-400 text-center py-4">No recent translations</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/translator')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300"
                >
                  <Globe className="h-5 w-5 text-indigo-400" />
                  <span>New Translation</span>
                </button>
                <button 
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300"
                >
                  <History className="h-5 w-5 text-indigo-400" />
                  <span>Translation History</span>
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300"
                >
                  <Settings className="h-5 w-5 text-indigo-400" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Language Preferences */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Language Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Primary Language</label>
                  <select 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onChange={(e) => handleUpdatePreferences(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 