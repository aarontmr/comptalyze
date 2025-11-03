'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_eur: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  issue_date: string;
  due_date: string | null;
  items: InvoiceItem[];
  subtotal_eur: number;
  vat_rate: number;
  total_eur: number;
  notes: string | null;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Erreur:', error);
          router.push('/factures');
          return;
        }

        setInvoice(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, router]);

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
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
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0e0f12' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-white">Facture non trouvée</p>
          <Link href="/factures" className="text-blue-400 hover:underline">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0e0f12' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-white">Facture {invoice.invoice_number}</h1>
          <Link
            href="/factures"
            className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
          >
            Retour
          </Link>
        </div>

        <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Émetteur</h3>
              <p className="text-white font-semibold">Comptalyze</p>
              <p className="text-gray-300 text-sm">Noraa</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Destinataire</h3>
              <p className="text-white font-semibold">{invoice.customer_name}</p>
              {invoice.customer_email && (
                <p className="text-gray-300 text-sm">{invoice.customer_email}</p>
              )}
              {invoice.customer_address && (
                <p className="text-gray-300 text-sm whitespace-pre-line">{invoice.customer_address}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b" style={{ borderColor: '#2d3441' }}>
            <div>
              <p className="text-sm text-gray-400 mb-1">Numéro de facture</p>
              <p className="text-white font-mono">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Date d'émission</p>
              <p className="text-white">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Date d'échéance</p>
                <p className="text-white">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lignes de facture</h3>
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#1a1d24' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Qté</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Prix unitaire</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className={index < invoice.items.length - 1 ? 'border-b' : ''} style={{ borderColor: '#2d3441' }}>
                      <td className="px-4 py-3 text-white">{item.description}</td>
                      <td className="px-4 py-3 text-center text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        {Number(item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="px-4 py-3 text-right text-white font-semibold">
                        {(item.quantity * item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Sous-total HT</span>
              <span className="text-white font-semibold">
                {Number(invoice.subtotal_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
            {invoice.vat_rate > 0 && (
              <div className="flex justify-between text-gray-300">
                <span>TVA ({invoice.vat_rate}%)</span>
                <span className="text-white font-semibold">
                  {(Number(invoice.subtotal_eur) * invoice.vat_rate / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
            )}
            <div className="pt-3 border-t flex justify-between" style={{ borderColor: '#2d3441' }}>
              <span className="text-lg font-semibold text-white">Total TTC</span>
              <span className="text-lg font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                {Number(invoice.total_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
              <p className="text-gray-300 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  const token = session?.access_token;
                  if (!token) {
                    alert('Vous devez être connecté');
                    return;
                  }
                  const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
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
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
            >
              Télécharger le PDF
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
            >
              {sendingEmail ? 'Envoi...' : 'Envoyer par e-mail'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

