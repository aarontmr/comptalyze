'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Send, 
  Bot, 
  Copy, 
  Check, 
  Sparkles, 
  Mic, 
  MicOff,
  ChevronDown,
  ExternalLink,
  Calculator,
  FileText,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  action: string;
  targetUrl?: string;
}

interface ChatbotProps {
  user: User | null;
}

// Configuration des quick actions
const quickActions: QuickAction[] = [
  {
    icon: <Calculator className="w-4 h-4" />,
    label: "Simuler mes cotisations",
    action: "Je veux simuler mes cotisations URSSAF pour ce mois",
    targetUrl: "/dashboard"
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: "Voir les taux URSSAF",
    action: "Quels sont les taux de cotisations URSSAF actuels ?",
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    label: "Charges déductibles",
    action: "Quelles charges puis-je déduire en micro-entreprise ?",
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Contacter le support",
    action: "J'ai besoin d'aide avec mon compte Comptalyze",
  },
];

export default function Chatbot({ user }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [monthlyLimit] = useState(30); // Limite pour les utilisateurs gratuits
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const subscription = getUserSubscription(user);
  const plan = subscription.isPremium ? 'premium' : subscription.isPro ? 'pro' : 'free';

  // Charger l'historique depuis localStorage (ou Supabase si Premium)
  useEffect(() => {
    if (user && isOpen) {
      loadMessageHistory();
    }
  }, [user, isOpen]);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Message de bienvenue initial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour 👋 Je suis **ComptaBot**, ton assistant Comptalyze.\n\nJe peux t'aider à :\n• **Calculer** tes cotisations URSSAF\n• **Comprendre** ton statut micro-entrepreneur\n• **Optimiser** ta gestion fiscale\n• **Répondre** à toutes tes questions comptables\n\nComment puis-je t'aider aujourd'hui ?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const loadMessageHistory = async () => {
    try {
      // Pour les utilisateurs Premium, charger depuis Supabase
      if (subscription.isPremium && user) {
        // TODO: Implémenter le chargement depuis Supabase
        // const { data } = await supabase.from('chat_messages').select('*')...
      } else {
        // Pour les autres, charger depuis localStorage
        const stored = localStorage.getItem(`chatbot_messages_${user?.id || 'guest'}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMessages(parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          setMessageCount(parsed.filter((m: any) => m.role === 'user').length);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    }
  };

  const saveMessageHistory = (msgs: Message[]) => {
    try {
      // Sauvegarder dans localStorage pour tous
      localStorage.setItem(
        `chatbot_messages_${user?.id || 'guest'}`,
        JSON.stringify(msgs)
      );

      // Pour Premium, sauvegarder aussi dans Supabase
      if (subscription.isPremium && user) {
        // TODO: Implémenter la sauvegarde dans Supabase
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', err);
    }
  };

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || loading) return;

    // Vérifier la limite pour les utilisateurs gratuits
    if (plan === 'free' && messageCount >= monthlyLimit) {
      setError(`Limite de ${monthlyLimit} messages/mois atteinte. Passez à Pro ou Premium pour continuer !`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    setShowQuickActions(false);

    // Incrémenter le compteur pour les utilisateurs gratuits
    if (plan === 'free') {
      setMessageCount(prev => prev + 1);
    }

    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Si pas connecté et pas Premium, utiliser une API publique limitée
      const endpoint = user && subscription.isPremium 
        ? '/api/ai/chat' 
        : '/api/chatbot';

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageText,
          userId: user?.id,
          plan: plan,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Erreur de communication avec le serveur');
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

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveMessageHistory(updatedMessages);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
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
      content: `Bonjour 👋 Je suis **Alex**, ton assistant Comptalyze.\n\nJe peux t'aider à :\n• **Calculer** tes cotisations URSSAF\n• **Comprendre** ton statut micro-entrepreneur\n• **Optimiser** ta gestion fiscale\n• **Répondre** à toutes tes questions comptables\n\nComment puis-je t'aider aujourd'hui ?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setError(null);
    setShowQuickActions(true);
    saveMessageHistory([welcomeMessage]);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas disponible sur ce navigateur.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.targetUrl && user) {
      // Si c'est une action avec URL et user connecté, rediriger
      window.location.href = action.targetUrl;
    } else {
      // Sinon, envoyer le message
      sendMessage(action.action);
    }
  };

  // Rendre le markdown basique (gras, listes)
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Gras **texte**
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Liste •
        if (line.trim().startsWith('•')) {
          formatted = `<span class="block ml-2">${formatted}</span>`;
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="block" />;
      });
  };

  // Version pour utilisateurs non Premium - Preview avec upgrade CTA
  if (!subscription.isPremium && plan === 'free') {
    return (
      <>
        {/* Bouton flottant */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-32 sm:bottom-6 right-4 z-[9999] w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group"
              style={{
                position: 'fixed',
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                boxShadow: '0 10px 40px rgba(46, 108, 246, 0.5)',
              }}
              aria-label="Ouvrir l'assistant Comptalyze"
            >
              <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Fenêtre de chat */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 sm:bottom-6 left-0 sm:left-auto right-0 sm:right-4 z-[9998] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[380px] sm:max-w-[calc(100vw-2rem)] h-[calc(100vh-70px)] sm:h-[600px] sm:max-h-[calc(100vh-3rem)]"
              style={{
                backgroundColor: '#0E0F12',
                border: '1px solid rgba(46, 108, 246, 0.3)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header avec gradient */}
              <div
                className="flex items-center justify-between px-4 py-4 rounded-t-2xl"
                style={{
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">ComptaBot</h3>
                    <p className="text-xs text-white/80">Assistant Comptalyze</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`flex-1 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm max-w-[85%] group relative ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-[#2E6CF6] to-[#00D084] text-white' 
                          : 'bg-[#1A1D24] text-gray-200'
                      }`}
                      style={{
                        boxShadow: message.role === 'user' 
                          ? '0 4px 12px rgba(46, 108, 246, 0.3)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.3)',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <div className="leading-relaxed whitespace-pre-wrap break-words">
                        {renderMarkdown(message.content)}
                      </div>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#23272F] hover:bg-[#2d3441] transition-colors opacity-0 group-hover:opacity-100"
                          title="Copier"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Quick Actions */}
                {showQuickActions && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-2"
                  >
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-[#1A1D24] hover:bg-[#23272F] transition-all text-left text-xs text-gray-300 hover:text-white border border-gray-800 hover:border-[#2E6CF6]/50 min-h-[44px]"
                      >
                        <span className="text-[#2E6CF6] flex-shrink-0">{action.icon}</span>
                        <span className="flex-1">{action.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-[#1A1D24]">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className="p-4 border-t border-gray-800 bg-[#0E0F12]/80 backdrop-blur-xl rounded-b-2xl">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2"
                  >
                    <span className="text-red-500">⚠️</span>
                    <span className="flex-1">{error}</span>
                  </motion.div>
                )}

                {/* Compteur de messages pour free */}
                {plan === 'free' && (
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {messageCount}/{monthlyLimit} messages ce mois
                    </span>
                    <Link 
                      href="/pricing" 
                      className="text-[#2E6CF6] hover:text-[#00D084] transition-colors flex items-center gap-1"
                    >
                      Passer à Premium <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Pose ta question ici..."
                      rows={2}
                      disabled={loading || (plan === 'free' && messageCount >= monthlyLimit)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-xl text-sm text-white placeholder-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2E6CF6] bg-[#1A1D24] border border-gray-800 focus:border-[#2E6CF6]/50"
                      style={{ fontSize: '16px' }}
                    />
                    {typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && (
                      <button
                        onClick={toggleVoiceInput}
                        disabled={loading}
                        className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                        title="Dictée vocale"
                      >
                        {isListening ? (
                          <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                        ) : (
                          <MicOff className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim() || (plan === 'free' && messageCount >= monthlyLimit)}
                    className="px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-h-[44px] min-w-[44px]"
                    style={{
                      background: loading || !input.trim() || (plan === 'free' && messageCount >= monthlyLimit)
                        ? '#374151'
                        : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: loading || !input.trim() 
                        ? 'none'
                        : '0 4px 15px rgba(46, 108, 246, 0.4)',
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-gray-600 mt-3 text-center">
                  ⚠️ Les réponses fournies par l'assistant Comptalyze sont à titre informatif.<br />
                  Vérifiez toujours vos obligations légales sur urssaf.fr
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(46, 108, 246, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(46, 108, 246, 0.5);
          }
        `}</style>
      </>
    );
  }

  // Version complète pour Premium/Pro
  return (
    <>
      {/* Même code mais sans limitation de messages et avec fonctionnalités premium */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-32 sm:bottom-6 right-4 z-[9999] w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group"
              style={{
                position: 'fixed',
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                boxShadow: '0 10px 40px rgba(46, 108, 246, 0.5)',
              }}
              aria-label="Ouvrir l'assistant Comptalyze"
            >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-0 sm:bottom-6 left-0 sm:left-auto right-0 sm:right-4 z-[9998] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ${
              isMinimized ? 'w-full sm:w-80 h-16' : 'w-full sm:w-[380px] sm:max-w-[calc(100vw-2rem)] h-[calc(100vh-70px)] sm:h-[600px] sm:max-h-[calc(100vh-3rem)]'
            }`}
            style={{
              backgroundColor: '#0E0F12',
              border: '1px solid rgba(46, 108, 246, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-4 rounded-t-2xl"
              style={{
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                {!isMinimized && (
                  <div>
                    <h3 className="font-bold text-white text-lg">ComptaBot</h3>
                    <p className="text-xs text-white/80">
                      {subscription.isPremium ? 'Assistant Premium' : 'Assistant Pro'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isMinimized && (
                  <button
                    onClick={resetConversation}
                    className="text-xs text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                    title="Nouvelle conversation"
                  >
                    Nouveau
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isMinimized ? 'Agrandir' : 'Réduire'}
                >
                  {isMinimized ? <ChevronDown className="w-5 h-5 text-white" /> : <Minimize2 className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages (même code que version free mais sans limite) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm max-w-[85%] group relative ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-[#2E6CF6] to-[#00D084] text-white' 
                            : 'bg-[#1A1D24] text-gray-200'
                        }`}
                        style={{
                          boxShadow: message.role === 'user' 
                            ? '0 4px 12px rgba(46, 108, 246, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <div className="leading-relaxed whitespace-pre-wrap">
                          {renderMarkdown(message.content)}
                        </div>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#23272F] hover:bg-[#2d3441] transition-colors opacity-0 group-hover:opacity-100"
                            title="Copier"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {showQuickActions && messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 gap-2 pt-2"
                    >
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center gap-2 p-3 rounded-xl bg-[#1A1D24] hover:bg-[#23272F] transition-all text-left text-xs text-gray-300 hover:text-white border border-gray-800 hover:border-[#2E6CF6]/50"
                        >
                          <span className="text-[#2E6CF6]">{action.icon}</span>
                          <span className="flex-1">{action.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                  
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 bg-[#1A1D24]">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input (sans limite de messages) */}
                <div className="p-4 border-t border-gray-800 bg-[#0E0F12]/80 backdrop-blur-xl rounded-b-2xl">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2"
                    >
                      <span className="text-red-500">⚠️</span>
                      <span className="flex-1">{error}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Pose ta question ici..."
                        rows={2}
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2E6CF6] bg-[#1A1D24] border border-gray-800 focus:border-[#2E6CF6]/50"
                      />
                      {typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && (
                        <button
                          onClick={toggleVoiceInput}
                          disabled={loading}
                          className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                          title="Dictée vocale"
                        >
                          {isListening ? (
                            <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                          ) : (
                            <MicOff className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      className="px-5 py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                      style={{
                        background: loading || !input.trim()
                          ? '#374151'
                          : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                        boxShadow: loading || !input.trim() 
                          ? 'none'
                          : '0 4px 15px rgba(46, 108, 246, 0.4)',
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-600 mt-3 text-center">
                    ⚠️ Les réponses fournies par l'assistant Comptalyze sont à titre informatif.<br />
                    Vérifiez toujours vos obligations légales sur urssaf.fr
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(46, 108, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(46, 108, 246, 0.5);
        }
      `}</style>
    </>
  );
}

