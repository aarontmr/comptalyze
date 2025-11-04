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
} from 'lucide-react';
import logo from '@/public/logo.png';
import FloatingAIAssistant from '@/app/components/FloatingAIAssistant';
import MobileShell from '@/components/ui/MobileShell';

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

  const handleUpgrade = async (plan: "pro" | "premium") => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Une erreur est survenue lors de la création de la session de paiement";
        alert(`Erreur: ${errorMessage}`);
        console.error("Erreur API checkout:", data);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: Aucune URL de redirection reçue du serveur.");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      alert("Une erreur est survenue lors de la connexion au serveur.");
    }
  };

  // Déterminer le plan supérieur et le texte
  const getUpgradeInfo = () => {
    if (!subscription.isPro && !subscription.isPremium) {
      return {
        plan: "pro" as const,
        label: "Passer à Pro",
        price: "5,90 €/mois",
      };
    }
    if (subscription.isPro && !subscription.isPremium) {
      return {
        plan: "premium" as const,
        label: "Passer à Premium",
        price: "9,90 €/mois",
      };
    }
    return null; // Déjà Premium, pas besoin d'upgrade
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#0e0f12', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
        style={{ backgroundColor: '#111216', borderRight: '1px solid rgba(45, 52, 65, 0.5)' }}
        data-tutorial="navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-800">
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
          </div>

          {/* Lien vers l'accueil */}
          <div className="px-4 py-2 border-b border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

            {/* Bouton Upgrade */}
            {upgradeInfo && (
              <div className="mt-4 px-4">
                <button
                  onClick={() => handleUpgrade(upgradeInfo.plan)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{upgradeInfo.label}</div>
                    <div className="text-xs opacity-90">{upgradeInfo.price}</div>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* User info & Sign out */}
          <div className="px-4 py-4 border-t border-gray-800">
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#111216', borderRight: '1px solid rgba(45, 52, 65, 0.5)' }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
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
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile - Lien vers l'accueil */}
          <div className="px-4 py-2 border-b border-gray-800">
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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

            {/* Mobile - Bouton Upgrade */}
            {upgradeInfo && (
              <div className="mt-4 px-4">
                <button
                  onClick={() => {
                    handleUpgrade(upgradeInfo.plan);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{upgradeInfo.label}</div>
                    <div className="text-xs opacity-90">{upgradeInfo.price}</div>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile user info & Sign out */}
          <div className="px-4 py-4 border-t border-gray-800">
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
        {/* Desktop layout - keep existing */}
        <div className="hidden lg:block">
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile layout - use MobileShell */}
        <div className="lg:hidden">
          {children}
        </div>
      </div>

      {/* Assistant IA flottant */}
      <FloatingAIAssistant user={user} />
    </div>
  );
}

