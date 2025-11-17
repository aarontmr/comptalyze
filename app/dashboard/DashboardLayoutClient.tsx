'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { Session, User } from '@supabase/supabase-js';
import { UserPreferencesProvider } from '@/app/contexts/UserPreferencesContext';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  BarChart3,
  User as UserIcon,
  Users,
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
  Building2,
  Upload,
  Settings,
  Target,
  Gift,
  HelpCircle,
  TrendingUp,
  Shield,
} from 'lucide-react';
import logo from '@/public/logo.png';
import dynamic from 'next/dynamic';
import QuickSettings from '@/app/components/QuickSettings';
import NotificationCenter from '@/app/components/NotificationCenter';

const OnboardingTutorial = dynamic(() => import('@/app/components/OnboardingTutorial'), {
  ssr: false,
});
const OnboardingChecklist = dynamic(() => import('@/app/components/OnboardingChecklist'), {
  ssr: false,
});

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPro?: boolean;
  requiresPremium?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

export default function DashboardLayoutClient({
  children,
  initialSession,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [showTutorial, setShowTutorial] = useState(() => {
    const metadata = initialSession?.user?.user_metadata || {};
    return metadata.onboarding_completed !== true;
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        return;
      }
      setSession(newSession);
      setUser(newSession.user);
      const metadata = newSession.user.user_metadata || {};
      setShowTutorial(metadata.onboarding_completed !== true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session || !user) {
    return null;
  }

  const subscription = getUserSubscription(user);

  // Fonction pour obtenir la couleur de section
  const getSectionColor = (title: string) => {
    const sectionColors: Record<string, { color: string }> = {
      'Principal': { color: '#00D084' },
      'Calculs & Simulations': { color: '#2E6CF6' },
      'Gestion': { color: '#8B5CF6' },
      'Avancé': { color: '#f59e0b' },
      'Autres': { color: '#9ca3af' },
    };
    return sectionColors[title] || { color: '#6b7280' };
  };

  // Organisation par sections
  const navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Aperçu', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Calcul URSSAF', href: '/dashboard/simulateur', icon: Calculator },
      ],
    },
    {
      title: 'Calculs & Simulations',
      items: [
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
      ],
    },
    {
      title: 'Gestion',
      items: [
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
          label: 'Import bancaire',
          href: '/dashboard/import-bancaire',
          icon: Upload,
          requiresPro: true,
        },
        {
          label: 'Mes entreprises',
          href: '/dashboard/businesses',
          icon: Building2,
          requiresPro: true,
        },
      ],
    },
    {
      title: 'Avancé',
      items: [
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
        {
          label: 'Projections',
          href: '/dashboard/projections',
          icon: TrendingUp,
          requiresPremium: true,
        },
        {
          label: 'Comparaisons',
          href: '/dashboard/comparaisons',
          icon: BarChart3,
          requiresPremium: true,
        },
        {
          label: 'Budgets',
          href: '/dashboard/budgets',
          icon: Target,
          requiresPremium: true,
        },
        {
          label: 'Règles automatiques',
          href: '/dashboard/automations',
          icon: Settings,
          requiresPro: true,
        },
        {
          label: 'Rapports automatisés',
          href: '/dashboard/rapports',
          icon: FileText,
          requiresPremium: true,
        },
        {
          label: 'Mode comptable',
          href: '/dashboard/comptable',
          icon: Users,
          requiresPremium: true,
        },
        {
          label: 'Export FEC',
          href: '/dashboard/export-fec',
          icon: Download,
          requiresPro: true,
        },
        {
          label: 'Optimisation fiscale',
          href: '/dashboard/optimisation-fiscale',
          icon: Sparkles,
          requiresPremium: true,
        },
      ],
    },
    {
      title: 'Autres',
      items: [
        { label: 'Parrainage', href: '/dashboard/referrals', icon: Gift },
        { label: 'Centre d\'aide', href: '/dashboard/help', icon: HelpCircle },
        { label: 'Sécurité', href: '/dashboard/securite', icon: Shield },
        { label: 'Mon compte', href: '/dashboard/compte', icon: UserIcon },
      ],
    },
  ];

  // Filtrer les items selon le plan
  const filteredNavSections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.requiresPremium && !subscription.isPremium) return false;
      if (item.requiresPro && !subscription.isPro && !subscription.isPremium)
        return false;
      return true;
    }),
  })).filter((section) => section.items.length > 0); // Ne garder que les sections avec des items

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpgrade = (plan: 'pro' | 'premium') => {
    router.push(`/checkout/${plan}`);
  };

  const getUpgradeInfo = () => {
    if (!subscription.isPro && !subscription.isPremium) {
      return {
        plan: 'pro' as const,
        label: 'Passer à Pro',
        price: '3,90 €/mois',
        originalPrice: '5,90 €',
        badge: '🚀 -34%',
      };
    }
    if (subscription.isPro && !subscription.isPremium) {
      return {
        plan: 'premium' as const,
        label: 'Passer à Premium',
        price: '7,90 €/mois',
        originalPrice: '9,90 €',
        badge: '🚀 -20%',
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <UserPreferencesProvider>
      <div
        className="min-h-screen flex relative"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        {/* Fond avec gradients subtils et effets de lumière */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {/* Fond de base avec gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0e0f12 0%, #0a0b0e 50%, #0e0f12 100%)',
            }}
          />
          
          {/* Gradients radiaux colorés subtils */}
          <div
            className="absolute -top-40 -left-40 h-[800px] w-[800px] rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(0, 208, 132, 0.4), transparent)' }}
          />
          <div
            className="absolute top-1/4 -right-40 h-[700px] w-[700px] rounded-full blur-3xl opacity-12"
            style={{ background: 'radial-gradient(circle, rgba(46, 108, 246, 0.4), transparent)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[600px] w-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)' }}
          />
          <div
            className="absolute top-1/2 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl opacity-8"
            style={{ background: 'radial-gradient(circle, rgba(0, 208, 132, 0.3), transparent)' }}
          />
          
          {/* Effet de lumière subtil supplémentaire */}
          <div
            className="absolute top-0 left-1/2 w-[600px] h-[400px] -translate-x-1/2 blur-3xl opacity-5"
            style={{
              background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.1), transparent)',
            }}
          />
        </div>
        <aside
          className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 z-40"
          style={{
            backgroundColor: '#111216',
            borderRight: '1px solid rgba(45, 52, 65, 0.5)',
            height: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto',
          }}
          data-tutorial="navigation"
        >
          <div className="flex flex-col h-full min-h-0">
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
              <div 
                className="mt-2 h-1 w-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                }}
              />
            </div>

            <div className="px-4 py-2 border-b border-gray-800 flex-shrink-0">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Accueil</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto min-h-0">
              {filteredNavSections.map((section, sectionIndex) => {
                const sectionColor = getSectionColor(section.title);
                return (
                <div key={sectionIndex} className="space-y-2">
                  <h3 
                    className="px-4 text-xs font-bold uppercase tracking-wider"
                    style={{ 
                      color: sectionColor.color,
                      textShadow: `0 0 10px ${sectionColor.color}50`,
                    }}
                  >
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          data-tutorial={item.href === '/dashboard/tva'
                            ? 'tva'
                            : item.href === '/dashboard/charges'
                              ? 'charges'
                              : item.href === '/dashboard/export'
                                ? 'export'
                                : item.href === '/dashboard/calendrier-fiscal'
                                  ? 'calendrier'
                                  : undefined}
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
                  </div>
                </div>
              )})}

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

              {upgradeInfo && (
                <div className="mt-4 px-4">
                  <button
                    onClick={() => handleUpgrade(upgradeInfo.plan)}
                    className="relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] overflow-visible cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: '0 4px 15px rgba(46,108,246,0.3)',
                    }}
                  >
                    <div className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ backgroundColor: '#fff', color: '#00D084' }}>
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

            <div className="px-4 py-2 border-t border-gray-800 flex-shrink-0">
              <QuickSettings />
            </div>

            <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
              <div className="mb-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#16181d' }}>
                <p className="text-xs text-gray-400 mb-1">Connecté en tant que</p>
                <p className="text-sm text-white font-medium truncate">{user?.email ?? 'Utilisateur'}</p>
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

        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            backgroundColor: '#111216',
            borderRight: '1px solid rgba(45, 52, 65, 0.5)',
            height: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div className="flex flex-col h-full min-h-0">
            <div className="flex flex-col border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between h-14 px-4">
                <Link href="/dashboard" className="flex items-center" onClick={() => setSidebarOpen(false)}>
                  <Image
                    src={logo}
                    alt="Comptalyze"
                    width={120}
                    height={30}
                    className="h-7 w-auto"
                    priority
                  />
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 flex-shrink-0"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div 
                className="h-1 w-full"
                style={{
                  background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                }}
              />
            </div>

            <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 min-h-[44px]"
              >
                <Home className="w-5 h-5 flex-shrink-0" style={{ strokeWidth: 2 }} />
                <span className="leading-normal">Accueil</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto min-h-0">
              {filteredNavSections.map((section, sectionIndex) => {
                const sectionColor = getSectionColor(section.title);
                return (
                <div key={sectionIndex} className="space-y-2">
                  <h3 
                    className="px-4 text-xs font-bold uppercase tracking-wider"
                    style={{ 
                      color: sectionColor.color,
                      textShadow: `0 0 10px ${sectionColor.color}50`,
                    }}
                  >
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          data-tutorial={item.href === '/dashboard/tva'
                            ? 'tva'
                            : item.href === '/dashboard/charges'
                              ? 'charges'
                              : item.href === '/dashboard/export'
                                ? 'export'
                                : item.href === '/dashboard/calendrier-fiscal'
                                  ? 'calendrier'
                                  : undefined}
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
                  </div>
                </div>
              )})}

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

              {upgradeInfo && (
                <div className="mt-4 px-4">
                  <button
                    onClick={() => {
                      handleUpgrade(upgradeInfo.plan);
                      setSidebarOpen(false);
                    }}
                    className="relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] overflow-visible cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: '0 4px 15px rgba(46,108,246,0.3)',
                    }}
                  >
                    <div className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ backgroundColor: '#fff', color: '#00D084' }}>
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

            <div className="px-4 py-2 border-t border-gray-800 flex-shrink-0">
              <QuickSettings />
            </div>

            <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
              {user && (
                <div className="mb-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#16181d' }}>
                  <p className="text-xs text-gray-400 mb-1">Connecté en tant que</p>
                  <p className="text-sm text-white font-medium truncate">{user.email}</p>
                </div>
              )}
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

        <div className="flex-1 flex flex-col lg:pl-64 relative z-10">
          <header className="lg:hidden sticky top-0 z-30 flex flex-col bg-[#111216] border-b border-gray-800">
            <div className="flex items-center justify-between h-14 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 active:scale-95 flex-shrink-0"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <Link href="/dashboard" className="flex items-center flex-1 justify-center">
                <Image
                  src={logo}
                  alt="Comptalyze"
                  width={120}
                  height={30}
                  className="h-7 w-auto"
                  priority
                />
              </Link>

              <div className="flex items-center gap-2 flex-shrink-0 w-9 justify-end">
                {user && <NotificationCenter user={user} />}
              </div>
            </div>
            <div 
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
              }}
            />
          </header>

          <div className="hidden lg:block">
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {children}
              </div>
            </main>
          </div>

          <div className="lg:hidden">
            <main className="flex-1 overflow-y-auto pb-20">
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                {children}
              </div>
            </main>
          </div>
        </div>

        {showTutorial && (
          <OnboardingTutorial
            user={user}
            onComplete={() => setShowTutorial(false)}
          />
        )}
        {user && <OnboardingChecklist user={user} />}
      </div>
    </UserPreferencesProvider>
  );
}

