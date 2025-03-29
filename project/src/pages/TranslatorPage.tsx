import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Play, Volume2, RefreshCw, Copy, Check, MapPin } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

// List of languages for the dropdown
const languages = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const TranslatorPage: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);

  // Simulate location detection and language suggestion
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/detect-location`);
        const data = await response.json();
        
        if (data.suggested_language && data.suggested_language.code !== sourceLang) {
          setSuggestedLanguage(data.suggested_language.name);
          // Auto-set the target language after a delay
          setTimeout(() => {
            setTargetLang(data.suggested_language.code);
            setSuggestedLanguage(null);
          }, 5000);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
      }
    };
    
    detectLocation();
  }, []);

  // Set up speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setSourceText(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setError(`Speech recognition error: ${event.error}`);
        
        // Attempt to restart recognition if it's a network error
        if (event.error === 'network') {
          setTimeout(() => {
            if (isRecording) {
              try {
                recognitionRef.current?.start();
              } catch (error) {
                console.error('Failed to restart speech recognition:', error);
              }
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Failed to restart speech recognition:', error);
          }
        }
      };
    } else {
      setError('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    try {
      setError('');
      setIsTranslating(true);

      // Get the session token from Clerk
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          text: sourceText,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Translation failed');
      }

      const data = await response.json();
      
      if (!data.translated_text) {
        throw new Error('No translation received');
      }
      
      setTranslatedText(data.translated_text);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = async (text: string, lang: string) => {
    if (!text.trim()) {
      setError('No text to speak');
      return;
    }

    try {
      setError('');
      console.log(`Sending text-to-speech request for language: ${lang}`); // Debug log
      
      // Get the session token from Clerk
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          text: text,
          language: lang,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.audio_data) {
        throw new Error('No audio data received');
      }

      console.log('Received audio data, creating blob...'); // Debug log
      
      // Create a blob from the base64 data
      const byteCharacters = atob(data.audio_data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      
      console.log('Created blob, creating audio element...'); // Debug log
      
      // Create and play audio from blob
      const audio = new Audio(URL.createObjectURL(blob));
      
      // Add error handling for audio playback
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio. Please try again.');
      };

      // Clean up the object URL after the audio is done playing
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
      };

      console.log('Starting audio playback...'); // Debug log
      await audio.play();
      console.log('Audio playback started'); // Debug log
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setError(`Text-to-speech error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy text');
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Source Text */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Source Text</h2>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-1"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full h-48 bg-gray-800 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={toggleRecording}
                className={`