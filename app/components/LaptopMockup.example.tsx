/**
 * Exemple d'utilisation du composant LaptopMockup
 * 
 * Utilisation dans une page :
 */

import LaptopMockup from './LaptopMockup';

export default function DashboardPreviewSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Découvrez votre dashboard
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Une interface intuitive pour gérer votre micro-entreprise
        </p>
        
        {/* Le mockup s'affiche ici */}
        <LaptopMockup 
          screenshotSrc="/mockups/dashboard-screenshot.png"
          alt="Dashboard Comptalyze - Vue d'ensemble"
        />
        
        <p className="text-sm text-gray-500 text-center mt-8">
          💡 Pour générer le screenshot : npm run screenshot:dashboard
        </p>
      </div>
    </section>
  );
}



