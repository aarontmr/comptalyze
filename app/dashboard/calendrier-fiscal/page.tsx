"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell, Check, Clock, AlertTriangle, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface FiscalEvent {
  id: string;
  title: string;
  date: string;
  type: "urssaf" | "impot" | "cfe" | "autre" | "custom";
  status: "upcoming" | "due_soon" | "overdue" | "completed";
  description: string;
  isCustom?: boolean;
}

interface CustomFiscalEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;
  description: string;
  created_at: string;
}

export default function CalendrierFiscalPage() {
  const [year] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [user, setUser] = useState<User | null>(null);
  const [customEvents, setCustomEvents] = useState<CustomFiscalEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Formulaire pour ajouter un événement
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    description: ""
  });

  // Charger l'utilisateur et les événements personnalisés
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadCustomEvents(session.user.id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les événements personnalisés depuis Supabase
  const loadCustomEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("custom_fiscal_events")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (error) {
        // Si la table n'existe pas encore, c'est normal (première utilisation)
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.log("Table custom_fiscal_events n'existe pas encore. Création de la table nécessaire.");
          setCustomEvents([]);
          return;
        }
        // Pour les autres erreurs, on les log mais on continue
        console.error("Erreur lors du chargement des événements personnalisés:", error.message || error);
        setCustomEvents([]);
        return;
      }
      setCustomEvents(data || []);
    } catch (error: any) {
      // Gestion d'erreur générique
      const errorMessage = error?.message || error?.code || 'Erreur inconnue';
      // Ne log que si ce n'est pas une erreur de table manquante
      if (!errorMessage.includes('does not exist') && !errorMessage.includes('relation') && !errorMessage.includes('table')) {
        console.error("Erreur lors du chargement des événements personnalisés:", errorMessage);
      }
      setCustomEvents([]);
    }
  };

  // Ajouter un événement personnalisé
  const handleAddEvent = async () => {
    if (!user || !newEvent.title || !newEvent.date) return;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("custom_fiscal_events")
        .insert({
          user_id: user.id,
          title: newEvent.title,
          date: newEvent.date,
          description: newEvent.description || ""
        })
        .select()
        .single();

      if (error) throw error;

      setCustomEvents([...customEvents, data]);
      setNewEvent({ title: "", date: "", description: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
      alert("Erreur lors de l'ajout de l'événement");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un événement personnalisé
  const handleDeleteEvent = async (eventId: string) => {
    if (!user || !confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

    try {
      setDeleting(eventId);
      const { error } = await supabase
        .from("custom_fiscal_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      setCustomEvents(customEvents.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'événement");
    } finally {
      setDeleting(null);
    }
  };

  // Génération des événements fiscaux pour l'année
  const generateFiscalEvents = (): FiscalEvent[] => {
    const events: FiscalEvent[] = [];
    const currentDate = new Date();

    // Déclarations URSSAF mensuelles (échéance dernier jour du mois)
    for (let m = 0; m < 12; m++) {
      const lastDay = new Date(year, m + 1, 0);
      const eventDate = new Date(year, m, lastDay.getDate());
      
      let status: FiscalEvent["status"] = "upcoming";
      const daysUntil = Math.floor((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        status = "overdue";
      } else if (daysUntil <= 7) {
        status = "due_soon";
      } else if (daysUntil <= 30) {
        status = "upcoming";
      }

      events.push({
        id: `urssaf-${m}`,
        title: `Déclaration URSSAF ${getMonthName(m)}`,
        date: eventDate.toISOString().split("T")[0],
        type: "urssaf",
        status,
        description: `Déclarez votre CA et payez vos cotisations pour ${getMonthName(m)} ${year}`,
      });
    }

    // Déclaration de revenus (mai)
    events.push({
      id: "impot-revenus",
      title: "Déclaration de revenus",
      date: `${year}-05-31`,
      type: "impot",
      status: month === 4 ? "due_soon" : month > 4 ? "completed" : "upcoming",
      description: "Déclarez vos revenus de l'année précédente",
    });

    // CFE (Cotisation Foncière des Entreprises) - Décembre
    events.push({
      id: "cfe",
      title: "Paiement CFE",
      date: `${year}-12-15`,
      type: "cfe",
      status: month === 11 ? "due_soon" : month > 11 ? "completed" : "upcoming",
      description: "Paiement de la Cotisation Foncière des Entreprises",
    });

    // Ajouter les événements personnalisés
    customEvents.forEach(customEvent => {
      const eventDate = new Date(customEvent.date);
      const daysUntil = Math.floor((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: FiscalEvent["status"] = "upcoming";
      if (daysUntil < 0) {
        status = "overdue";
      } else if (daysUntil <= 7) {
        status = "due_soon";
      }

      events.push({
        id: `custom-${customEvent.id}`,
        title: customEvent.title,
        date: customEvent.date,
        type: "custom",
        status,
        description: customEvent.description,
        isCustom: true,
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMonthName = (monthIndex: number) => {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return months[monthIndex];
  };

  const events = generateFiscalEvents();
  const currentMonthEvents = events.filter(e => new Date(e.date).getMonth() === month);
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "due_soon").slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#00D084";
      case "upcoming": return "#2E6CF6";
      case "due_soon": return "#f59e0b";
      case "overdue": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Terminé";
      case "upcoming": return "À venir";
      case "due_soon": return "Bientôt";
      case "overdue": return "En retard";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" style={{ color: "#00D084" }} />
              Calendrier fiscal {year}
            </h1>
            <p className="text-gray-400">
              Toutes vos échéances fiscales et URSSAF en un coup d'œil
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Ajouter un événement
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendrier */}
          <div className="lg:col-span-2">
            {/* Sélecteur de mois */}
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setMonth(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    month === i ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    month === i
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#14161b", border: "1px solid #2d3441" }
                  }
                >
                  {getMonthName(i)}
                </button>
              ))}
            </div>

            {/* Événements du mois */}
            <div className="space-y-3">
              {currentMonthEvents.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{
                    backgroundColor: "#14161b",
                    border: "1px solid #1f232b",
                  }}
                >
                  <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
                  <p className="text-gray-400">Aucune échéance ce mois-ci</p>
                </div>
              ) : (
                currentMonthEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl p-4 relative group"
                    style={{
                      backgroundColor: "#14161b",
                      border: `1px solid ${getStatusColor(event.status)}40`,
                      borderLeft: `4px solid ${getStatusColor(event.status)}`,
                    }}
                  >
                    {event.isCustom && (
                      <button
                        onClick={() => handleDeleteEvent(event.id.replace("custom-", ""))}
                        disabled={deleting === event.id.replace("custom-", "")}
                        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        style={{ color: "#ef4444" }}
                        title="Supprimer cet événement"
                      >
                        {deleting === event.id.replace("custom-", "") ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{event.title}</h3>
                          {event.isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2E6CF620", color: "#2E6CF6" }}>
                              Personnalisé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{event.description}</p>
                      </div>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(event.status)}20`,
                          color: getStatusColor(event.status),
                        }}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Prochaines échéances */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: "#00D084" }} />
                Prochaines échéances
              </h2>

              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "#0e0f12" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{event.title.split(' ')[1] || event.title}</span>
                      <span className="text-xs" style={{ color: getStatusColor(event.status) }}>
                        {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.floor((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">Légende</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#00D084" }} />
                  <span className="text-gray-300">Terminé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2E6CF6" }} />
                  <span className="text-gray-300">À venir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                  <span className="text-gray-300">Bientôt (- de 7j)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-gray-300">En retard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter un événement */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Ajouter un événement</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
                style={{ color: "#9ca3af" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Paiement TVA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white resize-none"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title || !newEvent.date || saving}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: saving
                      ? "#6b7280"
                      : "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  {saving ? "Ajout..." : "Ajouter"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewEvent({ title: "", date: "", description: "" });
                  }}
                  className="px-4 py-2 rounded-lg text-gray-300 font-medium transition-colors hover:bg-gray-800"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
