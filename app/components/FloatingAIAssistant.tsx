'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import { MessageCircle, X, Minimize2, Send, Bot, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PlanBadge from './PlanBadge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingAIAssistantProps {
  user: User | null;
}

export default function FloatingAIAssistant({ user }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const subscription = getUserSubscription(user);

  // Message de bienvenue au montage
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Bonjour ! Je suis votre assistant IA spécialisé dans les micro-entreprises et les cotisations URSSAF. Posez-moi toutes vos questions sur votre activité, vos cotisations, vos déclarations, ou tout autre sujet lié à votre micro-entreprise. Je peux analyser vos chiffres d\'affaires enregistrés pour vous donner des conseils personnalisés.',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

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

  const resetConversation = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA spécialisé dans les micro-entreprises et les cotisations URSSAF. Posez-moi toutes vos questions sur votre activité, vos cotisations, vos déclarations, ou tout autre sujet lié à votre micro-entreprise. Je peux analyser vos chiffres d\'affaires enregistrés pour vous donner des conseils personnalisés.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setError(null);
  };

  // Version Preview pour les non-Premium
  if (!subscription.isPremium || !user) {
    return (
      <>
        {/* Bouton flottant avec badge Premium */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            id="ai-assistant-button"
            className="w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
            style={{
              position: 'fixed',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
              bottom: '24px',
              right: '16px',
              top: 'auto',
              left: 'auto',
            }}
            aria-label="Découvrir l'assistant IA Premium"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </button>
        )}

        {/* Fenêtre de preview */}
        {isOpen && (
          <div
            className="fixed z-50 flex flex-col rounded-xl shadow-2xl w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] sm:h-[600px] max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-8rem)]"
            style={{
              backgroundColor: '#1a1d24',
              border: '1px solid #2d3441',
              bottom: '24px',
              right: '16px',
              top: 'auto',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 rounded-t-xl"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-semibold text-white">Assistant IA</h3>
                  <PlanBadge plan="premium" size="sm" animated={false} />
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-4 relative">
              {/* Messages d'exemple floutés */}
              <div className="space-y-4 opacity-40 blur-sm pointer-events-none">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#23272f' }}>
                    <p className="text-gray-300 text-sm">
                      Bonjour ! Je suis votre assistant IA spécialisé en micro-entreprise. Je peux vous aider à optimiser vos cotisations, prévoir vos revenus, et répondre à toutes vos questions fiscales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-[80%] rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                    <p className="text-white text-sm">
                      Combien dois-je facturer pour avoir 3000€ net par mois ?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#23272f' }}>
                    <p className="text-gray-300 text-sm">
                      Pour atteindre 3000€ net mensuels, vous devrez facturer environ 4200€ HT. Voici le détail : CA : 4200€ - Cotisations (22%) : 924€ - Impôts (~10%) : 276€ = 3000€ net...
                    </p>
                  </div>
                </div>
              </div>

              {/* Overlay Premium */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent via-[#1a1d24]/90 to-[#1a1d24]">
                <Sparkles className="w-16 h-16 mb-4" style={{ color: '#8B5CF6' }} />
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  Assistant IA Premium
                </h3>
                <p className="text-gray-300 text-center mb-4 text-sm">
                  Obtenez des conseils personnalisés et des analyses en temps réel de votre activité
                </p>
                <ul className="text-gray-300 text-sm space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Conseils fiscaux personnalisés
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Prévisions de revenus IA
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Optimisation des cotisations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Réponses instantanées 24/7
                  </li>
                </ul>
                <Link
                  href="/pricing?upgrade=premium"
                  className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:shadow-xl flex items-center gap-2 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <Lock className="w-5 h-5" />
                  Passer à Premium - 7,90€/mois
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Version complète pour les Premium
  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-button-premium"
          className="w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
          style={{
            position: 'fixed',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: '0 8px 24px rgba(46, 108, 246, 0.4)',
            bottom: '24px',
            right: '16px',
            top: 'auto',
            left: 'auto',
          }}
          aria-label="Ouvrir l'assistant IA"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col rounded-xl shadow-2xl transition-all duration-300 ${
            isMinimized ? 'w-72 sm:w-80 h-16' : 'w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] sm:h-[600px] max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-8rem)]'
          }`}
          style={{
            backgroundColor: '#16181d',
            border: '1px solid rgba(45, 52, 65, 0.5)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            bottom: '24px',
            right: '16px',
            top: 'auto',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-xl border-b"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(46, 108, 246, 0.1) 100%)',
              borderColor: 'rgba(46, 108, 246, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.2)' }}>
                <Bot className="w-4 h-4" style={{ color: '#2E6CF6' }} />
              </div>
              <span className="text-sm font-semibold text-white">Assistant IA</span>
            </div>
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <button
                  onClick={resetConversation}
                  className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
                  title="Nouvelle conversation"
                >
                  Nouveau
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
                title={isMinimized ? 'Agrandir' : 'Réduire'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenu du chat */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#0e0f12' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'text-gray-200'
                      }`}
                      style={{
                        backgroundColor: message.role === 'user'
                          ? 'rgba(46, 108, 246, 0.9)'
                          : 'rgba(26, 29, 36, 0.9)',
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-lg px-3 py-2 text-gray-200"
                      style={{ backgroundColor: 'rgba(26, 29, 36, 0.9)' }}
                    >
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(45, 52, 65, 0.5)', backgroundColor: '#16181d' }}>
                {error && (
                  <div className="mb-2 p-2 rounded text-xs text-red-400" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    style={{
                      backgroundColor: '#23272f',
                      border: '1px solid #2d3441',
                    }}
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 rounded-lg text-white transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                      background: loading || !input.trim()
                        ? '#374151'
                        : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                    }}
                    title="Envoyer (Entrée)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

