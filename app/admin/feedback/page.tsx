"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Mail, User, Calendar, Eye, EyeOff, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';

interface Feedback {
  id: string;
  feedback: string;
  email: string | null;
  user_id: string | null;
  user_agent: string | null;
  page_url: string | null;
  created_at: string;
  is_read: boolean;
  admin_notes: string | null;
}

interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: any;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [stats, setStats] = useState({ total: 0, unread: 0, withEmail: 0 });

  useEffect(() => {
    checkAdminAndLoadFeedbacks();
  }, []);

  const checkAdminAndLoadFeedbacks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Vérifier si l'utilisateur est admin ou premium_forever
      const isAdminUser = 
        user.user_metadata?.is_admin === true ||
        user.user_metadata?.is_premium_forever === true;

      if (!isAdminUser) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      await loadFeedbacks();
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      router.push('/dashboard');
    }
  };

  const loadFeedbacks = async () => {
    try {
      setLoading(true);

      // Charger tous les feedbacks
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      setFeedbacks(feedbackData || []);

      // Calculer les stats
      const total = feedbackData?.length || 0;
      const unread = feedbackData?.filter(f => !f.is_read).length || 0;
      const withEmail = feedbackData?.filter(f => f.email).length || 0;
      setStats({ total, unread, withEmail });

      // Charger les infos utilisateurs pour les feedbacks liés à un user_id
      const userIds = [...new Set(feedbackData?.map(f => f.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const usersMap: Record<string, UserProfile> = {};
        
        for (const userId of userIds) {
          const { data: { user } } = await supabase.auth.admin.getUserById(userId as string);
          if (user) {
            usersMap[userId as string] = user;
          }
        }
        
        setUsers(usersMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ is_read: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour l'état local
      setFeedbacks(prev =>
        prev.map(f => f.id === id ? { ...f, is_read: !currentStatus } : f)
      );

      // Mettre à jour les stats
      setStats(prev => ({
        ...prev,
        unread: !currentStatus ? prev.unread - 1 : prev.unread + 1
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'unread') return !f.is_read;
    if (filter === 'read') return f.is_read;
    return true;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: '#0e0f12', fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Feedbacks utilisateurs
              </h1>
              <p className="text-gray-400">
                Retours collectés via le bouton sticky sur la landing page
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-gray-800"
              style={{ border: '1px solid #2d3441' }}
            >
              ← Retour Dashboard
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
            >
              <div className="text-sm text-gray-400 mb-1">Total</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid rgba(0, 208, 132, 0.2)' }}
            >
              <div className="text-sm text-gray-400 mb-1">Non lus</div>
              <div className="text-2xl font-bold" style={{ color: '#00D084' }}>
                {stats.unread}
              </div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
            >
              <div className="text-sm text-gray-400 mb-1">Avec email</div>
              <div className="text-2xl font-bold text-white">{stats.withEmail}</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === 'all'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              style={filter === 'all' ? {
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              } : {
                border: '1px solid #2d3441'
              }}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === 'unread'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              style={filter === 'unread' ? {
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              } : {
                border: '1px solid #2d3441'
              }}
            >
              Non lus ({stats.unread})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === 'read'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              style={filter === 'read' ? {
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              } : {
                border: '1px solid #2d3441'
              }}
            >
              Lus ({stats.total - stats.unread})
            </button>
          </div>
        </div>

        {/* Liste des feedbacks */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Chargement des feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Aucun feedback pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((fb) => {
              const userInfo = fb.user_id ? users[fb.user_id] : null;
              
              return (
                <div
                  key={fb.id}
                  className="rounded-xl p-6 relative"
                  style={{
                    backgroundColor: '#14161b',
                    border: fb.is_read 
                      ? '1px solid #1f232b' 
                      : '1px solid rgba(0, 208, 132, 0.3)',
                    boxShadow: fb.is_read 
                      ? 'none' 
                      : '0 4px 12px rgba(0, 208, 132, 0.1)'
                  }}
                >
                  {/* Badge non lu */}
                  {!fb.is_read && (
                    <div
                      className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(0, 208, 132, 0.1)',
                        color: '#00D084',
                        border: '1px solid rgba(0, 208, 132, 0.3)'
                      }}
                    >
                      Nouveau
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      }}
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {userInfo ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-white">
                              {userInfo.email}
                            </span>
                          </div>
                        ) : fb.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{fb.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Anonyme</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(fb.created_at).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback content */}
                  <div className="mb-4 pl-14">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {fb.feedback}
                    </p>
                  </div>

                  {/* Metadata */}
                  {(fb.page_url || fb.user_agent) && (
                    <div className="pl-14 mb-4 text-xs text-gray-500 space-y-1">
                      {fb.page_url && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{fb.page_url}</span>
                        </div>
                      )}
                      {fb.user_agent && (
                        <div className="truncate">
                          {fb.user_agent.substring(0, 80)}...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pl-14 flex items-center gap-2">
                    <button
                      onClick={() => toggleReadStatus(fb.id, fb.is_read)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:brightness-110"
                      style={{
                        backgroundColor: fb.is_read ? '#1f232b' : 'rgba(0, 208, 132, 0.1)',
                        border: fb.is_read ? '1px solid #2d3441' : '1px solid rgba(0, 208, 132, 0.3)',
                        color: fb.is_read ? '#9ca3af' : '#00D084'
                      }}
                    >
                      {fb.is_read ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Marquer non lu</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Marquer lu</span>
                        </>
                      )}
                    </button>

                    {fb.email && (
                      <a
                        href={`mailto:${fb.email}?subject=Re: Votre retour sur Comptalyze`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-gray-800"
                        style={{
                          border: '1px solid #2d3441',
                          color: '#9ca3af'
                        }}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Répondre</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}













