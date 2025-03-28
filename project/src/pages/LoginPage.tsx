import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Globe, Zap, Shield, Brain } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { isLoaded, isSignedIn } = useUser();

  // If user is already signed in, redirect to dashboard
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Welcome to VocaSync
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Experience the future of translation with our cutting-edge AI technology.
              Break down language barriers and connect with the world.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </button>
            </div>
            {isSignUp ? <SignUp /> : <SignIn />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 