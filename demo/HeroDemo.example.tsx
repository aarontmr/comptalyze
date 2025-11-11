/**
 * Composant HeroDemo pour Comptalyze
 * 
 * Intégration de la démo animée avec :
 * - Skeleton loader
 * - Gestion d'erreur avec fallback GIF
 * - Badge overlay
 * - Optimisé pour performance
 * 
 * Usage :
 *   import HeroDemo from '@/components/HeroDemo';
 *   
 *   <HeroDemo />
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface HeroDemoProps {
  /**
   * Afficher le badge "Démo interactive"
   * @default true
   */
  showBadge?: boolean;
  
  /**
   * Classe CSS personnalisée pour le container
   */
  className?: string;
  
  /**
   * Démarrer la lecture uniquement quand visible (Intersection Observer)
   * @default false
   */
  lazyPlay?: boolean;
}

export default function HeroDemo({ 
  showBadge = true, 
  className = '',
  lazyPlay = false 
}: HeroDemoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer pour lazy play
  useEffect(() => {
    if (!lazyPlay || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Autoplay bloqué, ce n'est pas grave
          });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, [lazyPlay]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Skeleton loader pendant le chargement */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Vidéo principale */}
      {!hasError ? (
        <video
          ref={videoRef}
          className="w-full relative z-10"
          autoPlay={!lazyPlay}
          muted
          loop
          playsInline
          poster="/hero-demo-poster.jpg"
          onLoadedData={() => setIsLoaded(true)}
          onError={() => {
            console.warn('Erreur de chargement vidéo, fallback vers GIF');
            setHasError(true);
          }}
          aria-label="Démo de Comptalyze : calculez vos cotisations en un clic"
        >
          <source src="/hero-demo.mp4" type="video/mp4" />
          <p className="p-4 text-center text-gray-600">
            Votre navigateur ne supporte pas la vidéo.{' '}
            <a href="/hero-demo.gif" className="text-[#0b5cff] underline">
              Voir la démo en GIF
            </a>
          </p>
        </video>
      ) : (
        /* Fallback GIF en cas d'erreur */
        <img
          src="/hero-demo.gif"
          alt="Démo Comptalyze : calculez vos cotisations en un clic"
          className="w-full"
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Badge "Démo interactive" */}
      {showBadge && isLoaded && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-[#0b5cff] shadow-lg transition-opacity duration-300 z-20">
          ▶️ Démo interactive
        </div>
      )}
    </div>
  );
}

/**
 * Variante avec contrôles personnalisés
 */
export function HeroDemoWithControls() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
      <video
        ref={videoRef}
        className="w-full"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Démo de Comptalyze"
      >
        <source src="/hero-demo.mp4" type="video/mp4" />
      </video>

      {/* Contrôle play/pause au hover */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label={isPlaying ? 'Mettre en pause' : 'Lire'}
      >
        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#0b5cff] text-2xl">
          {isPlaying ? '⏸' : '▶️'}
        </div>
      </button>
    </div>
  );
}

/**
 * Variante mobile-friendly (image statique sur mobile)
 */
export function HeroDemoResponsive() {
  return (
    <>
      {/* Vidéo sur desktop */}
      <video
        className="hidden md:block w-full rounded-2xl shadow-2xl"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Démo de Comptalyze"
      >
        <source src="/hero-demo.mp4" type="video/mp4" />
      </video>

      {/* Image statique sur mobile (économie de données) */}
      <img
        src="/hero-demo-poster.jpg"
        alt="Aperçu de Comptalyze"
        className="md:hidden w-full rounded-2xl shadow-2xl"
        loading="lazy"
      />
    </>
  );
}

/**
 * Variante avec bordure gradient
 */
export function HeroDemoGradient() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="p-1 bg-gradient-to-br from-[#0b5cff] to-purple-600 rounded-2xl">
      <div className="relative rounded-xl overflow-hidden bg-white">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse" />
        )}
        
        <video
          className="w-full relative z-10"
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          aria-label="Démo de Comptalyze"
        >
          <source src="/hero-demo.mp4" type="video/mp4" />
        </video>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-[#0b5cff] shadow-lg z-20">
          ✨ Nouveau
        </div>
      </div>
    </div>
  );
}

/**
 * Hook personnalisé pour gérer la vidéo
 */
export function useVideoDemo(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setHasError(true);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [videoRef]);

  return { isLoaded, isPlaying, hasError };
}

/**
 * Exemple d'intégration dans une page Hero
 */
export function HeroSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Colonne texte */}
          <div>
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Gérez votre micro-entreprise{' '}
              <span className="text-[#0b5cff]">en toute simplicité</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Calculez vos cotisations, suivez votre CA et pré-remplissez 
              l'URSSAF en un clic. Simple, rapide, conforme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#0b5cff] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#0a4fd9] transition shadow-lg hover:shadow-xl">
                Commencer gratuitement
              </button>
              
              <button className="border-2 border-[#0b5cff] text-[#0b5cff] px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition">
                Voir la démo
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold">4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span className="font-semibold">+2 000 micro-entrepreneurs</span>
              </div>
            </div>
          </div>

          {/* Colonne démo */}
          <div>
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}














