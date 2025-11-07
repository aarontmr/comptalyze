"use client";

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Toast from './Toast';
import { useToast } from '@/app/hooks/useToast';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, success, error: showError, hideToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      showError('Veuillez écrire un commentaire');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          email: email.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      success('✅ Merci pour votre retour ! Il nous aide à améliorer Comptalyze.');
      setFeedback('');
      setEmail('');
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err: any) {
      showError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Bouton sticky */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(0,208,132,0.4)]"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 50,
              background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
            }}
            aria-label="Donner votre avis"
          >
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium hidden sm:inline">
              Donner votre avis
            </span>
            <span className="text-white/80 text-xs hidden sm:inline">(10s)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dialog / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-[calc(100vw-3rem)] sm:w-96"
              style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 50,
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
              }}
            >
              <div
                className="rounded-2xl p-6 shadow-2xl relative"
                style={{
                  backgroundColor: '#14161b',
                  border: '1px solid rgba(0, 208, 132, 0.2)',
                }}
              >
                {/* Gradient top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{
                    background: 'linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)',
                  }}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" style={{ color: '#00D084' }} />
                    <h3 className="text-lg font-semibold text-white">Donnez votre avis</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
                      Qu&apos;est-ce qui vous a bloqué ou surpris ? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Ex: Je n'ai pas compris comment créer une facture..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: '#0e0f12',
                        border: '1px solid #2d3441',
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Votre retour nous aide à améliorer l&apos;expérience
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email (optionnel)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: '#0e0f12',
                        border: '1px solid #2d3441',
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Pour vous répondre si besoin
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !feedback.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 hover:shadow-lg"
                    style={{
                      background: loading
                        ? '#374151'
                        : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Envoyer mon avis</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-xs text-center text-gray-500">
                  Vos commentaires restent privés et nous aident à améliorer Comptalyze
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}




