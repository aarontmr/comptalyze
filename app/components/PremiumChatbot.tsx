'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PremiumChatbotProps {
  userId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PremiumChatbot({ userId }: PremiumChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message de bienvenue au montage
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA spécialisé dans les micro-entreprises et les cotisations URSSAF. Posez-moi toutes vos questions sur votre activité, vos cotisations, vos déclarations, ou tout autre sujet lié à votre micro-entreprise. Je peux analyser vos chiffres d\'affaires enregistrés pour vous donner des conseils personnalisés.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // Vérifier que la réponse est bien du JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text.substring(0, 200));
        throw new Error('La réponse du serveur n\'est pas au format JSON.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err.message || 'Erreur lors de l\'envoi du message');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="rounded-xl relative overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)',
        border: '1px solid rgba(46,108,246,0.3)',
        height: '600px',
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(46,108,246,0.3)' }}>
          <h3 className="text-lg font-semibold text-white">
            <span className="inline-block mr-2">💬</span>
            Chatbot IA (Premium)
          </h3>
          <button
            onClick={() => {
              const welcomeMessage: Message = {
                id: 'welcome',
                role: 'assistant',
                content: 'Bonjour ! Je suis votre assistant IA spécialisé dans les micro-entreprises et les cotisations URSSAF. Posez-moi toutes vos questions sur votre activité, vos cotisations, vos déclarations, ou tout autre sujet lié à votre micro-entreprise. Je peux analyser vos chiffres d\'affaires enregistrés pour vous donner des conseils personnalisés.',
                timestamp: new Date(),
              };
              setMessages([welcomeMessage]);
              setError(null);
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Nouvelle conversation
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'text-gray-200'
                }`}
                style={{
                  backgroundColor: message.role === 'user'
                    ? 'rgba(46,108,246,0.8)'
                    : 'rgba(26,29,36,0.8)',
                }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-lg px-4 py-2 text-gray-200"
                style={{ backgroundColor: 'rgba(26,29,36,0.8)' }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(46,108,246,0.3)' }}>
          {error && (
            <div className="mb-2 p-2 rounded text-xs text-red-400" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur votre micro-entreprise..."
              rows={2}
              className="flex-1 px-4 py-2 rounded-lg text-white placeholder-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{
                backgroundColor: '#23272f',
                border: '1px solid #2d3441',
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: loading || !input.trim()
                  ? '#374151'
                  : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                boxShadow: loading || !input.trim()
                  ? 'none'
                  : '0 4px 15px rgba(46,108,246,0.3)',
              }}
            >
              {loading ? '...' : 'Envoyer'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}

