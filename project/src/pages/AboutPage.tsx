import React from 'react';
import { Globe, Zap, Shield, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
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
      icon: <Users className="h-12 w-12 text-pink-500" />,
      title: 'Community Driven',
      description: 'Join a global community of language learners and translators.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            About Project Bolt
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're revolutionizing the way people communicate across languages using cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-300 mb-6">
            At Project Bolt, we believe that language should never be a barrier to communication.
            Our mission is to make the world more connected by providing instant, accurate, and
            natural-sounding translations for everyone.
          </p>
          <p className="text-gray-300">
            We combine the power of artificial intelligence with human expertise to deliver
            translations that preserve the nuance and cultural context of every language.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 