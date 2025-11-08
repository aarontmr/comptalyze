/**
 * Badge affichant l'utilisation d'un quota (ex: 2/3 simulations)
 * Avec indicateur visuel de progression
 */

'use client';

interface LimitBadgeProps {
  current: number;
  max: number | null; // null = illimité
  label?: string;
  showUpgradeLink?: boolean;
  warningThreshold?: number; // Pourcentage pour afficher warning (ex: 80)
}

export default function LimitBadge({
  current,
  max,
  label = 'utilisé',
  showUpgradeLink = true,
  warningThreshold = 80,
}: LimitBadgeProps) {
  // Si illimité, ne rien afficher
  if (max === null) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Illimité
      </div>
    );
  }
  
  const percentage = (current / max) * 100;
  const isWarning = percentage >= warningThreshold;
  const isMaxed = current >= max;
  
  // Couleur selon le niveau
  const getColor = () => {
    if (isMaxed) return 'red';
    if (isWarning) return 'orange';
    return 'blue';
  };
  
  const color = getColor();
  
  const colorClasses = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };
  
  const progressColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
  };
  
  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClasses[color]} text-sm font-medium`}>
        {isMaxed && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        
        <span>
          <strong>{current}</strong>/{max} {label}
        </span>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${progressColors[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {/* Message et lien upgrade si limite atteinte */}
      {isMaxed && showUpgradeLink && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Vous avez atteint votre limite mensuelle. 
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Passer à Pro pour un accès illimité
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Version compacte pour afficher dans un header/menu
 */
export function CompactLimitBadge({ current, max }: { current: number; max: number | null }) {
  if (max === null) return null;
  
  const percentage = (current / max) * 100;
  const isMaxed = current >= max;
  
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        isMaxed
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      {current}/{max}
    </span>
  );
}

