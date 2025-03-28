import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Globe, History, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const DashboardPage: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Translations Today', value: '12' },
    { label: 'Languages Used', value: '5' },
    { label: 'Saved Phrases', value: '28' },
    { label: 'Learning Streak', value: '7 days' },
  ];

  const recentTranslations = [
    { id: 1, from: 'Hello, how are you?', to: 'Hola, ¿cómo estás?', date: '2 minutes ago' },
    { id: 2, from: 'Thank you very much', to: 'Muchas gracias', date: '15 minutes ago' },
    { id: 3, from: 'Good morning', to: 'Buenos días', date: '1 hour ago' },
  ];

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
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
            >
              <h3 className="text-gray-400 text-sm mb-2">{stat.label}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
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
                    <span className="text-sm text-gray-400">{translation.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300">
                  <Globe className="h-5 w-5 text-indigo-400" />
                  <span>New Translation</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300">
                  <History className="h-5 w-5 text-indigo-400" />
                  <span>Translation History</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-300">
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
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Learning Language</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
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