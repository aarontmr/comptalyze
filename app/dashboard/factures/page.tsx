'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserPlan } from '@/lib/plan';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Card from '@/app/components/Card';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { FileText, Download, Mail, Eye } from 'lucide-react';
import FeaturePreview from '@/app/components/FeaturePreview';
import PlanBadge from '@/app/components/PlanBadge';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  total_eur: number;
  created_at: string;
}

export default function FacturesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        setUser(session.user);
        const userPlan = await getUserPlan(supabase, session.user.id);
        setPlan(userPlan);
        setUserId(session.user.id);

        if (userPlan !== 'premium' && userPlan !== 'pro') {
          setLoading(false);
          return;
        }

        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select('id, invoice_number, customer_name, issue_date, total_eur, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur:', error);
          return;
        }

        setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const subscription = getUserSubscription(user);

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert('Vous devez être connecté pour télécharger la facture');
        return;
      }

      const token = session.access_token;
      if (!token) {
        alert('Erreur d\'authentification. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erreur lors du téléchargement';
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } else {
          const text = await response.text();
          console.error('Erreur réponse:', text);
        }
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Erreur téléchargement PDF:', error);
      alert(`Erreur lors du téléchargement: ${error?.message || 'Erreur inconnue'}`);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }
      const response = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Facture envoyée par e-mail');
      } else {
        alert(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (plan !== 'premium' && plan !== 'pro') {
    return (
      <div>
        <Breadcrumbs items={[
          { label: 'Aperçu', href: '/dashboard' },
          { label: 'Factures' },
        ]} />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-white">Factures</h1>
          <PlanBadge plan="pro" size="lg" />
        </div>

        {/* Aperçu avec exemple de factures */}
        <FeaturePreview
          title="Créez et gérez vos factures professionnelles"
          description="Générez des factures PDF personnalisées, envoyez-les automatiquement par email et gardez un historique complet de toutes vos transactions."
          benefits={[
            'Génération PDF automatique et professionnelle',
            'Envoi par email en un clic',
            'Numérotation automatique des factures',
            'Historique complet et recherche',
            'Calculs TVA automatiques',
            'Export et archivage'
          ]}
          plan="pro"
          ctaText="Débloquer les factures - 3,90€/mois"
          showPreview={true}
          previewOpacity={0.15}
        >
          {/* Exemple visuel de liste de factures */}
          <div className="p-6 space-y-4">
            <div className="flex gap-4 mb-6">
              <button className="px-6 py-3 rounded-lg font-medium" style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                ✨ Nouvelle facture
              </button>
              <button className="px-6 py-3 rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
                Filtrer
              </button>
            </div>
            
            {/* Exemple de factures */}
            <div className="space-y-3">
              {[
                { num: 'FACT-2025-001', client: 'Client ABC', montant: '1 250,00 €', date: '15 Jan 2025' },
                { num: 'FACT-2025-002', client: 'Entreprise XYZ', montant: '890,00 €', date: '18 Jan 2025' },
                { num: 'FACT-2025-003', client: 'SARL Dupont', montant: '2 450,00 €', date: '22 Jan 2025' },
                { num: 'FACT-2025-004', client: 'SAS Martin', montant: '1 750,00 €', date: '25 Jan 2025' },
              ].map((facture, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#23272f' }}>
                      <FileText className="w-6 h-6" style={{ color: '#00D084' }} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{facture.num}</div>
                      <div className="text-sm text-gray-400">{facture.client}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold" style={{ color: '#00D084' }}>{facture.montant}</div>
                      <div className="text-sm text-gray-400">{facture.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-800" style={{ backgroundColor: '#23272f' }}>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-800" style={{ backgroundColor: '#23272f' }}>
                        <Download className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-800" style={{ backgroundColor: '#23272f' }}>
                        <Mail className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FeaturePreview>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Aperçu', href: '/dashboard' },
        { label: 'Factures' },
      ]} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-white">Factures</h1>
        <Link
          href="/factures/nouvelle"
          className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
        >
          Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 mb-4">Aucune facture pour le moment.</p>
            <Link
              href="/factures/nouvelle"
              className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
            >
              Créer votre première facture
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#2d3441' }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Numéro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={index < invoices.length - 1 ? 'border-b' : ''}
                    style={{ borderColor: '#2d3441' }}
                  >
                    <td className="px-6 py-4 text-white font-mono">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-300">{invoice.customer_name}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {Number(invoice.total_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/factures/${invoice.id}`}
                          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(invoice.id)}
                          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Envoyer par e-mail"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

