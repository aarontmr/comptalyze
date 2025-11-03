'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserPlan } from '@/lib/plan';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  total_eur: number;
  created_at: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (plan !== 'premium' && plan !== 'pro') {
    return (
      <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0e0f12' }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-semibold text-white mb-6">Factures</h1>
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <p className="text-gray-300 mb-4">
              Le module de factures est disponible avec le plan <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>Pro</span> ou <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>Premium</span>.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
            >
              Voir les plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0e0f12' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-white">Factures</h1>
          <Link
            href="/factures/nouvelle"
            className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
          >
            Nouvelle facture
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 rounded-xl text-center" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <p className="text-gray-400 mb-4">Aucune facture pour le moment.</p>
            <Link
              href="/factures/nouvelle"
              className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
            >
              Créer votre première facture
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#23272f' }}>
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
                          className="px-3 py-1 rounded text-sm text-gray-300 hover:text-white transition-colors"
                          style={{ backgroundColor: '#23272f' }}
                        >
                          Voir
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const token = session?.access_token;
                              if (!token) {
                                alert('Vous devez être connecté');
                                return;
                              }
                              const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
                                headers: { 'Authorization': `Bearer ${token}` },
                              });
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `facture-${invoice.invoice_number}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } else {
                                const data = await response.json();
                                alert(data.error || 'Erreur lors du téléchargement');
                              }
                            } catch (error) {
                              alert('Erreur lors du téléchargement');
                            }
                          }}
                          className="px-3 py-1 rounded text-sm text-gray-300 hover:text-white transition-colors"
                          style={{ backgroundColor: '#23272f' }}
                        >
                          PDF
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const token = session?.access_token;
                              if (!token) {
                                alert('Vous devez être connecté');
                                return;
                              }
                              const response = await fetch(`/api/invoices/${invoice.id}/email`, {
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
                          }}
                          className="px-3 py-1 rounded text-sm text-gray-300 hover:text-white transition-colors"
                          style={{ backgroundColor: '#23272f' }}
                        >
                          Envoyer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

