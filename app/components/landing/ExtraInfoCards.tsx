"use client";

import { Percent, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { ScaleOnHover, fadeInVariant } from "@/app/components/anim/Motion";

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInVariant}>
      <ScaleOnHover>
        <motion.div 
          className="relative rounded-xl p-6 transition-all cursor-default"
          style={{ 
            backgroundColor: "#16181d",
            border: "1px solid #1f232b",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
            borderColor: "rgba(46,108,246,0.3)"
          }}
        >
          {/* Gradient top border */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
            style={{
              background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
            }}
          />
          
          <div className="mt-2 mb-4">
            <Icon 
              className="w-6 h-6"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            />
          </div>
          <h3 className="mb-2 text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{children}</p>
        </motion.div>
      </ScaleOnHover>
    </motion.div>
  );
}

export default function ExtraInfoCards() {
  return (
    <>
      <InfoCard icon={Percent} title="TVA et franchise en base">
        Franchise en base jusqu'à <strong className="text-gray-300">36 800 €</strong> (services) et{" "}
        <strong className="text-gray-300">91 900 €</strong> (ventes). Au-delà : TVA à facturer dès le mois
        de dépassement et l'année suivante. Comptalyze vous alerte à l'approche des seuils.
      </InfoCard>

      <InfoCard icon={Wallet} title="Impôt sur le revenu — Versement libératoire">
        Option possible sous conditions de revenus. Taux : <strong className="text-gray-300">1 %</strong> (ventes),{" "}
        <strong className="text-gray-300">1,7 %</strong> (services BIC), <strong className="text-gray-300">2,2 %</strong> (BNC) <em>en plus</em> des
        cotisations. Comptalyze compare automatiquement avec le régime classique.
      </InfoCard>
    </>
  );
}

