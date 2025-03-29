import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Languages, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const purposes = [
    { id: 'business', name: 'Business' },
    { id: 'travel', name: 'Travel' },
    { id: 'education', name: 'Education' },
    { id: 'social', name: 'Social' },
    { id: 'technical', name: 'Technical' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = async (purpose: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chatbot/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purpose }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      setMessages(data.messages);
      setCurrentLanguage(data.recommended_language);
      setSelectedPurpose(purpose);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setMessages([
        {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentLanguage) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, ...data.messages]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Bot className="h-8 w-8 mr-2 text-indigo-400" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Language Assistant
          </h1>
        </div>

        {!selectedPurpose ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purposes.map((purpose) => (
              <button
                key={purpose.id}
                onClick={() => startConversation(purpose.id)}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 text-left"
              >
                <div className="flex items-center mb-4">
                  <Languages className="h-6 w-6 text-indigo-400 mr-2" />
                  <h3 className="text-xl font-semibold">{purpose.name}</h3>
                </div>
                <p className="text-gray-400">
                  Get language recommendations and practice for {purpose.name.toLowerCase()} purposes.
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chat with Language Assistant</h2>
              <button
                onClick={() => {
                  setSelectedPurpose(null);
                  setCurrentLanguage(null);
                  setMessages([]);
                }}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Start Over
              </button>
            </div>

            <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === 'user' ? (
                        <User className="h-5 w-5 mr-2" />
                      ) : (
                        <Bot className="h-5 w-5 mr-2 text-indigo-400" />
                      )}
                      <span className="font-semibold">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-indigo-400" />
                      <span className="font-semibold">Assistant</span>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage; 