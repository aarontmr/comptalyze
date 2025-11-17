'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import MobileShell from '@/components/ui/MobileShell';
import UrssafCalculator from '@/app/components/UrssafCalculator';
import Breadcrumbs from '@/app/components/Breadcrumbs';

export default function SimulateurPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    fetchUser();
  }, []);

  // Desktop version (hidden on mobile)
  const DesktopView = () => (
    <div>
      <Breadcrumbs items={[{ label: 'Aperçu', href: '/dashboard' }, { label: 'Calcul URSSAF' }]} />
      <h1 className="text-3xl font-semibold text-white mb-6">Calcul URSSAF</h1>
      <UrssafCalculator user={user} />
    </div>
  );

  // Mobile version
  const MobileView = () => (
    <MobileShell title="Calcul">
      <div className="pt-4">
        <UrssafCalculator user={user} />
      </div>
    </MobileShell>
  );

  return (
    <>
      <div className="hidden lg:block">
        <DesktopView />
      </div>
      <div className="lg:hidden">
        <MobileView />
      </div>
    </>
  );
}
