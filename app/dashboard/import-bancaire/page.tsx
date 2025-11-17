"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

export default function ImportBancairePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  const parseCSV = (csvText: string): BankTransaction[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    const transactions: BankTransaction[] = [];

    // En-têtes attendus : Date, Description, Montant
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < 3) continue;

      const dateIndex = headers.findIndex((h) => h.includes("date"));
      const descIndex = headers.findIndex((h) => h.includes("description") || h.includes("libellé"));
      const amountIndex = headers.findIndex((h) => h.includes("montant") || h.includes("amount"));

      if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) continue;

      const dateStr = values[dateIndex];
      const description = values[descIndex];
      const amountStr = values[amountIndex].replace(/[^\d.,-]/g, "").replace(",", ".");

      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;

      // Parser la date (formats courants)
      let date = new Date();
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateStr);
      }

      transactions.push({
        date: date.toISOString().split("T")[0],
        description,
        amount: Math.abs(amount),
        type: amount >= 0 ? "income" : "expense",
      });
    }

    return transactions;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setImported(false);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setTransactions(parsed);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Erreur lors de l'import du fichier");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user || transactions.length === 0) return;

    setLoading(true);

    try {
      const transactionsToInsert = transactions.map((t) => ({
        user_id: user.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        import_source: "csv",
      }));

      const { error } = await supabase
        .from("bank_transactions")
        .insert(transactionsToInsert);

      if (error) throw error;

      setImported(true);
      setTransactions([]);
      setTimeout(() => setImported(false), 3000);
    } catch (error) {
      console.error("Error importing transactions:", error);
      alert("Erreur lors de l'import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Import bancaire" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Import bancaire</h1>
        <p className="text-gray-400">
          Importez vos relevés bancaires (CSV) pour un rapprochement automatique
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Section import */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Importer un fichier</h2>

          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-gray-600"
            style={{ borderColor: "#2d3441" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-2">Cliquez pour sélectionner un fichier CSV</p>
            <p className="text-xs text-gray-500">
              Format attendu : Date, Description, Montant
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {transactions.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  {transactions.length} transaction(s) détectée(s)
                </p>
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                  style={{
                    background: loading
                      ? "#6b7280"
                      : "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  {loading ? "Import..." : "Importer"}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {transactions.slice(0, 10).map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg text-sm"
                    style={{ backgroundColor: "#0e0f12" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{t.description}</span>
                      <span
                        className={`font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {t.amount.toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.date}</p>
                  </div>
                ))}
                {transactions.length > 10 && (
                  <p className="text-xs text-gray-500 text-center">
                    ... et {transactions.length - 10} autre(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {imported && (
            <div className="mt-4 p-4 rounded-lg flex items-center gap-2" style={{ backgroundColor: "#00D08420" }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: "#00D084" }} />
              <span className="text-sm" style={{ color: "#00D084" }}>
                Import réussi !
              </span>
            </div>
          )}
        </div>

        {/* Section aide */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Comment importer ?</h2>

          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-medium mb-2">Format CSV requis</h3>
              <p className="mb-2">Votre fichier doit contenir les colonnes suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Date (format : JJ/MM/AAAA)</li>
                <li>Description / Libellé</li>
                <li>Montant (positif pour revenus, négatif pour dépenses)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Exemple</h3>
              <div className="p-3 rounded-lg font-mono text-xs" style={{ backgroundColor: "#0e0f12" }}>
                <div>Date,Description,Montant</div>
                <div>01/01/2025,Vente produit,150.00</div>
                <div>02/01/2025,Achat matériel,-50.00</div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Rapprochement automatique</h3>
              <p>
                Les transactions importées seront automatiquement rapprochées avec vos enregistrements de CA et charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

