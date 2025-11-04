"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Receipt, TrendingDown, AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Charge {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

const CATEGORIES = [
  "Matériel informatique",
  "Logiciels et abonnements",
  "Formations",
  "Déplacements",
  "Bureau et fournitures",
  "Téléphone et internet",
  "Marketing et publicité",
  "Assurances",
  "Frais bancaires",
  "Autre",
];

export default function ChargesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadCharges(session.user.id);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const loadCharges = async (userId: string) => {
    const { data, error } = await supabase
      .from("charges_deductibles")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) {
      setCharges(data);
    }
  };

  const handleAddCharge = async () => {
    if (!user || !description || !amount) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase.from("charges_deductibles").insert({
      user_id: user.id,
      description,
      amount,
      category,
      date,
    });

    if (!error) {
      loadCharges(user.id);
      setDescription("");
      setAmount(0);
      setShowForm(false);
    } else {
      alert("Erreur lors de l'ajout de la charge");
    }
  };

  const handleDeleteCharge = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("charges_deductibles")
      .delete()
      .eq("id", id);

    if (!error) {
      loadCharges(user.id);
    }
  };

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#2E6CF6 transparent transparent transparent" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12', fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Receipt className="w-8 h-8" style={{ color: "#00D084" }} />
              Charges déductibles
            </h1>
            <p className="text-gray-400">
              Suivez vos frais professionnels pour optimiser votre fiscalité
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
            }}
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Annuler" : "Ajouter une charge"}
          </button>
        </div>

        {/* Total */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(46,108,246,0.08) 100%)",
            border: "1px solid rgba(46,108,246,0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total des charges</div>
              <div className="text-3xl font-bold" style={{ color: "#00D084" }}>
                {totalCharges.toFixed(2)} €
              </div>
            </div>
            <TrendingDown className="w-12 h-12" style={{ color: "#00D084", opacity: 0.3 }} />
          </div>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Nouvelle charge</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Ordinateur portable MacBook Pro"
                  className="w-full px-4 py-3 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant (€)</label>
                  <input
                    type="number"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg text-white"
                    style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-white"
                    style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddCharge}
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                }}
              >
                Ajouter la charge
              </button>
            </div>
          </div>
        )}

        {/* Liste des charges */}
        <div className="space-y-3">
          {charges.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
              <p className="text-gray-400">Aucune charge enregistrée</p>
              <p className="text-sm text-gray-500 mt-2">
                Commencez par ajouter vos frais professionnels
              </p>
            </div>
          ) : (
            charges.map((charge) => (
              <div
                key={charge.id}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-medium">{charge.description}</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: "#2E6CF6", color: "white" }}
                    >
                      {charge.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(charge.date).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-white">
                    {charge.amount.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => handleDeleteCharge(charge.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div
          className="mt-6 rounded-xl p-4"
          style={{
            backgroundColor: "rgba(46, 108, 246, 0.1)",
            border: "1px solid rgba(46, 108, 246, 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#2E6CF6" }} />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-2">Note importante</p>
              <p>
                En micro-entreprise, les charges ne sont pas déductibles du chiffre d'affaires.
                Ce module vous aide à suivre vos dépenses professionnelles pour votre comptabilité personnelle
                et pour une éventuelle évolution vers un autre statut.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

