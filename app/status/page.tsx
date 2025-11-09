/**
 * Page publique de status du service
 * Affiche l'état des services et incidents passés
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'État des services - Comptalyze',
  description: 'État en temps réel des services Comptalyze',
};

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  lastCheck?: string;
}

interface Incident {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  duration?: string;
}

export default async function StatusPage() {
  // Appeler notre endpoint /api/health
  let healthData: any = null;
  let healthError = false;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
    });
    healthData = await response.json();
  } catch (error) {
    console.error('Erreur récupération health:', error);
    healthError = true;
  }
  
  // Déterminer le status global
  const overallStatus: 'operational' | 'degraded' | 'outage' = 
    healthError ? 'outage' :
    healthData?.status === 'healthy' ? 'operational' :
    healthData?.status === 'unhealthy' ? 'degraded' :
    'operational';
  
  // Services individuels
  const services: ServiceStatus[] = [
    {
      name: 'Application web',
      status: overallStatus,
      description: 'Interface utilisateur et pages',
      lastCheck: healthData?.timestamp,
    },
    {
      name: 'Base de données',
      status: healthData?.checks?.database?.status === 'ok' ? 'operational' : 'degraded',
      description: 'Stockage des données utilisateurs',
      lastCheck: healthData?.timestamp,
    },
    {
      name: 'Paiements (Stripe)',
      status: healthData?.checks?.stripe?.status === 'ok' ? 'operational' : 'degraded',
      description: 'Traitement des abonnements',
      lastCheck: healthData?.timestamp,
    },
    {
      name: 'Emails (Resend)',
      status: healthData?.checks?.resend?.status === 'ok' ? 'operational' : 'operational',
      description: 'Envoi d\'emails transactionnels',
      lastCheck: healthData?.timestamp,
    },
    {
      name: 'IA (OpenAI)',
      status: healthData?.checks?.openai?.status === 'ok' ? 'operational' : 'operational',
      description: 'ComptaBot et conseils IA',
      lastCheck: healthData?.timestamp,
    },
  ];
  
  // Incidents (en dur pour l'instant - pourrait venir d'une DB)
  const incidents: Incident[] = [
    // Exemple :
    // {
    //   id: '1',
    //   date: '2024-01-15 14:30',
    //   title: 'Ralentissements intermittents',
    //   description: 'Certains utilisateurs ont rencontré des ralentissements lors de la génération de PDF.',
    //   status: 'resolved',
    //   duration: '45 minutes',
    // },
  ];
  
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    outage: 'bg-red-500',
  };
  
  const statusLabels = {
    operational: 'Opérationnel',
    degraded: 'Performance dégradée',
    outage: 'Indisponible',
  };
  
  const statusIcons = {
    operational: '✓',
    degraded: '⚠',
    outage: '✕',
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            État des services
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivi en temps réel de la disponibilité de Comptalyze
          </p>
        </div>
        
        {/* Status global */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${statusColors[overallStatus]} animate-pulse`} />
            <div>
              <h2 className="text-2xl font-bold">
                {statusLabels[overallStatus]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Dernière vérification : {healthData?.timestamp 
                  ? new Date(healthData.timestamp).toLocaleString('fr-FR')
                  : 'Inconnue'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Services individuels */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">Services</h3>
          
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={`service-${service.name}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${statusColors[service.status]}`}
                    title={statusLabels[service.status]}
                  />
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {service.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${service.status === 'operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${service.status === 'degraded' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${service.status === 'outage' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                  `}>
                    {statusLabels[service.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold mb-6">Incidents récents</h3>
          
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">✨</div>
              <p>Aucun incident signalé dans les 30 derniers jours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{incident.title}</h4>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${incident.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                      ${incident.status === 'investigating' ? 'bg-orange-100 text-orange-700' : ''}
                      ${incident.status === 'monitoring' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      {incident.status === 'resolved' && 'Résolu'}
                      {incident.status === 'investigating' && 'Investigation'}
                      {incident.status === 'monitoring' && 'Surveillance'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {incident.description}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📅 {incident.date}</span>
                    {incident.duration && <span>⏱ Durée : {incident.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Pour signaler un problème, contactez-nous à{' '}
            <a href="mailto:support@comptalyze.com" className="text-blue-600 hover:underline">
              support@comptalyze.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

