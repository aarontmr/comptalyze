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
        <h1 className="text-3xl font-semibold text-white mb-8">Factures</h1>
        <Card>
          <p className="text-gray-300 mb-4">
            Le module de factures est disponible avec le plan{' '}
            <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
              Pro
            </span>{' '}
            ou{' '}
            <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
              Premium
            </span>.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
          >
            Voir les plans
          </Link>
        </Card>
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

