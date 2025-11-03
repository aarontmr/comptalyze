'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { generateInvoiceNumber } from '@/lib/invoiceUtils';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_eur: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    vat_rate: 0,
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price_eur: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price_eur: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price_eur, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = subtotal * (formData.vat_rate / 100);
    return subtotal + vat;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || items.some(item => !item.description)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const invoiceNumber = await generateInvoiceNumber(supabase, session.user.id);
      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: session.user.id,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email || null,
          customer_address: formData.customer_address || null,
          invoice_number: invoiceNumber,
          issue_date: formData.issue_date,
          due_date: formData.due_date || null,
          items: items,
          subtotal_eur: subtotal,
          vat_rate: formData.vat_rate,
          total_eur: total,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création de la facture');
        return;
      }

      router.push(`/factures/${data.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0e0f12' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-6">Nouvelle facture</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <h2 className="text-xl font-semibold text-white mb-4">Informations client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                <textarea
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <h2 className="text-xl font-semibold text-white mb-4">Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date d'émission <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date d'échéance</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
              </div>
            </div>
          </div>

          {/* Lignes de facture */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Lignes de facture</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
              >
                Ajouter une ligne
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="Prix unitaire (€)"
                      value={item.unit_price_eur}
                      onChange={(e) => updateItem(index, 'unit_price_eur', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                    />
                  </div>
                  <div className="col-span-1 text-right text-white font-semibold pt-2">
                    {(item.quantity * item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-red-900/20 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TVA et total */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Sous-total HT</span>
                <span className="text-white font-semibold">
                  {calculateSubtotal().toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-300">TVA:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.vat_rate}
                  onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-1 rounded-lg text-white text-sm"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                />
                <span className="text-gray-300">%</span>
                <span className="ml-auto text-white font-semibold">
                  {(calculateSubtotal() * (formData.vat_rate / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: '#2d3441' }}>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total TTC</span>
                  <span className="text-lg font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                    {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/factures')}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

