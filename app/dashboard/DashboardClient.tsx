'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UrssafCalculator from '@/app/components/UrssafCalculator';
import EmailReminderToggle from '@/app/components/EmailReminderToggle';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  if (!user) {
    return null;
  }

  const subscription = getUserSubscription(user);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Tableau de bord</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
          >
            Déconnexion
          </button>
        </header>

        {/* User Info */}
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <p className="text-gray-300">
            Bienvenue, <span className="text-white font-medium">{user.email}</span>
          </p>
        </div>

        {/* Email Reminder Toggle (Premium only) */}
        {subscription.isPremium && (
          <div className="mb-6">
            <EmailReminderToggle userId={user.id} isPremium={true} />
          </div>
        )}

        {/* Calculator (contient chatbot, graphique, pré-remplissage et historique) */}
        <UrssafCalculator user={user} />
      </div>
    </div>
  );
}

