"use client";

import { useState } from "react";
import { Search, HelpCircle, BookOpen, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const helpArticles = [
  {
    id: "getting-started",
    title: "Premiers pas avec Comptalyze",
    category: "Démarrage",
    content: "Découvrez comment utiliser Comptalyze pour gérer votre comptabilité de micro-entrepreneur.",
  },
  {
    id: "calcul-urssaf",
    title: "Comment calculer mes cotisations URSSAF",
    category: "Calculs",
    content: "Apprenez à utiliser le simulateur URSSAF pour calculer vos cotisations.",
  },
  {
    id: "factures",
    title: "Créer et gérer mes factures",
    category: "Factures",
    content: "Guide complet pour créer, modifier et envoyer vos factures.",
  },
  {
    id: "calendrier",
    title: "Utiliser le calendrier fiscal",
    category: "Calendrier",
    content: "Suivez toutes vos échéances fiscales et ajoutez vos propres événements.",
  },
  {
    id: "export",
    title: "Exporter mes données",
    category: "Export",
    content: "Exportez vos données comptables en différents formats.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(helpArticles.map((a) => a.category)));

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Centre d'aide" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Centre d'aide</h1>
        <p className="text-gray-400">Trouvez des réponses à vos questions</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#6b7280" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans l'aide..."
            className="w-full pl-12 pr-4 py-3 rounded-lg text-white"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? "text-white"
              : "text-gray-400 hover:text-white"
          }`}
          style={{
            backgroundColor: !selectedCategory ? "#00D08420" : "#0e0f12",
            border: `1px solid ${!selectedCategory ? "#00D084" : "#2d3441"}`,
          }}
        >
          Toutes les catégories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              backgroundColor: selectedCategory === category ? "#00D08420" : "#0e0f12",
              border: `1px solid ${selectedCategory === category ? "#00D084" : "#2d3441"}`,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Liste des articles */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div
            className="col-span-2 rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400">Aucun article trouvé</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="rounded-xl p-6 border cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "#14161b",
                borderColor: "#1f232b",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "#00D08420" }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: "#00D084" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#2d3441", color: "#9ca3af" }}>
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{article.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact support */}
      <div
        className="mt-8 rounded-2xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: "#2E6CF620" }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: "#2E6CF6" }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Besoin d'aide supplémentaire ?</h3>
            <p className="text-sm text-gray-400">
              Contactez notre équipe support pour une assistance personnalisée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





