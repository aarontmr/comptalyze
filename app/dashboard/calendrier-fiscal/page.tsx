"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell, Check, Clock, AlertTriangle } from "lucide-react";

interface FiscalEvent {
  id: string;
  title: string;
  date: string;
  type: "urssaf" | "impot" | "cfe" | "autre";
  status: "upcoming" | "due_soon" | "overdue" | "completed";
  description: string;
}

export default function CalendrierFiscalPage() {
  const [year] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

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

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8" style={{ color: "#00D084" }} />
            Calendrier fiscal {year}
          </h1>
          <p className="text-gray-400">
            Toutes vos échéances fiscales et URSSAF en un coup d'œil
          </p>
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
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: "#14161b",
                      border: `1px solid ${getStatusColor(event.status)}40`,
                      borderLeft: `4px solid ${getStatusColor(event.status)}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{event.title}</h3>
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
                      <span className="text-sm font-medium text-white">{event.title.split(' ')[1]}</span>
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
    </div>
  );
}

