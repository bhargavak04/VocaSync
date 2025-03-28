import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Globe, Zap, Shield, Brain } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  const features = [
    {
      icon: <Globe className="h-12 w-12 text-indigo-500" />,
      title: 'Global Language Support',
      description: 'Break down language barriers with support for over 100 languages and dialects.',
    },
    {
      icon: <Zap className="h-12 w-12 text-purple-500" />,
      title: 'Lightning Fast',
      description: 'Experience real-time translation with our cutting-edge AI technology.',
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-500" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: <Brain className="h-12 w-12 text-pink-500" />,
      title: 'AI-Powered',
      description: 'Advanced machine learning algorithms for accurate and natural translations.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Welcome to VocaSync
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of translation with our cutting-edge AI technology.
            Break down language barriers and connect with the world.
          </p>
          <div className="flex justify-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose VocaSync?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-indigo-600/20 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Translating?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already breaking down language barriers with VocaSync.
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Get Started Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;