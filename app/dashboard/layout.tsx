'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  BarChart3,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Home,
  Sparkles,
  Receipt,
  Download,
  Calendar as CalendarIcon,
  Percent,
  CreditCard,
} from 'lucide-react';
import logo from '@/public/logo.png';
import dynamic from 'next/dynamic';

// Dynamic imports pour les composants lourds
const FloatingAIAssistant = dynamic(() => import('@/app/components/FloatingAIAssistant'), {
  ssr: false,
});
const OnboardingTutorial = dynamic(() => import('@/app/components/OnboardingTutorial'), {
  ssr: false,
});

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPro?: boolean;
  requiresPremium?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          router.push('/login');
          return;
        }

        setUser(session.user);
      } catch (err) {
        console.error('Erreur lors de la vérification de la session:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0e0f12' }}
      >
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  const subscription = getUserSubscription(user);

  const navItems: NavItem[] = [
    { label: 'Aperçu', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Calcul URSSAF', href: '/dashboard/simulateur', icon: Calculator },
    {
      label: 'Simulateur TVA',
      href: '/dashboard/tva',
      icon: Percent,
      requiresPro: true,
    },
    {
      label: 'Charges',
      href: '/dashboard/charges',
      icon: Receipt,
      requiresPro: true,
    },
    {
      label: 'Factures',
      href: '/dashboard/factures',
      icon: FileText,
      requiresPro: true,
    },
    {
      label: 'Export comptable',
      href: '/dashboard/export',
      icon: Download,
      requiresPro: true,
    },
    {
      label: 'Calendrier fiscal',
      href: '/dashboard/calendrier-fiscal',
      icon: CalendarIcon,
      requiresPremium: true,
    },
    {
      label: 'Statistiques',
      href: '/dashboard/statistiques',
      icon: BarChart3,
      requiresPremium: true,
    },
    { label: 'Mon compte', href: '/dashboard/compte', icon: UserIcon },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresPremium && !subscription.isPremium) return false;
    if (item.requiresPro && !subscription.isPro && !subscription.isPremium)
      return false;
    return true;
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpgrade = (plan: "pro" | "premium") => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Rediriger vers la page de checkout intégrée
    router.push(`/checkout/${plan}`);
  };

  // Déterminer le plan supérieur et le texte - OFFRE DE LANCEMENT 🚀
  const getUpgradeInfo = () => {
    if (!subscription.isPro && !subscription.isPremium) {
      return {
        plan: "pro" as const,
        label: "Passer à Pro",
        price: "3,90 €/mois",
        originalPrice: "5,90 €",
        badge: "🚀 -34%",
      };
    }
    if (subscription.isPro && !subscription.isPremium) {
      return {
        plan: "premium" as const,
        label: "Passer à Premium",
        price: "7,90 €/mois",
        originalPrice: "9,90 €",
        badge: "🚀 -20%",
      };
    }
    return null; // Déjà Premium, pas besoin d'upgrade
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <>
      {/* ComptaBot flottant - EN DEHORS du layout pour éviter les conflits */}
      <FloatingAIAssistant user={user} />
      
      <div
        className="min-h-screen flex"
        style={{ backgroundColor: '#0e0f12', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 z-40"
        style={{ 
          backgroundColor: '#111216', 
          borderRight: '1px solid rgba(45, 52, 65, 0.5)',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto'
        }}
        data-tutorial="navigation"
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center h-20 px-6 border-b border-gray-800 flex-shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src={logo}
                alt="Comptalyze"
                width={180}
                height={45}
                className="h-11 w-auto"
                priority
              />
            </Link>
            {/* Badge Essai Gratuit */}
            {subscription.isTrial && subscription.trialEndsAt && (() => {
              const trialEnd = new Date(subscription.trialEndsAt);
              const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  className="mt-2 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                  style={{
                    background: daysLeft <= 1 
                      ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                      : subscription.isPremium
                      ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                      : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                    color: 'white',
                  }}
                >
                  Essai : {daysLeft}j restant{daysLeft > 1 ? 's' : ''}
                </div>
              );
            })()}
          </div>

          {/* Lien vers l'accueil */}
          <div className="px-4 py-2 border-b border-gray-800 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(0, 208, 132, 0.15) 0%, rgba(46, 108, 246, 0.15) 100%)',
                          border: '1px solid rgba(0, 208, 132, 0.3)',
                        }
                      : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Tarifs - Section spéciale (masqué pour Premium) */}
            {!subscription.isPremium && (
              <div className="mt-6 px-4">
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.08) 0%, rgba(46, 108, 246, 0.08) 100%)',
                    border: '1px solid rgba(0, 208, 132, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 208, 132, 0.15)',
                  }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: '#00D084' }} />
                  <span>Tarifs & Plans</span>
                </Link>
              </div>
            )}

            {/* Bouton Upgrade */}
            {upgradeInfo && (
              <div className="mt-4 px-4">
                <button
                  onClick={() => handleUpgrade(upgradeInfo.plan)}
                  className="relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] overflow-visible cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                  }}
                >
                  {/* Badge Offre de lancement */}
                  <div className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ backgroundColor: "#fff", color: "#00D084" }}>
                    {upgradeInfo.badge}
                  </div>
                  
                  <Sparkles className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{upgradeInfo.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-xs opacity-90">{upgradeInfo.price}</div>
                      <div className="text-[10px] opacity-60 line-through">{upgradeInfo.originalPrice}</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* User info & Sign out */}
          <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
            <div className="mb-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#16181d' }}>
              <p className="text-xs text-gray-400 mb-1">Connecté en tant que</p>
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />
        </div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: '#111216', 
          borderRight: '1px solid rgba(45, 52, 65, 0.5)',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex flex-col">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src={logo}
                  alt="Comptalyze"
                  width={160}
                  height={40}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
              {/* Badge Essai Gratuit Mobile */}
              {subscription.isTrial && subscription.trialEndsAt && (() => {
                const trialEnd = new Date(subscription.trialEndsAt);
                const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: daysLeft <= 1 
                        ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                        : subscription.isPremium
                        ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                        : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                      color: 'white',
                    }}
                  >
                    Essai : {daysLeft}j
                  </div>
                );
              })()}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile - Lien vers l'accueil */}
          <div className="px-4 py-2 border-b border-gray-800 flex-shrink-0">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </Link>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(0, 208, 132, 0.15) 0%, rgba(46, 108, 246, 0.15) 100%)',
                          border: '1px solid rgba(0, 208, 132, 0.3)',
                        }
                      : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Tarifs - Section spéciale mobile (masqué pour Premium) */}
            {!subscription.isPremium && (
              <div className="mt-6 px-4">
                <Link
                  href="/pricing"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.08) 0%, rgba(46, 108, 246, 0.08) 100%)',
                    border: '1px solid rgba(0, 208, 132, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 208, 132, 0.15)',
                  }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: '#00D084' }} />
                  <span>Tarifs & Plans</span>
                </Link>
              </div>
            )}

            {/* Mobile - Bouton Upgrade */}
            {upgradeInfo && (
              <div className="mt-4 px-4">
                <button
                  onClick={() => {
                    handleUpgrade(upgradeInfo.plan);
                    setSidebarOpen(false);
                  }}
                  className="relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] overflow-visible cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                  }}
                >
                  {/* Badge Offre de lancement */}
                  <div className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ backgroundColor: "#fff", color: "#00D084" }}>
                    {upgradeInfo.badge}
                  </div>
                  
                  <Sparkles className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{upgradeInfo.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-xs opacity-90">{upgradeInfo.price}</div>
                      <div className="text-[10px] opacity-60 line-through">{upgradeInfo.originalPrice}</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile user info & Sign out */}
          <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
            <div className="mb-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#16181d' }}>
              <p className="text-xs text-gray-400 mb-1">Connecté en tant que</p>
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile Header avec burger */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#111216] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image
              src={logo}
              alt="Comptalyze"
              width={140}
              height={35}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Badge Essai Mobile Header */}
          {subscription.isTrial && subscription.trialEndsAt && (() => {
            const trialEnd = new Date(subscription.trialEndsAt);
            const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div
                className="px-2 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: daysLeft <= 1 
                    ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                    : subscription.isPremium
                    ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                    : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                  color: 'white',
                }}
              >
                {daysLeft}j
              </div>
            );
          })() || <div className="w-10" />}
        </header>

        {/* Desktop layout */}
        <div className="hidden lg:block">
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile layout avec padding optimisé */}
        <div className="lg:hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Tutoriel d'onboarding */}
      {showTutorial && (
        <OnboardingTutorial 
          user={user} 
          onComplete={() => setShowTutorial(false)} 
        />
      )}
    </div>
    </>
  );
}

