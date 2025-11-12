import { Session } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabaseServer';
import { createServiceClient } from '@/lib/supabaseService';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let verifiedSession: Session | null = session;

  if (session) {
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('email_verified')
      .eq('id', session.user.id)
      .single();

    const emailVerified =
      !!session.user.email_confirmed_at || !!profile?.email_verified;

    if (!emailVerified) {
      verifiedSession = null;
    }
  }

  if (!verifiedSession) {
    return (
      <DashboardLayoutClient initialSession={null as unknown as Session}>
        {children}
      </DashboardLayoutClient>
    );
  }

  return (
    <DashboardLayoutClient initialSession={verifiedSession}>
      {children}
    </DashboardLayoutClient>
  );
}

