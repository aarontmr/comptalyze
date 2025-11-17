"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Activity, AlertTriangle, CheckCircle, Clock, Globe, User, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface AccessLog {
  id: string;
  ip_address: string;
  endpoint: string;
  method: string;
  status_code: number;
  user_id: string | null;
  user_agent: string | null;
  response_time_ms: number | null;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

interface Stats {
  total: number;
  success: number;
  errors: number;
  avgResponseTime: number;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, success: 0, errors: 0, avgResponseTime: 0 });
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'errors'>('all');
  const [filterEndpoint, setFilterEndpoint] = useState<string>('all');
  const [endpoints, setEndpoints] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAndLoadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterStatus, filterEndpoint]);

  const checkAdminAndLoadLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const isAdminUser = 
        user.user_metadata?.is_admin === true ||
        user.user_metadata?.is_premium_forever === true;

      if (!isAdminUser) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      await loadLogs();
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      router.push('/dashboard');
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);

      const { data: logsData, error: logsError } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200); // Derniers 200 logs

      if (logsError) throw logsError;

      setLogs(logsData || []);

      // Calculer les stats
      const total = logsData?.length || 0;
      const success = logsData?.filter(l => l.status_code < 400).length || 0;
      const errors = total - success;
      const avgResponseTime = logsData?.length
        ? Math.round(
            logsData.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logsData.length
          )
        : 0;

      setStats({ total, success, errors, avgResponseTime });

      // Extraire les endpoints uniques
      const uniqueEndpoints = [...new Set(logsData?.map(l => l.endpoint) || [])];
      setEndpoints(uniqueEndpoints);

    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtre par status
    if (filterStatus === 'success') {
      filtered = filtered.filter(l => l.status_code < 400);
    } else if (filterStatus === 'errors') {
      filtered = filtered.filter(l => l.status_code >= 400);
    }

    // Filtre par endpoint
    if (filterEndpoint !== 'all') {
      filtered = filtered.filter(l => l.endpoint === filterEndpoint);
    }

    setFilteredLogs(filtered);
  };

  const getStatusColor = (code: number) => {
    if (code < 300) return '#00D084'; // Vert
    if (code < 400) return '#3b82f6'; // Bleu
    if (code < 500) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  const getStatusIcon = (code: number) => {
    if (code < 400) return <CheckCircle className="w-4 h-4" style={{ color: '#00D084' }} />;
    return <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />;
  };

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
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8" style={{ color: '#00D084' }} />
                Journaux d&apos;accès
              </h1>
              <p className="text-gray-400">
                Surveillance des accès, erreurs et tentatives de connexion
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadLogs}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                style={{ border: '1px solid #2d3441' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-gray-800"
                style={{ border: '1px solid #2d3441' }}
              >
                ← Dashboard
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
            >
              <div className="text-sm text-gray-400 mb-1">Total requêtes</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid rgba(0, 208, 132, 0.2)' }}
            >
              <div className="text-sm text-gray-400 mb-1">Succès</div>
              <div className="text-2xl font-bold" style={{ color: '#00D084' }}>
                {stats.success}
              </div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <div className="text-sm text-gray-400 mb-1">Erreurs</div>
              <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {stats.errors}
              </div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
            >
              <div className="text-sm text-gray-400 mb-1">Temps moy.</div>
              <div className="text-2xl font-bold text-white">{stats.avgResponseTime}ms</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === 'all' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={filterStatus === 'all' ? {
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                } : { border: '1px solid #2d3441' }}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('success')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === 'success' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={filterStatus === 'success' ? {
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                } : { border: '1px solid #2d3441' }}
              >
                Succès ({stats.success})
              </button>
              <button
                onClick={() => setFilterStatus('errors')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === 'errors' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={filterStatus === 'errors' ? {
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                } : { border: '1px solid #2d3441' }}
              >
                Erreurs ({stats.errors})
              </button>
            </div>

            <select
              value={filterEndpoint}
              onChange={(e) => setFilterEndpoint(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm transition-all text-white"
              style={{ backgroundColor: '#14161b', border: '1px solid #2d3441' }}
            >
              <option value="all">Tous les endpoints</option>
              {endpoints.slice(0, 20).map(ep => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Chargement des logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{ backgroundColor: '#14161b', border: '1px solid #1f232b' }}
          >
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Aucun log pour les filtres sélectionnés</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg p-4 hover:bg-gray-800/30 transition-colors"
                style={{
                  backgroundColor: '#14161b',
                  border: '1px solid #1f232b',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(log.status_code)}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      {/* Method badge */}
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                        style={{
                          backgroundColor: 'rgba(46, 108, 246, 0.1)',
                          color: '#60a5fa',
                          border: '1px solid rgba(46, 108, 246, 0.2)'
                        }}
                      >
                        {log.method}
                      </span>

                      {/* Endpoint */}
                      <span className="text-sm font-mono text-gray-300 truncate">
                        {log.endpoint}
                      </span>

                      {/* Status code */}
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(log.status_code)}15`,
                          color: getStatusColor(log.status_code),
                          border: `1px solid ${getStatusColor(log.status_code)}30`
                        }}
                      >
                        {log.status_code}
                      </span>

                      {/* Response time */}
                      {log.response_time_ms && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {log.response_time_ms}ms
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {/* IP */}
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{log.ip_address}</span>
                      </div>

                      {/* User */}
                      {log.user_id && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{log.user_id.substring(0, 8)}...</span>
                        </div>
                      )}

                      {/* Date */}
                      <span>
                        {new Date(log.created_at).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </span>
                    </div>

                    {/* Error message */}
                    {log.error_message && (
                      <div className="mt-2 text-xs text-red-400 font-mono">
                        ⚠️ {log.error_message}
                      </div>
                    )}

                    {/* User agent */}
                    {log.user_agent && (
                      <div className="mt-2 text-xs text-gray-600 truncate">
                        {log.user_agent}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination info */}
        {!loading && filteredLogs.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Affichage de {filteredLogs.length} sur {stats.total} logs (limité aux 200 derniers)
          </div>
        )}
      </div>
    </main>
  );
}






























